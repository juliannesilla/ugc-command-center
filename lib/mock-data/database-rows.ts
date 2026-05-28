// Database-view dataset.
//
// Phase A.14e Wave 2 (E3): emitted the canonical 36-field `Campaign` shape per
// `_meta/dashboard-spec/02-campaign-pipeline-views-architecture.md` view #3.
//
// Phase A.14u F5-STRIP-MOCKS (2026-05-27, Julz directive): stripped the 62-row
// synthetic generator (Glossier/Ouai/Rare Beauty/Drunk Elephant/etc. — all
// fake brands) per Julz's call: "if it is not a real campaign, then take it
// off the dashboard."
//
// Phase A.14v V8B (GRACE / Wave 2, 2026-05-27): re-pointed at canonical via
// MOCK_CAMPAIGNS (which LINUS V8A rewired to `loadDashboardCampaigns()` →
// reads `data/brands-canonical.json` filtered by `dashboard_visible:true`).
// Net: DATABASE_CAMPAIGNS = 37 real brand rows (MWM, Phobaxx, ParakeetAI,
// Loops, MegaPrime, Hunch, Sherlock, Pyunkang Yul, etc.).
//
// Stat columns now derive their stage set + counts/totals from the LIVE
// DATABASE_CAMPAIGNS distribution (not a static 8-stage hardcode), so the
// strip reflects which canonical statuses actually have brands instead of
// showing zeros for stages no one has reached.

import type {
  Campaign,
  CampaignStage,
  PaymentStatus,
} from '@/lib/types/campaign';
import { MOCK_CAMPAIGNS } from '@/lib/mock-data/campaigns/index';
import type { PipelineStage } from './pipeline';

/**
 * Full Campaign[] feed for the database view. Sourced from MOCK_CAMPAIGNS
 * which itself is `loadDashboardCampaigns()` from `from-canonical.ts` →
 * `data/brands-canonical.json` filtered by `dashboard_visible:true`.
 *
 * As of A.14v V8A/V8B: 37 brand rows (cite: `data/brands-canonical.json`
 * filter `dashboard_visible === true`, verified at A.14v Wave 2 build time).
 */
export const DATABASE_CAMPAIGNS: Campaign[] = [...MOCK_CAMPAIGNS];

// ──────────────────────────────────────────────────────────────────────────
// Legacy shapes (kept for back-compat with any caller pre-A.14e)
// ──────────────────────────────────────────────────────────────────────────

export type PaymentStatusLegacy =
  | 'Paid' | 'Invoiced' | 'Awaiting Invoice' | 'In Escrow' | 'Pending Brand' | 'Not Started';
export type ResponseStatus =
  | 'No Reply' | 'Pending' | 'Engaged' | 'Confirmed' | 'Declined' | 'Closed';

export interface DatabaseRow {
  id: string;
  brand: string;
  campaign: string;
  stage: PipelineStage;
  deliverable: string;
  deadline: string;
  payment: PaymentStatusLegacy;
  ownerInitials: string;
  nextStep: string;
  response: ResponseStatus;
  notes: string;
  value: number;
}

// Re-export for any caller using the old type name.
export type { PaymentStatusLegacy as PaymentStatus };

const PAYMENT_LEGACY_MAP: Record<PaymentStatus, PaymentStatusLegacy> = {
  unknown: 'Not Started',
  pending: 'Pending Brand',
  invoiced: 'Invoiced',
  paid: 'Paid',
  overdue: 'Invoiced',
};

const RESPONSE_BY_STAGE: Record<PipelineStage, ResponseStatus> = {
  'NEW LEAD':         'No Reply',
  'RESPONDED':        'Engaged',
  'WAITING ON BRAND': 'Pending',
  'SOW RECEIVED':     'Engaged',
  'SOW REVIEWED':     'Confirmed',
  'STRATEGY READY':   'Confirmed',
  'SCRIPT READY':     'Confirmed',
  'FILMING':          'Confirmed',
  'EDITING':          'Confirmed',
  'QA':               'Confirmed',
  'SUBMITTED':        'Pending',
  'ACCEPTED':         'Confirmed',
  'POSTED':           'Closed',
  'PAID':             'Closed',
  'ARCHIVED':         'Closed',
};

function legacyStage(s: CampaignStage): PipelineStage {
  if (s === 'APPLIED' || s === 'BRAND REPLIED' || s === 'CALL SCHEDULED') return 'NEW LEAD';
  if (s === 'INVOICED') return 'SUBMITTED';
  return s as PipelineStage;
}

/** Legacy projection — kept so any caller still consuming `DATABASE_ROWS` keeps working. */
export const DATABASE_ROWS: DatabaseRow[] = DATABASE_CAMPAIGNS.map(c => ({
  id: c.campaign_id,
  brand: c.brand,
  campaign: c.campaign_name,
  stage: legacyStage(c.current_stage),
  deliverable: `${c.deliverable_count} × ${c.required_format.replace(/_/g, ' ')}`,
  deadline: c.due_date ?? '—',
  payment: PAYMENT_LEGACY_MAP[c.payment_status],
  ownerInitials: 'JS',
  nextStep: c.next_action,
  response: RESPONSE_BY_STAGE[legacyStage(c.current_stage)] ?? 'No Reply',
  notes: c.notes ?? '',
  value: c.total_potential_value ?? 0,
}));

// ──────────────────────────────────────────────────────────────────────────
// Top-of-page stats: 8 status columns × $ totals.
//
// A.14v V8B: derived from the LIVE DATABASE_CAMPAIGNS distribution. Stages
// are picked in workflow order, then trimmed to 8 most-populated so the
// strip never shows a column with `0 / $0` for a stage no canonical row has
// reached yet. If fewer than 8 stages have rows, pad with the next workflow
// stages so the visual rhythm of 8 tiles holds.
// ──────────────────────────────────────────────────────────────────────────

export interface DatabaseStat {
  label: string;
  count: number;
  value: number;
}

const WORKFLOW_STAGES: CampaignStage[] = [
  'NEW LEAD',
  'APPLIED',
  'BRAND REPLIED',
  'RESPONDED',
  'WAITING ON BRAND',
  'CALL SCHEDULED',
  'SOW RECEIVED',
  'SOW REVIEWED',
  'STRATEGY READY',
  'SCRIPT READY',
  'FILMING',
  'EDITING',
  'QA',
  'SUBMITTED',
  'ACCEPTED',
  'POSTED',
  'INVOICED',
  'PAID',
];

function computeStatColumns(): DatabaseStat[] {
  const buckets = WORKFLOW_STAGES.map(stage => {
    const matching = DATABASE_CAMPAIGNS.filter(c => c.current_stage === stage);
    return {
      label: stage,
      count: matching.length,
      value: matching.reduce((s, c) => s + (c.total_potential_value ?? c.base_pay ?? 0), 0),
    };
  });

  // Prefer populated stages first (in workflow order), pad with empties from
  // workflow head so the 8-tile strip layout stays stable across data shifts.
  const populated = buckets.filter(b => b.count > 0);
  if (populated.length >= 8) return populated.slice(0, 8);
  const empties = buckets.filter(b => b.count === 0);
  return [...populated, ...empties].slice(0, 8);
}

export const DATABASE_STAT_COLUMNS: DatabaseStat[] = computeStatColumns();
