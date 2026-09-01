# Test Scenarios — Automated Ledger Mapping (ALM) Tool

| Field | Value |
|---|---|
| **Artifact** | Test Scenarios (WF 3 · A5 `L1-testing-scenario-writer`) |
| **Scope** | W1 MVP epics F1.1–F1.8 + W0 foundation surfaces exposed in the UI |
| **Upstream** | `planning/epics.json`, PRD US1–US6, `design/ALM_HLD.md`, `design/ALM_LLD.md`, `design/ALM_User_Flows.md` |
| **Downstream** | `testing/ALM_Manual_Test_Cases.md`, `testing/ALM_Automated_Test_Cases.md` |
| **Status** | Draft v1.0 |

## Conventions

- **ID:** `TS-<AREA>-<nn>`. Areas: `UPL` intake · `VAL` validation · `MAP` mapping engine · `EXC` exceptions · `OVR` override · `SYN` Cozone sync · `AUD` audit · `AUTH` identity/RBAC · `LED` master ledger · `RUL` rules engine · `BLK` bulk · `NFR` cross-cutting · `A11Y` accessibility.
- **Priority:** P1 blocks release · P2 must fix before GA · P3 desirable.
- **Type:** Functional · Negative · Integration · Security · Performance · Accessibility · Resilience.
- **Level:** the lowest level at which the scenario can be honestly verified.

---

## 1. F1.1 Legacy Account Intake

| ID | Scenario | Type | Pri | Level | Traces |
|---|---|---|:--:|---|---|
| TS-UPL-01 | A valid CSV of a legacy chart of accounts is accepted and a session is created in `Uploading` | Functional | P1 | API + E2E | F1.1.1, US1 |
| TS-UPL-02 | A valid XLSX upload is accepted and parsed equivalently to the same data as CSV | Functional | P1 | API | F1.1.2 |
| TS-UPL-03 | A valid XML upload is accepted and parsed equivalently to the same data as CSV | Functional | P1 | API | F1.1.3 |
| TS-UPL-04 | An unsupported extension (`.txt`, `.pdf`) is rejected client-side before submit and server-side with 415 | Negative | P1 | Unit + API | F1.1.5 |
| TS-UPL-05 | A file above the size cap is rejected with 413 and a message naming the cap | Negative | P2 | API | F1.1.5 |
| TS-UPL-06 | A zero-row file (headers only) is rejected with a clear message, not accepted as an empty session | Negative | P2 | API | F1.1.4 |
| TS-UPL-07 | A file whose declared extension disagrees with its actual content is rejected, not mis-parsed | Negative | P2 | API | F1.1.5 |
| TS-UPL-08 | Upload of a large ledger streams to object storage without service memory growing with file size | Performance | P2 | Integration | LLD §2.2 |
| TS-UPL-09 | `ledger_version` is pinned on the session at creation and does not change if the master ledger is edited mid-session | Functional | P1 | API | LLD §1.1, R-4 |
| TS-UPL-10 | An upload interrupted mid-transfer leaves no half-created session and no orphaned object | Resilience | P2 | Integration | AP-4.1 |
| TS-UPL-11 | Upload is rejected for a user whose role lacks upload permission (`Auditor`) | Security | P1 | API | HLD §7.1 |

## 2. F1.1.4 / F1.2 Validation and Structure Processing

| ID | Scenario | Type | Pri | Level | Traces |
|---|---|---|:--:|---|---|
| TS-VAL-01 | A file with zero issues progresses to `Mapping` and the proceed action is enabled | Functional | P1 | E2E | F1.1.4 |
| TS-VAL-02 | A missing required column produces an `Error` and blocks progression | Negative | P1 | Unit + API | F1.1.4 |
| TS-VAL-03 | An empty account code produces an `Error` naming the source row number | Negative | P1 | Unit | LLD §2.4 |
| TS-VAL-04 | A non-ISO-4217 currency produces a `Warning` and does **not** block progression | Functional | P1 | Unit | LLD §2.4 |
| TS-VAL-05 | An orphaned `parent_code` produces a `Warning` naming the missing parent | Functional | P2 | Unit | F1.2.4 |
| TS-VAL-06 | Duplicate legacy codes within one file are all persisted and reported as `Duplicate` exceptions | Functional | P1 | API | F1.2.3, LLD §1.3 |
| TS-VAL-07 | Warnings alone allow progression; a banner states how many rows will be flagged | Functional | P1 | E2E | UF-03 |
| TS-VAL-08 | Errors present ⇒ proceed is blocked and the only forward action is fix-and-re-upload | Negative | P1 | E2E | UF-03 |
| TS-VAL-09 | The issue list exports to CSV with row, code, issue and severity intact | Functional | P2 | E2E | F1.1.5 |
| TS-VAL-10 | Normalisation canonicalises casing, whitespace and account-type vocabulary without altering account codes | Functional | P1 | Unit | F1.2.2 |
| TS-VAL-11 | Re-running a pipeline stage after a simulated crash converges on identical state (idempotency) | Resilience | P1 | Integration | AP-4.1, LLD §2.3 |
| TS-VAL-12 | Data quality score is computed and surfaced on the Validation screen | Functional | P3 | API | F1.2.5 |
| TS-VAL-13 | A row with mixed leading/trailing whitespace in the code is normalised without creating a false duplicate | Negative | P2 | Unit | F1.2.2/.3 |

## 3. F1.3 Automated Mapping Engine

| ID | Scenario | Type | Pri | Level | Traces |
|---|---|---|:--:|---|---|
| TS-MAP-01 | An account satisfying an active rule is mapped `Rule-Based` and AI is **never invoked** for it | Functional | P1 | Integration | F1.3.1, LLD §4.1 |
| TS-MAP-02 | An account with no rule match receives an `AI Semantic` suggestion | Functional | P1 | Integration | F1.3.2, US2 |
| TS-MAP-03 | Similarity scoring produces a candidate when both rule and AI yield nothing | Functional | P2 | Unit | F1.3.3 |
| TS-MAP-04 | Confidence is base + rule boost, clamped to 0–100 — no value outside the range is ever persisted | Functional | P1 | Unit | F1.3.4 |
| TS-MAP-05 | Every persisted suggestion has a non-empty explanation; a suggestion without one is rejected by the service | Functional | P1 | Unit + API | F0.5.5, LLD §1.4 |
| TS-MAP-06 | Two candidates within the tie band route to review rather than auto-accepting the higher one | Functional | P1 | Unit | LLD §4.2 |
| TS-MAP-07 | A candidate below the auto-accept threshold routes to review | Functional | P1 | Unit | LLD §4.2 |
| TS-MAP-08 | Zero candidates from all three strategies produces a `No Match` exception, not a null mapping | Negative | P1 | Unit | LLD §4.2 |
| TS-MAP-09 | Ranking orders by adjusted confidence, with strategy priority as tiebreak | Functional | P2 | Unit | F1.3.5 |
| TS-MAP-10 | Session moves to `InReview` when `pendingReview > 0`, and to `Approved` when zero | Functional | P1 | API | HLD §4 |
| TS-MAP-11 | An inactive master code is never suggested by any strategy | Negative | P1 | Unit | LLD §1.6 |
| TS-MAP-12 | An account-type-incompatible master code is excluded by the similarity gate (`Asset` never → `Revenue`) | Negative | P1 | Unit | LLD §4.5 |
| TS-MAP-13 | AI outage degrades to rules + similarity; mapping completes, affected rows flagged with the degradation explanation | Resilience | P1 | Integration | AP-6.5, LLD §4.4 |
| TS-MAP-14 | Lowering `AUTO_ACCEPT_THRESHOLD` in config increases auto-accepts on the same input, with no code change | Functional | P2 | Integration | AP-7.3, LLD §4.3 |
| TS-MAP-15 | Mapping uses the ledger version pinned on the session, not the current one | Functional | P1 | Integration | R-4 |
| TS-MAP-16 | `mapping.generated` is emitted exactly once per session with the correct ambiguity count | Integration | P1 | Integration | AP-2.4 |
| TS-MAP-17 | Rule priority ordering is respected — a lower-priority rule never wins over a matching higher-priority one | Functional | P1 | Unit | LLD §3.2 |
| TS-MAP-18 | A rule whose action targets an inactive master code yields a `System Error` exception, not a silent bad mapping | Negative | P2 | Unit | LLD §3.2 |
| TS-MAP-19 | A full firm ledger completes mapping within the session SLA | Performance | P2 | Performance | HLD §8 |
| TS-MAP-20 | Duplicate delivery of `legacy.validated` does not double-map or duplicate decisions | Resilience | P1 | Integration | LLD §10 |

## 4. F1.4 Ambiguity and Exception Management

| ID | Scenario | Type | Pri | Level | Traces |
|---|---|---|:--:|---|---|
| TS-EXC-01 | Each ambiguity condition produces the correct `exception_type` and derived `priority` | Functional | P1 | Unit | HLD §5.4 |
| TS-EXC-02 | Queue default sort is priority then age, oldest High first | Functional | P2 | E2E | UF-05 |
| TS-EXC-03 | Filters by type, priority, assignee and session return correct subsets | Functional | P2 | E2E | F1.4.3 |
| TS-EXC-04 | Claiming an exception sets `assignedTo` to the claimant | Functional | P1 | API | F1.4.5 |
| TS-EXC-05 | A second user resolving an already-resolved exception is rejected with a message naming the resolver, not a raw error | Negative | P1 | API + E2E | LLD §10 |
| TS-EXC-06 | `ageHours` is derived from `created_at` at read time, never a stale stored value | Functional | P2 | Unit | LLD §1.5 |
| TS-EXC-07 | Escalation raises priority to High and reassigns, capturing the reason | Functional | P3 | API | F1.4.4 |
| TS-EXC-08 | Empty queue renders the empty state, not a blank table | Functional | P2 | E2E | UF-05 |
| TS-EXC-09 | Only a supervisor role can assign to another user; self-claim is open to writers | Security | P2 | API | F1.4.5 |

## 5. F1.5 Manual Mapping Workbench and Override

| ID | Scenario | Type | Pri | Level | Traces |
|---|---|---|:--:|---|---|
| TS-OVR-01 | An Accountant can propose an override with a justification | Functional | P1 | E2E | US3, F1.5.2 |
| TS-OVR-02 | Submit is blocked while the justification is empty | Negative | P1 | Unit + E2E | UF-06 |
| TS-OVR-03 | The proposer cannot approve their own override — rejected 403 with the segregation-of-duties reason | Security | P1 | API | AP-4.5, LLD §5.2 |
| TS-OVR-04 | A FinanceManager can approve another user's proposed override | Functional | P1 | API + E2E | F1.5.4 |
| TS-OVR-05 | An Accountant cannot approve any override | Security | P1 | API | HLD §7.1 |
| TS-OVR-06 | Approval supersedes the prior decision into history rather than updating it in place | Functional | P1 | Integration | LLD §1.4, §5.2 |
| TS-OVR-07 | Approval emits `override.approved` and an immutable audit event capturing actor, prior and new code, and justification | Integration | P1 | Integration | F1.5.5, AP-4.6 |
| TS-OVR-08 | Rejection returns the item to `Pending`, retains the justification and notifies the proposer | Functional | P2 | API | F1.8.4 |
| TS-OVR-09 | Master ledger search returns only active codes from the session's pinned ledger version | Functional | P1 | API | F1.5.3 |
| TS-OVR-10 | Overriding to a code that has since been deactivated is rejected with 422 | Negative | P1 | API | LLD §5.2 |
| TS-OVR-11 | A stale `version` on submit is rejected with 409 and no partial write | Negative | P1 | API | LLD §10 |
| TS-OVR-12 | On resolve, the workbench advances to the next queue item and offers an explicit exit | Functional | P3 | E2E | UF-06 |

## 6. F1.6 Cozone Integration

| ID | Scenario | Type | Pri | Level | Traces |
|---|---|---|:--:|---|---|
| TS-SYN-01 | Session approval is blocked while any exception is unresolved | Negative | P1 | API | LLD §5.3 |
| TS-SYN-02 | Approval requires FinanceManager or Administrator and shows a confirmation restating scope | Security | P1 | API + E2E | AP-8.5, UF-07 |
| TS-SYN-03 | A successful sync exports every final mapping and sets status `Synced` | Functional | P1 | Integration | US6, F1.6.2 |
| TS-SYN-04 | Replaying an export with the same idempotency key does not double-post | Resilience | P1 | Integration | AP-4.1, LLD §6.1 |
| TS-SYN-05 | Partial failure yields `Partial` with accurate exported/failed counts — never reported as success | Functional | P1 | Integration | LLD §6.1 |
| TS-SYN-06 | "Retry failed only" re-posts the failed subset and does not touch already-successful records | Functional | P1 | Integration | F1.6.4 |
| TS-SYN-07 | Transient errors (timeout, 5xx, 429) are retried with backoff; 4xx business errors are quarantined, not retried | Resilience | P1 | Integration | LLD §6.2 |
| TS-SYN-08 | Exhausting the retry budget sets `Failed` with a stated reason and leaves retry available to authorised roles | Resilience | P1 | Integration | F1.6.5 |
| TS-SYN-09 | One poisoned record does not block the remainder of the batch | Resilience | P1 | Integration | AP-6.5 |
| TS-SYN-10 | No Cozone type appears outside the adapter component (boundary check) | Integration | P2 | Static analysis | AP-2.5, LLD §6.3 |
| TS-SYN-11 | `sync.completed` is emitted with the correct status and failure count | Integration | P1 | Integration | AP-2.4 |
| TS-SYN-12 | Cozone unavailable at approval time surfaces a clear error and leaves the session `Approved`, not `Failed` | Resilience | P2 | Integration | HLD §4 |

## 7. F1.7 Audit Reporting

| ID | Scenario | Type | Pri | Level | Traces |
|---|---|---|:--:|---|---|
| TS-AUD-01 | Every mapping decision produces an audit event | Functional | P1 | Integration | F1.7.1, AP-4.6 |
| TS-AUD-02 | Every override produces an audit event carrying proposer, approver and justification | Functional | P1 | Integration | F1.7.2 |
| TS-AUD-03 | The audit store exposes no update or delete path; a mutation attempt fails | Security | P1 | API + Integration | AP-4.6, LLD §1.8 |
| TS-AUD-04 | The hash chain verifies end-to-end; a tampered row is detected | Security | P1 | Integration | LLD §7.1 |
| TS-AUD-05 | The event timeline reconstructs a session from upload to sync in order | Functional | P1 | API | F1.7.3 |
| TS-AUD-06 | PDF export contains summary, decisions, overrides and timeline | Functional | P1 | E2E | F1.7.4, US5 |
| TS-AUD-07 | CSV export is machine-readable with all decision columns | Functional | P1 | E2E | F1.7.5 |
| TS-AUD-08 | Regenerating a report for the same session and mapping version produces identical content | Functional | P1 | Integration | LLD §7.2 |
| TS-AUD-09 | Overrides are presented distinctly from auto-accepted mappings | Functional | P2 | E2E | UF-08 |
| TS-AUD-10 | An Auditor can view and export every report and sees no action controls at all | Security | P1 | E2E | UF-08, HLD §7.1 |
| TS-AUD-11 | Access events (sign-in, role change, suspension) are captured in the audit store | Security | P2 | Integration | F0.2.5, AP-9.10 |
| TS-AUD-12 | Report generation for a large session completes asynchronously without blocking the request | Performance | P2 | Integration | LLD §7.2 |

## 8. F0.2 Identity, RBAC and session

| ID | Scenario | Type | Pri | Level | Traces |
|---|---|---|:--:|---|---|
| TS-AUTH-01 | Successful SSO lands the user on the dashboard with a role-appropriate view | Functional | P1 | E2E | F0.2.1, UF-01 |
| TS-AUTH-02 | A failed sign-in reveals nothing about which factor failed | Security | P1 | E2E | AP-5.1 |
| TS-AUTH-03 | An unauthenticated user hitting `/dashboard` directly is redirected to `/login`, and returned to the intended path after sign-in | Security | P1 | E2E | **Current defect**, LLD §8.5 |
| TS-AUTH-04 | Every role's capability set matches the RBAC matrix exactly, enforced server-side | Security | P1 | API | HLD §7.1, AP-9.5 |
| TS-AUTH-05 | A UI-disabled control's underlying API call is still rejected when invoked directly | Security | P1 | API | LLD §8.4 |
| TS-AUTH-06 | An expired token yields 401 and a re-authentication prompt, not a blank screen | Negative | P1 | E2E | F0.2.3 |
| TS-AUTH-07 | Suspending a user revokes their active sessions immediately | Security | P1 | Integration | UF-12 |
| TS-AUTH-08 | A cross-tenant resource request returns 404, never 403 — no existence disclosure | Security | P1 | API | LLD §9 |
| TS-AUTH-09 | Administrator-only routes (`/users`, `/rules`, `/ledger`) are unreachable by other roles | Security | P1 | E2E | LLD §8.5 |
| TS-AUTH-10 | An Auditor has no write path anywhere in the API surface (sweep) | Security | P1 | API | HLD §7.1 |

## 9. F0.3 Master Ledger · F0.4 Rules Engine

| ID | Scenario | Type | Pri | Level | Traces |
|---|---|---|:--:|---|---|
| TS-LED-01 | Creating, editing and deactivating a master code each produce an audit event and a new ledger version | Functional | P1 | API | F0.3.3, F0.3.5 |
| TS-LED-02 | Master codes are deactivated, never hard-deleted | Functional | P1 | API | UF-11 |
| TS-LED-03 | Deactivating a code in use warns, naming the affected active sessions | Functional | P2 | E2E | UF-11 |
| TS-LED-04 | Ledger search filters by code, name, type and classification | Functional | P2 | E2E | F0.3.2 |
| TS-RUL-01 | A new rule is created in `Draft` and does not affect mapping until activated | Functional | P1 | Integration | F0.4.1 |
| TS-RUL-02 | Simulation previews matches against a past session and writes nothing | Functional | P1 | Integration | F0.4.5 |
| TS-RUL-03 | Rule priority is reorderable and the displayed order matches evaluation order | Functional | P1 | E2E | LLD §3.2 |
| TS-RUL-04 | Deprecating a rule stops evaluation while retaining its history and prior decisions | Functional | P2 | Integration | F0.4.4 |
| TS-RUL-05 | An invalid DSL condition is rejected at save time with a parse error naming the position | Negative | P1 | Unit | LLD §3.1 |
| TS-RUL-06 | A condition attempting anything outside the DSL grammar is rejected, with no evaluation of arbitrary input | Security | P1 | Unit | AP-5.1 |
| TS-RUL-07 | A pathological `matches` pattern is rejected or bounded, and does not hang the evaluator | Security | P1 | Unit | LLD §3.1 |
| TS-RUL-08 | Rule usage counts increment without blocking the mapping hot path | Performance | P3 | Integration | LLD §1.7 |

## 10. F2.2 Bulk Operations

| ID | Scenario | Type | Pri | Level | Traces |
|---|---|---|:--:|---|---|
| TS-BLK-01 | Multiple firm files are queued and each produces an independent session | Functional | P2 | Integration | F2.2.1 |
| TS-BLK-02 | Batch members process in parallel and the board reflects per-firm progress | Functional | P2 | E2E | F2.2.3, F2.2.5 |
| TS-BLK-03 | One firm failing does not stall the batch; the failure is attributed to that firm on the board | Resilience | P1 | Integration | UF-10 |
| TS-BLK-04 | Retry is scoped to a single failed firm | Functional | P2 | Integration | F2.2.4 |
| TS-BLK-05 | Mixed formats within one batch (CSV + XLSX + XML) all process correctly | Functional | P2 | Integration | F2.2.1 |
| TS-BLK-06 | Each firm in a batch retains its own audit trail | Functional | P1 | Integration | UF-10 |

## 11. F1.8 Notifications

| ID | Scenario | Type | Pri | Level | Traces |
|---|---|---|:--:|---|---|
| TS-NFR-01 | A validation failure raises an in-app notification to the session owner | Functional | P2 | Integration | F1.8.2, F1.8.4 |
| TS-NFR-02 | A sync failure notifies the owner and an administrator | Functional | P2 | Integration | F1.8.3 |
| TS-NFR-03 | Notification delivery failure does not affect the emitting workflow | Resilience | P1 | Integration | HLD §5.7 |
| TS-NFR-04 | Email notification content contains no legacy account names or file contents | Security | P1 | Integration | AP-3.4 |

## 12. Cross-cutting NFR

| ID | Scenario | Type | Pri | Level | Traces |
|---|---|---|:--:|---|---|
| TS-NFR-10 | One correlation id propagates from the UI request through every service, bus message and audit event | Functional | P1 | Integration | AP-7.2 |
| TS-NFR-11 | Logs contain no legacy account names or file contents at any level | Security | P1 | Integration | AP-3.4, LLD §11 |
| TS-NFR-12 | Errors from every service conform to the single error envelope, including `correlationId` | Functional | P2 | API | LLD §9 |
| TS-NFR-13 | HTTP status usage matches the LLD table — no 200 with an error body, no 500 for validation | Functional | P1 | API | LLD §9 |
| TS-NFR-14 | Losing a service pod mid-mapping resumes without a lost or duplicated session | Resilience | P1 | Resilience | AP-6.1 |
| TS-NFR-15 | Concurrent sessions across tenants remain fully isolated | Security | P1 | Integration | AP-10.10 |
| TS-NFR-16 | Every service emits metrics, structured logs and traces | Functional | P2 | Integration | AP-7.1 |
| TS-NFR-17 | Rate limiting applies at the gateway and returns 429 with `Retry-After` | Security | P2 | API | AP-2.6 |
| TS-NFR-18 | Data is encrypted in transit (TLS 1.3) and at rest | Security | P1 | Integration | AP-5.3 |

## 13. Accessibility

| ID | Scenario | Type | Pri | Level | Traces |
|---|---|---|:--:|---|---|
| TS-A11Y-01 | Every screen is fully operable by keyboard alone, in a logical order | Accessibility | P1 | E2E | DS §8 |
| TS-A11Y-02 | The focus indicator is visible on every interactive element against every background | Accessibility | P1 | E2E | `index.css` `:focus-visible` |
| TS-A11Y-03 | Status is never conveyed by colour alone — chips and confidence pills carry text | Accessibility | P1 | E2E | DS §8 |
| TS-A11Y-04 | Text and UI contrast meets WCAG 2.2 AA, including `brand-500` backgrounds with `ink-950` text | Accessibility | P1 | Automated + manual | DS §8 |
| TS-A11Y-05 | The skip link reaches `#main-content` on every screen | Accessibility | P2 | E2E | `.ds-skip-link` |
| TS-A11Y-06 | Data tables expose header associations to assistive technology | Accessibility | P2 | Automated | DS §8 |
| TS-A11Y-07 | Async status changes (mapping progress, sync outcome) are announced via a live region | Accessibility | P1 | E2E | UF §17 |
| TS-A11Y-08 | Form errors are programmatically associated with their fields | Accessibility | P1 | Automated | DS §8 |
| TS-A11Y-09 | Screens remain usable at 200% zoom and at mobile width without horizontal scroll of the page body | Accessibility | P2 | E2E | DS §7 |
| TS-A11Y-10 | Disabled controls expose the reason they are disabled | Accessibility | P2 | E2E | LLD §8.4 |

---

## 14. Coverage summary

| Area | Scenarios | P1 |
|---|:--:|:--:|
| Intake (UPL) | 11 | 6 |
| Validation (VAL) | 13 | 9 |
| Mapping (MAP) | 20 | 15 |
| Exceptions (EXC) | 9 | 3 |
| Override (OVR) | 12 | 10 |
| Sync (SYN) | 12 | 10 |
| Audit (AUD) | 12 | 9 |
| Identity/RBAC (AUTH) | 10 | 10 |
| Ledger + Rules (LED/RUL) | 12 | 8 |
| Bulk (BLK) | 6 | 2 |
| Notifications (NFR-0x) | 4 | 2 |
| Cross-cutting NFR (NFR-1x) | 9 | 6 |
| Accessibility (A11Y) | 10 | 6 |
| **Total** | **140** | **96** |

### 14.1 Story coverage

| PRD story | Scenarios |
|---|---|
| US1 Upload | TS-UPL-01…11, TS-VAL-01…13 |
| US2 AI suggestions | TS-MAP-02, -04, -05, -09, -13 |
| US3 Manual override | TS-OVR-01…12 |
| US4 Flag ambiguities | TS-EXC-01…09, TS-MAP-06, -07, -08 |
| US5 Audit report | TS-AUD-01…12 |
| US6 Cozone sync | TS-SYN-01…12 |

### 14.2 Known gaps in this scenario set

- **W3 epics (F3.1–F3.4) are not covered** — out of scope for the MVP baseline.
- **F0.1 platform scenarios** (IaC, CI/CD, provisioning) are deliberately excluded; they belong to a platform test plan, not the application suite.
- **Model quality scenarios** (AI precision/recall against a labelled corpus) are excluded — no labelled corpus exists yet (HLD risk R-2). TS-MAP-02 verifies that a suggestion is produced and explained, **not** that it is correct.
- **Retention scenarios** are absent because the retention policy is unresolved (HLD Q-1).
