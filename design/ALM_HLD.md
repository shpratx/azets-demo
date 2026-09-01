# High-Level Design — Automated Ledger Mapping (ALM) Tool

| Field | Value |
|---|---|
| **Artifact** | HLD (WF 3 · A7 `L1-design-lld` — HLD output) |
| **Product** | Automated Ledger Mapping Tool |
| **Scope** | W1 MVP epics F1.1–F1.8, on the W0 Foundation (F0.1–F0.5) |
| **Extends** | `planning/ALM_Foundation_Architecture.md` (Foundation Architecture Baseline v1.0) |
| **Delta rule** | Per **AP-8.3**, this HLD states only what it *adds to or changes in* the Foundation baseline. Baseline decisions (C4 L0/L1 skeleton, ADR-001…005, platform blueprint) are inherited, not restated. |
| **Status** | Draft v1.0 |
| **Upstream inputs** | `planning/epics.json`, `planning/dependency-graph.json`, PRD user stories US1–US6, `planning/Automated_Ledger_Mapping_Impact_Assessment.md` |
| **Downstream consumers** | `design/ALM_LLD.md`, `testing/ALM_Test_Scenarios.md`, API specification |

---

## 1. Purpose and delta statement

The Foundation Architecture establishes six domains (Intake, Mapping, Review, Audit, Integration, AI) behind an API gateway and event bus. This HLD adds the **feature-level container and interaction design** for the MVP: the concrete responsibilities of each domain service, the synchronous and asynchronous contracts between them, the mapping state machine, and the human-in-the-loop decision gates.

### 1.1 What this HLD adds to the baseline

| # | Delta | Baseline reference |
|---|---|---|
| D-1 | Mapping session state machine with eight states and explicit legal transitions | §6 Event Architecture named the events but not the state machine |
| D-2 | Three-strategy mapping resolution pipeline (rule → AI semantic → similarity) with confidence arbitration | §4 Mapping Domain listed responsibilities only |
| D-3 | Ambiguity threshold policy and Review Domain queue model | §4 Review Domain listed responsibilities only |
| D-4 | Cozone adapter contract, idempotency and retry semantics | ADR-005 named the pattern only |
| D-5 | Audit event taxonomy and immutability guarantee | §5 Audit Database listed entities only |
| D-6 | Notification fan-out (F1.8), absent from the baseline | New |
| D-7 | Batch orchestration for multi-firm processing (F2.2) | New, W2 |

### 1.2 Explicit non-goals

- No descent below C4 container level — that is the LLD's job (**AP-1.6**).
- No physical technology selection beyond the Foundation platform blueprint (**AP-0.1**).
- W3 epics (F3.1–F3.4) are out of scope for this HLD revision.

---

## 2. Requirement traceability

| PRD story | Epic | HLD section | Primary domain |
|---|---|---|---|
| US1 — Upload a legacy account structure | F1.1, F1.2 | §5.1, §5.2 | Intake |
| US2 — Receive AI-generated mapping suggestions | F1.3 | §5.3, §6 | Mapping + AI |
| US3 — Manually override AI suggestions | F1.5 | §5.4, §7 | Review |
| US4 — Flag ambiguous account codes for review | F1.4 | §5.4, §6.4 | Review |
| US5 — Download an audit-ready mapping report | F1.7 | §5.6 | Audit |
| US6 — Synchronise approved mappings to Cozone | F1.6 | §5.5, §8 | Integration |

---

## 3. C4 Level 1 delta — container view (MVP)

```text
                        ┌──────────────────────────┐
                        │  Web UI (React SPA)      │  16 screens
                        │  construction/alm-app    │
                        └───────────┬──────────────┘
                                    │ HTTPS / JWT bearer
                        ┌───────────▼──────────────┐
                        │  API Gateway             │  authN/Z, schema validation,
                        │  (AP-2.6)                │  rate limiting — no business logic
                        └───┬───────┬───────┬──────┘
             ┌──────────────┘       │       └──────────────┐
             │                      │                      │
    ┌────────▼────────┐   ┌─────────▼────────┐   ┌─────────▼────────┐
    │ Intake Service  │   │ Mapping Service  │   │ Review Service   │
    │ F1.1 F1.2       │   │ F1.3 F0.4        │   │ F1.4 F1.5        │
    └────────┬────────┘   └────┬────────┬────┘   └────────┬─────────┘
             │                 │        │                 │
             │        ┌────────▼───┐  ┌─▼──────────────┐  │
             │        │ Rules Eng. │  │ AI Inference   │  │
             │        │ F0.4       │  │ F0.5 F1.3.2    │  │
             │        └────────────┘  └────────────────┘  │
             │                 │                          │
    ─────────▼─────────────────▼──────────────────────────▼──────────  Event Bus
             │                 │                          │            (AP-2.4)
    ┌────────▼────────┐  ┌─────▼──────────┐   ┌───────────▼──────────┐
    │ Audit Service   │  │ Integration    │   │ Notification Service │
    │ F1.7 F0.2.5     │  │ Service F1.6   │   │ F1.8                 │
    └────────┬────────┘  └───────┬────────┘   └──────────────────────┘
             │                   │ Cozone Adapter (ADR-005, AP-2.5)
    ┌────────▼──────┐            │
    │ Audit DB      │    ┌───────▼────────┐
    │ (append-only) │    │ Cozone Platform │  external
    └───────────────┘    └────────────────┘

    Ledger Service (F0.3) ── serves master ledger reads to Mapping + Review
    Identity (F0.2) ─────── enterprise OIDC IdP, external (AP-9.1)
```

### 3.1 Container responsibilities and boundaries

| Container | Owns | Must not | Epics |
|---|---|---|---|
| **Web UI** | Presentation, client-side validation, optimistic UI | Hold authoritative state; embed mapping business rules | F1.x UI slices |
| **API Gateway** | AuthN/Z, request schema validation, rate limiting | Contain business logic (**AP-2.6**) | F0.2 |
| **Intake Service** | Upload receipt, format detection, parsing, normalisation, quality scoring | Perform mapping decisions | F1.1, F1.2 |
| **Mapping Service** | Orchestrate the three resolution strategies, arbitrate confidence, persist decisions | Call Cozone; write audit records directly | F1.3 |
| **Rules Engine** | Deterministic rule evaluation and simulation | Hold session state (**AP-1.4**) | F0.4 |
| **AI Inference** | Semantic suggestion, similarity scoring, explanation generation | Be on the critical path for rule-satisfied accounts | F0.5, F1.3.2–.3 |
| **Ledger Service** | Master ledger CRUD, versioning, classification | Be written to by Mapping or Review | F0.3 |
| **Review Service** | Exception queue, assignment, override capture, approval workflow | Bypass the audit event emission | F1.4, F1.5 |
| **Integration Service** | Cozone export, sync monitoring, retry, failure handling | Mutate mapping decisions | F1.6 |
| **Audit Service** | Append-only event capture, timeline, PDF/CSV report generation | Expose mutation or delete APIs | F1.7 |
| **Notification Service** | In-app and email fan-out from bus events | Be called synchronously by other services | F1.8 |

Each service owns its data; no shared mutable database (**AP-1.2**).

---

## 4. Mapping session state machine (delta D-1)

```text
                 ┌──────────┐
   POST /sessions│Uploading │
                 └────┬─────┘
                      │ legacy.uploaded
                 ┌────▼──────┐   validation errors (severity=Error)
                 │Validating ├───────────────────────────────┐
                 └────┬──────┘                               │
                      │ legacy.validated                     │
                 ┌────▼──────┐                               │
                 │ Mapping   ├──── engine failure ───────────┤
                 └────┬──────┘                               │
                      │ mapping.generated                    │
              ┌───────┴────────┐                             │
   ambiguities│                │ zero ambiguities            │
              │                │                             │
        ┌─────▼────┐     ┌─────▼────┐                        │
        │ InReview │────►│ Approved │                        │
        └──────────┘     └─────┬────┘                        │
         review.created        │ mapping.completed           │
         override.approved     │                             │
                         ┌─────▼────┐                        │
                         │ Syncing  ├─ sync failure ─────────┤
                         └─────┬────┘                        │
                               │ sync.completed              │
                         ┌─────▼────┐                   ┌────▼───┐
                         │ Synced   │                   │ Failed │
                         └──────────┘                   └────┬───┘
                                                             │ retry
                                                             └──► prior state
```

Legal transitions only; any other transition attempt is rejected with `409 Conflict`. The `SessionStatus` union in `construction/alm-app/src/types/index.ts` is the canonical enumeration and must not diverge.

| From | To | Trigger | Guard |
|---|---|---|---|
| Uploading | Validating | File fully received | Format ∈ {CSV, XLSX, XML} |
| Validating | Mapping | `legacy.validated` | Zero `Error`-severity issues |
| Validating | Failed | Validation aborted | ≥1 `Error`-severity issue |
| Mapping | InReview | `mapping.generated` | `pendingReview > 0` |
| Mapping | Approved | `mapping.generated` | `pendingReview == 0` |
| InReview | Approved | All exceptions resolved | Approver role ∈ {FinanceManager, Administrator} |
| Approved | Syncing | Sync requested | Cozone adapter healthy |
| Syncing | Synced | `sync.completed` | `failures == 0` |
| Syncing | Failed | Adapter exhausted retries | Retry budget consumed |
| Failed | *prior* | Manual retry | Administrator or owning FinanceManager |

---

## 5. Domain design deltas

### 5.1 Intake Domain — F1.1 Legacy Account Intake

- Accepts CSV (F1.1.1), XLSX (F1.1.2), XML (F1.1.3) via multipart upload to object storage; the service never buffers whole files in memory (**AP-1.4**).
- Schema validation (F1.1.4) is a two-phase check: structural (required columns present, parseable) then semantic (account code format, currency ISO-4217, parent-code referential integrity).
- Validation output is a `ValidationIssue[]` carrying `row`, `accountCode`, `issue`, `severity ∈ {Warning, Error}`. `Warning` does not block progression; `Error` does.
- Emits `legacy.uploaded`, then `legacy.validated` or a validation-failure event.

### 5.2 Intake Domain — F1.2 Account Structure Processing

Pipeline stages, executed in order, each idempotent on `(sessionId, row)` (**AP-4.1**):

1. **Parse** (F1.2.1) — format-specific reader → canonical `LegacyAccount` records.
2. **Normalise** (F1.2.2) — trim, case-fold names, canonicalise account-type vocabulary, normalise currency codes.
3. **Duplicate detection** (F1.2.3) — exact `legacyCode` collisions and near-duplicate names within one session.
4. **Missing-code detection** (F1.2.4) — records with absent or malformed `legacyCode`, and orphaned `parentCode` references.
5. **Quality scoring** (F1.2.5) — a per-session score driving the "readiness" indicator on the Validation screen.

Stages 3 and 4 do not fail the session; they seed exceptions of type `Duplicate` and `Missing Code`.

### 5.3 Mapping Domain — F1.3 Automated Mapping Engine (delta D-2)

Three strategies are attempted per legacy account, in priority order, and the results arbitrated:

| Order | Strategy | `matchType` | Source | Cost |
|---|---|---|---|---|
| 1 | Deterministic rule evaluation | `Rule-Based` | Rules Engine (F0.4.3) | Low, synchronous |
| 2 | AI semantic match | `AI Semantic` | AI Inference (F1.3.2) | High, batched |
| 3 | Lexical/structural similarity | `Similarity` | Mapping Service (F1.3.3) | Medium |

**Arbitration policy.** A satisfied rule short-circuits strategies 2 and 3 — AI is never invoked for a rule-resolved account, which bounds inference cost. Where multiple strategies produce candidates, ranking (F1.3.5) orders by adjusted confidence, then by strategy priority as tiebreak.

**Confidence scoring (F1.3.4).** Base confidence from the winning strategy, adjusted by the matched rule's `confidenceBoost`, clamped to [0, 100]. Every suggestion carries a human-readable `explanation` — mandatory, per the Foundation's Explainability Framework (F0.5.5); a suggestion without an explanation is rejected by the service.

**Output contract.** `MappingSuggestion` records with `status ∈ {Pending, Accepted, Overridden, Flagged}`. Emits `mapping.generated` with the ambiguity count.

### 5.4 Review Domain — F1.4 / F1.5 (delta D-3)

**Ambiguity threshold policy** — an account is routed to review when any of:

| Condition | Exception type | Priority |
|---|---|---|
| Confidence below the auto-accept threshold | `Ambiguous Mapping` | High if far below, else Medium |
| Two or more candidates within the tie band | `Ambiguous Mapping` | High |
| No candidate from any strategy | `No Match` | High |
| Duplicate legacy code in session | `Duplicate` | Medium |
| Missing or malformed legacy code | `Missing Code` | Medium |
| Strategy execution error | `System Error` | High |

Thresholds are configuration, not code (**AP-7.3**), so they are tunable per engagement without redeployment.

**Queue model.** Exceptions carry `priority`, `assignedTo`, `ageHours`, and `sessionId`. Assignment (F1.4.5) supports self-claim and supervisor assignment. Ageing drives the SLA metrics surfaced in F2.4.4.

**Override path (F1.5).** An Accountant may propose an override; approval requires a FinanceManager or Administrator — segregation of duties (**AP-4.5**), and the human-in-the-loop gate required by **AP-8.5**. Every override captures actor, timestamp, prior suggestion, chosen master code, and a mandatory justification, emitted as `override.approved` (F1.5.5).

### 5.5 Integration Domain — F1.6 Cozone Integration (delta D-4)

- **Adapter isolation** (ADR-005, **AP-2.5**) — Cozone protocol specifics live wholly inside the adapter; no core service imports a Cozone type.
- **Idempotency** (**AP-4.1**) — each export carries an idempotency key derived from `(sessionId, mappingVersion)`. Replaying an export must not double-post.
- **Retry framework** (F1.6.4) — bounded exponential backoff with jitter; a poisoned record is quarantined rather than blocking the batch (**AP-6.5** graceful degradation).
- **Partial success is a first-class state** — `SyncRecord.status ∈ {Success, Partial, Failed}` with an explicit `failures` count; a partial sync never reports as success.
- Emits `sync.completed`.

### 5.6 Audit Domain — F1.7 Audit Reporting (delta D-5)

- **Append-only** (**AP-4.6**) — the Audit Service exposes no update or delete operation. Corrections are new compensating events, never edits.
- Event taxonomy: `AuditEvent { occurredAt, actor, category, action, subjectId, detail }`, where `category` covers Upload, Validation, Mapping, Override, Approval, Sync, Report, Access.
- Every mapping decision (F1.7.1) and every override (F1.7.2) produces an event — no silent decisions.
- Timeline (F1.7.3) reconstructs a session end-to-end; PDF (F1.7.4) and CSV (F1.7.5) renderers are the audit-ready deliverable behind US5.
- Access audit logging (F0.2.5) writes to the same store, giving an immutable auth audit (**AP-9.10**).

### 5.7 Notification Domain — F1.8 (delta D-6)

Bus subscriber only — never invoked synchronously. Subscribes to validation-failure, mapping-error and sync-failure events; fans out to in-app (F1.8.4) and email (F1.8.5). Delivery failure must not affect the emitting workflow.

---

## 6. Cross-service sequences

### 6.1 Upload through mapping (US1 → US2)

```text
UI      Gateway   Intake    Bus      Mapping   Rules   AI     Ledger
 │ POST /sessions │         │         │        │       │       │
 ├───────────────►├────────►│         │        │       │       │
 │  202 + id      │◄────────┤         │        │       │       │
 │◄───────────────┤         │ legacy.uploaded  │       │       │
 │                │         ├────────►│        │       │       │
 │                │         │ parse+normalise+score    │       │
 │                │         │ legacy.validated │       │       │
 │                │         ├────────►├───────►│       │       │
 │                │         │         │ read master ledger     │
 │                │         │         ├────────────────────────►│
 │                │         │         │ evaluate rules │       │
 │                │         │         ├───────►│       │       │
 │                │         │         │ unresolved → batch AI  │
 │                │         │         ├────────────────►│       │
 │                │         │         │ arbitrate + rank       │
 │                │         │ mapping.generated │      │       │
 │                │         │◄────────┤        │       │       │
 │ GET /sessions/{id}/suggestions     │        │       │       │
 ├───────────────►├─────────────────────────────────────────────►
```

### 6.2 Exception review and override (US3, US4)

```text
UI      Gateway  Review   Ledger   Bus    Audit   Notification
 │ GET /exceptions │        │       │      │       │
 ├───────────────►├────────►│       │      │       │
 │ search master ledger     │       │      │       │
 ├───────────────►├────────►├──────►│      │       │
 │ POST override (Accountant)       │      │       │
 ├───────────────►├────────►│ status=proposed     │
 │ POST approve  (FinanceManager)   │      │       │
 ├───────────────►├────────►│ override.approved   │
 │                │        ├───────►├─────►│ append event
 │                │        │        ├──────────────►│ notify
```

### 6.3 Approval to Cozone sync (US6)

```text
UI    Gateway  Review   Bus   Integration  Cozone  Audit
 │ POST /sessions/{id}/approve │    │        │      │
 ├─────────────►├──────►│ mapping.completed │      │
 │              │       ├─────►├───────────►│      │
 │              │       │      │ export w/ idempotency key
 │              │       │      ├───────────►│      │
 │              │       │      │◄─── partial/success
 │              │       │      │ retry failed subset
 │              │       │      │ sync.completed    │
 │              │       │◄─────┤            ├─────►│ append
```

---

## 7. Security design delta

| Concern | Decision | Principle |
|---|---|---|
| Authentication | Enterprise OIDC; the app issues no credentials of its own | AP-9.1, AP-9.2 |
| Tokens | Short-lived JWT, validated at the gateway | AP-9.3 |
| Authorisation | RBAC over four roles, plus context checks (own-session, own-tenant) | AP-9.5 |
| Segregation of duties | Proposer ≠ approver on overrides | AP-4.5 |
| Service-to-service | Workload identity, mTLS; no shared service accounts | AP-9.4, AP-9.6, AP-9.7 |
| Encryption | TLS 1.3 in transit, AES-256 at rest, managed KMS | AP-5.3, AP-10.7 |
| Data classification | Legacy ledger data is Confidential; audit records are Confidential + immutable | AP-3.4 |
| Secrets | Central vault; no secrets in config or images | AP-9.8 |

### 7.1 RBAC matrix

| Capability | FinanceManager | Accountant | Auditor | Administrator |
|---|:--:|:--:|:--:|:--:|
| Upload legacy file | ✅ | ✅ | — | ✅ |
| View mapping suggestions | ✅ | ✅ | ✅ (read) | ✅ |
| Propose override | ✅ | ✅ | — | ✅ |
| Approve override | ✅ | — | — | ✅ |
| Approve session | ✅ | — | — | ✅ |
| Trigger Cozone sync | ✅ | — | — | ✅ |
| Retry failed sync | ✅ | — | — | ✅ |
| View audit timeline / reports | ✅ | ✅ | ✅ | ✅ |
| Export audit report | ✅ | ✅ | ✅ | ✅ |
| Edit master ledger | — | — | — | ✅ |
| Edit mapping rules | — | — | — | ✅ |
| Manage users | — | — | — | ✅ |

Auditor is read-only by construction — no write capability anywhere in the matrix.

---

## 8. Cross-cutting NFR allocation

| NFR | Target | Owning container | Mechanism |
|---|---|---|---|
| Auto-map rate | High proportion auto-mapped, measured per session | Mapping | Rule coverage + AI recall; reported via F2.4.1 |
| Mapping throughput | Full firm ledger processed within the session SLA | Mapping, Intake | Batched AI inference, horizontal scale (**AP-6.4**) |
| Availability | Continuous during business hours, multi-AZ | Platform | F0.1.5 Resilience Foundation, **AP-6.3**, **AP-10.6** |
| Recoverability | No lost session on pod loss | Intake, Mapping | Event-sourced progression, idempotent stages |
| Auditability | Every decision reconstructable | Audit | Append-only store, **AP-4.6** |
| Traceability | One correlation id end-to-end | Gateway → all | **AP-7.2** |
| Observability | Metrics, structured logs, traces from every service | All | Foundation §8, **AP-7.1** |
| Accessibility | WCAG 2.2 AA | Web UI | Design system §8 acceptance criteria |
| Degradation | AI outage must not stop mapping | Mapping | Fall back to rules + similarity, flag for review (**AP-6.5**) |

---

## 9. Risks and open questions

| # | Risk / question | Impact | Mitigation / owner |
|---|---|---|---|
| R-1 | Cozone API contract not yet fixed | Blocks F1.6 integration test | Adapter isolates churn (AP-2.5); contract stub until confirmed — Integration owner |
| R-2 | No labelled training corpus for first acquisition | AI recall low on day one | Rules-first arbitration keeps the engine useful; F3.3 continuous learning closes the gap |
| R-3 | Ambiguity thresholds unvalidated against real ledgers | Review queue volume mis-sized | Thresholds are config (AP-7.3); calibrate on first pilot |
| R-4 | Master ledger versioning vs. in-flight sessions | A session could map against a superseded ledger version | Pin `ledgerVersion` at session start — decide in LLD |
| R-5 | XML schema variance across legacy systems | Parser fragility | Per-format adapter, explicit schema validation, F1.1.5 error reporting |
| Q-1 | Retention period for legacy uploads | Compliance exposure | Needs policy input (**AP-3.5**) |
| Q-2 | Tenant isolation model, needed before F3.4 | Rework risk if deferred | Design isolation boundary now (**AP-10.10**) |

---

## 10. Traceability to UI

| Screen | Route | Wireframe | Feature |
|---|---|---|---|
| Login | `/login` | `screen-01-login.html` | F0.2.1 |
| Dashboard | `/dashboard` | `screen-02-dashboard.html` | F2.4 |
| Upload Accounts | `/upload` | `screen-03-upload.html` | F1.1 |
| Validation | `/validation` | `screen-04-validation.html` | F1.1.4, F1.2 |
| Mapping Review | `/mapping` | `screen-05-mapping-review.html` | F1.3 |
| Manual Workbench | `/workbench` | `screen-06-workbench.html` | F1.5 |
| Exception Queue | `/exceptions` | `screen-07-exceptions.html` | F1.4 |
| Cozone Sync | `/sync` | `screen-08-cozone-sync.html` | F1.6 |
| Audit Report | `/audit` | `screen-09-audit-report.html` | F1.7 |
| History Portal | `/history` | `screen-10-history.html` | F2.1 |
| Bulk Operations | `/bulk` | `screen-11-bulk.html` | F2.2 |
| Master Ledger | `/ledger` | `screen-12-master-ledger.html` | F0.3.2 |
| Rules Engine | `/rules` | `screen-13-rules-engine.html` | F0.4.1 |
| Analytics | `/analytics` | `screen-14-analytics.html` | F2.4 |
| Help & Support | `/help` | `screen-15-help.html` | F2.3 |
| Users & Access | `/users` | `screen-16-users.html` | F0.2.2 |

---

## 11. Compliance with architectural principles

| Principle | How this HLD satisfies it |
|---|---|
| AP-1.1 Domain alignment | Services bounded by capability (Intake, Mapping, Review, Audit, Integration, AI), not by layer |
| AP-1.2 Service autonomy | Each service owns its data; Ledger is read-only to Mapping/Review |
| AP-1.4 Stateless services | Session state in stores and the event log, never in memory |
| AP-1.5 Justify every service | Seven MVP services, each a distinct bounded context; no service added without one |
| AP-1.6 C4 as standard | §3 stops at container level |
| AP-2.1 API-first | Contracts precede implementation; the API spec is a separate WF 3 output |
| AP-2.4 Event-driven core | All state transitions propagate as bus events (§4) |
| AP-2.5 Adapter for externals | Cozone behind an adapter (§5.5) |
| AP-2.6 Gateway boundary | Gateway owns authN/Z, validation, rate limiting only |
| AP-4.1 Idempotency | Intake stages and Cozone export keyed for safe replay |
| AP-4.5 Dual control | Proposer ≠ approver on overrides |
| AP-4.6 Audit on every transition | §5.6 append-only taxonomy |
| AP-6.5 Graceful degradation | AI outage degrades to rules + similarity |
| AP-8.3 HLD-delta rule | §1.1 states the delta explicitly rather than restating the baseline |
| AP-8.5 Human-in-the-loop | Override approval and session approval are explicit gates |

**Exceptions requiring an ADR:** none raised by this HLD. **AP-3.1** (double-entry ledger) is noted as non-applicable — ALM maps chart-of-accounts structure and posts no financial movements.
