# 06 · A.14n Wave 2a — Layout-Shell Primitives Spec

**Owner:** N3-PRIMITIVES-CHROME
**Generated:** 2026-05-26
**Driver:** N1-V2 visual baseline (`06-a14n-visual-baseline.md`) Top-10 cross-cutting gaps #2 + #10 ("No persistent right rail container" + "Header chrome inconsistent across routes").
**Sister doc:** N3-PRIMITIVES-HEROKPI ships `HeroBand` + `StatStrip` (gap #1 hero font scale + gap #3 KPI density). This doc covers the layout chrome: `PageHeader`, `ContentArea`, `RightRail`.

## 🟢 BOTTOM LINE

Three new layout-shell primitives live in `components/ui/`: **`PageHeader`** (consistent eyebrow + H1 + subtitle + actions row), **`ContentArea`** (grid wrapper that splits main column + optional right rail), **`RightRail`** (sticky aside with consistent width/spacing). All re-exported from `components/ui/index.ts` barrel. Existing `Header`, `cards`, `StatusChip`, etc. unchanged. Build PASS, TypeScript 0 errors. Wave 2b agents replace inline `<aside>` / inline header chrome / inline grid with these primitives for 1:1 visual parity + DRY adoption.

## 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW

1. Nothing — Wave 2b consumes these. ELON Tier-2 gate will verify live URL after Wave 2b adopts.
2. (Optional) review the `'hero' | 'standard'` variant split on `PageHeader` — flag if a route needs a 3rd variant (e.g., compact dense for tables).

---

## Component APIs

### 1. `PageHeader` — `components/ui/PageHeader.tsx`

Consistent header chrome for routes. Two variants: `hero` (lavender→iris gradient bg, white text — matches global `Header` component) and `standard` (cloud bg, ink-900 text — for per-route section titles beneath the global header).

```tsx
interface PageHeaderProps {
  eyebrow?: string;            // small uppercase pre-title
  title: string;               // H1 — required
  subtitle?: string;           // optional italic lede
  actions?: React.ReactNode;   // right-aligned action slot
  variant?: 'hero' | 'standard'; // default 'standard'
  className?: string;
}
```

**Typography lock** (per A.14j §1 + mockup #05):
- Eyebrow: `text-[11px] tracking-[0.14em] uppercase font-medium`
- Title: `font-display text-4xl lg:text-[44px] font-medium tracking-tight leading-[1.05]`
- Subtitle: `font-display italic text-sm leading-relaxed max-w-2xl`
- Hero variant: white text + `drop-shadow-[0_2px_8px_rgba(60,30,90,0.18)]`
- Standard variant: `text-ink-900` title, `text-ink-700/80` subtitle

**Usage example** (standard, per-route section header):
```tsx
import { PageHeader } from '@/components/ui';

<PageHeader
  eyebrow="Pipeline · Production Queue"
  title="What's filming this week"
  subtitle="3 cards moved from Script Ready last 24 hours."
  actions={<FilterPill label="All stages" />}
/>
```

**Usage example** (hero, replacing global Header for a route):
```tsx
<PageHeader
  eyebrow="Wednesday · May 19 · Creator Campaign HQ"
  title="Good morning, Julianne."
  subtitle="3 SOWs need a yes/no today. 1 invoice goes overdue tomorrow."
  variant="hero"
/>
```

### 2. `ContentArea` — `components/ui/ContentArea.tsx`

Grid wrapper that splits main column + optional right rail. When `rightRail` is provided, layout becomes `lg:grid-cols-[1fr_320px]` (matches A.14c lock in `app/page.tsx` L136). When omitted, children render full-width with standard page padding.

```tsx
interface ContentAreaProps {
  children: React.ReactNode;
  rightRail?: React.ReactNode;  // optional <RightRail>...</RightRail>
  className?: string;
}
```

**Padding lock**: `px-7 md:px-12 pb-20` matches existing route shells.
**Spacing lock**: `space-y-12 lg:space-y-16` on main column matches A.14j vertical rhythm.

**Usage example** (with right rail):
```tsx
import { ContentArea, RightRail } from '@/components/ui';

<ContentArea
  rightRail={
    <RightRail>
      <TodaysFocusCard />
      <QuickStatsCard />
      <UpcomingCallsCard />
    </RightRail>
  }
>
  <YourNextMove />
  <PipelineSnapshot />
  <FocusThisWeek />
</ContentArea>
```

**Usage example** (no right rail — full-width):
```tsx
<ContentArea>
  <PipelineBoardKanban />
</ContentArea>
```

### 3. `RightRail` — `components/ui/RightRail.tsx`

Sticky-positioned aside with consistent 4–6 spacing between cards. Default `sticky` follows scroll on `lg:` and up. Caller provides the card-secondary / card-stat / custom panel content.

```tsx
interface RightRailProps {
  children: React.ReactNode;
  sticky?: boolean;   // default true
  className?: string;
}
```

**Sticky class**: `lg:sticky lg:top-6 lg:self-start` — desktop only, never blocks mobile scroll.
**Spacing**: `space-y-4 lg:space-y-6` (matches overview rail).

---

## Adoption pattern for Wave 2b

Per-route polish agents in Wave 2b replace inline markup as follows:

### Pattern A — route currently has inline `<aside>` rail (e.g., `/`)

**Before:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8">
  <div className="space-y-12 lg:space-y-16 min-w-0">
    {/* main */}
  </div>
  <aside className="space-y-6">
    {/* rail */}
  </aside>
</div>
```

**After:**
```tsx
<ContentArea
  rightRail={
    <RightRail>
      {/* rail */}
    </RightRail>
  }
>
  {/* main */}
</ContentArea>
```

### Pattern B — route currently has no right rail (e.g., `/pipeline/board`, `/analytics`)

**Before:** route renders main content only, missing the persistent rail mockups expect.

**After:** wrap in `<ContentArea rightRail={<RightRail>…</RightRail>}>` and populate rail with the route-appropriate secondary widgets per mockup (Smart Panel for analytics, Quick Actions for SOW, Today's Focus for overview, etc.).

### Pattern C — route currently has inconsistent header chrome

**Before:** ad-hoc `<h1>` + `<p>` markup inline at top of page.

**After:** replace with `<PageHeader eyebrow="…" title="…" subtitle="…" />` for consistent typography + spacing.

---

## Mockup citations

| Primitive | Mockup(s) | What it informed |
|-----------|-----------|------------------|
| `PageHeader` hero variant | #05 (good-morning-julianne) | Eyebrow uppercase 0.14em + Playfair H1 + drop-shadow on gradient |
| `PageHeader` standard variant | #03 (production-queue), #12 (creator-command-center-full) | Cloud-bg headers with eyebrow + H1 + actions row |
| `ContentArea` grid split | #04 (analytics), #05 (overview), #06 (payments), #13 (sow-breakdown-elf) | All show `~75/25` main + rail split |
| `RightRail` width 320px | #04, #05, #06 | Rail occupies ~25% on desktop — `320px` fixed track matches |
| `RightRail` sticky | #12 (full-page command-center) | Rail follows long-scroll main column |
| `RightRail` spacing 4–6 | #05 | Cards in rail are tightly stacked, not generous-spaced |

---

## Risks + carve-outs

| # | Risk | Mitigation |
|---|------|------------|
| 1 | Route has truly unique header (e.g., `/login` is centered single-column with hero brand mark) | `<PageHeader>` is opt-in — login keeps its current standalone layout. Don't force adoption. |
| 2 | Route needs a 3rd variant (e.g., dense table view with no subtitle, no actions) | The `standard` variant already supports `eyebrow` only or `title` only. If demand emerges for a "compact" variant w/ different typography, add it in a follow-up — don't expand surface area now. |
| 3 | Right rail at 320px feels too narrow at lg breakpoint on ultrawide monitors | Acceptable trade-off — A.14j locked overview rail at 320px, matches Linear/Notion/Figma sidepanel norms. Revisit only if Julz flags. |
| 4 | `ContentArea` swallows existing top-pad — routes with global `<Header>` already provide hero space | `ContentArea` uses `pt` of 0 in its grid container; existing `-mt-8` overlap patterns (like overview L91) still work because they're applied by caller. |
| 5 | Sister-agent `HeroBand` may overlap `PageHeader hero` variant | Coordination: `HeroBand` is the FULL-bleed gradient w/ KPI strip. `PageHeader hero` is the header band only. Wave 2b chooses which based on route mockup — if route has hero + KPIs, use `HeroBand`. If just hero typography, use `PageHeader hero`. |

---

## Skill invocations

| Skill | Tool-call timestamp (ISO) |
|-------|---------------------------|
| `refactoring-ui` | 2026-05-26T~build-start |

(Other listed skills — `top-design`, `design:design-system`, `vercel:shadcn`, `superpowers:verification-before-completion` — were referenced via spawn prompt but `refactoring-ui` was the only one auto-loaded by the harness with full SKILL.md content. The other 4 informed implementation but did not auto-load full skill content. Per HR-21 honesty: noting this explicitly rather than fabricating tool-call IDs.)

---

## Self-QA (10-item, HONEST)

| # | Item | Result | Evidence |
|---|------|--------|----------|
| 1 | HR-15 verified artifact (build PASS) | ✅ PASS | `npm run build` shows all 28 routes prerender, last line `prerendered as static content` |
| 2 | HR-16 no self-graded passes — independently re-ran | ✅ PASS | `npx tsc --noEmit` re-ran post-write returned 0 errors |
| 3 | HR-19 source ≠ artifact — mockups Read in image mode | ✅ PASS | #05 + #12 Read with image output |
| 4 | HR-21 cite = invoke skills | 🟡 PARTIAL | Only `refactoring-ui` auto-loaded by harness. Other 4 referenced in spawn but not loaded as full SKILL.md. Flagged honestly above. |
| 5 | HR-26 problems ship with solutions | ✅ PASS | Risks table includes mitigations for each |
| 6 | HR-30 TL;DR + action block at top | ✅ PASS | 2-block header at top of this file |
| 7 | HR-2 PRESERVE existing chrome | ✅ PASS | `Header`, `cards`, `Sidebar`, A.14j tokens, A.14k Leave-feedback, A.14l SideShift, A.14m T5 utilities all untouched. Barrel re-exports new primitives only. |
| 8 | HR-4 SMALLEST — 3 components ~50-100 lines each | ✅ PASS | PageHeader 99 lines, ContentArea 51 lines, RightRail 41 lines |
| 9 | HR-34 cwd not a sandbox — predecessor punt rejected | ✅ PASS | All Read/Write/Bash operations succeeded from C:/Users/julia/OneDrive/Desktop/julz-claude-pc cwd |
| 10 | HR-35 clean .next before build | ✅ PASS | `rm -rf .next && npm run build` returned full page table |

## Audit

- Owner: N3-PRIMITIVES-CHROME
- Hard rules applied: HR-2, HR-4, HR-15, HR-16, HR-19, HR-21 (partial — flagged), HR-26, HR-30, HR-34, HR-35.
- Sister agent (N3-PRIMITIVES-HEROKPI) added `HeroBand` + `StatStrip` exports to same barrel. No merge conflict — additive only.
- Next: Wave 2b per-route agents adopt these primitives per Pattern A/B/C above.
