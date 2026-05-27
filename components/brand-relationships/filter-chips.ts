// Phase A.14e Wave 4 (E9) — Saved filter chips for the CRM view.
// Source spec: 02-campaign-pipeline-views-architecture.md L725–L735.
// The 9 filters are saved presets — clicking one runs the predicate
// against MOCK_CAMPAIGNS and updates the table.

import type { Campaign } from '@/lib/types/campaign';

export type FilterKey =
  | 'all'
  | 'followup_due'
  | 'strong_fit'
  | 'repeat_high'
  | 'waiting_on_me'
  | 'waiting_on_brand'
  | 'call_requested'
  | 'brief_requested'
  | 'accepted_active'
  | 'dormant_warm';

export interface FilterDef {
  key: FilterKey;
  label: string;
  match: (c: Campaign, today: string) => boolean;
}

// A.14u F2: TODAY_FALLBACK now resolves at build time via lib/date-anchor.
import { daysFromNow } from '@/lib/date-anchor';
const TODAY_FALLBACK = daysFromNow(0);

export const FILTERS: FilterDef[] = [
  {
    key: 'all',
    label: 'All relationships',
    match: () => true,
  },
  {
    key: 'followup_due',
    // spec L727 — "Follow-up due" = follow_up_date ≤ today
    label: 'Follow-up due',
    match: (c, today) => Boolean(c.follow_up_date && c.follow_up_date <= today),
  },
  {
    key: 'strong_fit',
    // spec L728 — brand_fit_score ≥ 80
    label: 'Strong fit brands',
    match: (c) => (c.brand_fit_score ?? 0) >= 80,
  },
  {
    key: 'repeat_high',
    // spec L729
    label: 'Repeat potential high',
    match: (c) => c.repeat_potential === 'high',
  },
  {
    key: 'waiting_on_me',
    // spec L730
    label: 'Waiting on me',
    match: (c) => c.waiting_on_who === 'me',
  },
  {
    key: 'waiting_on_brand',
    // spec L731
    label: 'Waiting on brand',
    match: (c) => c.waiting_on_who === 'brand',
  },
  {
    key: 'call_requested',
    // spec L732 — relationship arc is "Call Requested" OR "Call Scheduled"
    label: 'Call requested',
    match: (c) =>
      c.relationship_status === 'Call Requested' ||
      c.relationship_status === 'Call Scheduled',
  },
  {
    key: 'brief_requested',
    // spec L733
    label: 'Brief requested',
    match: (c) => c.relationship_status === 'Brief Requested',
  },
  {
    key: 'accepted_active',
    // spec L734 — "Accepted / active"
    label: 'Accepted / active',
    match: (c) =>
      c.relationship_status === 'Accepted' ||
      c.relationship_status === 'Active Collaboration',
  },
  {
    key: 'dormant_warm',
    // spec L735 — Dormant relationships that are still warm leads (had a
    // prior reply / brief received, not full Archived).
    label: 'Dormant warm leads',
    match: (c) => c.relationship_status === 'Dormant',
  },
];

export function getToday(): string {
  return TODAY_FALLBACK;
}
