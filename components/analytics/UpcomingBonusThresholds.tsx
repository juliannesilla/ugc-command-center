import { Trophy, ArrowRight } from 'lucide-react';
import {
  UPCOMING_BONUS_THRESHOLDS,
  type UpcomingBonusThreshold,
} from '@/lib/mock-data/analytics';
import { formatMoney } from '@/lib/utils';

function brandInitials(brand: string) {
  return brand
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-peach-100/70">
      <div
        className="h-full rounded-full bg-gradient-to-r from-peach-300 via-peach-500 to-cloud-500 shadow-[0_0_8px_rgba(255,153,102,0.45)] transition-all"
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  );
}

function BonusRow({ entry }: { entry: UpcomingBonusThreshold }) {
  const pct = Math.round((entry.earned / entry.target) * 100);
  return (
    <li className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-peach-100 to-peach-300 text-[11px] font-display font-semibold text-ink-900 shadow-card ring-1 ring-white"
        >
          {brandInitials(entry.brand)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[13.5px] font-semibold text-ink-900">
              {entry.brand}
            </span>
            <span className="shrink-0 text-[12px] tabular-nums text-ink-600">
              <span className="font-semibold text-ink-900">
                {formatMoney(entry.earned)}
              </span>
              <span className="mx-1 text-ink-400">/</span>
              {formatMoney(entry.target)}
              <span className="ml-1.5 rounded-full bg-peach-100 px-1.5 py-0.5 text-[10.5px] font-semibold text-peach-500">
                {pct}%
              </span>
            </span>
          </div>
        </div>
      </div>
      <ProgressBar pct={pct} />
    </li>
  );
}

export function UpcomingBonusThresholds() {
  return (
    <section className="relative overflow-hidden rounded-2xl glass-card shadow-card">
      {/* Peach-tinted decorative gradient strip */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-peach-300/50 to-cloud-300/30 blur-2xl"
      />
      <div className="relative p-5">
        <header className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-xl bg-peach-100 text-peach-500">
              <Trophy className="h-3.5 w-3.5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-semibold leading-tight text-ink-900">
                Upcoming Bonus Thresholds
              </h3>
              <p className="text-[11px] uppercase tracking-[0.14em] text-ink-500">
                Progress toward next milestone
              </p>
            </div>
          </div>
        </header>

        <ul className="flex flex-col gap-4">
          {UPCOMING_BONUS_THRESHOLDS.map((entry) => (
            <BonusRow key={entry.id} entry={entry} />
          ))}
        </ul>

        <a
          href="#bonus-progress"
          className="mt-5 inline-flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-peach-500 hover:text-peach-300 transition"
        >
          View All Bonus Progress
          <ArrowRight className="h-3 w-3" />
        </a>
      </div>
    </section>
  );
}
