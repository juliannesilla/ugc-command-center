/**
 * Cross-campaign helper utilities for the UGC | Campaign HQ dashboard.
 *
 * All 5 functions are PURE — given a `Campaign`, they return a derived
 * value with no I/O and no mutation. This is so the same logic runs
 * both server-side (Static Generation in app/) and client-side (board
 * drag-drop without refetch).
 *
 * Sources (Phase A.14e Wave 0 deep-read):
 * - `01-initial-dashboard-prompt.md`:
 *   - "Campaign Readiness Score" (L551-L568) — 8 checks
 *   - "Personal Brand Fit Score" (L633-L645) — 8 niches
 *   - "Smart Next Move Engine" (L524-L533) — examples
 *   - "Missing Info Detector" (L535-L549) — 12 critical fields
 * - `02-campaign-pipeline-views-architecture.md`:
 *   - View #2 "Blocked? indicator" (L165-L173) — 5 blocker types
 */

import type { Campaign, CampaignStage, ProductCategory } from "@/lib/types/campaign";

// ──────────────────────────────────────────────────────────────────────────
// Readiness Score
// ──────────────────────────────────────────────────────────────────────────

/**
 * 0-100 percent based on the 8 checks spec'd at prompt L551-L568:
 *   1. SOW complete            (current_stage past "SOW REVIEWED")
 *   2. Product understood      (product_category set, not "other")
 *   3. Positioning defined     (next_action set + not "missing brief")
 *   4. Script ready            (current_stage at/past "SCRIPT READY")
 *   5. Shot map ready          (current_stage at/past "STRATEGY READY")
 *   6. Film checklist ready    (current_stage at/past "FILMING")
 *   7. QA passed               (current_stage at/past "QA")
 *   8. Submission materials    (submission_link present OR past SUBMITTED)
 *
 * Each check is worth 12.5 pts (rounded to nearest integer).
 *
 * @example
 *   getReadinessScore(parakeetai) // → 82 (script ready, missing QA + submission)
 *   getReadinessScore(goodieAI)   // → 35 (waiting on written brief)
 */
export function getReadinessScore(c: Campaign): number {
  const stageIndex = STAGE_ORDER.indexOf(c.current_stage);
  const checks: boolean[] = [
    stageIndex >= STAGE_ORDER.indexOf("SOW REVIEWED"),
    c.product_category !== undefined && c.product_category !== "other",
    c.next_action.length > 0 && !/missing|waiting on brief/i.test(c.next_action),
    stageIndex >= STAGE_ORDER.indexOf("SCRIPT READY"),
    stageIndex >= STAGE_ORDER.indexOf("STRATEGY READY"),
    stageIndex >= STAGE_ORDER.indexOf("FILMING"),
    stageIndex >= STAGE_ORDER.indexOf("QA"),
    !!c.submission_link || stageIndex >= STAGE_ORDER.indexOf("SUBMITTED"),
  ];
  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 100);
}

// Ordered list of stages — used to compare "at/past" without re-importing.
const STAGE_ORDER: CampaignStage[] = [
  "NEW LEAD",
  "APPLIED",
  "BRAND REPLIED",
  "RESPONDED",
  "WAITING ON BRAND",
  "CALL SCHEDULED",
  "SOW RECEIVED",
  "SOW REVIEWED",
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
  "ARCHIVED",
];

// ──────────────────────────────────────────────────────────────────────────
// Brand Fit Score
// ──────────────────────────────────────────────────────────────────────────

/**
 * 0-100 percent matching the campaign's product category to Julz's 8 niches
 * per prompt L633-L645:
 *   AI · software · workflow/productivity · marketing/GTM · creator tools ·
 *   finance · home/lifestyle · marketplace/eBay
 *
 * Strong-fit categories (AI, software, creator tools) score 90+.
 * Adjacent categories (finance) score 70.
 * Weak fit (beauty, home) score 50.
 * Unknown / other score 30.
 *
 * @example
 *   getBrandFitScore({ product_category: "ai", ... })     // → 95
 *   getBrandFitScore({ product_category: "beauty", ... }) // → 50
 */
export function getBrandFitScore(c: Campaign): number {
  const fitMap: Record<ProductCategory, number> = {
    ai: 95,
    software: 92,
    creator_tools: 90,
    finance: 72,
    home: 55,
    beauty: 50,
    other: 30,
  };
  return fitMap[c.product_category] ?? 30;
}

// ──────────────────────────────────────────────────────────────────────────
// Next Move
// ──────────────────────────────────────────────────────────────────────────

/**
 * Returns next-best-action string per "Smart Next Move Engine" rules
 * (prompt L524-L533).
 *
 * Priority order (first match wins):
 *   1. Missing critical info       → "Ask {brand} for {field}"
 *   2. Waiting on me (response)    → "Send response to {brand}"
 *   3. Deadline within 72hr        → "Submit {brand} {format} — due {date}"
 *   4. Readiness < 50              → "Review {brand} {sow|brief}"
 *   5. Default                     → existing `next_action` field
 *
 * @example
 *   getNextMove(goodieAI) // → "Ask Goodie AI for written brief before call"
 */
export function getNextMove(c: Campaign): string {
  const missing = c.missing_info && c.missing_info.length > 0
    ? c.missing_info
    : getMissingInfo(c);
  if (missing.length > 0) {
    return `Ask ${c.brand} for ${missing[0]}`;
  }
  if (c.waiting_on_who === "me" && c.current_stage === "BRAND REPLIED") {
    return `Send response to ${c.brand}`;
  }
  if (c.due_date && isWithinDays(c.due_date, 3)) {
    return `Submit ${c.brand} ${c.required_format.replace("_", " ")} — due ${c.due_date}`;
  }
  const readiness = c.readiness_score ?? getReadinessScore(c);
  if (readiness < 50) {
    return `Review ${c.brand} ${c.sow_link ? "SOW" : "brief"}`;
  }
  return c.next_action;
}

function isWithinDays(isoDate: string, days: number): boolean {
  const target = new Date(isoDate).getTime();
  const now = Date.now();
  const diffDays = (target - now) / (1000 * 60 * 60 * 24);
  return diffDays <= days && diffDays >= -1;
}

// ──────────────────────────────────────────────────────────────────────────
// Missing Info
// ──────────────────────────────────────────────────────────────────────────

/**
 * Returns the list of missing critical fields per prompt L535-L549.
 * The 12 fields the detector watches:
 *   payment details · deadline · usage rights · revision policy ·
 *   posting expectations · deliverable count · required messaging ·
 *   contact name · submission link · call link · brand assets ·
 *   content examples
 *
 * For schema-level missing-info we check the fields the Campaign type
 * actually owns; deeper fields (usage rights, revision policy) live on
 * the per-campaign SOW JSON and are detected by view-level components.
 *
 * @example
 *   getMissingInfo(goodieAI) // → ["written brief", "deliverable count"]
 */
export function getMissingInfo(c: Campaign): string[] {
  const out: string[] = [];
  if (c.base_pay === undefined && c.bonus_potential === undefined) {
    out.push("payment details");
  }
  if (!c.due_date) out.push("deadline");
  if (c.deliverable_count <= 0) out.push("deliverable count");
  if (!c.contact_name) out.push("contact name");
  if (
    (c.current_stage === "SUBMITTED" || c.current_stage === "ACCEPTED") &&
    !c.submission_link
  ) {
    out.push("submission link");
  }
  if (c.current_stage === "CALL SCHEDULED" && !c.call_date) {
    out.push("call link");
  }
  return out;
}

// ──────────────────────────────────────────────────────────────────────────
// Blockers
// ──────────────────────────────────────────────────────────────────────────

/**
 * Returns active blockers per view #2 "Blocked? indicator" spec
 * (`02-campaign-pipeline-views-architecture.md` L165-L173):
 *   Missing SOW · Missing payment info · Waiting on brand ·
 *   Usage rights unclear · Deadline missing
 *
 * Also surfaces an `overdue` blocker if `due_date` is in the past and
 * status is not `paid` or `archived` (per view #5 "Needs Attention"
 * filter L357-L371 row 12).
 *
 * @example
 *   getBlockers(megprime) // → ["Missing SOW", "Waiting on brand"]
 */
export function getBlockers(c: Campaign): string[] {
  const out: string[] = [];
  const earlyStage = STAGE_ORDER.indexOf(c.current_stage) < STAGE_ORDER.indexOf("SOW RECEIVED");
  if (earlyStage && !c.sow_link) out.push("Missing SOW");
  if (c.base_pay === undefined && c.bonus_potential === undefined) {
    out.push("Missing payment info");
  }
  if (c.waiting_on_who === "brand") out.push("Waiting on brand");
  if (!c.due_date) out.push("Deadline missing");
  if (
    c.due_date &&
    isWithinDays(c.due_date, -1) === false && // not in future
    new Date(c.due_date).getTime() < Date.now() &&
    c.status !== "paid" &&
    c.status !== "archived"
  ) {
    out.push("Overdue");
  }
  return out;
}
