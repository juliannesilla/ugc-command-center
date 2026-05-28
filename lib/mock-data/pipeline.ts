// Pipeline cards — derived from `data/brands-canonical.json` (the same
// snapshot LINUS V8A baked for `from-canonical.ts`).
//
// Phase A.14v V8B (GRACE / Wave 2, 2026-05-27): stripped the 38-row synthetic
// generator that fabricated Glossier/Ouai/Rare Beauty/Drunk Elephant/Caraway/
// etc. — none of those are real Julz campaigns. Per Julz, A.14u F5: "if it is
// not a real campaign, then take it off the dashboard."
//
// MOCK_PIPELINE now reads the same 37 dashboard-visible canonical brand rows
// that drive the Database view + the Board view, projected into the legacy
// `PipelineCard` shape so any pre-A.14e caller (analytics tile, retired
// widget) keeps compiling. Board page itself stopped consuming MOCK_PIPELINE
// in A.14e Wave 2 — it now sources from MOCK_CAMPAIGNS directly.
//
// PipelineStage / Health / PipelineCard types preserved verbatim (HR-2
// PRESERVE INTENT) — only the data behind them changed.

import { loadAllCanonical } from '@/lib/mock-data/campaigns/from-canonical';
import type { Campaign, CampaignStage } from '@/lib/types/campaign';

export type PipelineStage =
  | 'NEW LEAD'
  | 'RESPONDED'
  | 'WAITING ON BRAND'
  | 'SOW RECEIVED'
  | 'SOW REVIEWED'
  | 'STRATEGY READY'
  | 'SCRIPT READY'
  | 'FILMING'
  | 'EDITING'
  | 'QA'
  | 'SUBMITTED'
  | 'ACCEPTED'
  | 'POSTED'
  | 'PAID'
  | 'ARCHIVED';

export const STAGES: PipelineStage[] = [
  'NEW LEAD',
  'RESPONDED',
  'WAITING ON BRAND',
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
  'PAID',
  'ARCHIVED',
];

export type Health = 'green' | 'yellow' | 'orange' | 'red';

export interface PipelineCard {
  id: string;
  brand: string;
  campaign: string;
  stage: PipelineStage;
  value: number;       // USD
  deadline?: string;   // ISO date
  health: Health;
  daysInStage: number;
  platform: 'TikTok' | 'IG Reels' | 'YouTube' | 'Multi';
  owner: 'Julz';
  source: 'SideShift' | 'Outbound' | 'Inbound' | 'Referral';
}

// ───────────────────────────────────────────────────────────────────────────
// Canonical → PipelineCard projection
// ───────────────────────────────────────────────────────────────────────────

/** Collapse the 18-stage `CampaignStage` workflow onto the legacy 15-stage
 *  `PipelineStage` set this module exported pre-A.14e. */
function compressStage(s: CampaignStage): PipelineStage {
  if (s === 'APPLIED' || s === 'BRAND REPLIED' || s === 'CALL SCHEDULED') return 'NEW LEAD';
  if (s === 'INVOICED') return 'SUBMITTED';
  return s as PipelineStage;
}

/** canonical row `urgency` + `last_msg_at` → traffic-light health. */
function deriveHealth(urgency: string | undefined, lastMsgAt: string | null, today: Date): Health {
  if (urgency === 'P0') return 'red';
  if (urgency === 'P1') return 'orange';
  if (!lastMsgAt) return 'yellow';
  const days = Math.floor((today.getTime() - new Date(lastMsgAt).getTime()) / 86_400_000);
  if (days > 14) return 'orange';
  if (days > 7) return 'yellow';
  return 'green';
}

/** canonical first-platform from deliverables → legacy platform enum. */
function derivePlatform(deliverables: Array<{ platform?: string; platforms?: string[] }>): PipelineCard['platform'] {
  const platforms = deliverables
    .flatMap(d => (d.platforms ?? (d.platform ? [d.platform] : [])))
    .map(p => p.toLowerCase());
  if (platforms.length === 0) return 'TikTok';
  if (platforms.length > 1) return 'Multi';
  if (platforms[0].includes('tiktok')) return 'TikTok';
  if (platforms[0].includes('reel') || platforms[0].includes('instagram')) return 'IG Reels';
  if (platforms[0].includes('youtube') || platforms[0].includes('shorts')) return 'YouTube';
  return 'TikTok';
}

/** canonical `pipeline_source[0]` → legacy source enum. */
function deriveSource(pipelineSource: string[]): PipelineCard['source'] {
  const first = (pipelineSource[0] ?? '').toLowerCase();
  if (first.includes('sideshift')) return 'SideShift';
  if (first.includes('referral')) return 'Referral';
  if (first.includes('inbound') || first.includes('brkfst') || first.includes('gmail')) return 'Inbound';
  return 'Outbound';
}

/** Days since `last_msg_at` (or 0 if unknown). */
function daysSince(iso: string | null, today: Date): number {
  if (!iso) return 0;
  return Math.max(0, Math.floor((today.getTime() - new Date(iso).getTime()) / 86_400_000));
}

function buildPipeline(): PipelineCard[] {
  const today = new Date();
  return loadAllCanonical()
    .filter(row => row.dashboard_visible)
    .map(row => {
      const value =
        (row.payment_amount_usd ?? 0) +
        (typeof row.bonus_amount_usd === 'number' ? row.bonus_amount_usd : 0);
      const stage = compressStage(legacyStageFromCanonical(row.status));
      return {
        id: row.brand_id,
        brand: row.brand_name_canonical,
        campaign: `${row.brand_name_canonical} — UGC Campaign`,
        stage,
        value,
        deadline: row.deadlines.submission_by ?? row.deadlines.filming_by ?? undefined,
        health: deriveHealth(row.urgency, row.last_msg_at, today),
        daysInStage: daysSince(row.last_msg_at, today),
        platform: derivePlatform(row.deliverables),
        owner: 'Julz' as const,
        source: deriveSource(row.pipeline_source),
      };
    });
}

/** Mirror of `from-canonical.ts > mapStage` so this file doesn't need to
 *  import internal mapper. Kept in sync — single source of truth = canonical
 *  status enum, both files map the same way. */
function legacyStageFromCanonical(status: string): CampaignStage {
  switch (status) {
    case 'signed':                return 'SOW REVIEWED';
    case 'submitted':             return 'SUBMITTED';
    case 'paid':                  return 'PAID';
    case 'contract_pending_julz': return 'SOW RECEIVED';
    case 'awaiting_julz':         return 'BRAND REPLIED';
    case 'in_negotiation':        return 'RESPONDED';
    case 'intake':                return 'NEW LEAD';
    case 'closed':                return 'ARCHIVED';
    default:                      return 'NEW LEAD';
  }
}

export const MOCK_PIPELINE: PipelineCard[] = buildPipeline();

export function totalPipelineValue(cards: PipelineCard[] = MOCK_PIPELINE): number {
  return cards.reduce((sum, c) => sum + c.value, 0);
}

export function cardsByStage(stage: PipelineStage, cards: PipelineCard[] = MOCK_PIPELINE): PipelineCard[] {
  return cards.filter(c => c.stage === stage);
}

export function topBrandsByValue(
  cards: PipelineCard[] = MOCK_PIPELINE,
  limit = 5,
): Array<{ brand: string; value: number }> {
  const m = new Map<string, number>();
  for (const c of cards) m.set(c.brand, (m.get(c.brand) ?? 0) + c.value);
  return Array.from(m.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([brand, value]) => ({ brand, value }));
}

export function upcomingDeadlines(
  cards: PipelineCard[] = MOCK_PIPELINE,
  limit = 5,
): PipelineCard[] {
  return [...cards]
    .filter(c => c.deadline)
    .sort((a, b) => (a.deadline! < b.deadline! ? -1 : 1))
    .slice(0, limit);
}

// `Campaign` import kept so type narrowing flows through if a future caller
// re-projects MOCK_PIPELINE back into Campaign shape.
export type { Campaign };
