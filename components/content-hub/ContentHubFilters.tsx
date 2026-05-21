'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import {
  CONTENT_TYPE_FILTERS,
  CONTENT_HUB_CAMPAIGNS,
  type ContentType,
} from '@/lib/mock-data/content-hub';

export type FilterState = {
  type: ContentType | 'all';
  campaign: string;
  query: string;
};

interface Props {
  value: FilterState;
  onChange: (v: FilterState) => void;
}

export function ContentHubFilters({ value, onChange }: Props) {
  const [local, setLocal] = useState(value);
  const set = (patch: Partial<FilterState>) => {
    const next = { ...local, ...patch };
    setLocal(next);
    onChange(next);
  };

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-cloud-100 shadow-card p-4 md:p-5 flex flex-col gap-4">
      {/* Search + campaign select */}
      <div className="flex flex-col md:flex-row gap-3">
        <label className="relative flex-1">
          <Search className="h-4 w-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={local.query}
            onChange={(e) => set({ query: e.target.value })}
            placeholder="Search hooks, scripts, b-roll, phrases…"
            className="w-full rounded-xl bg-cloud-soft ring-1 ring-cloud-100 pl-9 pr-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-iris-300"
          />
        </label>
        <select
          value={local.campaign}
          onChange={(e) => set({ campaign: e.target.value })}
          className="rounded-xl bg-cloud-soft ring-1 ring-cloud-100 px-3 py-2.5 text-sm font-medium text-ink-800 focus:outline-none focus:ring-2 focus:ring-iris-300"
        >
          {CONTENT_HUB_CAMPAIGNS.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.brand}
            </option>
          ))}
        </select>
      </div>

      {/* Type filter chips */}
      <div className="flex flex-wrap gap-2">
        {CONTENT_TYPE_FILTERS.map((f) => {
          const active = local.type === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => set({ type: f.id })}
              className={[
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
                active
                  ? 'bg-ink-900 text-white shadow-sm'
                  : 'bg-cloud-soft text-ink-700 ring-1 ring-cloud-100 hover:bg-cloud-100',
              ].join(' ')}
            >
              <span aria-hidden>{f.emoji}</span>
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
