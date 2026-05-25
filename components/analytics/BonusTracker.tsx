import { BONUS_BY_CAMPAIGN, BONUS_THRESHOLDS } from '@/lib/mock-data/analytics';
import { cn, formatMoney } from '@/lib/utils';

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-cloud-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-cloud-400 to-iris-400"
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  );
}

export function BonusThresholdsCard() {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-card">
      <div className="mb-4">
        {/* A.14m Stream 3 a11y fix: h3 → h2. T5 ADDITIVE: section-title. */}
        <h2 className="section-title font-display text-lg font-semibold text-ink-900">
          Upcoming Bonus Thresholds
        </h2>
        <p className="text-xs text-ink-500">Progress toward next milestone</p>
      </div>
      <ul className="flex flex-col gap-4">
        {BONUS_THRESHOLDS.map((b) => {
          const pct = Math.round((b.earned / b.target) * 100);
          return (
            <li key={b.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink-900">{b.brand}</span>
                <span className="tabular-nums text-ink-600">
                  {formatMoney(b.earned)} / {formatMoney(b.target)}{' '}
                  <span className="ml-1 text-emerald-700 font-semibold">{pct}%</span>
                </span>
              </div>
              <ProgressBar pct={pct} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function BonusTrackerByCampaign() {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-card">
      <div className="mb-4">
        {/* A.14m Stream 3 a11y fix: h3 → h2. T5 ADDITIVE: section-title. */}
        <h2 className="section-title font-display text-lg font-semibold text-ink-900">
          Bonus Tracker by Campaign
        </h2>
        <p className="text-xs text-ink-500">Earned vs. pending vs. total target</p>
      </div>
      <ul className="flex flex-col gap-4">
        {BONUS_BY_CAMPAIGN.map((b) => {
          const pct = Math.round((b.earned / b.total) * 100);
          return (
            <li key={b.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink-900">{b.brand}</span>
                <span className="tabular-nums text-ink-600 text-xs">
                  <span className="text-emerald-700 font-semibold">{formatMoney(b.earned)}</span>
                  <span className="mx-1.5 text-ink-400">·</span>
                  <span className="text-orange-600">{formatMoney(b.pending)} pending</span>
                  <span className="mx-1.5 text-ink-400">·</span>
                  <span>{formatMoney(b.total)} total</span>
                </span>
              </div>
              <ProgressBar pct={pct} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
