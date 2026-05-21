// Content Hub aggregator — pulls scripts, hooks, b-roll, CTAs, phrases, patterns
// across all campaigns into a single cross-campaign library.
//
// Source: AUDIT-RESULTS.md /content-hub fix-rec — "full build. Scripts, b-roll,
// final cuts organized by campaign w/ cross-referenced reusable assets per the
// page subtitle." + dashboard-spec view: cross-campaign reusable content.

import {
  campaigns,
  scriptData,
  productionData,
  type CampaignSlug,
  type CampaignMeta,
} from "./campaigns";
import { CONTENT_PATTERN_LIBRARY, REUSABLE_PHRASES } from "./brain-dump";

export type ContentType =
  | "hook"
  | "script"
  | "broll"
  | "cta"
  | "phrase"
  | "pattern"
  | "asset"
  | "shot"
  | "note";

export type ContentStatus = "draft" | "ready" | "filmed" | "reusable";

export interface ContentItem {
  id: string;
  type: ContentType;
  status: ContentStatus;
  body: string;
  campaignSlug?: CampaignSlug;
  campaignBrand?: string;
  campaignAccent?: string;
  meta?: string; // duration / timestamp / pillar
  tag?: string;
  reusable?: boolean;
}

// ── Stat strip (top of page) ───────────────────────────────────────────────
export const CONTENT_HUB_STATS = [
  { id: "scripts", label: "ACTIVE SCRIPTS", value: "6", delta: "+2" },
  { id: "hooks", label: "HOOKS IN LIBRARY", value: "32", delta: "+8" },
  { id: "broll", label: "B-ROLL SHOTS", value: "54", delta: "+12" },
  { id: "reusable", label: "REUSABLE ASSETS", value: "23", delta: "+5" },
] as const;

// ── Filter chips (content-type filters) ────────────────────────────────────
export const CONTENT_TYPE_FILTERS: { id: ContentType | "all"; label: string; emoji: string }[] = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "hook", label: "Hooks", emoji: "🎣" },
  { id: "script", label: "Scripts", emoji: "📝" },
  { id: "broll", label: "B-Roll", emoji: "🎬" },
  { id: "cta", label: "CTAs", emoji: "🎯" },
  { id: "phrase", label: "Phrases", emoji: "💬" },
  { id: "pattern", label: "Patterns", emoji: "🏆" },
  { id: "asset", label: "Assets", emoji: "📦" },
  { id: "shot", label: "Shots", emoji: "🎥" },
];

// ── Build the unified content stream ───────────────────────────────────────
function buildItems(): ContentItem[] {
  const items: ContentItem[] = [];

  (Object.keys(campaigns) as CampaignSlug[]).forEach((slug) => {
    const meta = campaigns[slug];
    const script = scriptData[slug] as {
      hooks?: string[];
      coreAngle?: string;
      scriptDraft?: { ts: string; section: string; line: string }[];
      ctas?: { primary?: string; secondary?: string; tertiary?: string };
      notes?: string[];
      assets?: { name: string; type: string; updated: string }[];
    };
    const prod = productionData[slug] as {
      shotMap?: { scene: number; visual: string; duration: string; status: string }[];
      brollChecklist?: { id: string; label: string; done: boolean }[];
    };

    // Hooks
    script?.hooks?.forEach((h, i) => {
      items.push({
        id: `${slug}-hook-${i}`,
        type: "hook",
        status: "ready",
        body: h,
        campaignSlug: slug,
        campaignBrand: meta.brand,
        campaignAccent: meta.accent,
        tag: "Hook",
        reusable: i === 0,
      });
    });

    // Script (one card representing the full draft + core angle)
    if (script?.coreAngle) {
      items.push({
        id: `${slug}-script-angle`,
        type: "script",
        status: meta.stage >= 6 ? "ready" : "draft",
        body: script.coreAngle,
        campaignSlug: slug,
        campaignBrand: meta.brand,
        campaignAccent: meta.accent,
        meta: `${script.scriptDraft?.length ?? 0} beats`,
        tag: "Core Angle",
      });
    }

    // Script lines (top 2 most quotable per campaign)
    script?.scriptDraft?.slice(0, 2).forEach((d, i) => {
      items.push({
        id: `${slug}-line-${i}`,
        type: "script",
        status: meta.stage >= 6 ? "ready" : "draft",
        body: d.line,
        campaignSlug: slug,
        campaignBrand: meta.brand,
        campaignAccent: meta.accent,
        meta: `${d.ts} · ${d.section}`,
        tag: d.section,
      });
    });

    // CTAs
    if (script?.ctas?.primary) {
      items.push({
        id: `${slug}-cta-p`,
        type: "cta",
        status: "ready",
        body: script.ctas.primary,
        campaignSlug: slug,
        campaignBrand: meta.brand,
        campaignAccent: meta.accent,
        tag: "Primary",
        reusable: true,
      });
    }
    if (script?.ctas?.secondary) {
      items.push({
        id: `${slug}-cta-s`,
        type: "cta",
        status: "ready",
        body: script.ctas.secondary,
        campaignSlug: slug,
        campaignBrand: meta.brand,
        campaignAccent: meta.accent,
        tag: "Secondary",
      });
    }

    // B-roll
    prod?.brollChecklist?.slice(0, 4).forEach((b) => {
      items.push({
        id: `${slug}-broll-${b.id}`,
        type: "broll",
        status: b.done ? "filmed" : "draft",
        body: b.label,
        campaignSlug: slug,
        campaignBrand: meta.brand,
        campaignAccent: meta.accent,
        tag: b.done ? "Filmed" : "Planned",
      });
    });

    // Shot map
    prod?.shotMap?.slice(0, 2).forEach((s) => {
      items.push({
        id: `${slug}-shot-${s.scene}`,
        type: "shot",
        status: s.status?.toLowerCase() === "filmed" ? "filmed" : "draft",
        body: s.visual,
        campaignSlug: slug,
        campaignBrand: meta.brand,
        campaignAccent: meta.accent,
        meta: s.duration,
        tag: `Scene ${s.scene}`,
      });
    });

    // Production notes (script-level)
    script?.notes?.slice(0, 1).forEach((n, i) => {
      items.push({
        id: `${slug}-note-${i}`,
        type: "note",
        status: "ready",
        body: n,
        campaignSlug: slug,
        campaignBrand: meta.brand,
        campaignAccent: meta.accent,
        tag: "Note",
      });
    });

    // Assets
    script?.assets?.slice(0, 2).forEach((a, i) => {
      items.push({
        id: `${slug}-asset-${i}`,
        type: "asset",
        status: "ready",
        body: a.name,
        campaignSlug: slug,
        campaignBrand: meta.brand,
        campaignAccent: meta.accent,
        meta: `${a.type.toUpperCase()} · ${a.updated}`,
        tag: a.type,
      });
    });
  });

  // Cross-campaign reusable phrases (from brain-dump)
  REUSABLE_PHRASES.slice(0, 6).forEach((p, i) => {
    items.push({
      id: `phrase-${i}`,
      type: "phrase",
      status: "reusable",
      body: p,
      meta: `${(i + 3) * 2}× used`,
      tag: "Reusable",
      reusable: true,
    });
  });

  // Cross-campaign patterns (from brain-dump)
  CONTENT_PATTERN_LIBRARY.slice(0, 5).forEach((p, i) => {
    items.push({
      id: `pattern-${i}`,
      type: "pattern",
      status: "reusable",
      body: p.pattern,
      meta: `${p.used}× used`,
      tag: "Pattern",
      reusable: true,
    });
  });

  return items;
}

export const CONTENT_ITEMS: ContentItem[] = buildItems();

// ── Sidebar categories (left rail) ─────────────────────────────────────────
export const CONTENT_HUB_CATEGORIES = (() => {
  const counts: Record<string, number> = {};
  CONTENT_ITEMS.forEach((i) => {
    counts[i.type] = (counts[i.type] ?? 0) + 1;
  });
  return [
    { id: "hook", label: "Hooks", emoji: "🎣", count: counts.hook ?? 0, accent: "iris" },
    { id: "script", label: "Scripts", emoji: "📝", count: counts.script ?? 0, accent: "peach" },
    { id: "broll", label: "B-Roll", emoji: "🎬", count: counts.broll ?? 0, accent: "mint" },
    { id: "cta", label: "CTAs", emoji: "🎯", count: counts.cta ?? 0, accent: "iris" },
    { id: "phrase", label: "Phrases", emoji: "💬", count: counts.phrase ?? 0, accent: "peach" },
    { id: "pattern", label: "Patterns", emoji: "🏆", count: counts.pattern ?? 0, accent: "iris" },
    { id: "asset", label: "Assets", emoji: "📦", count: counts.asset ?? 0, accent: "mint" },
    { id: "shot", label: "Shots", emoji: "🎥", count: counts.shot ?? 0, accent: "peach" },
    { id: "note", label: "Notes", emoji: "📒", count: counts.note ?? 0, accent: "iris" },
  ];
})();

// ── Campaign filter list ──────────────────────────────────────────────────
export const CONTENT_HUB_CAMPAIGNS: { slug: CampaignSlug | "all"; brand: string; accent: string }[] = [
  { slug: "all", brand: "All Campaigns", accent: "#5B6BFF" },
  ...Object.values(campaigns).map((c: CampaignMeta) => ({
    slug: c.slug,
    brand: c.brand,
    accent: c.accent,
  })),
];
