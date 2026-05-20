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

export const FOCUS_THIS_WEEK: FocusItem[] = [
  { id: 'f1', title: 'Submit Glossier IG cut v3',     due: 'Today', brand: 'Glossier',        type: 'Submit',  priority: 'P0' },
  { id: 'f2', title: 'Film Ouai hair-care 3-pack',    due: 'Today', brand: 'Ouai',            type: 'Film',    priority: 'P0' },
  { id: 'f3', title: 'Reply to Caraway brief Q\'s',   due: 'Tue',   brand: 'Caraway',         type: 'Respond', priority: 'P1' },
  { id: 'f4', title: 'QA Olipop final delivery',      due: 'Tue',   brand: 'Olipop',          type: 'QA',      priority: 'P1' },
  { id: 'f5', title: 'Edit Rare Beauty hook variants',due: 'Wed',   brand: 'Rare Beauty',     type: 'Edit',    priority: 'P1' },
  { id: 'f6', title: 'Script Liquid Death 30s spot',  due: 'Thu',   brand: 'Liquid Death',    type: 'Script',  priority: 'P2' },
];

export interface ActivityRow {
  id: string;
  when: string;
  brand: string;
  event: string;
  stage: string;
}

export const RECENT_ACTIVITY: ActivityRow[] = [
  { id: 'a1', when: '2h ago',  brand: 'Glossier',     event: 'Submitted v3 cut for approval',     stage: 'SUBMITTED' },
  { id: 'a2', when: '6h ago',  brand: 'Olipop',       event: 'QA pass — sent to brand',           stage: 'QA → SUBMITTED' },
  { id: 'a3', when: 'Yesterday', brand: 'Caraway',    event: 'SOW received from brand',           stage: 'SOW RECEIVED' },
  { id: 'a4', when: 'Yesterday', brand: 'Rare Beauty',event: 'Script approved by brand',          stage: 'SCRIPT READY' },
  { id: 'a5', when: '2d ago',  brand: 'Drunk Elephant', event: 'New lead from SideShift',          stage: 'NEW LEAD' },
  { id: 'a6', when: '2d ago',  brand: 'Our Place',    event: 'Posted to TikTok — 412k views in 18h', stage: 'POSTED' },
  { id: 'a7', when: '3d ago',  brand: 'Whoop',        event: 'Payment received $5,200',           stage: 'PAID' },
];

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
