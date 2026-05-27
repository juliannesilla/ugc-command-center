// Database-view dataset.
//
// Phase A.14e Wave 2 (E3): emitted the canonical 36-field `Campaign` shape per
// `_meta/dashboard-spec/02-campaign-pipeline-views-architecture.md` view #3.
//
// Phase A.14u F5-STRIP-MOCKS (2026-05-27, Julz directive): stripped the 62-row
// synthetic generator (Glossier/Ouai/Rare Beauty/Drunk Elephant/etc. — all
// fake brands seeded by buildSyntheticCampaigns) per Julz's call: "if it is
// not a real campaign, then take it off the dashboard." DATABASE_CAMPAIGNS is
// now just MOCK_CAMPAIGNS (ParakeetAI only). Legacy DATABASE_ROWS + stat
// columns + DatabaseRow type preserved for back-compat — they all read from
// the trimmed DATABASE_CAMPAIGNS, so they trim automatically.

import type {
  Campaign,
  CampaignStage,
  PaymentStatus,
} from '@/lib/types/campaign';
import { MOCK_CAMPAIGNS } from '@/lib/mock-data/campaigns/index';
import type { PipelineStage } from './pipeline';

/**
 * Full Campaign[] feed for the database view. Only real instantiated campaigns
 * (currently: ParakeetAI). Add more by dropping signed brand names in chat —
 * Claude will scaffold a UGC/sideshift-<brand>/ folder + a MOCK_CAMPAIGNS row.
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

// ---- Top-of-page stats: 8 status columns × $ totals ----

export interface DatabaseStat {
  label: string;
  count: number;
  value: number;
}

export const DATABASE_STAT_COLUMNS: DatabaseStat[] = (
  [
    'NEW LEAD',
    'RESPONDED',
    'SOW RECEIVED',
    'STRATEGY READY',
    'FILMING',
    'EDITING',
    'SUBMITTED',
    'PAID',
  ] as CampaignStage[]
).map(stage => {
  const matching = DATABASE_CAMPAIGNS.filter(c => c.current_stage === stage);
  return {
    label: stage,
    count: matching.length,
    value: matching.reduce((s, c) => s + (c.total_potential_value ?? 0), 0),
  };
});
