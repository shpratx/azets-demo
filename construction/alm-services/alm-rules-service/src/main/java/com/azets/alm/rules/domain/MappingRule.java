package com.azets.alm.rules.domain;

import com.azets.alm.common.enums.RuleStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/** LLD 1.7. Lower priority evaluates first, and the first match wins. */
@Entity
@Table(name = "mapping_rule")
public class MappingRule {

    @Id
    @Column(name = "id", length = 20, nullable = false)
    private String id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "priority", nullable = false)
    private int priority;

    @Column(name = "name", length = 200, nullable = false)
    private String name;

    @Column(name = "condition_expr", nullable = false, columnDefinition = "text")
    private String condition;

    @Column(name = "action", nullable = false, columnDefinition = "text")
    private String action;

    @Column(name = "confidence_boost", nullable = false)
    private double confidenceBoost;

    @Column(name = "status", length = 20, nullable = false)
    private RuleStatus status = RuleStatus.DRAFT;

    @Column(name = "used_count", nullable = false)
    private long usedCount;

    @Column(name = "version", nullable = false)
    private int version = 1;

    @Column(name = "created_by", length = 200, nullable = false)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected MappingRule() {
    }

    public MappingRule(String id, UUID tenantId, int priority, String name, String condition,
                       String action, double confidenceBoost, String createdBy) {
        this.id = id;
        this.tenantId = tenantId;
        this.priority = priority;
        this.name = name;
        this.condition = condition;
        this.action = action;
        this.confidenceBoost = confidenceBoost;
        this.createdBy = createdBy;
        this.status = RuleStatus.DRAFT;
        this.createdAt = Instant.now();
    }

    public void update(int priority, String name, String condition, String action, double confidenceBoost) {
        this.priority = priority;
        this.name = name;
        this.condition = condition;
        this.action = action;
        this.confidenceBoost = confidenceBoost;
        this.version++;
    }

    public void activate() {
        this.status = RuleStatus.ACTIVE;
        this.version++;
    }

    /** Deprecation stops evaluation but retains history; rules are never hard-deleted (UF-11). */
    public void deprecate() {
        this.status = RuleStatus.DEPRECATED;
        this.version++;
    }

    public void recordUse(long increment) {
        this.usedCount += increment;
    }

    public String getId() {
        return id;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public int getPriority() {
        return priority;
    }

    public String getName() {
        return name;
    }

    public String getCondition() {
        return condition;
    }

    public String getAction() {
        return action;
    }

    public double getConfidenceBoost() {
        return confidenceBoost;
    }

    public RuleStatus getStatus() {
        return status;
    }

    public long getUsedCount() {
        return usedCount;
    }

    public int getVersion() {
        return version;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
