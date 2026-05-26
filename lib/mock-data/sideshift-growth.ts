/**
 * SideShift Growth — analytics dashboard mock data.
 *
 * Source: `_meta/mockups/20-sideshift-growth.png` (canonical mockup) +
 *         `_meta/dashboard-spec/06-a14n-visual-baseline.md` row 15:
 *         "DASHBOARD (Profile Completeness donut + Visibility Score + Next
 *          Actions + Top Performing Niches + Activity feed + Visibility Over
 *          Time chart)".
 *
 * Wave 2b N3-SIDESHIFT-REBUILD (Phase A.14n).
 *
 * REBUILD NOTE: The original profile-completion checklist data
 * (`SIDESHIFT_PROFILE_FIELDS`, `applyBucket`, etc.) is retained at the
 * bottom of this file for the secondary "Profile Completion" widget in the
 * RightRail per HR-2 PRESERVE (Julz A.14l feedback: "don't remove what we
 * already have"). The page-level concept changes from checklist → dashboard;
 * the data is reused, not deleted.
 *
 * 38 SideShift opportunities figure mirrors Julz's real pipeline per the
 * spawn brief — invited experiences (8) + proposed (5) + verified posts (12)
 * + active campaigns (4) + accepted (9) ≈ 38 touchpoints.
 */

// ─────────────────────────────────────────────────────────────────────
// PRIMARY DASHBOARD DATA — mockup #20
// ─────────────────────────────────────────────────────────────────────

/** Overall snapshot — feeds StatStrip + hero donut. */
export const SIDESHIFT_SNAPSHOT = {
  profileCompleteness: 92,           // donut center value
  visibilityScore: 84,               // /100, "HIGH IMPACT" tier
  visibilityTier: 'HIGH IMPACT' as const,
  league: 'Silver',
  totalXP: 2460,
  xpToNextLeague: 540,               // 540 to Gold (3,000)
  nextLeague: 'Gold',
  totalApplications: 38,             // mirror of real SideShift activity
  pendingPayouts: 1280,              // USD
} as const;

/** 6 KPI tiles — middle dense row per mockup. */
export type GrowthKpiTile = {
  number: string | number;
  label: string;
  sub?: string;
  accent: 'iris' | 'pink' | 'orange' | 'peach' | 'green' | 'cloud';
  iconName: 'Sparkles' | 'Megaphone' | 'BadgeCheck' | 'GraduationCap' | 'Timer' | 'Trophy';
  deltaPct?: number;                 // signed % change (vs last month)
};

export const SIDESHIFT_KPI_TILES: GrowthKpiTile[] = [
  { number: 8,    label: 'Invited Experiences', sub: '2 new this week',   accent: 'iris',   iconName: 'Sparkles',       deltaPct: 14 },
  { number: 5,    label: 'Proposed Posts',      sub: 'awaiting brand',    accent: 'pink',   iconName: 'Megaphone',      deltaPct: 25 },
  { number: 12,   label: 'Verified Posts',      sub: 'live content',      accent: 'green',  iconName: 'BadgeCheck',     deltaPct: 9 },
  { number: 4,    label: 'Certifications',      sub: 'active',            accent: 'peach',  iconName: 'GraduationCap',  deltaPct: 0 },
  { number: '38%',label: 'Response Rate',       sub: 'avg 4h 12m',        accent: 'orange', iconName: 'Timer',          deltaPct: -3 },
  { number: '92%',label: 'Accepted Campaigns',  sub: '9 of 10 last 30d',  accent: 'cloud',  iconName: 'Trophy',          deltaPct: 7 },
];

/** Top 3 Next Actions per mockup — uses brand-visibility framing. */
export const SIDESHIFT_NEXT_ACTIONS = [
  {
    id: 'na-photos',
    title: 'Add 3 paid ad samples',
    sub: 'Portfolio · biggest visibility unlock',
    boost: '+18% visibility',
  },
  {
    id: 'na-tiktok',
    title: 'Verify TikTok handle',
    sub: 'Socials · removes "unverified" badge',
    boost: '+12% visibility',
  },
  {
    id: 'na-niches',
    title: 'Add 2 more niches',
    sub: 'Discovery · doubles brand-match pool',
    boost: '+9% visibility',
  },
] as const;

/** Visibility over time — 12 weeks of score data for line chart. */
export type VisibilityPoint = {
  week: string;                      // 'Mar 03' format
  score: number;                     // 0-100
  applications: number;              // bar overlay (optional)
};

export const VISIBILITY_OVER_TIME: VisibilityPoint[] = [
  { week: 'Mar 03', score: 62, applications: 2 },
  { week: 'Mar 10', score: 64, applications: 3 },
  { week: 'Mar 17', score: 67, applications: 4 },
  { week: 'Mar 24', score: 65, applications: 3 },
  { week: 'Mar 31', score: 70, applications: 5 },
  { week: 'Apr 07', score: 72, applications: 4 },
  { week: 'Apr 14', score: 75, applications: 6 },
  { week: 'Apr 21', score: 76, applications: 5 },
  { week: 'Apr 28', score: 78, applications: 7 },
  { week: 'May 05', score: 80, applications: 6 },
  { week: 'May 12', score: 82, applications: 8 },
  { week: 'May 19', score: 84, applications: 9 },
];

/** Top performing niches — horizontal bar chart per mockup. */
export type NichePerformance = {
  niche: string;
  conversionPct: number;             // % of invites that became posts
  earned: number;                    // USD earned last 90d
};

export const TOP_PERFORMING_NICHES: NichePerformance[] = [
  { niche: 'Skincare',   conversionPct: 78, earned: 1840 },
  { niche: 'Wellness',   conversionPct: 64, earned: 1320 },
  { niche: 'Beauty',     conversionPct: 52, earned: 980 },
  { niche: 'Lifestyle',  conversionPct: 41, earned: 720 },
  { niche: 'Food & Bev', conversionPct: 35, earned: 540 },
];

/** Recent activity feed — mockup shows ~5 events with timestamps. */
export type ActivityEvent = {
  id: string;
  kind: 'invite' | 'accepted' | 'verified' | 'payout' | 'review';
  brand: string;
  message: string;
  timeAgo: string;                   // '2h ago'
};

export const RECENT_ACTIVITY: ActivityEvent[] = [
  { id: 'a1', kind: 'invite',   brand: 'Summer Fridays',  message: 'invited you to a paid campaign',  timeAgo: '2h ago' },
  { id: 'a2', kind: 'payout',   brand: 'Tula',            message: '$420 payout cleared',             timeAgo: '5h ago' },
  { id: 'a3', kind: 'accepted', brand: 'Glossier',        message: 'accepted your proposal',          timeAgo: '1d ago' },
  { id: 'a4', kind: 'verified', brand: 'Drunk Elephant',  message: 'verified your post · 14K views',  timeAgo: '2d ago' },
  { id: 'a5', kind: 'review',   brand: 'Rare Beauty',     message: 'left a 5★ creator review',        timeAgo: '3d ago' },
];

// ─────────────────────────────────────────────────────────────────────
// LEGACY PROFILE-COMPLETION DATA (kept for RightRail secondary widget)
// HR-2 PRESERVE — Julz feedback A.14l: "don't remove what we already have"
// ─────────────────────────────────────────────────────────────────────

export type FieldStatus = 'complete' | 'partial' | 'missing';

export type FilterBucket =
  | 'needs_setup'
  | 'needs_verification'
  | 'profile_growth'
  | 'visibility_booster'
  | 'xp_related'
  | 'portfolio_building';

export type ProfileField = {
  key: string;
  label: string;
  why: string;
  status: FieldStatus;
  weight: number;
  detail: string;
  improveLabel: string;
  buckets: FilterBucket[];
  icon:
    | 'UserCircle2'
    | 'IdCard'
    | 'Link2'
    | 'Tags'
    | 'BadgeCheck'
    | 'Sparkles'
    | 'Megaphone'
    | 'Briefcase'
    | 'GraduationCap'
    | 'Trophy'
    | 'Flame'
    | 'Timer'
    | 'CalendarCheck2';
};

export const SIDESHIFT_PROFILE_FIELDS: ProfileField[] = [
  { key: 'profile_photo',         label: 'Profile Photo Complete',      why: 'Brand trust',                     status: 'complete', weight: 6,  detail: 'Headshot uploaded · Mar 2026',                   improveLabel: 'Refresh photo',           buckets: ['needs_setup', 'visibility_booster'],          icon: 'UserCircle2' },
  { key: 'full_name',             label: 'Full Name / Info Complete',   why: 'Profile readiness',               status: 'complete', weight: 6,  detail: 'Bio, location, languages — all set',             improveLabel: 'Edit profile info',       buckets: ['needs_setup'],                                icon: 'IdCard' },
  { key: 'socials_connected',     label: 'Socials Connected',           why: 'Brand verification',              status: 'partial',  weight: 9,  detail: 'IG ✓ · TikTok unverified · YouTube ✓',           improveLabel: 'Verify TikTok account',   buckets: ['needs_verification', 'visibility_booster'],   icon: 'Link2' },
  { key: 'niches_selected',       label: 'Niches Selected',             why: 'Helps brand matching',            status: 'partial',  weight: 8,  detail: '2 of 4 niches — Wellness, Skincare',             improveLabel: 'Add 2 more niches',       buckets: ['profile_growth', 'visibility_booster'],       icon: 'Tags' },
  { key: 'verified_experiences',  label: 'Verified Experiences',        why: 'Shows proof',                     status: 'partial',  weight: 9,  detail: '3 verified · 2 pending review',                  improveLabel: 'Submit pending experiences', buckets: ['needs_verification', 'portfolio_building'], icon: 'BadgeCheck' },
  { key: 'featured_posts',        label: 'Featured Posts Added',        why: 'Shows content quality',           status: 'partial',  weight: 10, detail: '2 of 5 featured slots used',                     improveLabel: 'Add 3 featured posts',    buckets: ['portfolio_building', 'visibility_booster'],   icon: 'Sparkles' },
  { key: 'paid_ad_samples',       label: 'Paid Ad Samples Uploaded',    why: 'Helps new creators stand out',    status: 'missing',  weight: 10, detail: 'No paid ad samples yet',                         improveLabel: 'Upload paid ad sample',   buckets: ['portfolio_building', 'visibility_booster'],   icon: 'Megaphone' },
  { key: 'professional_roles',    label: 'Professional Roles Added',    why: 'Adds credibility',                status: 'missing',  weight: 8,  detail: 'No professional role added',                     improveLabel: 'Add professional role',   buckets: ['profile_growth', 'portfolio_building'],       icon: 'Briefcase' },
  { key: 'certifications',        label: 'Certifications',              why: 'Current reliability signals',     status: 'partial',  weight: 6,  detail: '1 certification — UGC Creator Cert',             improveLabel: 'Add a certification',     buckets: ['profile_growth'],                             icon: 'GraduationCap' },
  { key: 'achievements',          label: 'Achievements',                why: 'Long-term proof',                 status: 'partial',  weight: 6,  detail: '4 achievements unlocked',                        improveLabel: 'Unlock next achievement', buckets: ['profile_growth', 'xp_related'],               icon: 'Trophy' },
  { key: 'league_xp',             label: 'League / XP',                 why: 'Visibility and opportunity access', status: 'partial', weight: 8, detail: 'Silver League · 1,240 XP · 260 to Gold',         improveLabel: 'Earn XP toward Gold',     buckets: ['xp_related', 'visibility_booster'],           icon: 'Flame' },
  { key: 'response_speed',        label: 'Response Speed',              why: 'Helps dependability',             status: 'complete', weight: 7,  detail: 'Avg 4h 12m · Top 15% of creators',               improveLabel: 'Maintain response time',  buckets: ['xp_related'],                                 icon: 'Timer' },
  { key: 'posting_consistency',   label: 'Posting Consistency',         why: 'Helps status/growth',             status: 'partial',  weight: 7,  detail: '12-day streak · 3 posts this week',              improveLabel: 'Maintain posting streak', buckets: ['xp_related', 'visibility_booster'],           icon: 'CalendarCheck2' },
];

export const TOTAL_WEIGHT = SIDESHIFT_PROFILE_FIELDS.reduce(
  (sum, f) => sum + f.weight,
  0,
);

export function fieldScore(field: ProfileField): number {
  if (field.status === 'complete') return field.weight;
  if (field.status === 'partial') return field.weight / 2;
  return 0;
}

export function profileCompletionPercent(
  fields: ProfileField[] = SIDESHIFT_PROFILE_FIELDS,
): number {
  const earned = fields.reduce((sum, f) => sum + fieldScore(f), 0);
  return Math.round((earned / TOTAL_WEIGHT) * 100);
}

export const FILTER_BUCKETS: { key: FilterBucket | 'all'; label: string }[] = [
  { key: 'all',                 label: 'All fields' },
  { key: 'needs_setup',         label: 'Needs setup' },
  { key: 'needs_verification',  label: 'Needs verification' },
  { key: 'profile_growth',      label: 'Profile growth tasks' },
  { key: 'visibility_booster',  label: 'Visibility boosters' },
  { key: 'xp_related',          label: 'XP-related tasks' },
  { key: 'portfolio_building',  label: 'Portfolio-building tasks' },
];

export function applyBucket(
  fields: ProfileField[],
  bucket: FilterBucket | 'all',
): ProfileField[] {
  if (bucket === 'all') return fields;
  return fields.filter((f) => f.buckets.includes(bucket));
}

export function visibilityNextMoves(
  fields: ProfileField[] = SIDESHIFT_PROFILE_FIELDS,
): ProfileField[] {
  const statusRank: Record<FieldStatus, number> = {
    missing: 2,
    partial: 1,
    complete: 0,
  };
  return [...fields]
    .filter((f) => f.status !== 'complete')
    .sort((a, b) => {
      const r = statusRank[b.status] - statusRank[a.status];
      if (r !== 0) return r;
      return b.weight - a.weight;
    })
    .slice(0, 3);
}
