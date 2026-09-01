-- ALM Ledger DB. LLD 1.6 and F0.3.3.
-- Enumerations are enforced by CHECK constraints rather than native enum types, so the closed
-- set of LLD 1.2 is visible in the schema and portable across engines (AP-10.2).

CREATE TABLE ledger_version (
    version        VARCHAR(20)  NOT NULL,
    tenant_id      UUID         NOT NULL,
    created_at     TIMESTAMP    NOT NULL,
    created_by     VARCHAR(200) NOT NULL,
    account_count  INT          NOT NULL DEFAULT 0,
    is_current     BOOLEAN      NOT NULL DEFAULT FALSE,
    note           VARCHAR(500),
    CONSTRAINT pk_ledger_version PRIMARY KEY (version)
);

-- Exactly one current version per tenant.
CREATE UNIQUE INDEX ux_ledger_version_current
    ON ledger_version (tenant_id) WHERE is_current;

CREATE TABLE master_ledger_account (
    code           VARCHAR(50)  NOT NULL,
    ledger_version VARCHAR(20)  NOT NULL,
    name           VARCHAR(300) NOT NULL,
    classification VARCHAR(200),
    type           VARCHAR(50)  NOT NULL,
    parent_code    VARCHAR(50),
    status         VARCHAR(20)  NOT NULL DEFAULT 'Active',
    tenant_id      UUID         NOT NULL,
    last_modified  TIMESTAMP    NOT NULL,
    CONSTRAINT pk_master_ledger_account PRIMARY KEY (code, ledger_version),
    CONSTRAINT ck_mla_type   CHECK (type   IN ('Asset','Liability','Equity','Revenue','Expense','Memo')),
    CONSTRAINT ck_mla_status CHECK (status IN ('Active','Inactive'))
);

CREATE INDEX ix_mla_version_status ON master_ledger_account (tenant_id, ledger_version, status);
CREATE INDEX ix_mla_type           ON master_ledger_account (tenant_id, ledger_version, type);
CREATE INDEX ix_mla_name           ON master_ledger_account (tenant_id, lower(name));
