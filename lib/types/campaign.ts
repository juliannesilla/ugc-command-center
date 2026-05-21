/**
 * Campaign — canonical row type for the All Campaigns / Database view.
 *
 * Sources (Phase A.14e Wave 0 deep-read):
 * - `UGC/_meta/dashboard-spec/01-initial-dashboard-prompt.md` "DATA STRUCTURE → Campaigns"
 * - `UGC/_meta/dashboard-spec/02-campaign-pipeline-views-architecture.md` view #3
 *   "All Campaigns / Database View" — exact field list at L194–L230
 * - View #9 "Brand Relationships / CRM" (L678–L754) — CRM fields appended
 *   so a single row powers Pipeline + Database + CRM views without joins.
 *
 * Field-by-field citation is in the inline JSDoc on each property.
 */

import type { PipelineStage } from "@/lib/mock-data/pipeline";

/**
 * 18-stage workflow per `01-initial-dashboard-prompt.md` "NAVIGATION /
 * VIEWS → Campaign Pipeline → Stages" (L326–L344) — same list mirrored
 * in `02-campaign-pipeline-views-architecture.md` view #2 (L108–L126).
 *
 * Re-exports `PipelineStage` (already 15 stages) and adds the three the
 * spec calls out but the existing pipeline.ts is missing:
 *   `APPLIED` · `BRAND REPLIED` · `CALL SCHEDULED`
 * Also re-adds `INVOICED` from the board-stages.ts variant.
 */
export type CampaignStage =
  | "NEW LEAD"
  | "APPLIED"
  | "BRAND REPLIED"
  | "RESPONDED"
  | "WAITING ON BRAND"
  | "CALL SCHEDULED"
  | "SOW RECEIVED"
  | "SOW REVIEWED"
  | "STRATEGY READY"
  | "SCRIPT READY"
  | "FILMING"
  | "EDITING"
  | "QA"
  | "SUBMITTED"
  | "ACCEPTED"
  | "POSTED"
  | "INVOICED"
  | "PAID"
  | "ARCHIVED";

/** All 19 stages in canonical workflow order. */
export const CAMPAIGN_STAGES: CampaignStage[] = [
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

/** Platform/source per spec view #3 row 5. */
export type PlatformSource =
  | "sideshift"
  | "email"
  | "inbound"
  | "direct"
  | "tiktok"
  | "other";

/** Contact channel per spec view #3 row 7. */
export type ContactChannel =
  | "sideshift"
  | "email"
  | "whatsapp"
  | "call"
  | "other";

/** Status per spec view #3 row 9. */
export type CampaignStatus =
  | "active"
  | "waiting"
  | "blocked"
  | "submitted"
  | "paid"
  | "archived";

/** Priority per spec view #3 row 10. */
export type CampaignPriority = "high" | "medium" | "low";

/** Waiting-on per spec view #3 row 11. */
export type WaitingOn = "me" | "brand" | "platform" | "payment" | "none";

/** Campaign type per spec view #3 row 12. */
export type CampaignType =
  | "talking_head"
  | "demo"
  | "paid_ad"
  | "organic_post"
  | "review"
  | "affiliate"
  | "retainer";

/** Product category per spec view #3 row 13. */
export type ProductCategory =
  | "ai"
  | "software"
  | "finance"
  | "beauty"
  | "home"
  | "creator_tools"
  | "other";

/** Required format per spec view #3 row 15. */
export type RequiredFormat =
  | "vertical_video"
  | "image"
  | "story"
  | "carousel"
  | "other";

/** Payment status per spec view #3 row 22. */
export type PaymentStatus =
  | "unknown"
  | "pending"
  | "invoiced"
  | "paid"
  | "overdue";

/** Risk level per spec view #3 row 30. */
export type RiskLevel = "low" | "medium" | "high";

/** Repeat potential per spec view #9 row 11. */
export type RepeatPotential = "low" | "medium" | "high";

/** Payment quality per spec view #9 row 13. */
export type PaymentQuality = "good" | "unknown" | "problematic";

/** Communication quality per spec view #9 row 14. */
export type CommunicationQuality = "fast" | "slow" | "unclear";

/**
 * Canonical campaign row. ~40 fields per the prompt spec (`DATA STRUCTURE →
 * Campaigns` plus database-view + CRM-view fields).
 *
 * Backward-compat note: this type is a SUPERSET of the existing
 * `CampaignMeta` in `lib/mock-data/campaigns/index.ts`. The mock-data
 * registry continues to export `CampaignMeta` for the legacy detail-page
 * components. New components (board, database, deadlines, payments, CRM)
 * should consume `Campaign` instead.
 */
export interface Campaign {
  // ── Identity ──────────────────────────────────────────────────────────
  /** Spec view #3 row 1 — unique ID. Use slug as ID for mock data. */
  campaign_id: string;
  /** Spec view #3 row 2. */
  brand: string;
  /** Spec view #3 row 3. */
  product: string;
  /** Spec view #3 row 4. */
  campaign_name: string;
  /** Spec view #3 row 5. */
  platform_source: PlatformSource;
  /** Spec view #3 row 6. */
  contact_name: string;
  /** Spec view #9 row 3 (CRM) — founder, creator mgr, marketing mgr, etc. */
  contact_role?: string;
  /** Spec view #3 row 7. */
  contact_channel: ContactChannel;

  // ── Workflow state ────────────────────────────────────────────────────
  /** Spec view #3 row 8 — same enum as Kanban view (#2). */
  current_stage: CampaignStage;
  /** Spec view #3 row 9. */
  status: CampaignStatus;
  /** Spec view #3 row 10. */
  priority: CampaignPriority;
  /** Spec view #3 row 11. */
  waiting_on_who: WaitingOn;
  /** Spec view #3 row 12. */
  campaign_type: CampaignType;
  /** Spec view #3 row 13. */
  product_category: ProductCategory;

  // ── Deliverables ──────────────────────────────────────────────────────
  /** Spec view #3 row 14. */
  deliverable_count: number;
  /** Spec view #3 row 15. */
  required_format: RequiredFormat;
  /** Spec view #3 row 16 — e.g. "30-60 seconds". */
  required_length?: string;

  // ── Dates (ISO yyyy-mm-dd) ────────────────────────────────────────────
  /** Spec view #3 row 17. */
  due_date?: string;
  /** Spec view #3 row 18. */
  follow_up_date?: string;
  /** Spec view #3 row 19. */
  call_date?: string;

  // ── Money ─────────────────────────────────────────────────────────────
  /** Spec view #3 row 20 — USD. */
  base_pay?: number;
  /**
   * Spec view #3 row 21 — `Currency/Text` per spec, since some bonuses are
   * structured (e.g. "$100 per 100K views"). Accept both.
   */
  bonus_potential?: number | string;
  /** Spec view #3 row 22 — USD (base + max bonus). */
  total_potential_value?: number;
  /** Spec view #3 row 23. */
  payment_status: PaymentStatus;

  // ── Links ─────────────────────────────────────────────────────────────
  /** Spec view #3 row 24. */
  sow_link?: string;
  /** Spec view #3 row 25. */
  job_link?: string;
  /** Spec view #3 row 26. */
  asset_folder?: string;
  /** Spec view #3 row 27. */
  script_link?: string;
  /** Spec view #3 row 28. */
  submission_link?: string;
  /** Spec view #3 row 29. */
  posted_link?: string;

  // ── Computed scores ───────────────────────────────────────────────────
  /**
   * Spec view #3 row 30 — 0-100. Computed by `getReadinessScore` in
   * `lib/scoring/`. Spec "Campaign Readiness Score" (prompt L551-L568)
   * defines the 8 input checks.
   */
  readiness_score?: number;
  /**
   * Spec view #3 row 31 — 0-100. Computed by `getBrandFitScore` in
   * `lib/scoring/`. Spec "Personal Brand Fit Score" (prompt L633-L645)
   * defines the 8 niches.
   */
  brand_fit_score?: number;

  // ── Risk + actions ────────────────────────────────────────────────────
  /** Spec view #3 row 32. */
  risk_level: RiskLevel;
  /**
   * Spec view #3 row 33 — single sentence, drives the "Your Next Move"
   * card on Overview. Generated by `getNextMove` if not set explicitly.
   */
  next_action: string;
  /**
   * Spec view #2 "Smart Feature → Blocked? indicator" (L165-L173). Each
   * string is one active blocker. Generated by `getBlockers` if empty.
   */
  blockers: string[];
  /**
   * Spec "Missing Info Detector" (prompt L535-L549). Each string is one
   * missing critical field. Generated by `getMissingInfo` if empty.
   */
  missing_info: string[];

  // ── CRM (spec view #9, L706-L723) ─────────────────────────────────────
  /** Spec view #9 row 5. */
  last_message_date?: string;
  /** Spec view #9 row 6. */
  last_message_summary?: string;
  /** Spec view #9 row 7. */
  my_last_response?: string;
  /** Spec view #9 row 10 — text label, distinct from `status`. */
  relationship_status?: string;
  /** Spec view #9 row 11. */
  repeat_potential?: RepeatPotential;
  /** Spec view #9 row 13. */
  payment_quality?: PaymentQuality;
  /** Spec view #9 row 14. */
  communication_quality?: CommunicationQuality;
  /** Spec view #9 row 16. */
  next_relationship_move?: string;

  // ── Misc ──────────────────────────────────────────────────────────────
  /** Spec view #3 row 34. */
  notes?: string;
}

/**
 * Re-export the legacy 15-stage enum so callers that need only the
 * production-stage subset can keep using it.
 */
export type { PipelineStage };
