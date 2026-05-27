import { POSTED_LINKS } from '@/lib/mock-data/analytics';

export function PostedLinksTable() {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-card">
      <div className="mb-4">
        {/* A.14m Stream 3 a11y fix: h3 → h2. T5 ADDITIVE: section-title. */}
        <h2 className="section-title font-display text-lg font-bold text-ink-900">
          Posted Links with Metrics
        </h2>
        <p className="text-xs text-ink-700">Per-campaign click + conversion performance</p>
      </div>
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-700">
              <th className="px-2 py-2 font-semibold">Campaign</th>
              <th className="px-2 py-2 font-semibold text-right">Clicks</th>
              <th className="px-2 py-2 font-semibold text-right">CTR</th>
              <th className="px-2 py-2 font-semibold text-right">Conversions</th>
              <th className="px-2 py-2 font-semibold text-right">Conv Rate</th>
              <th className="px-2 py-2 font-semibold text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {POSTED_LINKS.map((row) => (
              <tr
                key={row.id}
                className="border-t border-cloud-100/60 hover:bg-cloud-50/40 transition-colors"
              >
                <td className="px-2 py-2.5 font-medium text-ink-900">{row.campaign}</td>
                <td className="px-2 py-2.5 text-right tabular-nums text-ink-700">
                  {row.clicks.toLocaleString()}
                </td>
                <td className="px-2 py-2.5 text-right tabular-nums text-ink-700">{row.ctr}</td>
                <td className="px-2 py-2.5 text-right tabular-nums text-ink-700">
                  {row.conversions}
                </td>
                <td className="px-2 py-2.5 text-right tabular-nums text-ink-700">{row.convRate}</td>
                <td className="px-2 py-2.5 text-right tabular-nums font-semibold text-emerald-700">
                  {row.revenue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
