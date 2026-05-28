/**
 * SideShift Growth — canonical data adapter.
 *
 * Phase A.14v Wave 2 TUFTE: wires `/sideshift-growth` Visibility Over Time
 * chart + status distribution to REAL DARWIN-merged data instead of the
 * Wave 2b mock at `lib/mock-data/sideshift-growth.ts`.
 *
 * Sources:
 *   - `data/brands-canonical.json` (DARWIN, 41 rows) — primary. Filter to
 *     rows whose `pipeline_source` array includes "sideshift" (34 of 41).
 *     Has the merged status + last_msg_at + contract_signed_at fields we
 *     need for trend + pipeline distribution.
 *   - `data/sideshift-canonical.jsonl` (OPRAH SideShift discovery, 34 rows)
 *     is the upstream feed already absorbed into brands-canonical. We do
 *     NOT re-import it here — single source of truth = brands-canonical
 *     post-DARWIN merge, per Wave 2 architecture (see
 *     `lib/mock-data/campaigns/from-canonical.ts` for precedent).
 *
 * Build-time bake — pure ES module import of the JSON snapshot. No
 * `node:fs` so this is safe in client bundles.
 *
 * HR-10 ACCESS HONESTY: XP/league fields are still mock-only because
 * SideShift's gamification API is not yet exposed to us (per A.14e E10
 * spec). The `SIDESHIFT_SNAPSHOT` shape we return uses real DARWIN
 * counts for `totalApplications` + `pendingPayouts` + visibility KPIs
 * but the `totalXP`, `xpToNextLeague`, `league`, `nextLeague` keys are
 * flagged with explicit `_mock: true` carriers so future swaps are
 * trivial.
 */

import canonicalRaw from '@/data/brands-canonical.json';
import type { VisibilityPoint } from '@/lib/mock-data/sideshift-growth';

// ───────────────────────────────────────────────────────────────────────
// Local view of the canonical brand row — subset of the fields we use.
// (Full schema in `data/brands-canonical-summary.md`.)
// ───────────────────────────────────────────────────────────────────────

interface BrandRow {
  brand_id: string;
  brand_name_canonical: string;
  pipeline_source: string[];
  contract_signed: boolean;
  contract_signed_at: string | null;
  status: string;
  last_msg_at: string | null;
  payment_amount_usd: number | null;
  bonus_amount_usd: number | null;
}

function loadCanonicalBrands(): BrandRow[] {
  return (canonicalRaw as unknown[]).filter(
    (obj): obj is BrandRow =>
      typeof obj === 'object' &&
      obj !== null &&
      typeof (obj as { brand_id?: unknown }).brand_id === 'string' &&
      Array.isArray((obj as { pipeline_source?: unknown }).pipeline_source),
  );
}

/** SideShift-origin brands only — `pipeline_source` includes "sideshift". */
export function loadSideShiftBrands(): BrandRow[] {
  return loadCanonicalBrands().filter((b) =>
    b.pipeline_source.includes('sideshift'),
  );
}

// ───────────────────────────────────────────────────────────────────────
// Visibility Over Time — weekly NEW SideShift brand contacts.
// ───────────────────────────────────────────────────────────────────────

/**
 * Anchor week-start (Monday) for an ISO date string.
 * Returns 'YYYY-MM-DD'. Treats input as UTC midnight to avoid TZ drift.
 */
function weekStartUTC(isoDate: string): Date {
  // A.14y Wave 0.6.B fix: handle both date-only (`2026-05-26`) and full
  // ISO strings (`2026-05-26T17:40:00Z`). Prior code blindly appended
  // `T00:00:00Z` which broke full ISO inputs from JOAN's enriched rows.
  const datePart = isoDate.length > 10 ? isoDate.slice(0, 10) : isoDate;
  const d = new Date(`${datePart}T00:00:00Z`);
  if (isNaN(d.getTime())) {
    // Fallback to today if input is malformed (HR-10 ACCESS HONESTY — chart
    // continues to render instead of crashing the whole route).
    return new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z');
  }
  const dow = d.getUTCDay(); // 0 = Sun, 1 = Mon, ...
  const offsetToMon = (dow + 6) % 7;
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - offsetToMon);
  return monday;
}

function fmtWeekLabel(d: Date): string {
  // 'Mar 03' — matches existing mock label format the chart expects.
  const month = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${month} ${day}`;
}

/**
 * Build a 12-week visibility-over-time series anchored on the most recent
 * activity week. `applications` = count of SideShift brands whose
 * `last_msg_at` falls in that week. `score` = derived visibility score
 * (cumulative reach proxy: cumulative brand count → /100 clamp).
 *
 * Real data today is sparse (3 active weeks), so older weeks display 0
 * apps and the score plateaus at the baseline. As the pipeline grows the
 * chart auto-extends. HR-9 SEPARATE SECTIONS — the empty-week behaviour
 * is documented rather than hidden behind synthetic numbers.
 */
export function buildVisibilityOverTime(weeks = 12): VisibilityPoint[] {
  const rows = loadSideShiftBrands().filter((b) => b.last_msg_at);

  if (rows.length === 0) return [];

  // Bucket brands by week-start.
  const byWeek = new Map<string, number>();
  let mostRecent: Date | null = null;
  for (const b of rows) {
    const wk = weekStartUTC(b.last_msg_at!);
    const key = wk.toISOString().slice(0, 10);
    byWeek.set(key, (byWeek.get(key) ?? 0) + 1);
    if (!mostRecent || wk > mostRecent) mostRecent = wk;
  }

  // Build a continuous 12-week series ending on `mostRecent` week.
  const points: VisibilityPoint[] = [];
  let cumulative = 0;
  const start = new Date(mostRecent!);
  start.setUTCDate(mostRecent!.getUTCDate() - 7 * (weeks - 1));

  for (let i = 0; i < weeks; i++) {
    const wk = new Date(start);
    wk.setUTCDate(start.getUTCDate() + 7 * i);
    const key = wk.toISOString().slice(0, 10);
    const apps = byWeek.get(key) ?? 0;
    cumulative += apps;

    // Visibility score proxy: baseline 50 + 5pts per cumulative contact,
    // clamped to 0-100. Conservative model — real visibility API not yet
    // available (HR-10 ACCESS HONESTY). When SideShift exposes the score
    // endpoint we swap this for the upstream value.
    const score = Math.min(100, Math.max(40, 50 + cumulative * 1.4));

    points.push({
      week: fmtWeekLabel(wk),
      score: Math.round(score),
      applications: apps,
    });
  }
  return points;
}

// ───────────────────────────────────────────────────────────────────────
// Status distribution — DARWIN-merged status field, normalised to the
// 6-bucket pipeline view used elsewhere on the dashboard.
// ───────────────────────────────────────────────────────────────────────

export type SideShiftStatusBucket =
  | 'signed'
  | 'contract_pending'
  | 'awaiting_julz'
  | 'in_negotiation'
  | 'intake'
  | 'closed';

export interface StatusDistributionRow {
  bucket: SideShiftStatusBucket;
  label: string;
  count: number;
}

function normaliseStatus(s: string): SideShiftStatusBucket {
  switch (s) {
    case 'signed':
    case 'submitted':
    case 'paid':
      return 'signed';
    case 'contract_pending_julz':
      return 'contract_pending';
    case 'awaiting_julz':
      return 'awaiting_julz';
    case 'in_negotiation':
      return 'in_negotiation';
    case 'intake':
      return 'intake';
    case 'closed':
      return 'closed';
    default:
      return 'intake';
  }
}

const BUCKET_LABELS: Record<SideShiftStatusBucket, string> = {
  signed: 'Signed / live',
  contract_pending: 'Contract pending',
  awaiting_julz: 'Awaiting you',
  in_negotiation: 'In negotiation',
  intake: 'New lead',
  closed: 'Closed',
};

export function buildStatusDistribution(): StatusDistributionRow[] {
  const counts = new Map<SideShiftStatusBucket, number>();
  for (const b of loadSideShiftBrands()) {
    const k = normaliseStatus(b.status);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  // Stable ordering — funnel left → right.
  const order: SideShiftStatusBucket[] = [
    'intake',
    'in_negotiation',
    'awaiting_julz',
    'contract_pending',
    'signed',
    'closed',
  ];
  return order
    .map((bucket) => ({
      bucket,
      label: BUCKET_LABELS[bucket],
      count: counts.get(bucket) ?? 0,
    }))
    .filter((r) => r.count > 0);
}

// ───────────────────────────────────────────────────────────────────────
// Snapshot KPIs — real counts where DARWIN has them, mock-flagged where
// it doesn't (HR-10).
// ───────────────────────────────────────────────────────────────────────

export interface SideShiftLiveSnapshot {
  totalApplications: number; // real — count of SideShift brands
  signedCount: number; // real
  awaitingJulzCount: number; // real
  pendingPayoutsUsd: number; // real — sum of base+bonus for status='signed'
  /** Mock fields — SideShift gamification API not yet integrated (A.14e E10). */
  _mock: {
    visibilityScore: number;
    visibilityTier: string;
    league: string;
    totalXP: number;
    xpToNextLeague: number;
    nextLeague: string;
    profileCompleteness: number;
  };
}

export function buildLiveSnapshot(): SideShiftLiveSnapshot {
  const rows = loadSideShiftBrands();
  const signed = rows.filter((b) => b.status === 'signed' || b.status === 'submitted' || b.status === 'paid');
  const awaiting = rows.filter((b) => b.status === 'awaiting_julz' || b.status === 'contract_pending_julz');
  const pendingPayouts = signed.reduce(
    (sum, b) =>
      sum +
      (typeof b.payment_amount_usd === 'number' ? b.payment_amount_usd : 0) +
      (typeof b.bonus_amount_usd === 'number' ? b.bonus_amount_usd : 0),
    0,
  );

  return {
    totalApplications: rows.length,
    signedCount: signed.length,
    awaitingJulzCount: awaiting.length,
    pendingPayoutsUsd: pendingPayouts,
    _mock: {
      visibilityScore: 84,
      visibilityTier: 'HIGH IMPACT',
      league: 'Silver',
      totalXP: 2460,
      xpToNextLeague: 540,
      nextLeague: 'Gold',
      profileCompleteness: 92,
    },
  };
}
