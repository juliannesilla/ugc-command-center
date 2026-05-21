/**
 * SmartNextMove — reusable card surfacing the recommended next action for a
 * campaign. Powered by `getNextMove` from `lib/scoring/`.
 *
 * Sources:
 * - `UGC/_meta/dashboard-spec/01-initial-dashboard-prompt.md` L519-L532
 *   "Smart Next Move Engine" — auto-recommends next action based on
 *   status, deadline, and missing info.
 *
 * Used by: Overview top card, Pipeline Board header, Needs Attention.
 */

import { cn } from "@/lib/utils";
import { getNextMove, getMissingInfo, getReadinessScore } from "@/lib/scoring";
import type { Campaign, CampaignPriority } from "@/lib/types/campaign";

const PRIORITY_DOT: Record<CampaignPriority, string> = {
  high: "bg-rose-500",
  medium: "bg-orange-400",
  low: "bg-slate-400",
};

const PRIORITY_LABEL: Record<CampaignPriority, string> = {
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority",
};

function explainNextMove(c: Campaign): string {
  const missing = c.missing_info.length > 0 ? c.missing_info : getMissingInfo(c);
  if (missing.length > 0) {
    return `Missing ${missing.length} critical field${missing.length > 1 ? "s" : ""} — fill before next step.`;
  }
  if (c.waiting_on_who === "me" && c.current_stage === "BRAND REPLIED") {
    return "Brand replied — ball is in your court.";
  }
  if (c.due_date) {
    const diffDays = Math.round(
      (new Date(c.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays <= 3 && diffDays >= -1) {
      return `Deadline in ${diffDays} day${diffDays === 1 ? "" : "s"} — ship it.`;
    }
  }
  const readiness = c.readiness_score ?? getReadinessScore(c);
  if (readiness < 50) {
    return `Readiness ${readiness}% — review source materials first.`;
  }
  return "On track — proceed with stated next action.";
}

export function SmartNextMove({
  campaign,
  className,
}: {
  campaign: Campaign;
  className?: string;
}) {
  const action = getNextMove(campaign);
  const why = explainNextMove(campaign);
  const priority = campaign.priority;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-iris-200 bg-gradient-to-br from-iris-50 via-white to-cloud-50 p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white",
            PRIORITY_DOT[priority],
          )}
          aria-label={PRIORITY_LABEL[priority]}
        />
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-iris-600">
            Smart Next Move · {campaign.brand}
          </div>
          <p className="mt-1.5 text-[15px] font-medium leading-snug text-slate-900">
            {action}
          </p>
          <p
            className="mt-2 text-xs text-slate-500"
            title={why}
          >
            <span className="font-semibold text-slate-600">Why:</span> {why}
          </p>
        </div>
      </div>
    </div>
  );
}
