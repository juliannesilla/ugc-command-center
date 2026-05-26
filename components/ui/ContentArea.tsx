// Implements: Phase A.14n Wave 2a N3-PRIMITIVES — shared ContentArea wrapper.
// Source: N1-V2 visual baseline Top-10 gap #2 ("No persistent right rail container —
// mockups consistently have ~25%-width sidebar with What's Working / Smart Panel /
// Quick Actions / Recent Activity cards"). Recurs on /, /analytics, /payments,
// /sow-breakdown, /brain-dump, /pipeline/needs-attention.
//
// HR-2 PRESERVE: matches the existing grid pattern used inline in app/page.tsx
// L136 ("grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8") so Wave 2b
// can replace inline markup 1:1.
// HR-4 SMALLEST: 3 props (children, rightRail, className). No layout magic
// beyond the grid swap. Honors A.14j full-width pattern — no max-w-7xl wrapper.
//
// Mockup cites:
//   - #04 (analytics-performance) — main chart column + Smart Panel right rail.
//   - #05 (overview-good-morning-julianne) — main feed + What's Working rail.
//   - #13 (sow-breakdown-elf) — 4×4 deliverable grid + Quick Actions/Notes rail.
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ContentAreaProps {
  /** Main column content. */
  children: React.ReactNode;
  /**
   * Optional right rail content. When provided, layout becomes
   * `lg:grid-cols-[1fr_320px]` with content on the left, rail on the right.
   * Pass a <RightRail>…</RightRail> for sticky behavior + consistent spacing.
   * When undefined, children render full-width.
   */
  rightRail?: React.ReactNode;
  /** Optional pass-through className for outer wrapper. */
  className?: string;
}

export function ContentArea({ children, rightRail, className }: ContentAreaProps) {
  if (!rightRail) {
    return (
      <div className={cn('px-7 md:px-12 pb-20 space-y-12 lg:space-y-16 min-w-0', className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn('px-7 md:px-12 pb-20', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8">
        <div className="space-y-12 lg:space-y-16 min-w-0">{children}</div>
        {rightRail}
      </div>
    </div>
  );
}

export default ContentArea;
