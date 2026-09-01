# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

An SDLC artifact repository for the **Automated Ledger Mapping (ALM) Tool** — a product concept that maps legacy bookkeeping accounts from firms acquired by Azets onto the Azets master ledger inside the Cozone platform (AI + rule-based suggestions, human review of ambiguities, direct Cozone sync, audit-ready reports).

Only one directory contains runnable code (`construction/alm-app`). Everything else is documentation, planning data, and static HTML. The repo is organised as SDLC *phases*, and artifacts in later phases are derived from earlier ones:

```
blueprint/        Agentic SDLC meta-layer: agent catalog + E2E workflow diagrams (self-contained HTML)
knowledge_bases/  Cross-cutting constraints: design system + architectural principles (AP-* IDs)
planning/         Idea → PRD → impact assessment → foundation architecture → roadmap →
                  work units, plus machine-readable epics.json and dependency-graph.json
inception/         wireframes/  16 static HTML screens, one file per screen, no build step
construction/     alm-app/     React + TS + Vite implementation of those 16 screens
```

`blueprint/` describes the agent-based process used to produce the other artifacts; it is not about the ALM product itself. Treat it as separate from the product line of work.

## Commands

All app commands run from `construction/alm-app`. Dependencies are **not** installed in a fresh clone — run `npm install` first.

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run lint
```

- `build` is `tsc -b && vite build` — the typecheck gate is part of the build, so run `npm run build` to verify types.
- Lint is **oxlint** (not ESLint); config lives in `.oxlintrc.json`.
- **There is no test framework and no test script.** Do not claim tests pass; verify changes by building, linting, and running the dev server.
- Wireframes in `inception/wireframes/` are plain files — open `index.html` directly in a browser.

## Architecture of the app (`construction/alm-app`)

A **UI-only prototype**: no backend, no API client, no auth, no state management library.

- **Routing** — every screen is a route registered in `src/App.tsx`. `/login` renders standalone; all other routes are children of `<AppShell />`. Unknown paths redirect to `/login`. There is no route guard: "logging in" is just `navigate('/dashboard')` in `LoginPage`.
- **Shell** — `src/components/AppShell.tsx` owns the dark top bar, the grouped sidebar (Main / Management / Admin), and an `<Outlet />` for page content. Adding a screen means: a page file, a `<Route>` in `App.tsx`, and a `<NavItem>` in `AppShell`.
- **Data** — all screen data is static fixtures in `src/data/mock.ts`, typed by the domain interfaces in `src/types/index.ts` (`MappingSession`, `MappingSuggestion`, `Exception`, `MasterLedgerAccount`, `MappingRule`, `AuditEvent`, `SyncRecord`, …). Fixtures are internally consistent — the same firms, session IDs, and users recur across screens. Keep that consistency when editing; changing a session ID or firm name in one place will contradict other screens. Fixture dates are set around 01 Sep 2026 to match the demo "today".
- **Components** — `src/components/ui.tsx` is the entire component library (`Button`, `Card`, `Chip`, `PageHeader`, `SectionHeader`, `StatsCard`, `DataTable`/`Tr`/`Td`, `ProgressBar`, `ConfidencePill`, `TabBar`, `AlertBanner`, `EmptyState`, `Ann`). Compose from these rather than writing new one-off markup; add to this file when a genuinely new primitive is needed.
- **Styling** — Tailwind only, with the design-system tokens encoded as theme extensions in `tailwind.config.js` (`brand-*`, `ink-*`, `mist-*`, `border`, `focus`, `danger`/`success`/`warning`; radii `card`/`feature`/`control`/`pill`; shadows `1`/`2`). Use these token classes, never raw hex. Global base styles and the Manrope font import are in `src/index.css`. `src/App.css` is leftover Vite template CSS and is not imported anywhere.

Pages label the roadmap feature they implement with the `<Ann>` component (e.g. `<Ann>F1.3.2 AI Suggestions</Ann>`) — these are traceability annotations tying the UI back to the feature IDs in `planning/`, and they render on screen as part of the demo. The wireframe HTML for a screen is the visual source of truth for its React page; when changing a screen, check the matching `inception/wireframes/screen-NN-*.html`.

## Working with the planning artifacts

- `planning/epics.json` and `planning/dependency-graph.json` are the machine-readable spine: waves `W0` Foundation → `W1` MVP → `W2` Scale → `W3` Intelligence → `W4` Commercialization, epics `F0.1`–`F3.4`, and their dependency edges. `ALM_Feature_Roadmap.md` and `ALM_Work_Unit_Decomposition.md` (work units `WU-<DOMAIN>-NNN`) restate the same structure in prose. When adding or renumbering features, update the JSON and the Markdown together — they are meant to agree.
- `planning/ALM_Foundation_Architecture.md` is the C4 L0/L1 baseline for the *target* system (Intake / Mapping / Review / Audit / Integration / AI domains behind an API gateway and event bus). Per the HLD Delta Rule (AP-8.3), feature designs extend this baseline rather than restating it. None of it is implemented — the app is the UI layer only.
- `knowledge_bases/Azets_Architectural_Principles.md` supplies the `AP-*` IDs that other documents cite. Note the document body is written for a different initiative ("Merchant Payments & Settlement Platform") and is reused here as a generic principles library — the principle IDs and statements transfer; the domain examples do not.
- `knowledge_bases/cozone-inspired-unified-design-system.md` is the authority for tokens, components, WCAG 2.2 AA requirements, and the "design intent, not a clone" rule: do not introduce real Azets logos, photography, or proprietary copy.

## Conventions

- The demo domain is UK accounting: British spellings in user-facing copy (`organisation`, `Analytics`), UK-style dates (`01 Sep 2026`), GBP.
- Icons come from `lucide-react`; keep sizes at 16px in navigation and inline contexts, matching existing usage.
- Existing files use single quotes, semicolons, 2-space indent, and section dividers (`// ─── Name ───`) in the larger files. Match the surrounding file.
- Accessibility is a stated acceptance criterion of the design system: preserve the visible focus ring (`:focus-visible` in `index.css`), `aria-label`s on the nav, and the `#main-content` target; never encode status with colour alone — the `Chip` and `ConfidencePill` components pair colour with text.
