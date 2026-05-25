/**
 * QAMatrix
 *
 * Spec: `01-initial-dashboard-prompt.md` "NAVIGATION / VIEWS" → "QA"
 * 10 QA categories per deliverable:
 *   SOW fit · Product clarity · Tone fit · Personal brand fit · Hook strength ·
 *   Retention potential · Technical quality · Brand safety · Privacy/safety ·
 *   Submission readiness
 *
 * Cross-campaign matrix: rows = campaigns, columns = 10 QA categories.
 * Each cell shows pass/fail/pending with score.
 *
 * Owned by E15 (Phase A.14e Wave 6).
 */

import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import type { Campaign } from "@/lib/types/campaign";

export const QA_CATEGORIES = [
  { key: "sow_fit", label: "SOW fit" },
  { key: "product_clarity", label: "Product clarity" },
  { key: "tone_fit", label: "Tone fit" },
  { key: "personal_brand", label: "Personal brand" },
  { key: "hook_strength", label: "Hook strength" },
  { key: "retention", label: "Retention potential" },
  { key: "technical", label: "Technical quality" },
  { key: "brand_safety", label: "Brand safety" },
  { key: "privacy", label: "Privacy / safety" },
  { key: "submission_ready", label: "Submission readiness" },
] as const;

type QAStatus = "pass" | "fail" | "pending" | "n/a";

/** Derive a mock QA state per category for a campaign based on stage progression. */
function deriveQA(campaign: Campaign): Record<string, QAStatus> {
  const stage = campaign.current_stage;
  const readiness = campaign.readiness_score ?? 0;

  // Pre-script stages: most QA is N/A
  const preScript = new Set<string>([
    "NEW LEAD",
    "APPLIED",
    "BRAND REPLIED",
    "RESPONDED",
    "WAITING ON BRAND",
    "CALL SCHEDULED",
    "SOW RECEIVED",
    "SOW REVIEWED",
  ]);
  if (preScript.has(stage)) {
    return Object.fromEntries(QA_CATEGORIES.map((c) => [c.key, "n/a" as QAStatus]));
  }

  // Strategy/script stage: SOW + tone + personal brand checks active
  if (stage === "STRATEGY READY" || stage === "SCRIPT READY") {
    return {
      sow_fit: readiness >= 60 ? "pass" : "pending",
      product_clarity: readiness >= 60 ? "pass" : "pending",
      tone_fit: "pending",
      personal_brand: "pending",
      hook_strength: "pending",
      retention: "n/a",
      technical: "n/a",
      brand_safety: "pending",
      privacy: "pending",
      submission_ready: "n/a",
    };
  }

  // Production stage: more checks running
  if (stage === "FILMING" || stage === "EDITING" || stage === "QA") {
    return {
      sow_fit: "pass",
      product_clarity: "pass",
      tone_fit: readiness >= 70 ? "pass" : "pending",
      personal_brand: "pass",
      hook_strength: readiness >= 70 ? "pass" : "pending",
      retention: "pending",
      technical: stage === "QA" ? "pending" : "pending",
      brand_safety: "pass",
      privacy: "pass",
      submission_ready: stage === "QA" ? "pending" : "n/a",
    };
  }

  // Submitted onward: full pass expected
  return Object.fromEntries(QA_CATEGORIES.map((c) => [c.key, "pass" as QAStatus]));
}

const STATUS_TONE: Record<QAStatus, { bg: string; text: string; icon: typeof ShieldCheck }> = {
  pass: { bg: "bg-emerald-50 ring-emerald-200", text: "text-emerald-700", icon: ShieldCheck },
  fail: { bg: "bg-rose-50 ring-rose-200", text: "text-rose-700", icon: ShieldAlert },
  pending: { bg: "bg-amber-50 ring-amber-200", text: "text-amber-700", icon: ShieldQuestion },
  "n/a": { bg: "bg-cloud-50 ring-cloud-200", text: "text-ink-400", icon: ShieldQuestion },
};

export function QAMatrix({ campaigns }: { campaigns: Campaign[] }) {
  if (campaigns.length === 0) {
    // A.14m T5: .card-hero + .section-title + .section-subtitle utilities.
    return (
      <div className="card-hero !p-10 ring-cloud-200 text-center">
        <ShieldCheck className="h-10 w-10 text-iris-300 mx-auto mb-3" aria-hidden="true" />
        <h3 className="section-title">
          No deliverables awaiting QA right now.
        </h3>
        <p className="section-subtitle mt-2">
          QA checkpoints surface when campaigns enter Strategy Ready or beyond.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white ring-1 ring-cloud-200 shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-cloud-50">
            <tr>
              <th className="sticky left-0 z-10 bg-cloud-50 text-left px-4 py-3 font-semibold text-ink-700 min-w-[180px]">
                Campaign
              </th>
              {QA_CATEGORIES.map((c) => (
                <th
                  key={c.key}
                  className="px-3 py-3 font-semibold text-ink-700 text-center min-w-[110px]"
                >
                  {c.label}
                </th>
              ))}
              <th className="px-3 py-3 font-semibold text-ink-700 text-center min-w-[80px]">
                Pass rate
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cloud-100">
            {campaigns.map((campaign) => {
              const qa = deriveQA(campaign);
              const passCount = Object.values(qa).filter((s) => s === "pass").length;
              const activeCount = Object.values(qa).filter((s) => s !== "n/a").length;
              const passRate = activeCount > 0
                ? Math.round((passCount / activeCount) * 100)
                : 0;
              return (
                <tr
                  key={campaign.campaign_id}
                  // Polish: row hover with deeper iris wash. Sticky left
                  // column also inherits the hover bg so it doesn't visually
                  // detach from the row. Transition only on color.
                  className="group/qa-row transition-colors duration-200 ease-out hover:bg-iris-50/50 motion-reduce:transition-none"
                >
                  <td className="sticky left-0 z-10 bg-white group-hover/qa-row:bg-iris-50/80 px-4 py-3 align-top transition-colors duration-200 ease-out motion-reduce:transition-none">
                    <div className="font-semibold text-ink-900">{campaign.brand}</div>
                    <div className="text-[10px] text-ink-500 mt-0.5 truncate max-w-[160px]">
                      {campaign.product}
                    </div>
                    <div className="text-[10px] text-iris-600 mt-0.5">
                      {campaign.current_stage.replace(/_/g, " ").toLowerCase()}
                    </div>
                  </td>
                  {QA_CATEGORIES.map((c) => {
                    const status = qa[c.key];
                    const tone = STATUS_TONE[status];
                    const Icon = tone.icon;
                    // Choreograph the pass/fail color reveal. On row hover,
                    // pass cells subtly bloom (ring tightens), fail cells
                    // pulse a brighter rose, pending cells warm to amber.
                    // emil-design-eng: transition only ring/shadow/scale —
                    // never width/height. microinteractions: 200ms ease-out.
                    const hoverBloom =
                      status === "pass"
                        ? "group-hover/qa-row:ring-emerald-300 group-hover/qa-row:shadow-[0_0_0_3px_rgba(16,185,129,0.10)]"
                        : status === "fail"
                          ? "group-hover/qa-row:ring-rose-300 group-hover/qa-row:shadow-[0_0_0_3px_rgba(244,63,94,0.12)]"
                          : status === "pending"
                            ? "group-hover/qa-row:ring-amber-300 group-hover/qa-row:shadow-[0_0_0_3px_rgba(245,158,11,0.10)]"
                            : "group-hover/qa-row:ring-cloud-300";
                    return (
                      <td key={c.key} className="px-2 py-3 align-top text-center">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full ring-1 transition-[box-shadow,--tw-ring-color] duration-200 ease-out motion-reduce:transition-none ${tone.bg} ${hoverBloom}`}
                          title={`${c.label}: ${status}`}
                        >
                          <Icon className={`h-4 w-4 ${tone.text}`} />
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 text-center align-top">
                    <span
                      className={`font-display text-base font-semibold tabular-nums ${
                        passRate >= 80
                          ? "text-emerald-700"
                          : passRate >= 50
                          ? "text-amber-700"
                          : "text-ink-500"
                      }`}
                    >
                      {activeCount > 0 ? `${passRate}%` : "—"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default QAMatrix;
