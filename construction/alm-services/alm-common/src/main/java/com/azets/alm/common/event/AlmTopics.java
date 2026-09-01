package com.azets.alm.common.event;

/**
 * The event catalogue of Foundation Architecture 6, extended by the HLD deltas. Every state
 * transition propagates as a bus event (AP-2.4); services integrate asynchronously.
 */
public final class AlmTopics {

    private AlmTopics() {
    }

    public static final String LEGACY_UPLOADED = "legacy.uploaded";
    public static final String LEGACY_VALIDATED = "legacy.validated";
    public static final String LEGACY_VALIDATION_FAILED = "legacy.validation.failed";
    public static final String MAPPING_GENERATED = "mapping.generated";
    public static final String MAPPING_FAILED = "mapping.failed";
    public static final String MAPPING_ACCEPTED = "mapping.accepted";
    public static final String REVIEW_CREATED = "review.created";
    public static final String OVERRIDE_PROPOSED = "override.proposed";
    public static final String OVERRIDE_APPROVED = "override.approved";
    public static final String OVERRIDE_REJECTED = "override.rejected";
    public static final String MAPPING_COMPLETED = "mapping.completed";
    public static final String SYNC_COMPLETED = "sync.completed";
    public static final String SYNC_FAILED = "sync.failed";
    public static final String REPORT_GENERATED = "report.generated";
    public static final String RULE_MATCHED = "rule.matched";
    public static final String LEDGER_CHANGED = "ledger.changed";
    public static final String ACCESS_EVENT = "access.event";
    public static final String CONFIG_CHANGED = "config.changed";
}
