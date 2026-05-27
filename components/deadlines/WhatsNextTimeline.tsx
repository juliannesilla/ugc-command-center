import { cn } from '@/lib/utils';
import { WHATS_NEXT_TIMELINE, NEXT_7_DAYS_SUMMARY } from '@/lib/mock-data/deadlines';

export function WhatsNextTimeline() {
  const maxCount = Math.max(...WHATS_NEXT_TIMELINE.map(d => d.count));

  return (
    <section className="rounded-2xl border border-cloud-100 bg-white/85 backdrop-blur p-6 shadow-card">
      <h3 className="font-display text-[15px] text-ink-900">What&rsquo;s Next at a Glance</h3>

      <div className="mt-4 grid grid-cols-5 gap-2">
        {WHATS_NEXT_TIMELINE.map(d => {
          const heightPct = Math.max(15, Math.round((d.count / maxCount) * 100));
          return (
            <div key={d.dateISO} className="flex flex-col items-center gap-1.5">
              <div className="relative h-20 w-full bg-cloud-50 rounded-lg overflow-hidden">
                <div
                  className={cn(
                    'absolute bottom-0 left-0 right-0 rounded-lg transition-all',
                    d.isToday ? 'bg-cloud-sunset shadow-glow' : 'bg-gradient-to-t from-cloud-300 to-iris-300',
                  )}
                  style={{ height: `${heightPct}%` }}
                />
                <span className="absolute inset-x-0 top-1.5 text-center font-display text-[14px] text-white drop-shadow-sm">
                  {d.count}
                </span>
              </div>
              <span className="text-[9.5px] uppercase tracking-[0.12em] text-ink-700">
                {d.label}
              </span>
              <span
                className={cn(
                  'text-[10px] tabular-nums',
                  d.isToday ? 'font-bold text-cloud-700' : 'text-ink-600',
                )}
              >
                {d.shortLabel.replace('May ', '')}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2 rounded-2xl bg-gradient-to-br from-cloud-soft to-white p-3">
        {[
          { label: 'Total',       value: NEXT_7_DAYS_SUMMARY.total },
          { label: 'Deliverables',value: NEXT_7_DAYS_SUMMARY.deliverables },
          { label: 'Follow-Ups',  value: NEXT_7_DAYS_SUMMARY.followUps },
          { label: 'Payments',    value: NEXT_7_DAYS_SUMMARY.payments },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className="font-display text-[20px] text-ink-900 leading-none tabular-nums">{s.value}</p>
            <p className="text-[9.5px] uppercase tracking-[0.12em] text-ink-700 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-[10.5px] uppercase tracking-[0.16em] text-ink-600">
        Next 7 Days
      </p>
    </section>
  );
}
