import { cn } from '@/lib/utils';
import { HEATMAP_DAYS } from '@/lib/mock-data/deadlines';

function intensity(count: number): string {
  if (count === 0) return 'bg-white border-cloud-100 text-ink-400';
  if (count <= 1)  return 'bg-cloud-100 border-cloud-200 text-cloud-700';
  if (count <= 2)  return 'bg-cloud-200 border-cloud-300 text-cloud-700';
  if (count <= 3)  return 'bg-iris-200  border-iris-300  text-iris-600';
  if (count <= 4)  return 'bg-iris-300  border-iris-400  text-white';
  return 'bg-cloud-sunset border-iris-400 text-white shadow-glow';
}

export function WeekHeatmap() {
  return (
    <section className="rounded-2xl border border-cloud-100 bg-white/85 backdrop-blur p-4 shadow-card">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-display text-[14px] text-ink-900">Week at a Glance</h3>
        <span className="text-[10.5px] uppercase tracking-[0.16em] text-ink-400">
          May 10 – 19
        </span>
      </div>
      <div className="grid grid-cols-10 gap-1.5">
        {HEATMAP_DAYS.map(d => (
          <div
            key={d.dateISO}
            className={cn(
              'group relative flex flex-col items-center justify-center rounded-xl border aspect-square transition hover:scale-105',
              intensity(d.count),
              d.isToday && 'ring-2 ring-offset-2 ring-cloud-500 ring-offset-white',
            )}
            title={`${d.dayLabel} ${d.dayNum} · ${d.count} deliverable${d.count !== 1 ? 's' : ''}`}
          >
            <span className="text-[9px] uppercase tracking-[0.12em] opacity-70 leading-none">
              {d.dayLabel}
            </span>
            <span className="font-display text-[16px] leading-none mt-0.5">
              {d.dayNum}
            </span>
            <div className="mt-1 flex gap-0.5">
              {Array.from({ length: Math.min(d.count, 5) }).map((_, i) => (
                <span key={i} className="h-1 w-1 rounded-full bg-current opacity-80" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
