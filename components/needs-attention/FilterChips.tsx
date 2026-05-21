'use client';

import { cn } from '@/lib/utils';
import { SAVED_FILTERS, type SavedFilter } from './triage';

export function FilterChips({
  active,
  onChange,
  counts,
}: {
  active: SavedFilter;
  onChange: (next: SavedFilter) => void;
  counts: Record<SavedFilter, number>;
}) {
  return (
    <div
      role="tablist"
      aria-label="Saved filters"
      className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-white/70 backdrop-blur border border-cloud-100 shadow-card p-1.5"
    >
      {SAVED_FILTERS.map((f) => {
        const isActive = f.key === active;
        return (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(f.key)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition',
              isActive
                ? 'bg-cloud-sunset text-white shadow-soft'
                : 'text-ink-600 hover:bg-cloud-50 hover:text-ink-900',
            )}
          >
            <span>{f.label}</span>
            <span
              className={cn(
                'inline-flex min-w-[18px] justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums',
                isActive ? 'bg-white/25 text-white' : 'bg-cloud-100 text-cloud-700',
              )}
            >
              {counts[f.key] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
