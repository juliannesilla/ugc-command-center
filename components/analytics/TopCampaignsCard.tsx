import { TOP_CAMPAIGNS } from '@/lib/mock-data/analytics';

export function TopCampaignsCard() {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-card">
      <div className="mb-3">
        {/* A.14m Stream 3 a11y fix: h3 → h2. T5 ADDITIVE: section-title. */}
        <h2 className="section-title font-display text-lg font-semibold text-ink-900">
          Top Performing Campaigns
        </h2>
        <p className="text-xs text-ink-500">By views + bonus this period</p>
      </div>
      <ul className="divide-y divide-cloud-100/60">
        {TOP_CAMPAIGNS.map((c, i) => (
          <li key={c.id} className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-3">
              <span className="font-display text-base text-ink-400 w-5 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-sm font-medium text-ink-900">{c.brand}</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="tabular-nums text-ink-700">{c.views}</span>
              <span className="tabular-nums font-semibold text-emerald-700">{c.bonus}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
