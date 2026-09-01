-- ALM Rules DB. LLD 1.7.

CREATE TABLE mapping_rule (
    id               VARCHAR(20)  NOT NULL,
    tenant_id        UUID         NOT NULL,
    priority         INT          NOT NULL,
    name             VARCHAR(200) NOT NULL,
    condition_expr   TEXT         NOT NULL,
    action           TEXT         NOT NULL,
    confidence_boost NUMERIC(5,2) NOT NULL DEFAULT 0,
    status           VARCHAR(20)  NOT NULL DEFAULT 'Draft',
    used_count       BIGINT       NOT NULL DEFAULT 0,
    version          INT          NOT NULL DEFAULT 1,
    created_by       VARCHAR(200) NOT NULL,
    created_at       TIMESTAMP    NOT NULL,
    CONSTRAINT pk_mapping_rule PRIMARY KEY (id),
    CONSTRAINT ck_rule_status CHECK (status IN ('Active','Draft','Deprecated'))
);

-- Priority is unique per tenant among rules that still evaluate, because ordering is
-- semantically significant: first match wins (LLD 3.2).
CREATE UNIQUE INDEX ux_rule_priority_live
    ON mapping_rule (tenant_id, priority) WHERE status <> 'Deprecated';

CREATE INDEX ix_rule_tenant_status ON mapping_rule (tenant_id, status, priority);
