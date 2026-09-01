# Low-Level Design — Automated Ledger Mapping (ALM) Tool

| Field | Value |
|---|---|
| **Artifact** | LLD (WF 3 · A7 `L1-design-lld` — LLD output) |
| **Scope** | W1 MVP epics F1.1–F1.8 |
| **Parent** | `design/ALM_HLD.md` — this LLD descends below container level; nothing here contradicts the HLD |
| **Status** | Draft v1.0 |
| **Conventions** | UTC ISO-8601 timestamps; `snake_case` persistence, `camelCase` API/DTO; monetary and code fields are strings, never floats |

---

## 1. Canonical data model

Field names and enumerations below are authoritative and match `construction/alm-app/src/types/index.ts`. Divergence between the two is a defect in whichever changed last.

### 1.1 `mapping_session` — Mapping DB

| Column | Type | Null | Notes |
|---|---|:--:|---|
| `id` | `varchar(20)` PK | N | Business key, e.g. `A-2024-089` |
| `firm_name` | `varchar(200)` | N | Acquired firm |
| `uploaded_at` | `timestamptz` | N | |
| `total_accounts` | `int` | N | ≥ 0 |
| `auto_mapped` | `int` | N | ≤ `total_accounts` |
| `auto_mapped_pct` | `numeric(5,2)` | N | Derived; persisted for report stability |
| `pending_review` | `int` | N | Drives the InReview vs Approved branch |
| `errors` | `int` | N | |
| `status` | `session_status` enum | N | See §1.2 |
| `duration` | `varchar(20)` | Y | Display string; `—` while running |
| `finance_manager` | `varchar(200)` | N | Owning user |
| `ledger_version` | `varchar(20)` | N | **Pinned at session start** — resolves HLD risk R-4 |
| `tenant_id` | `uuid` | N | Isolation boundary, AP-10.10 |
| `correlation_id` | `uuid` | N | End-to-end trace key, AP-7.2 |

Indexes: `(tenant_id, status)`, `(tenant_id, uploaded_at DESC)`, `(firm_name)`.

### 1.2 Enumerations

```text
session_status  : Uploading | Validating | Mapping | InReview | Approved | Syncing | Synced | Failed
role            : FinanceManager | Accountant | Auditor | Administrator
account_type    : Asset | Liability | Equity | Revenue | Expense | Memo
match_type      : Rule-Based | AI Semantic | Similarity
suggestion_state: Pending | Accepted | Overridden | Flagged
exception_type  : Ambiguous Mapping | Missing Code | Duplicate | No Match | System Error
priority        : High | Medium | Low
severity        : Warning | Error
sync_status     : Success | Partial | Failed
rule_status     : Active | Draft | Deprecated
user_status     : Active | Suspended | Pending
```

Enumerations are closed. Adding a member is a breaking change requiring a new API major version (**AP-2.3**).

### 1.3 `legacy_account` — Mapping DB

| Column | Type | Null | Notes |
|---|---|:--:|---|
| `id` | `uuid` PK | N | |
| `session_id` | FK → `mapping_session` | N | |
| `row_number` | `int` | N | Source file row, for error reporting |
| `legacy_code` | `varchar(50)` | Y | Null ⇒ `Missing Code` exception |
| `legacy_name` | `varchar(300)` | Y | |
| `account_type` | `varchar(50)` | Y | Raw source value, pre-normalisation |
| `normalised_type` | `account_type` enum | Y | Post-normalisation |
| `parent_code` | `varchar(50)` | Y | Self-referential by code, not FK |
| `currency` | `char(3)` | Y | ISO-4217 |
| `quality_flags` | `jsonb` | N | Default `[]` |

Unique: `(session_id, row_number)`. Index: `(session_id, legacy_code)`.

> `legacy_code` is deliberately **not** unique per session — duplicates must be storable in order to be reported as `Duplicate` exceptions.

### 1.4 `mapping_decision` — Mapping DB

| Column | Type | Null | Notes |
|---|---|:--:|---|
| `id` | `uuid` PK | N | |
| `session_id` | FK | N | |
| `legacy_account_id` | FK | N | |
| `suggested_master_code` | `varchar(50)` | Y | Null when `No Match` |
| `suggested_master_name` | `varchar(300)` | Y | Denormalised snapshot at decision time |
| `match_type` | `match_type` enum | Y | |
| `confidence` | `numeric(5,2)` | N | 0–100, clamped |
| `explanation` | `text` | N | **NOT NULL — enforces F0.5.5 explainability** |
| `status` | `suggestion_state` enum | N | Default `Pending` |
| `final_master_code` | `varchar(50)` | Y | Set on accept or override |
| `rule_id` | FK → `mapping_rule` | Y | Populated when `Rule-Based` |
| `model_version` | `varchar(40)` | Y | Populated when `AI Semantic` |
| `decided_at` | `timestamptz` | Y | |
| `version` | `int` | N | Optimistic concurrency, default 1 |

Unique: `(legacy_account_id)` — one live decision per account; superseded decisions move to `mapping_decision_history` rather than being updated in place.

### 1.5 `review_record` / exception queue — Mapping DB

| Column | Type | Null | Notes |
|---|---|:--:|---|
| `id` | `varchar(20)` PK | N | e.g. `EX-1042` |
| `session_id` | FK | N | |
| `legacy_account_id` | FK | N | |
| `exception_type` | enum | N | |
| `priority` | enum | N | Derived per HLD §5.4 policy |
| `ai_confidence` | `numeric(5,2)` | Y | Snapshot of the rejected suggestion |
| `assigned_to` | FK → `user` | Y | Null ⇒ unclaimed |
| `created_at` | `timestamptz` | N | `age_hours` is derived, never stored |
| `resolved_at` | `timestamptz` | Y | |
| `resolution` | `varchar(30)` | Y | `Accepted` \| `Overridden` \| `Escalated` |
| `proposed_by` / `approved_by` | FK → `user` | Y | **CHECK: `proposed_by <> approved_by`** — AP-4.5 in the schema |
| `justification` | `text` | Y | NOT NULL once `resolution = Overridden` |

Index: `(session_id, priority, created_at)`, `(assigned_to, resolved_at)`.

### 1.6 `master_ledger_account` — Ledger DB (read-only to Mapping/Review)

| Column | Type | Notes |
|---|---|---|
| `code` | `varchar(50)` | PK with `ledger_version` |
| `ledger_version` | `varchar(20)` | PK part — versioning, F0.3.3 |
| `name`, `classification` | `varchar` | |
| `type` | `account_type` enum | |
| `parent_code` | `varchar(50)` | |
| `status` | `Active` \| `Inactive` | Inactive codes are never suggested |
| `last_modified` | `timestamptz` | |

### 1.7 `mapping_rule` — Rules DB

| Column | Type | Notes |
|---|---|---|
| `id` | `varchar(20)` PK | e.g. `R-014` |
| `priority` | `int` | **Lower evaluates first**; unique per tenant |
| `name` | `varchar(200)` | |
| `condition` | `text` | Restricted DSL, §3.1 |
| `action` | `text` | Target master code or expression |
| `confidence_boost` | `numeric(5,2)` | Signed, applied post-base |
| `status` | `rule_status` enum | Only `Active` evaluates |
| `used_count` | `bigint` | Incremented asynchronously, not in the hot path |
| `version`, `created_by`, `created_at` | | Versioning, F0.4.4 |

### 1.8 `audit_event` — Audit DB (append-only)

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `occurred_at` | `timestamptz` | |
| `actor` | `varchar(200)` | User principal, or `system:<service>` |
| `category` | `varchar(40)` | Upload, Validation, Mapping, Override, Approval, Sync, Report, Access |
| `action` | `varchar(80)` | |
| `subject_id` | `varchar(60)` | Session, exception, or account id |
| `detail` | `jsonb` | Structured payload |
| `correlation_id` | `uuid` | |
| `prev_hash` / `hash` | `char(64)` | Chained SHA-256 — tamper evidence |

**No `UPDATE` or `DELETE` grant exists on this table.** Corrections are compensating events (**AP-4.6**).

### 1.9 `sync_record` — Integration DB

| Column | Type | Notes |
|---|---|---|
| `id` | `varchar(20)` PK | |
| `session_id` | FK | |
| `firm_name` | `varchar(200)` | |
| `synced_at` | `timestamptz` | |
| `accounts_exported`, `failures` | `int` | |
| `duration` | `varchar(20)` | |
| `status` | `sync_status` enum | `Partial` when `failures > 0` and `accounts_exported > 0` |
| `idempotency_key` | `varchar(120)` | **UNIQUE** — `sha256(session_id + ':' + mapping_version)` |
| `attempt` | `int` | |

### 1.10 `validation_issue` — Mapping DB

`(session_id, row, account_code, account_name, issue, severity)`. Index `(session_id, severity)`.

---

## 2. Intake Service — internal design

### 2.1 Component decomposition

```text
UploadController
  └─ UploadService ── ObjectStore (S3-compatible)
       └─ FormatDetector ──► CsvReader | XlsxReader | XmlReader   (Strategy)
            └─ ProcessingPipeline
                 ├─ ParseStage
                 ├─ NormaliseStage
                 ├─ DuplicateStage
                 ├─ MissingCodeStage
                 └─ QualityScoreStage
                      └─ EventPublisher ──► bus
```

### 2.2 Upload algorithm

```text
1. Reject if content-length > MAX_UPLOAD_BYTES              → 413
2. Reject if extension ∉ {csv, xlsx, xml}                   → 415
3. Stream to object storage under {tenant}/{sessionId}/raw   (never buffer whole file)
4. INSERT mapping_session (status = Uploading, ledger_version = current active)
5. Publish legacy.uploaded { sessionId, correlationId }
6. Return 202 Accepted + session id                          (async by design)
```

### 2.3 Pipeline stage contract

Every stage implements `apply(sessionId, batch) -> StageResult` and is **idempotent on `(session_id, row_number)`** (**AP-4.1**): re-running a stage after a crash must converge on the same state. Stages process in chunks of `PIPELINE_CHUNK_SIZE` rows so memory is bounded independently of file size.

| Stage | Rejects the session? | Emits exceptions |
|---|:--:|---|
| Parse | Yes, on unparseable structure | — |
| Normalise | No | — |
| Duplicate | No | `Duplicate` |
| MissingCode | No | `Missing Code` |
| QualityScore | No | — |

### 2.4 Validation rules (F1.1.4)

| Rule | Severity | Message pattern |
|---|---|---|
| Required column absent | Error | `Required column '<col>' not found` |
| Row cannot be parsed | Error | `Row <n> malformed` |
| `legacy_code` empty | Error | `Account code missing at row <n>` |
| `legacy_code` fails format pattern | Warning | `Account code '<code>' has unexpected format` |
| `currency` not ISO-4217 | Warning | `Unrecognised currency '<cur>'` |
| `parent_code` not present in file | Warning | `Parent code '<code>' not found in upload` |
| Duplicate `legacy_code` in file | Warning | `Duplicate account code '<code>' at rows <a>, <b>` |
| `account_type` unmappable to enum | Warning | `Account type '<type>' could not be classified` |

Progression gate: `count(severity = Error) == 0`.

---

## 3. Rules Engine — internal design

### 3.1 Condition DSL

A deliberately restricted, non-Turing-complete grammar — no arbitrary code execution (**AP-5.1**):

```text
condition  := expr (('AND' | 'OR') expr)*
expr       := field op literal | '(' condition ')' | 'NOT' expr
field      := 'legacyCode' | 'legacyName' | 'accountType' | 'parentCode' | 'currency'
op         := '=' | '!=' | 'startsWith' | 'endsWith' | 'contains' | 'matches' | 'in'
literal    := quoted-string | number | '[' quoted-string (',' quoted-string)* ']'
```

Parsed once at rule save time into an AST, cached in memory, invalidated on rule version change. `matches` patterns are compiled with a backtracking limit to prevent catastrophic-regex denial of service.

### 3.2 Evaluation algorithm

```text
evaluate(account, tenantId, ledgerVersion):
  rules ← activeRulesFor(tenantId) sorted by priority ASC     # lower = first
  for rule in rules:
      if rule.ast.test(account):
          target ← resolve(rule.action)
          if target not in activeMasterCodes(ledgerVersion):
              return SystemError("rule R-x targets inactive code")
          return Match(
              masterCode  = target,
              matchType   = 'Rule-Based',
              baseConfidence = RULE_BASE_CONFIDENCE,
              boost       = rule.confidenceBoost,
              ruleId      = rule.id,
              explanation = "Rule " + rule.id + " (" + rule.name + ") matched: " + rule.condition)
  return NoMatch
```

First match wins — evaluation stops immediately, so rule ordering is semantically significant. The engine is stateless (**AP-1.4**); the `used_count` increment is published as an event, not written inline.

### 3.3 Simulation (F0.4.5)

Simulation runs the same evaluator against a stored session snapshot with a candidate rule set, writing nothing. Used by the Rules Engine screen to preview impact before activation.

---

## 4. Mapping Service — internal design

### 4.1 Orchestration

```text
onLegacyValidated(sessionId):
  session ← load(sessionId)                     # ledger_version pinned here
  masterIndex ← LedgerClient.index(session.ledgerVersion)   # cached, read-only
  update status → Mapping

  for chunk in accounts(sessionId, CHUNK):
      ruleResults ← RulesEngine.evaluateBatch(chunk)
      resolved   ← ruleResults.matches                       # AI never invoked for these
      unresolved ← chunk − resolved

      aiResults  ← AiClient.suggestBatch(unresolved, masterIndex)   # single batched call
      simResults ← Similarity.score(unresolved, masterIndex)

      for account in chunk:
          candidates ← collect(ruleResults, aiResults, simResults)
          decision   ← arbitrate(candidates)
          persist(decision)
          if needsReview(decision):
              ReviewClient.raise(exceptionFor(decision))

  recount(sessionId)                            # auto_mapped, pending_review, errors
  publish mapping.generated { sessionId, pendingReview }
  update status → (pendingReview > 0 ? InReview : Approved)
```

### 4.2 Arbitration

```text
arbitrate(candidates):
  if candidates.empty: return NoMatch(confidence = 0,
        explanation = "No rule, semantic or similarity candidate found")

  for c in candidates:
      c.adjusted ← clamp(c.baseConfidence + c.boost, 0, 100)

  ranked ← candidates sorted by (adjusted DESC, strategyPriority ASC)
  top    ← ranked[0]

  if ranked.size ≥ 2 and (top.adjusted − ranked[1].adjusted) < TIE_BAND:
      return Ambiguous(top, runnerUp = ranked[1])          # tie → review

  if top.adjusted < AUTO_ACCEPT_THRESHOLD:
      return LowConfidence(top)                            # below bar → review

  return AutoAccept(top)
```

`strategyPriority`: `Rule-Based` = 1, `AI Semantic` = 2, `Similarity` = 3.

### 4.3 Configuration parameters (**AP-7.3** — config, not code)

| Key | Meaning | Effect if raised |
|---|---|---|
| `AUTO_ACCEPT_THRESHOLD` | Minimum adjusted confidence to auto-accept | Smaller queue, higher risk of silent error |
| `TIE_BAND` | Confidence gap below which two candidates are a tie | Larger queue, fewer wrong auto-accepts |
| `RULE_BASE_CONFIDENCE` | Base confidence for a rule match | — |
| `AI_BATCH_SIZE` | Accounts per inference call | Fewer calls, higher latency per call |
| `PIPELINE_CHUNK_SIZE` | Rows per intake chunk | More memory per pod |
| `MAX_UPLOAD_BYTES` | Upload cap | — |
| `RETRY_MAX_ATTEMPTS`, `RETRY_BASE_DELAY_MS` | Cozone retry budget | Longer tail on failure |

All are environment-scoped and hot-reloadable; changing one is an audited configuration event.

### 4.4 Degradation (**AP-6.5**)

If the AI Inference client fails or times out, mapping **does not fail**. `aiResults` is empty, arbitration proceeds on rule and similarity candidates only, and every account that would have depended on AI is flagged `Ambiguous Mapping` with explanation `"AI suggestion unavailable — routed to manual review"`. A degradation metric is emitted.

### 4.5 Similarity scoring (F1.3.3)

Composite score over normalised master-ledger candidates: token-set overlap on account name, edit distance on code, plus an account-type compatibility gate that hard-excludes type mismatches (an `Asset` legacy account is never suggested a `Revenue` master code). Top-`K` candidates only are carried forward.

---

## 5. Review Service — internal design

### 5.1 Override state machine

```text
Pending ──propose(Accountant|FM|Admin)──► Proposed
Proposed ──approve(FM|Admin, ≠ proposer)──► Overridden ──► audit: override.approved
Proposed ──reject(FM|Admin)──────────────► Pending  (justification retained)
Pending ──accept(any writer)─────────────► Accepted ──► audit: mapping.accepted
Pending ──escalate───────────────────────► Escalated (priority → High, reassigned)
```

### 5.2 Approval guard

```text
approve(exceptionId, actor):
  ex ← load(exceptionId)
  assert ex.resolution is null                          else 409 Conflict
  assert actor.role in {FinanceManager, Administrator}  else 403
  assert actor.id != ex.proposed_by                     else 403 "segregation of duties"
  assert ex.justification is non-empty                  else 422
  assert targetCode in activeMasterCodes(session.ledger_version) else 422
  in one transaction:
      supersede prior mapping_decision → history
      insert new mapping_decision (status = Overridden, final_master_code = target)
      update review_record (resolution, approved_by, resolved_at)
      publish override.approved
  # audit written by the Audit Service consuming the event, not inline
```

Optimistic concurrency on `mapping_decision.version`; a stale version returns `409`.

### 5.3 Session approval

Blocked while any `review_record.resolved_at is null`. On success: status → `Approved`, publish `mapping.completed`.

---

## 6. Integration Service — internal design

### 6.1 Export algorithm

```text
onMappingCompleted(sessionId):
  key ← sha256(sessionId + ':' + mappingVersion)
  if sync_record exists with idempotency_key = key and status = Success: return   # replay-safe
  update session status → Syncing
  batches ← partition(finalMappings(sessionId), COZONE_BATCH_SIZE)
  for batch in batches:
      result ← retry(() => CozoneAdapter.post(batch, key), RETRY_MAX_ATTEMPTS)
      if result.failed: quarantine(batch.failedItems)      # never block the run
  record ← SyncRecord(
      accountsExported = successCount,
      failures         = failureCount,
      status = failureCount == 0 ? Success
             : successCount  == 0 ? Failed
             : Partial)                                    # Partial is never reported as Success
  publish sync.completed { sessionId, status, failures }
  update session status → (record.status == Success ? Synced : Failed)
```

### 6.2 Retry policy

Exponential backoff with full jitter, capped attempts. Retried only on transient classes (timeout, 5xx, 429 with Retry-After). Never retried: 400, 401, 403, 409, 422 — these are quarantined for human action.

### 6.3 Adapter boundary

`CozoneAdapter` is the sole holder of Cozone request/response types. Core services exchange only internal DTOs (**AP-2.5**), so a Cozone contract change is confined to one component — this is what makes HLD risk R-1 tolerable.

---

## 7. Audit Service — internal design

### 7.1 Hash chaining

```text
append(event):
  prev ← last event hash for (tenant_id) or 64×'0'
  event.prev_hash ← prev
  event.hash ← sha256(canonicalJson(event without hash))
  INSERT   # no UPDATE / DELETE grant exists
```

Verification walks the chain; a break is a tamper alarm. Chain is per-tenant to avoid a global write bottleneck.

### 7.2 Report generation (F1.7.4 / F1.7.5)

Generated asynchronously from the event stream plus final decisions; the request returns a report id and the client polls. Report content is deterministic for a given `(sessionId, mappingVersion)` — regenerating an audit report must produce a byte-identical document, which is why `suggested_master_name` is snapshotted (§1.4) rather than joined live.

---

## 8. Web UI — component design

Current implementation: React 19 + TypeScript + Vite, `construction/alm-app`. Today all screens read fixtures from `src/data/mock.ts`; this section defines the design the fixtures stand in for.

### 8.1 Layering

```text
src/
  pages/*.tsx        route-level screens, one per HLD §10 route
  components/
    AppShell.tsx     chrome: top bar, sidebar, <Outlet/>
    ui.tsx           design-system primitives (Button, Card, DataTable, …)
  data/mock.ts       ← to be replaced by src/api/*
  types/index.ts     domain types, shared with the API contract
```

Target addition:

```text
  api/
    client.ts        fetch wrapper: base URL, JWT attach, correlation-id header, error normalisation
    sessions.ts      suggestions.ts  exceptions.ts  ledger.ts  rules.ts  audit.ts  sync.ts
  hooks/
    useSession.ts    usePolling.ts   useRbac.ts
```

Pages must not call `fetch` directly; they consume hooks over `api/*` (**AP-1.3**).

### 8.2 Data-fetching states

Every screen implements four states explicitly: **loading**, **empty** (`EmptyState` primitive exists), **error** (`AlertBanner`), **populated**. A screen that renders only the populated state is incomplete.

### 8.3 Long-running work

Upload, mapping and sync are asynchronous server-side. The UI polls session status on an interval with backoff while status ∈ {Uploading, Validating, Mapping, Syncing}, and stops on a terminal state. No progress bar may claim completion before the server reports it.

### 8.4 RBAC in the UI

`useRbac()` derives capability booleans from the token's role claim. Controls the user cannot use are **disabled with a reason**, not hidden, except where their presence would leak information. The UI check is convenience only — the API re-checks every call (**AP-9.5**); a UI-only guard is not a control.

### 8.5 Routing gap (current defect)

`App.tsx` registers `AppShell` routes with no authentication guard, and `LoginPage` navigates to `/dashboard` unconditionally. The design requires a `<RequireAuth>` wrapper that validates the token, redirects unauthenticated users to `/login` preserving the intended path, and a `<RequireRole>` wrapper for `/users`, `/rules` and `/ledger` (Administrator only). Tracked as a construction task, covered by TS-AUTH-03 in the test scenarios.

### 8.6 Accessibility obligations

Per the design system §8: visible focus ring preserved, `#main-content` skip target, `aria-label` on primary nav, status never conveyed by colour alone (`Chip` and `ConfidencePill` pair colour with text), tables with header associations, live-region announcement for async status changes, WCAG 2.2 AA contrast on `brand-500` used as a background with `ink-950` text.

---

## 9. Error model

Single error envelope across all services:

```json
{
  "type": "https://alm.azets.internal/errors/validation-failed",
  "title": "Validation failed",
  "status": 422,
  "detail": "3 rows contain errors",
  "correlationId": "6f0c…",
  "errors": [{ "row": 14, "field": "legacyCode", "message": "Account code missing at row 14" }]
}
```

| Status | Used for | Not used for |
|---|---|---|
| 400 | Malformed request syntax | Business rule failure |
| 401 | Missing/expired token | Insufficient role |
| 403 | Insufficient role, segregation-of-duties violation | Unknown resource |
| 404 | Unknown resource, or resource outside the caller's tenant | — |
| 409 | Illegal state transition, stale `version` | Validation failure |
| 413 / 415 | Upload too large / unsupported format | — |
| 422 | Semantic validation failure | Syntax errors |
| 429 | Rate limit (gateway) | — |
| 503 | Dependency unavailable, with `Retry-After` | Business failure |

Tenant-scoped resources return `404`, never `403`, for cross-tenant access — no existence disclosure.

---

## 10. Concurrency, transactions and idempotency

| Scenario | Mechanism |
|---|---|
| Two reviewers open one exception | Optimistic `version`; loser gets `409` |
| Duplicate approval submit | `resolution` non-null check inside the transaction |
| Duplicate Cozone export | `sync_record.idempotency_key` UNIQUE |
| Pipeline stage replay after crash | Stage idempotent on `(session_id, row_number)` |
| Duplicate bus delivery | Consumers key on event id; at-least-once delivery assumed |
| Rule set changes mid-session | Rule version pinned per session alongside `ledger_version` |
| Ledger changes mid-session | `mapping_session.ledger_version` pinned at start |
| Report regeneration | Deterministic on `(sessionId, mappingVersion)` |

Transaction boundaries never span services; cross-service consistency is eventual via the bus, with compensating events for correction (**AP-6.2**).

---

## 11. Observability

| Signal | Detail |
|---|---|
| Correlation | `X-Correlation-Id` accepted at the gateway or minted there; propagated on every call and bus message; stamped on every log line and audit event (**AP-7.2**) |
| Metrics | `alm_session_duration_seconds`, `alm_automap_rate`, `alm_exceptions_open`, `alm_ai_latency_seconds`, `alm_ai_degraded_total`, `alm_sync_failures_total`, `alm_rule_match_total{ruleId}` |
| Logs | Structured JSON; **never** log legacy account names or file contents (Confidential, **AP-3.4**) — log counts and ids |
| Traces | Span per pipeline stage and per external call |
| Alerts | AI degradation sustained; sync failure rate; exception queue age breaching SLA; audit hash-chain break (page immediately) |

---

## 12. Open items carried from the HLD

| Ref | Item | Resolution in this LLD |
|---|---|---|
| R-1 | Cozone contract unfixed | Confined to `CozoneAdapter` (§6.3) |
| R-3 | Thresholds unvalidated | Externalised as hot-reloadable config (§4.3) |
| R-4 | Ledger version vs in-flight session | **Resolved** — `ledger_version` pinned on `mapping_session` (§1.1) |
| R-5 | XML schema variance | Per-format reader strategy (§2.1) |
| Q-1 | Retention period | **Still open** — needs policy input; no retention job specified |
| Q-2 | Tenant isolation model | Partially addressed — `tenant_id` on all tenant-scoped tables; row-level enforcement to be confirmed |
