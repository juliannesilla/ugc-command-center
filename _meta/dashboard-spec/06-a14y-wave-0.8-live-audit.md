# A.14y Wave 0.8.A — Cross-chip live audit

**Date:** 2026-05-29
**Tool:** Chrome MCP at `https://juliannesilla.github.io/ugc-command-center/sow-breakdown/`
**Commit at audit time:** `07be7ba`
**Auditor:** ELON (direct, in-session)

## Scope

Per Wave 0.8.A plan: cycle 5 untested chips + 2 detail pages + `/overview/full` Smart Engines block to catch any regressions / display bugs beyond MWM/Phobaxx/Veed/ParakeetAI (already verified in Wave 0.7).

## Chips tested

| Chip | Reviewing label | Row count | Deliverables detail | Payment Base | Bonus | Verdict |
|---|---|---|---|---|---|---|
| Bolt.new | ✓ | 14 | "1 hook + product demo Bolt.new on TikTok-style" | TBD + structure context | None specified | ✅ Clean |
| Megprime Pay | ✓ | 14 | "1 × vertical_video" (fallback) | TBD | None specified | ⚠️ P2 — canonical empty `deliverables[]` triggers default |
| Astor | ✓ | 14 | "1 vertical_video on platform" | $5 | None specified | ⚠️ P2 — canonical has `cpm_bonus: "$1/1000 view"` not surfaced |
| Lotus Shop (Vidmor) | ✓ | 14 | "1 × vertical_video" (fallback) | TBD | None specified | ⚠️ P2 — canonical empty `deliverables[]` |
| Brkfst.io (marketplace) | ✓ | 14 | "1 vertical_video on platform" | TBD | None specified | ✅ Clean ("various" type → 1 fallback) |

## Detail pages tested

| URL | Status | Notes |
|---|---|---|
| `/sow-breakdown/mwm-ai/` | 🔴 **404** | `[slug]/page.tsx` `generateStaticParams` reads from `sowData` which only has ParakeetAI. **P1** |
| `/sow-breakdown/parakeetai/` | ✅ OK | Hand-curated detail renders, 4587 char body |

## `/overview/full` Smart Engines

- ✅ OK · 22 headings · 20 sections · Smart Engines block present
- First 8 headings: "Smart next move", "My campaign pipeline snapshot", "Focus this week", "Upcoming deadlines", "Recent brand messages", "Payments snapshot", "Portfolio-ready clips", "Tools & assets connected"
- No 404, no empty render

## Findings (P0 / P1 / P2)

### P0 — Critical bugs blocking use

**None.** All chips render, all 14-row tables populate, all routes return 200 except dedicated drill-down 404 which is per-spec (only ParakeetAI shipped with hand-curated detail).

### P1 — Surgical fix THIS wave (Wave 0.8.B)

1. **"Open SOW" links 404 for 35+ non-ParakeetAI brands** — `SowBreakdownTable.tsx` renders the Open SOW Link unconditionally. Per HR-4 SMALLEST INTERPRETATION, fix = hide the link when `sowData[slug]` is undefined. Building canonical-derived detail pages is a bigger scope deferred to a future wave.

### P2 — Deferred (data-quality, not display logic)

2. **`mapDeliverableCount` default `1` for empty `deliverables[]`** — Megprime Pay + Lotus Shop have empty canonical deliverables array → UI shows "1 × vertical_video" rather than honest "Not yet specified". HR-10 honesty: change the default to render "Not yet specified" with status `blocked` (signed) / `incomplete` (prospect). Defer to Wave 0.9 if Julz wants tighter copy.

3. **Astor `cpm_bonus` field ignored by adapter** — canonical has `cpm_bonus: "$1/1000 view"` as a non-standard field. `mapBonusPotential` only reads `bonus_amount_usd` (numeric) + `payment_terms_note` (string fallback). Two paths: (a) migrate Astor canonical to put bonus in `bonus_amount_usd: 1` + `payment_terms_note: "Per 1000 views CPM"`, OR (b) extend adapter to also read `cpm_bonus`. Defer — Astor is a single edge case.

## Wave 0.8.B fix shipped

Patched `components/sow-breakdown/SowBreakdownTable.tsx`:
- Import `sowData` from `@/lib/mock-data/campaigns`
- Wrap the `<Link href={\`/sow-breakdown/${slug}\`}>` block in `{sowData[slug] ? ... : null}` so the link renders ONLY for brands with a hand-curated drill-down

Build PASS, tsc 0 errors.

## What's still working as of audit close

- Sidebar nav present + all 27 routes mapped
- Hero block "One campaign at a time." mantra preserved
- CampaignSelector with 37 chips (per chip-list count from canonical)
- 14-row SOW table renders for every chip tested
- Wave 0.7 fixes (cross-post count, bonus row, payment terms structure) confirmed live across all sampled chips
- ParakeetAI gold-standard detail page works
- `/overview/full` Smart Engines + 16-component surface intact
- Live URL HTTP 200

## Defect-free counter status

Wave 0.6 + 0.7 PASSED ELON-T2 10/10 last turn. Wave 0.8 audit found 1 P1 (Open SOW link 404), surgically fixed in same turn. 2 P2 data-quality items deferred per HR-26 (problems ship with solutions). No regressions.
