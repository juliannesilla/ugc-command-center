/**
 * BriefToDeliverableProgressBar — horizontal 13-stage workflow visualizer
 * per "Brief-to-Deliverable Progress Bar" spec
 * (`01-initial-dashboard-prompt.md` L588-L592):
 *   Capture → Access Check → SOW → Research → Angle → Positioning →
 *   Concept → Script → Shots → Film → Edit → Submit → QA
 *
 * Maps the 19-stage CampaignStage enum down to the 13 spec stages so any
 * campaign row can light up the right position regardless of stage detail.
 *
 * Used by: Campaign detail pages, Overview deep links.
 */

import { cn } from "@/lib/utils";
import type { Campaign, CampaignStage } from "@/lib/types/campaign";

type SpecStage = {
  key: string;
  label: string;
  short: string;
  description: string;
  // Which CampaignStage enums this spec-stage covers
  enumStages: CampaignStage[];
};

// 13 spec stages per prompt L590-L592
const SPEC_STAGES: SpecStage[] = [
  { key: "capture", label: "Capture", short: "Cap", description: "Lead captured · new opportunity logged", enumStages: ["NEW LEAD", "APPLIED"] },
  { key: "access", label: "Access Check", short: "Acc", description: "Brand replied · verifying scope + fit", enumStages: ["BRAND REPLIED", "RESPONDED", "WAITING ON BRAND", "CALL SCHEDULED"] },
  { key: "sow", label: "SOW", short: "SOW", description: "SOW received + reviewed", enumStages: ["SOW RECEIVED", "SOW REVIEWED"] },
  { key: "research", label: "Research", short: "Res", description: "Product + audience research", enumStages: [] },
  { key: "angle", label: "Angle", short: "Ang", description: "Hook angle locked", enumStages: [] },
  { key: "positioning", label: "Positioning", short: "Pos", description: "Brand positioning defined", enumStages: ["STRATEGY READY"] },
  { key: "concept", label: "Concept", short: "Con", description: "Creative concept approved", enumStages: [] },
  { key: "script", label: "Script", short: "Scr", description: "Script written + reviewed", enumStages: ["SCRIPT READY"] },
  { key: "shots", label: "Shots", short: "Sht", description: "Shot list + storyboard ready", enumStages: [] },
  { key: "film", label: "Film", short: "Flm", description: "Filming in progress", enumStages: ["FILMING"] },
  { key: "edit", label: "Edit", short: "Edt", description: "Editing + post-production", enumStages: ["EDITING"] },
  { key: "submit", label: "Submit", short: "Sub", description: "Submitted to brand", enumStages: ["SUBMITTED", "ACCEPTED", "POSTED", "INVOICED", "PAID"] },
  { key: "qa", label: "QA", short: "QA", description: "QA passed · final approval", enumStages: ["QA", "ARCHIVED"] },
];

// Build a fast stage→index lookup from the SPEC_STAGES mapping.
const STAGE_TO_SPEC_INDEX: Map<CampaignStage, number> = (() => {
  const m = new Map<CampaignStage, number>();
  SPEC_STAGES.forEach((s, i) => s.enumStages.forEach((e) => m.set(e, i)));
  return m;
})();

function currentSpecIndex(stage: CampaignStage): number {
  // Direct map first
  const idx = STAGE_TO_SPEC_INDEX.get(stage);
  if (idx !== undefined) return idx;
  // Fallback: unknown stage → 0
  return 0;
}

export function BriefToDeliverableProgressBar({
  campaign,
  className,
}: {
  campaign: Campaign;
  className?: string;
}) {
  const currentIdx = currentSpecIndex(campaign.current_stage);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-baseline justify-between">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Brief → Deliverable · {campaign.brand}
        </div>
        <div className="text-[11px] font-semibold text-iris-600">
          {SPEC_STAGES[currentIdx].label}
        </div>
      </div>

      <ol className="flex w-full items-stretch gap-1">
        {SPEC_STAGES.map((stage, i) => {
          const isPast = i < currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <li
              key={stage.key}
              className="group relative flex-1"
              title={`${stage.label}${isPast ? " ✓ done" : isCurrent ? " · current" : ""}\n${stage.description}`}
            >
              <div
                className={cn(
                  "h-1.5 w-full rounded-full transition-colors",
                  isPast && "bg-emerald-500",
                  isCurrent && "bg-iris-500 animate-pulse",
                  !isPast && !isCurrent && "bg-slate-200",
                )}
              />
              <div
                className={cn(
                  "mt-1.5 text-center text-[9px] font-semibold uppercase tracking-[0.06em] transition-colors",
                  isPast && "text-emerald-700",
                  isCurrent && "text-iris-600",
                  !isPast && !isCurrent && "text-slate-400",
                )}
              >
                {stage.short}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
