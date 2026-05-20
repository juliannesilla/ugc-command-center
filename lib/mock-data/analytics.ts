// Mock analytics data for Analytics / Performance page (mockup #11).
// All metrics are realistic UGC creator benchmarks:
//  - TikTok eng rate: 5–15% · IG Reels: 3–8% · YT Shorts: 3–6%
//  - Brand-deal conversion: 1–5% · UTM/link CTR: 2–8%

export interface DateRange {
  label: string;
  start: string; // ISO
  end: string;
}

export const CURRENT_PERIOD: DateRange = {
  label: 'Apr 6 - May 6, 2026',
  start: '2026-04-06',
  end: '2026-05-06',
};

export const PREVIOUS_PERIOD: DateRange = {
  label: 'Mar 6 - Apr 5, 2026',
  start: '2026-03-06',
  end: '2026-04-05',
};

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
    label: 'TOTAL POSTED VIDEOS',
    value: '86',
    delta: '+18',
    deltaTone: 'positive',
    sublabel: 'vs last 30d',
  },
  {
    id: 'views',
    label: 'TOTAL VIEWS',
    value: '1.24M',
    delta: '+28.4%',
    deltaTone: 'positive',
    sublabel: 'vs last 30d',
  },
  {
    id: 'bonus',
    label: 'TOTAL BONUS EARNINGS',
    value: '$2,845.60',
    delta: '+22.7%',
    deltaTone: 'positive',
    sublabel: 'vs last 30d',
  },
  {
    id: 'conv',
    label: 'CONVERSION + ACCEPTANCE RATE',
    value: '42.6%',
    delta: '+6.3pp',
    deltaTone: 'positive',
    sublabel: 'vs last 30d',
  },
];

export interface SmartPanelItem {
  id: string;
  text: string;
}

export const WHATS_WINNING: SmartPanelItem[] = [
  { id: 'w1', text: 'GRWM + voiceover hooks +28%' },
  { id: 'w2', text: 'Beauty & Skincare converting 2.4x higher' },
  { id: 'w3', text: 'TikTok views up 35% this month' },
  { id: 'w4', text: 'Videos 20-30s get highest watch time' },
];

export const NEEDS_ATTENTION: SmartPanelItem[] = [
  { id: 'n1', text: '3 videos under 5% retention' },
  { id: 'n2', text: 'Response time on briefs could improve' },
  { id: 'n3', text: 'Only 21% of links used UTM tracking' },
];

export interface TopCampaign {
  id: string;
  brand: string;
  views: string;
  bonus: string;
}

export const TOP_CAMPAIGNS: TopCampaign[] = [
  { id: 'c1', brand: 'Vitality Collagen',  views: '312K', bonus: '$685.00' },
  { id: 'c2', brand: 'CleanGlow Skincare', views: '248K', bonus: '$480.00' },
  { id: 'c3', brand: 'Oh Snap! Pickles',   views: '192K', bonus: '$375.00' },
  { id: 'c4', brand: 'Nushape Lipo Wrap',  views: '156K', bonus: '$310.00' },
  { id: 'c5', brand: 'Glossier',           views: '128K', bonus: '$245.00' },
];

export interface PortfolioPost {
  id: string;
  title: string;
  thumbnail: string; // emoji placeholder
  platform: 'TikTok' | 'Reels' | 'Shorts';
  views: string;
  engagement: string;
}

export const PORTFOLIO_POSTS: PortfolioPost[] = [
  { id: 'p1', title: 'GRWM w/ Vitality Collagen',  thumbnail: '✨', platform: 'TikTok', views: '312K', engagement: '6.8%' },
  { id: 'p2', title: 'CleanGlow 7-Day Test',       thumbnail: '🧴', platform: 'Reels',  views: '248K', engagement: '5.4%' },
  { id: 'p3', title: 'Oh Snap! Snack Hack POV',    thumbnail: '🥒', platform: 'TikTok', views: '192K', engagement: '7.1%' },
  { id: 'p4', title: 'Nushape Honest Review',      thumbnail: '💧', platform: 'Shorts', views: '156K', engagement: '4.2%' },
];

export interface BonusThreshold {
  id: string;
  brand: string;
  earned: number;
  target: number;
}

export const BONUS_THRESHOLDS: BonusThreshold[] = [
  { id: 'b1', brand: 'Vitality Collagen',  earned: 685, target: 1000 },
  { id: 'b2', brand: 'CleanGlow',          earned: 480, target: 750 },
  { id: 'b3', brand: 'Oh Snap!',           earned: 375, target: 500 },
  { id: 'b4', brand: 'Nushape',            earned: 310, target: 500 },
];

export interface ViewsOverTimePoint {
  date: string;   // 'Apr 06'
  current: number;
  previous: number;
}

// 30-day series — realistic spikes around posts
export const VIEWS_OVER_TIME: ViewsOverTimePoint[] = [
  { date: 'Apr 06', current: 18000, previous: 14200 },
  { date: 'Apr 08', current: 22500, previous: 15800 },
  { date: 'Apr 10', current: 28000, previous: 18100 },
  { date: 'Apr 12', current: 34200, previous: 19400 },
  { date: 'Apr 14', current: 31800, previous: 21000 },
  { date: 'Apr 16', current: 39500, previous: 22500 },
  { date: 'Apr 18', current: 45200, previous: 24800 },
  { date: 'Apr 20', current: 52800, previous: 26200 },
  { date: 'Apr 22', current: 48100, previous: 27500 },
  { date: 'Apr 24', current: 55600, previous: 29100 },
  { date: 'Apr 26', current: 61200, previous: 30400 },
  { date: 'Apr 28', current: 58900, previous: 31800 },
  { date: 'Apr 30', current: 66400, previous: 33000 },
  { date: 'May 02', current: 72100, previous: 34500 },
  { date: 'May 04', current: 79800, previous: 35800 },
  { date: 'May 06', current: 86200, previous: 37100 },
];

export interface HookPerformance {
  id: string;
  label: string;
  viewRate: number;    // %
  completion: number;  // %
}

export const HOOK_PERFORMANCE: HookPerformance[] = [
  { id: 'h1', label: 'Question hook',  viewRate: 48, completion: 32 },
  { id: 'h2', label: 'GRWM/Routine',   viewRate: 56, completion: 36 },
  { id: 'h3', label: 'Storytime',      viewRate: 44, completion: 28 },
  { id: 'h4', label: 'List/Tips',      viewRate: 41, completion: 26 },
  { id: 'h5', label: 'Product Demo',   viewRate: 51, completion: 33 },
];

export interface PostedLinkRow {
  id: string;
  campaign: string;
  clicks: number;
  ctr: string;
  conversions: number;
  convRate: string;
  revenue: string;
}

export const POSTED_LINKS: PostedLinkRow[] = [
  { id: 'l1', campaign: 'Vitality Collagen',  clicks: 4820, ctr: '6.4%', conversions: 168, convRate: '3.5%', revenue: '$1,268.00' },
  { id: 'l2', campaign: 'CleanGlow Skincare', clicks: 3210, ctr: '5.1%', conversions: 112, convRate: '3.5%', revenue: '$894.00'   },
  { id: 'l3', campaign: 'Oh Snap! Pickles',   clicks: 2540, ctr: '4.8%', conversions: 84,  convRate: '3.3%', revenue: '$612.00'   },
  { id: 'l4', campaign: 'Nushape Lipo Wrap',  clicks: 1980, ctr: '4.2%', conversions: 56,  convRate: '2.8%', revenue: '$448.00'   },
  { id: 'l5', campaign: 'Glossier Skin Tint', clicks: 1620, ctr: '3.9%', conversions: 42,  convRate: '2.6%', revenue: '$336.00'   },
];

export interface BonusByCampaign {
  id: string;
  brand: string;
  earned: number;
  pending: number;
  total: number;
}

export const BONUS_BY_CAMPAIGN: BonusByCampaign[] = [
  { id: 'bc1', brand: 'Vitality Collagen',  earned: 685, pending: 215, total: 1000 },
  { id: 'bc2', brand: 'CleanGlow',          earned: 480, pending: 120, total: 750  },
  { id: 'bc3', brand: 'Oh Snap!',           earned: 375, pending: 50,  total: 500  },
  { id: 'bc4', brand: 'Nushape',            earned: 310, pending: 90,  total: 500  },
  { id: 'bc5', brand: 'Glossier',           earned: 245, pending: 80,  total: 400  },
];

export interface BestVideo {
  id: string;
  title: string;
  platform: 'TikTok' | 'Reels' | 'Shorts';
  views: string;
  avgWatch: string;
  engagement: string;
}

export const BEST_VIDEOS: BestVideo[] = [
  { id: 'v1', title: 'GRWM ft. Vitality Collagen',    platform: 'TikTok', views: '312K', avgWatch: '18.4s', engagement: '6.8%' },
  { id: 'v2', title: 'CleanGlow 7-day skin test',     platform: 'Reels',  views: '248K', avgWatch: '15.2s', engagement: '5.4%' },
  { id: 'v3', title: 'Oh Snap! snack hack POV',       platform: 'TikTok', views: '192K', avgWatch: '14.8s', engagement: '7.1%' },
  { id: 'v4', title: 'Nushape honest first impression',platform: 'Shorts', views: '156K', avgWatch: '12.6s', engagement: '4.2%' },
  { id: 'v5', title: 'Glossier skin tint 3-shade',    platform: 'TikTok', views: '128K', avgWatch: '13.9s', engagement: '5.8%' },
];

export interface PlatformPerf {
  id: string;
  platform: 'TikTok' | 'Reels' | 'Shorts';
  views: string;
  engagement: string;
  follows: string;
  color: string; // tailwind class fragment
}

export const PLATFORM_PERFORMANCE: PlatformPerf[] = [
  { id: 'tt', platform: 'TikTok', views: '748K', engagement: '5.6%', follows: '+1,842', color: 'from-pink-400 to-rose-500'      },
  { id: 'ig', platform: 'Reels',  views: '312K', engagement: '4.2%', follows: '+912',   color: 'from-purple-400 to-fuchsia-500' },
  { id: 'yt', platform: 'Shorts', views: '182K', engagement: '3.8%', follows: '+436',   color: 'from-red-400 to-orange-500'     },
];
