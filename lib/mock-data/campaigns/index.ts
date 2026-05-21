// Campaign registry — maps slugs to mock data folders + canonical Campaign rows.
//
// Source: UGC/_meta/05-campaign-template + UGC/sideshift-parakeetai/.
// D-3-RECOVERY: seeded parakeetai + lotusshop, restructured to match per-campaign JSON shape.
// Phase A.14e Wave 1 (E-DATA): added goodie-ai + megprime-pay + vilo;
// exported `MOCK_CAMPAIGNS: Campaign[]` for the new database/board/CRM views.
//
// Backward-compat: `CampaignMeta` + `campaigns` record kept intact for legacy
// per-campaign detail pages. New components consume `MOCK_CAMPAIGNS` instead.

import elfSow from "./elf/sow.json";
import elfScript from "./elf/script.json";
import elfProduction from "./elf/production.json";
import parakeetaiSow from "./parakeetai/sow.json";
import parakeetaiScript from "./parakeetai/script.json";
import parakeetaiProduction from "./parakeetai/production.json";
import lotusshopSow from "./lotusshop/sow.json";
import lotusshopScript from "./lotusshop/script.json";
import lotusshopProduction from "./lotusshop/production.json";
import goodieaiSow from "./goodie-ai/sow.json";
import goodieaiScript from "./goodie-ai/script.json";
import goodieaiProduction from "./goodie-ai/production.json";
import megprimepaySow from "./megprime-pay/sow.json";
import megprimepayScript from "./megprime-pay/script.json";
import megprimepayProduction from "./megprime-pay/production.json";
import viloSow from "./vilo/sow.json";
import viloScript from "./vilo/script.json";
import viloProduction from "./vilo/production.json";

import type { Campaign } from "@/lib/types/campaign";

export type CampaignSlug =
  | "elf"
  | "parakeetai"
  | "lotusshop"
  | "goodie-ai"
  | "megprime-pay"
  | "vilo";

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
  elf: {
    slug: "elf",
    brand: "e.l.f. Cosmetics",
    product: "Glow Reviver Lip Oil",
    category: "Beauty",
    logoMark: "e",
    accent: "#E94F37",
    status: "Active",
    startDate: "2026-05-10",
    dueDate: "2026-05-24",
    payment: { base: 450, bonus: 200, total: 650, structure: "$450 base + $200 performance bonus" },
    sowProgress: { complete: 6, total: 14 },
    stage: 8,
  },
  parakeetai: {
    slug: "parakeetai",
    brand: "ParakeetAI",
    product: "Real-time AI Interview Assistant",
    category: "Software / AI",
    logoMark: "P",
    accent: "#2EC27E",
    status: "Drafting",
    startDate: "2026-05-12",
    dueDate: "2026-05-26",
    payment: { base: 25, bonus: 100, total: 125, structure: "$25 base + up to $100 per 100K views (uncapped)" },
    sowProgress: { complete: 9, total: 14 },
    stage: 6,
  },
  lotusshop: {
    slug: "lotusshop",
    brand: "Lotus Shop",
    product: "Linen-blend wrap, cream",
    category: "Fashion / Slow-fashion",
    logoMark: "L",
    accent: "#C9A883",
    status: "Drafting",
    startDate: "2026-05-18",
    dueDate: "2026-05-30",
    payment: { base: 250, bonus: 125, total: 525, structure: "$525 total ($250 base + $275 on-approval) · $125 view bonus" },
    sowProgress: { complete: 5, total: 14 },
    stage: 3,
  },
  "goodie-ai": {
    slug: "goodie-ai",
    brand: "Goodie AI",
    product: "AI Tooling / Creator Program",
    category: "Software / AI",
    logoMark: "G",
    accent: "#F4A261",
    status: "Drafting",
    startDate: "2026-05-14",
    dueDate: "2026-06-15",
    payment: { base: 0, bonus: 0, total: 0, structure: "Pending — payment structure TBD per Goodie AI brief" },
    sowProgress: { complete: 1, total: 14 },
    stage: 3,
  },
  "megprime-pay": {
    slug: "megprime-pay",
    brand: "MegPrime Pay",
    product: "Payment App",
    category: "Finance / Payments",
    logoMark: "M",
    accent: "#264653",
    status: "Drafting",
    startDate: "2026-05-16",
    dueDate: "2026-06-20",
    payment: { base: 0, bonus: 0, total: 0, structure: "Multi-video deal pending contract review" },
    sowProgress: { complete: 0, total: 14 },
    stage: 2,
  },
  vilo: {
    slug: "vilo",
    brand: "VILO",
    product: "Creator Tooling Program",
    category: "Creator Tools",
    logoMark: "V",
    accent: "#9D6BFF",
    status: "Drafting",
    startDate: "2026-05-18",
    dueDate: "2026-06-08",
    payment: { base: 250, bonus: 150, total: 400, structure: "Creator-program rate (base + posting bonus, exact TBD)" },
    sowProgress: { complete: 4, total: 14 },
    stage: 4,
  },
};

export const sowData = {
  elf: elfSow,
  parakeetai: parakeetaiSow,
  lotusshop: lotusshopSow,
  "goodie-ai": goodieaiSow,
  "megprime-pay": megprimepaySow,
  vilo: viloSow,
};

export const scriptData = {
  elf: elfScript,
  parakeetai: parakeetaiScript,
  lotusshop: lotusshopScript,
  "goodie-ai": goodieaiScript,
  "megprime-pay": megprimepayScript,
  vilo: viloScript,
};

export const productionData = {
  elf: elfProduction,
  parakeetai: parakeetaiProduction,
  lotusshop: lotusshopProduction,
  "goodie-ai": goodieaiProduction,
  "megprime-pay": megprimepayProduction,
  vilo: viloProduction,
};

export function getCampaign(slug: string): CampaignMeta | null {
  return (campaigns as Record<string, CampaignMeta>)[slug] ?? null;
}

export function listCampaigns(): CampaignMeta[] {
  return Object.values(campaigns);
}

// ──────────────────────────────────────────────────────────────────────────
// Canonical Campaign rows (Phase A.14e Wave 1 — E-DATA)
//
// Source: dashboard-spec view #3 "All Campaigns / Database View" — 36-field row.
// Backfill data per prompt L820-L829 example-card hints + outreach templates.
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
    due_date: "2026-05-26",
    follow_up_date: "2026-05-22",
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
  {
    campaign_id: "elf",
    brand: "e.l.f. Cosmetics",
    product: "Glow Reviver Lip Oil",
    campaign_name: "e.l.f. Glow Reviver — Honest Review",
    platform_source: "direct",
    contact_name: "Maya (e.l.f. creator partnerships)",
    contact_role: "Creator Partnerships Lead",
    contact_channel: "email",
    current_stage: "FILMING",
    status: "active",
    priority: "high",
    waiting_on_who: "me",
    campaign_type: "review",
    product_category: "beauty",
    deliverable_count: 1,
    required_format: "vertical_video",
    required_length: "30-60 seconds",
    due_date: "2026-05-24",
    base_pay: 450,
    bonus_potential: 200,
    total_potential_value: 650,
    payment_status: "pending",
    sow_link: "/campaigns/elf/sow",
    job_link: "https://elf.example/creator-portal",
    asset_folder: "/campaigns/elf/assets",
    script_link: "/campaigns/elf/script",
    readiness_score: 75,
    brand_fit_score: 50,
    risk_level: "low",
    next_action: "Film mirror-test sequence + doe-foot close-up",
    blockers: [],
    missing_info: ["bonus tracking confirmation (post-original vs post-approval)"],
    last_message_date: "2026-05-17",
    last_message_summary: "Maya confirmed bonus tracks against post-original-post views.",
    my_last_response: "Template 4 — Natural Write (Interested / Next Steps)",
    relationship_status: "Active Collaboration",
    repeat_potential: "medium",
    payment_quality: "good",
    communication_quality: "fast",
    next_relationship_move: "After approval: pitch second product in Glow line",
    notes: "Beauty isn't Julz's primary niche, but e.l.f. pays well + has retainer potential.",
  },
  {
    campaign_id: "lotusshop",
    brand: "Lotus Shop",
    product: "Linen-blend wrap, cream",
    campaign_name: "Lotus Shop — One Item Three Ways",
    platform_source: "inbound",
    contact_name: "Pri (Lotus founder)",
    contact_role: "Founder",
    contact_channel: "whatsapp",
    current_stage: "SOW RECEIVED",
    status: "active",
    priority: "medium",
    waiting_on_who: "me",
    campaign_type: "organic_post",
    product_category: "other",
    deliverable_count: 2,
    required_format: "vertical_video",
    required_length: "20-40 seconds each",
    due_date: "2026-05-30",
    base_pay: 250,
    bonus_potential: 125,
    total_potential_value: 525,
    payment_status: "pending",
    sow_link: "/campaigns/lotusshop/sow",
    asset_folder: "/campaigns/lotusshop/assets",
    readiness_score: 20,
    brand_fit_score: 55,
    risk_level: "medium",
    next_action: "Review Lotus Shop intro doc before joining WhatsApp",
    blockers: ["Usage rights unclear (IG vs TikTok)"],
    missing_info: ["Usage rights scope", "second-video styling requirements"],
    last_message_date: "2026-05-18",
    last_message_summary: "Pri sent intro doc + WhatsApp invite.",
    my_last_response: "Template 5 — Lotus Shop (Review Intro + WhatsApp)",
    relationship_status: "Brief Received",
    repeat_potential: "medium",
    payment_quality: "unknown",
    communication_quality: "slow",
    next_relationship_move: "After intro review: ask P0/P1 missing-info questions in WhatsApp",
    notes: "Soft-fashion category — not Julz's primary niche. Test before committing to retainer.",
  },
  {
    campaign_id: "goodie-ai",
    brand: "Goodie AI",
    product: "AI Tooling Creator Program",
    campaign_name: "Goodie AI — Creator Program (Pending Brief)",
    platform_source: "email",
    contact_name: "Riley (Goodie AI partnerships)",
    contact_role: "Partnerships Manager",
    contact_channel: "email",
    current_stage: "CALL SCHEDULED",
    status: "waiting",
    priority: "medium",
    waiting_on_who: "brand",
    campaign_type: "organic_post",
    product_category: "ai",
    deliverable_count: 4,
    required_format: "vertical_video",
    required_length: "TBD",
    follow_up_date: "2026-05-22",
    call_date: "2026-05-23",
    payment_status: "unknown",
    asset_folder: "/campaigns/goodie-ai/assets",
    readiness_score: 35,
    brand_fit_score: 95,
    risk_level: "medium",
    next_action: "Ask Goodie AI for written brief before call",
    blockers: ["Missing SOW", "Missing payment info"],
    missing_info: ["written brief", "payment structure", "deliverable count"],
    last_message_date: "2026-05-15",
    last_message_summary: "Riley scheduled call for May 23 — no written context yet.",
    my_last_response: "Template 2 — Goodie AI (Follow-Up Call requesting written brief)",
    relationship_status: "Call Requested",
    repeat_potential: "high",
    payment_quality: "unknown",
    communication_quality: "slow",
    next_relationship_move: "Push for brief before call (re-send Template 2)",
    notes: "AI/software category = strong brand fit. But hold script work until brief lands.",
  },
  {
    campaign_id: "megprime-pay",
    brand: "MegPrime Pay",
    product: "Payment App",
    campaign_name: "MegPrime Pay — Multi-Video Deal (Contract Pending)",
    platform_source: "email",
    contact_name: "Devon (MegPrime BD)",
    contact_role: "Business Development",
    contact_channel: "email",
    current_stage: "BRAND REPLIED",
    status: "waiting",
    priority: "high",
    waiting_on_who: "me",
    campaign_type: "talking_head",
    product_category: "finance",
    deliverable_count: 3,
    required_format: "vertical_video",
    required_length: "TBD",
    call_date: "2026-05-25",
    payment_status: "unknown",
    asset_folder: "/campaigns/megprime-pay/assets",
    readiness_score: 25,
    brand_fit_score: 72,
    risk_level: "high",
    next_action: "Review contract draft over weekend before Monday call",
    blockers: ["Missing payment info", "Missing SOW"],
    missing_info: ["per-video payment", "usage rights cap", "compliance-cleared messaging"],
    last_message_date: "2026-05-17",
    last_message_summary: "Devon sent draft contract + scheduled Monday call.",
    my_last_response: "Template 3 — MegPrime Pay (Call + Multiple Videos)",
    relationship_status: "Brief Requested",
    repeat_potential: "high",
    payment_quality: "unknown",
    communication_quality: "fast",
    next_relationship_move: "Anchor rate-card before Monday — don't negotiate without it",
    notes: "Multi-video opportunity. Finance compliance = legal-review path required.",
  },
  {
    campaign_id: "vilo",
    brand: "VILO",
    product: "Creator Tooling Program",
    campaign_name: "VILO — Creator Program Submission",
    platform_source: "email",
    contact_name: "Jess (VILO program lead)",
    contact_role: "Creator Program Lead",
    contact_channel: "email",
    current_stage: "SOW RECEIVED",
    status: "active",
    priority: "high",
    waiting_on_who: "me",
    campaign_type: "talking_head",
    product_category: "creator_tools",
    deliverable_count: 2,
    required_format: "vertical_video",
    required_length: "30-60 seconds",
    due_date: "2026-06-08",
    base_pay: 250,
    bonus_potential: 150,
    total_potential_value: 400,
    payment_status: "pending",
    asset_folder: "/campaigns/vilo/assets",
    readiness_score: 45,
    brand_fit_score: 90,
    risk_level: "low",
    next_action: "Extract SOW from VILO brief before scripting",
    blockers: [],
    missing_info: ["exact deliverable count", "bonus structure"],
    last_message_date: "2026-05-18",
    last_message_summary: "Jess sent full creator-program brief + sample posts.",
    my_last_response: "Template 7 — VILO / madduck (Interested + Request Brief)",
    relationship_status: "Brief Received",
    repeat_potential: "high",
    payment_quality: "good",
    communication_quality: "fast",
    next_relationship_move: "After SOW extract: confirm scope + lock filming day",
    notes: "Creator-tools = Julz's strongest brand-fit category. High-priority extraction.",
  },
];

/** Lookup helper for the new canonical campaigns. */
export function getCampaignRow(id: string): Campaign | null {
  return MOCK_CAMPAIGNS.find((c) => c.campaign_id === id) ?? null;
}
