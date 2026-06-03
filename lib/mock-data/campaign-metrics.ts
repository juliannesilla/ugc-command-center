/**
 * Campaign performance metrics — A.14t T5
 *
 * Per-campaign post-publish metrics. After Julz ships a UGC video and gets
 * actual stats from brand reporting / creator dashboard, she logs them here.
 *
 * HR-49 / HR-10 (A.AB): the prior seed rows (elf / goodie-ai / lotusshop /
 * parakeetai) were FABRICATED performance numbers — removed. Honest-empty until
 * real post-metrics are logged; getMetricsForCampaign() returns [] so the
 * PerfMetricsWidget renders its empty state instead of fake views.
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

// Honest-empty (HR-49): real post-publish metrics get appended here once Julz
// logs them from brand reports / creator dashboards.
export const CAMPAIGN_METRICS: CampaignMetric[] = [];

/** Filter helper — returns metrics sorted ascending by date. */
export function getMetricsForCampaign(slug: string): CampaignMetric[] {
  return CAMPAIGN_METRICS.filter((m) => m.campaign_slug === slug).sort(
    (a, b) => a.date.localeCompare(b.date),
  );
}
