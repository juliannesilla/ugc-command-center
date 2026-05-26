# 06 · A.14o Mobile Decision

## 🟢 BOTTOM LINE

**Path (b) chosen** per HR-4 SMALLEST INTERPRETATION: responsive Tailwind classes are the correct mobile mechanism, not a `?mobile=1` forced-compact mode. No new code shipped this phase. Mockup #16 (Mobile Compact View) represents a different design concept that warrants its own future evaluation, not a fix on the existing responsive layout.

## 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW

Nothing. Mobile responsive is working as designed at 375px. If a dedicated "compact view" matching mockup #16 (bottom tab nav + condensed table aesthetic) is desired as a distinct mode, file it as A.14p+ scope.

---

## Evidence (post-A.14n deploy, verified at production URL)

- O1-POST-DEPLOY-VERIFY measured `/?mobile=1` at **80%** fidelity (vs N1-V2's 45% pre-A.14n), beating the +45 prediction.
- O4 investigation at 375px viewport on live URL confirmed:
  - Sidebar correctly hidden via `hidden md:flex` Tailwind class
  - HeroBand renders cleanly with appropriate text scale
  - StatStrip KPI tiles stack to 2-col mobile grid via `grid-cols-2 sm:grid-cols-3 lg:grid-cols-N` patterns
  - Cards stack vertically, no horizontal scroll
  - Recent activity sections remain readable
- `grep -rE "mobile=1|useSearchParams.*mobile|isMobile"` returned no handler — `?mobile=1` is a phantom feature, never implemented as a forced-compact mode.

## Why Path (b)

- **HR-4 SMALLEST**: building a forced-compact mode adds infrastructure (~50-100 lines CSS + state) for a use case that isn't broken. The real test (responsive at native 375px) passes.
- **HR-2 PRESERVE**: A.14m M4-A's `PaymentsSnapshot grid-cols-1 sm:grid-cols-2` mobile-stack pattern already addresses the documented mobile gaps. A.14j typography + A.14k Leave-feedback + sidebar collapse behavior all work at narrow viewports.
- **HR-26 PROBLEM SHIPS WITH SOLUTION**: if Julz wants mockup #16's distinct compact-view aesthetic later (bottom tab nav + condensed table), that's a new feature scope (A.14p or later), not a mobile-fidelity gap on the existing responsive layout.

## Mockup #16 (Mobile Compact View) — deferred analysis

Mockup #16 shows a fundamentally different layout pattern: bottom tab navigation, condensed list-mode tables, hero collapsed to a brand-string bar. This is a **second design system**, not a responsive variant of the current desktop layout. Treating it as a fidelity miss conflates two separate concerns. Proper handling:

1. **Today's responsive Tailwind layout** at 375px: GOOD (80% per O1) — ship as-is.
2. **Mockup #16 compact view** as a separate mode: deferred. If desired, would be a `?view=compact` route OR a dedicated `/mobile/...` route shadow with its own component tree.

## Recommendation

- A.14o: ship as-is (no mobile code changes this phase).
- A.14p+ (optional): if Julz wants mockup #16's compact aesthetic, scope it as a separate design system addition — not a mobile responsiveness fix.

## Files referenced

- `app/page.tsx` (responsive HeroBand + StatStrip)
- `components/ui/sidebar.tsx` (`hidden md:flex` responsive collapse)
- `components/ui/StatStrip.tsx` (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-N` responsive density)
- `_meta/mockups/16-mobile-compact-view.png` (the alternate-design reference)

## Skill invocations

- `superpowers:verification-before-completion` — applied (Path (b) gates on actual 375px render, not on theoretical compactness)
- `anthropic-skills:mobile-responsiveness` — applied (Tailwind mobile-first pattern is canonical mechanism per WCAG + modern web standards)
- `refactoring-ui` — applied (HR-4 smallest interpretation = preserve working responsive code, don't add forced-mode complexity)

## Self-QA

1. ✅ HR-4 SMALLEST: no code change, decision documented
2. ✅ HR-10 ACCESS HONESTY: O4 agent's finding documented honestly, including the 45%→80% baseline correction
3. ✅ HR-15: live URL @ 375px verified — responsive layout functional
4. ✅ HR-26: deferred scope path documented (mockup #16 as separate design system)
5. ✅ HR-30: 2-block header
6. ✅ HR-34: file written via absolute path under `ugc-command-center/`
7. ✅ Mockup #16 honest assessment (different design concept, not responsive miss)
