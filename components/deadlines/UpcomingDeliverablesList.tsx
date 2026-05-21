import { ArrowUpRight } from 'lucide-react';
import { StatusChip, type ChipTone } from '@/components/ui/status-chip';
import { MOCK_DELIVERABLES } from '@/lib/mock-data/deadlines';
import type { Deliverable } from '@/lib/data-sync/types';

const statusMap: Record<Deliverable['status'], { tone: ChipTone; label: string }> = {
  overdue:       { tone: 'red',    label: 'Overdue' },
  'due-today':   { tone: 'orange', label: 'Due Today' },
  'due-tomorrow':{ tone: 'yellow', label: 'Due Tomorrow' },
  'due-week':    { tone: 'iris',   label: 'This Week' },
  'due-next-week':{tone: 'blue',   label: 'Next Week' },
  done:          { tone: 'green',  label: 'Done' },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function UpcomingDeliverablesList() {
  return (
    <section className="rounded-2xl border border-cloud-100 bg-white/85 backdrop-blur p-6 shadow-card">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-[16px] text-ink-900">Upcoming Deliverables</h3>
        <a href="#" className="inline-flex items-center gap-1 text-[11px] font-semibold text-cloud-700 hover:text-cloud-600">
          View all <ArrowUpRight className="h-3 w-3" />
        </a>
      </div>
      <ul className="mt-3 divide-y divide-cloud-100">
        {MOCK_DELIVERABLES.map(d => {
          const s = statusMap[d.status];
          return (
            <li key={d.id} className="py-3 flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cloud-100 to-iris-100 font-display text-[14px] text-cloud-700">
                {d.brandLogo ?? d.brand[0]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-ink-900 truncate leading-tight">
                  {d.campaign}
                </p>
                <p className="text-[11px] text-ink-500">{d.brand}</p>
              </div>
              <StatusChip tone={s.tone}>{s.label}</StatusChip>
              <span className="hidden sm:inline text-[11px] tabular-nums text-ink-500 w-16 text-right">
                {fmtDate(d.dueDate)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
