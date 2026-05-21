// Top-of-page Batch Mode panel — spec section 6 "Smart Feature" (L502-L510).
//
// Surfaces 2+ campaign batching opportunities ONLY when N ≥ 2. Hides itself
// entirely when there are no patterns (avoids empty-state visual debt).

import { Layers, Zap } from 'lucide-react';
import type { BatchSuggestion } from './helpers';

export function BatchModeSuggestions({ suggestions }: { suggestions: BatchSuggestion[] }) {
  if (suggestions.length === 0) return null;

  return (
    <section className="rise rise-1 rounded-3xl bg-gradient-to-br from-iris-50 via-white to-cloud-50 ring-1 ring-iris-100 shadow-card p-5 md:p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-iris-100 text-iris-600 shadow-soft">
            <Layers className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10.5px] uppercase tracking-[0.22em] text-iris-600 font-semibold">
              Batch mode
            </p>
            <h2 className="font-display text-xl md:text-2xl text-ink-900 leading-tight">
              Pair these up. Save hours.
            </h2>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-iris-600 ring-1 ring-iris-100">
          <Zap className="h-3 w-3" />
          {suggestions.length} suggestion{suggestions.length === 1 ? '' : 's'}
        </span>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestions.map((s) => (
          <li
            key={s.id}
            className="group rounded-2xl bg-white/85 backdrop-blur p-4 ring-1 ring-cloud-100 hover:ring-iris-200 hover:shadow-soft transition"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-[13.5px] font-semibold text-ink-900 leading-snug">
                {s.title}
              </p>
              <span className="shrink-0 inline-flex items-center justify-center min-w-[28px] h-6 rounded-full bg-iris-100 text-iris-600 text-[11px] font-semibold px-2">
                {s.count}
              </span>
            </div>
            <p className="text-[12px] text-ink-500 leading-relaxed mb-2.5">
              {s.detail}
            </p>
            <div className="flex flex-wrap gap-1">
              {s.brands.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center rounded-full bg-cloud-50 px-2 py-0.5 text-[10.5px] font-medium text-ink-600 ring-1 ring-cloud-100"
                >
                  {b}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
