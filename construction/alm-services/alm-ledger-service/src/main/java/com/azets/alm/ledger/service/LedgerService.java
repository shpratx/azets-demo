package com.azets.alm.ledger.service;

import com.azets.alm.common.enums.AccountType;
import com.azets.alm.common.error.Exceptions;
import com.azets.alm.common.event.AlmEvent;
import com.azets.alm.common.event.AlmTopics;
import com.azets.alm.common.event.EventPublisher;
import com.azets.alm.common.security.AlmPrincipal;
import com.azets.alm.ledger.domain.LedgerVersion;
import com.azets.alm.ledger.domain.MasterLedgerAccount;
import com.azets.alm.ledger.repository.LedgerVersionRepository;
import com.azets.alm.ledger.repository.MasterLedgerAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Master ledger management. Two invariants hold everywhere in this service:
 * accounts are deactivated and never hard-deleted, and every mutation publishes a new ledger
 * version rather than editing a published one in place (UF-11, F0.3.3). Together these are what
 * make a session's pinned ledgerVersion a stable thing to map against.
 */
@Service
public class LedgerService {

    private static final Logger log = LoggerFactory.getLogger(LedgerService.class);
    private static final DateTimeFormatter VERSION_FORMAT = DateTimeFormatter.ofPattern("yyyy.MM.dd");

    private final MasterLedgerAccountRepository accounts;
    private final LedgerVersionRepository versions;
    private final EventPublisher events;

    public LedgerService(MasterLedgerAccountRepository accounts,
                         LedgerVersionRepository versions,
                         EventPublisher events) {
        this.accounts = accounts;
        this.versions = versions;
        this.events = events;
    }

    @Transactional(readOnly = true)
    public LedgerVersion currentVersion(UUID tenantId) {
        return versions.findByTenantIdAndCurrentTrue(tenantId)
                .orElseThrow(() -> new Exceptions.NotFound("Ledger version", "current"));
    }

    @Transactional(readOnly = true)
    public List<LedgerVersion> listVersions(UUID tenantId) {
        return versions.findByTenantIdOrderByCreatedAtDesc(tenantId);
    }

    @Transactional(readOnly = true)
    public Page<MasterLedgerAccount> search(UUID tenantId, String ledgerVersion, String q,
                                            AccountType type, String classification,
                                            boolean activeOnly, Pageable pageable) {
        String version = resolveVersion(tenantId, ledgerVersion);
        return accounts.search(tenantId, version, blankToNull(q), type,
                blankToNull(classification), activeOnly, pageable);
    }

    /**
     * The bulk read behind the mapping engine's masterIndex. Returns active accounts only, which
     * is what makes "an inactive master code is never suggested by any strategy" true by
     * construction rather than by a check at every call site (TS-MAP-11).
     */
    @Transactional(readOnly = true)
    public List<MasterLedgerAccount> activeIndex(UUID tenantId, String ledgerVersion) {
        versions.findByVersionAndTenantId(ledgerVersion, tenantId)
                .orElseThrow(() -> new Exceptions.NotFound("Ledger version", ledgerVersion));
        return accounts.findActiveIndex(ledgerVersion, tenantId);
    }

    @Transactional(readOnly = true)
    public MasterLedgerAccount get(UUID tenantId, String code, String ledgerVersion) {
        String version = resolveVersion(tenantId, ledgerVersion);
        return accounts.findByCodeAndLedgerVersionAndTenantId(code, version, tenantId)
                .orElseThrow(() -> new Exceptions.NotFound("Master ledger account", code));
    }

    @Transactional
    public MasterLedgerAccount create(AlmPrincipal actor, String code, String name, String classification,
                                      AccountType type, String parentCode) {
        String newVersion = forkCurrentVersion(actor, "Created account " + code);
        if (accounts.findByCodeAndLedgerVersionAndTenantId(code, newVersion, actor.tenantId()).isPresent()) {
            throw new Exceptions.Conflict("Account code '" + code + "' already exists in version " + newVersion);
        }
        MasterLedgerAccount created = accounts.save(new MasterLedgerAccount(
                code, newVersion, name, classification, type, parentCode, actor.tenantId()));
        recount(actor.tenantId(), newVersion);
        publishChange(actor, newVersion, "account.created", code);
        return created;
    }

    @Transactional
    public MasterLedgerAccount update(AlmPrincipal actor, String code, String name, String classification,
                                      AccountType type, String parentCode) {
        String newVersion = forkCurrentVersion(actor, "Updated account " + code);
        MasterLedgerAccount account = accounts
                .findByCodeAndLedgerVersionAndTenantId(code, newVersion, actor.tenantId())
                .orElseThrow(() -> new Exceptions.NotFound("Master ledger account", code));
        account.update(name, classification, type, parentCode);
        publishChange(actor, newVersion, "account.updated", code);
        return account;
    }

    /**
     * Deactivation, never deletion. The caller is told which in-flight sessions pin a version
     * containing this code, so the impact is visible before confirming (UF-11). Sessions already
     * pinned to an older version are unaffected, which is the point of pinning.
     */
    @Transactional
    public MasterLedgerAccount deactivate(AlmPrincipal actor, String code) {
        String newVersion = forkCurrentVersion(actor, "Deactivated account " + code);
        MasterLedgerAccount account = accounts
                .findByCodeAndLedgerVersionAndTenantId(code, newVersion, actor.tenantId())
                .orElseThrow(() -> new Exceptions.NotFound("Master ledger account", code));
        account.deactivate();
        publishChange(actor, newVersion, "account.deactivated", code);
        return account;
    }

    @Transactional
    public LedgerVersion importLedger(AlmPrincipal actor, List<MasterLedgerAccount> imported, String label) {
        String version = label == null || label.isBlank() ? nextVersionLabel(actor.tenantId()) : label;
        versions.findByTenantIdAndCurrentTrue(actor.tenantId()).ifPresent(LedgerVersion::supersede);
        LedgerVersion created = new LedgerVersion(version, actor.tenantId(), actor.asActor(),
                imported.size(), "Imported ledger");
        created.makeCurrent();
        versions.save(created);
        accounts.saveAll(imported);
        publishChange(actor, version, "ledger.imported", version);
        log.info("ledger_imported version={} accounts={} tenant={}",
                version, imported.size(), actor.tenantId());
        return created;
    }

    /**
     * Copies the current version's accounts into a new version and makes it current. Every
     * administrative mutation goes through here, so a published version is immutable once
     * superseded - and a session pinned to it keeps mapping against exactly what it started with.
     */
    private String forkCurrentVersion(AlmPrincipal actor, String note) {
        LedgerVersion current = currentVersion(actor.tenantId());
        String newVersion = nextVersionLabel(actor.tenantId());
        List<MasterLedgerAccount> copies = accounts
                .findByLedgerVersionAndTenantId(current.getVersion(), actor.tenantId())
                .stream()
                .map(a -> a.copyInto(newVersion))
                .toList();
        accounts.saveAll(copies);
        current.supersede();
        LedgerVersion next = new LedgerVersion(newVersion, actor.tenantId(), actor.asActor(),
                copies.size(), note);
        next.makeCurrent();
        versions.save(next);
        return newVersion;
    }

    private void recount(UUID tenantId, String version) {
        versions.findByVersionAndTenantId(version, tenantId).ifPresent(v ->
                v.setAccountCount(accounts.findByLedgerVersionAndTenantId(version, tenantId).size()));
    }

    private String nextVersionLabel(UUID tenantId) {
        String base = "v" + LocalDate.now().format(VERSION_FORMAT);
        int suffix = 1;
        String candidate = base;
        while (versions.findByVersionAndTenantId(candidate, tenantId).isPresent()) {
            candidate = base + "." + (++suffix);
        }
        return candidate;
    }

    private String resolveVersion(UUID tenantId, String requested) {
        if (requested == null || requested.isBlank()) {
            return currentVersion(tenantId).getVersion();
        }
        return versions.findByVersionAndTenantId(requested, tenantId)
                .map(LedgerVersion::getVersion)
                .orElseThrow(() -> new Exceptions.NotFound("Ledger version", requested));
    }

    private void publishChange(AlmPrincipal actor, String version, String action, String subject) {
        events.publish(AlmEvent.of(AlmTopics.LEDGER_CHANGED, subject, actor.tenantId(), actor.asActor(),
                Map.of("action", action, "ledgerVersion", version)));
    }

    private static String blankToNull(String s) {
        return Optional.ofNullable(s).filter(v -> !v.isBlank()).orElse(null);
    }
}
