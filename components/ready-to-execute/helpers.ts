// Helpers for the "Ready to Execute" maker-mode view.
//
// Sources (Phase A.14e Wave 2 E5):
// - `_meta/dashboard-spec/02-campaign-pipeline-views-architecture.md` section 6
//   "Ready to Execute View" (L431–L512):
//     - "Include Campaigns Where" (L443-L452) — filter logic
//     - "Execution Groups" (L454-L461) — 5 groups
//     - "Key Fields" (L463-L477) — card schema incl. "Estimated Time Needed"
//     - "Filters" (L479-L493) — default + 6 saved chips
//     - "Sort" (L495-L500) — 4 sort options
//     - "Smart Feature" (L502-L510) — Batch Mode suggestions
// - Production-readiness 6-checklist per view #7 "Production Queue" smart
//   feature (L585-L590, extended to 6 per E5 task brief).
// - `lib/scoring/index.ts` — `getMissingInfo` (schema-level critical fields).
//
// Pure functions only — same logic runs SSG + client.

import type { Campaign, CampaignStage } from "@/lib/types/campaign";
import { getMissingInfo } from "@/lib/scoring";

// ──────────────────────────────────────────────────────────────────────────
// Execution Group mapping (spec L454-L461)
// ──────────────────────────────────────────────────────────────────────────

export type ExecutionGroup =
  | "ready_to_script"
  | "ready_to_film"
  | "ready_to_edit"
  | "ready_for_qa"
  | "ready_to_submit";

export const EXECUTION_GROUP_LABEL: Record<ExecutionGroup, string> = {
  ready_to_script: "Ready to Script",
  ready_to_film: "Ready to Film",
  ready_to_edit: "Ready to Edit",
  ready_for_qa: "Ready for QA",
  ready_to_submit: "Ready to Submit",
};

export const EXECUTION_GROUP_ORDER: ExecutionGroup[] = [
  "ready_to_script",
  "ready_to_film",
  "ready_to_edit",
  "ready_for_qa",
  "ready_to_submit",
];

/** Stage → group mapping per spec section 6. */
const STAGE_TO_GROUP: Partial<Record<CampaignStage, ExecutionGroup>> = {
  "SOW REVIEWED": "ready_to_script",
  "STRATEGY READY": "ready_to_script",
  "SCRIPT READY": "ready_to_film",
  FILMING: "ready_to_edit",
  EDITING: "ready_for_qa",
  QA: "ready_to_submit",
  SUBMITTED: "ready_to_submit",
};

export function getExecutionGroup(c: Campaign): ExecutionGroup | null {
  return STAGE_TO_GROUP[c.current_stage] ?? null;
}

// ──────────────────────────────────────────────────────────────────────────
// Default filter (spec L443-L452, L481-L485)
// ──────────────────────────────────────────────────────────────────────────

/**
 * A campaign is "ready to execute" when ALL conditions pass:
 *  1. current_stage ∈ [SOW REVIEWED, STRATEGY READY, SCRIPT READY, FILMING,
 *     EDITING, QA, SUBMITTED]
 *  2. getMissingInfo(c).length === 0 (no schema-level critical gaps)
 *  3. waiting_on_who ∈ [me, none] (not blocked by brand)
 *  4. status !== "archived"
 */
export function isReadyToExecute(c: Campaign): boolean {
  if (c.status === "archived") return false;
  if (getMissingInfo(c).length > 0) return false;
  if (c.waiting_on_who === "brand" || c.waiting_on_who === "platform") {
    return false;
  }
  return getExecutionGroup(c) !== null;
}

// ──────────────────────────────────────────────────────────────────────────
// Estimated Time Needed (spec L475)
// ──────────────────────────────────────────────────────────────────────────

/**
 * Compute "Estimated Time Needed" from deliverable_count + required_format +
 * current execution group. Returns total hours and a human-readable string.
 *
 * Per-deliverable baselines (calibrated against Julz's actual UGC workflow):
 *   - vertical_video talking_head: 1.5h film + 2.5h edit + 0.5h QA
 *   - vertical_video demo/review: 2h film + 3h edit + 0.5h QA
 *   - image/story/carousel:        0.5h shoot + 1h edit + 0.25h QA
 *
 * Only counts time for the CURRENT group + remaining downstream groups.
 */
export function getEstimatedTime(c: Campaign): {
  totalHours: number;
  label: string;
} {
  const count = Math.max(1, c.deliverable_count);

  // per-deliverable hours per stage
  const isVideo = c.required_format === "vertical_video";
  const isHeavy =
    isVideo && (c.campaign_type === "demo" || c.campaign_type === "review");

  const perDeliverable = isVideo
    ? isHeavy
      ? { script: 1, film: 2, edit: 3, qa: 0.5, submit: 0.25 }
      : { script: 0.75, film: 1.5, edit: 2.5, qa: 0.5, submit: 0.25 }
    : { script: 0.5, film: 0.5, edit: 1, qa: 0.25, submit: 0.25 };

  const group = getExecutionGroup(c);
  const stages: Array<keyof typeof perDeliverable> = [];
  if (group === "ready_to_script") stages.push("script", "film", "edit", "qa", "submit");
  else if (group === "ready_to_film") stages.push("film", "edit", "qa", "submit");
  else if (group === "ready_to_edit") stages.push("edit", "qa", "submit");
  else if (group === "ready_for_qa") stages.push("qa", "submit");
  else if (group === "ready_to_submit") stages.push("submit");

  const breakdown = stages
    .map((s) => ({ stage: s, hrs: perDeliverable[s] * count }))
    .filter((x) => x.hrs > 0);

  const totalHours = breakdown.reduce((sum, x) => sum + x.hrs, 0);

  // human label: pick top 2 phases for readability
  const top = breakdown
    .sort((a, b) => b.hrs - a.hrs)
    .slice(0, 2)
    .map((x) => `${formatHrs(x.hrs)} ${x.stage}`);

  const label = top.length > 0 ? `~${top.join(" + ")}` : "—";

  return { totalHours, label };
}

function formatHrs(h: number): string {
  if (h < 1) return `${Math.round(h * 60)} min`;
  return Number.isInteger(h) ? `${h} hr${h === 1 ? "" : "s"}` : `${h} hrs`;
}

// ──────────────────────────────────────────────────────────────────────────
// Production Readiness Score (spec view #7 L585-L590, extended to 6 per E5 brief)
// ──────────────────────────────────────────────────────────────────────────

export type ReadinessChecklistItem = {
  key: string;
  label: string;
  done: boolean;
};

/**
 * 6-checklist scoreboard rendered on each card:
 *   1. Script ready
 *   2. Shot map ready
 *   3. B-roll planned
 *   4. Product screen ready
 *   5. Lighting/audio plan done
 *   6. QA checklist created
 *
 * "Done" derived from current_stage progression:
 *   - past SCRIPT READY → script + shot map ready
 *   - past STRATEGY READY → b-roll + product screen + lighting plan done
 *   - at/past QA → QA checklist exists
 */
export function getProductionReadinessChecklist(c: Campaign): ReadinessChecklistItem[] {
  const stageIdx = STAGE_ORDER.indexOf(c.current_stage);
  const past = (s: CampaignStage) => stageIdx >= STAGE_ORDER.indexOf(s);

  return [
    { key: "script", label: "Script ready", done: past("SCRIPT READY") },
    { key: "shot_map", label: "Shot map ready", done: past("STRATEGY READY") },
    { key: "broll", label: "B-roll planned", done: past("STRATEGY READY") },
    { key: "product_screen", label: "Product screen ready", done: past("SCRIPT READY") },
    { key: "lighting", label: "Lighting / audio plan done", done: past("FILMING") },
    { key: "qa", label: "QA checklist created", done: past("QA") || past("SUBMITTED") },
  ];
}

export function getProductionReadinessPct(c: Campaign): number {
  const list = getProductionReadinessChecklist(c);
  const done = list.filter((i) => i.done).length;
  return Math.round((done / list.length) * 100);
}

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
// Batch Mode Suggestions (spec L502-L510)
// ──────────────────────────────────────────────────────────────────────────

export type BatchSuggestion = {
  id: string;
  title: string;
  detail: string;
  count: number;
  brands: string[];
};

/**
 * Dynamic Batch Mode suggestions per spec. Only surfaces N ≥ 2 patterns.
 *
 * Patterns checked:
 *  1. Film all talking-head hooks together — Ready-to-Film group + talking_head type
 *  2. Record all b-roll for AI tools       — Ready-to-Film + product_category="ai"
 *  3. Edit all captions in one sitting     — Ready-to-Edit group
 *  4. Submit all ready campaigns today     — Ready-to-Submit group
 */
export function getBatchSuggestions(campaigns: Campaign[]): BatchSuggestion[] {
  const out: BatchSuggestion[] = [];

  const filmGroup = campaigns.filter((c) => getExecutionGroup(c) === "ready_to_film");
  const talkingHeads = filmGroup.filter((c) => c.campaign_type === "talking_head");
  if (talkingHeads.length >= 2) {
    out.push({
      id: "batch_talking_heads",
      title: "Film all talking-head hooks together",
      detail: "Same lighting + same outfit + same camera angle. One sitting.",
      count: talkingHeads.length,
      brands: talkingHeads.map((c) => c.brand),
    });
  }

  const aiInFilm = filmGroup.filter((c) => c.product_category === "ai");
  if (aiInFilm.length >= 2) {
    out.push({
      id: "batch_ai_broll",
      title: "Record all b-roll for AI tools",
      detail: "Screen recordings + product UI shots batched in one session.",
      count: aiInFilm.length,
      brands: aiInFilm.map((c) => c.brand),
    });
  }

  const editGroup = campaigns.filter((c) => getExecutionGroup(c) === "ready_to_edit");
  if (editGroup.length >= 2) {
    out.push({
      id: "batch_captions",
      title: "Edit all captions in one sitting",
      detail: "Open CapCut once. Burn captions for every campaign back-to-back.",
      count: editGroup.length,
      brands: editGroup.map((c) => c.brand),
    });
  }

  const submitGroup = campaigns.filter((c) => getExecutionGroup(c) === "ready_to_submit");
  if (submitGroup.length >= 2) {
    out.push({
      id: "batch_submit",
      title: "Submit all ready campaigns today",
      detail: "Upload + tag + send confirmation emails in one pass.",
      count: submitGroup.length,
      brands: submitGroup.map((c) => c.brand),
    });
  }

  return out;
}

// ──────────────────────────────────────────────────────────────────────────
// Saved filter chips (spec L487-L493)
// ──────────────────────────────────────────────────────────────────────────

export type FilterChipKey =
  | "can_finish_today"
  | "needs_filming"
  | "needs_editing"
  | "needs_qa"
  | "portfolio_worthy"
  | "high_value";

export const FILTER_CHIPS: Array<{ key: FilterChipKey; label: string }> = [
  { key: "can_finish_today", label: "Can finish today" },
  { key: "needs_filming", label: "Needs filming" },
  { key: "needs_editing", label: "Needs editing" },
  { key: "needs_qa", label: "Needs QA" },
  { key: "portfolio_worthy", label: "Portfolio-worthy" },
  { key: "high_value", label: "High value" },
];

/** Server-rendered chip counts (page is RSC, no live filtering this wave). */
export function getChipCount(campaigns: Campaign[], key: FilterChipKey): number {
  switch (key) {
    case "can_finish_today":
      return campaigns.filter((c) => getEstimatedTime(c).totalHours <= 4).length;
    case "needs_filming":
      return campaigns.filter((c) => getExecutionGroup(c) === "ready_to_film").length;
    case "needs_editing":
      return campaigns.filter((c) => getExecutionGroup(c) === "ready_to_edit").length;
    case "needs_qa":
      return campaigns.filter((c) => getExecutionGroup(c) === "ready_for_qa").length;
    case "portfolio_worthy":
      // brand fit ≥ 85 → strong portfolio candidate
      return campaigns.filter((c) => (c.brand_fit_score ?? 0) >= 85).length;
    case "high_value":
      return campaigns.filter((c) => (c.total_potential_value ?? 0) >= 400).length;
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Due-date urgency tone (for color-coded due-date pill)
// ──────────────────────────────────────────────────────────────────────────

export type DueTone = "red" | "orange" | "yellow" | "green" | "iris";

export function getDueTone(dueDate: string | undefined): DueTone {
  if (!dueDate) return "iris";
  const days = (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (days < 0) return "red";
  if (days <= 2) return "orange";
  if (days <= 5) return "yellow";
  return "green";
}

export function formatDueLabel(dueDate: string | undefined): string {
  if (!dueDate) return "No deadline";
  const days = Math.round(
    (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days <= 7) return `Due in ${days}d`;
  return new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ──────────────────────────────────────────────────────────────────────────
// Sort (spec L495-L500)
// ──────────────────────────────────────────────────────────────────────────

/**
 * Default sort: due-date soonest → estimated-time shortest → highest value →
 * highest brand fit. Pure comparator chain.
 */
export function sortReadyToExecute(a: Campaign, b: Campaign): number {
  // 1. due date soonest (campaigns without due_date drift to end)
  const aDue = a.due_date ? new Date(a.due_date).getTime() : Number.POSITIVE_INFINITY;
  const bDue = b.due_date ? new Date(b.due_date).getTime() : Number.POSITIVE_INFINITY;
  if (aDue !== bDue) return aDue - bDue;

  // 2. estimated time shortest
  const aTime = getEstimatedTime(a).totalHours;
  const bTime = getEstimatedTime(b).totalHours;
  if (aTime !== bTime) return aTime - bTime;

  // 3. highest value
  const aVal = a.total_potential_value ?? a.base_pay ?? 0;
  const bVal = b.total_potential_value ?? b.base_pay ?? 0;
  if (aVal !== bVal) return bVal - aVal;

  // 4. highest brand fit
  return (b.brand_fit_score ?? 0) - (a.brand_fit_score ?? 0);
}
