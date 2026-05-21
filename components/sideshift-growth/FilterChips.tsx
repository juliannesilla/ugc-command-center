'use client';

import { cn } from '@/lib/utils';
import {
  FILTER_BUCKETS,
  type FilterBucket,
} from '@/lib/mock-data/sideshift-growth';

export type BucketKey = FilterBucket | 'all';

export function FilterChips({
  active,
  onChange,
  counts,
}: {
  active: BucketKey;
  onChange: (next: BucketKey) => void;
  counts: Record<BucketKey, number>;
}) {
  return (
    <div
      role="tablist"
      aria-label="Profile field filters"
      className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-white/70 backdrop-blur border border-cloud-100 shadow-card p-1.5"
    >
      {FILTER_BUCKETS.map((f) => {
        const isActive = f.key === active;
        return (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(f.key)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud-sunset focus-visible:ring-offset-1',
              isActive
                ? 'bg-cloud-sunset text-white shadow-soft'
                : 'text-ink-600 hover:bg-cloud-50 hover:text-ink-900',
            )}
          >
            <span>{f.label}</span>
            <span
              className={cn(
                'inline-flex min-w-[18px] justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums',
                isActive
                  ? 'bg-white/25 text-white'
                  : 'bg-cloud-100 text-cloud-700',
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
