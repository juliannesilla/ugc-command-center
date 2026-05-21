// Implements: 01-initial-dashboard-prompt.md § "MAIN DASHBOARD OVERVIEW / 5. Focus This Week" (L271-L289)
// 3 stacks: Top Campaign Actions · Filming/Editing · Follow-Ups/Deadlines.
import { Send, Film, Clock, type LucideIcon } from "lucide-react";
import { getFocusGroups } from "@/lib/mock-data/overview";

const ICON_MAP: Record<string, LucideIcon> = {
  send: Send,
  film: Film,
  clock: Clock,
};

export function FocusThisWeek() {
  const groups = getFocusGroups();

  return (
    <section className="rise rise-4 space-y-3">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <h3 className="font-display text-[22px] font-medium tracking-tight text-ink-900">Focus this week</h3>
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink-500">
          May 19 – May 25
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
        {groups.map((group) => {
          const Icon = ICON_MAP[group.iconKey];
          return (
            <div
              key={group.title}
              className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-cloud-100"
            >
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-cloud-50 text-cloud-600 ring-1 ring-cloud-100">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <p className="text-[11px] uppercase tracking-[0.2em] text-ink-500 font-semibold">
                  {group.title}
                </p>
              </div>
              {group.items.length === 0 ? (
                <p className="mt-4 text-[13px] text-ink-500 italic">
                  Nothing queued — clear week.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-cloud-50">
                  {group.items.map((it) => (
                    <li key={it.label} className="py-2.5 first:pt-0 last:pb-0">
                      <p className="text-[13.5px] text-ink-900 font-medium leading-snug">
                        {it.label}
                      </p>
                      <p className="text-[11px] text-ink-500 mt-0.5">
                        {it.meta}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
