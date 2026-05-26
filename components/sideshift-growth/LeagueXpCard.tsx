/**
 * LeagueXpCard — gamified XP/league progress for SideShift Growth dashboard.
 *
 * Source: mockup #20 (lower-left "EXP/XP" card "2,460 XP · Silver").
 * Wave 2b A.14n N3-SIDESHIFT-REBUILD.
 *
 * hooked-ux skill: SELF reward (mastery) + INVESTMENT (XP stored value).
 *   - Progress bar = sunk cost made visible (IKEA effect).
 *   - "540 XP to Gold" loads next trigger (variable: each campaign gives
 *     different XP, classic variable schedule).
 */

import { Flame, ChevronRight } from 'lucide-react';
import { SIDESHIFT_SNAPSHOT } from '@/lib/mock-data/sideshift-growth';

const NEXT_BOOSTERS = [
  { label: 'Complete 1 invite', xp: 80 },
  { label: 'Verify TikTok',     xp: 120 },
  { label: 'Add ad sample',     xp: 150 },
];

export function LeagueXpCard() {
  const { totalXP, xpToNextLeague, league, nextLeague } = SIDESHIFT_SNAPSHOT;
  const totalForLevel = totalXP + xpToNextLeague;
  const pct = Math.round((totalXP / totalForLevel) * 100);

  return (
    <section
      aria-labelledby="league-xp-heading"
      className="glass-card rounded-2xl p-6 shadow-card relative overflow-hidden"
    >
      <span
        aria-hidden
        className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-cloud-sunset/15 blur-2xl"
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10.5px] uppercase tracking-[0.22em] text-cloud-700 font-semibold inline-flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-cloud-sunset" />
              League · {league}
            </p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-display text-4xl text-ink-900 leading-none tabular-nums">
                {totalXP.toLocaleString()}
              </span>
              <span className="text-[12px] text-ink-500 font-medium">XP earned</span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-cloud-sunset/10 px-2.5 py-1 text-[10.5px] uppercase tracking-[0.14em] font-semibold text-cloud-sunset ring-1 ring-cloud-sunset/20">
            {xpToNextLeague} to {nextLeague}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-cloud-50 ring-1 ring-cloud-100 overflow-hidden">
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              aria-label={`${totalXP} of ${totalForLevel} XP to ${nextLeague} league`}
              className="h-full rounded-full bg-gradient-to-r from-iris-400 via-cloud-sunset to-pink-400 transition-[width] duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-ink-500 tabular-nums">
            <span>{league}</span>
            <span>{nextLeague}</span>
          </div>
        </div>

        {/* Boosters list */}
        <div className="mt-5">
          <p className="text-[10.5px] uppercase tracking-[0.18em] text-ink-500 font-semibold mb-2.5">
            XP Boosters
          </p>
          <ul className="space-y-1.5">
            {NEXT_BOOSTERS.map((b) => (
              <li key={b.label}>
                <button
                  type="button"
                  className="group flex items-center justify-between w-full rounded-xl bg-white/70 ring-1 ring-cloud-100 px-3 py-2 text-left transition hover:bg-white hover:ring-iris-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud-sunset"
                >
                  <span className="text-[12.5px] text-ink-900">{b.label}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cloud-sunset tabular-nums">
                    +{b.xp} XP
                    <ChevronRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
