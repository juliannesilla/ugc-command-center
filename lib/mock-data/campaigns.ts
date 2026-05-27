// Mock dashboard summary data.
// TODO(D-5): swap with markdown reads from ~/OneDrive/Desktop/UGC/_meta + n8n API.
//
// Re-export D-3's per-campaign registry so `@/lib/mock-data/campaigns` resolves
// either way (this file shadows the sibling `campaigns/` folder under Node's
// resolution rules).
export * from './campaigns/index';

export interface FocusItem {
  id: string;
  title: string;
  due: string;       // e.g. "Today", "Tue", "Wed"
  brand: string;
  type: 'Script' | 'Film' | 'Edit' | 'QA' | 'Submit' | 'Respond';
  priority: 'P0' | 'P1' | 'P2';
}

// Phase A.14u F5-STRIP-MOCKS (2026-05-27, Julz directive): emptied — was 6
// fake focus items (Glossier, Ouai, Caraway, Olipop, Rare Beauty, Liquid
// Death). The real focus this week is ParakeetAI script + film; the
// FocusThisWeek component will populate from MOCK_CAMPAIGNS instead.
export const FOCUS_THIS_WEEK: FocusItem[] = [];

export interface ActivityRow {
  id: string;
  when: string;
  brand: string;
  event: string;
  stage: string;
}

// Phase A.14u F5-STRIP-MOCKS (2026-05-27, Julz directive): emptied — was 7
// fake activity rows (Glossier, Olipop, Caraway, Rare Beauty, Drunk Elephant,
// Our Place, Whoop) that misrepresented real pipeline state. Empty array =
// honest "no recent activity" empty state. Will populate when real campaign
// events ship (parakeetai submission, payment, etc.).
export const RECENT_ACTIVITY: ActivityRow[] = [];

export interface ToolConnection {
  name: string;
  status: 'connected' | 'partial' | 'planned';
  note?: string;
}

export const TOOLS: ToolConnection[] = [
  { name: 'Linear',     status: 'partial',   note: 'UGC Pipeline project — read-only mirror' },
  { name: 'n8n',        status: 'partial',   note: '4 workflows (inactive)' },
  { name: 'OneDrive',   status: 'connected', note: 'Master UGC file + assets' },
  { name: 'Gmail',      status: 'connected', note: 'Brand outreach inbox' },
  { name: 'TikTok',     status: 'planned',   note: 'Analytics pending' },
  { name: 'Stripe',     status: 'planned',   note: 'Payments tracking' },
];

export interface PipelineSnapshotTile {
  label: string;
  count: number;
  accent: 'pink' | 'iris' | 'peach' | 'green' | 'yellow' | 'orange';
}

export const SNAPSHOT_TILES: PipelineSnapshotTile[] = [
  { label: 'New Leads',         count: 3,  accent: 'pink' },
  { label: 'Responded',         count: 3,  accent: 'pink' },
  { label: 'Waiting on Brand',  count: 2,  accent: 'yellow' },
  { label: 'SOW Received',      count: 3,  accent: 'iris' },
  { label: 'SOW Reviewed',      count: 2,  accent: 'iris' },
  { label: 'Strategy Ready',    count: 2,  accent: 'iris' },
  { label: 'Script Ready',      count: 2,  accent: 'peach' },
  { label: 'Filming',           count: 3,  accent: 'orange' },
  { label: 'Editing',           count: 2,  accent: 'orange' },
  { label: 'QA',                count: 2,  accent: 'orange' },
  { label: 'Submitted',         count: 2,  accent: 'green' },
  { label: 'Paid',              count: 2,  accent: 'green' },
];

export const CAMPAIGN_HEALTH = {
  readiness: 82,
  onTrack: 24,
  atRisk: 8,
  blocked: 6,
};

export const NEXT_MOVE = {
  headline: 'Submit Glossier IG cut v3',
  reason:   'Deadline today 5pm PT — brand approval gates next $2,200 payment.',
  cta:      'Open campaign brief',
};
