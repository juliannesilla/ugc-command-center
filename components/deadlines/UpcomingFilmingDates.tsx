import { Video } from 'lucide-react';
import { StatusChip } from '@/components/ui/status-chip';
import { MOCK_FILMING_DATES } from '@/lib/mock-data/deadlines';

export function UpcomingFilmingDates() {
  return (
    <section className="rounded-2xl border border-cloud-100 bg-white/85 backdrop-blur p-5 shadow-card">
      <h3 className="font-display text-[16px] text-ink-900">Upcoming Filming Dates</h3>
      <ul className="mt-3 divide-y divide-cloud-100">
        {MOCK_FILMING_DATES.map(f => (
          <li key={f.id} className="py-2.5 flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-iris-100 text-iris-600">
              <Video className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-ink-900 leading-tight truncate">
                {f.brand} — {f.campaign}
              </p>
              <p className="text-[11px] text-ink-500 truncate">
                {f.location ?? '—'}
              </p>
            </div>
            <StatusChip tone={f.daysUntil <= 3 ? 'orange' : 'iris'}>
              In {f.daysUntil} day{f.daysUntil !== 1 ? 's' : ''}
            </StatusChip>
          </li>
        ))}
      </ul>
    </section>
  );
}
