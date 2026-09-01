# Manual Test Cases — Automated Ledger Mapping (ALM) Tool

| Field | Value |
|---|---|
| **Artifact** | Manual Test Cases (WF 3 · A5 `L1-testing-case-writer`) |
| **Derived from** | `testing/ALM_Test_Scenarios.md` |
| **Scope** | Scenarios requiring human judgement, visual assessment, or a UI path not economically automatable |
| **Target tool** | Jira / Xray (`ALM-MTC-*` ↔ scenario `TS-*`) |
| **Status** | Draft v1.0 |

## Test data prerequisites

| Ref | Fixture | Contents |
|---|---|---|
| **TD-01** | `muldoon-clean.csv` | ~3,800 rows, well-formed, mixed account types, single currency |
| **TD-02** | `muldoon-warnings.csv` | TD-01 plus 12 rows with unknown currency codes and 4 orphaned parent codes |
| **TD-03** | `muldoon-errors.csv` | TD-01 with the `AccountName` column removed and 3 rows with empty codes |
| **TD-04** | `hartley-clean.xlsx` | ~1,200 rows, XLSX, to prove format parity |
| **TD-05** | `redwood-clean.xml` | ~890 rows, XML, to prove format parity |
| **TD-06** | `duplicates.csv` | 40 rows containing 6 duplicated legacy codes |
| **TD-07** | `ambiguous.csv` | 60 rows engineered to sit in the tie band and below the auto-accept threshold |
| **TD-08** | `oversize.csv` | One row above `MAX_UPLOAD_BYTES` |
| **TD-09** | `mislabelled.xlsx` | A CSV body with an `.xlsx` extension |
| **TD-10** | `headers-only.csv` | Header row, zero data rows |

## User accounts

| Ref | User | Role |
|---|---|---|
| **U-FM** | Priya Sharma | FinanceManager |
| **U-ACC** | Raj Patel | Accountant |
| **U-AUD** | Sarah Mitchell | Auditor |
| **U-ADM** | Tom Barnes | Administrator |
| **U-SUS** | Ben Walsh | Accountant, `Suspended` |

---

## ALM-MTC-001 — Upload a valid CSV end to end

**Traces:** TS-UPL-01, TS-VAL-01 · **Priority:** P1 · **Type:** Functional · **As:** U-FM

**Preconditions:** signed in as U-FM; TD-01 available; master ledger populated and active.

| # | Step | Expected result |
|---|---|---|
| 1 | From Dashboard, click **+ New Upload** | Upload screen opens; firm/acquisition context field is focused |
| 2 | Enter firm name "Muldoon & Co" | Value accepted; no validation error |
| 3 | Select TD-01 | Filename, size and detected format `CSV` are displayed; **Submit** becomes enabled |
| 4 | Click **Submit** | Confirmation of receipt; automatic navigation to Validation; session id is displayed |
| 5 | Observe the Validation screen while processing | A progress indication reflecting server-reported status appears; it does **not** show 100% before completion |
| 6 | Wait for validation to finish | Zero errors, zero warnings reported; **Proceed to mapping** is enabled |
| 7 | Note the session id and status | Status is `Validating` then `Mapping`; row count matches TD-01's row count exactly |

**Postcondition:** one session exists in `Mapping` or later, with `total_accounts` equal to TD-01's row count.

---

## ALM-MTC-002 — Format parity across CSV, XLSX and XML

**Traces:** TS-UPL-02, TS-UPL-03 · **Priority:** P1 · **Type:** Functional · **As:** U-FM

| # | Step | Expected result |
|---|---|---|
| 1 | Upload TD-04 (XLSX) for firm "Hartley Partners" | Accepted; detected format shown as `XLSX` |
| 2 | Record `total_accounts`, account-type distribution and validation issue count | Values recorded |
| 3 | Upload TD-05 (XML) for firm "Redwood Accounting" | Accepted; detected format shown as `XML` |
| 4 | Record the same three measures | Values recorded |
| 5 | Compare each against the equivalent CSV run | Parsed row counts and type distributions match their CSV equivalents; no format-specific issues appear |

---

## ALM-MTC-003 — Errors block progression; warnings do not

**Traces:** TS-VAL-04, TS-VAL-07, TS-VAL-08 · **Priority:** P1 · **Type:** Negative · **As:** U-FM

| # | Step | Expected result |
|---|---|---|
| 1 | Upload TD-03 (missing column, empty codes) | Validation completes with `Error`-severity issues listed |
| 2 | Inspect the issue table | Each row shows source row number, account code, issue text and severity; the missing-column error names the column |
| 3 | Attempt to proceed to mapping | Action is **disabled or blocked**, with a message explaining that errors must be fixed |
| 4 | Confirm severity is distinguishable without relying on colour | `Error` and `Warning` are distinguished by text/icon as well as colour |
| 5 | Click **Export issue list** | A CSV downloads containing row, code, issue and severity |
| 6 | Click **Upload corrected file** | Upload screen opens with the firm context pre-filled |
| 7 | Upload TD-02 (warnings only) | Validation completes; a banner states how many rows will be flagged for review |
| 8 | Proceed to mapping | Permitted; session advances to `Mapping` |

---

## ALM-MTC-004 — Upload rejections

**Traces:** TS-UPL-04, TS-UPL-05, TS-UPL-06, TS-UPL-07 · **Priority:** P1/P2 · **Type:** Negative · **As:** U-FM

| # | Step | Expected result |
|---|---|---|
| 1 | Attempt to select a `.pdf` file | Rejected before submit with a message naming the accepted formats; Submit stays disabled |
| 2 | Attempt to select TD-08 (oversize) | Rejected with a message naming the size cap |
| 3 | Upload TD-10 (headers only) | Rejected with a clear "no data rows" message; **no empty session is created** |
| 4 | Upload TD-09 (CSV body, `.xlsx` extension) | Rejected as unreadable/mismatched — **not** silently mis-parsed or partially imported |
| 5 | Check the session list after each attempt | No session is left in a stuck `Uploading` state |

---

## ALM-MTC-005 — Review AI mapping suggestions

**Traces:** TS-MAP-02, TS-MAP-05, TS-MAP-09 · **Priority:** P1 · **Type:** Functional · **As:** U-FM

**Preconditions:** a session from ALM-MTC-001 has completed mapping.

| # | Step | Expected result |
|---|---|---|
| 1 | Open Mapping Review for the session | Header shows total accounts, auto-mapped %, pending review and errors; the numbers are internally consistent (auto-mapped + pending + errors reconcile to total) |
| 2 | Inspect any suggestion row | Shows legacy code and name, suggested master code and name, match type, confidence, and an explanation |
| 3 | Scan 20 rows for an empty explanation | **Every** row has a non-empty explanation — this is a hard requirement, not a nicety |
| 4 | Compare a `Rule-Based` row against an `AI Semantic` row | Match type is clearly distinguishable; the rule-based explanation names the rule |
| 5 | Sort/filter by confidence | Ordering is correct; filter counts match the displayed rows |
| 6 | Filter to each match type in turn | Only rows of that type appear |
| 7 | Accept a single high-confidence row | Row status becomes `Accepted`; the pending count decreases by exactly one |
| 8 | Use **Accept all above threshold** | A confirmation states the exact number of records affected before committing |

---

## ALM-MTC-006 — Ambiguous mappings route to review

**Traces:** TS-MAP-06, TS-MAP-07, TS-MAP-08, TS-EXC-01 · **Priority:** P1 · **Type:** Functional · **As:** U-FM

| # | Step | Expected result |
|---|---|---|
| 1 | Upload TD-07 (engineered ambiguities) and let mapping complete | Session status becomes `InReview`, not `Approved` |
| 2 | Note the pending review count | Greater than zero and equal to the number of engineered ambiguous rows |
| 3 | Open the Exception Queue | Exceptions exist for the session |
| 4 | Verify exception types | Tie-band rows appear as `Ambiguous Mapping`; rows with no candidate appear as `No Match` — **not** as a blank mapping |
| 5 | Verify priorities | Assigned per the ambiguity policy; `No Match` rows are High |
| 6 | Attempt to approve the session | Blocked while exceptions remain unresolved, with a message saying so |

---

## ALM-MTC-007 — Duplicate legacy codes are reported, not dropped

**Traces:** TS-VAL-06 · **Priority:** P1 · **Type:** Functional · **As:** U-FM

| # | Step | Expected result |
|---|---|---|
| 1 | Upload TD-06 (6 duplicated codes) | Upload accepted |
| 2 | Check validation warnings | Duplicate warnings appear, naming the code and the conflicting row numbers |
| 3 | Check `total_accounts` against TD-06's row count | Equal — **no row was silently discarded** |
| 4 | Open the Exception Queue | `Duplicate` exceptions exist, one per duplicated code group |

---

## ALM-MTC-008 — Manual override with segregation of duties

**Traces:** TS-OVR-01, TS-OVR-02, TS-OVR-03, TS-OVR-04, TS-OVR-09 · **Priority:** P1 · **Type:** Functional + Security

**Preconditions:** a session in `InReview` with at least one `Ambiguous Mapping` exception.

| # | Step | Actor | Expected result |
|---|---|---|---|
| 1 | Open the Exception Queue, claim a High-priority exception | U-ACC | `assignedTo` shows Raj |
| 2 | Open the item in the Workbench | U-ACC | Legacy account detail, the rejected suggestion with its explanation, and master ledger search are all visible |
| 3 | Search the master ledger | U-ACC | Type-ahead returns matches; **only active codes appear** |
| 4 | Select a master code, leave justification empty, attempt to submit | U-ACC | Submit is **disabled or rejected**; the justification requirement is stated |
| 5 | Enter a justification and submit | U-ACC | Override recorded as `Proposed`; the item is routed for approval |
| 6 | Attempt to approve own proposal | U-ACC | **Rejected**, with a reason referring to segregation of duties — not a generic error |
| 7 | Sign in and open the same item | U-FM | Proposer's justification, the original AI suggestion and the chosen code are visible side by side |
| 8 | Approve | U-FM | Status `Overridden`; the exception is resolved; the pending count decreases |
| 9 | Return to Mapping Review and locate the account | U-FM | Final master code is the overridden code, marked as an override |

---

## ALM-MTC-009 — Override rejection returns the item for rework

**Traces:** TS-OVR-08 · **Priority:** P2 · **Type:** Functional

| # | Step | Actor | Expected result |
|---|---|---|---|
| 1 | Propose an override with a justification | U-ACC | Status `Proposed` |
| 2 | Reject the proposal with a reason | U-FM | Item returns to `Pending`; the original justification is retained and visible |
| 3 | Check notifications | U-ACC | An in-app notification of the rejection, including the reason |
| 4 | Re-propose with a different master code | U-ACC | Accepted; a new proposal supersedes the prior attempt without losing its history |

---

## ALM-MTC-010 — Concurrent resolution conflict

**Traces:** TS-EXC-05, TS-OVR-11 · **Priority:** P1 · **Type:** Negative

**Requires two browser sessions open simultaneously.**

| # | Step | Expected result |
|---|---|---|
| 1 | As U-ACC and U-FM, open the **same** exception in two sessions | Both load successfully |
| 2 | As U-FM, accept the suggestion | Resolved successfully |
| 3 | As U-ACC, submit an override on the now-stale item | **Rejected with a human-readable message** naming who resolved it — not a raw 409, stack trace or silent no-op |
| 4 | Refresh the queue as U-ACC | The item no longer appears as open; counts are correct |

---

## ALM-MTC-011 — Approve and sync to Cozone (happy path)

**Traces:** TS-SYN-02, TS-SYN-03 · **Priority:** P1 · **Type:** Functional · **As:** U-FM

| # | Step | Expected result |
|---|---|---|
| 1 | With all exceptions resolved, click **Approve session** | A confirmation modal restates total accounts, overrides applied and target ledger version |
| 2 | Cancel the modal | Session remains `InReview`/unapproved; nothing was sent |
| 3 | Re-open and confirm | Status becomes `Approved` |
| 4 | Open Cozone Sync and click **Start sync** | Status becomes `Syncing`; progress reflects server state |
| 5 | Wait for completion | Status `Synced`; exported count equals the final mapping count; failures are zero |
| 6 | Note the success panel | Offers a **View audit report** action |

---

## ALM-MTC-012 — Partial sync is never presented as success

**Traces:** TS-SYN-05, TS-SYN-06 · **Priority:** P1 · **Type:** Negative · **As:** U-FM

**Preconditions:** Cozone stub configured to fail a known subset of records.

| # | Step | Expected result |
|---|---|---|
| 1 | Sync an approved session with the failing subset | Result shows status `Partial` |
| 2 | Inspect the outcome panel | Failure count is as prominent as the success count; the wording does not read as success |
| 3 | Inspect the failed-record table | Each failed record and its reason are listed |
| 4 | Click **Retry failed only** | Only the failed subset is re-attempted; the successful count does not increase beyond the total |
| 5 | Verify in the Cozone stub | Previously successful records were **not** posted a second time |
| 6 | Let the retry succeed | Status becomes `Synced` with zero failures |

---

## ALM-MTC-013 — Sync failure and authorised retry

**Traces:** TS-SYN-08, TS-SYN-12 · **Priority:** P1 · **Type:** Resilience

| # | Step | Actor | Expected result |
|---|---|---|---|
| 1 | Make the Cozone stub unavailable, then start a sync | U-FM | Retries occur, then status `Failed` with a stated reason — not a silent stall |
| 2 | Attempt retry | U-ACC | Not permitted for this role |
| 3 | Restore the stub and retry | U-FM | Sync proceeds and completes; no duplicate posting occurs |
| 4 | Check notifications | U-ADM | A sync-failure notification was received |

---

## ALM-MTC-014 — Audit report is defensible and reproducible

**Traces:** TS-AUD-05, TS-AUD-06, TS-AUD-07, TS-AUD-08, TS-AUD-09 · **Priority:** P1 · **Type:** Functional · **As:** U-FM

**Preconditions:** a synced session containing at least one approved override.

| # | Step | Expected result |
|---|---|---|
| 1 | Open the Audit Report for the session | Summary shows firm, totals, auto-map rate, override count and sync outcome |
| 2 | Inspect the decision table | Every account appears with its final master code, match type and decider |
| 3 | Locate the override | Presented **distinctly** from auto-accepted mappings, with proposer, approver, justification and timestamp |
| 4 | Inspect the event timeline | Upload → validation → mapping → override → approval → sync, in chronological order with actors |
| 5 | Export PDF | Contains summary, decisions, overrides and timeline; is legible and paginated |
| 6 | Export CSV | Opens in a spreadsheet with all decision columns intact |
| 7 | Re-export the PDF | Content is identical to step 5 — same decisions, same ordering, same values |

---

## ALM-MTC-015 — Auditor is read-only everywhere

**Traces:** TS-AUD-10, TS-AUTH-10 · **Priority:** P1 · **Type:** Security · **As:** U-AUD

| # | Step | Expected result |
|---|---|---|
| 1 | Sign in as U-AUD | Landing view shows completed sessions and reports |
| 2 | Visit Dashboard, Mapping Review, Exception Queue, Workbench, Sync, Audit, History | All are readable |
| 3 | On each screen, look for action controls (Accept, Override, Approve, Start sync, Retry, Edit) | **No action controls are present** — absent, not merely disabled |
| 4 | Open an Audit Report and export both PDF and CSV | Both succeed — read and export are permitted |
| 5 | Attempt to reach `/users`, `/rules`, `/ledger` by URL | Access denied or redirected; no admin surface is rendered |

---

## ALM-MTC-016 — Unauthenticated and unauthorised access

**Traces:** TS-AUTH-03, TS-AUTH-06, TS-AUTH-09 · **Priority:** P1 · **Type:** Security

> **Known defect:** the current build registers app routes with no auth guard, so steps 1–3 are expected to **fail** until `<RequireAuth>` is implemented (LLD §8.5).

| # | Step | Expected result |
|---|---|---|
| 1 | Sign out, then navigate directly to `/dashboard` | Redirected to `/login` |
| 2 | Navigate directly to `/exceptions` | Redirected to `/login`; the intended path is retained |
| 3 | Sign in as U-FM | Landed on `/exceptions` — the originally intended path |
| 4 | As U-ACC, navigate to `/users` | Access denied; no user list is rendered |
| 5 | As U-FM, let the session token expire, then act | A re-authentication prompt appears; no blank screen and no lost input without warning |
| 6 | Attempt to sign in as U-SUS (suspended) | Rejected with "contact your administrator"; no session is established |

---

## ALM-MTC-017 — RBAC matrix walkthrough

**Traces:** TS-AUTH-04 · **Priority:** P1 · **Type:** Security

For each of U-FM, U-ACC, U-AUD, U-ADM, confirm the observed capability set matches the RBAC matrix in `ALM_HLD.md` §7.1.

| Capability | U-FM | U-ACC | U-AUD | U-ADM |
|---|:--:|:--:|:--:|:--:|
| Upload legacy file | ✅ | ✅ | ✖ | ✅ |
| Propose override | ✅ | ✅ | ✖ | ✅ |
| Approve override | ✅ | ✖ | ✖ | ✅ |
| Approve session | ✅ | ✖ | ✖ | ✅ |
| Trigger / retry sync | ✅ | ✖ | ✖ | ✅ |
| View + export audit report | ✅ | ✅ | ✅ | ✅ |
| Edit master ledger | ✖ | ✖ | ✖ | ✅ |
| Edit mapping rules | ✖ | ✖ | ✖ | ✅ |
| Manage users | ✖ | ✖ | ✖ | ✅ |

Where a capability is denied, confirm the control is either absent or **disabled with a stated reason** — never present and silently inert.

---

## ALM-MTC-018 — Rule simulation before activation

**Traces:** TS-RUL-01, TS-RUL-02, TS-RUL-03 · **Priority:** P1 · **Type:** Functional · **As:** U-ADM

| # | Step | Expected result |
|---|---|---|
| 1 | Open Rules Engine | Rules are listed in priority order; the screen states that lower priority evaluates first |
| 2 | Create a rule with a valid condition, save as `Draft` | Saved; status `Draft` |
| 3 | Run a mapping session while the rule is `Draft` | The draft rule has **no effect** on outcomes |
| 4 | Click **Simulate** against a past session | A preview shows which accounts the rule would match and the delta vs the live rule set; **nothing is written** |
| 5 | Verify the past session is unchanged after simulating | Its decisions and counts are identical to before |
| 6 | Activate the rule | Status `Active`; a version is recorded |
| 7 | Re-run a mapping session | The rule now applies; matched rows show `Rule-Based` with an explanation naming the rule |
| 8 | Reorder rule priority and re-run | The higher-priority rule wins where both match |
| 9 | Deprecate the rule | It stops evaluating; prior decisions and its history remain intact |

---

## ALM-MTC-019 — Invalid rule conditions are rejected safely

**Traces:** TS-RUL-05, TS-RUL-06, TS-RUL-07 · **Priority:** P1 · **Type:** Security · **As:** U-ADM

| # | Step | Expected result |
|---|---|---|
| 1 | Save a rule with malformed syntax (`legacyCode ==== "1"`) | Rejected at save with a parse error indicating where |
| 2 | Save a rule referencing an unknown field (`foo = "1"`) | Rejected; the allowed fields are listed |
| 3 | Save a rule attempting an expression outside the grammar | Rejected; nothing outside the DSL is evaluated |
| 4 | Save a rule with a pathological `matches` pattern | Rejected, or accepted with a bounded evaluation that does not hang |
| 5 | Confirm the UI stays responsive throughout | No hang; no unhandled error surface |

---

## ALM-MTC-020 — Master ledger changes are versioned and non-destructive

**Traces:** TS-LED-01, TS-LED-02, TS-LED-03, TS-UPL-09, TS-MAP-15 · **Priority:** P1 · **Type:** Functional · **As:** U-ADM

| # | Step | Expected result |
|---|---|---|
| 1 | Search the master ledger by code, name, type and classification | Filters return correct subsets |
| 2 | Create a new master code | Saved; an audit event is recorded; a new ledger version exists |
| 3 | Look for a hard-delete action | **None exists** — only deactivate |
| 4 | Start a mapping session, and while it is in progress deactivate a code it uses | A warning names the affected active sessions |
| 5 | Let the in-flight session finish mapping | It used the ledger version pinned at its start; the deactivation did not change its results |
| 6 | Start a new session | It uses the new ledger version; the deactivated code is no longer suggested |
| 7 | Search for the deactivated code in the Workbench | It does not appear as a selectable target |

---

## ALM-MTC-021 — Exception queue workflow

**Traces:** TS-EXC-02, TS-EXC-03, TS-EXC-04, TS-EXC-08 · **Priority:** P2 · **Type:** Functional

| # | Step | Actor | Expected result |
|---|---|---|---|
| 1 | Open the Exception Queue | U-ACC | Default sort is priority then age, oldest High first |
| 2 | Apply each filter (type, priority, assignee, session) | U-ACC | Correct subsets; the displayed count matches the rows |
| 3 | Claim an unclaimed item | U-ACC | `assignedTo` becomes Raj |
| 4 | Attempt to assign an item to another user | U-ACC | Not permitted for a non-supervisor |
| 5 | Assign an item to U-ACC | U-FM | Permitted; assignee updates |
| 6 | Resolve every exception in the session | U-ACC/U-FM | Queue shows the empty state with "session ready for approval" — not a blank table |

---

## ALM-MTC-022 — Bulk multi-firm batch with one failure

**Traces:** TS-BLK-02, TS-BLK-03, TS-BLK-04, TS-BLK-05 · **Priority:** P2 · **Type:** Resilience · **As:** U-FM

| # | Step | Expected result |
|---|---|---|
| 1 | On Bulk Operations, add TD-01 (CSV), TD-04 (XLSX), TD-05 (XML) and TD-03 (errors) as four firms | All four are queued with their formats detected |
| 2 | Start the batch | Firms process in parallel; per-firm progress is visible |
| 3 | Observe TD-03's firm | It fails; the failure is attributed to **that firm only** |
| 4 | Observe the other three | They continue and complete — the batch is not stalled |
| 5 | Click **Retry firm** on the failed one | Only that firm is retried |
| 6 | After the batch, open each successful firm | Each has its own session and its own independent audit trail |

---

## ALM-MTC-023 — AI degradation is visible and non-blocking

**Traces:** TS-MAP-13 · **Priority:** P1 · **Type:** Resilience · **As:** U-FM

**Preconditions:** AI Inference stub configured to be unavailable.

| # | Step | Expected result |
|---|---|---|
| 1 | Upload TD-01 and let mapping run | Mapping **completes** — it does not fail or hang |
| 2 | Inspect the results | Rule-based mappings are present and correct |
| 3 | Inspect accounts that would have needed AI | Flagged for review with the explanation "AI suggestion unavailable — routed to manual review" |
| 4 | Look for a degradation notice | A banner states the auto-map rate is not comparable to a normal run |
| 5 | Restore AI and re-run a fresh session | Normal auto-map rate returns |

---

## ALM-MTC-024 — Keyboard-only operation

**Traces:** TS-A11Y-01, TS-A11Y-02, TS-A11Y-05, TS-A11Y-10 · **Priority:** P1 · **Type:** Accessibility

Perform on all 16 screens, **mouse unplugged**.

| # | Step | Expected result |
|---|---|---|
| 1 | Load a screen and press Tab from the top | The skip link is the first stop and moves focus to `#main-content` |
| 2 | Tab through the whole screen | Order follows the visual reading order; no focus trap; nothing is unreachable |
| 3 | At each stop, check the focus indicator | Clearly visible against every background, including dark sidebar and `brand-500` surfaces |
| 4 | Operate every control with Enter/Space, and modals with Escape | All work; Escape closes without committing |
| 5 | Tab into a data table and navigate rows | Row actions are reachable |
| 6 | Focus a disabled control | The reason it is disabled is discoverable |

---

## ALM-MTC-025 — Status is never colour-only; async changes are announced

**Traces:** TS-A11Y-03, TS-A11Y-04, TS-A11Y-07, TS-A11Y-09 · **Priority:** P1 · **Type:** Accessibility

| # | Step | Expected result |
|---|---|---|
| 1 | On Dashboard, Mapping Review and Exception Queue, inspect every status chip and confidence pill | Each carries a text label as well as colour |
| 2 | Apply a greyscale filter to the browser | Every status, severity and priority remains distinguishable |
| 3 | Check contrast on `brand-500` backgrounds with `ink-950` text, and on all body text | Meets WCAG 2.2 AA |
| 4 | With a screen reader active, start a mapping run | Status transitions are announced via a live region, not silent |
| 5 | Complete a sync with a screen reader active | The outcome (including `Partial`) is announced |
| 6 | Set zoom to 200%, then narrow to mobile width | Content remains usable; the page body does not scroll horizontally (wide tables scroll within their own container) |

---

## ALM-MTC-026 — Correlation id reaches support

**Traces:** TS-NFR-10, F2.3.4 · **Priority:** P2 · **Type:** Functional

| # | Step | Expected result |
|---|---|---|
| 1 | Trigger a failure (e.g. sync against an unavailable stub) | An error is shown, carrying a correlation id |
| 2 | Click **Help** from that screen | Help opens on the relevant contextual article, not a generic index |
| 3 | Open the troubleshooting catalog | An entry matching the error just seen is present |
| 4 | Raise a support request | Session id and correlation id are **pre-filled** — the user is not asked to find them |
| 5 | Cross-check the correlation id in the audit timeline and service logs | The same id appears end-to-end |

---

## ALM-MTC-027 — Sensitive data is not leaked into logs or email

**Traces:** TS-NFR-11, TS-NFR-04 · **Priority:** P1 · **Type:** Security

| # | Step | Expected result |
|---|---|---|
| 1 | Run a full upload → mapping → review → sync cycle with TD-01 | Completes |
| 2 | Search service logs for account names from TD-01 | **No matches** — counts and ids only |
| 3 | Search logs for raw file content | No matches |
| 4 | Trigger a validation-failure email notification | Email states counts and a link; contains no account names or file content |
| 5 | Inspect the audit `detail` payloads | Structured and appropriate; no full file contents embedded |

---

## ALM-MTC-028 — Dashboard alerts are actionable

**Traces:** UF-14, TS-EXC-02 · **Priority:** P2 · **Type:** Functional · **As:** U-FM

| # | Step | Expected result |
|---|---|---|
| 1 | With a session in `InReview`, open the Dashboard | An alert states how many mappings require manual review |
| 2 | Click the alert's action | Navigates directly to the Exception Queue, filtered to that session |
| 3 | Check the stage progress panel | Reflects actual server-side progress; no stage claims completion before the server reports it |
| 4 | Open Analytics | Shows trends and SLA metrics, distinct from the Dashboard's action-oriented view |
| 5 | Drill through an SLA breach | Reaches the breaching sessions |

---

## 29. Execution matrix

| Suite | Cases | Est. duration | Gate |
|---|:--:|---|---|
| **Smoke** | 001, 005, 011, 014 | ~1h | Every deployment |
| **Core functional** | 001–014, 018, 020, 021 | ~6h | Every release candidate |
| **Security & RBAC** | 015, 016, 017, 019, 027 | ~3h | Every release candidate |
| **Accessibility** | 024, 025 | ~4h (16 screens) | Every release candidate |
| **Resilience** | 010, 012, 013, 022, 023 | ~3h | Pre-GA and after resilience changes |
| **Full regression** | 001–028 | ~17h | Pre-GA |

### 29.1 Cases expected to fail on the current build

| Case | Reason |
|---|---|
| ALM-MTC-016 steps 1–3 | No auth guard exists; `/dashboard` is directly reachable (LLD §8.5) |
| ALM-MTC-017 (partially) | RBAC is not enforced in the current UI-only prototype |
| Any case requiring server behaviour | No backend exists yet — all data is fixtures in `src/data/mock.ts` |

These are recorded as expected failures against known gaps, not as new defects.
