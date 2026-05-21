// 68-row mocked dataset for the database/table view (mockup #10).
//
// Phase A.14e Wave 2 (E3): rewritten to emit the canonical 36-field `Campaign`
// shape per `_meta/dashboard-spec/02-campaign-pipeline-views-architecture.md`
// view #3 "All Campaigns / Database View" (L194-L230). The legacy
// `DatabaseRow` shape is preserved as a thin projection for any caller that
// still expects the old format.

import type {
  Campaign,
  CampaignStage,
  CampaignStatus,
  CampaignPriority,
  WaitingOn,
  CampaignType,
  ProductCategory,
  PlatformSource,
  ContactChannel,
  PaymentStatus,
  RiskLevel,
  RequiredFormat,
} from '@/lib/types/campaign';
import { MOCK_CAMPAIGNS } from '@/lib/mock-data/campaigns/index';
import type { PipelineStage } from './pipeline';

const STAGES_FOR_GEN: CampaignStage[] = [
  'NEW LEAD','RESPONDED','WAITING ON BRAND','SOW RECEIVED','SOW REVIEWED',
  'STRATEGY READY','SCRIPT READY','FILMING','EDITING','QA',
  'SUBMITTED','ACCEPTED','POSTED','PAID','ARCHIVED',
];

const STAGE_COUNTS: Record<CampaignStage, number> = {
  'NEW LEAD':         10,
  'APPLIED':          0,
  'BRAND REPLIED':    0,
  'RESPONDED':        7,
  'WAITING ON BRAND': 6,
  'CALL SCHEDULED':   0,
  'SOW RECEIVED':     5,
  'SOW REVIEWED':     4,
  'STRATEGY READY':   4,
  'SCRIPT READY':     3,
  'FILMING':          3,
  'EDITING':          4,
  'QA':               3,
  'SUBMITTED':        3,
  'ACCEPTED':         3,
  'POSTED':           4,
  'INVOICED':         0,
  'PAID':             3,
  'ARCHIVED':         3,
};

const BRANDS = [
  'Glossier','Ouai','Rare Beauty','Drunk Elephant','Caraway','Our Place',
  'Brooklinen','Allbirds','Hydrow','Whoop','Headspace','Calm',
  'Function of Beauty','Olipop','Poppi','Liquid Death','Chamberlain Coffee',
  'Magic Spoon','AG1','Ritual','Care/of','Hims','Hers','Nurx',
  'Roman','Quip','Bite','Hello','Native','Dr. Squatch',
  'Manscaped','Bombas','Rothy\'s','Birdies','Mejuri','Aurate','Catbird',
  'Notion','Linear','Vercel','Figma','Webflow',
  'Loom','Calendly','Superhuman','Things','Bear','Craft',
];

const PRODUCTS_BY_CATEGORY: Record<ProductCategory, string[]> = {
  ai: ['AI Writing Tool', 'AI Image Gen', 'AI Interview Coach', 'AI Summarizer'],
  software: ['Project Tool', 'Calendar App', 'Note Taking App', 'Code Editor'],
  finance: ['Budgeting App', 'Investing Platform', 'Tax Prep Tool'],
  beauty: ['Lip Oil', 'Foundation', 'Skin Serum', 'Mascara'],
  home: ['Cookware Set', 'Bedding', 'Storage System'],
  creator_tools: ['Editing Suite', 'Streaming Tool', 'Caption App'],
  other: ['Apparel Line', 'Snack Bar', 'Drink Mix'],
};

const PLATFORMS: PlatformSource[] = ['sideshift', 'email', 'inbound', 'direct', 'tiktok', 'other'];
const CONTACTS: ContactChannel[] = ['sideshift', 'email', 'whatsapp', 'call', 'other'];
const TYPES: CampaignType[] = ['talking_head', 'demo', 'paid_ad', 'organic_post', 'review', 'affiliate', 'retainer'];
const CATEGORIES: ProductCategory[] = ['ai', 'software', 'finance', 'beauty', 'home', 'creator_tools', 'other'];
const FORMATS: RequiredFormat[] = ['vertical_video', 'image', 'story', 'carousel', 'other'];
const RISKS: RiskLevel[] = ['low', 'medium', 'high'];

const STATUS_BY_STAGE: Record<CampaignStage, CampaignStatus> = {
  'NEW LEAD': 'active',
  'APPLIED': 'active',
  'BRAND REPLIED': 'active',
  'RESPONDED': 'active',
  'WAITING ON BRAND': 'waiting',
  'CALL SCHEDULED': 'active',
  'SOW RECEIVED': 'active',
  'SOW REVIEWED': 'active',
  'STRATEGY READY': 'active',
  'SCRIPT READY': 'active',
  'FILMING': 'active',
  'EDITING': 'active',
  'QA': 'active',
  'SUBMITTED': 'submitted',
  'ACCEPTED': 'active',
  'POSTED': 'active',
  'INVOICED': 'submitted',
  'PAID': 'paid',
  'ARCHIVED': 'archived',
};

const PAYMENT_BY_STAGE: Record<CampaignStage, PaymentStatus[]> = {
  'NEW LEAD':         ['unknown'],
  'APPLIED':          ['unknown'],
  'BRAND REPLIED':    ['unknown'],
  'RESPONDED':        ['unknown'],
  'WAITING ON BRAND': ['unknown', 'pending'],
  'CALL SCHEDULED':   ['unknown'],
  'SOW RECEIVED':     ['pending'],
  'SOW REVIEWED':     ['pending'],
  'STRATEGY READY':   ['pending', 'invoiced'],
  'SCRIPT READY':     ['pending', 'invoiced'],
  'FILMING':          ['invoiced'],
  'EDITING':          ['invoiced'],
  'QA':               ['invoiced'],
  'SUBMITTED':        ['invoiced'],
  'ACCEPTED':         ['invoiced'],
  'POSTED':           ['invoiced', 'overdue'],
  'INVOICED':         ['invoiced'],
  'PAID':             ['paid'],
  'ARCHIVED':         ['paid'],
};

const NEXT_ACTIONS_BY_STAGE: Record<CampaignStage, string[]> = {
  'NEW LEAD':         ['Send intro email', 'Reply to SideShift DM', 'Confirm fit + rate', 'Pitch concept'],
  'APPLIED':          ['Wait 48h then nudge', 'Polish portfolio link'],
  'BRAND REPLIED':    ['Schedule intro call', 'Confirm campaign brief'],
  'RESPONDED':        ['Wait 48h then nudge', 'Send rate card', 'Book intro call'],
  'WAITING ON BRAND': ['Nudge in 24h', 'Escalate via founder', 'Reply when brief lands'],
  'CALL SCHEDULED':   ['Prep questions for call', 'Confirm call time'],
  'SOW RECEIVED':     ['Read SOW + flag usage', 'Send redline to brand', 'Ask 3 clarifying Qs'],
  'SOW REVIEWED':     ['Sign + return', 'Send to legal', 'Send back countersigned'],
  'STRATEGY READY':   ['Lock hook angle', 'Send concept doc', 'Confirm shot list'],
  'SCRIPT READY':     ['Send script for approval', 'Storyboard final cut', 'Confirm props'],
  'FILMING':          ['Wrap A-roll', 'Capture b-roll', 'Re-shoot hook'],
  'EDITING':          ['First cut by Wed', 'Color + caption pass', 'Add brand bumpers'],
  'QA':               ['Final QA checklist', 'Brand-safe review', 'Spelling + claims check'],
  'SUBMITTED':        ['Wait on brand approval', 'Resend if no reply 72h', 'Confirm posting window'],
  'ACCEPTED':         ['Schedule post', 'Confirm caption + hashtags', 'Brand handoff'],
  'POSTED':           ['Track 24h perf', 'Capture screenshots', 'Send report to brand'],
  'INVOICED':         ['Wait 30 days', 'Follow up on payment'],
  'PAID':             ['Confirm receipt', 'File invoice', 'Archive assets'],
  'ARCHIVED':         ['—'],
};

const NOTES = [
  'Strong creative fit · push for usage upgrade',
  'Brand wants UGC-native, no overproduction',
  'Need to lock rates before next round',
  'Usage rights flagged — confirm before signing',
  'Prefers TikTok-first, IG repurpose ok',
  'Repeat client · 3rd campaign',
  'Tight turnaround — film by EOW',
  'Founder-led brand · direct DM thread',
  'Asked for hook variant pricing',
  'Cross-promo with another creator',
  'Brand-safe disclaimers required',
  'Affiliate code attached · 15% comm',
  'Whitelisting expected · 30-day',
  'Concept needs revisions',
  'Approved on first round',
];

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[seed % arr.length];
}

function isoOffset(daysFromToday: number): string {
  const d = new Date('2026-05-20');
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

function buildSyntheticCampaigns(): Campaign[] {
  const rows: Campaign[] = [];
  let counter = 1;

  STAGES_FOR_GEN.forEach((stage, stageIdx) => {
    const count = STAGE_COUNTS[stage] ?? 0;
    for (let i = 0; i < count; i++) {
      const seed = stageIdx * 13 + i * 7 + 3;
      const brand = pick(BRANDS, seed);
      const category = pick(CATEGORIES, seed + 2);
      const product = pick(PRODUCTS_BY_CATEGORY[category], seed + 3);
      const platform = pick(PLATFORMS, seed + 1);
      const contactChan = pick(CONTACTS, seed + 4);
      const campaignType = pick(TYPES, seed + 5);
      const requiredFormat = pick(FORMATS, seed + 6);
      const risk = pick(RISKS, seed + 7);
      const priority: CampaignPriority = (['high', 'medium', 'low'] as const)[seed % 3];
      const waitingOn: WaitingOn = (['me', 'brand', 'payment', 'none'] as const)[seed % 4];
      const dueIn = -3 + ((seed * 5) % 28);
      const base = [250, 450, 800, 1200, 1800, 2500, 3200, 4500][seed % 8];
      const bonus = [100, 200, 350, 500, 750, 0][seed % 6];
      const total = base + bonus;
      const hasSow = seed % 4 !== 0;
      const hasScript = stageIdx >= 6;
      const hasSubmitted = stageIdx >= 10;
      const hasPosted = stageIdx >= 12;

      const id = `UGC-${(200 + counter).toString().padStart(3, '0')}`;
      const stageLabel = stage.toLowerCase().replace(/\s+/g, '-');

      rows.push({
        campaign_id: id,
        brand,
        product,
        campaign_name: `${brand} — ${campaignType.replace(/_/g, ' ')} (${product})`,
        platform_source: platform,
        contact_name: `${pick(['Maya','Sasha','Devon','Riley','Pri','Jess','Alex','Jordan','Sam','Lee'], seed + 8)} (${brand})`,
        contact_role: pick(['Founder','Creator Manager','Partnerships Lead','Brand Manager','BD'], seed + 9),
        contact_channel: contactChan,
        current_stage: stage,
        status: STATUS_BY_STAGE[stage],
        priority,
        waiting_on_who: waitingOn,
        campaign_type: campaignType,
        product_category: category,
        deliverable_count: 1 + (seed % 4),
        required_format: requiredFormat,
        required_length: pick(['15-30s', '30-60s', '60-90s', '20-40s'], seed + 10),
        due_date: isoOffset(dueIn),
        follow_up_date: dueIn > 0 ? isoOffset(dueIn - 2) : undefined,
        call_date: stage === 'CALL SCHEDULED' ? isoOffset(3) : undefined,
        base_pay: base,
        bonus_potential: bonus > 0 ? bonus : undefined,
        total_potential_value: total,
        payment_status: pick(PAYMENT_BY_STAGE[stage], seed + 11),
        sow_link: hasSow ? `/campaigns/${stageLabel}/sow-${id}` : undefined,
        job_link: platform === 'sideshift' ? `https://sideshift.example/${id}` : undefined,
        asset_folder: `/campaigns/${stageLabel}/assets-${id}`,
        script_link: hasScript ? `/campaigns/${stageLabel}/script-${id}` : undefined,
        submission_link: hasSubmitted ? `https://tiktok.com/@geezjulz/sub/${id}` : undefined,
        posted_link: hasPosted ? `https://tiktok.com/@geezjulz/posted/${id}` : undefined,
        readiness_score: Math.min(100, 20 + stageIdx * 6 + (seed % 10)),
        brand_fit_score: 40 + (seed % 60),
        risk_level: risk,
        next_action: pick(NEXT_ACTIONS_BY_STAGE[stage], seed + 12),
        blockers: seed % 5 === 0 ? ['Missing SOW'] : seed % 7 === 0 ? ['Waiting on brand'] : [],
        missing_info: !hasSow ? ['SOW link', 'usage rights'] : seed % 6 === 0 ? ['payment terms'] : [],
        notes: pick(NOTES, seed + 13),
      });
      counter++;
    }
  });
  return rows;
}

/**
 * Full Campaign[] feed for the database view. Real seeded campaigns from
 * MOCK_CAMPAIGNS appear FIRST (so Julz's actual data is the source of truth),
 * followed by ~62 synthetic campaigns to give the table realistic density.
 */
export const DATABASE_CAMPAIGNS: Campaign[] = [
  ...MOCK_CAMPAIGNS,
  ...buildSyntheticCampaigns(),
];

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

// Re-export for any caller using the old type name (e.g. existing imports
// from this file that expected `PaymentStatus`).
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
  // Map newer CampaignStage values to legacy PipelineStage union.
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
