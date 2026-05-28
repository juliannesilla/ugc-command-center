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

import { loadDashboardCampaigns } from "./from-canonical";

import type { Campaign } from "@/lib/types/campaign";

// ──────────────────────────────────────────────────────────────────────────
// Legacy per-campaign metadata — ParakeetAI only, since it is the only
// campaign with an instantiated `UGC/sideshift-parakeetai/` source folder
// and the only one with hand-curated SOW / script / production JSON. Used
// by `/campaigns/[slug]/sow|script|production` detail pages.
//
// New signed campaigns (MWM, Phobaxx) appear via MOCK_CAMPAIGNS below but
// do not yet have detail-page assets — clicking through would 404 until
// scaffolded. That is per A.14v scope: dashboard surface first.
// ──────────────────────────────────────────────────────────────────────────

export type CampaignSlug = "parakeetai";

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

export const campaigns: Record<CampaignSlug, CampaignMeta> = {
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

export const sowData = {
  parakeetai: parakeetaiSow,
};

export const scriptData = {
  parakeetai: parakeetaiScript,
};

export const productionData = {
  parakeetai: parakeetaiProduction,
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
