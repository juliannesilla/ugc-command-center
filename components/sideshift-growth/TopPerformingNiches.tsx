/**
 * TopPerformingNiches — horizontal bar list for SideShift Growth dashboard.
 *
 * Source: mockup #20 (bottom-left "Top Performing Niches" card).
 * Wave 2b A.14n N3-SIDESHIFT-REBUILD.
 *
 * Design decisions (refactoring-ui · data-viz):
 * - Inline bar component, not Recharts — 5 rows of named niches read faster
 *   as horizontal progress strips than as a BarChart with axes.
 * - Bars sorted by conversion (highest first) per refactoring-ui §1 hierarchy.
 * - Value (78%) is the data, niche label is the secondary label —
 *   stat-number scale dominates, label de-emphasized per skill.
 */

import { cn } from '@/lib/utils';
import { TOP_PERFORMING_NICHES } from '@/lib/mock-data/sideshift-growth';

const BAR_COLOR: Record<number, string> = {
  0: 'from-cloud-sunset to-cloud-400',
  1: 'from-iris-400 to-iris-500',
  2: 'from-iris-300 to-iris-400',
  3: 'from-peach-300 to-peach-400',
  4: 'from-cloud-300 to-cloud-400',
};

export function TopPerformingNiches() {
  // Already sorted in mock data, but enforce defensively.
  const sorted = [...TOP_PERFORMING_NICHES].sort(
    (a, b) => b.conversionPct - a.conversionPct,
  );

  return (
    <section
      aria-labelledby="top-niches-heading"
      className="glass-card rounded-2xl p-6 shadow-card"
    >
      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <h2
            id="top-niches-heading"
            className="section-title font-display text-lg font-bold text-ink-900"
          >
            Top Performing Niches
          </h2>
          <p className="text-xs text-ink-700 mt-0.5">
            Conversion rate · 90-day window
          </p>
        </div>
      </div>

      <ul className="space-y-3.5">
        {sorted.map((n, idx) => (
          <li key={n.niche} className="group">
            <div className="flex items-baseline justify-between text-[12.5px] mb-1.5">
              <span className="font-medium text-ink-900">{n.niche}</span>
              <span className="font-display tabular-nums text-ink-700">
                <span className="text-[15px] font-semibold">
                  {n.conversionPct}%
                </span>
                <span className="ml-2 text-[11px] text-ink-600">
                  · ${n.earned.toLocaleString()}
                </span>
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-cloud-50 ring-1 ring-cloud-100 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ease-out',
                  BAR_COLOR[idx] ?? BAR_COLOR[4],
                )}
                style={{ width: `${n.conversionPct}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
