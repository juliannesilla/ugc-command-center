import { cn } from '@/lib/utils';
import { HEATMAP_DAYS } from '@/lib/mock-data/deadlines';

/**
 * Horizontal 10-day calendar strip — replaces the original heatmap to match
 * mockup 40AAE272 (Pipeline Deadlines View). Each cell shows day label, date
 * number, and a deliverable count badge.
 */
export function WeekHeatmap() {
  return (
    <section className="rounded-2xl border border-cloud-100 bg-white/85 backdrop-blur p-4 shadow-card">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-display text-[14px] text-ink-900">May 2026</h3>
        <span className="text-[10.5px] uppercase tracking-[0.16em] text-ink-400">
          10-day strip
        </span>
      </div>
      <div className="grid grid-cols-10 gap-2">
        {HEATMAP_DAYS.map(d => {
          const isHot = d.count >= 3;
          const isEmpty = d.count === 0;
          return (
            <div
              key={d.dateISO}
              className={cn(
                'group relative flex flex-col items-center rounded-xl border px-1.5 py-2.5 transition hover:-translate-y-0.5 hover:shadow-card',
                d.isToday
                  ? 'border-iris-300 bg-cloud-sunset text-white shadow-glow'
                  : isHot
                  ? 'border-iris-200 bg-iris-50 text-ink-900'
                  : isEmpty
                  ? 'border-cloud-100 bg-white text-ink-400'
                  : 'border-cloud-100 bg-cloud-soft text-ink-700',
              )}
              title={`${d.dayLabel} ${d.dayNum} · ${d.count} deliverable${d.count !== 1 ? 's' : ''}`}
            >
              <span className={cn(
                'text-[9px] uppercase tracking-[0.14em] font-semibold leading-none',
                d.isToday ? 'opacity-90' : 'opacity-60',
              )}>
                {d.dayLabel}
              </span>
              <span className="font-display text-[20px] leading-none mt-1">
                {d.dayNum}
              </span>
              <span
                className={cn(
                  'mt-2 inline-flex items-center justify-center min-w-[20px] h-[18px] px-1.5 rounded-full text-[10px] font-semibold leading-none',
                  d.isToday
                    ? 'bg-white/25 text-white ring-1 ring-white/40'
                    : isEmpty
                    ? 'bg-cloud-50 text-ink-300 ring-1 ring-cloud-100'
                    : 'bg-white text-cloud-700 ring-1 ring-cloud-200',
                )}
              >
                {d.count}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[10.5px] text-ink-500 flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-cloud-sunset" />
          Today
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-iris-200 ring-1 ring-iris-300" />
          3+ deliverables
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-cloud-soft ring-1 ring-cloud-200" />
          1–2 deliverables
        </span>
      </p>
    </section>
  );
}
