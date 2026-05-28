// Board-view stage configuration.
// Source: dashboard-spec `01-initial-dashboard-prompt.md` "Campaign Pipeline →
// Stages" (L326-L344) — 18-stage workflow (added APPLIED, BRAND REPLIED,
// CALL SCHEDULED in Phase A.14e Wave 1 per Julz's verbatim list).
// INVOICED is kept as an interstitial between POSTED and PAID even though
// the prompt skips it, because the existing dashboard tiles already track
// invoicing — non-destructive extension per HR-2 PRESERVE INTENT.
//
// Phase A.14u F5 (2026-05-27): the 19-stage workflow array (NEW LEAD →
// APPLIED → ... → ARCHIVED) is LOCKED. New stages can be added but never
// reordered or renamed without bumping all consumers.
//
// Phase A.14v V8B (GRACE / Wave 2, 2026-05-27): the per-stage `count` +
// `value` snapshot values are no longer hand-rolled fabrications. They are
// now computed at build time from `data/brands-canonical.json` (via LINUS's
// `loadDashboardCampaigns()`), so what shows above each kanban column
// matches what's INSIDE the column. Same for `BOARD_TOTAL_VALUE`,
// `BOARD_DONUT_SEGMENTS`, `BOARD_UPCOMING_DEADLINES`, and `BOARD_TOP_BRANDS`
// — all derive from canonical instead of hardcoded Glossier/Caraway/Ouai.

import { loadDashboardCampaigns } from '@/lib/mock-data/campaigns/from-canonical';
import type { Campaign, CampaignStage } from '@/lib/types/campaign';

export interface BoardStageDef {
  stage: CampaignStage;
  /** Snapshot total count for the column header. */
  count: number;
  /** Snapshot total $ value for the column header (USD). */
  value: number;
  /** Pastel accent token for column heading bar. */
  accent:
    | 'pink'
    | 'iris'
    | 'peach'
    | 'orange'
    | 'green'
    | 'yellow'
    | 'ink';
}

// 19 stages: NEW LEAD → APPLIED → BRAND REPLIED → RESPONDED →
// WAITING ON BRAND → CALL SCHEDULED → SOW RECEIVED → SOW REVIEWED →
// STRATEGY READY → SCRIPT READY → FILMING → EDITING → QA → SUBMITTED →
// ACCEPTED → POSTED → INVOICED → PAID → ARCHIVED.
// A.14u F5 LOCKED — stage list shape preserved.
const STAGE_ACCENTS: ReadonlyArray<{ stage: CampaignStage; accent: BoardStageDef['accent'] }> = [
  { stage: 'NEW LEAD',         accent: 'pink'   },
  { stage: 'APPLIED',          accent: 'pink'   },
  { stage: 'BRAND REPLIED',    accent: 'pink'   },
  { stage: 'RESPONDED',        accent: 'pink'   },
  { stage: 'WAITING ON BRAND', accent: 'yellow' },
  { stage: 'CALL SCHEDULED',   accent: 'yellow' },
  { stage: 'SOW RECEIVED',     accent: 'iris'   },
  { stage: 'SOW REVIEWED',     accent: 'iris'   },
  { stage: 'STRATEGY READY',   accent: 'iris'   },
  { stage: 'SCRIPT READY',     accent: 'peach'  },
  { stage: 'FILMING',          accent: 'orange' },
  { stage: 'EDITING',          accent: 'orange' },
  { stage: 'QA',               accent: 'orange' },
  { stage: 'SUBMITTED',        accent: 'yellow' },
  { stage: 'ACCEPTED',         accent: 'green'  },
  { stage: 'POSTED',           accent: 'green'  },
  { stage: 'INVOICED',         accent: 'green'  },
  { stage: 'PAID',             accent: 'green'  },
  { stage: 'ARCHIVED',         accent: 'ink'    },
];

// Build-time canonical pull. Single read; reused across all derived exports.
const DASHBOARD_CAMPAIGNS: Campaign[] = loadDashboardCampaigns();

function campaignValue(c: Campaign): number {
  return c.total_potential_value ?? c.base_pay ?? 0;
}

export const BOARD_STAGES: BoardStageDef[] = STAGE_ACCENTS.map(({ stage, accent }) => {
  const matches = DASHBOARD_CAMPAIGNS.filter(c => c.current_stage === stage);
  return {
    stage,
    count: matches.length,
    value: matches.reduce((sum, c) => sum + campaignValue(c), 0),
    accent,
  };
});

// ───────────────────────────────────────────────────────────────────────────
// Aggregates (drive the right-hand sidebar on /pipeline/board)
// ───────────────────────────────────────────────────────────────────────────

export const BOARD_TOTAL_VALUE = BOARD_STAGES
  .filter(s => s.stage !== 'ARCHIVED')
  .reduce((sum, s) => sum + s.value, 0);

/** Donut groups stages into 4 funnel buckets so the chart stays readable. */
function bucketValue(stages: CampaignStage[]): number {
  return BOARD_STAGES
    .filter(s => stages.includes(s.stage))
    .reduce((sum, s) => sum + s.value, 0);
}

export const BOARD_DONUT_SEGMENTS = [
  {
    name: 'Inbound / leads',
    value: bucketValue(['NEW LEAD', 'APPLIED', 'BRAND REPLIED', 'RESPONDED', 'WAITING ON BRAND', 'CALL SCHEDULED']),
    color: '#FF6B9D',
  },
  {
    name: 'SOW + strategy',
    value: bucketValue(['SOW RECEIVED', 'SOW REVIEWED', 'STRATEGY READY']),
    color: '#9D6BFF',
  },
  {
    name: 'Production',
    value: bucketValue(['SCRIPT READY', 'FILMING', 'EDITING', 'QA']),
    color: '#FF9966',
  },
  {
    name: 'Delivered / paid',
    value: bucketValue(['SUBMITTED', 'ACCEPTED', 'POSTED', 'INVOICED', 'PAID']),
    color: '#22C55E',
  },
];

// ───────────────────────────────────────────────────────────────────────────
// Upcoming deadlines — 5 soonest non-archived campaigns with a `due_date`.
// ───────────────────────────────────────────────────────────────────────────

function dueLabel(iso: string | undefined, today: Date): { due: string; tone: 'red' | 'orange' | 'yellow' | 'green' } {
  if (!iso) return { due: 'TBD', tone: 'green' };
  const dueDate = new Date(iso);
  const days = Math.ceil((dueDate.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return { due: `${Math.abs(days)}d overdue`, tone: 'red' };
  if (days === 0) return { due: 'Today', tone: 'red' };
  if (days === 1) return { due: 'Tomorrow', tone: 'orange' };
  if (days < 7) return { due: dueDate.toLocaleDateString('en-US', { weekday: 'short' }), tone: 'yellow' };
  return { due: iso.slice(5), tone: 'green' };
}

const _today = new Date();
const _deadlineCandidates = DASHBOARD_CAMPAIGNS
  .filter(c => c.status !== 'archived' && !!c.due_date)
  .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))
  .slice(0, 5);

export const BOARD_UPCOMING_DEADLINES = _deadlineCandidates.map(c => {
  const { due, tone } = dueLabel(c.due_date, _today);
  return {
    brand: c.brand,
    label: c.next_action,
    due,
    tone,
  };
});

// ───────────────────────────────────────────────────────────────────────────
// Top brands — 5 highest-value non-archived campaigns.
// ───────────────────────────────────────────────────────────────────────────

export const BOARD_TOP_BRANDS = (() => {
  const byBrand = new Map<string, number>();
  for (const c of DASHBOARD_CAMPAIGNS) {
    if (c.status === 'archived') continue;
    byBrand.set(c.brand, (byBrand.get(c.brand) ?? 0) + campaignValue(c));
  }
  return Array.from(byBrand.entries())
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([brand, value]) => ({ brand, value }));
})();
