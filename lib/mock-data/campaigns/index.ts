// Campaign registry — derives campaigns from `data/brands-canonical.jsonl`
// (via baked JSON snapshot) at build time. ZERO hardcoded brand references
// in MOCK_CAMPAIGNS.
//
// Source: data/brands-canonical.jsonl (DARWIN A.14v Wave 2 merge of
// SideShift + Gmail + Linear pipelines).
//
// Phase A.14v V8A (LINUS / Wave 2): rewrote to read from canonical instead
// of hardcoding ParakeetAI. Dashboard now shows MWM + Phobaxx + ParakeetAI
// as real campaigns (signed contracts) + all `dashboard_visible: true` rows.

import { daysFromNow as _daysFromNow } from "@/lib/date-anchor";

import parakeetaiSow from "./parakeetai/sow.json";
import parakeetaiScript from "./parakeetai/script.json";
import parakeetaiProduction from "./parakeetai/production.json";

// A.14z Wave C — wire real script + production data for signed brands.
// Script content derived from canonical 08-script.md files on disk
// (sideshift-mwm-ai/08-script.md, sideshift-phobaxx/08-script.md).
// No mock/placeholder data (HR-49). G21-gated lines preserved verbatim.
import mwmAiScript from "./mwm-ai/script.json";
import mwmAiProduction from "./mwm-ai/production.json";
import phobaxxScript from "./phobaxx/script.json";
import phobaxxProduction from "./phobaxx/production.json";

import { loadDashboardCampaigns, loadAllCanonical } from "./from-canonical";

import type { Campaign } from "@/lib/types/campaign";

// ──────────────────────────────────────────────────────────────────────────
// Per-campaign metadata (legacy registry + canonical fallback).
//
// HISTORY:
// - A.14v: hardcoded ParakeetAI only.
// - A.14y Wave 0.6.B (HR-50 fix): `CampaignSlug` widened to `string` because
//   the actual slug universe is the canonical brand_id space (46+ rows in
//   `data/brands-canonical.jsonl`). For brands without a hand-curated entry
//   in the `campaigns` Record below, `getCampaignDisplayMeta()` derives a
//   meta object from the canonical row (brand_id, brand_name, payment,
//   deadlines, deliverables count). This unblocks SOW Breakdown UI showing
//   real per-brand SOW data for MWM, Phobaxx, Veed, etc.
// ──────────────────────────────────────────────────────────────────────────

export type CampaignSlug = string;

export type CampaignMeta = {
  slug: CampaignSlug;
  brand: string;
  product: string;
  category: string;
  logoMark: string;
  accent: string;
  status: "Active" | "Drafting" | "In Review" | "Submitted" | "Paid";
  startDate: string;
  dueDate: string;
  payment: {
    base: number;
    bonus: number;
    total: number;
    structure: string;
  };
  sowProgress: { complete: number; total: number };
  stage: number;
};

export const campaigns: Record<string, CampaignMeta> = {
  parakeetai: {
    slug: "parakeetai",
    brand: "ParakeetAI",
    product: "Real-time AI Interview Assistant",
    category: "Software / AI",
    logoMark: "P",
    accent: "#2EC27E",
    status: "Submitted",
    startDate: "2026-05-12",
    dueDate: _daysFromNow(7),
    payment: { base: 25, bonus: 100, total: 125, structure: "$25 base + up to $100 per 100K views (uncapped)" },
    sowProgress: { complete: 14, total: 14 },
    stage: 13,
  },
};

// A.14y Wave 0.6.B: typed as Record<string, unknown> so callers can index by
// any canonical brand_id. ParakeetAI remains the only hand-curated entry;
// other slugs return undefined and callers fall back to canonical-derived
// data via getSowRequirements() / getCampaignDisplayMeta().
export const sowData: Record<string, typeof parakeetaiSow> = {
  parakeetai: parakeetaiSow,
};

export const scriptData: Record<string, typeof parakeetaiScript> = {
  parakeetai: parakeetaiScript,
  // A.14z Wave C: real script data for signed brands (HR-49 — no mock data).
  // Content sourced from UGC/sideshift-mwm-ai/08-script.md (~8.4K) and
  // UGC/sideshift-phobaxx/08-script.md (~12K) read at build time as JSON.
  "mwm-ai": mwmAiScript as unknown as typeof parakeetaiScript,
  phobaxx: phobaxxScript as unknown as typeof parakeetaiScript,
};

export const productionData: Record<string, typeof parakeetaiProduction> = {
  parakeetai: parakeetaiProduction,
  // A.14z Wave C: real production tracking data for signed brands (HR-49).
  "mwm-ai": mwmAiProduction as unknown as typeof parakeetaiProduction,
  phobaxx: phobaxxProduction as unknown as typeof parakeetaiProduction,
};

export function getCampaign(slug: string): CampaignMeta | null {
  return (campaigns as Record<string, CampaignMeta>)[slug] ?? null;
}

export function listCampaigns(): CampaignMeta[] {
  return Object.values(campaigns);
}

// ──────────────────────────────────────────────────────────────────────────
// Canonical-derived Campaign rows — drives every dashboard surface.
//
// Build-time read of `data/brands-canonical.json` (baked from JSONL).
// Filter: `dashboard_visible === true`. ZERO hardcoded brand references.
// ──────────────────────────────────────────────────────────────────────────

export const MOCK_CAMPAIGNS: Campaign[] = loadDashboardCampaigns();

/** Lookup helper for canonical campaign rows by brand_id slug. */
export function getCampaignRow(id: string): Campaign | null {
  return MOCK_CAMPAIGNS.find((c) => c.campaign_id === id) ?? null;
}

/**
 * Empty-state copy — kept for components that fall back when filters
 * produce zero rows. With canonical-derived data this should almost
 * never trigger (we have ~30+ dashboard_visible rows).
 */
export const EMPTY_STATE_COPY = {
  title: "No campaigns match this filter.",
  body: "Try clearing filters — dashboard reads live from data/brands-canonical.jsonl which has 30+ active rows.",
} as const;

// Re-export adapter helpers so callers needing the broader canonical view
// don't have to import the adapter file directly.
export {
  loadAllCanonical,
  loadSignedCampaigns,
  loadRecentActivity,
  loadFocusThisWeek,
} from "./from-canonical";

// ──────────────────────────────────────────────────────────────────────────
// A.14y Wave 0.6.B — Canonical-derived display helpers.
//
// Problem (caught 2026-05-28): SOW Breakdown UI chips fire setSelectedSlug()
// for any brand, but `campaigns[slug]` returns undefined for non-parakeetai
// slugs, so SowBreakdownTable renders nothing. Per HR-49 (no mock data) +
// HR-50 (no partial work), we derive display meta from canonical for ANY
// dashboard_visible brand.
//
// These helpers wrap the hardcoded `campaigns` Record with a fallback to
// canonical. Callers should prefer them over direct `campaigns[slug]` access.
// ──────────────────────────────────────────────────────────────────────────

// Deterministic accent palette per brand (cycles through 8 lavender-family
// hues so brands without hand-curated meta still look polished).
const ACCENT_PALETTE = [
  "#7C5CFF", // iris
  "#FF8AB3", // peach pink
  "#2EC27E", // emerald
  "#F59E0B", // amber
  "#06B6D4", // cyan
  "#EC4899", // pink
  "#8B5CF6", // violet
  "#10B981", // green
];

function accentForSlug(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return ACCENT_PALETTE[h % ACCENT_PALETTE.length];
}

/**
 * Map a canonical Campaign.status → display-meta status pill copy.
 * Mirrors `campaigns.parakeetai.status` literal set.
 */
function statusFromCampaign(c: import("@/lib/types/campaign").Campaign): CampaignMeta["status"] {
  switch (c.status) {
    case "paid":
      return "Paid";
    case "submitted":
      return "Submitted";
    case "active":
      return "Active";
    case "waiting":
      return "Drafting";
    default:
      return "In Review";
  }
}

/**
 * Returns a CampaignMeta for ANY slug — hardcoded registry first, then
 * derived from `MOCK_CAMPAIGNS` (canonical). Returns null only if the slug
 * is unknown to both.
 */
export function getCampaignDisplayMeta(slug: string): CampaignMeta | null {
  // Prefer the hand-curated entry if one exists.
  const hardcoded = campaigns[slug];
  if (hardcoded) return hardcoded;

  // Fallback: derive from canonical MOCK_CAMPAIGNS row.
  const row = MOCK_CAMPAIGNS.find((c) => c.campaign_id === slug);
  if (!row) return null;

  const brand = row.brand || slug;
  const base = typeof row.base_pay === "number" ? row.base_pay : 0;
  const bonus = typeof row.bonus_potential === "number" ? row.bonus_potential : 0;
  const total =
    typeof row.total_potential_value === "number"
      ? row.total_potential_value
      : base + bonus;
  const structure =
    typeof row.bonus_potential === "string" && row.bonus_potential.length > 0
      ? row.bonus_potential
      : total > 0
      ? `$${base} base${bonus ? ` + $${bonus} bonus` : ""}`
      : "TBD — payment terms in contract";

  return {
    slug,
    brand,
    product: row.product || brand,
    category: row.product_category || "Software",
    logoMark: brand.charAt(0).toUpperCase(),
    accent: accentForSlug(slug),
    status: statusFromCampaign(row),
    startDate: row.last_message_date || new Date().toISOString().slice(0, 10),
    dueDate: row.due_date || _daysFromNow(14),
    payment: { base, bonus, total, structure },
    sowProgress: { complete: 0, total: 14 },
    stage: 0,
  };
}

/**
 * SOW requirement row — matches the shape `SowBreakdownTable` already renders.
 * Exported here so the canonical-derived requirements share one schema.
 */
export interface SowRequirementRow {
  key: string;
  label: string;
  detail: string;
  means: string;
  status: "complete" | "incomplete" | "blocked";
  source: string;
}

/**
 * Derive a 14-row SOW requirements list from the canonical Campaign row.
 *
 * Each row maps one canonical field → Requirement / Detail / What this means
 * / Status / Source columns. Status logic:
 *   - "complete" = field present + non-empty
 *   - "incomplete" = field null/empty + contract not yet signed
 *   - "blocked" = field null + contract signed (means we need it NOW)
 */
function deriveRequirementsFromCanonical(
  row: import("@/lib/types/campaign").Campaign,
): SowRequirementRow[] {
  const signed = row.relationship_status === "Active Collaboration";
  const missingTone = signed ? "blocked" : "incomplete";

  // A.14y Wave 0.7 fix: look up the raw canonical row to access the original
  // `deliverables[]` array so we can render platform-mix detail strings
  // (e.g., "5 vertical-1080x1920, cross-posted to TikTok + IG Reels + YouTube
  // Shorts") instead of the bare aggregate count.
  const rawCanonical = loadAllCanonical().find((r) => r.brand_id === row.campaign_id);
  const rawDeliverables = rawCanonical?.deliverables ?? [];

  // Build a detail string that reflects what's actually in canonical.
  const formatDeliverableDetail = (): string => {
    if (rawDeliverables.length === 0) {
      return row.deliverable_count && row.deliverable_count > 0
        ? `${row.deliverable_count} × ${row.required_format ?? "video"}`
        : "Not yet specified";
    }
    // Group by format vs. cross-post: master count + repost destinations.
    const platforms: string[] = [];
    const reposts: string[] = [];
    let masterCount = row.deliverable_count;
    let masterFormat: string | undefined;
    for (const d of rawDeliverables) {
      const fmt = (d.format ?? "").toLowerCase();
      const isReuse =
        fmt.includes("cross-post") || fmt === "repost" || fmt.includes("crosspost");
      const platform = d.platform ?? "platform";
      if (isReuse) {
        reposts.push(platform);
      } else {
        platforms.push(platform);
        if (typeof d.count === "number") masterCount = d.count;
        if (d.format && !masterFormat) masterFormat = d.format;
      }
    }
    const formatLabel = masterFormat ?? row.required_format ?? "video";
    if (reposts.length > 0 && platforms.length > 0) {
      return `${masterCount} ${formatLabel} on ${platforms.join(" + ")} → cross-posted to ${reposts.join(" + ")}`;
    }
    if (platforms.length > 0) {
      return `${masterCount} ${formatLabel} on ${platforms.join(" + ")}`;
    }
    return `${masterCount} × ${formatLabel}`;
  };

  const rows: SowRequirementRow[] = [];

  // 1. Deliverables — count + format + platform mix
  if (row.deliverable_count && row.deliverable_count > 0) {
    const detail = formatDeliverableDetail();
    rows.push({
      key: "deliverables",
      label: "Deliverables",
      detail,
      means: `You owe ${row.deliverable_count} unique ${row.required_format ?? "video"} asset${row.deliverable_count > 1 ? "s" : ""} to ${row.brand}.`,
      status: "complete",
      source: "canonical",
    });
  } else {
    rows.push({
      key: "deliverables",
      label: "Deliverables",
      detail: "Not yet specified",
      means: "Confirm exact deliverable count + format before filming.",
      status: missingTone,
      source: "canonical",
    });
  }

  // 2. Required Length
  rows.push({
    key: "length",
    label: "Required Length",
    detail: row.required_length ?? "Not specified",
    means: row.required_length
      ? `Script + edit to fit ${row.required_length}.`
      : "Ask brand for length range before scripting.",
    status: row.required_length ? "complete" : missingTone,
    source: "canonical",
  });

  // 3. Format
  rows.push({
    key: "format",
    label: "Format",
    detail: row.required_format ?? "Not specified",
    means: row.required_format
      ? `Shoot in ${row.required_format} aspect ratio + framing.`
      : "Confirm vertical / square / horizontal before shoot day.",
    status: row.required_format ? "complete" : missingTone,
    source: "canonical",
  });

  // 4. Platforms / Posting (derived from notes/category)
  rows.push({
    key: "platforms",
    label: "Posting Platforms",
    detail: row.notes && /tiktok|instagram|youtube|reels|shorts/i.test(row.notes)
      ? (row.notes.match(/TikTok|Instagram|Reels|YouTube|Shorts/gi) || []).join(", ")
      : "Per SOW",
    means: "Each platform = different aspect ratio + caption length. Confirm before posting.",
    status: "incomplete",
    source: "SOW PDF",
  });

  // 5. Base Pay
  // A.14y Wave 0.7: append payment_terms_note as structure context in `means`
  // so retainer terms (e.g., "$50 per 5 approved posts") aren't lost. We
  // intentionally drop them from the Bonus row to avoid HR-49 confusion.
  const paymentTermsNote = rawCanonical?.payment_terms_note ?? "";
  rows.push({
    key: "base_pay",
    label: "Payment — Base",
    detail: typeof row.base_pay === "number" && row.base_pay > 0
      ? `$${row.base_pay.toLocaleString()}`
      : "TBD",
    means: paymentTermsNote
      ? `Structure: ${paymentTermsNote}`
      : "Guaranteed payment regardless of performance.",
    status: typeof row.base_pay === "number" && row.base_pay > 0 ? "complete" : missingTone,
    source: "canonical",
  });

  // 6. Bonus
  rows.push({
    key: "bonus",
    label: "Bonus / Performance",
    detail: typeof row.bonus_potential === "string"
      ? row.bonus_potential
      : typeof row.bonus_potential === "number" && row.bonus_potential > 0
        ? `$${row.bonus_potential.toLocaleString()}`
        : "None specified",
    means: "Stretch upside — tied to views / engagement / approval milestones.",
    status: row.bonus_potential ? "complete" : "incomplete",
    source: "canonical",
  });

  // 7. Total Potential
  rows.push({
    key: "total_potential",
    label: "Total Potential Value",
    detail: typeof row.total_potential_value === "number"
      ? `$${row.total_potential_value.toLocaleString()}`
      : "TBD",
    means: "Best-case payout if all bonuses hit.",
    status: typeof row.total_potential_value === "number" ? "complete" : "incomplete",
    source: "canonical",
  });

  // 8. Payment Status
  rows.push({
    key: "payment_status",
    label: "Payment Status",
    detail: row.payment_status ?? "Unknown",
    means: row.payment_status === "paid"
      ? "Brand paid — log to 1099 + repurpose."
      : row.payment_status === "pending"
        ? "Awaiting invoice clearance — chase after NET-30."
        : "Confirm payment timing in writing.",
    status: row.payment_status === "paid"
      ? "complete"
      : row.payment_status === "pending"
        ? "incomplete"
        : missingTone,
    source: "canonical",
  });

  // 9. Contract Status
  rows.push({
    key: "contract",
    label: "Contract Status",
    detail: signed ? "Signed" : "Pending",
    means: signed
      ? "Contract on file — green-light filming + invoicing."
      : "Do NOT film until contract signed. Protects usage rights + payment.",
    status: signed ? "complete" : "blocked",
    source: row.sow_link ? "SOW PDF" : "canonical",
  });

  // 10. Due Date
  rows.push({
    key: "due_date",
    label: "Submission Deadline",
    detail: row.due_date ?? "Not specified",
    means: row.due_date
      ? `Final delivery must hit by ${row.due_date}.`
      : "Confirm exact submission cutoff before scheduling shoot.",
    status: row.due_date ? "complete" : missingTone,
    source: "canonical",
  });

  // 11. Last Brand Activity
  rows.push({
    key: "last_activity",
    label: "Last Brand Activity",
    detail: row.last_message_date ?? "No record",
    means: row.last_message_date
      ? `Most recent inbound/outbound: ${row.last_message_date}.`
      : "No logged correspondence — re-open thread if active.",
    status: row.last_message_date ? "complete" : "incomplete",
    source: "canonical",
  });

  // 12. Waiting On
  rows.push({
    key: "waiting_on",
    label: "Waiting On",
    detail: row.waiting_on_who === "me" ? "You" : row.waiting_on_who === "brand" ? "Brand" : "—",
    means: row.waiting_on_who === "me"
      ? `Action required: ${row.next_action ?? "respond to brand"}.`
      : row.waiting_on_who === "brand"
        ? "Ball in brand's court — follow up if silent >7 days."
        : "No active blocker.",
    status: row.waiting_on_who === "me" ? "blocked" : "complete",
    source: "canonical",
  });

  // 13. Missing Info
  rows.push({
    key: "missing_info",
    label: "Missing Info",
    detail: row.missing_info && row.missing_info.length > 0
      ? row.missing_info.join(", ")
      : "All critical fields populated",
    means: row.missing_info && row.missing_info.length > 0
      ? `Resolve before next phase: ${row.missing_info.join(", ")}.`
      : "Green-light for production prep.",
    status: row.missing_info && row.missing_info.length > 0 ? "blocked" : "complete",
    source: "canonical",
  });

  // 14. Honest Concerns / Notes
  rows.push({
    key: "concerns",
    label: "Notes & Concerns",
    detail: row.notes ? row.notes.slice(0, 120) + (row.notes.length > 120 ? "…" : "") : "—",
    means: "Plain-English context Julz needs to know before scripting.",
    status: row.notes ? "complete" : "incomplete",
    source: "canonical",
  });

  // ─── A.14y Wave 0.9 (HOLMES-V3) — net-new contract-clause rows ──────────────
  // Extracted from the signed PDFs and surfaced from the raw canonical row
  // (`rawCanonical`) so the SOW Breakdown table renders the REAL executable
  // terms (HR-50 — the merge isn't "done" until the term is visible). Brands
  // without these clauses fall through to `missingTone` ("Needs work" pre-sign,
  // "Blocked" once signed) — an honest signal, not a fake value (HR-49).

  // 15. Usage Rights (scope)
  const ur = rawCanonical?.usage_rights;
  rows.push({
    key: "usage_rights",
    label: "Usage Rights",
    detail: ur?.scope ?? "Not specified",
    means: ur?.scope
      ? `Brand may: ${ur.scope}. Anything beyond is renegotiated in writing.`
      : "Confirm how the brand may use your content (organic / paid / whitelisting) before posting.",
    status: ur?.scope ? "complete" : missingTone,
    source: "SOW PDF",
  });

  // 16. Usage Window
  rows.push({
    key: "usage_window",
    label: "Usage Window",
    detail: ur?.window ?? "Not specified",
    means: ur?.window
      ? `Your content is licensed to the brand for: ${ur.window}.`
      : "Confirm how long the brand can keep using your content (perpetual vs. fixed term).",
    status: ur?.window ? "complete" : missingTone,
    source: "SOW PDF",
  });

  // 17. Exclusivity
  const excl = rawCanonical?.exclusivity;
  rows.push({
    key: "exclusivity",
    label: "Exclusivity",
    detail: excl ?? "None — non-exclusive",
    means: excl
      ? `Category / competitor restriction applies: ${excl}.`
      : "Non-exclusive — you're free to work with other (incl. competing) brands.",
    status: "complete",
    source: "SOW PDF",
  });

  // 18. Revision Policy
  const rev = rawCanonical?.revision_policy;
  rows.push({
    key: "revision_policy",
    label: "Revision Policy",
    detail: rev ?? "Not specified in contract",
    means: rev
      ? `Revision terms: ${rev}.`
      : "Contract is silent on revisions — confirm free-revision rounds in writing before filming.",
    status: rev ? "complete" : missingTone,
    source: "SOW PDF",
  });

  // 19. Kill Fee
  const killNum = rawCanonical?.kill_fee_usd;
  const killNote = rawCanonical?.kill_fee_note;
  rows.push({
    key: "kill_fee",
    label: "Kill Fee",
    detail:
      typeof killNum === "number"
        ? `$${killNum.toLocaleString()}`
        : killNote
          ? "None (see terms)"
          : "Not specified",
    means:
      killNote ??
      (typeof killNum === "number"
        ? "Paid if the brand cancels mid-production."
        : "No kill-fee clause — clarify cancellation pay before committing production time."),
    status: typeof killNum === "number" || killNote ? "complete" : missingTone,
    source: "SOW PDF",
  });

  // 20. FTC / Disclosure
  const ftc = rawCanonical?.ftc_disclosure;
  rows.push({
    key: "ftc_disclosure",
    label: "FTC / Disclosure",
    detail: ftc ?? "Not specified",
    means: ftc
      ? `Compliance required: ${ftc}.`
      : "Confirm required #ad / paid-partnership disclosure to stay FTC-compliant.",
    status: ftc ? "complete" : missingTone,
    source: "SOW PDF",
  });

  // 21. Termination
  const term = rawCanonical?.termination;
  rows.push({
    key: "termination",
    label: "Termination",
    detail: term
      ? `For cause, ${term.cure_days ?? "?"}-day cure${term.for_convenience ? " + for convenience" : ""}`
      : "Not specified",
    means: term
      ? `Either party may terminate for material breach with a ${term.cure_days ?? "?"}-business-day cure window. ${term.immediate_suspension ? `Immediate suspension for: ${term.immediate_suspension}.` : ""}`
      : "Confirm notice period + termination rights before signing.",
    status: term ? "complete" : missingTone,
    source: "SOW PDF",
  });

  // 22. Do-Not-Say / Brand Safety
  const dns = rawCanonical?.do_not_say ?? [];
  rows.push({
    key: "do_not_say",
    label: "Do-Not-Say / Brand Safety",
    detail: dns.length > 0 ? dns.join("; ") : "None specified",
    means:
      dns.length > 0
        ? "Banned claims / off-limits language — keep these out of every script + caption."
        : "No explicit do-not-say list — still apply FTC + platform-policy common sense.",
    status: dns.length > 0 ? "complete" : "incomplete",
    source: "SOW PDF",
  });

  return rows;
}

/**
 * Returns SOW requirements for a slug — hardcoded sowData first, then
 * canonical-derived. Returns empty array only if slug is unknown to both.
 */
export function getSowRequirements(slug: string): SowRequirementRow[] {
  // Prefer hand-curated requirements (ParakeetAI).
  const hardcoded = (sowData as Record<string, { requirements: SowRequirementRow[] }>)[slug];
  if (hardcoded?.requirements && hardcoded.requirements.length > 0) {
    return hardcoded.requirements;
  }

  // Fallback: derive from canonical row.
  const row = MOCK_CAMPAIGNS.find((c) => c.campaign_id === slug);
  if (!row) return [];

  return deriveRequirementsFromCanonical(row);
}
