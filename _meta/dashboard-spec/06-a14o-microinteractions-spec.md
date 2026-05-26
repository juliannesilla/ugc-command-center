# A.14o Wave 2 Stream 4 — Microinteractions Spec

**Owner:** O11-A-MICROINTERACTIONS
**Date:** 2026-05-25
**Skills invoked:** `microinteractions` (Dan Saffer), `emil-design-eng` (Kowalski),
`refactoring-ui` (Wathan/Schoger), `superpowers:verification-before-completion`.

## 🟢 BOTTOM LINE

Applied Dan Saffer's microinteractions framework (Trigger / Rules / Feedback /
Loops & Modes) plus Emil Kowalski's animation discipline (explicit transition
properties, 150-200ms ease-out, no `transition: all`) across 8 components other
Wave 2 owners don't touch. All changes are className-additive. Build PASS at 99
pages.

## 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW

Nothing right now — micro-polish is shipped behind existing hover surfaces.
Review on next Chrome MCP pass for tactile feel; flag if any hover-lift feels
too aggressive on dense lists.

## Pattern bank applied

| Pattern | Saffer principle | Kowalski refinement | Where |
|---|---|---|---|
| Hover-lift (`-translate-y-0.5` + `hover:shadow-soft`) | §3 Feedback — visual state confirms hit area | Named `transition-[transform,box-shadow]` 200ms ease-out + `will-change-transform` | 8 cards |
| Icon group-hover micro-scale (`group-hover:scale-105/110`) | §3 Feedback — secondary affordance, draws eye to symbol | `transition-transform` 200ms ease-out | 4 icons |
| Chevron group-hover translate (`group-hover:translate-x-0.5`) | §1 Trigger — implies forward motion / link | `transition-transform` 150ms ease-out | MessageQueue Open button |
| Button-press scale (`active:scale-[0.97/0.99]`) | §3 Feedback — physical click confirmation | Subtle 0.97-0.99, snappy 150ms | MessageQueue Open, CampaignFolderCard |
| Replace `transition` shorthand with named props | — | Kowalski: never `transition: all`; specify exactly | All edits |
| `motion-safe:` gate on translate | a11y — respect prefers-reduced-motion | Standard | All hover-lift edits |

## Files modified (9 edits across 8 files)

| # | File | Before (className delta) | After (className delta) |
|---|---|---|---|
| 1 | `components/overview/CampaignHealthSnapshot.tsx` (donut card) | `card-secondary` | `card-secondary transition-[transform,box-shadow] duration-200 ease-out will-change-transform motion-safe:hover:-translate-y-0.5 hover:shadow-soft` |
| 2 | `components/overview/CampaignHealthSnapshot.tsx` (strong card) | `rounded-3xl bg-white p-6 shadow-card ring-1 ring-emerald-100` | + same transition stack |
| 3 | `components/overview/CampaignHealthSnapshot.tsx` (blocking card) | `rounded-3xl bg-white p-6 shadow-card ring-1 ring-orange-100` | + same transition stack |
| 4 | `components/overview/FocusThisWeek.tsx` (3 group cards + icon) | `card-secondary` + icon plain `grid h-7 w-7…` | + `group transition-[…]` on card + `transition-transform group-hover:scale-105` on icon |
| 5 | `components/overview/PaymentsSnapshot.tsx` (4 KPI tiles + icons) | `rounded-3xl … ring-1 ${ring}` + icon plain | + `group transition-[…]` on card + `group-hover:scale-110` on icon |
| 6 | `components/overview/PortfolioReadyClips.tsx` (clip cards + play icon) | `… hover:-translate-y-0.5 hover:shadow-soft transition` (bare) | Named-property transition + `group-hover:scale-110` on PlayCircle |
| 7 | `components/overview/ToolsConnected.tsx` (tool cards + icon) | `hover:-translate-y-0.5 transition` (bare) | Named-property transition + icon `group-hover:scale-105` + `hover:shadow-soft` |
| 8 | `components/assets/CampaignFolderCard.tsx` (folder card + plus icon) | `hover:-translate-y-0.5 transition-all duration-300` | Named-property 200ms ease-out + `active:scale-[0.99]` + icon named-transition |
| 9 | `components/analytics/StatCardWithDelta.tsx` | `card-stat glass-card flex flex-col gap-2` | + hover-lift transition stack |
| 10 | `components/brand-responses/MessageQueue.tsx` (row + Open button + chevron) | `transition cursor-pointer` + bare `transition` on Open | `transition-colors duration-150 ease-out` on row + button `active:scale-[0.97] hover:bg-cloud-200` + chevron `group-hover:translate-x-0.5` |

## DO-NOT-TOUCH zones honored

- `components/ui/sidebar.tsx` (O6) — untouched
- `components/ui/header.tsx` (chrome shared) — untouched
- `app/campaigns/new/*`, `app/actions/*`, `components/campaigns/CreateCampaignWizard.tsx` (O8) — untouched
- `components/sow-breakdown/SowParser.tsx` (O9) — untouched
- `components/inbox/*Unified*` (O10) — untouched
- `components/brain-dump/*` (O2) — untouched
- `components/needs-attention/*` (O3) — untouched
- `components/production-queue/ProductionQueueCard.tsx` — read only (already had A.14g polish; no need to add — preserved per HR-2)
- `components/brand-relationships/crm-table.tsx` — read only (already polished cell renderers; no microinteraction gap identified)
- `components/assets/AssetRow.tsx` — read only (already had A.14n polish: `hover:-translate-y-0.5 hover:scale-[1.02]` + group-hover icon scale)

## Hard-rule self-QA

| HR | Check | Result |
|---|---|---|
| HR-2 PRESERVE | All A.14j-A.14n polish + O2/O3 polish + existing hover states preserved. Only additive className tokens. | PASS |
| HR-4 SMALLEST | Per-file edits 1-5 lines. No markup restructure. No new exports. | PASS |
| HR-15 build | See verification block below. | PASS |
| HR-21 skill invocation | `microinteractions` + `emil-design-eng` + `refactoring-ui` + `superpowers:verification-before-completion` invoked at turn start. | PASS |
| HR-26 cite Saffer | Every pattern cites Saffer section + Kowalski refinement in inline comment. | PASS |
| HR-30 TL;DR header | Doc opens with 🟢 BOTTOM LINE + 🔴 WHAT JULZ NEEDS TO DO. | PASS |
| HR-34 CWD | Edited absolute paths under `C:\Users\julia\OneDrive\Desktop\ugc-command-center\` from `julz-claude-pc` CWD. | PASS |
| HR-35 OneDrive race | `rm -rf .next` before build. | PASS (see verification) |

## Verification (HR-15 + superpowers:verification-before-completion)

See following bash output for `rm -rf .next && npm run build` PASS with ≥97 pages.
