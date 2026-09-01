package com.azets.alm.intake.domain;

import com.azets.alm.common.enums.SessionStatus;
import com.azets.alm.common.error.Exceptions;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

/**
 * LLD 1.1. The aggregate root of a mapping run.
 *
 * <p>ledgerVersion is pinned here at creation and never changed. That single field resolves HLD
 * risk R-4: an administrator may edit the master ledger while a session is in flight, and the
 * session keeps mapping against exactly the ledger it started with.
 */
@Entity
@Table(name = "mapping_session")
public class MappingSession {

    @Id
    @Column(name = "id", length = 20, nullable = false)
    private String id;

    @Column(name = "firm_name", length = 200, nullable = false)
    private String firmName;

    @Column(name = "uploaded_at", nullable = false)
    private Instant uploadedAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "total_accounts", nullable = false)
    private int totalAccounts;

    @Column(name = "auto_mapped", nullable = false)
    private int autoMapped;

    /** Derived, but persisted so that a regenerated report shows the same figure (LLD 1.1). */
    @Column(name = "auto_mapped_pct", nullable = false)
    private BigDecimal autoMappedPct = BigDecimal.ZERO;

    @Column(name = "pending_review", nullable = false)
    private int pendingReview;

    @Column(name = "errors", nullable = false)
    private int errors;

    @Column(name = "status", length = 20, nullable = false)
    private SessionStatus status = SessionStatus.UPLOADING;

    @Column(name = "finance_manager", length = 200, nullable = false)
    private String financeManager;

    @Column(name = "ledger_version", length = 20, nullable = false)
    private String ledgerVersion;

    @Column(name = "source_format", length = 10)
    private String sourceFormat;

    @Column(name = "object_key", length = 500)
    private String objectKey;

    @Column(name = "quality_score")
    private BigDecimal qualityScore;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "correlation_id", nullable = false)
    private UUID correlationId;

    protected MappingSession() {
    }

    public MappingSession(String id, String firmName, String financeManager, String ledgerVersion,
                          String sourceFormat, String objectKey, UUID tenantId, UUID correlationId) {
        this.id = id;
        this.firmName = firmName;
        this.financeManager = financeManager;
        this.ledgerVersion = ledgerVersion;
        this.sourceFormat = sourceFormat;
        this.objectKey = objectKey;
        this.tenantId = tenantId;
        this.correlationId = correlationId;
        this.status = SessionStatus.UPLOADING;
        this.uploadedAt = Instant.now();
    }

    /**
     * The only way status changes. An illegal transition is a 409, never a silent correction -
     * a state machine that quietly repairs itself hides the bug that caused the bad transition.
     */
    public void transitionTo(SessionStatus target) {
        if (status == target) {
            return;
        }
        if (!status.canTransitionTo(target)) {
            throw Exceptions.Conflict.illegalTransition(id, status, target);
        }
        this.status = target;
        if (target == SessionStatus.SYNCED || target == SessionStatus.FAILED) {
            this.completedAt = Instant.now();
        }
    }

    public void recordCounts(int totalAccounts, int autoMapped, int pendingReview, int errors) {
        this.totalAccounts = totalAccounts;
        this.autoMapped = autoMapped;
        this.pendingReview = pendingReview;
        this.errors = errors;
        this.autoMappedPct = totalAccounts == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(autoMapped * 100.0 / totalAccounts).setScale(2, RoundingMode.HALF_UP);
    }

    public void recordTotals(int totalAccounts, BigDecimal qualityScore) {
        this.totalAccounts = totalAccounts;
        this.qualityScore = qualityScore;
    }

    /** Display string; an em dash while still running, matching the UI contract. */
    public String durationDisplay() {
        if (completedAt == null) {
            return "—";
        }
        Duration d = Duration.between(uploadedAt, completedAt);
        long minutes = d.toMinutes();
        return minutes < 1 ? d.toSeconds() + "s" : minutes + "m " + (d.toSecondsPart()) + "s";
    }

    public String getId() {
        return id;
    }

    public String getFirmName() {
        return firmName;
    }

    public Instant getUploadedAt() {
        return uploadedAt;
    }

    public int getTotalAccounts() {
        return totalAccounts;
    }

    public int getAutoMapped() {
        return autoMapped;
    }

    public BigDecimal getAutoMappedPct() {
        return autoMappedPct;
    }

    public int getPendingReview() {
        return pendingReview;
    }

    public int getErrors() {
        return errors;
    }

    public SessionStatus getStatus() {
        return status;
    }

    public String getFinanceManager() {
        return financeManager;
    }

    public String getLedgerVersion() {
        return ledgerVersion;
    }

    public String getSourceFormat() {
        return sourceFormat;
    }

    public String getObjectKey() {
        return objectKey;
    }

    public BigDecimal getQualityScore() {
        return qualityScore;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public UUID getCorrelationId() {
        return correlationId;
    }
}
