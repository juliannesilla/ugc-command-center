// Campaign registry — maps slugs to mock data folders.
// Source: UGC/_meta/05-campaign-template + UGC/sideshift-parakeetai/.
// D-3-RECOVERY: seeded parakeetai + lotusshop, restructured to match per-campaign JSON shape.

import elfSow from "./elf/sow.json";
import elfScript from "./elf/script.json";
import elfProduction from "./elf/production.json";
import parakeetaiSow from "./parakeetai/sow.json";
import parakeetaiScript from "./parakeetai/script.json";
import parakeetaiProduction from "./parakeetai/production.json";
import lotusshopSow from "./lotusshop/sow.json";
import lotusshopScript from "./lotusshop/script.json";
import lotusshopProduction from "./lotusshop/production.json";

export type CampaignSlug = "elf" | "parakeetai" | "lotusshop";

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
};

export const sowData = {
  elf: elfSow,
  parakeetai: parakeetaiSow,
  lotusshop: lotusshopSow,
};

export const scriptData = {
  elf: elfScript,
  parakeetai: parakeetaiScript,
  lotusshop: lotusshopScript,
};

export const productionData = {
  elf: elfProduction,
  parakeetai: parakeetaiProduction,
  lotusshop: lotusshopProduction,
};

export function getCampaign(slug: string): CampaignMeta | null {
  return (campaigns as Record<string, CampaignMeta>)[slug] ?? null;
}

export function listCampaigns(): CampaignMeta[] {
  return Object.values(campaigns);
}
