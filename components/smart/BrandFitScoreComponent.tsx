/**
 * BrandFitScoreComponent
 *
 * Spec: `01-initial-dashboard-prompt.md` L623-L632 — Personal Brand Fit Score.
 *   "Score how well a campaign fits:
 *    - AI/software · workflow/productivity · marketing/GTM · creator tools ·
 *      finance/home/lifestyle · marketplace/eBay · personal story angle ·
 *      long-term creator positioning"
 *
 * Overall score = getBrandFitScore() from lib/scoring (E-DATA shipped).
 * Per-niche breakdown derived via keyword matching on
 * product_category + product + brand (mock-acceptable, see HR-4).
 *
 * SSR-safe (no useState, no client interactivity beyond title tooltip).
 */

import { Sparkles, Target } from "lucide-react";
import { getBrandFitScore } from "@/lib/scoring";
import type { Campaign } from "@/lib/types/campaign";

type NicheKey =
  | "ai-software"
  | "workflow-productivity"
  | "marketing-gtm"
  | "creator-tools"
  | "finance-home-lifestyle"
  | "marketplace-ebay"
  | "personal-story-angle"
  | "long-term-positioning";

type Niche = {
  key: NicheKey;
  label: string;
  blurb: string;
  keywords: string[];
  /** Maps `product_category` enum values to a baseline boost (0-100). */
  categoryBoost: Partial<Record<string, number>>;
};

const NICHES: Niche[] = [
  {
    key: "ai-software",
    label: "AI / Software",
    blurb: "Core sweet spot — Julz ships AI tooling content reliably",
    keywords: ["ai", "gpt", "claude", "ml", "llm", "software", "saas", "api"],
    categoryBoost: { ai: 95, software: 88, creator_tools: 60 },
  },
  {
    key: "workflow-productivity",
    label: "Workflow / Productivity",
    blurb: "Strong fit — productivity is a recurring narrative pillar",
    keywords: ["workflow", "productivity", "automation", "notion", "system", "tool"],
    categoryBoost: { ai: 70, software: 80, creator_tools: 78 },
  },
  {
    key: "marketing-gtm",
    label: "Marketing / GTM",
    blurb: "Aligned — Julz's marketing background reads as authoritative",
    keywords: ["marketing", "gtm", "ads", "growth", "campaign", "brand"],
    categoryBoost: { software: 65, ai: 60, creator_tools: 55 },
  },
  {
    key: "creator-tools",
    label: "Creator Tools",
    blurb: "Tier-1 fit — directly serves Julz's audience",
    keywords: ["creator", "ugc", "content", "tiktok", "instagram", "video"],
    categoryBoost: { creator_tools: 95, ai: 65, software: 55 },
  },
  {
    key: "finance-home-lifestyle",
    label: "Finance / Home / Lifestyle",
    blurb: "Adjacent — works in moderation, watch saturation",
    keywords: ["finance", "money", "budget", "home", "lifestyle", "decor", "beauty"],
    categoryBoost: { finance: 80, home: 70, beauty: 65 },
  },
  {
    key: "marketplace-ebay",
    label: "Marketplace / eBay",
    blurb: "Owned narrative — digital-treasures-llc is your live case study",
    keywords: ["ebay", "marketplace", "resale", "listing", "thrift"],
    categoryBoost: { other: 50 },
  },
  {
    key: "personal-story-angle",
    label: "Personal Story Angle",
    blurb: "Always available — Julz's POV is the moat",
    keywords: [],
    // Personal story is always available — flat 70 baseline
    categoryBoost: { ai: 75, software: 75, creator_tools: 80, finance: 70, home: 65, beauty: 65, other: 70 },
  },
  {
    key: "long-term-positioning",
    label: "Long-term Creator Positioning",
    blurb: "Compounds — favor brands that strengthen the creator brand",
    keywords: ["ai", "software", "creator", "marketing"],
    categoryBoost: { ai: 85, software: 75, creator_tools: 88, finance: 50, home: 45, beauty: 55, other: 50 },
  },
];

function tokenize(s: string | undefined): string[] {
  if (!s) return [];
  return s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function scoreNiche(niche: Niche, c: Campaign): number {
  // Start from categoryBoost
  const cat = c.product_category ?? "other";
  let base = niche.categoryBoost[cat] ?? 40;
  // Boost via keyword match in product + brand
  const tokens = new Set([...tokenize(c.product), ...tokenize(c.brand), ...tokenize(c.campaign_name)]);
  const keywordHits = niche.keywords.filter((k) => tokens.has(k)).length;
  base += keywordHits * 8;
  // Clamp 0-100
  return Math.max(0, Math.min(100, Math.round(base)));
}

function toneFor(score: number): { ring: string; bar: string; text: string } {
  if (score >= 75) return { ring: "ring-emerald-200", bar: "bg-emerald-500", text: "text-emerald-700" };
  if (score >= 50) return { ring: "ring-iris-200", bar: "bg-iris-500", text: "text-iris-700" };
  if (score >= 30) return { ring: "ring-amber-200", bar: "bg-amber-500", text: "text-amber-700" };
  return { ring: "ring-cloud-200", bar: "bg-cloud-400", text: "text-ink-700" };
}

export function BrandFitScoreComponent({ campaign }: { campaign: Campaign }) {
  const overall = campaign.brand_fit_score ?? getBrandFitScore(campaign);
  const overallTone = toneFor(overall);
  const niches = NICHES.map((n) => ({ ...n, score: scoreNiche(n, campaign) }));
  const topNiche = niches.reduce((a, b) => (b.score > a.score ? b : a));

  return (
    <section className="rounded-3xl bg-white ring-1 ring-cloud-200 shadow-soft p-5 md:p-6 flex flex-col gap-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-iris-500">
            Personal Brand Fit Score
          </p>
          <h3 className="font-display text-lg font-bold text-ink-900 mt-1">
            How well does this campaign fit your creator brand?
          </h3>
          <p className="text-xs text-ink-600 mt-1">
            {campaign.brand} · {campaign.product}
          </p>
        </div>
        <div
          className={`flex flex-col items-end shrink-0 px-4 py-3 rounded-2xl ring-1 ${overallTone.ring} bg-white`}
          title={`Top niche: ${topNiche.label} at ${topNiche.score}% match. Drives much of the overall score.`}
        >
          <p className={`font-display text-4xl font-bold ${overallTone.text} leading-none`}>
            {overall}<span className="text-base text-ink-600">%</span>
          </p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-ink-700 mt-1">
            Overall fit
          </p>
        </div>
      </header>

      <div className="rounded-2xl bg-iris-50 ring-1 ring-iris-100 p-3 flex items-start gap-2.5">
        <Sparkles className="h-4 w-4 text-iris-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-ink-900">What this means</p>
          <p className="text-[11px] text-ink-700 mt-0.5">
            Top niche match: <strong>{topNiche.label}</strong> ({topNiche.score}%) — {topNiche.blurb.toLowerCase()}.
            Use this to decide whether to pursue, pitch harder, or pass.
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-2.5">
        {niches.map((n) => {
          const tone = toneFor(n.score);
          return (
            <li key={n.key}>
              <div className="flex items-center justify-between gap-3 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <Target className={`h-3 w-3 shrink-0 ${tone.text}`} />
                  <p className="text-sm font-medium text-ink-900 truncate">{n.label}</p>
                </div>
                <span className={`text-xs font-semibold tabular-nums ${tone.text}`}>
                  {n.score}%
                </span>
              </div>
              <div
                className="h-1.5 rounded-full bg-cloud-100 overflow-hidden"
                title={n.blurb}
              >
                <div
                  className={`h-full ${tone.bar} transition-all`}
                  style={{ width: `${n.score}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default BrandFitScoreComponent;
