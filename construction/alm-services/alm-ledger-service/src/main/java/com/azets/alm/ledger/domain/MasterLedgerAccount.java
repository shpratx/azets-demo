package com.azets.alm.ledger.domain;

import com.azets.alm.common.enums.AccountType;
import com.azets.alm.common.enums.LedgerAccountStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * LLD 1.6. The primary key is (code, ledgerVersion): the same code exists in every version it
 * survives into, which is what lets a session pin a version and keep mapping against it while
 * an administrator edits the current one (HLD risk R-4).
 */
@Entity
@Table(name = "master_ledger_account")
@IdClass(MasterLedgerAccountId.class)
public class MasterLedgerAccount {

    @Id
    @Column(name = "code", length = 50, nullable = false)
    private String code;

    @Id
    @Column(name = "ledger_version", length = 20, nullable = false)
    private String ledgerVersion;

    @Column(name = "name", length = 300, nullable = false)
    private String name;

    @Column(name = "classification", length = 200)
    private String classification;

    @Column(name = "type", length = 50, nullable = false)
    private AccountType type;

    @Column(name = "parent_code", length = 50)
    private String parentCode;

    @Column(name = "status", length = 20, nullable = false)
    private LedgerAccountStatus status = LedgerAccountStatus.ACTIVE;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "last_modified", nullable = false)
    private Instant lastModified = Instant.now();

    protected MasterLedgerAccount() {
    }

    public MasterLedgerAccount(String code, String ledgerVersion, String name, String classification,
                               AccountType type, String parentCode, UUID tenantId) {
        this.code = code;
        this.ledgerVersion = ledgerVersion;
        this.name = name;
        this.classification = classification;
        this.type = type;
        this.parentCode = parentCode;
        this.tenantId = tenantId;
        this.status = LedgerAccountStatus.ACTIVE;
        this.lastModified = Instant.now();
    }

    /** Copy into a new version. Editing the ledger never mutates a published version in place. */
    public MasterLedgerAccount copyInto(String newVersion) {
        MasterLedgerAccount copy = new MasterLedgerAccount(
                code, newVersion, name, classification, type, parentCode, tenantId);
        copy.status = this.status;
        return copy;
    }

    public boolean isActive() {
        return status == LedgerAccountStatus.ACTIVE;
    }

    public void deactivate() {
        this.status = LedgerAccountStatus.INACTIVE;
        this.lastModified = Instant.now();
    }

    public void update(String name, String classification, AccountType type, String parentCode) {
        this.name = name;
        this.classification = classification;
        this.type = type;
        this.parentCode = parentCode;
        this.lastModified = Instant.now();
    }

    public String getCode() {
        return code;
    }

    public String getLedgerVersion() {
        return ledgerVersion;
    }

    public String getName() {
        return name;
    }

    public String getClassification() {
        return classification;
    }

    public AccountType getType() {
        return type;
    }

    public String getParentCode() {
        return parentCode;
    }

    public LedgerAccountStatus getStatus() {
        return status;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public Instant getLastModified() {
        return lastModified;
    }
}
