'use client';

import { useMemo, useState } from 'react';
import { ContentCard } from './ContentCard';
import { ContentHubFilters, type FilterState } from './ContentHubFilters';
import { CONTENT_ITEMS } from '@/lib/mock-data/content-hub';
import { Sparkles } from 'lucide-react';

export function ContentGrid() {
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    campaign: 'all',
    query: '',
  });

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return CONTENT_ITEMS.filter((i) => {
      if (filters.type !== 'all' && i.type !== filters.type) return false;
      if (filters.campaign !== 'all' && i.campaignSlug !== filters.campaign) {
        // Allow cross-campaign items (phrases/patterns) only when "all"
        if (i.campaignSlug !== undefined) return false;
        return false;
      }
      if (q && !i.body.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [filters]);

  return (
    <div className="flex flex-col gap-5">
      <ContentHubFilters value={filters} onChange={setFilters} />

      {/* Results header */}
      <div className="flex items-baseline justify-between px-1">
        <h3 className="font-display text-lg text-ink-900 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-iris-500" />
          {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'} of content
        </h3>
        <span className="text-xs text-ink-500">
          across {new Set(filtered.map((f) => f.campaignSlug).filter(Boolean)).size} campaigns
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white ring-1 ring-cloud-100 shadow-card p-10 text-center">
          <p className="text-sm text-ink-600">No content matches that filter combination.</p>
          <p className="mt-1 text-xs text-ink-400">Try clearing the search or switching campaigns.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
