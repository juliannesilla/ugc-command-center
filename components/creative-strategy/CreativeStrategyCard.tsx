/**
 * CreativeStrategyCard
 *
 * Spec: `01-initial-dashboard-prompt.md` "NAVIGATION / VIEWS" → "Creative Strategy"
 * Fields: Brand · Product · Audience · Pain point · Personal angle · Positioning ·
 *   Creative concept · Hook options (3-5) · CTA · Risk level · Approved concept ·
 *   Brand fit score.
 *
 * Cross-campaign — one card per campaign. Embeds BrandFitScoreComponent
 * inside collapsed <details> for height control.
 */

import { Lightbulb, Target, ShieldAlert, CheckCircle2 } from "lucide-react";
import { StatusChip } from "@/components/ui/status-chip";
import { BrandFitScoreComponent } from "@/components/smart/BrandFitScoreComponent";
import { getBrandFitScore } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import type { Campaign } from "@/lib/types/campaign";

// Polished micro-donut for brand fit. Mirrors the SOW readiness donut posture
// (top-design + Apple HIG): SVG arc, round linecap, motion-reduce safe,
// transitions only stroke-dashoffset. Sized for header use (40×40).
function BrandFitDonut({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const radius = 16;
  const stroke = 4;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (clamped / 100) * circ;
  const arc =
    clamped >= 80
      ? "#10B981" // emerald-500
      : clamped >= 60
        ? "#9D6BFF" // iris-400 — brand voice for "in the pocket"
        : clamped >= 40
          ? "#F59E0B" // amber-500
          : "#F43F5E"; // rose-500
  const textTone =
    clamped >= 80
      ? "text-emerald-700"
      : clamped >= 60
        ? "text-iris-600"
        : clamped >= 40
          ? "text-amber-700"
          : "text-rose-700";
  return (
    <div
      className="relative h-10 w-10 shrink-0"
      role="img"
      aria-label={`Brand fit ${clamped}%`}
    >
      <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90" aria-hidden>
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke="#EADCFF"
          strokeWidth={stroke}
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke={arc}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            "font-display text-[11px] font-semibold tabular-nums leading-none",
            textTone,
          )}
        >
          {clamped}
        </span>
      </div>
    </div>
  );
}

type ScriptShape = {
  hooks?: string[];
  coreAngle?: string;
  ctas?: {
    primary?: string;
    secondary?: string;
    tertiary?: string;
  };
};

const RISK_TONE: Record<string, "green" | "yellow" | "red"> = {
  low: "green",
  medium: "yellow",
  high: "red",
};

const APPROVED_STAGES = new Set([
  "STRATEGY READY",
  "SCRIPT READY",
  "FILMING",
  "EDITING",
  "QA",
  "SUBMITTED",
  "ACCEPTED",
  "POSTED",
  "INVOICED",
  "PAID",
]);

export function CreativeStrategyCard({
  campaign,
  script,
}: {
  campaign: Campaign;
  script?: ScriptShape;
}) {
  const hooks = script?.hooks ?? [];
  const ctas = script?.ctas ?? {};
  const coreAngle = script?.coreAngle ?? "";
  const approved = APPROVED_STAGES.has(campaign.current_stage);
  const brandFit = campaign.brand_fit_score ?? getBrandFitScore(campaign);

  return (
    <article
      // Polish: emil-design-eng — card lift on hover. Transitions only
      // box-shadow + translate (no layout). motion-reduce safe.
      className="group/card rounded-3xl bg-white ring-1 ring-cloud-200 shadow-soft p-6 flex flex-col gap-4 transition-[box-shadow,transform] duration-300 ease-out hover:shadow-card hover:ring-iris-200 hover:-translate-y-px motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-iris-500">
            Creative Strategy
          </p>
          <h3 className="font-display text-[22px] font-bold tracking-tight text-ink-900 mt-1">
            {campaign.brand}
          </h3>
          <p className="text-sm text-ink-600 mt-0.5">{campaign.product}</p>
        </div>
        <div className="flex items-start gap-3 shrink-0">
          {/* Brand-fit micro-donut — polished SVG arc, surfaces the score
              at-a-glance without expanding the collapsed details below. */}
          <BrandFitDonut score={brandFit} />
          <div className="flex flex-col items-end gap-1.5">
            <StatusChip tone={RISK_TONE[campaign.risk_level] ?? "neutral"}>
              {campaign.risk_level} risk
            </StatusChip>
            {approved ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> Concept approved
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-ink-600">Concept pending</span>
            )}
          </div>
        </div>
      </header>

      <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        {/* Concept-card hover polish — subtle ring tone shift, no layout move. */}
        <div className="rounded-2xl bg-iris-50 ring-1 ring-iris-100 p-3 transition-colors duration-200 ease-out hover:bg-iris-50/80 hover:ring-iris-200 motion-reduce:transition-none">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-iris-600 flex items-center gap-1">
            <Target className="h-3 w-3" /> Personal angle
          </dt>
          <dd className="text-xs text-ink-800 mt-1 leading-relaxed">
            {coreAngle || <span className="text-ink-600">Not defined yet</span>}
          </dd>
        </div>
        <div className="rounded-2xl bg-peach-100/60 ring-1 ring-peach-100 p-3 transition-colors duration-200 ease-out hover:bg-peach-100/80 hover:ring-peach-300 motion-reduce:transition-none">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-peach-500 flex items-center gap-1">
            <Lightbulb className="h-3 w-3" /> Next action
          </dt>
          <dd className="text-xs text-ink-800 mt-1 leading-relaxed">
            {campaign.next_action || <span className="text-ink-600">No action queued</span>}
          </dd>
        </div>
      </dl>

      {hooks.length > 0 && (
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-700 mb-1.5">
            Hook options ({hooks.length})
          </p>
          <ul className="flex flex-col gap-1.5">
            {hooks.slice(0, 5).map((hook, i) => (
              <li
                key={i}
                className="text-xs text-ink-800 px-3 py-2 rounded-xl bg-cloud-50 ring-1 ring-cloud-100 transition-colors duration-200 ease-out hover:bg-iris-50/50 hover:ring-iris-200 motion-reduce:transition-none"
              >
                <span className="text-iris-500 font-semibold mr-1.5">{i + 1}.</span>
                {hook}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(ctas.primary || ctas.secondary || ctas.tertiary) && (
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-700 mb-1.5">
            CTAs
          </p>
          <ul className="flex flex-col gap-1 text-xs text-ink-800">
            {ctas.primary && (
              <li>
                <strong className="text-iris-600">Primary:</strong> {ctas.primary}
              </li>
            )}
            {ctas.secondary && (
              <li>
                <strong className="text-iris-600">Secondary:</strong> {ctas.secondary}
              </li>
            )}
            {ctas.tertiary && (
              <li>
                <strong className="text-iris-600">Tertiary:</strong> {ctas.tertiary}
              </li>
            )}
          </ul>
        </section>
      )}

      <details className="rounded-2xl bg-cloud-50 ring-1 ring-cloud-100">
        <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-ink-700 flex items-center gap-1.5">
          <ShieldAlert className="h-3 w-3 text-iris-500" />
          Show brand fit breakdown
        </summary>
        <div className="p-3 pt-0">
          <BrandFitScoreComponent campaign={campaign} />
        </div>
      </details>
    </article>
  );
}

export default CreativeStrategyCard;
