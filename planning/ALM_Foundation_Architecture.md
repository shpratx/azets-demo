# Foundation Architecture
## Automated Ledger Mapping Tool
### Phase 2B Foundation Architecture (Beat 2)

**Status:** Foundation Architecture Baseline v1.0
**Methodology:** BOM Foundation → MVP → Incremental Delivery

## 1. Architecture Objective

The purpose of the Foundation Architecture is to establish the reusable architectural baseline that all future feature HLDs will extend via the HLD Delta Rule (AP-8.3). No feature implementation should occur outside this baseline.

### Architecture Goals
- Automated ledger mapping
- Human-in-the-loop approval
- AI-assisted recommendations
- Direct Cozone synchronization
- Complete auditability
- Enterprise security
- High scalability

## 2. C4 Level 0 – System Context

```text
Azets Finance Team
        |
        v
Automated Ledger Mapping Platform
   |            |            |
Legacy Files   Enterprise IdP   Cozone
```

## 3. C4 Level 1 – Container Architecture

```text
Web UI
  |
API Gateway
  |
+-------------------------------+
| Intake | Mapping | Review     |
| Audit  | Integration | AI     |
+-------------------------------+
  |
Event Bus
  |
Mapping DB | Audit DB | AI Store
```

## 4. Domain Architecture

### Intake Domain
Responsibilities:
- Uploads
- Validation
- Normalization

### Mapping Domain
Responsibilities:
- Rule execution
- AI recommendations
- Mapping decisions

### Review Domain
Responsibilities:
- Ambiguous mappings
- Manual overrides
- Approval workflow

### Audit Domain
Responsibilities:
- Immutable audit history
- Compliance reporting

### Integration Domain
Responsibilities:
- Cozone synchronization
- Retry management

### AI Domain
Responsibilities:
- Training
- Scoring
- Recommendation generation

## 5. Data Architecture

### Mapping Database
- MappingSession
- LegacyAccount
- MappingDecision
- ReviewRecords

### Audit Database
- AuditEvents
- Reports
- Timelines

### AI Feature Store
- HistoricalMappings
- TrainingData
- ModelMetrics

## 6. Event Architecture

```text
legacy.uploaded
 -> legacy.validated
 -> mapping.generated
 -> review.created
 -> override.approved
 -> mapping.completed
 -> sync.completed
 -> report.generated
```

## 7. Security Architecture

### Authentication
- Enterprise OIDC Provider
- JWT Tokens

### Authorization
- FinanceManager
- Accountant
- Auditor
- Administrator

### Encryption
- TLS 1.3 in transit
- AES-256 at rest

## 8. Observability

Every service emits:
- Metrics
- Structured Logs
- Distributed Traces

## 9. Platform Blueprint

- Kubernetes
- Managed Database
- Message Bus
- Object Storage
- Monitoring Stack
- Secrets Vault

## 10. ADR Log

### ADR-001
DDD-aligned domain services.

### ADR-002
Event-driven integration.

### ADR-003
Separate Audit Domain.

### ADR-004
Enterprise Identity Provider.

### ADR-005
Cozone Adapter Pattern.

## 11. Foundation Deliverables

### Platform
- CI/CD
- Kubernetes
- Observability
- Secrets Management

### Security
- OIDC
- RBAC
- Audit Framework

### Data
- Mapping Database
- Audit Database
- Event Bus

### Architecture
- Approved C4 diagrams
- ADRs
- Dependency Graph
