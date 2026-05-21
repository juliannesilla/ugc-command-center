/**
 * ReadinessScoreBadge — visualizes the 0-100 readiness score computed by
 * `getReadinessScore` per "Campaign Readiness Score" spec
 * (`01-initial-dashboard-prompt.md` L550-L568).
 *
 * Sizes:
 *   - sm: small pill with %
 *   - md: pill + tier label
 *   - lg: progress bar + % + tier label + breakdown tooltip (8 sub-checks)
 *
 * Tiers (per spec):
 *   0-30  → Not Ready
 *   31-60 → Partial
 *   61-85 → Almost Ready
 *   86-100 → Ready
 *
 * Used by: PipelineCard, Database row, Overview pipeline snapshot.
 */

import { cn } from "@/lib/utils";
import { getReadinessScore } from "@/lib/scoring";
import type { Campaign } from "@/lib/types/campaign";

type Size = "sm" | "md" | "lg";

interface Tier {
  label: string;
  text: string;
  bg: string;
  ring: string;
  bar: string;
}

function tierFor(score: number): Tier {
  if (score >= 86) return { label: "Ready", text: "text-emerald-800", bg: "bg-emerald-100", ring: "ring-emerald-200", bar: "bg-emerald-500" };
  if (score >= 61) return { label: "Almost Ready", text: "text-sky-800", bg: "bg-sky-100", ring: "ring-sky-200", bar: "bg-sky-500" };
  if (score >= 31) return { label: "Partial", text: "text-orange-800", bg: "bg-orange-100", ring: "ring-orange-200", bar: "bg-orange-500" };
  return { label: "Not Ready", text: "text-rose-800", bg: "bg-rose-100", ring: "ring-rose-200", bar: "bg-rose-500" };
}

// 8 sub-checks from spec L551-L568 — surfaced in `lg` tooltip
const SUB_CHECKS = [
  "SOW complete",
  "Product understood",
  "Positioning defined",
  "Script ready",
  "Shot map ready",
  "Film checklist ready",
  "QA passed",
  "Submission materials ready",
];

export function ReadinessScoreBadge({
  campaign,
  size = "md",
  className,
}: {
  campaign: Campaign;
  size?: Size;
  className?: string;
}) {
  const score = campaign.readiness_score ?? getReadinessScore(campaign);
  const tier = tierFor(score);

  if (size === "sm") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-semibold tabular-nums ring-1",
          tier.bg,
          tier.text,
          tier.ring,
          className,
        )}
        title={`${tier.label} — ${score}%`}
      >
        {score}%
      </span>
    );
  }

  if (size === "md") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1",
          tier.bg,
          tier.text,
          tier.ring,
          className,
        )}
        title={`${tier.label} — ${score}%`}
      >
        <span className="tabular-nums">{score}%</span>
        <span className="text-[10px] uppercase tracking-[0.08em] opacity-80">{tier.label}</span>
      </span>
    );
  }

  // lg
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Readiness
        </div>
        <div className={cn("text-xs font-semibold", tier.text)}>
          <span className="tabular-nums">{score}%</span> · {tier.label}
        </div>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
        title={`8-check breakdown:\n${SUB_CHECKS.map((s) => `· ${s}`).join("\n")}`}
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn("h-full rounded-full transition-all", tier.bar)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
