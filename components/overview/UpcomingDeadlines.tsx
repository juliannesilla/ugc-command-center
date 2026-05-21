// Implements: 01-initial-dashboard-prompt.md § "DESIGN THE LAYOUT" row 10 "Upcoming deadlines panel"
// Sorts MOCK_CAMPAIGNS by due_date via getUpcomingDeadlines().
import { CalendarClock } from "lucide-react";
import { StatusChip } from "@/components/ui/status-chip";
import { getUpcomingDeadlines } from "@/lib/mock-data/overview";

/** Map "days out" to a chip tone — pink today, orange ≤3d, yellow ≤7d, iris future. */
function daysOutTone(days: number): "pink" | "orange" | "yellow" | "iris" {
  if (days <= 0) return "pink";
  if (days <= 3) return "orange";
  if (days <= 7) return "yellow";
  return "iris";
}

function daysOutLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "due today";
  if (days === 1) return "due tomorrow";
  return `${days}d out`;
}

export function UpcomingDeadlines() {
  const items = getUpcomingDeadlines();

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <h3 className="font-display text-[22px] font-medium tracking-tight text-ink-900">
          Upcoming deadlines
        </h3>
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Next 30 days
        </p>
      </div>
      <div className="rounded-3xl bg-white shadow-card ring-1 ring-cloud-100 overflow-hidden">
        {items.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <CalendarClock className="h-5 w-5 text-ink-400 mx-auto" />
            <p className="mt-2 text-[13px] text-ink-500">
              No deadlines in the next 30 days.
            </p>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead className="bg-cloud-soft text-left">
              <tr className="text-[10.5px] uppercase tracking-[0.16em] text-ink-500">
                <th className="px-5 py-3 font-semibold">Due</th>
                <th className="px-5 py-3 font-semibold">Brand</th>
                <th className="px-5 py-3 font-semibold">Next action</th>
                <th className="px-5 py-3 font-semibold">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud-50">
              {items.map((it) => (
                <tr
                  key={`${it.brand}-${it.date}`}
                  className="hover:bg-cloud-50/60 transition"
                >
                  <td className="px-5 py-3 whitespace-nowrap">
                    <StatusChip tone={daysOutTone(it.daysOut)}>
                      {daysOutLabel(it.daysOut)}
                    </StatusChip>
                    <p className="mt-1 text-[10.5px] text-ink-500">{it.date}</p>
                  </td>
                  <td className="px-5 py-3 font-semibold text-ink-900 whitespace-nowrap">
                    {it.brand}
                  </td>
                  <td className="px-5 py-3 text-ink-700 max-w-md">
                    {it.nextAction}
                  </td>
                  <td className="px-5 py-3">
                    <StatusChip tone="iris">{it.stage}</StatusChip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
