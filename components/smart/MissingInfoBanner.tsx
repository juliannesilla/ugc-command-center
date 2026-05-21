/**
 * MissingInfoBanner — amber banner surfacing critical missing fields per
 * "Missing Info Detector" spec (`01-initial-dashboard-prompt.md` L534-L548).
 *
 * Two modes:
 *   - compact (default for cards): "Missing 3 fields" badge
 *   - full (detail pages):        bullet list + "Generate Fix" CTA stub
 *
 * Used by: PipelineCard, Needs Attention IssueCard, Creative Strategy view.
 */

import { cn } from "@/lib/utils";
import { getMissingInfo } from "@/lib/scoring";
import type { Campaign } from "@/lib/types/campaign";

export function MissingInfoBanner({
  campaign,
  compact = true,
  className,
}: {
  campaign: Campaign;
  compact?: boolean;
  className?: string;
}) {
  const missing = campaign.missing_info.length > 0
    ? campaign.missing_info
    : getMissingInfo(campaign);

  if (missing.length === 0) return null;

  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-amber-800 ring-1 ring-amber-200",
          className,
        )}
        title={missing.join(" · ")}
      >
        <span aria-hidden>⚠</span>
        Missing {missing.length} field{missing.length > 1 ? "s" : ""}
      </span>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-amber-200 bg-amber-50 p-4",
        className,
      )}
      role="status"
    >
      <div className="flex items-start gap-3">
        <span className="text-amber-600" aria-hidden>⚠</span>
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-amber-700">
            Missing info · {campaign.brand}
          </div>
          <p className="mt-1 text-sm font-medium text-amber-900">
            {missing.length} critical field{missing.length > 1 ? "s" : ""} block this campaign
          </p>
          <ul className="mt-2 space-y-1 text-sm text-amber-900/90">
            {missing.map((field) => (
              <li key={field} className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-amber-700" />
                <span>{field}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled
            title="Wires to ResponseDraftGenerator (E13) in Wave 6"
          >
            Generate fix draft →
          </button>
        </div>
      </div>
    </div>
  );
}
