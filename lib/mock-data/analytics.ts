// A.AA ANALYTICS-REAL (TUFTE / B1): this module was historically a hard-coded
// MOCK dataset (66 posts, 1.2M views, $2,845 earned, fictional brands). It is
// now rewired to compute EVERY export from the REAL @geezjulz TikTok data.
//
// SOURCE: data/tiktok-summary.json + data/tiktok-posts.json (42 real posts,
//   imported from julz-vault tiktok_data_enhanced.csv), surfaced through the
//   typed adapter lib/analytics/from-tiktok.ts.
//
// WHY THIS SHAPE: the file keeps EVERY exported symbol name + TypeScript shape
//   byte-identical to the old mock so all 10 consumer components + the two
//   analytics pages compile UNCHANGED — only the *values* flip from fabricated
//   to real, and metrics the source genuinely lacks are honestly omitted.
//
// HR-10 ACCESS HONESTY + HR-49 NO MOCK DATA — the @geezjulz CSV contains
//   likes, comments and shares ONLY. There are:
//     • NO view counts          → never fabricated; rendered "—" / "no view data"
//     • NO watch-time           → never fabricated
//     • NO link clicks / CTR / conversions / revenue → POSTED_LINKS is empty []
//     • NO earnings / bonus $   → bonus exports are empty []  (honest-empty)
//     • shares are present but ALL ZERO → engagement = likes + comments
//   Every number below traces to the source file. Nothing is invented.

import {
  getTikTokSummaryTotals,
  getPillarSummary,
  getTopPosts,
  HONEST_GAPS,
} from '@/lib/analytics/from-tiktok';

// Real source aggregates, computed once.
const TOTALS = getTikTokSummaryTotals();
const TOP_POSTS = getTopPosts();
const PILLARS = getPillarSummary();

/** Compact number → "8.3K" / "1,845". Honest formatter, no rounding lies. */
function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1000).toFixed(0)}K`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

/** First sentence / clause of a caption, trimmed for list display. */
function shortCaption(caption: string, max = 48): string {
  const clean = caption.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).trimEnd() + '…';
}

// ---------------------------------------------------------------------------
// Date range. The CSV has no fixed reporting window we can honestly label as a
// "period vs prior period" comparison, so these describe the real coverage
// (all-time @geezjulz) rather than inventing a 30-day delta window.
// ---------------------------------------------------------------------------
export interface DateRange {
  label: string;
  start: string; // ISO
  end: string;
}

export const CURRENT_PERIOD: DateRange = {
  label: 'All @geezjulz posts',
  start: '',
  end: '',
};

export const PREVIOUS_PERIOD: DateRange = {
  // Honest: there is no prior-period dataset to compare against.
  label: 'no prior-period data',
  start: '',
  end: '',
};

// ---------------------------------------------------------------------------
// Top stat cards. Real account-level KPIs. No views, no earnings — those tiles
// are replaced with metrics that actually exist (comments, total engagement).
// Deltas are neutral/empty because there is no prior period to diff against.
// ---------------------------------------------------------------------------
export interface TopStatCard {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaTone: 'positive' | 'negative' | 'neutral';
  sublabel?: string;
}

export const TOP_STAT_CARDS: TopStatCard[] = [
  {
    id: 'posted',
    label: 'TOTAL POSTS',
    value: TOTALS.totalPosts.toLocaleString(),
    delta: '',
    deltaTone: 'neutral',
    sublabel: '@geezjulz · all time',
  },
  {
    id: 'likes',
    label: 'TOTAL LIKES',
    value: TOTALS.likes.toLocaleString(),
    delta: '',
    deltaTone: 'neutral',
    sublabel: 'across all posts',
  },
  {
    id: 'comments',
    label: 'TOTAL COMMENTS',
    value: TOTALS.comments.toLocaleString(),
    delta: '',
    deltaTone: 'neutral',
    sublabel: 'across all posts',
  },
  {
    id: 'avg-eng',
    label: 'AVG ENGAGEMENT',
    value: TOTALS.avgEngagementPerPost.toLocaleString(),
    delta: '',
    deltaTone: 'neutral',
    sublabel: 'likes + comments / post',
  },
];

// ---------------------------------------------------------------------------
// Smart Panel — derived from the real pillar split + honest data gaps, not
// fabricated "GRWM +28%" style claims.
// ---------------------------------------------------------------------------
export interface SmartPanelItem {
  id: string;
  text: string;
}

const TOP_PILLAR = PILLARS[0];
const SECOND_PILLAR = PILLARS[1];

export const WHATS_WINNING: SmartPanelItem[] = [
  TOP_PILLAR && {
    id: 'w1',
    text: `"${TOP_PILLAR.pillar}" leads — ${TOP_PILLAR.avgEngagement.toLocaleString()} avg engagement across ${TOP_PILLAR.posts} posts`,
  },
  TOP_POSTS[0] && {
    id: 'w2',
    text: `Top post: ${TOP_POSTS[0].likes.toLocaleString()} likes · ${TOP_POSTS[0].comments.toLocaleString()} comments`,
  },
  {
    id: 'w3',
    text: `${TOTALS.likes.toLocaleString()} total likes across ${TOTALS.totalPosts} posts`,
  },
].filter(Boolean) as SmartPanelItem[];

export const NEEDS_ATTENTION: SmartPanelItem[] = [
  {
    id: 'n1',
    // Real: 20 of 42 posts are still unclassified by pillar.
    text: (() => {
      const unclassified = PILLARS.find((p) => p.pillar === 'Unclassified');
      return unclassified
        ? `${unclassified.posts} of ${TOTALS.totalPosts} posts still unclassified by pillar`
        : 'Classify remaining posts by content pillar';
    })(),
  },
  SECOND_PILLAR &&
    TOP_PILLAR && {
      id: 'n2',
      text: `Engagement concentrated in "${TOP_PILLAR.pillar}" — test more "${SECOND_PILLAR.pillar}" concepts`,
    },
  {
    id: 'n3',
    // Honest data-gap callout instead of a fabricated "21% used UTM" stat.
    text: HONEST_GAPS.note,
  },
].filter(Boolean) as SmartPanelItem[];

// ---------------------------------------------------------------------------
// Top campaigns. The @geezjulz data has no brand "campaigns" with views/$ — so
// this surfaces the real top-performing POSTS. Field NAMES are preserved
// (brand/views/bonus) so TopCampaignsCard compiles unchanged; values are real
// and honestly labelled (likes + comments, never fabricated views or money).
// ---------------------------------------------------------------------------
export interface TopCampaign {
  id: string;
  brand: string;
  views: string;
  bonus: string;
}

export const TOP_CAMPAIGNS: TopCampaign[] = TOP_POSTS.slice(0, 5).map((p, i) => ({
  id: `c${i + 1}`,
  brand: shortCaption(p.caption, 40),
  views: `${p.likes.toLocaleString()} likes`,
  bonus: `${p.comments.toLocaleString()} comments`,
}));

// ---------------------------------------------------------------------------
// Portfolio-worthy posts. Real top posts. "views" slot carries real likes;
// "engagement" carries real total engagement. Thumbnail is an emoji placeholder
// (no media thumbnails in the source), platform is TikTok (the real platform).
// ---------------------------------------------------------------------------
export interface PortfolioPost {
  id: string;
  title: string;
  thumbnail: string; // emoji placeholder
  platform: 'TikTok' | 'Reels' | 'Shorts';
  views: string;
  engagement: string;
}

const PORTFOLIO_EMOJI = ['🏆', '🌺', '✨', '💜'];

export const PORTFOLIO_POSTS: PortfolioPost[] = TOP_POSTS.slice(0, 4).map(
  (p, i) => ({
    id: `p${i + 1}`,
    title: shortCaption(p.caption, 44),
    thumbnail: PORTFOLIO_EMOJI[i % PORTFOLIO_EMOJI.length],
    platform: 'TikTok',
    views: `${compact(p.likes)} likes`,
    engagement: compact(p.engagement),
  }),
);

// ---------------------------------------------------------------------------
// Bonus / earnings exports. The source has ZERO earnings or bonus data, so
// these are honestly EMPTY. Consumers (BonusTracker, UpcomingBonusThresholds)
// will render their empty state — no fabricated dollar figures. (HR-10/HR-49)
// ---------------------------------------------------------------------------
export interface BonusThreshold {
  id: string;
  brand: string;
  earned: number;
  target: number;
}

export const BONUS_THRESHOLDS: BonusThreshold[] = [];

export interface UpcomingBonusThreshold {
  id: string;
  brand: string;
  earned: number;
  target: number;
}

export const UPCOMING_BONUS_THRESHOLDS: UpcomingBonusThreshold[] = [];

export interface BonusByCampaign {
  id: string;
  brand: string;
  earned: number;
  pending: number;
  total: number;
}

export const BONUS_BY_CAMPAIGN: BonusByCampaign[] = [];

// ---------------------------------------------------------------------------
// Views-over-time + hook performance. NOTE: the live chart components
// (ViewsOverTimeChart, HookPerformanceBars) already read real data directly
// from lib/analytics/from-tiktok-csv.ts and do NOT import these constants. They
// are kept here ONLY to preserve the module's export surface. The source has no
// view counts, so VIEWS_OVER_TIME is empty (honest) rather than fabricated.
// ---------------------------------------------------------------------------
export interface ViewsOverTimePoint {
  date: string; // 'Apr 06'
  current: number;
  previous: number;
}

export const VIEWS_OVER_TIME: ViewsOverTimePoint[] = [];

export interface HookPerformance {
  id: string;
  label: string;
  viewRate: number; // %
  completion: number; // %
}

// No watch-rate / completion data in the source → empty (honest). The real
// hook chart uses engagement-based metrics via from-tiktok-csv.ts instead.
export const HOOK_PERFORMANCE: HookPerformance[] = [];

// ---------------------------------------------------------------------------
// Posted links with click/conversion/revenue metrics. The source has NONE of
// these (no UTM clicks, no conversions, no revenue), so this is honestly EMPTY.
// PostedLinksTable renders an empty table body — no fabricated funnel numbers.
// ---------------------------------------------------------------------------
export interface PostedLinkRow {
  id: string;
  campaign: string;
  clicks: number;
  ctr: string;
  conversions: number;
  convRate: string;
  revenue: string;
}

export const POSTED_LINKS: PostedLinkRow[] = [];

// ---------------------------------------------------------------------------
// Best videos. Real top posts. The source has no view counts or watch-time, so
// "views" carries real likes and "avgWatch" is honestly "—". Engagement is the
// real total engagement count.
// ---------------------------------------------------------------------------
export interface BestVideo {
  id: string;
  title: string;
  platform: 'TikTok' | 'Reels' | 'Shorts';
  views: string;
  avgWatch: string;
  engagement: string;
}

export const BEST_VIDEOS: BestVideo[] = TOP_POSTS.slice(0, 5).map((p, i) => ({
  id: `v${i + 1}`,
  title: shortCaption(p.caption, 44),
  platform: 'TikTok',
  views: `${compact(p.likes)} likes`,
  avgWatch: '—', // honest: no watch-time data in source
  engagement: compact(p.engagement),
}));

// ---------------------------------------------------------------------------
// Platform performance. The source is TikTok-only with no view counts, so this
// shows the single real platform (TikTok) with real engagement totals. "views"
// carries real likes; "follows" is honestly "—" (no follower-delta data).
// Reels / Shorts rows are omitted rather than fabricated.
// ---------------------------------------------------------------------------
export interface PlatformPerf {
  id: string;
  platform: 'TikTok' | 'Reels' | 'Shorts';
  views: string;
  engagement: string;
  follows: string;
  color: string; // tailwind class fragment
}

export const PLATFORM_PERFORMANCE: PlatformPerf[] = [
  {
    id: 'tt',
    platform: 'TikTok',
    views: `${compact(TOTALS.likes)} likes`,
    engagement: `${TOTALS.engagement.toLocaleString()} total`,
    follows: '—',
    color: 'from-pink-400 to-rose-500',
  },
];
