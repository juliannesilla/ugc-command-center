/**
 * RedGreenFlagScan
 *
 * Spec: `01-initial-dashboard-prompt.md` L594-L608 — Red Flag / Green Flag Scan.
 *   "Create a panel that flags:
 *    - unclear payment · no usage rights stated · unpaid test video ·
 *      vague deliverables · unrealistic posting volume · missing deadline
 *    - promising campaign · high pay per video · aligned with my niche ·
 *      repeat work potential · strong portfolio value · brand responsiveness"
 *
 * Algorithm: inspect Campaign fields against threshold rules. Each rule
 * returns a flag entry { tone, label, detail }. Empty result = balanced
 * campaign — show a calm "no flags" empty state.
 *
 * No mutation: this is a pure read-only diagnostic panel.
 */

import { ShieldAlert, ShieldCheck, Sparkles } from "lucide-react";
import { getBrandFitScore } from "@/lib/scoring";
import type { Campaign } from "@/lib/types/campaign";

type Flag = {
  tone: "red" | "green";
  label: string;
  detail: string;
};

/** Pure: derive every flag the campaign trips against the spec rules. */
function scanCampaign(c: Campaign): Flag[] {
  const flags: Flag[] = [];
  const fit = c.brand_fit_score ?? getBrandFitScore(c);
  const value = c.total_potential_value ?? c.base_pay ?? 0;

  // ── 🔴 RED FLAGS ───────────────────────────────────────────────────────
  // Unclear payment — no base + no bonus stated
  if (c.base_pay === undefined && c.bonus_potential === undefined) {
    flags.push({
      tone: "red",
      label: "Unclear payment",
      detail: "No base pay or bonus structure on file — ask before locking concepts.",
    });
  }
  // No usage rights — heuristic: SOW not yet received past initial stages
  if (
    !c.sow_link &&
    (c.current_stage === "RESPONDED" ||
      c.current_stage === "WAITING ON BRAND" ||
      c.current_stage === "CALL SCHEDULED")
  ) {
    flags.push({
      tone: "red",
      label: "Usage rights unclear",
      detail: "No SOW link yet — usage / posting rights aren't documented in writing.",
    });
  }
  // Unpaid test video — base pay 0 but deliverable_count >= 1
  if (c.base_pay === 0 && c.deliverable_count >= 1) {
    flags.push({
      tone: "red",
      label: "Unpaid test video",
      detail: "Brand expects deliverable(s) at $0 base — confirm this is paid before filming.",
    });
  }
  // Vague deliverables — count missing or zero past the early discovery stage
  if (
    (c.deliverable_count <= 0 || Number.isNaN(c.deliverable_count)) &&
    c.current_stage !== "NEW LEAD" &&
    c.current_stage !== "APPLIED"
  ) {
    flags.push({
      tone: "red",
      label: "Vague deliverables",
      detail: "Deliverable count not pinned down — request a number in the SOW.",
    });
  }
  // Unrealistic posting volume — heuristic: high count with low budget
  if (c.deliverable_count >= 5 && value > 0 && value / c.deliverable_count < 75) {
    flags.push({
      tone: "red",
      label: "Unrealistic posting volume",
      detail: `${c.deliverable_count} deliverables at <$75 each — push back on scope or pay.`,
    });
  }
  // Missing deadline
  if (!c.due_date) {
    flags.push({
      tone: "red",
      label: "Missing deadline",
      detail: "No due date on file — request a written deadline before filming.",
    });
  }

  // ── 🟢 GREEN FLAGS ──────────────────────────────────────────────────────
  // Promising campaign — high priority + brand fit >= 75
  if (c.priority === "high" && fit >= 75) {
    flags.push({
      tone: "green",
      label: "Promising campaign",
      detail: "High priority + strong niche fit — invest extra prep cycles here.",
    });
  }
  // High pay per video
  if (c.deliverable_count > 0 && value / c.deliverable_count >= 200) {
    flags.push({
      tone: "green",
      label: "High pay per video",
      detail: `~$${Math.round(value / c.deliverable_count).toLocaleString()}/video — well above floor.`,
    });
  }
  // Aligned with niche — brand fit >= 80
  if (fit >= 80) {
    flags.push({
      tone: "green",
      label: "Aligned with my niche",
      detail: `Brand fit ${fit}% — sits inside AI / creator-tools / workflow lane.`,
    });
  }
  // Repeat work potential — explicit CRM field
  if (c.repeat_potential === "high") {
    flags.push({
      tone: "green",
      label: "Repeat work potential",
      detail: "Logged as high repeat potential — pitch a renewal post-Paid.",
    });
  }
  // Strong portfolio value — value plus posted_link present
  if (value >= 500 && (c.posted_link || c.submission_link)) {
    flags.push({
      tone: "green",
      label: "Strong portfolio value",
      detail: "$500+ deliverable with a posted/submitted link — case-study eligible.",
    });
  }
  // Brand responsiveness
  if (c.communication_quality === "fast") {
    flags.push({
      tone: "green",
      label: "Brand responsiveness",
      detail: "Communication logged as fast — keep momentum, low friction wins here.",
    });
  }

  return flags;
}

type Props = { campaign: Campaign };

export function RedGreenFlagScan({ campaign }: Props) {
  const flags = scanCampaign(campaign);
  const reds = flags.filter((f) => f.tone === "red");
  const greens = flags.filter((f) => f.tone === "green");

  return (
    <section className="rounded-3xl bg-white shadow-soft ring-1 ring-iris-100 p-6 md:p-7">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-cloud-700 font-semibold">
            Red / Green Flag Scan
          </p>
          <h2 className="mt-1 font-display text-[22px] font-bold tracking-tight text-ink-900 leading-tight">
            {campaign.brand} signal check
          </h2>
        </div>
        <div className="text-right text-[11px] text-ink-700">
          <div>
            <span className="font-semibold text-rose-600">{reds.length}</span> red ·{" "}
            <span className="font-semibold text-emerald-600">{greens.length}</span> green
          </div>
        </div>
      </header>

      {flags.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-cloud-50/60 p-6 text-center ring-1 ring-cloud-100">
          <Sparkles className="mx-auto h-6 w-6 text-cloud-500" />
          <p className="mt-2 text-sm text-ink-700 font-semibold">No flags detected</p>
          <p className="mt-1 text-[13px] text-ink-700">
            Campaign looks balanced — no red blockers, no green standouts yet.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {/* RED column */}
          <div>
            <div className="flex items-center gap-2 text-rose-700">
              <ShieldAlert className="h-4 w-4" />
              <span className="text-[11px] uppercase tracking-[0.16em] font-semibold">
                Red flags ({reds.length})
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {reds.length === 0 ? (
                <li className="text-[13px] text-ink-700 italic">None detected.</li>
              ) : (
                reds.map((f) => (
                  <li
                    key={`red-${f.label}`}
                    className="rounded-2xl bg-rose-50/70 ring-1 ring-rose-100 p-3"
                  >
                    <p className="text-[13px] font-semibold text-rose-900">🔴 {f.label}</p>
                    <p className="mt-1 text-[12px] text-ink-700 leading-relaxed">{f.detail}</p>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* GREEN column */}
          <div>
            <div className="flex items-center gap-2 text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[11px] uppercase tracking-[0.16em] font-semibold">
                Green flags ({greens.length})
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {greens.length === 0 ? (
                <li className="text-[13px] text-ink-700 italic">None detected.</li>
              ) : (
                greens.map((f) => (
                  <li
                    key={`green-${f.label}`}
                    className="rounded-2xl bg-emerald-50/70 ring-1 ring-emerald-100 p-3"
                  >
                    <p className="text-[13px] font-semibold text-emerald-900">🟢 {f.label}</p>
                    <p className="mt-1 text-[12px] text-ink-700 leading-relaxed">{f.detail}</p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
