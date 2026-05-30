import { BEST_VIDEOS } from '@/lib/mock-data/analytics';

const platformTone: Record<string, string> = {
  TikTok: 'bg-rose-50 text-rose-700 ring-rose-200',
  Reels:  'bg-iris-50 text-iris-700 ring-iris-200',
  Shorts: 'bg-orange-50 text-orange-700 ring-orange-200',
};

export function BestVideosCard() {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-card">
      <div className="mb-3">
        {/* A.14m Stream 3 a11y fix: h3 → h2. T5 ADDITIVE: section-title. */}
        <h2 className="section-title font-display text-lg font-bold text-ink-900">
          Top 5 Best-Performing Videos
        </h2>
        <p className="text-xs text-ink-700">Views, avg watch time, engagement rate</p>
      </div>
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-700">
              <th className="px-2 py-2">Video</th>
              <th className="px-2 py-2">Platform</th>
              <th className="px-2 py-2 text-right">Views</th>
              <th className="px-2 py-2 text-right">Avg Watch</th>
              <th className="px-2 py-2 text-right">Eng Rate</th>
            </tr>
          </thead>
          <tbody>
            {BEST_VIDEOS.map((v) => (
              <tr key={v.id} className="border-t border-cloud-100/60">
                <td className="px-2 py-2.5 font-medium text-ink-900">{v.title}</td>
                <td className="px-2 py-2.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-semibold ring-1 ${
                      platformTone[v.platform] ?? ''
                    }`}
                  >
                    {v.platform}
                  </span>
                </td>
                <td className="px-2 py-2.5 text-right tabular-nums">{v.views}</td>
                <td className="px-2 py-2.5 text-right tabular-nums">{v.avgWatch}</td>
                <td className="px-2 py-2.5 text-right tabular-nums font-semibold text-emerald-700">
                  {v.engagement}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
