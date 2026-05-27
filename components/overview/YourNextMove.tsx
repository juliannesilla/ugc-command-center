// Implements: 01-initial-dashboard-prompt.md § "MAIN DASHBOARD OVERVIEW / 2. Your Next Move" (L194-L216)
// Wires `getNextMove()` from lib/scoring to surface the smartest single action.
import { ArrowRight } from "lucide-react";
import { MOCK_CAMPAIGNS } from "@/lib/mock-data/campaigns";
import { getNextMove, getReadinessScore, getMissingInfo } from "@/lib/scoring";
import type { Campaign } from "@/lib/types/campaign";

/** Pick the priority campaign — highest `priority` × earliest `due_date`. */
function pickPriorityCampaign(campaigns: Campaign[]): Campaign {
  const sorted = [...campaigns]
    .filter((c) => c.status === "active" || c.status === "waiting")
    .sort((a, b) => {
      // High priority + waiting on me wins.
      const aRank =
        (a.priority === "high" ? 3 : a.priority === "medium" ? 2 : 1) +
        (a.waiting_on_who === "me" ? 2 : 0);
      const bRank =
        (b.priority === "high" ? 3 : b.priority === "medium" ? 2 : 1) +
        (b.waiting_on_who === "me" ? 2 : 0);
      if (aRank !== bRank) return bRank - aRank;
      // Tie-break by earliest due date.
      const ad = a.due_date ? new Date(a.due_date).getTime() : Infinity;
      const bd = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      return ad - bd;
    });
  return sorted[0] ?? campaigns[0];
}

export function YourNextMove() {
  const top = pickPriorityCampaign(MOCK_CAMPAIGNS);
  const action = getNextMove(top);
  const readiness = getReadinessScore(top);
  const missing = getMissingInfo(top);
  const value = top.total_potential_value ?? 0;
  const daysWaiting = top.last_message_date
    ? Math.max(
        0,
        Math.round(
          (Date.now() - new Date(top.last_message_date).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  return (
    <section className="group/next rise rise-2 relative overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-iris-100 transition duration-300 ease-out hover:ring-peach-200 hover:shadow-glow">
      <div className="absolute inset-0 bg-iris-soft opacity-80 transition-opacity duration-300 group-hover/next:opacity-90" aria-hidden />
      <div
        className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-cloud-sunset opacity-25 blur-3xl transition-opacity duration-500 ease-out group-hover/next:opacity-40"
        aria-hidden
      />
      <div className="relative p-7 md:p-9 flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cloud-700 font-semibold">
            Your next move
          </p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl text-ink-900 leading-tight">
            {action}
          </h2>
          <p className="mt-2 text-[14px] text-ink-600 max-w-xl leading-relaxed">
            {top.brand} · {top.campaign_name}.{" "}
            {missing.length > 0
              ? `Missing: ${missing.slice(0, 2).join(", ")}.`
              : `Readiness ${readiness}% · keep momentum.`}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="group/cta inline-flex items-center gap-2 rounded-full bg-cloud-sunset px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition duration-200 ease-out hover:shadow-glow active:scale-[0.97]"
            >
              Open {top.brand}{" "}
              {top.sow_link ? "SOW" : top.script_link ? "script" : "brief"}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover/cta:translate-x-0.5" />
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink-700 ring-1 ring-cloud-200 transition duration-200 ease-out hover:ring-cloud-300 hover:bg-cloud-50/60 active:scale-[0.97]"
            >
              Open script draft
            </button>
          </div>
        </div>
        <div className="md:w-56 shrink-0 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-2xl bg-white/80 backdrop-blur p-3 ring-1 ring-cloud-100">
            <div className="font-display text-2xl text-cloud-700">
              {daysWaiting}
            </div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-ink-700 mt-0.5">
              days waiting
            </div>
          </div>
          <div className="rounded-2xl bg-white/80 backdrop-blur p-3 ring-1 ring-cloud-100">
            <div className="font-display text-2xl text-iris-500">
              ${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
            </div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-ink-700 mt-0.5">
              unlocked
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
