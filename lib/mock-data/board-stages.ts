// Board-view stage configuration.
// Source: dashboard-spec `01-initial-dashboard-prompt.md` "Campaign Pipeline →
// Stages" (L326-L344) — 18-stage workflow (added APPLIED, BRAND REPLIED,
// CALL SCHEDULED in Phase A.14e Wave 1 per Julz's verbatim list).
// INVOICED is kept as an interstitial between POSTED and PAID even though
// the prompt skips it, because the existing dashboard tiles already track
// invoicing — non-destructive extension per HR-2 PRESERVE INTENT.
// Counts/values are the static snapshot displayed in the Kanban columns.
// Real card-level data per stage is drawn from MOCK_PIPELINE in pipeline.ts.

import type { CampaignStage } from '@/lib/types/campaign';

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
export const BOARD_STAGES: BoardStageDef[] = [
  { stage: 'NEW LEAD',         count: 12, value: 18020, accent: 'pink'   },
  { stage: 'APPLIED',          count: 5,  value: 9200,  accent: 'pink'   },
  { stage: 'BRAND REPLIED',    count: 4,  value: 8400,  accent: 'pink'   },
  { stage: 'RESPONDED',        count: 8,  value: 16300, accent: 'pink'   },
  { stage: 'WAITING ON BRAND', count: 6,  value: 14750, accent: 'yellow' },
  { stage: 'CALL SCHEDULED',   count: 3,  value: 7600,  accent: 'yellow' },
  { stage: 'SOW RECEIVED',     count: 5,  value: 22600, accent: 'iris'   },
  { stage: 'SOW REVIEWED',     count: 4,  value: 17800, accent: 'iris'   },
  { stage: 'STRATEGY READY',   count: 4,  value: 14200, accent: 'iris'   },
  { stage: 'SCRIPT READY',     count: 3,  value: 9200,  accent: 'peach'  },
  { stage: 'FILMING',          count: 3,  value: 8700,  accent: 'orange' },
  { stage: 'EDITING',          count: 4,  value: 11300, accent: 'orange' },
  { stage: 'QA',               count: 3,  value: 6500,  accent: 'orange' },
  { stage: 'SUBMITTED',        count: 3,  value: 8100,  accent: 'yellow' },
  { stage: 'ACCEPTED',         count: 3,  value: 9300,  accent: 'green'  },
  { stage: 'POSTED',           count: 4,  value: 13400, accent: 'green'  },
  { stage: 'INVOICED',         count: 2,  value: 7200,  accent: 'green'  },
  { stage: 'PAID',             count: 3,  value: 9800,  accent: 'green'  },
  { stage: 'ARCHIVED',         count: 7,  value: 0,     accent: 'ink'    },
];

export const BOARD_TOTAL_VALUE = BOARD_STAGES.reduce((sum, s) => sum + s.value, 0);
// = 193,720 per spec ($193,720 total).

export const BOARD_DONUT_SEGMENTS = [
  { name: 'Inbound / leads',  value: 18020 + 16300 + 14750,           color: '#FF6B9D' }, // 49,070
  { name: 'SOW + strategy',   value: 22600 + 17800 + 14200,           color: '#9D6BFF' }, // 54,600
  { name: 'Production',       value: 9200 + 8700 + 11300 + 6500,      color: '#FF9966' }, // 35,700
  { name: 'Delivered / paid', value: 8100 + 9300 + 13400 + 9800,      color: '#22C55E' }, // 40,600
];

export const BOARD_UPCOMING_DEADLINES = [
  { brand: 'Glossier',       label: 'Submit v3 cut',     due: 'Today · 5pm',   tone: 'red'    as const },
  { brand: 'Ouai',           label: 'Film 3-pack',       due: 'Today',         tone: 'orange' as const },
  { brand: 'Caraway',        label: 'SOW revisions',     due: 'Fri',           tone: 'yellow' as const },
  { brand: 'ParakeetAI',     label: 'SOW redline',       due: 'Fri',           tone: 'yellow' as const },
  { brand: 'Rare Beauty',    label: 'Hook variants v2',  due: 'Mon',           tone: 'green'  as const },
];

export const BOARD_TOP_BRANDS = [
  { brand: 'Caraway',        value: 12500 },
  { brand: 'Glossier',       value: 9800  },
  { brand: 'ParakeetAI',     value: 8600  },
  { brand: 'Drunk Elephant', value: 7400  },
  { brand: 'Liquid Death',   value: 6900  },
];
