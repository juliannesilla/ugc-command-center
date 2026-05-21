/**
 * SideShift Growth — mock profile data for Julianne Silla.
 *
 * Source: `_meta/dashboard-spec/02-campaign-pipeline-views-architecture.md`
 *         Section 11 "SideShift Growth View".
 *
 * Snapshot of Julz's current SideShift profile (~70% complete per Phase B-prep
 * notes). 13 fields per spec, each tagged with a filter bucket so the page can
 * slice them by intent (setup vs verification vs growth vs visibility vs XP vs
 * portfolio).
 *
 * Owned by E10 (Phase A.14e Wave 4).
 */

export type FieldStatus = 'complete' | 'partial' | 'missing';

export type FilterBucket =
  | 'needs_setup'
  | 'needs_verification'
  | 'profile_growth'
  | 'visibility_booster'
  | 'xp_related'
  | 'portfolio_building';

export type ProfileField = {
  /** Stable key — used for filter/render */
  key: string;
  /** Display label exactly as spec L833–L845 */
  label: string;
  /** One-liner: why this matters */
  why: string;
  /** Current completion state */
  status: FieldStatus;
  /** Display weight for the overall progress bar (sum = 100) */
  weight: number;
  /** Current value (human-readable summary) */
  detail: string;
  /** Action text for the "improve" button when not complete */
  improveLabel: string;
  /** Filter buckets this field belongs to */
  buckets: FilterBucket[];
  /** Lucide icon name — kept as string so the renderer picks it */
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
  {
    key: 'profile_photo',
    label: 'Profile Photo Complete',
    why: 'Brand trust',
    status: 'complete',
    weight: 6,
    detail: 'Headshot uploaded · Mar 2026',
    improveLabel: 'Refresh photo',
    buckets: ['needs_setup', 'visibility_booster'],
    icon: 'UserCircle2',
  },
  {
    key: 'full_name',
    label: 'Full Name / Info Complete',
    why: 'Profile readiness',
    status: 'complete',
    weight: 6,
    detail: 'Bio, location, languages — all set',
    improveLabel: 'Edit profile info',
    buckets: ['needs_setup'],
    icon: 'IdCard',
  },
  {
    key: 'socials_connected',
    label: 'Socials Connected',
    why: 'Brand verification',
    status: 'partial',
    weight: 9,
    detail: 'IG ✓ · TikTok unverified · YouTube ✓',
    improveLabel: 'Verify TikTok account',
    buckets: ['needs_verification', 'visibility_booster'],
    icon: 'Link2',
  },
  {
    key: 'niches_selected',
    label: 'Niches Selected',
    why: 'Helps brand matching',
    status: 'partial',
    weight: 8,
    detail: '2 of 4 niches — Wellness, Skincare',
    improveLabel: 'Add 2 more niches',
    buckets: ['profile_growth', 'visibility_booster'],
    icon: 'Tags',
  },
  {
    key: 'verified_experiences',
    label: 'Verified Experiences',
    why: 'Shows proof',
    status: 'partial',
    weight: 9,
    detail: '3 verified · 2 pending review',
    improveLabel: 'Submit pending experiences',
    buckets: ['needs_verification', 'portfolio_building'],
    icon: 'BadgeCheck',
  },
  {
    key: 'featured_posts',
    label: 'Featured Posts Added',
    why: 'Shows content quality',
    status: 'partial',
    weight: 10,
    detail: '2 of 5 featured slots used',
    improveLabel: 'Add 3 featured posts',
    buckets: ['portfolio_building', 'visibility_booster'],
    icon: 'Sparkles',
  },
  {
    key: 'paid_ad_samples',
    label: 'Paid Ad Samples Uploaded',
    why: 'Helps new creators stand out',
    status: 'missing',
    weight: 10,
    detail: 'No paid ad samples yet',
    improveLabel: 'Upload paid ad sample',
    buckets: ['portfolio_building', 'visibility_booster'],
    icon: 'Megaphone',
  },
  {
    key: 'professional_roles',
    label: 'Professional Roles Added',
    why: 'Adds credibility',
    status: 'missing',
    weight: 8,
    detail: 'No professional role added',
    improveLabel: 'Add professional role',
    buckets: ['profile_growth', 'portfolio_building'],
    icon: 'Briefcase',
  },
  {
    key: 'certifications',
    label: 'Certifications',
    why: 'Current reliability signals',
    status: 'partial',
    weight: 6,
    detail: '1 certification — UGC Creator Cert',
    improveLabel: 'Add a certification',
    buckets: ['profile_growth'],
    icon: 'GraduationCap',
  },
  {
    key: 'achievements',
    label: 'Achievements',
    why: 'Long-term proof',
    status: 'partial',
    weight: 6,
    detail: '4 achievements unlocked',
    improveLabel: 'Unlock next achievement',
    buckets: ['profile_growth', 'xp_related'],
    icon: 'Trophy',
  },
  {
    key: 'league_xp',
    label: 'League / XP',
    why: 'Visibility and opportunity access',
    status: 'partial',
    weight: 8,
    detail: 'Silver League · 1,240 XP · 260 to Gold',
    improveLabel: 'Earn XP toward Gold',
    buckets: ['xp_related', 'visibility_booster'],
    icon: 'Flame',
  },
  {
    key: 'response_speed',
    label: 'Response Speed',
    why: 'Helps dependability',
    status: 'complete',
    weight: 7,
    detail: 'Avg 4h 12m · Top 15% of creators',
    improveLabel: 'Maintain response time',
    buckets: ['xp_related'],
    icon: 'Timer',
  },
  {
    key: 'posting_consistency',
    label: 'Posting Consistency',
    why: 'Helps status/growth',
    status: 'partial',
    weight: 7,
    detail: '12-day streak · 3 posts this week',
    improveLabel: 'Maintain posting streak',
    buckets: ['xp_related', 'visibility_booster'],
    icon: 'CalendarCheck2',
  },
];

/** Weight sanity-check (compile-time intent: should total 100). */
export const TOTAL_WEIGHT = SIDESHIFT_PROFILE_FIELDS.reduce(
  (sum, f) => sum + f.weight,
  0,
);

/**
 * Per-field score contribution.
 *   complete → full weight
 *   partial  → half weight
 *   missing  → 0
 */
export function fieldScore(field: ProfileField): number {
  if (field.status === 'complete') return field.weight;
  if (field.status === 'partial') return field.weight / 2;
  return 0;
}

/** Overall profile completion percent (0–100, rounded). */
export function profileCompletionPercent(
  fields: ProfileField[] = SIDESHIFT_PROFILE_FIELDS,
): number {
  const earned = fields.reduce((sum, f) => sum + fieldScore(f), 0);
  return Math.round((earned / TOTAL_WEIGHT) * 100);
}

/** Filter chip definitions, in spec order (L849–L854). */
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

/**
 * Visibility Next Move — top 3 actions, weighted by status (missing > partial)
 * then by field weight. Reflects spec L857–L867 examples almost verbatim.
 */
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
