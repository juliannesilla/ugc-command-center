// Implements: Phase A.14n Wave 2a N3-PRIMITIVES — shared RightRail container.
// Source: N1-V2 visual baseline Top-10 gap #2 ("No persistent right rail
// container") — extracts the inline `<aside className="space-y-6">…` pattern
// used in app/page.tsx L223 into a reusable primitive with sticky positioning.
//
// HR-2 PRESERVE: default `space-y-4 lg:space-y-6` matches existing overview
// rail spacing. Sticky-on-lg-only mirrors the A.14c lock pattern. Children
// (cards like Today's Focus / Quick Stats / Upcoming Calls) untouched.
// HR-4 SMALLEST: 3 props. No internal card styling — caller provides their
// own card-secondary / card-stat / custom panels.
//
// Mockup cites:
//   - #05 — right rail: "Review 4 creator submissions" card + secondary stack.
//   - #04 — right rail: Smart Panel + recommended actions pill list.
//   - #06 — right rail: Payment History stacked list.
//   - #13 — right rail: Quick Actions / Notes / Status stack.
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface RightRailProps {
  /** Stacked rail children — cards, panels, lists. */
  children: React.ReactNode;
  /**
   * When true (default), rail becomes `lg:sticky lg:top-6 lg:self-start` so it
   * follows scroll on desktop. Set false for short rails that shouldn't stick.
   */
  sticky?: boolean;
  /** Optional pass-through className. */
  className?: string;
}

export function RightRail({ children, sticky = true, className }: RightRailProps) {
  return (
    <aside
      className={cn(
        'space-y-4 lg:space-y-6 min-w-0',
        sticky && 'lg:sticky lg:top-6 lg:self-start',
        className,
      )}
    >
      {children}
    </aside>
  );
}

export default RightRail;
