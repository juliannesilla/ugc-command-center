// Mock pipeline data — 38 SideShift-style opportunities (per Phase B-prep).
// TODO(D-5): replace with Linear API fetch via lib/data-sync/linear.ts.

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

const today = new Date('2026-05-19');
const addDays = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const brands = [
  'Glossier', 'Ouai', 'Rare Beauty', 'Drunk Elephant', 'Caraway', 'Our Place',
  'Brooklinen', 'Allbirds', 'Hydrow', 'Whoop', 'Headspace', 'Calm',
  'Function of Beauty', 'Olipop', 'Poppi', 'Liquid Death', 'Chamberlain Coffee',
  'Magic Spoon', 'AG1', 'Ritual', 'Care/of', 'Hims', 'Hers', 'Nurx',
  'Roman', 'Quip', 'Bite', 'Hello', 'Native', 'Dr. Squatch',
  'Manscaped', 'Bombas', 'Allbirds', 'Rothy\'s', 'Birdies', 'Mejuri',
  'Aurate', 'Catbird',
];

const stages: PipelineStage[] = [
  'NEW LEAD','NEW LEAD','NEW LEAD',
  'RESPONDED','RESPONDED','RESPONDED',
  'WAITING ON BRAND','WAITING ON BRAND',
  'SOW RECEIVED','SOW RECEIVED','SOW RECEIVED',
  'SOW REVIEWED','SOW REVIEWED',
  'STRATEGY READY','STRATEGY READY',
  'SCRIPT READY','SCRIPT READY',
  'FILMING','FILMING','FILMING',
  'EDITING','EDITING',
  'QA','QA',
  'SUBMITTED','SUBMITTED',
  'ACCEPTED','ACCEPTED',
  'POSTED','POSTED','POSTED',
  'PAID','PAID',
  'ARCHIVED','ARCHIVED','ARCHIVED','ARCHIVED','ARCHIVED',
];

function makeCard(i: number): PipelineCard {
  const brand = brands[i % brands.length];
  const stage = stages[i % stages.length];
  const baseValue = [2500, 3200, 4000, 4500, 5200, 6000, 7500, 8200, 9500, 12000][i % 10];
  const days = (i * 7) % 18;
  const healthRoll = (i * 3 + 1) % 10;
  const health: Health = healthRoll < 5 ? 'green' : healthRoll < 7 ? 'yellow' : healthRoll < 9 ? 'orange' : 'red';
  const platform = (['TikTok', 'IG Reels', 'YouTube', 'Multi'] as const)[i % 4];
  const source = (['SideShift', 'Outbound', 'Inbound', 'Referral'] as const)[i % 4];
  return {
    id: `UGC-${(100 + i).toString()}`,
    brand,
    campaign: `${brand} — ${platform === 'Multi' ? 'Cross-channel' : platform} ${['Spring', 'Summer', 'Launch', 'Refresh'][i % 4]}`,
    stage,
    value: baseValue,
    deadline: addDays(-2 + ((i * 5) % 21)),
    health,
    daysInStage: days,
    platform,
    owner: 'Julz',
    source,
  };
}

export const MOCK_PIPELINE: PipelineCard[] = Array.from({ length: 38 }, (_, i) => makeCard(i));

export function totalPipelineValue(cards = MOCK_PIPELINE) {
  return cards.reduce((sum, c) => sum + c.value, 0);
}

export function cardsByStage(stage: PipelineStage, cards = MOCK_PIPELINE) {
  return cards.filter(c => c.stage === stage);
}

export function topBrandsByValue(cards = MOCK_PIPELINE, limit = 5) {
  const m = new Map<string, number>();
  for (const c of cards) m.set(c.brand, (m.get(c.brand) ?? 0) + c.value);
  return Array.from(m.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([brand, value]) => ({ brand, value }));
}

export function upcomingDeadlines(cards = MOCK_PIPELINE, limit = 5) {
  return [...cards]
    .filter(c => c.deadline)
    .sort((a, b) => (a.deadline! < b.deadline! ? -1 : 1))
    .slice(0, limit);
}
