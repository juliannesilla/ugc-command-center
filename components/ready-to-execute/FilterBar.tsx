// Filter + sort bar — top of Ready to Execute view.
//
// Source: spec section 6:
//   - "Filters" (L479-L493): default + 6 saved chip filters
//   - "Sort" (L495-L500): 4 sort options
//
// This wave is RSC-rendered (no live interactivity yet). Chips show counts and
// active state per default filter. Sort is presented as a dropdown trigger.

import { SlidersHorizontal, ArrowUpDown, Sparkles } from 'lucide-react';
import { FILTER_CHIPS, type FilterChipKey } from './helpers';

const SORT_OPTIONS = [
  'Due date soonest',
  'Estimated time shortest',
  'Highest value',
  'Highest brand fit',
];

export function FilterBar({
  totalCount,
  chipCounts,
}: {
  totalCount: number;
  chipCounts: Record<FilterChipKey, number>;
}) {
  return (
    <section className="rise rise-2 rounded-3xl bg-white/75 backdrop-blur-sm ring-1 ring-cloud-100 shadow-card p-5 md:p-6 space-y-4">
      {/* Top row: default filter + sort + result count */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-iris-50 px-3 py-1.5 text-[11.5px] font-semibold text-iris-700 ring-1 ring-iris-100">
            <Sparkles className="h-3 w-3" />
            Maker mode · default filter on
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11.5px] font-semibold text-ink-600 ring-1 ring-cloud-100">
            {totalCount} ready
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-cloud-200 bg-white px-3 py-2 text-[12px] font-semibold text-ink-700 hover:bg-cloud-50 transition"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-cloud-200 bg-white px-3 py-2 text-[12px] font-semibold text-ink-700 hover:bg-cloud-50 transition"
            aria-label="Sort options"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            {SORT_OPTIONS[0]}
          </button>
        </div>
      </div>

      {/* Saved filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[10.5px] uppercase tracking-[0.18em] text-ink-500 font-semibold mr-1">
          Saved
        </p>
        {FILTER_CHIPS.map((chip) => {
          const count = chipCounts[chip.key];
          return (
            <button
              key={chip.key}
              type="button"
              className="group inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11.5px] font-semibold text-ink-700 ring-1 ring-cloud-100 hover:ring-iris-200 hover:bg-iris-50 hover:text-iris-700 transition"
            >
              {chip.label}
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-cloud-50 group-hover:bg-iris-100 text-[10px] font-semibold text-ink-500 group-hover:text-iris-700 px-1">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Default-filter explainer */}
      <p className="text-[11px] text-ink-500 leading-snug">
        <span className="font-semibold text-ink-700">Showing:</span>{' '}
        Critical info complete · Status active · Stage in [Script Ready, Filming, Editing, QA, Submitted] · Not waiting on brand.
      </p>
    </section>
  );
}
