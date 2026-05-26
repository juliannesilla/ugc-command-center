// Implements: Phase A.14n Wave 2a N3-PRIMITIVES — shared PageHeader primitive.
// Source: N1-V2 visual baseline `_meta/dashboard-spec/06-a14n-visual-baseline.md`
// row 10 ("Header chrome inconsistent — some routes have 'READ-ONLY MIRROR' pill +
// quote rail, others don't") + Top-10 gap #1 (hero font scale too small).
//
// HR-2 PRESERVE: existing `Header` chrome (header.tsx) is the FULL hero band
// with mantra/brand-string/notif chip. PageHeader is a NEW lighter primitive
// for routes that want consistent eyebrow + H1 + subtitle WITHOUT the full
// hero band — e.g. interior pages where the global Header already rendered
// at the top, but the route's content area needs its own titled section.
// Routes that need the gradient hero stick with <Header />; routes that need
// a standard cloud-bg header use <PageHeader variant="standard"/>.
//
// Mockup cites:
//   - #05 (overview-good-morning-julianne) — hero variant typography spec:
//     Playfair display tracking-tight, eyebrow uppercase 0.14em.
//   - #12 (creator-command-center-full)   — eyebrow + H1 + actions row top-right.
//   - #03 (production-queue)              — standard variant: cloud bg, no gradient,
//     eyebrow + H1 + subtitle + action slot inline.
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  /** Small uppercase pre-title (e.g., "Wednesday · May 19 · Creator Campaign HQ"). */
  eyebrow?: string;
  /** Main H1 — required. */
  title: string;
  /** Optional H2/lede beneath title. */
  subtitle?: string;
  /** Right-aligned action slot (buttons, toggles, filter pills). */
  actions?: React.ReactNode;
  /**
   * 'hero'     — lavender/iris gradient bg (matches global Header). Title is
   *              white-on-gradient with drop-shadow. Use ONLY when this PageHeader
   *              replaces the global Header for a route.
   * 'standard' — cloud-bg, ink-900 title. Default. Use beneath the global Header
   *              for per-route section titles.
   */
  variant?: 'hero' | 'standard';
  /** Optional pass-through className for outer wrapper. */
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  variant = 'standard',
  className,
}: PageHeaderProps) {
  const isHero = variant === 'hero';

  return (
    <header
      className={cn(
        'relative w-full',
        isHero
          ? 'header-cloud overflow-hidden pt-24 pb-36 lg:pb-44 px-7 md:px-12'
          : 'bg-transparent pt-2 pb-6 lg:pb-8 px-7 md:px-12',
        className,
      )}
    >
      <div className="relative z-10 flex items-start justify-between gap-6 flex-wrap">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p
              className={cn(
                'rise text-[11px] tracking-[0.14em] uppercase font-medium',
                isHero ? 'text-white/85' : 'section-subtitle text-ink-600 not-italic font-medium',
              )}
            >
              {eyebrow}
            </p>
          )}
          <h1
            className={cn(
              'rise rise-1 font-display font-medium tracking-tight leading-[1.05]',
              'text-4xl lg:text-[44px]',
              eyebrow && 'mt-3',
              isHero
                ? 'text-white drop-shadow-[0_2px_8px_rgba(60,30,90,0.18)]'
                : 'text-ink-900',
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={cn(
                'rise rise-2 mt-3 font-display italic text-sm leading-relaxed max-w-2xl',
                isHero ? 'text-white/80' : 'text-ink-700/80',
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div
            className={cn(
              'flex items-center gap-3 shrink-0',
              isHero ? 'rise rise-1' : 'rise rise-1',
            )}
          >
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

export default PageHeader;
