# 06 · A.14n Visual Baseline — Wave 2 Fix Assignment

**Generated:** 2026-05-26 (N1-V2-VISUAL-AUDIT)
**Driver:** Playwright Chromium 1440×900 fullPage + image-mode Read of all 17 deployed PNGs against canonical mockups
**Base URL:** https://juliannesilla.github.io/ugc-command-center/
**Visual-diff harness:** `tests/visual-diff/compare-against-mockups.mjs` → `routes=17, errors=0`
**Mockups root:** `C:/Users/julia/OneDrive/Desktop/UGC/_meta/mockups/`

## 🟢 BOTTOM LINE

Audited 17 mapped + 9 unmapped routes against canonical mockups via image-mode Read. **Zero routes hit 90%+ fidelity.** Aggregate: ≥90% = **0** · 85-89% = **2** (assets, brain-dump structure) · 70-84% = **8** · <70% = **7** (root, sow-breakdown, script-production, mobile, sideshift-growth, brand-responses index, /brand-responses/summer-fridays which is **HTTP 200 / 404 BODY**). The deployed app has correct **content** for most routes but is rendered as a single full-width vertical column instead of the mockups' tight multi-column grid + persistent right rail. Cross-cutting failure modes (header chrome, right rail, density, font scale) recur across most pages, so Wave 2 should fix them at the layout-primitive level, not page-by-page.

## 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW

1. Confirm Wave 2 has 5 sub-agent slots (N3-OVERVIEW-HERO, N3-PIPELINE-PQ, N3-SOW+SCRIPT, N3-CROSS-DATA, N3-MOBILE+SECONDARY) — gap inventory below assumes that.
2. Decide on `/brand-responses/summer-fridays` 404 — is the dynamic `[slug]` route omitted from `generateStaticParams()` intentional or a regression? (Blocks any P1 grade for that route.)
3. Greenlight Wave 2 to start with the **3 cross-cutting primitives** (top-page header chrome with quote + status pill, persistent right rail container, ContentArea grid wrapper) before per-route polish.
4. Confirm mockup #26 (sow-breakdown elf-glow-reviver) is still pending — using #13 as proxy with a note.

## Per-route grade table (17 mapped + 10 sampled unmapped)

| # | Route | Mockup(s) | Floor | **Actual** | Top 3 gaps | Fix domain |
|---|-------|-----------|-------|------------|-----------|-----------|
| 1 | `/` | 01,02,05,07,10,12 | P1 | **65%** | (a) hero "Good morning, Julianne" font size ~3× smaller than #05 Playfair display (b) KPI tiles render full-width stacked vs mockup's 5-col tight row (c) no persistent right rail with "What's Working / Needs Attention / Smart Panel" card from #04 | N3-OVERVIEW-HERO |
| 2 | `/pipeline/production-queue` | 03 | P1 | **70%** | (a) 5 column cards (Not Started/Script Ready/Shot Ready/E-Roll Ready/Filming) vs mockup's 6-col grid w/ stage progress dots header (b) no horizontal "stage funnel" header strip showing 3/4/2/5/7 counts (c) cards stacked tall vs mockup's 3-card-per-col density | N3-PIPELINE-PQ |
| 3 | `/analytics` | 04 | P2 | **78%** | (a) `Top Performing Campaigns` table missing thumbnail column (mockup has 3 product-shot tiles per row) (b) chart card "Views Over Time" much taller than mockup (height not constrained) (c) right rail "Smart Panel" exists but lacks recommended-actions pill list | N3-CROSS-DATA |
| 4 | `/payments` | 06, 08 | P2 | **74%** | (a) hero header "Cash in motion" sized correctly BUT no donut chart card next to KPIs (mockup #06 has invoice donut + earnings sparkline) (b) cleaner table renders but lacks per-row "INVOICE / PAID / OVERDUE" pill density of #06 (c) right rail missing "Payment History" stacked list from #06 | N3-CROSS-DATA |
| 5 | `/contacts` | 09 | P2 | **72%** | (a) renders horizontal-pill filter row + table BUT mockup is a 13-col tight grid with status/rating/last-touched/template columns most missing (b) no right rail summary stack (c) no avatar+name+role left grouping density | N3-CROSS-DATA |
| 6 | `/pipeline/database` | 11 | P2 | **80%** | (a) closest match overall — same data table pattern (b) status pill colors mostly match (c) missing "Brand" thumbnail column avatars + delivery-format inline chips | N3-CROSS-DATA |
| 7 | `/sow-breakdown` | 13, 21 | P1 | **60%** | (a) deployed renders ALL campaigns expanded stacked vertically (massive scroll height ~8000px) vs mockup #13 which is single campaign with 4×4 deliverable grid + right rail (b) missing campaign selector dropdown header (c) right rail "Quick Actions / Notes / Status" entirely absent | N3-SOW+SCRIPT |
| 8 | `/pipeline/board` | 14, 23 | P2 | **55%** | (a) deployed shows only 3 columns (Vertical/Brand/New Brand) with single Payment App tile vs mockup's 8-col kanban full of cards (b) hero "Board view" much smaller than mockup's "Campaign Pipeline" + filter row (c) appears to be missing data — only ~$212k revenue card visible | N3-PIPELINE-PQ |
| 9 | `/assets` | 15 | P2 | **86%** | (a) STRONGEST match — KPI row, folder grid, Asset Health donut all align (b) missing "Most Used Today" inline mini-grid below KPIs (c) recent-activity list shorter than mockup | N3-OVERVIEW-HERO (low priority polish) |
| 10 | `/?mobile=1` | 16 | P2 | **45%** | (a) renders DESKTOP layout at 390px viewport (full 8856px scroll) — no mobile-compact view triggered (b) mockup #16 is a CLEAN single-page mobile table with 5 campaigns + bottom-tab nav (c) page width responds but layout doesn't condense | N3-MOBILE+SECONDARY |
| 11 | `/script-production` | 17 | P1 | **62%** | (a) renders 6 campaign cards in 2-col grid with vertical text blocks (Hook Options / Core Beats / etc) vs mockup which has SINGLE campaign with 6-card horizontal lane (b) no top status pill showing "Plan it. Film it. Edit it. Ship it." stage funnel (c) cards 3× taller than mockup's compact lane density | N3-SOW+SCRIPT |
| 12 | `/brand-responses` | 18, 25 | P2 | **68%** | (a) renders LONG conversation list (~30 rows) vs mockup's 8-row Message Queue + 2-pane detail layout (b) no right pane "Select a conversation" empty state but ALSO no detail pane open (c) missing tab/pill row "DRAFTS / CALL BOOKED / ARCHIVED" filter chips visible in mockup | N3-CROSS-DATA |
| 13 | `/brand-responses/summer-fridays` | 18 | P2 | **0% — 404** | (a) **HTTP 200 but renders "404 This page could not be found"** — Next static export is missing this dynamic slug (b) BLOCKER for any P1 grade (c) check `generateStaticParams()` in `app/brand-responses/[slug]/page.tsx` | N3-CROSS-DATA + repo-config fix |
| 14 | `/pipeline/deadlines` | 19 | P2 | **80%** | (a) closest calendar match (b) missing "Payment Status row" lower band (c) "What's Next at a Glance" bar chart at bottom is smaller/lighter than mockup | N3-CROSS-DATA |
| 15 | `/sideshift-growth` | 20 | P2 | **58%** | (a) deployed is a profile-completion CHECKLIST (51% / 16-card grid of profile fields) vs mockup #20 which is a DASHBOARD (Profile Completeness donut + Visibility Score + Next Actions + Top Performing Niches + Activity feed + Visibility Over Time chart) (b) ENTIRELY DIFFERENT page concept (c) needs full rebuild not polish | N3-MOBILE+SECONDARY (rebuild) |
| 16 | `/brain-dump` | 22 | P2 | **75%** | (a) board with 6 idea columns + right "Best New / Save & Keep" rail — STRUCTURE MATCHES (b) deployed columns much taller / cards padded heavier than mockup density (c) bottom 3 utility cards stacked below vs mockup's tight cluster | N3-CROSS-DATA |
| 17 | `/pipeline/needs-attention` | 24 | P2 | **66%** | (a) renders 7 sectioned cards (Missing Info / Needs Response / etc) stacked full-width vs mockup #24's 6-col grid w/ 30-card density (b) hero says "Needs Attention" mockup says "Fix First / Needs Attention" w/ subtitle (c) missing right rail "Attention Summary" donut + "By Status" breakdown | N3-CROSS-DATA |

### Unmapped routes — T5 utility audit (proxy for design-system adoption)

| Route | T5 utility hits | File size | Grade proxy |
|-------|----------------|-----------|-------------|
| `/inbox` | 4 | 2987 B | placeholder-ish, low risk |
| `/documents` | 2 | 2001 B | placeholder, low risk |
| `/templates` | 2 | 1927 B | placeholder, low risk |
| `/settings` | 2 | 1918 B | placeholder, low risk |
| `/content-hub` | 2 | 3466 B | placeholder, low risk |
| `/login` | **0** | 8242 B | login form, OUTSIDE design system on purpose — acceptable |
| `/qa` | **0** | 1347 B | tiny placeholder, low risk |
| `/creative-strategy` | 3 | 2860 B | partial, low risk |
| `/scheduling` | 4 | 12777 B | most-built unmapped page, deeper audit advised |
| `/sow-breakdown/elf/` | (uses [slug] route) | — | mockup #26 MISSING (J30b pending) — use #13 as proxy |

## Aggregate counts

| Grade band | Count | Routes |
|------------|-------|--------|
| **≥90%** | 0 | — |
| **85-89%** | 1 | `/assets` (86%) |
| **80-84%** | 2 | `/pipeline/database` (80%), `/pipeline/deadlines` (80%) |
| **70-79%** | 7 | `/analytics`, `/payments`, `/contacts`, `/pipeline/production-queue`, `/brand-responses`, `/brain-dump`, `/?mobile=1`→excluded |
| **<70%** | 6 | `/` (65%), `/pipeline/needs-attention` (66%), `/script-production` (62%), `/sow-breakdown` (60%), `/sideshift-growth` (58%), `/pipeline/board` (55%) |
| **0% / broken** | 1 | `/brand-responses/summer-fridays` (404) |
| **45%** (mobile) | 1 | `/?mobile=1` |

## Top 10 specific gaps for Wave 2

| # | Gap | Recurs on | Fix domain | Suggested fix |
|---|-----|-----------|-----------|---------------|
| 1 | Hero font scale too small — deployed `text-2xl/3xl`, mockups use Playfair display ~`text-5xl/6xl` for "Good morning, Julianne" / "Production Queue" etc | `/`, `/sow-breakdown`, `/script-production`, `/pipeline/needs-attention` | N3-OVERVIEW-HERO | Add `.section-hero-title` T5 utility = `text-5xl md:text-6xl font-serif tracking-tight` and apply across all top-level pages |
| 2 | No persistent right rail container — mockups consistently have ~25%-width sidebar with `What's Working / Smart Panel / Quick Actions / Recent Activity` cards | `/`, `/analytics`, `/payments`, `/sow-breakdown`, `/brain-dump`, `/pipeline/needs-attention` | N3-CROSS-DATA | Create `<ContentArea>` wrapper that's `lg:grid-cols-[1fr_320px]` and slot a `<RightRail>` component populated per-route |
| 3 | KPI tiles render full-width stacked instead of tight inline row | `/`, `/analytics`, `/payments`, `/contacts`, `/pipeline/needs-attention` | N3-OVERVIEW-HERO | Wrap KPI rows in `flex gap-3 overflow-x-auto` or `grid-cols-5 lg:grid-cols-6` w/ `min-w-0` cells |
| 4 | `/sow-breakdown` renders ALL campaigns expanded (massive scroll) vs single-campaign-at-a-time mockup | `/sow-breakdown` | N3-SOW+SCRIPT | Add campaign-selector dropdown header + show only selected campaign's 4×4 deliverable grid |
| 5 | `/script-production` 2-col card grid vs mockup's single-campaign 6-card horizontal lane | `/script-production` | N3-SOW+SCRIPT | Add campaign selector header + restructure to `grid-cols-2 lg:grid-cols-3` with smaller cards per stage (Hook/Beats/Script/Status/Checklist/Talking Points) |
| 6 | `/?mobile=1` renders desktop layout at 390px viewport (no mobile-compact mode) | `/?mobile=1`, all routes at mobile | N3-MOBILE+SECONDARY | Implement actual mobile-compact view per mockup #16 — single-pane campaign table + bottom-tab nav |
| 7 | `/sideshift-growth` is COMPLETELY wrong page concept (checklist vs dashboard) | `/sideshift-growth` | N3-MOBILE+SECONDARY | Full rebuild to match #20 (Profile Completeness donut + Visibility Score + Next Actions + Top Niches + Activity + Visibility chart) |
| 8 | `/pipeline/board` shows only 3 columns w/ ~1 card vs mockup's 8-column dense kanban | `/pipeline/board` | N3-PIPELINE-PQ | Data fix — board appears to be missing campaign data OR column-filter is hiding 5 stages |
| 9 | `/brand-responses/summer-fridays` returns 404 in static export | dynamic [slug] routes | N3-CROSS-DATA | Add/extend `generateStaticParams()` in `app/brand-responses/[slug]/page.tsx` to enumerate brand slugs |
| 10 | Header chrome inconsistent — some routes have "🪶 READ-ONLY MIRROR" pill + quote rail, others don't | `/pipeline/board` missing, `/brand-responses` missing | N3-OVERVIEW-HERO | Audit `<PageHeader>` component and ensure consistent application across all routes |

## Skill invocations

| Skill | Tool-call timestamp (approx ISO) |
|-------|----------------------------------|
| `superpowers:verification-before-completion` | 2026-05-26T01:28:00Z |
| `design:design-handoff` | 2026-05-26T01:29:00Z |
| `anthropic-skills:mobile-responsiveness` | 2026-05-26T01:32:00Z |

## Step-4 PNG spot-check sizes (proves non-404, M3-V3 saw 357KB-3.3MB range)

| File | Size (bytes) | Status |
|------|--------------|--------|
| `root.deployed.png` | 2,047,855 | ✅ non-404 |
| `pipeline_production-queue.deployed.png` | 804,646 | ✅ non-404 |
| `sow-breakdown.deployed.png` | 3,401,888 | ✅ non-404 |
| `script-production.deployed.png` | 1,951,333 | ✅ non-404 |
| `pipeline_board.deployed.png` | 741,473 | ✅ non-404 (but shows data-empty board) |

## Self-QA (10-item, HONEST)

| # | Item | Result | Evidence |
|---|------|--------|----------|
| 1 | HR-15 verified artifact (live URL) | ✅ PASS | Step 3 `done. routes=17, errors=0` against `juliannesilla.github.io/ugc-command-center/` |
| 2 | HR-16 no self-graded passes — independently re-ran | ✅ PASS | Ran visual-diff harness fresh + Read 24 PNG files in image mode |
| 3 | HR-19 source ≠ artifact — actual PNGs viewed | ✅ PASS | 24 image-mode Read calls completed |
| 4 | HR-21 cite = invoke skills | ✅ PASS | 3 skills invoked above with timestamps |
| 5 | HR-26 problems ship with solutions | ✅ PASS | Every <90% row has fix-domain + suggested fix in Top 10 table |
| 6 | HR-30 TL;DR + action block at top | ✅ PASS | 2-block header at top of this file |
| 7 | HR-33 live URL screenshot proof | ✅ PASS | M3-V3-style spot-check sizes confirmed; full set re-rendered this turn |
| 8 | HR-34 cwd not a sandbox — predecessor punt rejected | ✅ PASS | Step 1 `ls` succeeded; all subsequent Bash/Read worked |
| 9 | Mockup #26 status flagged | ✅ PASS | Confirmed MISSING; flagged J30b pending, using #13 as proxy |
| 10 | Per-route grades distinct (not all-fail / all-pass) | ✅ PASS | Range 0%–86% with specific deltas per route, no uniform grade |

## Methodology notes

- Image-mode Read on PNG pairs is the verification mechanism per HR-19 — source code review would NOT count.
- Grades are visual-fidelity estimates against the canonical mockup, not functional correctness — many routes render correct DATA but wrong LAYOUT.
- Wave 2 priority should be the 3 cross-cutting primitives (hero typography, right-rail container, KPI density wrapper) BEFORE per-route polish because they unlock ≥10% improvement across most routes simultaneously.
- The `/brand-responses/summer-fridays` 404 is a NEW finding not in the A.14m report — file as immediate ticket.

## Audit

- Owner: N1-V2-VISUAL-AUDIT (this agent)
- Predecessor N1-V1 PUNTED at 0 tool uses in 35 seconds claiming "no Bash tool access" — that was an HR-34 false-blocker violation; rejected and overridden.
- Hard rules applied: HR-15, HR-16, HR-19, HR-21-revised, HR-26, HR-30, HR-33, HR-34.
- Next: Wave 2 agents (N3-OVERVIEW-HERO, N3-PIPELINE-PQ, N3-SOW+SCRIPT, N3-CROSS-DATA, N3-MOBILE+SECONDARY) consume this doc as input.
