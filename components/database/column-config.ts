// Column registry for the Database view.
// Spec: dashboard-spec/02-campaign-pipeline-views-architecture.md view #3
// "Exact Fields" (L194-L230) — all 34 spec fields + 2 sticky/identity columns.

import type { Campaign } from '@/lib/types/campaign';

export type ColumnKey =
  | 'campaign_id'
  | 'brand'
  | 'product'
  | 'campaign_name'
  | 'platform_source'
  | 'contact_name'
  | 'contact_channel'
  | 'current_stage'
  | 'status'
  | 'priority'
  | 'waiting_on_who'
  | 'campaign_type'
  | 'product_category'
  | 'deliverable_count'
  | 'required_format'
  | 'required_length'
  | 'due_date'
  | 'follow_up_date'
  | 'call_date'
  | 'base_pay'
  | 'bonus_potential'
  | 'total_potential_value'
  | 'payment_status'
  | 'sow_link'
  | 'job_link'
  | 'asset_folder'
  | 'script_link'
  | 'submission_link'
  | 'posted_link'
  | 'readiness_score'
  | 'brand_fit_score'
  | 'risk_level'
  | 'next_action'
  | 'notes';

export interface ColumnDef {
  key: ColumnKey;
  label: string;
  defaultVisible: boolean;
  width?: string;       // tailwind/css width hint
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
}

export const COLUMNS: ColumnDef[] = [
  { key: 'campaign_id',          label: 'ID',                defaultVisible: false, sortable: true,  width: '90px' },
  { key: 'brand',                label: 'Brand',             defaultVisible: true,  sortable: true,  width: '180px' },
  { key: 'product',              label: 'Product',           defaultVisible: false, sortable: true,  width: '160px' },
  { key: 'campaign_name',        label: 'Campaign',          defaultVisible: true,  sortable: true,  width: '260px' },
  { key: 'platform_source',      label: 'Platform',          defaultVisible: false, sortable: true,  width: '110px' },
  { key: 'contact_name',         label: 'Contact',           defaultVisible: false, sortable: true,  width: '180px' },
  { key: 'contact_channel',      label: 'Channel',           defaultVisible: false, sortable: true,  width: '110px' },
  { key: 'current_stage',        label: 'Stage',             defaultVisible: true,  sortable: true,  width: '150px' },
  { key: 'status',               label: 'Status',            defaultVisible: true,  sortable: true,  width: '110px' },
  { key: 'priority',             label: 'Priority',          defaultVisible: true,  sortable: true,  width: '100px' },
  { key: 'waiting_on_who',       label: 'Waiting On',        defaultVisible: true,  sortable: true,  width: '110px' },
  { key: 'campaign_type',        label: 'Type',              defaultVisible: false, sortable: true,  width: '120px' },
  { key: 'product_category',     label: 'Category',          defaultVisible: false, sortable: true,  width: '120px' },
  { key: 'deliverable_count',    label: 'Deliv.',            defaultVisible: false, sortable: true,  width: '70px',  align: 'right' },
  { key: 'required_format',      label: 'Format',            defaultVisible: false, sortable: true,  width: '120px' },
  { key: 'required_length',      label: 'Length',            defaultVisible: false, sortable: false, width: '100px' },
  { key: 'due_date',             label: 'Due',               defaultVisible: true,  sortable: true,  width: '110px' },
  { key: 'follow_up_date',       label: 'Follow-up',         defaultVisible: false, sortable: true,  width: '110px' },
  { key: 'call_date',            label: 'Call',              defaultVisible: false, sortable: true,  width: '110px' },
  { key: 'base_pay',             label: 'Base Pay',          defaultVisible: true,  sortable: true,  width: '100px', align: 'right' },
  { key: 'bonus_potential',      label: 'Bonus',             defaultVisible: false, sortable: false, width: '120px' },
  { key: 'total_potential_value',label: 'Total $',           defaultVisible: true,  sortable: true,  width: '100px', align: 'right' },
  { key: 'payment_status',       label: 'Payment',           defaultVisible: true,  sortable: true,  width: '110px' },
  { key: 'sow_link',             label: 'SOW',               defaultVisible: false, sortable: false, width: '60px',  align: 'center' },
  { key: 'job_link',             label: 'Job',               defaultVisible: false, sortable: false, width: '60px',  align: 'center' },
  { key: 'asset_folder',         label: 'Assets',            defaultVisible: false, sortable: false, width: '70px',  align: 'center' },
  { key: 'script_link',          label: 'Script',            defaultVisible: false, sortable: false, width: '70px',  align: 'center' },
  { key: 'submission_link',      label: 'Submit',            defaultVisible: false, sortable: false, width: '70px',  align: 'center' },
  { key: 'posted_link',          label: 'Posted',            defaultVisible: false, sortable: false, width: '70px',  align: 'center' },
  { key: 'readiness_score',      label: 'Readiness',         defaultVisible: true,  sortable: true,  width: '130px' },
  { key: 'brand_fit_score',      label: 'Brand Fit',         defaultVisible: false, sortable: true,  width: '130px' },
  { key: 'risk_level',           label: 'Risk',              defaultVisible: false, sortable: true,  width: '90px' },
  { key: 'next_action',          label: 'Next Action',       defaultVisible: true,  sortable: false, width: '220px' },
  { key: 'notes',                label: 'Notes',             defaultVisible: false, sortable: false, width: '260px' },
];

export const DEFAULT_VISIBLE: Set<ColumnKey> = new Set(
  COLUMNS.filter(c => c.defaultVisible).map(c => c.key),
);

// ──────────────────────────────────────────────────────────────────────────
// Saved filter chips — spec L233-L246
// ──────────────────────────────────────────────────────────────────────────

export type FilterKey =
  | 'active'
  | 'due_this_week'
  | 'waiting_on_me'
  | 'waiting_on_brand'
  | 'high_priority'
  | 'high_value'
  | 'missing_payment'
  | 'missing_sow'
  | 'script_ready'
  | 'ready_to_film'
  | 'submitted_unpaid'
  | 'archived';

export interface FilterDef {
  key: FilterKey;
  label: string;
  predicate: (c: Campaign) => boolean;
}

const TODAY = new Date('2026-05-20');
function daysUntil(iso?: string): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const d = new Date(iso);
  return Math.round((d.getTime() - TODAY.getTime()) / 86_400_000);
}

export const FILTER_CHIPS: FilterDef[] = [
  { key: 'active',           label: 'Active only',         predicate: c => c.status !== 'archived' && c.status !== 'paid' },
  { key: 'due_this_week',    label: 'Due this week',       predicate: c => { const d = daysUntil(c.due_date); return d >= 0 && d <= 7; } },
  { key: 'waiting_on_me',    label: 'Waiting on me',       predicate: c => c.waiting_on_who === 'me' },
  { key: 'waiting_on_brand', label: 'Waiting on brand',    predicate: c => c.waiting_on_who === 'brand' },
  { key: 'high_priority',    label: 'High priority',       predicate: c => c.priority === 'high' },
  { key: 'high_value',       label: 'High value',          predicate: c => (c.total_potential_value ?? 0) >= 1000 },
  { key: 'missing_payment',  label: 'Missing payment info',predicate: c => c.payment_status === 'unknown' || c.base_pay == null },
  { key: 'missing_sow',      label: 'Missing SOW',         predicate: c => !c.sow_link },
  { key: 'script_ready',     label: 'Script ready',        predicate: c => c.current_stage === 'SCRIPT READY' || !!c.script_link },
  { key: 'ready_to_film',    label: 'Ready to film',       predicate: c => c.current_stage === 'SCRIPT READY' || c.current_stage === 'FILMING' },
  { key: 'submitted_unpaid', label: 'Submitted but unpaid',predicate: c => (c.current_stage === 'SUBMITTED' || c.current_stage === 'ACCEPTED' || c.current_stage === 'POSTED') && c.payment_status !== 'paid' },
  { key: 'archived',         label: 'Archived / complete', predicate: c => c.status === 'archived' || c.status === 'paid' },
];

// ──────────────────────────────────────────────────────────────────────────
// Sort presets — spec L249-L254
// Default sort: status active first → priority high first → due date soonest →
// total potential value highest.
// ──────────────────────────────────────────────────────────────────────────

export type SortPresetKey =
  | 'default'
  | 'due_soonest'
  | 'value_highest'
  | 'priority'
  | 'readiness_highest';

export interface SortPreset {
  key: SortPresetKey;
  label: string;
  compare: (a: Campaign, b: Campaign) => number;
}

const STATUS_RANK: Record<Campaign['status'], number> = {
  active: 0, waiting: 1, blocked: 2, submitted: 3, paid: 4, archived: 5,
};
const PRIORITY_RANK: Record<Campaign['priority'], number> = { high: 0, medium: 1, low: 2 };

const cmp = (a: number, b: number) => a - b;
const dueRank = (c: Campaign) => daysUntil(c.due_date);

export const SORT_PRESETS: SortPreset[] = [
  {
    key: 'default',
    label: 'Default (active · priority · due · value)',
    compare: (a, b) =>
      cmp(STATUS_RANK[a.status], STATUS_RANK[b.status]) ||
      cmp(PRIORITY_RANK[a.priority], PRIORITY_RANK[b.priority]) ||
      cmp(dueRank(a), dueRank(b)) ||
      cmp(b.total_potential_value ?? 0, a.total_potential_value ?? 0),
  },
  { key: 'due_soonest',       label: 'Due date soonest',     compare: (a, b) => cmp(dueRank(a), dueRank(b)) },
  { key: 'value_highest',     label: 'Total value highest',  compare: (a, b) => cmp(b.total_potential_value ?? 0, a.total_potential_value ?? 0) },
  { key: 'priority',          label: 'Priority high first',  compare: (a, b) => cmp(PRIORITY_RANK[a.priority], PRIORITY_RANK[b.priority]) },
  { key: 'readiness_highest', label: 'Readiness highest',    compare: (a, b) => cmp(b.readiness_score ?? 0, a.readiness_score ?? 0) },
];
