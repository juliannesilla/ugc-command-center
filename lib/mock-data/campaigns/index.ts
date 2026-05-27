// Campaign registry — maps slugs to real campaign data folders.
//
// Source: UGC/_meta/05-campaign-template + UGC/sideshift-parakeetai/.
//
// Phase A.14u F5-STRIP-MOCKS (2026-05-27, Julz directive): stripped 5 mock
// campaigns (elf, goodie-ai, lotusshop, megprime-pay, vilo) per Julz's call
// "if it is not a real campaign, then take it off the dashboard."
// Only ParakeetAI remains — the only campaign with a real `UGC/sideshift-parakeetai/`
// source folder. New real campaigns get added when Julz drops signed brand
// names in chat (Claude scaffolds the `UGC/sideshift-<brand>/` folder + a row
// here).
//
// Backward-compat: `CampaignMeta` + `campaigns` record kept intact for legacy
// per-campaign detail pages. New components consume `MOCK_CAMPAIGNS` instead.

// A.14u F2: dates anchored relative to today via lib/date-anchor.
import { daysFromNow as _daysFromNow } from "@/lib/date-anchor";

import parakeetaiSow from "./parakeetai/sow.json";
import parakeetaiScript from "./parakeetai/script.json";
import parakeetaiProduction from "./parakeetai/production.json";

import type { Campaign } from "@/lib/types/campaign";

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
    status: "Drafting",
    startDate: "2026-05-12",
    dueDate: _daysFromNow(7),
    payment: { base: 25, bonus: 100, total: 125, structure: "$25 base + up to $100 per 100K views (uncapped)" },
    sowProgress: { complete: 9, total: 14 },
    stage: 6,
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
// Canonical Campaign rows (Phase A.14e Wave 1 — E-DATA)
// Phase A.14u F5: stripped to ParakeetAI only (the only real instantiated campaign).
//
// Source: dashboard-spec view #3 "All Campaigns / Database View" — 36-field row.
// ──────────────────────────────────────────────────────────────────────────

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    campaign_id: "parakeetai",
    brand: "ParakeetAI",
    product: "Real-time AI Interview Assistant",
    campaign_name: "ParakeetAI — TikTok Talking-Head Launch",
    platform_source: "sideshift",
    contact_name: "Sasha (SideShift creator manager)",
    contact_role: "Creator Manager",
    contact_channel: "sideshift",
    current_stage: "SCRIPT READY",
    status: "active",
    priority: "high",
    waiting_on_who: "me",
    campaign_type: "talking_head",
    product_category: "ai",
    deliverable_count: 1,
    required_format: "vertical_video",
    required_length: "30-90 seconds",
    due_date: _daysFromNow(7),
    follow_up_date: _daysFromNow(3),
    base_pay: 25,
    bonus_potential: "$100 per 100K views (uncapped)",
    total_potential_value: 125,
    payment_status: "pending",
    sow_link: "/campaigns/parakeetai/sow",
    job_link: "https://sideshift.example/parakeetai-launch",
    asset_folder: "/campaigns/parakeetai/assets",
    script_link: "/campaigns/parakeetai/script",
    readiness_score: 82,
    brand_fit_score: 95,
    risk_level: "low",
    next_action: "Film hook variations + Parakeet panel screen-recording",
    blockers: [],
    missing_info: ["screen-recording sign-off", "Parakeet panel screenshot final"],
    last_message_date: "2026-05-18",
    last_message_summary: "Sasha confirmed creative freedom + uncapped bonus tracking.",
    my_last_response: "Template 6 — Review Intro + Submit Video (modified for SideShift flow)",
    relationship_status: "Active Collaboration",
    repeat_potential: "high",
    payment_quality: "good",
    communication_quality: "fast",
    next_relationship_move: "After submit: ask about retainer for paid-ad cuts",
    notes: "Strong portfolio + AI-niche fit. Aim for $200+ bonus payout via watch-time optimization.",
  },
];

/** Lookup helper for the canonical campaign rows. */
export function getCampaignRow(id: string): Campaign | null {
  return MOCK_CAMPAIGNS.find((c) => c.campaign_id === id) ?? null;
}

/**
 * Empty-state copy for views that show "no campaigns yet" when MOCK_CAMPAIGNS
 * filters down to zero. Tier 1 voice: bestie + direct.
 *
 * Use in pipeline/board/deadlines/needs-attention/etc. when the filtered set is empty.
 */
export const EMPTY_STATE_COPY = {
  title: "No campaigns here yet.",
  body: "Only ParakeetAI is instantiated right now. Drop your signed brand names in chat — I'll add them as real campaigns with stages 1-4 backfilled from your SideShift threads.",
} as const;
