# User Flows — Automated Ledger Mapping (ALM) Tool

| Field | Value |
|---|---|
| **Artifact** | User Flows (WF 3 · A6 `L1-design-user-journey-mapper`) |
| **Scope** | All 16 screens; W1 MVP primary journeys plus W2 supporting journeys |
| **Companions** | `inception/wireframes/` (screen-level detail), `design/ALM_HLD.md` §10 (screen↔feature map) |
| **Status** | Draft v1.0 |

---

## 1. Personas

| Persona | Role enum | Goal | Primary screens |
|---|---|---|---|
| **Priya — Finance Manager** | `FinanceManager` | Onboard an acquired firm's ledger quickly and defensibly; owns the outcome | Dashboard, Upload, Mapping Review, Exceptions, Sync, Audit |
| **Raj — Accountant** | `Accountant` | Clear the review queue accurately; proposes overrides but cannot approve his own | Exceptions, Workbench, Mapping Review |
| **Sarah — Auditor** | `Auditor` | Reconstruct what was decided, by whom, and why. **Read-only everywhere** | Audit Report, History Portal |
| **Tom — Administrator** | `Administrator` | Keep master ledger, rules and access correct | Master Ledger, Rules Engine, Users & Access |

---

## 2. Journey map — the spine

```text
 Priya                                    Raj                Priya            Sarah
   │                                       │                  │                │
 LOGIN ─► DASHBOARD ─► UPLOAD ─► VALIDATION ─► MAPPING REVIEW ─┐               │
                                     │              │           │               │
                              (errors)│      (ambiguities)      │               │
                                     ▼              ▼           │               │
                              fix & re-upload   EXCEPTION QUEUE │               │
                                                     │          │               │
                                              WORKBENCH (propose)               │
                                                     │          │               │
                                              approve (Priya)   │               │
                                                     └─────────►│               │
                                                          APPROVE SESSION       │
                                                                 │              │
                                                          COZONE SYNC ──────────┤
                                                                 │              │
                                                          AUDIT REPORT ◄────────┘
                                                                 │
                                                          HISTORY PORTAL
```

Emotional arc: **anxiety** at upload (is our data clean?) → **relief** at a high auto-map rate → **concentration** through the review queue → **confidence** at sync → **defensibility** at the audit report. Each screen should reduce the anxiety of the step before it.

---

## 3. UF-01 — Authenticate and orient

**Actor:** any · **Entry:** unauthenticated URL · **Screens:** 01 → 02

```text
Any ALM URL
  └─► not authenticated ──► /login  (intended path retained)
        └─► SSO with enterprise IdP
              ├─ success ────────► original intended path, else /dashboard
              ├─ success, first login ─► /dashboard + guided tour prompt (F2.3.1)
              ├─ role lacks access to intended path ─► /dashboard + "no access" notice
              ├─ account Suspended ─► /login + "contact your administrator"
              └─ failure ────────► /login + error, no detail on which factor failed
```

**Landing state by role.** Dashboard content differs: Priya sees the active session and the review backlog; Raj sees his assigned exceptions first; Sarah sees completed sessions and reports only, with no action buttons; Tom sees platform health and pending access requests.

**Current gap.** No auth guard exists — `/dashboard` is reachable directly and login navigates unconditionally (see `ALM_LLD.md` §8.5).

---

## 4. UF-02 — Upload a legacy ledger (US1)

**Actor:** Priya (or Raj) · **Screens:** 02 → 03 → 04 · **Features:** F1.1, F1.2

```text
DASHBOARD "+ New Upload"
  └─► UPLOAD
        ├─ select firm / acquisition context
        ├─ choose file  (CSV | XLSX | XML)
        │     ├─ unsupported extension ─► inline error, submit stays disabled
        │     └─ over size cap ────────► inline error naming the cap
        ├─ optional: download the template (F2.3.1)
        └─ Submit
              └─► session created, status = Uploading
                    └─► VALIDATION  (auto-navigate; polling begins)
```

**Design intent.** Never let the user submit something the client can already tell will fail — extension and size are checked before submit. Do not silently truncate or "clean" the file; the file is evidence.

Progress is server-truth only. While status ∈ {Uploading, Validating} the screen polls; a stalled poll shows "still processing" rather than a stuck bar.

---

## 5. UF-03 — Resolve validation issues

**Actor:** Priya / Raj · **Screen:** 04 · **Features:** F1.1.4, F1.1.5, F1.2

```text
VALIDATION (polling)
  ├─ 0 Errors, 0 Warnings ─────► "Proceed to mapping" (primary, enabled)
  ├─ 0 Errors, n Warnings ─────► "Proceed to mapping" enabled + warning banner
  │                               ("n rows will be flagged for review")
  └─ n Errors ─────────────────► proceed BLOCKED
        ├─ issue table: row · code · name · issue · severity
        ├─ "Export issue list" (CSV) ── take offline, fix at source
        └─ "Upload corrected file" ──► UPLOAD (same firm context pre-filled)
```

**Design intent.** Errors block, warnings inform — the distinction must be visible at a glance, and never by colour alone. Every issue names the **source row number** so the user can find it in their own file. The exit from a blocked state is one obvious action: fix and re-upload.

---

## 6. UF-04 — Review automated mappings (US2)

**Actor:** Priya · **Screen:** 05 · **Features:** F1.3

```text
Mapping engine completes ──► MAPPING REVIEW
  │
  ├─ header: total · auto-mapped % · pending review · errors
  ├─ suggestion list, each row:
  │     legacy code + name → suggested master code + name
  │     match type (Rule-Based | AI Semantic | Similarity)
  │     confidence pill
  │     explanation (always present — never an unexplained suggestion)
  │
  ├─ per row: Accept ──► status Accepted
  ├─ per row: Override ──► WORKBENCH (UF-06) for that account
  ├─ per row: Flag ──► EXCEPTION QUEUE
  ├─ filter by match type / confidence band / status
  ├─ "Accept all above threshold" (bulk, with count confirmation)
  │
  └─ pendingReview == 0 ──► "Approve session" unlocks (Priya/Tom only)
```

**Design intent.** Confidence and provenance travel together — the user must be able to see *why* a suggestion exists before accepting it. `matchType` is shown because trust differs: a rule match is deterministic, an AI match is probabilistic. Bulk accept always states how many records it will affect before committing.

**Degraded variant.** If AI was unavailable, affected rows carry the explanation "AI suggestion unavailable — routed to manual review" and a banner states that the auto-map rate is not comparable to a normal run.

---

## 7. UF-05 — Work the exception queue (US4)

**Actor:** Raj · **Screen:** 07 · **Features:** F1.4

```text
DASHBOARD alert "n mappings require manual review"  ──► EXCEPTION QUEUE
  │
  ├─ default sort: priority DESC, then age DESC  (oldest High first)
  ├─ filters: type · priority · assignee · session
  ├─ each row: exception id · priority · legacy code · type · AI confidence · assignee · age
  │
  ├─ "Claim" ──► assignedTo = me
  ├─ "Assign to…" ──► (supervisor only) pick assignee
  ├─ open row ──► WORKBENCH (UF-06)
  ├─ "Escalate" ──► priority High + reassign, with reason
  └─ queue empty ──► EmptyState: "No exceptions — session ready for approval"
```

**Design intent.** Ageing is visible because it is an SLA input (F2.4.4). Claiming is explicit so two people never silently work the same item — and if they do, the second save is rejected with a clear "already resolved by <name>" message rather than a raw conflict error.

---

## 8. UF-06 — Manual override (US3)

**Actor:** Raj proposes → Priya approves · **Screen:** 06 · **Features:** F1.5

```text
WORKBENCH (one legacy account in focus)
  ├─ left:  legacy account detail (code, name, type, parent, currency, source row)
  ├─ right: master ledger search (F1.5.3)
  │           ├─ type-ahead over active codes in the session's pinned ledger version
  │           ├─ inactive codes never appear
  │           └─ type-incompatible codes de-emphasised with reason
  ├─ centre: rejected suggestion + its explanation, for context
  │
  ├─ select master code
  ├─ justification (MANDATORY — submit disabled while empty)
  └─ "Propose override"
        └─► status Proposed, routed to an approver
              ├─ Priya/Tom "Approve"  ──► Overridden · audit event · queue item resolved
              │      └─ blocked if approver == proposer ("segregation of duties")
              └─ Priya/Tom "Reject"   ──► back to Pending, justification retained,
                                          proposer notified (F1.8.4)
```

**Design intent.** Two mandatory frictions, both deliberate: a **justification** (this is the audit trail's substance, not a formality) and a **second pair of eyes** (AP-4.5). The approver sees the proposer's reasoning, the original AI suggestion, and the chosen alternative side by side — enough to approve without re-doing the work.

**Navigation.** On resolve, advance straight to the next queue item rather than returning to the list — the reviewer is in a flow and should stay in it. Provide an explicit "back to queue" exit.

---

## 9. UF-07 — Approve and sync to Cozone (US6)

**Actor:** Priya · **Screens:** 05 → 08 · **Features:** F1.6

```text
MAPPING REVIEW, all exceptions resolved
  └─► "Approve session"
        ├─ confirmation modal: total accounts · overrides applied · target ledger version
        └─ confirmed ──► status Approved ──► COZONE SYNC
              │
              └─ "Start sync" ──► status Syncing (polling)
                    ├─ Success ──► Synced · success panel · "View audit report" CTA
                    ├─ Partial ──► exported vs failed counts, failed-record table,
                    │               "Retry failed only" (never re-posts successes)
                    └─ Failed  ──► reason + "Retry" (Priya/Tom only)
```

**Design intent.** Approval is a **gate, not a button** — the modal restates what is about to leave the system (AP-8.5). Partial success is never dressed up as success; the count of failures is as prominent as the count of successes. Retry is explicitly scoped to the failed subset so the user knows a retry is safe.

---

## 10. UF-08 — Produce an audit report (US5)

**Actor:** Priya or Sarah · **Screen:** 09 · **Features:** F1.7

```text
Entry: post-sync CTA · sidebar "Audit Reports" · HISTORY PORTAL row
  └─► AUDIT REPORT (session-scoped)
        ├─ summary: firm · totals · auto-map rate · override count · sync outcome
        ├─ decision table: every account, final master code, match type, decided by
        ├─ override detail: proposer · approver · justification · timestamp
        ├─ event timeline (F1.7.3): upload → validation → mapping → overrides → sync
        └─ Export ──► PDF (F1.7.4) | CSV (F1.7.5)
              └─ generated async ──► "preparing" state ──► download
```

**Design intent.** This screen answers one question — *"can we defend every decision in this session?"* — so overrides are called out separately from auto-accepted mappings, since those are where human judgement was applied. Regenerating the same report must produce identical content. Sarah has full read and export access and **no action controls anywhere on the screen** — not disabled buttons, absent ones.

---

## 11. UF-09 — Investigate history (Auditor)

**Actor:** Sarah · **Screen:** 10 · **Features:** F2.1

```text
HISTORY PORTAL
  ├─ search: firm · date range · status · finance manager
  ├─ session list with outcome and auto-map rate
  ├─ open session ──► investigation view (F2.1.4)
  │                     ├─ change timeline (F2.1.5)
  │                     └─ ──► AUDIT REPORT (UF-08)
  └─ retrieve a previously generated report (F2.1.3)
```

**Design intent.** An auditor arrives with a question about a firm and a period, not a session id — search is by business facts, not internal keys.

---

## 12. UF-10 — Bulk multi-firm processing

**Actor:** Priya · **Screen:** 11 · **Features:** F2.2

```text
BULK OPERATIONS
  ├─ add multiple firm files (CSV | XLSX | XML per firm)
  ├─ "Start batch" ──► parallel execution (F2.2.5)
  ├─ monitor board (F2.2.3): per firm — status · progress · accounts done/total
  │     ├─ one firm Failed ──► batch continues; failed firm isolated
  │     └─ "Retry firm" (F2.2.4) ── scoped to that firm only
  └─ batch complete ──► per-firm outcome summary
        └─ each successful firm ──► its own session, entering UF-04 independently
```

**Design intent.** One firm's failure must never stall the batch, and the board must make it obvious *which* firm failed. A batch is a convenience over N independent sessions, not a new state machine — each firm keeps its own session lifecycle and its own audit trail.

---

## 13. UF-11 — Administer master ledger and rules

**Actor:** Tom · **Screens:** 12, 13 · **Features:** F0.3.2, F0.4.1

```text
MASTER LEDGER
  ├─ browse / search by code, name, type, classification
  ├─ create · edit · deactivate  (never hard-delete — deactivate)
  ├─ every change ──► audit event + new ledger version (F0.3.3)
  └─ deactivate a code in use ──► warning naming the affected active sessions

RULES ENGINE
  ├─ rule list ordered by priority (lower evaluates first — stated on screen)
  ├─ create / edit: condition (DSL) · action · confidence boost · priority
  ├─ "Simulate" (F0.4.5) ──► run against a past session, preview matches
  │                            and the delta vs the live rule set
  ├─ activate ──► Draft → Active, versioned, audited
  ├─ deprecate ──► Deprecated (stops evaluating, history retained)
  └─ usage column shows match counts — evidence for pruning dead rules
```

**Design intent.** Both screens edit configuration that silently changes future mapping outcomes, so both require: **simulate before activate**, an **audit event on every change**, and **no destructive delete**. Rule priority is semantically significant (first match wins), so ordering must be explicit and reorderable, never implicit.

---

## 14. UF-12 — Manage access

**Actor:** Tom · **Screen:** 16 · **Features:** F0.2.2, F0.2.4

```text
USERS & ACCESS
  ├─ user list: name · email · role · organisation · status · last login · active sessions
  ├─ invite user ──► Pending until first SSO sign-in
  ├─ change role ──► confirmation stating what the new role can do
  ├─ suspend ──► Suspended, active sessions revoked immediately
  └─ every action ──► access audit event (F0.2.5)
```

Users are never deleted — suspended. Identity itself lives in the enterprise IdP (AP-9.1); this screen manages ALM authorisation, not credentials.

---

## 15. UF-13 — Get help when stuck

**Actor:** any · **Screen:** 15 · **Features:** F2.3

```text
Any screen ── "Help" ──► HELP & SUPPORT
  ├─ contextual article for the originating screen
  ├─ troubleshooting catalog (F2.3.3) keyed by the error the user just saw
  ├─ mapping help assistant (F2.3.2)
  └─ raise a support request (F2.3.4) — pre-filled with session id + correlation id
```

**Design intent.** Help is entered *from* a problem, so it opens on the relevant article rather than a generic index, and a support request carries the diagnostic context automatically — the user should never be asked to find a correlation id.

---

## 16. UF-14 — Monitor operations

**Actor:** Priya / Tom · **Screens:** 02, 14 · **Features:** F2.4

```text
DASHBOARD  ── operational snapshot, action-oriented
  ├─ active session progress by stage
  ├─ alert banner for anything needing action ──► deep-link to that screen
  └─ recent sessions table ──► session detail

ANALYTICS ── trend-oriented
  ├─ processing metrics (F2.4.1) · error analytics (F2.4.2)
  ├─ adoption (F2.4.3) · SLA monitoring (F2.4.4) · KPI tiles (F2.4.5)
  └─ SLA breach ──► drill through to the breaching sessions
```

**Design intent.** Dashboard answers "what needs me now?", Analytics answers "how are we trending?". Keeping them distinct stops the Dashboard becoming a chart wall with no call to action. Every alert is a link to the screen where it can be resolved.

---

## 17. Cross-cutting flow rules

| Rule | Rationale |
|---|---|
| Async operations show server-reported state, never optimistic completion | Upload, mapping and sync are server-side; a false "done" destroys trust |
| Every blocked state offers exactly one obvious way forward | Blocked validation → fix and re-upload; unresolved exceptions → the queue |
| Every alert deep-links to the screen that resolves it | Avoids hunting through the sidebar |
| Destructive or outward-facing actions confirm and restate scope | Session approval, Cozone sync, rule activation, user suspension |
| Capabilities the role lacks are disabled with a reason, not silently hidden | Discoverability without false affordance; server re-checks regardless |
| Status is never conveyed by colour alone | WCAG 2.2 AA; `Chip`/`ConfidencePill` pair colour with text |
| Async status changes are announced to assistive technology | Polling updates are invisible to screen readers otherwise |
| Auditor role reaches every read path and no write path | Read-only by construction, not by disabled buttons |
| Session context persists across navigation | The user is working one acquisition; re-selecting the firm on every screen is friction |

---

## 18. Flow coverage matrix

| Flow | Screens | Epics | PRD story |
|---|---|---|---|
| UF-01 Authenticate | 01, 02 | F0.2 | — |
| UF-02 Upload | 02, 03, 04 | F1.1, F1.2 | US1 |
| UF-03 Validation | 04 | F1.1.4, F1.1.5 | US1 |
| UF-04 Mapping review | 05 | F1.3 | US2 |
| UF-05 Exception queue | 07 | F1.4 | US4 |
| UF-06 Manual override | 06 | F1.5 | US3 |
| UF-07 Approve & sync | 05, 08 | F1.6 | US6 |
| UF-08 Audit report | 09 | F1.7 | US5 |
| UF-09 History | 10 | F2.1 | — |
| UF-10 Bulk | 11 | F2.2 | — |
| UF-11 Ledger & rules admin | 12, 13 | F0.3.2, F0.4.1 | — |
| UF-12 Access management | 16 | F0.2.2, F0.2.4 | — |
| UF-13 Help | 15 | F2.3 | — |
| UF-14 Monitoring | 02, 14 | F2.4 | — |

All 16 screens are reachable from at least one flow; all six PRD stories are covered.
