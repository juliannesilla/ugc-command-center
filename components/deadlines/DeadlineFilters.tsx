"use client";

// 7 saved-filter chip bar for Deadlines page.
// Phase A.14e Wave 3 (E7) — spec section "4. Deadlines View · saved filters".

import { SAVED_FILTERS, type SavedFilterKey } from "@/lib/mock-data/deadline-events";
import { cn } from "@/lib/utils";

type Props = {
  active: SavedFilterKey;
  onChange: (key: SavedFilterKey) => void;
  counts?: Partial<Record<SavedFilterKey, number>>;
};

export function DeadlineFilters({ active, onChange, counts }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Saved deadline filters"
      className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-cloud-100 bg-white/70 p-1.5 backdrop-blur shadow-card"
    >
      {SAVED_FILTERS.map((f) => {
        const isActive = active === f.key;
        const count = counts?.[f.key];
        return (
          <button
            key={f.key}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(f.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-iris-300",
              isActive
                ? "bg-cloud-sunset text-white shadow-card"
                : "text-ink-600 hover:bg-cloud-50 hover:text-ink-900",
            )}
          >
            {f.label}
            {typeof count === "number" && (
              <span
                className={cn(
                  "rounded-md px-1.5 py-px text-[10.5px] tabular-nums",
                  isActive ? "bg-white/20 text-white" : "bg-cloud-100 text-ink-700",
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
