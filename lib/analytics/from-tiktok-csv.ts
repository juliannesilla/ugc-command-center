// A.14v V9A FLORENCE: typed adapter that re-exports baked @geezjulz TikTok
// analytics for the /analytics page chart components.
//
// SOURCE: julz-vault/01-WORK-CURRENT/social-media/tiktok_data_enhanced.csv
// (42 posts, parsed via scripts/build-tiktok-analytics.mjs → tiktok-data.json).
//
// HR-10 ACCESS HONESTY: CSV has no views column. We expose ENGAGEMENT (likes +
// comments + shares) on the "current" series and leave "previous" null so the
// chart honestly shows what exists in the source.

import tiktokData from './tiktok-data.json';

export interface ViewsOverTimePoint {
  date: string; // 'Apr 06'
  isoDate: string; // 'YYYY-MM-DD'
  current: number; // engagement (likes+comments+shares) for that date
  previous: number | null; // honestly null — no prior-period data
  posts: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface HookPerformanceRow {
  id: string;
  label: string;
  posts: number;
  avgEngagement: number; // engagement per post
  avgLikes: number;
  avgComments: number;
  totalEngagement: number;
}

export interface TikTokAnalyticsTotals {
  posts: number;
  likes: number;
  comments: number;
  shares: number;
  engagement: number;
  dateRange: { start: string; end: string } | null;
}

export function getViewsOverTime(): ViewsOverTimePoint[] {
  return tiktokData.viewsOverTime as ViewsOverTimePoint[];
}

export function getHookPerformance(): HookPerformanceRow[] {
  return tiktokData.hookPerformance as HookPerformanceRow[];
}

export function getTikTokTotals(): TikTokAnalyticsTotals {
  return tiktokData.totals as TikTokAnalyticsTotals;
}

export function getTikTokSourceMeta(): { generatedAt: string; source: string; notes: string[] } {
  return {
    generatedAt: tiktokData.generatedAt,
    source: tiktokData.source,
    notes: tiktokData.notes,
  };
}
