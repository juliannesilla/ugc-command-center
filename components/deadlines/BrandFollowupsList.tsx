import { StatusChip, type ChipTone } from '@/components/ui/status-chip';
import { MOCK_BRAND_FOLLOWUPS } from '@/lib/mock-data/deadlines';
import type { DeadlinePriority } from '@/lib/data-sync/types';

const priorityTone: Record<DeadlinePriority, ChipTone> = {
  High: 'red',
  Medium: 'yellow',
  Low: 'iris',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function BrandFollowupsList() {
  return (
    <section className="rounded-2xl border border-cloud-100 bg-white/85 backdrop-blur p-6 shadow-card">
      <h3 className="font-display text-[16px] text-ink-900">Brand Follow-Ups</h3>
      <ul className="mt-3 divide-y divide-cloud-100">
        {MOCK_BRAND_FOLLOWUPS.map(f => (
          <li key={f.id} className="py-2.5 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-ink-900 leading-tight truncate">
                {f.brand}
              </p>
              <p className="text-[11px] text-ink-500 truncate">{f.topic}</p>
            </div>
            <span className="hidden sm:inline text-[11px] text-ink-400 tabular-nums w-16 text-right">
              {fmtDate(f.lastContact)}
            </span>
            <StatusChip tone={priorityTone[f.priority]}>{f.priority}</StatusChip>
          </li>
        ))}
      </ul>
    </section>
  );
}
