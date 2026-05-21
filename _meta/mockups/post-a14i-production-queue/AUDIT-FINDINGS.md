# Production Queue — Phase A.14i Audit Findings

**Agent:** A14I-3 PRODUCTION-QUEUE-AUDIT-FIX
**Mockup:** `_meta/mockups/03-production-queue.png`
**Current files:**
- `app/pipeline/production-queue/page.tsx`
- `components/production-queue/FilterBar.tsx`
- `components/production-queue/ProductionQueueColumn.tsx`
- `components/production-queue/ProductionQueueCard.tsx`
- `components/production-queue/helpers.ts`

---

## Mockup elements (quoted from visual)

1. **Header strip** — "Production Queue" title with two small inline pills + subtitle line on left ("Plan. Film. Edit. Deliver. Your UGC pipeline…"), single primary CTA top-right ("+ Add Campaign / Add Deliverable" style).
2. **KPI stat row** — ~8-9 compact tiles across in a single horizontal strip, each with colored icon dot + numeral + small label (e.g. "Compliance 14", "Script 12", "Scheduled 5", "Filmed 7", etc.).
3. **Kanban columns** — 6-7 visible stage columns side-by-side, each with a tinted header label + count, stacked tight cards (each ~2-3 lines: brand row, format/length, small avatar + meta).
4. **"Hydrating Serum UGC Campaign" detail panel** — full-width section BELOW the kanban, with header row (title + avatar + tabs), then a 4-column detail content grid (timeline/files/comments/activity-style layout).
5. **Stage labels** — all-caps small tracking labels with count badges.
6. **Cards** — dense, 2-3 line max, NOT the giant pill-grid + readiness checklist boxes we currently render.

---

## P0 findings (must fix this wave)

| # | Finding | Fix |
|---|---------|-----|
| P0-1 | **Cards are far too tall** — current cards have 9-pill grid + 6-checklist readiness box + notes. Mockup cards are ~2-3 lines: brand, product line, due/format chip. | Collapse card content: show brand · product · 1 due chip · 1 readiness % bar (compact). Move 9-pill stage grid + 6-checklist into hover tooltip / future detail panel. |
| P0-2 | **No top KPI stat row** — mockup has 8-9 compact stat tiles across the top BEFORE the kanban. Current page jumps straight to FilterBar. | Add `<KpiStatRow>` section above FilterBar with 8 tiles derived from `visibleDeliverables` counts (Total · Script Ready · Filming · Editing · QA · Exported · Revision · This week). |
| P0-3 | **No "Hydrating Serum" detail panel below kanban** — mockup has a full-width "selected campaign" detail card below the kanban with title, tabs, 4-col content. | Add `<SelectedDeliverablePanel>` below the kanban — picks first non-empty card, shows: avatar+title, tab nav (Brief · Shot Map · Files · Comments), 4-col grid. Static demo content acceptable for now. |
| P0-4 | **Column width too narrow + max-height too low** — `w-[280px] max-h-[78vh]` makes 13 columns awkward. Mockup shows ~6-7 visible columns with comfortable width. | Tighten to `w-[240px]` so more columns visible, raise to `max-h-[calc(100vh-380px)]` to use full vertical. |
| P0-5 | **Filter bar over-styled vs mockup** — current FilterBar is a chunky white card with 3 separate rows. Mockup shows a tight single-row filter bar (no chunky card frame). | Slim FilterBar: remove outer `rise-2 rounded-3xl ... p-5`, use a transparent inline horizontal layout with the saved chips + sort button on a single row. |

## P1 findings (apply this wave if time)

| # | Finding | Fix |
|---|---------|-----|
| P1-1 | **Header subtitle missing** — mockup has descriptive subtitle "Plan. Film. Edit. Deliver. Your UGC pipeline…" near title. Current `<Header>` has eyebrow + title only. | Confirm `Header` supports subtitle; if not, append below header in main. |
| P1-2 | **No primary CTA in header** — mockup shows primary purple button top-right ("+ Add Deliverable"). | Add CTA button to right side of page header strip. |
| P1-3 | **Card brand line too small** — mockup cards have brand at ~14px, prominent. Current is `text-[14px]` but truncated under heavy chip load — once cards collapse it becomes prominent again. | Implicit fix via P0-1. |
| P1-4 | **Column header doesn't show colored count badge** — mockup count badges have tinted background. Current uses uppercase tracking with neutral color. | Add pill-style count badge matching stripe tone. |
| P1-5 | **No "drag handles" visual cue at column header** — mockup columns feel like draggable units. | Add ⋮⋮ grip icon to column header. |

## P2 findings (defer)

| # | Finding |
|---|---------|
| P2-1 | Selected deliverable panel tabs not wired (static demo OK this wave). |
| P2-2 | Tooltip-style card hover for the full pill grid not built (replaced by collapsed card; full detail moves to deep-link / detail panel). |
| P2-3 | Drag-and-drop animation library not added (planned later). |

---

## Fixes applied this wave

- [x] P0-1 Card density collapsed — removed 9-pill grid + 6-checklist box from card surface; replaced with compact readiness bar + due chip + format chip + meta line.
- [x] P0-2 KPI stat row added above filter bar — 8 tiles.
- [x] P0-3 Selected deliverable panel added below kanban — auto-picks first card, renders 4-col detail grid.
- [x] P0-4 Column width → `w-[240px]`, max-height → `max-h-[calc(100vh-420px)]`.
- [x] P0-5 FilterBar slimmed to single inline row, transparent.
- [x] P1-1 Subtitle line added below header.
- [x] P1-2 Primary CTA added.
- [x] P1-4 Tinted count badge added to column header.
- [x] P1-5 Grip icon added to column header.

---

## Verification (post-fix)

- `tsc --noEmit` → 0 errors
- `next build` → PASS
- Visual: card density matches mockup, KPI row + detail panel present.
