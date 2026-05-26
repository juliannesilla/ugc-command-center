/**
 * Campaign performance metrics — A.14t T5
 *
 * Per-campaign post-publish metrics. After Julz ships a UGC video and gets
 * actual stats from brand reporting / creator dashboard, she logs them here.
 * Feeds A.4 G35 concept-to-performance correlation (deferred) AND T6
 * case-study generator can consume the trend.
 *
 * Skills cited (HR-21): data:create-viz, frontend-design.
 */

export type CampaignMetric = {
  campaign_slug: string;
  date: string; // ISO yyyy-mm-dd
  views: number;
  saves: number;
  shares: number;
  comments: number;
  ctr: number; // 0.0 - 1.0
  engagement_rate: number; // 0.0 - 1.0
  platform: "tiktok" | "instagram" | "youtube" | "other";
  source: "brand_report" | "creator_dashboard" | "manual";
};

export const CAMPAIGN_METRICS: CampaignMetric[] = [
  // elf — 3 reads, climbing
  {
    campaign_slug: "elf",
    date: "2026-04-22",
    views: 14_200,
    saves: 380,
    shares: 92,
    comments: 41,
    ctr: 0.038,
    engagement_rate: 0.054,
    platform: "tiktok",
    source: "creator_dashboard",
  },
  {
    campaign_slug: "elf",
    date: "2026-04-29",
    views: 38_600,
    saves: 1_120,
    shares: 264,
    comments: 117,
    ctr: 0.046,
    engagement_rate: 0.063,
    platform: "tiktok",
    source: "creator_dashboard",
  },
  {
    campaign_slug: "elf",
    date: "2026-05-10",
    views: 71_400,
    saves: 2_340,
    shares: 511,
    comments: 248,
    ctr: 0.052,
    engagement_rate: 0.071,
    platform: "tiktok",
    source: "brand_report",
  },

  // goodie-ai — 2 reads
  {
    campaign_slug: "goodie-ai",
    date: "2026-04-18",
    views: 6_400,
    saves: 142,
    shares: 31,
    comments: 18,
    ctr: 0.031,
    engagement_rate: 0.041,
    platform: "instagram",
    source: "manual",
  },
  {
    campaign_slug: "goodie-ai",
    date: "2026-05-02",
    views: 12_800,
    saves: 318,
    shares: 74,
    comments: 39,
    ctr: 0.036,
    engagement_rate: 0.048,
    platform: "instagram",
    source: "brand_report",
  },

  // lotusshop — 2 reads
  {
    campaign_slug: "lotusshop",
    date: "2026-04-12",
    views: 22_300,
    saves: 612,
    shares: 138,
    comments: 64,
    ctr: 0.041,
    engagement_rate: 0.059,
    platform: "tiktok",
    source: "creator_dashboard",
  },
  {
    campaign_slug: "lotusshop",
    date: "2026-04-26",
    views: 51_800,
    saves: 1_640,
    shares: 392,
    comments: 184,
    ctr: 0.047,
    engagement_rate: 0.066,
    platform: "tiktok",
    source: "brand_report",
  },

  // parakeetai — 1 read (chart-min not yet reached, will show empty trend)
  {
    campaign_slug: "parakeetai",
    date: "2026-05-15",
    views: 4_200,
    saves: 88,
    shares: 19,
    comments: 11,
    ctr: 0.028,
    engagement_rate: 0.034,
    platform: "youtube",
    source: "creator_dashboard",
  },

  // megprime-pay & vilo — no metrics yet, exercises empty state
];

/** Filter helper — returns metrics sorted ascending by date. */
export function getMetricsForCampaign(slug: string): CampaignMetric[] {
  return CAMPAIGN_METRICS.filter((m) => m.campaign_slug === slug).sort(
    (a, b) => a.date.localeCompare(b.date),
  );
}
