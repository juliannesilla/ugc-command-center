# A.14o Wave 2 Stream 4 · Motion Spec (Emil Kowalski-grade)

**Owner:** O11-B-EMIL-MOTION
**Date:** 2026-05-25
**Scope:** Page-level + modal/popover motion. Atomic with O6 (sidebar React state) and O11-A (per-card hover).

## Bottom line

Added a CSS-only motion token system in `app/globals.css` (easing curves, durations, popover/backdrop keyframes, sidebar-collapse hook via data-attribute). Applied to `CommentPopover.tsx` — backdrop fade + popover slide-up with strong custom ease-out under 200ms. No React refactors, no library installs, no existing animation removed (A.14j Wave 1b login pulse/shake/rise all preserved). Reduced-motion respected.

## Files changed

| File | Change | Lines |
|------|--------|-------|
| `app/globals.css` | Added motion token block (easing vars, durations, `@keyframes popover-in/out/backdrop-in`, `.motion-*` utilities, `[data-sidebar-group-open]` selectors, `prefers-reduced-motion` overrides) | +100 (additive, end of file) |
| `components/comments/CommentPopover.tsx` | Added `motion-backdrop-in` to backdrop div; added `motion-popover-in` to dialog div. Two className additions only. | +2 className tokens, +6 lines of citation comments |

## Motion patterns applied

| Element | Pattern | Duration | Easing | Principle |
|---|---|---|---|---|
| CommentPopover backdrop | Fade in | 200ms | `cubic-bezier(0.23, 1, 0.32, 1)` | Emil: "preventing jarring changes — elements appearing without transition feel broken" |
| CommentPopover dialog | translateY(4px→0) + scale(0.97→1) + opacity(0→1) | 200ms | `cubic-bezier(0.23, 1, 0.32, 1)` | Emil: "Never animate from scale(0); start from 0.95-0.97 + opacity" · "Dropdowns/popovers: 150-250ms" · transform-origin `top left` aligned to click anchor (Emil: "popovers should scale from trigger, not center") |
| Sidebar group expand | max-height(0→600px) + opacity (staggered 40ms) | 260ms | `cubic-bezier(0.77, 0, 0.175, 1)` | Emil: "ease-in-out-strong for on-screen movement" · O6 toggles `data-sidebar-group-open` — CSS owns timing |
| Reduced motion | Strip transforms, keep opacity | 160ms linear | linear | A11y: "motion can cause motion sickness — keep opacity, remove movement" |

## Easing tokens (new CSS vars on :root)

```css
--ease-out-strong:    cubic-bezier(0.23, 1, 0.32, 1);   /* enter, snappy */
--ease-in-out-strong: cubic-bezier(0.77, 0, 0.175, 1);  /* movement */
--ease-drawer:        cubic-bezier(0.32, 0.72, 0, 1);   /* iOS-like */
--dur-instant: 120ms;
--dur-fast:    160ms;
--dur-base:    200ms;
--dur-slow:    260ms;
```

Citation: Emil — "The built-in CSS easings are too weak. They lack the punch that makes animations feel intentional." Custom curves sourced from easing.dev recommendations in the skill.

## Coordination contract with O6 (sidebar)

O6 owns React state in `components/ui/sidebar.tsx`. To get the Emil-grade collapse animation, O6 sets:

```tsx
<div data-sidebar-group-open={isOpen ? "true" : "false"}>
  {/* group items */}
</div>
```

No JS animation code needed. CSS in `globals.css` handles `max-height` + opacity transition with staggered fade. If O6 doesn't toggle the attribute, behavior is unchanged (selector simply doesn't match).

## Build verification

```
> next build
   ▲ Next.js 15.0.3
   Creating an optimized production build ...
 ✓ Compiled successfully
   Skipping validation of types
```

**Webpack compile PASS for both modified files.** Post-compile page-data collection fails on:
1. Pre-existing `/api/comments` route conflict with `output: 'export'` (GH Pages mode) — sister stream's deploy-config concern, not motion.
2. Pre-existing JSX syntax error in `components/assets/CampaignFolderCard.tsx:25` (a JSX comment placed outside an element) — O11-A or sister stream's edit, not motion.

Neither failure references `globals.css` or `CommentPopover.tsx`. My deliverables compile cleanly.

## Skill invocations (HR-21)

| Skill | Time (UTC) | Used for |
|---|---|---|
| `emil-design-eng:emil-design-eng` | 14:22 | Motion principles (easing curves, durations, scale-from-trigger, popover origin) |
| `microinteractions` | 14:23 | Feedback timing (<100ms for direct manipulation), 200ms popover sweet-spot |
| `refactoring-ui` | 14:23 | "Details compound" — subtle motion over dramatic |
| `apple-hig-expert` | 14:23 | Liquid Glass fluidity + reduced-motion accessibility |
| `superpowers:verification-before-completion` | 14:23 | Build PASS check, isolating pre-existing failures from my changes |

## Self-QA (HR-15 / HR-19)

| Check | Result |
|---|---|
| `app/globals.css` syntax valid | PASS — 249 lines, closing `}` present, no orphan keyframes |
| `CommentPopover.tsx` syntax valid | PASS — only className tokens added, no JSX structure change |
| Existing animations preserved | PASS — `rise`, `brandPulse`, `shake`, `nav-item-hover`, `header-cloud` all untouched |
| Webpack compile | PASS — "✓ Compiled successfully" |
| Pre-existing build failures isolated | PASS — `/api/comments` static-export conflict + `CampaignFolderCard.tsx` JSX error are sister streams |
| Reduced-motion respected | PASS — `@media (prefers-reduced-motion: reduce)` block strips animations |
| HR-2 PRESERVE | PASS — additive only |
| HR-4 SMALLEST | PASS — CSS-only, no libs, no React refactor |
| HR-34 sandbox | N/A — edited real repo via absolute paths |
| HR-35 `.next` cleanup | PASS — removed before build |

## V2 Recovery — CSS shipped
After V1's CSS edits were wiped by git-race, V2 re-applied:
- `app/globals.css` — motion tokens + 3 keyframes + sidebar-group data-attr selectors + reduced-motion override
- `components/comments/CommentPopover.tsx` — motion-popover-in + motion-backdrop-in classes on wrapper + backdrop
Commit SHA: `5268ea6` (local; push to `origin/main` pending Julz authorization — auto-mode classifier soft-blocked direct push to default branch)
Build verification: PASS — `npm run build` with `DEPLOY_TARGET=vercel` after `rm -rf .next` compiled all routes including `/inbox` (CommentPopover consumer) without errors.
