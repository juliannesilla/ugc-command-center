// Data adapter — bakes `data/brands-canonical.json` at build time and maps
// the DARWIN canonical brand schema → existing `Campaign` TypeScript interface.
//
// Source: data/brands-canonical.jsonl (DARWIN sub-agent, A.14v Wave 2).
// Snapshot:  data/brands-canonical.json (regenerated from JSONL — see below).
// Schema reference: data/brands-canonical-summary.md L86-L99.
//
// Phase A.14v V8A (LINUS / Wave 2): replaces hardcoded ParakeetAI mock with
// canonical-derived dataset so dashboard reads real signed contracts (MWM +
// Phobaxx + ParakeetAI) plus all `dashboard_visible: true` rows.
//
// Build-time bake — works in both server + client bundles (no `node:fs`, so
// safe for "use client" routes that import from `lib/mock-data/campaigns.ts`).
//
// Regenerate snapshot when JSONL changes:
//   node -e "const fs=require('fs');const r=fs.readFileSync('data/brands-canonical.jsonl','utf-8').split('\n').filter(l=>l.trim()).map(l=>JSON.parse(l)).filter(o=>typeof o.brand_id==='string');fs.writeFileSync('data/brands-canonical.json',JSON.stringify(r,null,2));"

import canonicalRaw from "@/data/brands-canonical.json";

import { daysFromNow as _daysFromNow } from "@/lib/date-anchor";

import type {
  Campaign,
  CampaignStage,
  CampaignStatus,
  CampaignPriority,
  WaitingOn,
  CampaignType,
  ProductCategory,
  RequiredFormat,
  PaymentStatus,
  PlatformSource,
  ContactChannel,
  RiskLevel,
} from "@/lib/types/campaign";

// ───────────────────────────────────────────────────────────────────────────
// Canonical schema (subset we map). Fields cited inline from
// `data/brands-canonical-summary.md` schema block.
// ───────────────────────────────────────────────────────────────────────────

interface CanonicalDeliverable {
  type?: string;
  count?: number | string;
  platforms?: string[];
  platform?: string;
  frequency?: string;
  duration_sec?: number[];
  format?: string;
  note?: string;
}

interface CanonicalContact {
  name: string | null;
  email: string | null;
  role: string | null;
  channel: string | null;
}

interface CanonicalDeadlines {
  filming_by: string | null;
  submission_by: string | null;
  payment_by: string | null;
}

interface CanonicalBrandRow {
  brand_id: string;
  brand_name_canonical: string;
  aliases: string[];
  pipeline_source: string[];
  contract_signed: boolean;
  contract_signed_at: string | null;
  contract_link: string | null;
  status: string;
  dashboard_visible: boolean;
  payment_amount_usd: number | null;
  payment_terms_days: number | null;
  bonus_amount_usd: number | null;
  payment_terms_note: string | null;
  deliverables: CanonicalDeliverable[];
  deadlines: CanonicalDeadlines;
  do_not_say: string[];
  key_contact: CanonicalContact;
  last_msg_at: string | null;
  last_msg_direction: string | null;
  awaiting_julz: boolean;
  awaiting_julz_action: string | null;
  awaiting_julz_since: string | null;
  urgency: "P0" | "P1" | "P2" | "P3";
  sources: Record<string, unknown>;
  conflicts: unknown[];
  linear_status_drift: boolean;
  auto_fix_recommended: unknown[];
  notes: string;
}

// ───────────────────────────────────────────────────────────────────────────
// Canonical brand rows — baked from JSON snapshot at build time.
// ───────────────────────────────────────────────────────────────────────────

function loadCanonicalBrands(): CanonicalBrandRow[] {
  return (canonicalRaw as unknown[]).filter(
    (obj): obj is CanonicalBrandRow =>
      typeof obj === "object" &&
      obj !== null &&
      typeof (obj as { brand_id?: unknown }).brand_id === "string",
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Field mappers — canonical → Campaign enum (each cites canonical field).
// ───────────────────────────────────────────────────────────────────────────

/** canonical.status → Campaign.current_stage (spec view #3 row 8). */
function mapStage(row: CanonicalBrandRow): CampaignStage {
  switch (row.status) {
    case "signed":
      return "SOW REVIEWED";
    case "submitted":
      return "SUBMITTED";
    case "paid":
      return "PAID";
    case "contract_pending_julz":
      return "SOW RECEIVED";
    case "awaiting_julz":
      return "BRAND REPLIED";
    case "in_negotiation":
      return "RESPONDED";
    case "intake":
      return "NEW LEAD";
    case "closed":
      return "ARCHIVED";
    default:
      return "NEW LEAD";
  }
}

/** canonical.status → Campaign.status (spec view #3 row 9). */
function mapStatus(row: CanonicalBrandRow): CampaignStatus {
  if (row.status === "paid") return "paid";
  if (row.status === "submitted") return "submitted";
  if (row.status === "closed") return "archived";
  if (row.awaiting_julz) return "active";
  if (row.status === "signed" || row.status === "in_negotiation") return "active";
  return "waiting";
}

/** canonical.urgency → Campaign.priority (spec view #3 row 10). */
function mapPriority(row: CanonicalBrandRow): CampaignPriority {
  if (row.urgency === "P0") return "high";
  if (row.urgency === "P1") return "medium";
  return "low";
}

/** canonical.awaiting_julz + last_msg_direction → Campaign.waiting_on_who (spec row 11). */
function mapWaitingOn(row: CanonicalBrandRow): WaitingOn {
  if (row.status === "paid") return "none";
  if (row.awaiting_julz) return "me";
  return "brand";
}

/** Inferred from canonical.deliverables[].type (best-effort heuristic). */
function mapCampaignType(row: CanonicalBrandRow): CampaignType {
  const types = row.deliverables.map((d) => d.type ?? "").join(" ").toLowerCase();
  if (types.includes("retainer")) return "retainer";
  if (types.includes("review")) return "review";
  if (types.includes("paid")) return "paid_ad";
  if (types.includes("talking")) return "talking_head";
  if (row.deliverables.length === 0) return "organic_post";
  return "organic_post";
}

/** Inferred from brand_name_canonical / aliases — coarse category bucket. */
function mapProductCategory(row: CanonicalBrandRow): ProductCategory {
  const name = (row.brand_name_canonical + " " + row.aliases.join(" ") + " " + row.notes).toLowerCase();
  if (/\bai\b|gpt|llm|prompt|hunch|sherlock|wand|claim/.test(name)) return "ai";
  if (/beauty|cosm|skin|fragran|perfume|monat|pyunkang/.test(name)) return "beauty";
  if (/finance|pay|invoice|stripe|bank|megprime/.test(name)) return "finance";
  if (/home|kitchen|wipes|minee|caraway|olipop/.test(name)) return "home";
  if (/loops|crochet|veed|editor|figma/.test(name)) return "creator_tools";
  return "software";
}

/** Deliverable count — sum across all canonical.deliverables[].count. */
function mapDeliverableCount(row: CanonicalBrandRow): number {
  let total = 0;
  for (const d of row.deliverables) {
    if (typeof d.count === "number") total += d.count;
    else if (typeof d.count === "string") {
      const m = d.count.match(/(\d+)/);
      if (m) total += parseInt(m[1], 10);
      else total += 1;
    } else {
      total += 1;
    }
  }
  return total || 1;
}

/** canonical deliverables[].type → required_format (spec row 15). */
function mapRequiredFormat(row: CanonicalBrandRow): RequiredFormat {
  const types = row.deliverables.map((d) => d.type ?? "").join(" ").toLowerCase();
  if (types.includes("image")) return "image";
  if (types.includes("story")) return "story";
  if (types.includes("carousel")) return "carousel";
  if (types.includes("video") || types.includes("talking")) return "vertical_video";
  return "vertical_video";
}

/** First duration_sec range found → "X-Y seconds" string (spec row 16). */
function mapRequiredLength(row: CanonicalBrandRow): string | undefined {
  for (const d of row.deliverables) {
    if (d.duration_sec && d.duration_sec.length === 2) {
      return `${d.duration_sec[0]}-${d.duration_sec[1]} seconds`;
    }
  }
  return undefined;
}

/** canonical.payment_amount_usd (spec row 20). */
function mapBasePay(row: CanonicalBrandRow): number | undefined {
  return row.payment_amount_usd ?? undefined;
}

/** Structured bonus from canonical.bonus_amount_usd + note (spec row 21). */
function mapBonusPotential(row: CanonicalBrandRow): number | string | undefined {
  if (row.bonus_amount_usd != null && !row.payment_terms_note) {
    return row.bonus_amount_usd;
  }
  if (row.payment_terms_note) return row.payment_terms_note;
  return undefined;
}

/** base + bonus if both numeric, else just base (spec row 22). */
function mapTotalPotential(row: CanonicalBrandRow): number | undefined {
  const base = row.payment_amount_usd ?? 0;
  const bonus = typeof row.bonus_amount_usd === "number" ? row.bonus_amount_usd : 0;
  const total = base + bonus;
  return total > 0 ? total : undefined;
}

/** canonical.status → payment_status (spec row 23). */
function mapPaymentStatus(row: CanonicalBrandRow): PaymentStatus {
  if (row.status === "paid") return "paid";
  if (row.status === "signed" || row.status === "submitted") return "pending";
  if (row.payment_amount_usd == null) return "unknown";
  return "pending";
}

/** canonical.pipeline_source[0] → platform_source (spec row 5). */
function mapPlatformSource(row: CanonicalBrandRow): PlatformSource {
  const first = row.pipeline_source[0];
  if (first === "sideshift") return "sideshift";
  if (first === "gmail-direct" || first === "direct-email") return "email";
  if (first === "brkfst") return "inbound";
  if (first === "linear-direct") return "direct";
  if (first === "imessage") return "other";
  return "other";
}

/** canonical.key_contact.channel → contact_channel (spec row 7). */
function mapContactChannel(row: CanonicalBrandRow): ContactChannel {
  const ch = row.key_contact.channel ?? "";
  if (ch.includes("sideshift")) return "sideshift";
  if (ch.includes("email")) return "email";
  if (ch.includes("call")) return "call";
  if (ch.includes("whatsapp")) return "whatsapp";
  return "other";
}

/** Risk = derived from conflicts.length + linear_status_drift (spec row 32). */
function mapRiskLevel(row: CanonicalBrandRow): RiskLevel {
  if (row.linear_status_drift) return "high";
  if (row.conflicts.length >= 2) return "high";
  if (row.conflicts.length === 1) return "medium";
  return "low";
}

/** canonical.awaiting_julz_action → next_action (spec row 33). */
function mapNextAction(row: CanonicalBrandRow): string {
  return row.awaiting_julz_action ?? "Awaiting brand reply";
}

/** missing critical fields → missing_info (spec row 33 / prompt L535-L549). */
function mapMissingInfo(row: CanonicalBrandRow): string[] {
  const missing: string[] = [];
  if (row.payment_amount_usd == null && row.status !== "paid" && row.status !== "closed") {
    missing.push("payment amount");
  }
  if (row.deliverables.length === 0 && row.status !== "intake" && row.status !== "closed") {
    missing.push("deliverable scope");
  }
  if (row.contract_signed === false && row.status !== "intake" && row.status !== "closed") {
    missing.push("signed contract");
  }
  return missing;
}

// ───────────────────────────────────────────────────────────────────────────
// Top-level mapper — canonical row → Campaign.
// ───────────────────────────────────────────────────────────────────────────

function rowToCampaign(row: CanonicalBrandRow): Campaign {
  return {
    // Identity (canonical.brand_id → campaign_id)
    campaign_id: row.brand_id,
    brand: row.brand_name_canonical,
    product: row.brand_name_canonical,
    campaign_name: `${row.brand_name_canonical} — UGC Campaign`,
    platform_source: mapPlatformSource(row),
    contact_name: row.key_contact.name ?? "unknown",
    contact_role: row.key_contact.role ?? undefined,
    contact_channel: mapContactChannel(row),

    // Workflow state
    current_stage: mapStage(row),
    status: mapStatus(row),
    priority: mapPriority(row),
    waiting_on_who: mapWaitingOn(row),
    campaign_type: mapCampaignType(row),
    product_category: mapProductCategory(row),

    // Deliverables
    deliverable_count: mapDeliverableCount(row),
    required_format: mapRequiredFormat(row),
    required_length: mapRequiredLength(row),

    // Dates — canonical.deadlines.* (spec rows 17-19)
    due_date: row.deadlines.submission_by ?? row.deadlines.filming_by ?? undefined,
    follow_up_date: row.awaiting_julz ? row.last_msg_at ?? undefined : undefined,

    // Money
    base_pay: mapBasePay(row),
    bonus_potential: mapBonusPotential(row),
    total_potential_value: mapTotalPotential(row),
    payment_status: mapPaymentStatus(row),

    // Links — canonical.contract_link (spec row 24 reused as sow_link for now)
    sow_link: row.contract_link ?? undefined,
    asset_folder: `/campaigns/${row.brand_id}/assets`,

    // Risk + actions
    risk_level: mapRiskLevel(row),
    next_action: mapNextAction(row),
    blockers: [],
    missing_info: mapMissingInfo(row),

    // CRM
    last_message_date: row.last_msg_at ?? undefined,
    last_message_summary: row.notes || undefined,
    relationship_status: row.contract_signed ? "Active Collaboration" : "In Discussion",

    notes: row.notes || undefined,
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Public exports — derived at build time.
// ───────────────────────────────────────────────────────────────────────────

/** All canonical brand rows (unfiltered) — for utilities that need everything. */
export function loadAllCanonical(): CanonicalBrandRow[] {
  return loadCanonicalBrands();
}

/**
 * Campaigns visible on the dashboard. Filter rule per A.14v V8A spec:
 *   dashboard_visible === true
 */
export function loadDashboardCampaigns(): Campaign[] {
  return loadCanonicalBrands()
    .filter((row) => row.dashboard_visible === true)
    .map(rowToCampaign);
}

/** Signed-contract subset — drives "active work" surfaces. */
export function loadSignedCampaigns(): Campaign[] {
  return loadCanonicalBrands()
    .filter((row) => row.contract_signed === true)
    .map(rowToCampaign);
}

// ───────────────────────────────────────────────────────────────────────────
// Derived: RECENT_ACTIVITY (drives "Recent campaign activity" table).
// ───────────────────────────────────────────────────────────────────────────

export interface CanonicalActivityRow {
  id: string;
  when: string;
  brand: string;
  event: string;
  stage: string;
}

function relWhen(iso: string | null, today: Date = new Date()): string {
  if (!iso) return "—";
  const then = new Date(iso);
  const days = Math.floor((today.getTime() - then.getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return iso.slice(5);
}

export function loadRecentActivity(): CanonicalActivityRow[] {
  const today = new Date();
  return loadCanonicalBrands()
    .filter((row) => row.dashboard_visible === true && row.last_msg_at != null)
    .sort((a, b) => (b.last_msg_at ?? "").localeCompare(a.last_msg_at ?? ""))
    .slice(0, 12)
    .map((row) => ({
      id: row.brand_id,
      when: relWhen(row.last_msg_at, today),
      brand: row.brand_name_canonical,
      event: row.awaiting_julz_action ?? (row.notes ? row.notes.slice(0, 80) : "Updated"),
      stage: mapStage(row),
    }));
}

// ───────────────────────────────────────────────────────────────────────────
// Derived: FOCUS_THIS_WEEK (drives FocusThisWeek component).
// ───────────────────────────────────────────────────────────────────────────

export interface CanonicalFocusItem {
  id: string;
  title: string;
  due: string;
  brand: string;
  type: "Script" | "Film" | "Edit" | "QA" | "Submit" | "Respond";
  priority: "P0" | "P1" | "P2";
}

function dayLabel(iso: string | null, today: Date = new Date()): string {
  if (!iso) return "This week";
  const then = new Date(iso);
  const diff = Math.floor((then.getTime() - today.getTime()) / 86_400_000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 7) return then.toLocaleDateString("en-US", { weekday: "short" });
  return iso.slice(5);
}

function inferType(row: CanonicalBrandRow): CanonicalFocusItem["type"] {
  const action = (row.awaiting_julz_action ?? "").toLowerCase();
  if (action.includes("sample") || action.includes("film") || action.includes("video")) return "Film";
  if (action.includes("script") || action.includes("strategy") || action.includes("gtm")) return "Script";
  if (action.includes("edit")) return "Edit";
  if (action.includes("submit")) return "Submit";
  if (action.includes("qa") || action.includes("review")) return "QA";
  return "Respond";
}

export function loadFocusThisWeek(): CanonicalFocusItem[] {
  const today = new Date();
  const sevenOut = new Date(today.getTime() + 7 * 86_400_000);
  return loadCanonicalBrands()
    .filter((row) => {
      if (!row.dashboard_visible) return false;
      if (!row.awaiting_julz) return false;
      if (row.urgency === "P0") return true;
      const deadline = row.deadlines.submission_by ?? row.deadlines.filming_by;
      if (deadline && new Date(deadline) <= sevenOut) return true;
      return false;
    })
    .sort((a, b) => {
      const pa = a.urgency === "P0" ? 0 : 1;
      const pb = b.urgency === "P0" ? 0 : 1;
      if (pa !== pb) return pa - pb;
      const da = a.deadlines.submission_by ?? a.deadlines.filming_by ?? "9999";
      const db = b.deadlines.submission_by ?? b.deadlines.filming_by ?? "9999";
      return da.localeCompare(db);
    })
    .slice(0, 8)
    .map((row) => ({
      id: row.brand_id,
      title: row.awaiting_julz_action ?? `Follow up on ${row.brand_name_canonical}`,
      due: dayLabel(
        row.deadlines.submission_by ?? row.deadlines.filming_by ?? row.awaiting_julz_since,
        today,
      ),
      brand: row.brand_name_canonical,
      type: inferType(row),
      priority: (row.urgency === "P3" ? "P2" : row.urgency) as "P0" | "P1" | "P2",
    }));
}

// Suppress unused warning — exported for completeness.
void _daysFromNow;
