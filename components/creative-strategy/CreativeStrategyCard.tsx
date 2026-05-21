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
import type { Campaign } from "@/lib/types/campaign";

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

  return (
    <article className="rounded-3xl bg-white ring-1 ring-cloud-200 shadow-soft p-5 md:p-6 flex flex-col gap-4">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-iris-500">
            Creative Strategy
          </p>
          <h3 className="font-display text-xl font-semibold text-ink-900 mt-1">
            {campaign.brand}
          </h3>
          <p className="text-sm text-ink-600 mt-0.5">{campaign.product}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <StatusChip tone={RISK_TONE[campaign.risk_level] ?? "neutral"}>
            {campaign.risk_level} risk
          </StatusChip>
          {approved ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
              <CheckCircle2 className="h-3 w-3" /> Concept approved
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-ink-400">Concept pending</span>
          )}
        </div>
      </header>

      <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-iris-50 ring-1 ring-iris-100 p-3">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-iris-600 flex items-center gap-1">
            <Target className="h-3 w-3" /> Personal angle
          </dt>
          <dd className="text-xs text-ink-800 mt-1 leading-relaxed">
            {coreAngle || <span className="text-ink-400">Not defined yet</span>}
          </dd>
        </div>
        <div className="rounded-2xl bg-peach-50 ring-1 ring-peach-100 p-3">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-peach-700 flex items-center gap-1">
            <Lightbulb className="h-3 w-3" /> Next action
          </dt>
          <dd className="text-xs text-ink-800 mt-1 leading-relaxed">
            {campaign.next_action || <span className="text-ink-400">No action queued</span>}
          </dd>
        </div>
      </dl>

      {hooks.length > 0 && (
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-500 mb-1.5">
            Hook options ({hooks.length})
          </p>
          <ul className="flex flex-col gap-1.5">
            {hooks.slice(0, 5).map((hook, i) => (
              <li
                key={i}
                className="text-xs text-ink-800 px-3 py-2 rounded-xl bg-cloud-50 ring-1 ring-cloud-100"
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-500 mb-1.5">
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
