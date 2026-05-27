import { PLATFORM_PERFORMANCE } from '@/lib/mock-data/analytics';
import { cn } from '@/lib/utils';

export function PlatformPerformanceCard() {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-card">
      <div className="mb-4">
        {/* A.14m Stream 3 a11y fix: h3 → h2. T5 ADDITIVE: section-title. */}
        <h2 className="section-title font-display text-lg font-bold text-ink-900">
          Platform Performance
        </h2>
        <p className="text-xs text-ink-700">Views · engagement · net followers</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {PLATFORM_PERFORMANCE.map((p) => (
          <div
            key={p.id}
            className="relative overflow-hidden rounded-xl p-4 ring-1 ring-cloud-100/60 bg-white/60"
          >
            <div
              className={cn(
                'absolute inset-0 -z-10 opacity-10 bg-gradient-to-br',
                p.color,
              )}
            />
            {/* T5 ADDITIVE: stat-label + stat-number on per-platform tiles (mockup #11). */}
            <p className="stat-label text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-700">
              {p.platform}
            </p>
            <p className="stat-number font-display text-2xl font-bold text-ink-900 mt-1">
              {p.views}
            </p>
            <p className="text-xs text-ink-700">views</p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-ink-600">{p.engagement} eng</span>
              <span className="text-emerald-700 font-semibold">{p.follows}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
