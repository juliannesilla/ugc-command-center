"use client";

// View switcher — Calendar ⇆ Timeline + 7 saved filters + Deadlines list tab.
// Phase A.14e Wave 3 (E7).

import { useMemo, useState } from "react";
import { CalendarDays, GanttChart, List as ListIcon } from "lucide-react";
import {
  DEADLINE_EVENTS,
  SAVED_FILTERS,
  applyFilter,
  sortEvents,
  type SavedFilterKey,
} from "@/lib/mock-data/deadline-events";
import { DeadlineFilters } from "./DeadlineFilters";
import { DeadlineCalendarView } from "./DeadlineCalendarView";
import { DeadlineTimelineView } from "./DeadlineTimelineView";
import { UpcomingDeliverablesList } from "./UpcomingDeliverablesList";
import { BrandFollowupsList } from "./BrandFollowupsList";
import { UpcomingFilmingDates } from "./UpcomingFilmingDates";
import { cn } from "@/lib/utils";

type ViewMode = "list" | "calendar" | "timeline";

const TAB_DEFS: { key: ViewMode; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "list",     label: "Deadlines", Icon: ListIcon },
  { key: "calendar", label: "Calendar",  Icon: CalendarDays },
  { key: "timeline", label: "Timeline",  Icon: GanttChart },
];

export function DeadlinesViewSwitcher() {
  const [view, setView] = useState<ViewMode>("calendar");
  const [filter, setFilter] = useState<SavedFilterKey>("all");

  // Filter + sort once, share across views.
  const filtered = useMemo(
    () => sortEvents(applyFilter(DEADLINE_EVENTS, filter)),
    [filter],
  );

  // Counts per saved-filter chip — shows what's behind each tab.
  const counts = useMemo(() => {
    const c: Partial<Record<SavedFilterKey, number>> = {};
    for (const f of SAVED_FILTERS) {
      c[f.key] = applyFilter(DEADLINE_EVENTS, f.key).length;
    }
    return c;
  }, []);

  return (
    <>
      {/* Tab row */}
      <section className="flex flex-wrap items-center gap-3 rise rise-1">
        <div
          role="tablist"
          aria-label="View mode"
          className="flex gap-1 rounded-2xl bg-white/70 backdrop-blur p-1.5 border border-cloud-100 shadow-card"
        >
          {TAB_DEFS.map(({ key, label, Icon }) => {
            const active = view === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setView(key)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-iris-300",
                  active
                    ? "bg-cloud-sunset text-white shadow-card"
                    : "text-ink-600 hover:bg-cloud-50 hover:text-ink-900",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>

        <DeadlineFilters active={filter} onChange={setFilter} counts={counts} />
      </section>

      {/* Active view */}
      <section className="rise rise-2">
        {view === "calendar" && <DeadlineCalendarView events={filtered} />}
        {view === "timeline" && <DeadlineTimelineView events={filtered} />}
        {view === "list" && (
          <div className="grid grid-cols-12 gap-6 lg:gap-8">
            <div className="col-span-12 xl:col-span-8 space-y-8">
              <UpcomingDeliverablesList />
              <BrandFollowupsList />
              <UpcomingFilmingDates />
            </div>
            <aside className="col-span-12 xl:col-span-4">
              <DeadlineTimelineView events={filtered.slice(0, 12)} />
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
