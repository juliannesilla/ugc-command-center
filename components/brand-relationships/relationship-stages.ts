// Phase A.14e Wave 4 (E9) — Brand Relationships / CRM stages.
// Source: UGC/_meta/dashboard-spec/02-campaign-pipeline-views-architecture.md
// section #9 "Brand Relationships / CRM View", L689–L703 (13 relationship stages).
//
// NOTE: These are RELATIONSHIP stages — distinct from `CampaignStage`
// (workflow stages, L48–L68 of lib/types/campaign.ts). A campaign in
// `current_stage: "FILMING"` may be in `relationship_status: "Active
// Collaboration"`. The CRM tracks the human-relationship arc; the
// pipeline tracks the production-workflow arc.

import type { ChipTone } from '@/components/ui/status-chip';

export const RELATIONSHIP_STAGES = [
  'New Contact',
  'First Reply Sent',
  'Call Requested',
  'Call Scheduled',
  'Brief Requested',
  'Brief Received',
  'Active Collaboration',
  'Submitted Work',
  'Awaiting Feedback',
  'Accepted',
  'Repeat Potential',
  'Dormant',
  'Archived',
] as const;

export type RelationshipStage = (typeof RELATIONSHIP_STAGES)[number];

/** Stage → StatusChip tone (cohesive with the rest of the app). */
export const STAGE_TONE: Record<RelationshipStage, ChipTone> = {
  'New Contact':          'blue',
  'First Reply Sent':     'blue',
  'Call Requested':       'yellow',
  'Call Scheduled':       'yellow',
  'Brief Requested':      'yellow',
  'Brief Received':       'green',
  'Active Collaboration': 'green',
  'Submitted Work':       'blue',
  'Awaiting Feedback':    'yellow',
  'Accepted':             'green',
  'Repeat Potential':     'green',
  'Dormant':              'pink',
  'Archived':             'pink',
};

/**
 * Permissive lookup — `relationship_status` is `string | undefined` on the
 * Campaign type, since mock-data freedom. We map to the canonical 13 by
 * exact match; anything else falls back to "New Contact".
 */
export function asRelationshipStage(value: string | undefined): RelationshipStage {
  if (!value) return 'New Contact';
  return (RELATIONSHIP_STAGES as readonly string[]).includes(value)
    ? (value as RelationshipStage)
    : 'New Contact';
}
