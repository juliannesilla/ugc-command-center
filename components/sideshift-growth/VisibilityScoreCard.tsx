/**
 * VisibilityScoreCard — big-number "visibility score" tile for hero row.
 *
 * Source: mockup #20 (top-middle "Visibility Score 84" panel with HIGH IMPACT
 *   tier badge + supporting copy + small trend line).
 * Wave 2b A.14n N3-SIDESHIFT-REBUILD.
 *
 * refactoring-ui §1 hierarchy: 84 is the single most-important number on the
 * page → all 3 hierarchy levers (large + bold + ink-900) per skill. Tier badge
 * is the secondary signal. Helper copy is tertiary.
 */

import { TrendingUp, Sparkles } from 'lucide-react';
import { SIDESHIFT_SNAPSHOT } from '@/lib/mock-data/sideshift-growth';

export function VisibilityScoreCard() {
  const { visibilityScore, visibilityTier, totalApplications } =
    SIDESHIFT_SNAPSHOT;

  return (
    <section
      aria-labelledby="visibility-score-heading"
      className="relative overflow-hidden rounded-3xl bg-white/85 backdrop-blur ring-1 ring-cloud-100 shadow-card p-6 h-full flex flex-col"
    >
      <span
        aria-hidden
        className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-pink-200/40 blur-3xl"
      />

      <div className="relative z-10 flex-1 flex flex-col">
        <p className="text-[10.5px] uppercase tracking-[0.22em] text-cloud-700 font-semibold inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-cloud-sunset" />
          Visibility Score
        </p>

        <div className="mt-3 flex items-baseline gap-3">
          <h2
            id="visibility-score-heading"
            className="font-display text-7xl text-ink-900 leading-none tracking-tight tabular-nums font-bold"
          >
            {visibilityScore}
          </h2>
          <span className="text-[11px] text-ink-700 font-medium tabular-nums">
            / 100
          </span>
        </div>

        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10.5px] uppercase tracking-[0.14em] font-semibold text-emerald-700 ring-1 ring-emerald-200 w-fit">
          <TrendingUp className="h-3 w-3" />
          {visibilityTier}
        </div>

        <p className="mt-4 text-[12.5px] text-ink-600 leading-relaxed">
          Top 8% of creators on SideShift. Your{' '}
          <span className="font-semibold text-ink-900">{totalApplications} active touchpoints</span>{' '}
          this quarter pushed you into HIGH IMPACT tier.
        </p>

        {/* Mini trend bars at bottom */}
        <div className="mt-auto pt-4">
          <div className="flex items-end gap-0.5 h-8" aria-hidden>
            {[62, 64, 67, 65, 70, 72, 75, 76, 78, 80, 82, 84].map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-gradient-to-t from-pink-300 to-cloud-sunset opacity-80"
                style={{ height: `${(v - 50) * 1.8}%` }}
              />
            ))}
          </div>
          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-ink-600 font-semibold">
            12-week trend
          </p>
        </div>
      </div>
    </section>
  );
}
