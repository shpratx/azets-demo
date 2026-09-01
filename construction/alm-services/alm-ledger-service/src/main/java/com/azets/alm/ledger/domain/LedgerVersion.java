package com.azets.alm.ledger.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/** F0.3.3. One row per published version; exactly one is current per tenant. */
@Entity
@Table(name = "ledger_version")
public class LedgerVersion {

    @Id
    @Column(name = "version", length = 20, nullable = false)
    private String version;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "created_by", length = 200, nullable = false)
    private String createdBy;

    @Column(name = "account_count", nullable = false)
    private int accountCount;

    @Column(name = "is_current", nullable = false)
    private boolean current;

    @Column(name = "note", length = 500)
    private String note;

    protected LedgerVersion() {
    }

    public LedgerVersion(String version, UUID tenantId, String createdBy, int accountCount, String note) {
        this.version = version;
        this.tenantId = tenantId;
        this.createdBy = createdBy;
        this.accountCount = accountCount;
        this.note = note;
        this.createdAt = Instant.now();
        this.current = false;
    }

    public void makeCurrent() {
        this.current = true;
    }

    public void supersede() {
        this.current = false;
    }

    public void setAccountCount(int accountCount) {
        this.accountCount = accountCount;
    }

    public String getVersion() {
        return version;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public int getAccountCount() {
        return accountCount;
    }

    public boolean isCurrent() {
        return current;
    }

    public String getNote() {
        return note;
    }
}
