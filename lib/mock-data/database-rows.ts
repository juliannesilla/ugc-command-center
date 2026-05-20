// 68-row mocked dataset for the database/table view (mockup #10).

import type { PipelineStage } from './pipeline';

export type PaymentStatus = 'Paid' | 'Invoiced' | 'Awaiting Invoice' | 'In Escrow' | 'Pending Brand' | 'Not Started';
export type ResponseStatus = 'No Reply' | 'Pending' | 'Engaged' | 'Confirmed' | 'Declined' | 'Closed';

export interface DatabaseRow {
  id: string;
  brand: string;
  campaign: string;
  stage: PipelineStage;
  deliverable: string;
  deadline: string;     // formatted short label
  payment: PaymentStatus;
  ownerInitials: string;
  nextStep: string;
  response: ResponseStatus;
  notes: string;
  value: number;
}

const STAGES_FOR_GEN: PipelineStage[] = [
  'NEW LEAD','RESPONDED','WAITING ON BRAND','SOW RECEIVED','SOW REVIEWED',
  'STRATEGY READY','SCRIPT READY','FILMING','EDITING','QA',
  'SUBMITTED','ACCEPTED','POSTED','PAID',
];

const STAGE_COUNTS: Record<PipelineStage, number> = {
  'NEW LEAD':         12,
  'RESPONDED':        8,
  'WAITING ON BRAND': 6,
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
  'ParakeetAI','Notion','Linear','Vercel','Figma','Webflow',
  'Loom','Calendly','Superhuman','Things','Bear','Craft',
];

const DELIVERABLES = [
  '1 × 30s TikTok',
  '1 × IG Reel + 3 stories',
  '2 × YT Shorts',
  '3 × TikTok hook variants',
  '1 × IG Reel',
  '5-pack TikTok',
  '1 × cross-channel cut',
  '1 × 60s YT Short',
  '1 × IG carousel + Reel',
  '1 × dedicated TikTok',
];

const NEXT_STEPS_BY_STAGE: Record<PipelineStage, string[]> = {
  'NEW LEAD':         ['Send intro email', 'Reply to SideShift DM', 'Confirm fit + rate', 'Pitch concept'],
  'RESPONDED':        ['Wait 48h then nudge', 'Send rate card', 'Book intro call'],
  'WAITING ON BRAND': ['Nudge in 24h', 'Escalate via founder', 'Reply when brief lands'],
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
  'PAID':             ['Confirm receipt', 'File invoice', 'Archive assets'],
  'ARCHIVED':         ['—'],
};

const PAYMENT_BY_STAGE: Record<PipelineStage, PaymentStatus[]> = {
  'NEW LEAD':         ['Not Started'],
  'RESPONDED':        ['Not Started'],
  'WAITING ON BRAND': ['Not Started'],
  'SOW RECEIVED':     ['Awaiting Invoice'],
  'SOW REVIEWED':     ['Awaiting Invoice', 'Pending Brand'],
  'STRATEGY READY':   ['Awaiting Invoice', 'In Escrow'],
  'SCRIPT READY':     ['In Escrow', 'Invoiced'],
  'FILMING':          ['In Escrow'],
  'EDITING':          ['In Escrow', 'Invoiced'],
  'QA':               ['Invoiced'],
  'SUBMITTED':        ['Invoiced'],
  'ACCEPTED':         ['Invoiced', 'Pending Brand'],
  'POSTED':           ['Pending Brand'],
  'PAID':             ['Paid'],
  'ARCHIVED':         ['Paid'],
};

const RESPONSE_BY_STAGE: Record<PipelineStage, ResponseStatus[]> = {
  'NEW LEAD':         ['No Reply', 'Pending'],
  'RESPONDED':        ['Engaged'],
  'WAITING ON BRAND': ['Pending', 'No Reply'],
  'SOW RECEIVED':     ['Engaged', 'Confirmed'],
  'SOW REVIEWED':     ['Confirmed'],
  'STRATEGY READY':   ['Confirmed'],
  'SCRIPT READY':     ['Confirmed'],
  'FILMING':          ['Confirmed'],
  'EDITING':          ['Confirmed'],
  'QA':               ['Confirmed'],
  'SUBMITTED':        ['Pending', 'Engaged'],
  'ACCEPTED':         ['Confirmed'],
  'POSTED':           ['Closed'],
  'PAID':             ['Closed'],
  'ARCHIVED':         ['Closed', 'Declined'],
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
  'Posted on TikTok — strong save rate',
  'Captioning required for accessibility',
  'Spec ad — paid placement after',
];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function buildRows(): DatabaseRow[] {
  const rows: DatabaseRow[] = [];
  let counter = 1;

  STAGES_FOR_GEN.forEach((stage, stageIdx) => {
    const count = STAGE_COUNTS[stage];
    for (let i = 0; i < count; i++) {
      const seed = stageIdx * 13 + i * 7 + 3;
      const brand = pick(BRANDS, seed);
      const platforms = ['TikTok', 'IG Reels', 'YouTube', 'Multi'] as const;
      const platform = pick(platforms, seed + 1);
      const season = pick(['Spring', 'Summer', 'Launch', 'Refresh', 'Holiday'], seed + 2);
      const dueIn = -3 + ((seed * 5) % 21);
      const dueLabel = dueIn < 0 ? `${Math.abs(dueIn)}d overdue` :
        dueIn === 0 ? 'Today' :
        dueIn === 1 ? 'Tomorrow' :
        dueIn <= 7 ? `In ${dueIn}d` :
        `May ${(19 + dueIn) % 31}`;

      rows.push({
        id: `UGC-${(200 + counter).toString().padStart(3, '0')}`,
        brand,
        campaign: `${brand} — ${platform} ${season}`,
        stage,
        deliverable: pick(DELIVERABLES, seed + 3),
        deadline: dueLabel,
        payment: pick(PAYMENT_BY_STAGE[stage], seed + 4),
        ownerInitials: 'JS',
        nextStep: pick(NEXT_STEPS_BY_STAGE[stage], seed + 5),
        response: pick(RESPONSE_BY_STAGE[stage], seed + 6),
        notes: pick(NOTES, seed + 7),
        value: [2200, 2800, 3400, 4100, 4800, 5500, 6200, 7400, 8600, 9800][seed % 10],
      });
      counter++;
    }
  });

  return rows;
}

export const DATABASE_ROWS: DatabaseRow[] = buildRows();

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
  ] as PipelineStage[]
).map(stage => {
  const matching = DATABASE_ROWS.filter(r => r.stage === stage);
  return {
    label: stage,
    count: matching.length,
    value: matching.reduce((s, r) => s + r.value, 0),
  };
});
