// Helpers for the Production Queue view — film/edit workflow Kanban.
//
// Source (Phase A.14e Wave 3 E6):
// - `_meta/dashboard-spec/02-campaign-pipeline-views-architecture.md` section 7
//   "Production Queue View" (L514-L594):
//     - Purpose: "film/edit workflow board" (L518)
//     - Layout: "Kanban or table grouped by production status" (L524)
//     - 13 production statuses (L526-L540)
//     - Key Fields (L542-L562) — 14-field card schema
//     - Filters (L564-L576) — default + 7 saved chips
//     - Sort (L578-L584) — 4 sort options
//     - Smart Feature (L586-L594) — production readiness 6-checklist
//
// Cards are PER-DELIVERABLE (not per-campaign). One campaign with
// `deliverable_count = N` produces N cards in the queue. Per-deliverable
// status is derived from the campaign's `current_stage` + `productionData`
// JSON (filming/edit/QA checklist completion).
//
// Pure functions only — same logic runs SSG + client.

import type { Campaign, CampaignStage } from "@/lib/types/campaign";

// ──────────────────────────────────────────────────────────────────────────
// 13 Production Statuses (spec L526-L540) — single source of truth
// ──────────────────────────────────────────────────────────────────────────

export type ProductionStatus =
  | "not_started"
  | "script_ready"
  | "shot_map_ready"
  | "b_roll_needed"
  | "filming_scheduled"
  | "filmed"
  | "editing"
  | "captions_needed"
  | "qa_needed"
  | "exported"
  | "submitted"
  | "revision_needed"
  | "final_approved";

export const PRODUCTION_STATUS_LABEL: Record<ProductionStatus, string> = {
  not_started: "Not Started",
  script_ready: "Script Ready",
  shot_map_ready: "Shot Map Ready",
  b_roll_needed: "B-Roll Needed",
  filming_scheduled: "Filming Scheduled",
  filmed: "Filmed",
  editing: "Editing",
  captions_needed: "Captions Needed",
  qa_needed: "QA Needed",
  exported: "Exported",
  submitted: "Submitted",
  revision_needed: "Revision Needed",
  final_approved: "Final Approved",
};

/** Ordered exactly per spec L528-L540. */
export const PRODUCTION_STATUS_ORDER: ProductionStatus[] = [
  "not_started",
  "script_ready",
  "shot_map_ready",
  "b_roll_needed",
  "filming_scheduled",
  "filmed",
  "editing",
  "captions_needed",
  "qa_needed",
  "exported",
  "submitted",
  "revision_needed",
  "final_approved",
];

// Column accent tones — each maps to an existing palette swatch.
type ColumnAccent =
  | "pink"
  | "iris"
  | "peach"
  | "orange"
  | "amber"
  | "emerald"
  | "rose"
  | "sky"
  | "ink";

export const PRODUCTION_STATUS_ACCENT: Record<ProductionStatus, ColumnAccent> = {
  not_started: "ink",
  script_ready: "iris",
  shot_map_ready: "iris",
  b_roll_needed: "amber",
  filming_scheduled: "peach",
  filmed: "peach",
  editing: "orange",
  captions_needed: "orange",
  qa_needed: "sky",
  exported: "emerald",
  submitted: "emerald",
  revision_needed: "rose",
  final_approved: "pink",
};

// ──────────────────────────────────────────────────────────────────────────
// Production data shape (mirrors lib/mock-data/campaigns/*/production.json)
// ──────────────────────────────────────────────────────────────────────────

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface ShotMapScene {
  scene: number;
  visual: string;
  duration: string;
  status: string;
}

export interface FilmingStatus {
  status: string;
  scheduledAt?: string;
  scheduledDate?: string | null;
  location?: string;
  blockReason?: string;
}

export interface ProductionPayload {
  productionStage: number;
  shotMap: ShotMapScene[];
  brollChecklist: ChecklistItem[];
  talkingHeadChecklist: ChecklistItem[];
  editChecklist: ChecklistItem[];
  filmingStatus: FilmingStatus;
}

// ──────────────────────────────────────────────────────────────────────────
// Deliverable — per-card row built from campaign + production payload
// ──────────────────────────────────────────────────────────────────────────

export interface DeliverableCard {
  /** Stable key: `${campaign_id}::${index}` so React lists are happy. */
  key: string;
  campaign: Campaign;
  /** 1-based index for multi-deliverable campaigns ("Deliverable 1 of 3"). */
  index: number;
  total: number;
  /** Display name — falls back to "Deliverable N · {brand}" if no script title. */
  deliverableName: string;
  format: string;
  length?: string;
  hookSelected: boolean;
  productionStatus: ProductionStatus;
  scriptStatus: string;
  shotMapStatus: string;
  brollStatus: string;
  screenRecordingStatus: string;
  filmStatus: string;
  editStatus: string;
  captionsStatus: string;
  qaStatus: string;
  submissionStatus: string;
  dueDate?: string;
  notes?: string;
  /** Optional payload — null if campaign has no per-stage JSON for this deliverable. */
  production?: ProductionPayload;
}

// ──────────────────────────────────────────────────────────────────────────
// Deriving per-deliverable production status
// ──────────────────────────────────────────────────────────────────────────

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

function pctDone(list: ChecklistItem[]): number {
  if (list.length === 0) return 0;
  return list.filter((i) => i.done).length / list.length;
}

/**
 * Derives a deliverable's `ProductionStatus` from:
 *   - Campaign `current_stage` (gates the upper bound)
 *   - `productionData[slug]` checklist completion (refines within a stage)
 *
 * Mapping logic (per spec L526-L540 ordering):
 *   stage in [NEW LEAD ... STRATEGY READY] AND script absent  → not_started
 *   stage === SCRIPT READY + no shotMap                       → script_ready
 *   stage === SCRIPT READY + shotMap present + b-roll < 60%   → shot_map_ready
 *   stage === SCRIPT READY + b-roll incomplete                → b_roll_needed
 *   stage === FILMING + filmingStatus = Scheduled             → filming_scheduled
 *   stage === FILMING + b-roll ≥ 80%                          → filmed
 *   stage === EDITING + edit < 60%                            → editing
 *   stage === EDITING + edit ≥ 60% + captions incomplete      → captions_needed
 *   stage === QA                                              → qa_needed
 *   stage === SUBMITTED + status active                       → submitted
 *   stage === SUBMITTED + status="blocked"                    → revision_needed
 *   stage === ACCEPTED or beyond                              → final_approved
 *
 * `exported` is reserved for the post-edit, pre-submit pause when edit
 * checklist hits 100% but submission_link is missing.
 */
export function deriveProductionStatus(
  campaign: Campaign,
  production?: ProductionPayload,
): ProductionStatus {
  const stage = campaign.current_stage;
  const stageIdx = STAGE_ORDER.indexOf(stage);

  // Final states first
  if (stageIdx >= STAGE_ORDER.indexOf("ACCEPTED")) return "final_approved";
  if (stage === "SUBMITTED") {
    if (campaign.status === "blocked") return "revision_needed";
    return "submitted";
  }

  // Pre-script states
  if (stageIdx < STAGE_ORDER.indexOf("SCRIPT READY")) {
    return "not_started";
  }

  const editPct = pctDone(production?.editChecklist ?? []);
  const brollPct = pctDone(production?.brollChecklist ?? []);
  const filmingStatusLabel = production?.filmingStatus?.status ?? "";

  // QA stage
  if (stage === "QA") {
    if (editPct === 1) return "exported";
    return "qa_needed";
  }

  // Editing stage
  if (stage === "EDITING") {
    const captionsIncomplete =
      (production?.editChecklist ?? []).some(
        (i) => /caption/i.test(i.label) && !i.done,
      );
    if (editPct >= 0.6 && captionsIncomplete) return "captions_needed";
    return "editing";
  }

  // Filming stage
  if (stage === "FILMING") {
    if (brollPct >= 0.8) return "filmed";
    if (/scheduled/i.test(filmingStatusLabel)) return "filming_scheduled";
    if (brollPct < 0.5) return "b_roll_needed";
    return "filming_scheduled";
  }

  // SCRIPT READY — refine by production payload presence
  if (stage === "SCRIPT READY") {
    if (!production || production.shotMap.length === 0) return "script_ready";
    if (brollPct < 0.6) return "b_roll_needed";
    return "shot_map_ready";
  }

  // STRATEGY READY / SOW REVIEWED → not yet scripted
  return "not_started";
}

// ──────────────────────────────────────────────────────────────────────────
// Per-field status strings (used for the pills on each card)
// ──────────────────────────────────────────────────────────────────────────

export interface DeliverableStatuses {
  script: string;
  shotMap: string;
  bRoll: string;
  screenRec: string;
  film: string;
  edit: string;
  captions: string;
  qa: string;
  submission: string;
}

export function deriveDeliverableStatuses(
  campaign: Campaign,
  production?: ProductionPayload,
): DeliverableStatuses {
  const stage = campaign.current_stage;
  const stageIdx = STAGE_ORDER.indexOf(stage);
  const past = (s: CampaignStage) => stageIdx >= STAGE_ORDER.indexOf(s);
  const editPct = pctDone(production?.editChecklist ?? []);
  const brollPct = pctDone(production?.brollChecklist ?? []);
  const thPct = pctDone(production?.talkingHeadChecklist ?? []);
  const screenRecItem = (production?.brollChecklist ?? []).find((i) =>
    /screen[- ]?record/i.test(i.label),
  );

  return {
    script: past("SCRIPT READY")
      ? "Ready"
      : past("STRATEGY READY")
        ? "Drafting"
        : "Not started",
    shotMap:
      production && production.shotMap.length > 0
        ? past("SCRIPT READY")
          ? "Ready"
          : "Drafting"
        : "Not ready",
    bRoll:
      brollPct >= 1
        ? "Filmed"
        : brollPct >= 0.5
          ? "In progress"
          : brollPct > 0
            ? "Needed"
            : "Needed",
    screenRec: screenRecItem
      ? screenRecItem.done
        ? "Complete"
        : "Needed"
      : "N/A",
    film: past("EDITING")
      ? "Filmed"
      : past("FILMING")
        ? thPct >= 0.5
          ? "Filming"
          : "Scheduled"
        : "Not started",
    edit: past("QA")
      ? "Done"
      : past("EDITING")
        ? editPct >= 0.6
          ? "In progress"
          : "Started"
        : "Not started",
    captions:
      (production?.editChecklist ?? []).find((i) =>
        /caption/i.test(i.label),
      )?.done
        ? "Done"
        : past("EDITING")
          ? "Needed"
          : "Pending",
    qa: past("SUBMITTED")
      ? campaign.status === "blocked"
        ? "Failed"
        : "Pass"
      : past("QA")
        ? "In QA"
        : "Pending",
    submission: past("ACCEPTED")
      ? "Accepted"
      : past("SUBMITTED")
        ? campaign.status === "blocked"
          ? "Revision needed"
          : "Submitted"
        : "Not submitted",
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Pill tone helpers — map status strings to StatusChip tones
// ──────────────────────────────────────────────────────────────────────────

import type { ChipTone } from "@/components/ui/status-chip";

export function pillToneFor(
  status: string,
): ChipTone {
  const s = status.toLowerCase();
  if (/(ready|done|complete|filmed|pass|accepted|submitted)/.test(s) && !/needed|failed|revision/.test(s))
    return "green";
  if (/(in progress|drafting|filming|started|in qa)/.test(s)) return "yellow";
  if (/(needed|pending)/.test(s)) return "orange";
  if (/(failed|revision)/.test(s)) return "red";
  if (/(not started|not ready|not submitted)/.test(s)) return "pink";
  if (/scheduled/.test(s)) return "blue";
  if (/n\/a/.test(s)) return "pink";
  return "iris";
}

// ──────────────────────────────────────────────────────────────────────────
// Production Readiness 6-Checklist (spec L586-L594)
// ──────────────────────────────────────────────────────────────────────────

export interface ReadinessCheck {
  key: string;
  label: string;
  done: boolean;
}

/**
 * 6-checklist scored per deliverable:
 *   1. Script ready
 *   2. Shot map ready
 *   3. B-roll planned
 *   4. Product screen ready
 *   5. Lighting/audio plan done
 *   6. QA checklist created
 */
export function getProductionReadinessChecklist(
  campaign: Campaign,
  production?: ProductionPayload,
): ReadinessCheck[] {
  const stageIdx = STAGE_ORDER.indexOf(campaign.current_stage);
  const past = (s: CampaignStage) => stageIdx >= STAGE_ORDER.indexOf(s);

  const hasShotMap = (production?.shotMap.length ?? 0) > 0;
  const brollPlanned = (production?.brollChecklist.length ?? 0) > 0;
  const productScreen = (production?.brollChecklist ?? []).some((i) =>
    /screen|product/i.test(i.label),
  );
  const lightingItem = (production?.editChecklist ?? []).find((i) =>
    /(audio|lighting|color)/i.test(i.label),
  );
  const qaItem = (production?.editChecklist ?? []).some((i) =>
    /(export|qa)/i.test(i.label),
  );

  return [
    { key: "script", label: "Script ready", done: past("SCRIPT READY") },
    { key: "shot_map", label: "Shot map ready", done: hasShotMap && past("SCRIPT READY") },
    { key: "broll", label: "B-roll planned", done: brollPlanned },
    { key: "product_screen", label: "Product screen ready", done: productScreen },
    { key: "lighting", label: "Lighting / audio plan", done: !!lightingItem },
    { key: "qa_checklist", label: "QA checklist created", done: qaItem || past("QA") },
  ];
}

export function getProductionReadinessPct(
  campaign: Campaign,
  production?: ProductionPayload,
): number {
  const list = getProductionReadinessChecklist(campaign, production);
  const done = list.filter((i) => i.done).length;
  return Math.round((done / list.length) * 100);
}

// ──────────────────────────────────────────────────────────────────────────
// Per-deliverable card materialization
// ──────────────────────────────────────────────────────────────────────────

interface BuildOptions {
  /** Lookup: slug → production.json payload. */
  productionData: Record<string, ProductionPayload>;
  /** Lookup: slug → script.json payload (for hook selection). */
  scriptData: Record<string, { hooks?: string[]; coreAngle?: string }>;
}

export function buildDeliverableCards(
  campaigns: Campaign[],
  opts: BuildOptions,
): DeliverableCard[] {
  const out: DeliverableCard[] = [];

  for (const campaign of campaigns) {
    const production = opts.productionData[campaign.campaign_id];
    const script = opts.scriptData[campaign.campaign_id];
    const status = deriveProductionStatus(campaign, production);
    const statuses = deriveDeliverableStatuses(campaign, production);
    const total = Math.max(1, campaign.deliverable_count);

    for (let i = 1; i <= total; i++) {
      out.push({
        key: `${campaign.campaign_id}::${i}`,
        campaign,
        index: i,
        total,
        deliverableName:
          total === 1
            ? `${campaign.brand} — ${formatDeliverableFormat(campaign)}`
            : `${campaign.brand} · Deliverable ${i} of ${total}`,
        format: campaign.required_format,
        length: campaign.required_length,
        hookSelected: !!(script?.hooks && script.hooks.length > 0),
        productionStatus: status,
        scriptStatus: statuses.script,
        shotMapStatus: statuses.shotMap,
        brollStatus: statuses.bRoll,
        screenRecordingStatus: statuses.screenRec,
        filmStatus: statuses.film,
        editStatus: statuses.edit,
        captionsStatus: statuses.captions,
        qaStatus: statuses.qa,
        submissionStatus: statuses.submission,
        dueDate: campaign.due_date,
        notes: campaign.notes,
        production,
      });
    }
  }

  return out;
}

function formatDeliverableFormat(c: Campaign): string {
  const fmt = c.required_format.replace("_", " ");
  return fmt.charAt(0).toUpperCase() + fmt.slice(1);
}

// ──────────────────────────────────────────────────────────────────────────
// Format pill — TikTok / Reel / Short / Story (spec L548)
// ──────────────────────────────────────────────────────────────────────────

export interface FormatPill {
  label: string;
  tone: ChipTone;
}

export function getFormatPill(c: Campaign): FormatPill {
  // Heuristic — vertical_video defaults to "TikTok / Reel" since the per-platform
  // distinction lives in the campaign-type field; we surface a friendly label.
  if (c.required_format === "vertical_video") {
    if (c.platform_source === "tiktok") return { label: "TikTok", tone: "pink" };
    if (c.campaign_type === "paid_ad") return { label: "Paid Ad", tone: "iris" };
    return { label: "TikTok / Reel", tone: "pink" };
  }
  if (c.required_format === "story") return { label: "Story", tone: "iris" };
  if (c.required_format === "carousel") return { label: "Carousel", tone: "blue" };
  if (c.required_format === "image") return { label: "Image", tone: "blue" };
  return { label: "Other", tone: "pink" };
}

// ──────────────────────────────────────────────────────────────────────────
// Default filter (spec L566-L568)
// ──────────────────────────────────────────────────────────────────────────

/**
 * Default: active deliverables, NOT submitted OR revision_needed.
 * Spec L567-L568:
 *   "Active deliverables only"
 *   "Not submitted OR revision needed"
 *
 * Interpretation: include if status is active AND
 *   (production_status ≠ submitted) OR (production_status = revision_needed).
 * This keeps revision_needed VISIBLE (the user needs to action it) while
 * pushing happy-path submitted out of the queue.
 */
export function isDefaultVisible(d: DeliverableCard): boolean {
  if (d.campaign.status === "archived" || d.campaign.status === "paid") return false;
  if (d.productionStatus === "submitted") return false;
  if (d.productionStatus === "final_approved") return false;
  return true;
}

// ──────────────────────────────────────────────────────────────────────────
// Saved filter chips (spec L569-L576) — 7 chips
// ──────────────────────────────────────────────────────────────────────────

export type FilterChipKey =
  | "film_today"
  | "edit_today"
  | "needs_broll"
  | "needs_captions"
  | "qa_failed"
  | "ready_to_submit"
  | "revisions_needed";

export const FILTER_CHIPS: Array<{ key: FilterChipKey; label: string }> = [
  { key: "film_today", label: "Film today" },
  { key: "edit_today", label: "Edit today" },
  { key: "needs_broll", label: "Needs b-roll" },
  { key: "needs_captions", label: "Needs captions" },
  { key: "qa_failed", label: "QA failed" },
  { key: "ready_to_submit", label: "Ready to submit" },
  { key: "revisions_needed", label: "Revisions needed" },
];

export function getChipCount(
  deliverables: DeliverableCard[],
  key: FilterChipKey,
): number {
  switch (key) {
    case "film_today":
      return deliverables.filter(
        (d) =>
          d.productionStatus === "filming_scheduled" ||
          d.productionStatus === "b_roll_needed",
      ).length;
    case "edit_today":
      return deliverables.filter(
        (d) =>
          d.productionStatus === "editing" ||
          d.productionStatus === "filmed",
      ).length;
    case "needs_broll":
      return deliverables.filter((d) => d.productionStatus === "b_roll_needed").length;
    case "needs_captions":
      return deliverables.filter((d) => d.productionStatus === "captions_needed").length;
    case "qa_failed":
      return deliverables.filter((d) => d.qaStatus === "Failed").length;
    case "ready_to_submit":
      return deliverables.filter((d) => d.productionStatus === "exported").length;
    case "revisions_needed":
      return deliverables.filter((d) => d.productionStatus === "revision_needed").length;
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Sort (spec L578-L584) — due date · production status · priority · time
// ──────────────────────────────────────────────────────────────────────────

const PRIORITY_RANK: Record<Campaign["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const TIME_NEEDED_BY_STATUS: Record<ProductionStatus, number> = {
  not_started: 100,
  script_ready: 80,
  shot_map_ready: 70,
  b_roll_needed: 60,
  filming_scheduled: 50,
  filmed: 40,
  editing: 30,
  captions_needed: 20,
  qa_needed: 15,
  exported: 10,
  submitted: 5,
  revision_needed: 25, // medium effort to redo
  final_approved: 0,
};

export function sortDeliverables(a: DeliverableCard, b: DeliverableCard): number {
  // 1. Due date soonest (missing dates drift to end)
  const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
  const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
  if (aDue !== bDue) return aDue - bDue;

  // 2. Production status (later stages first within column when applicable)
  const aStatus = PRODUCTION_STATUS_ORDER.indexOf(a.productionStatus);
  const bStatus = PRODUCTION_STATUS_ORDER.indexOf(b.productionStatus);
  if (aStatus !== bStatus) return aStatus - bStatus;

  // 3. Priority high first
  const pr = PRIORITY_RANK[a.campaign.priority] - PRIORITY_RANK[b.campaign.priority];
  if (pr !== 0) return pr;

  // 4. Time needed shortest (finish-line bias)
  return TIME_NEEDED_BY_STATUS[a.productionStatus] - TIME_NEEDED_BY_STATUS[b.productionStatus];
}

// ──────────────────────────────────────────────────────────────────────────
// Due-date pill helpers
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
