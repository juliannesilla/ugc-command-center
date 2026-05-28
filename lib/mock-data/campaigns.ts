// Dashboard summary data — canonical-derived (Phase A.14v V8A / LINUS).
//
// Source: data/brands-canonical.jsonl (DARWIN A.14v Wave 2 merge).
// Adapter: lib/mock-data/campaigns/from-canonical.ts (LINUS).
//
// Re-export D-3's per-campaign registry so `@/lib/mock-data/campaigns`
// resolves either way (this file shadows the sibling `campaigns/` folder
// under Node's resolution rules).
export * from './campaigns/index';

import {
  loadFocusThisWeek,
  loadRecentActivity,
} from './campaigns/from-canonical';
import { MOCK_CAMPAIGNS } from './campaigns/index';

// ──────────────────────────────────────────────────────────────────────────
// FocusItem — drives `FocusThisWeek` component.
//
// A.14v V8A: derived from canonical `urgency: P0` + deadlines within next
// 7 days. Was empty stub per A.14u F5.
// ──────────────────────────────────────────────────────────────────────────

export interface FocusItem {
  id: string;
  title: string;
  due: string;
  brand: string;
  type: 'Script' | 'Film' | 'Edit' | 'QA' | 'Submit' | 'Respond';
  priority: 'P0' | 'P1' | 'P2';
}

export const FOCUS_THIS_WEEK: FocusItem[] = loadFocusThisWeek();

// ──────────────────────────────────────────────────────────────────────────
// ActivityRow — drives `app/page.tsx` "Recent campaign activity" table.
//
// A.14v V8A: derived from canonical `last_msg_at` + `awaiting_julz_action`,
// sorted desc, top 12. Was empty stub per A.14u F5.
// ──────────────────────────────────────────────────────────────────────────

export interface ActivityRow {
  id: string;
  when: string;
  brand: string;
  event: string;
  stage: string;
}

export const RECENT_ACTIVITY: ActivityRow[] = loadRecentActivity();

// ──────────────────────────────────────────────────────────────────────────
// Tool connections — static config, not derived from canonical.
// ──────────────────────────────────────────────────────────────────────────

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
  { name: 'SideShift',  status: 'connected', note: '34 brand threads scraped' },
  { name: 'TikTok',     status: 'planned',   note: 'Analytics pending' },
  { name: 'Stripe',     status: 'planned',   note: 'Payments tracking' },
];

// ──────────────────────────────────────────────────────────────────────────
// Pipeline snapshot tiles — counts derived from canonical MOCK_CAMPAIGNS
// by `current_stage`.
// ──────────────────────────────────────────────────────────────────────────

export interface PipelineSnapshotTile {
  label: string;
  count: number;
  accent: 'pink' | 'iris' | 'peach' | 'green' | 'yellow' | 'orange';
}

function countByStage(stage: string): number {
  return MOCK_CAMPAIGNS.filter((c) => c.current_stage === stage).length;
}

export const SNAPSHOT_TILES: PipelineSnapshotTile[] = [
  { label: 'New Leads',         count: countByStage('NEW LEAD'),       accent: 'pink' },
  { label: 'Brand Replied',     count: countByStage('BRAND REPLIED'),  accent: 'pink' },
  { label: 'Responded',         count: countByStage('RESPONDED'),      accent: 'pink' },
  { label: 'SOW Received',      count: countByStage('SOW RECEIVED'),   accent: 'iris' },
  { label: 'SOW Reviewed',      count: countByStage('SOW REVIEWED'),   accent: 'iris' },
  { label: 'Strategy Ready',    count: countByStage('STRATEGY READY'), accent: 'iris' },
  { label: 'Script Ready',      count: countByStage('SCRIPT READY'),   accent: 'peach' },
  { label: 'Filming',           count: countByStage('FILMING'),        accent: 'orange' },
  { label: 'Editing',           count: countByStage('EDITING'),        accent: 'orange' },
  { label: 'QA',                count: countByStage('QA'),             accent: 'orange' },
  { label: 'Submitted',         count: countByStage('SUBMITTED'),      accent: 'green' },
  { label: 'Paid',              count: countByStage('PAID'),           accent: 'green' },
];

// ──────────────────────────────────────────────────────────────────────────
// Campaign health — derived from MOCK_CAMPAIGNS risk_level + readiness.
// ──────────────────────────────────────────────────────────────────────────

const onTrackCount = MOCK_CAMPAIGNS.filter((c) => c.risk_level === 'low').length;
const atRiskCount = MOCK_CAMPAIGNS.filter((c) => c.risk_level === 'medium').length;
const blockedCount = MOCK_CAMPAIGNS.filter((c) => c.risk_level === 'high').length;

export const CAMPAIGN_HEALTH = {
  readiness:
    MOCK_CAMPAIGNS.length > 0
      ? Math.round(
          MOCK_CAMPAIGNS.reduce((sum, c) => sum + (c.readiness_score ?? 50), 0) /
            MOCK_CAMPAIGNS.length,
        )
      : 0,
  onTrack: onTrackCount,
  atRisk: atRiskCount,
  blocked: blockedCount,
};

// ──────────────────────────────────────────────────────────────────────────
// Next move — derived from highest-priority awaiting-Julz row.
// ──────────────────────────────────────────────────────────────────────────

function pickNextMove() {
  const p0 = MOCK_CAMPAIGNS.find((c) => c.priority === 'high' && c.waiting_on_who === 'me');
  if (!p0) {
    return {
      headline: 'No urgent moves right now',
      reason: 'Inbox is clean — keep shipping production work.',
      cta: 'Open campaign board',
    };
  }
  return {
    headline: p0.next_action,
    reason: `${p0.brand} — P0 awaiting Julz response.`,
    cta: 'Open campaign',
  };
}

export const NEXT_MOVE = pickNextMove();
