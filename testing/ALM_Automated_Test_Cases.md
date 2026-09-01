# Automated Test Cases — Automated Ledger Mapping (ALM) Tool

| Field | Value |
|---|---|
| **Artifact** | Automated Test Cases (WF 3 · A5 `L1-testing-script-generator`) |
| **Derived from** | `testing/ALM_Test_Scenarios.md` |
| **Scope** | Scenarios that are deterministic and cheap to repeat — the regression safety net |
| **Status** | Draft v1.0 |

> **Current state of the repository.** `construction/alm-app` has **no test framework and no test script** (`package.json` exposes `dev`, `build`, `lint`, `preview` only), and there is no backend. Every case below is a specification to be implemented, not a description of existing tests. §1 states the tooling that must be added first.

---

## 1. Required tooling

### 1.1 Frontend (`construction/alm-app`)

| Concern | Choice | Rationale |
|---|---|---|
| Unit / component | **Vitest** + **React Testing Library** + `jsdom` | Vitest shares the existing Vite config and transform pipeline; no second build chain |
| Component assertions | `@testing-library/jest-dom` | Semantic matchers over DOM internals |
| User interaction | `@testing-library/user-event` | Realistic event sequences, keyboard included |
| API mocking | **MSW** | Intercepts at the network layer, so the same handlers serve tests and local dev |
| Accessibility | **axe-core** via `vitest-axe` | Automated WCAG checks per component and per screen |
| E2E | **Playwright** | Multi-role sessions, real keyboard, trace on failure |
| Coverage | `@vitest/coverage-v8` | |

Scripts to add:

```json
{
  "test":          "vitest run",
  "test:watch":    "vitest",
  "test:coverage": "vitest run --coverage",
  "test:e2e":      "playwright test",
  "test:a11y":     "vitest run --project a11y"
}
```

### 1.2 Backend (when the API exists)

Per `kb-L1-springboot-standards`: JUnit 5 + AssertJ for unit, Testcontainers for database and message-bus integration, WireMock for the Cozone stub, RestAssured for API contract tests, and a Pact-style consumer contract between the SPA and the API. Cases tagged **API** or **Integration** below belong here.

### 1.3 Conventions

- **ID:** `AT-<AREA>-<nn>`, traced to a `TS-*` scenario.
- **Level:** `Unit` · `Component` · `API` · `Integration` · `E2E` · `A11Y` · `Perf` · `Static`.
- Frontend files: `*.test.ts(x)` beside the unit under test; E2E in `e2e/*.spec.ts`.
- **No test may depend on another test's residue.** Each seeds and tears down its own data.
- **No sleeps.** Wait on state, never on the clock.
- Fixture builders live in `src/test/factories.ts` — never inline object literals repeated across files.

---

## 2. Unit — mapping engine (highest-value layer)

These encode the arbitration and confidence rules from `ALM_LLD.md` §4. They are pure functions and must be exhaustively covered.

| ID | Case | Given → Then | Traces |
|---|---|---|---|
| AT-MAP-01 | Rule match short-circuits AI | An account satisfying an active rule → result `matchType = 'Rule-Based'`; the AI client mock records **zero** calls | TS-MAP-01 |
| AT-MAP-02 | Confidence clamps at 100 | Base 95 + boost 20 → `confidence === 100` | TS-MAP-04 |
| AT-MAP-03 | Confidence clamps at 0 | Base 10 + boost −40 → `confidence === 0` | TS-MAP-04 |
| AT-MAP-04 | Negative boost applies | Base 80 + boost −15 → `confidence === 65` | TS-MAP-04 |
| AT-MAP-05 | Empty explanation rejected | A candidate with `explanation: ''` → the service throws / returns an error; nothing persisted | TS-MAP-05 |
| AT-MAP-06 | Tie band routes to review | Two candidates within `TIE_BAND` → `Ambiguous`, not `AutoAccept`; both candidates retained | TS-MAP-06 |
| AT-MAP-07 | Just outside the tie band auto-accepts | Gap = `TIE_BAND + 1` → `AutoAccept` | TS-MAP-06 |
| AT-MAP-08 | Boundary: gap exactly `TIE_BAND` | → `Ambiguous` (band is inclusive) | TS-MAP-06 |
| AT-MAP-09 | Below threshold routes to review | Top adjusted = `AUTO_ACCEPT_THRESHOLD − 1` → `LowConfidence` | TS-MAP-07 |
| AT-MAP-10 | Boundary: exactly at threshold | → `AutoAccept` (threshold is inclusive) | TS-MAP-07 |
| AT-MAP-11 | No candidates | Empty candidate list → `NoMatch` with `confidence = 0` and a non-empty explanation | TS-MAP-08 |
| AT-MAP-12 | Strategy priority tiebreak | Equal adjusted confidence, `Rule-Based` vs `AI Semantic` → rule wins | TS-MAP-09 |
| AT-MAP-13 | Ranking order | Three candidates → ordered by adjusted confidence descending | TS-MAP-09 |
| AT-MAP-14 | Inactive master code excluded | Candidate targets an `Inactive` code → excluded from all strategies | TS-MAP-11 |
| AT-MAP-15 | Type incompatibility gate | Legacy `Asset` vs master `Revenue` → excluded by similarity gate | TS-MAP-12 |
| AT-MAP-16 | Type compatibility allowed | Legacy `Asset` vs master `Asset` → retained | TS-MAP-12 |
| AT-MAP-17 | AI failure degrades, not fails | AI client throws → arbitration proceeds on rule + similarity; affected accounts `Ambiguous` with the degradation explanation | TS-MAP-13 |
| AT-MAP-18 | Threshold is config-driven | Same input, two threshold values → different auto-accept counts, no code change | TS-MAP-14 |
| AT-MAP-19 | Property: confidence always in range | Random valid inputs → `0 ≤ confidence ≤ 100` always | TS-MAP-04 |
| AT-MAP-20 | Property: every result carries an explanation | Random valid inputs → explanation non-empty in every branch | TS-MAP-05 |

## 3. Unit — rules engine

| ID | Case | Given → Then | Traces |
|---|---|---|---|
| AT-RUL-01 | First match wins | Two matching rules, priorities 10 and 20 → priority 10 result; evaluation stops | TS-MAP-17 |
| AT-RUL-02 | Draft rules never evaluate | A matching `Draft` rule → no match | TS-RUL-01 |
| AT-RUL-03 | Deprecated rules never evaluate | A matching `Deprecated` rule → no match | TS-RUL-04 |
| AT-RUL-04 | Each operator behaves correctly | Table-driven over `=`, `!=`, `startsWith`, `endsWith`, `contains`, `matches`, `in` | LLD §3.1 |
| AT-RUL-05 | Boolean composition | `AND`, `OR`, `NOT` and parenthesised nesting evaluate correctly | LLD §3.1 |
| AT-RUL-06 | Malformed syntax rejected at parse | `legacyCode ==== "1"` → parse error naming the position | TS-RUL-05 |
| AT-RUL-07 | Unknown field rejected | `foo = "1"` → error listing allowed fields | TS-RUL-05 |
| AT-RUL-08 | Grammar is closed | Inputs attempting anything outside the DSL → rejected; nothing evaluated | TS-RUL-06 |
| AT-RUL-09 | Pathological pattern bounded | A catastrophic-backtracking pattern → rejected or bounded; completes under a hard time budget | TS-RUL-07 |
| AT-RUL-10 | Rule targeting inactive code | Action names an inactive master code → `System Error`, not a silent bad mapping | TS-MAP-18 |
| AT-RUL-11 | Evaluator is pure | Same input twice → identical output; no internal state mutated | AP-1.4 |
| AT-RUL-12 | Simulation writes nothing | Simulate over a stored session → repository mock records zero writes | TS-RUL-02 |

## 4. Unit — intake and validation

| ID | Case | Given → Then | Traces |
|---|---|---|---|
| AT-VAL-01 | Missing required column | → `Error` naming the column | TS-VAL-02 |
| AT-VAL-02 | Empty account code | → `Error` naming the source row number | TS-VAL-03 |
| AT-VAL-03 | Non-ISO-4217 currency | → `Warning`, not `Error` | TS-VAL-04 |
| AT-VAL-04 | Orphaned parent code | → `Warning` naming the missing parent | TS-VAL-05 |
| AT-VAL-05 | Duplicate codes in file | → `Warning` naming both row numbers; **both rows retained** | TS-VAL-06 |
| AT-VAL-06 | Unmappable account type | → `Warning`; `normalised_type` null | TS-VAL-10 |
| AT-VAL-07 | Progression gate | `severity = Error` count > 0 → gate closed; warnings only → gate open | TS-VAL-07, -08 |
| AT-VAL-08 | Normalisation preserves codes | Mixed case/whitespace names normalised; **`legacy_code` byte-identical to source** | TS-VAL-10 |
| AT-VAL-09 | Whitespace does not create false duplicates | `" 1000 "` and `"1000"` → one code after normalisation, not a duplicate pair | TS-VAL-13 |
| AT-VAL-10 | Format detection | CSV / XLSX / XML fixtures each dispatch to the correct reader | TS-UPL-02, -03 |
| AT-VAL-11 | Extension/content mismatch | CSV body with `.xlsx` extension → rejected, not mis-parsed | TS-UPL-07 |
| AT-VAL-12 | Headers-only file | → rejected; no session created | TS-UPL-06 |
| AT-VAL-13 | Stage idempotency | Each stage applied twice over one chunk → identical state, no duplicate rows | TS-VAL-11 |
| AT-VAL-14 | Parity across formats | Same logical data as CSV, XLSX and XML → identical parsed output | TS-UPL-02, -03 |

## 5. Unit — state machine and guards

| ID | Case | Given → Then | Traces |
|---|---|---|---|
| AT-STM-01 | Legal transitions accepted | Table-driven over every row of `ALM_HLD.md` §4 | HLD §4 |
| AT-STM-02 | Illegal transitions rejected | Every (from, to) pair absent from the table → rejected with conflict | HLD §4 |
| AT-STM-03 | Mapping → InReview branch | `pendingReview > 0` → `InReview` | TS-MAP-10 |
| AT-STM-04 | Mapping → Approved branch | `pendingReview === 0` → `Approved` | TS-MAP-10 |
| AT-STM-05 | Validating → Failed on errors | ≥1 `Error` issue → `Failed` | TS-VAL-08 |
| AT-STM-06 | Approval blocked by open exceptions | Any unresolved exception → approval rejected | TS-SYN-01 |
| AT-STM-07 | Segregation of duties guard | `approver === proposer` → rejected 403 with the SoD reason | TS-OVR-03 |
| AT-STM-08 | Approver role guard | `Accountant` approving → rejected 403 | TS-OVR-05 |
| AT-STM-09 | Empty justification guard | Blank justification → rejected 422 | TS-OVR-02 |
| AT-STM-10 | Stale version guard | Submitted `version` < current → 409, no write | TS-OVR-11 |
| AT-STM-11 | Deactivated target guard | Override to a since-deactivated code → 422 | TS-OVR-10 |
| AT-STM-12 | Exhaustive enum coverage | A compile-time exhaustive switch over `SessionStatus` — adding a member breaks the build | LLD §1.2 |

## 6. Component — UI primitives (`src/components/ui.tsx`)

| ID | Case | Given → Then | Traces |
|---|---|---|---|
| AT-UI-01 | `Chip` pairs colour with text | Every variant renders a text label, not colour alone | TS-A11Y-03 |
| AT-UI-02 | `ConfidencePill` shows a value | Renders the numeric confidence as text | TS-A11Y-03 |
| AT-UI-03 | `Button` loading disables interaction | `loading` → `disabled`, and `onClick` is not fired | — |
| AT-UI-04 | `Button` variants keep accessible contrast | axe check per variant, light and dark surfaces | TS-A11Y-04 |
| AT-UI-05 | `DataTable` associates headers | Header cells are exposed as column headers | TS-A11Y-06 |
| AT-UI-06 | `EmptyState` renders title and body | — | TS-EXC-08 |
| AT-UI-07 | `AlertBanner` types are distinguishable without colour | Each type carries text/icon | TS-A11Y-03 |
| AT-UI-08 | `ProgressBar` exposes value to AT | `role="progressbar"` with min/max/now | TS-A11Y-07 |
| AT-UI-09 | `TabBar` is keyboard operable | Arrow keys move, Enter/Space activate | TS-A11Y-01 |
| AT-UI-10 | Focus ring present on every primitive | axe + computed-style assertion | TS-A11Y-02 |

## 7. Component — screens (MSW-backed)

Each screen is asserted in all four data states (`ALM_LLD.md` §8.2).

| ID | Screen | Cases | Traces |
|---|---|---|---|
| AT-SCR-01 | Upload | Extension rejected pre-submit · oversize rejected · submit disabled until firm + file present · submit posts once (no double-submit) | TS-UPL-04, -05 |
| AT-SCR-02 | Validation | Errors block proceed · warnings allow proceed with banner · issue rows show row number · CSV export invoked | TS-VAL-07, -08, -09 |
| AT-SCR-03 | Mapping Review | Every row renders an explanation · counts reconcile to total · filters narrow correctly · bulk accept states the affected count before committing | TS-MAP-05, ALM-MTC-005 |
| AT-SCR-04 | Exception Queue | Default sort priority-then-age · filters · empty state · claim updates assignee | TS-EXC-02, -03, -04, -08 |
| AT-SCR-05 | Workbench | Submit disabled while justification empty · ledger search excludes inactive codes · rejected suggestion shown for context | TS-OVR-02, -09 |
| AT-SCR-06 | Cozone Sync | `Partial` renders failure count as prominently as success · retry action scoped to failed subset · `Failed` states a reason | TS-SYN-05, -06, -08 |
| AT-SCR-07 | Audit Report | Overrides rendered distinctly · timeline chronological · both export actions present | TS-AUD-06, -07, -09 |
| AT-SCR-08 | Dashboard | Alert deep-links to the resolving screen · stage progress never exceeds server-reported state | ALM-MTC-028 |
| AT-SCR-09 | Rules Engine | Priority order displayed with "lower first" stated · simulate does not mutate · draft badge visible | TS-RUL-01, -03 |
| AT-SCR-10 | Master Ledger | No hard-delete control exists in the DOM · deactivate present · search filters | TS-LED-02, -04 |
| AT-SCR-11 | All 16 screens | Loading, empty, error and populated states each render without crashing | LLD §8.2 |
| AT-SCR-12 | All 16 screens | 401 from any call surfaces re-authentication, not a blank screen | TS-AUTH-06 |

## 8. Component — RBAC and routing

| ID | Case | Given → Then | Traces |
|---|---|---|---|
| AT-RBAC-01 | Unauthenticated redirect | No token, render `/dashboard` → redirected to `/login` | TS-AUTH-03 |
| AT-RBAC-02 | Intended path preserved | Blocked at `/exceptions`, then authenticate → landed on `/exceptions` | TS-AUTH-03 |
| AT-RBAC-03 | Admin routes guarded | `Accountant` at `/users`, `/rules`, `/ledger` → denied | TS-AUTH-09 |
| AT-RBAC-04 | Auditor has no write controls | Render every screen as `Auditor` → **zero** Accept/Override/Approve/Sync/Retry/Edit controls in the DOM | TS-AUD-10 |
| AT-RBAC-05 | Capability matrix, table-driven | The full RBAC matrix as a test table across all four roles | TS-AUTH-04 |
| AT-RBAC-06 | Disabled controls state a reason | Every disabled control has an accessible reason | TS-A11Y-10 |
| AT-RBAC-07 | Unknown route | `/nonsense` → redirect per routing spec | App.tsx |

> AT-RBAC-01…04 are expected to **fail on the current build** — no guard exists (`ALM_LLD.md` §8.5). They are written now so implementing the guard turns them green.

## 9. API contract

| ID | Case | Traces |
|---|---|---|
| AT-API-01 | Every endpoint conforms to the published OpenAPI schema (request and response) | AP-2.1 |
| AT-API-02 | Error responses conform to the single envelope, `correlationId` always present | TS-NFR-12 |
| AT-API-03 | Status codes match the LLD table; no 200-with-error-body, no 500 for validation | TS-NFR-13 |
| AT-API-04 | 415 on unsupported format, 413 on oversize | TS-UPL-04, -05 |
| AT-API-05 | 401 unauthenticated, 403 wrong role, on every protected route (sweep) | TS-AUTH-04 |
| AT-API-06 | Cross-tenant access returns 404, never 403 | TS-AUTH-08 |
| AT-API-07 | Auditor role receives 403 on every mutating endpoint (sweep) | TS-AUTH-10 |
| AT-API-08 | Direct call to a UI-disabled action is still rejected | TS-AUTH-05 |
| AT-API-09 | 429 with `Retry-After` when rate limited | TS-NFR-17 |
| AT-API-10 | Illegal state transition returns 409 | AT-STM-02 |
| AT-API-11 | Suspended user's token is rejected after suspension | TS-AUTH-07 |
| AT-API-12 | Consumer contract: the SPA's expectations are verified against the provider | AP-2.1, AP-2.3 |

## 10. Integration (Testcontainers + WireMock)

| ID | Case | Traces |
|---|---|---|
| AT-INT-01 | Upload → validate → map → review → approve → sync, in one pass over TD-01 | US1–US6 |
| AT-INT-02 | `ledger_version` pinned at session start; mid-session ledger edits do not alter results | TS-UPL-09, TS-MAP-15 |
| AT-INT-03 | Duplicate `legacy.validated` delivery does not double-map | TS-MAP-20 |
| AT-INT-04 | `mapping.generated` emitted exactly once, with the correct ambiguity count | TS-MAP-16 |
| AT-INT-05 | Export replay with the same idempotency key does not double-post (WireMock request count) | TS-SYN-04 |
| AT-INT-06 | Partial failure yields `Partial` with accurate counts | TS-SYN-05 |
| AT-INT-07 | Retry failed subset only; successful records are not re-posted | TS-SYN-06 |
| AT-INT-08 | Transient 5xx/429/timeout retried with backoff; 4xx quarantined, not retried | TS-SYN-07 |
| AT-INT-09 | Poisoned record does not block the batch | TS-SYN-09 |
| AT-INT-10 | Retry budget exhausted → `Failed` with a reason; retry remains available | TS-SYN-08 |
| AT-INT-11 | Approved override supersedes the prior decision into history; the prior row is not updated | TS-OVR-06 |
| AT-INT-12 | Audit store rejects UPDATE and DELETE at the database grant level | TS-AUD-03 |
| AT-INT-13 | Hash chain verifies; a tampered row is detected | TS-AUD-04 |
| AT-INT-14 | Report regenerated for the same `(session, mappingVersion)` is byte-identical | TS-AUD-08 |
| AT-INT-15 | Correlation id propagates through every service, bus message and audit event | TS-NFR-10 |
| AT-INT-16 | Log scan asserts **no** account name or file content at any level | TS-NFR-11 |
| AT-INT-17 | Notification failure does not affect the emitting workflow | TS-NFR-03 |
| AT-INT-18 | Notification payloads contain no account names | TS-NFR-04 |
| AT-INT-19 | Tenant isolation: tenant A cannot read tenant B's sessions by any route | TS-NFR-15 |
| AT-INT-20 | Pod kill mid-mapping → session resumes, no duplicate or lost decisions | TS-NFR-14 |
| AT-INT-21 | AI stub unavailable → mapping completes, degradation metric emitted, rows flagged | TS-MAP-13 |
| AT-INT-22 | Bulk: one firm fails, others complete; retry scoped to the failed firm | TS-BLK-03, -04 |
| AT-INT-23 | Each firm in a batch has an independent audit trail | TS-BLK-06 |
| AT-INT-24 | Every service emits metrics, structured logs and traces | TS-NFR-16 |

## 11. E2E (Playwright)

Kept deliberately few — E2E covers journeys, not rules.

| ID | Journey | Steps | Traces |
|---|---|---|---|
| AT-E2E-01 | **Happy path** | U-FM: sign in → upload TD-01 → validation clean → accept suggestions → approve → sync → audit report → export PDF | UF-02, -04, -07, -08 |
| AT-E2E-02 | **Override with two roles** | U-ACC claims and proposes with justification; U-ACC's self-approval is rejected; U-FM approves; audit report shows both actors | UF-06, TS-OVR-03 |
| AT-E2E-03 | **Blocked validation recovery** | Upload TD-03 → proceed blocked → export issues → re-upload TD-01 → proceeds | UF-03 |
| AT-E2E-04 | **Partial sync recovery** | Sync with a failing subset → `Partial` → retry failed only → `Synced`; Cozone stub shows no double-post | TS-SYN-05, -06 |
| AT-E2E-05 | **Auditor read-only sweep** | U-AUD visits all 16 screens; assert zero mutating controls; exports a report successfully | TS-AUD-10 |
| AT-E2E-06 | **Concurrent conflict** | Two browser contexts open one exception; second submit shows a human-readable already-resolved message | TS-EXC-05 |
| AT-E2E-07 | **Bulk batch with one failure** | Four firms, one failing; others complete; retry the failed firm | TS-BLK-03 |
| AT-E2E-08 | **Rule lifecycle** | U-ADM creates a draft → simulates (no writes) → activates → new session reflects it → deprecates | TS-RUL-01, -02 |
| AT-E2E-09 | **Keyboard-only happy path** | AT-E2E-01 driven entirely by keyboard | TS-A11Y-01 |
| AT-E2E-10 | **Session expiry** | Expire the token mid-journey → re-auth prompt → resume without data loss | TS-AUTH-06 |

## 12. Accessibility (automated)

| ID | Case | Traces |
|---|---|---|
| AT-A11Y-01 | axe scan on all 16 screens, zero critical or serious violations | TS-A11Y-04, -06, -08 |
| AT-A11Y-02 | axe scan on every `ui.tsx` primitive in every variant | TS-A11Y-04 |
| AT-A11Y-03 | Contrast assertion for every design-token pairing in use, incl. `brand-500` + `ink-950` | TS-A11Y-04 |
| AT-A11Y-04 | Skip link reaches `#main-content` on every screen | TS-A11Y-05 |
| AT-A11Y-05 | Every interactive element has a visible focus indicator | TS-A11Y-02 |
| AT-A11Y-06 | Every form error is programmatically associated with its field | TS-A11Y-08 |
| AT-A11Y-07 | Async status changes are announced through a live region | TS-A11Y-07 |
| AT-A11Y-08 | No page-body horizontal scroll at 320px, 768px and 200% zoom | TS-A11Y-09 |

## 13. Static and performance

| ID | Case | Level | Traces |
|---|---|---|---|
| AT-ST-01 | `npm run build` passes — `tsc -b` is the typecheck gate | Static | — |
| AT-ST-02 | `npm run lint` (oxlint) passes with zero errors | Static | — |
| AT-ST-03 | No Cozone type is imported outside the adapter component | Static | TS-SYN-10 |
| AT-ST-04 | `src/pages/**` contains no direct `fetch` call — all API access via `api/*` | Static | LLD §8.1 |
| AT-ST-05 | No raw hex colours in `src/**` — design tokens only | Static | DS §3 |
| AT-ST-06 | `SessionStatus` and the other unions in `src/types/index.ts` match the API schema enums | Static | LLD §1.2 |
| AT-ST-07 | Dependency and container vulnerability scan passes | Static | AP-10.9 |
| AT-PERF-01 | A full firm ledger completes mapping within the session SLA | Perf | TS-MAP-19 |
| AT-PERF-02 | Upload memory stays flat as file size grows | Perf | TS-UPL-08 |
| AT-PERF-03 | Audit report generation for a large session does not block the request thread | Perf | TS-AUD-12 |
| AT-PERF-04 | Concurrent multi-tenant sessions sustain throughput without cross-tenant slowdown | Perf | TS-NFR-15 |

---

## 14. Automation coverage and pipeline

| Level | Cases | Runs on |
|---|:--:|---|
| Unit | 58 | Every commit |
| Component | 29 | Every commit |
| Static | 7 | Every commit |
| A11Y (automated) | 8 | Every commit |
| API contract | 12 | Every PR |
| Integration | 24 | Every PR (nightly for the full set) |
| E2E | 10 | Every PR (smoke: AT-E2E-01, -02) |
| Performance | 4 | Nightly and pre-release |
| **Total** | **152** | |

### 14.1 Gates

| Gate | Requirement |
|---|---|
| Commit | Unit + component + static + a11y green; coverage not decreasing |
| PR merge | Add API contract + integration + E2E smoke green |
| Release candidate | Full integration + full E2E + performance green; zero P1 scenarios failing |
| Coverage floor | Arbitration, confidence, DSL evaluation and state-machine guards at 100% branch coverage — they encode the money-critical rules |

### 14.2 Deliberately not automated

| Area | Why | Covered by |
|---|---|---|
| AI suggestion *correctness* | No labelled corpus exists (HLD R-2); asserting on model output would encode today's model as truth | Manual review; F3.3 continuous learning once a corpus exists |
| Visual design fidelity | Brittle and low-value against a design system that is still moving | ALM-MTC-024, -025; visual regression deferred |
| Screen-reader narration quality | Automation checks structure, not comprehensibility | ALM-MTC-025 |
| PDF layout and legibility | Structure is asserted; readability is a human judgement | ALM-MTC-014 |
| Real Cozone integration | External system, contract unfixed (HLD R-1) | WireMock stub + a manual pre-release connectivity check |
| Platform concerns (IaC, CI/CD) | Belongs to a platform test plan, not the application suite | F0.1 platform pipeline |

### 14.3 Implementation order

1. **AT-ST-01/02** — wire up Vitest and get `npm test` green with a placeholder; the repo has no test command today.
2. **AT-MAP-*, AT-RUL-*, AT-VAL-*, AT-STM-*** — pure-logic units. Highest defect yield per hour, and they can be written against the LLD before the backend exists.
3. **AT-UI-*, AT-A11Y-01/02** — component and accessibility baseline over the existing `ui.tsx`, which is testable today.
4. **AT-SCR-*** with MSW — replaces `src/data/mock.ts` as the source of screen data and prepares the `api/*` layer.
5. **AT-RBAC-*** — written to fail, then made to pass by implementing `<RequireAuth>`/`<RequireRole>`.
6. **AT-API-*, AT-INT-*** — as backend services land.
7. **AT-E2E-*, AT-PERF-*** — once a deployable environment exists.

Steps 1–4 are actionable against the repository as it stands today; steps 5–7 depend on work not yet built.
