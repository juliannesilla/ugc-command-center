/**
 * BoostYourGrowthCta — full-width footer CTA for SideShift Growth dashboard.
 *
 * Source: mockup #20 (bottom-right gradient CTA banner "Boost Your Growth").
 * Wave 2b A.14n N3-SIDESHIFT-REBUILD.
 *
 * hooked-ux skill: closing CTA loads the next trigger (sends user back into
 *   the Hook loop — apply to new campaigns to unlock more XP / niches / payouts).
 * top-design skill: full-bleed pink-cloud gradient, asymmetric blur orbs,
 *   single bold CTA — signature moment of the page.
 */

import { ArrowUpRight, Sparkles } from 'lucide-react';

export function BoostYourGrowthCta() {
  return (
    <section
      aria-labelledby="boost-growth-heading"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cloud-sunset via-cloud-400 to-iris-400 px-7 py-7 shadow-card"
    >
      <span
        aria-hidden
        className="absolute -top-16 -left-12 h-44 w-44 rounded-full bg-white/30 blur-3xl"
      />
      <span
        aria-hidden
        className="absolute -bottom-16 -right-8 h-48 w-48 rounded-full bg-iris-200/40 blur-3xl"
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="min-w-0">
          <p className="text-[10.5px] uppercase tracking-[0.22em] text-white/85 font-semibold inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Boost Your Growth
          </p>
          <h2
            id="boost-growth-heading"
            className="mt-1.5 font-display text-2xl md:text-[28px] text-white leading-tight tracking-tight drop-shadow-[0_2px_8px_rgba(60,30,90,0.18)]"
          >
            Apply to 5 new campaigns this week.
          </h2>
          <p className="mt-1.5 text-[13px] text-white/85 leading-snug max-w-md">
            High-Impact creators average +12 XP per accepted invite. You're 540
            XP from Gold league.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[13px] font-semibold text-cloud-sunset shadow-soft transition hover:scale-[1.03] hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-cloud-sunset shrink-0"
        >
          Browse open campaigns
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
