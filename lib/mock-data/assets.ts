// Mock asset seed — 1,248 assets across 4 campaign folders + recent activity.
// TODO(D-5 live swap): replace MOCK_* exports with lib/data-sync/markdown.ts reads.

// A.14u F2: dates anchored relative to today via lib/date-anchor.
import { daysFromNow as _daysFromNow } from "@/lib/date-anchor";

import type {
  Asset,
  AssetCategory,
  AssetHealth,
  AssetType,
  Campaign,
} from '@/lib/data-sync/types';

export const MOCK_CAMPAIGN_FOLDERS: Campaign[] = [
  {
    id: 'parakeet',
    brand: 'ParakeetAI',
    name: 'ParakeetAI Launch',
    status: 'IN PROGRESS',
    dueDate: '2026-05-12',
    assetCount: 47,
    collaborators: [
      { initials: 'JS', tone: 'pink' },
      { initials: 'RT', tone: 'iris' },
      { initials: 'MK', tone: 'peach' },
    ],
    thumbColor: 'bg-gradient-to-br from-cloud-200 to-iris-200',
  },
  {
    id: 'goodie',
    brand: 'Goodie AI',
    name: 'Goodie AI — Spring Refresh',
    status: 'IN REVIEW',
    dueDate: _daysFromNow(3),
    assetCount: 32,
    collaborators: [
      { initials: 'JS', tone: 'pink' },
      { initials: 'AL', tone: 'sky' },
    ],
    thumbColor: 'bg-gradient-to-br from-peach-100 to-cloud-200',
  },
  {
    id: 'lumina',
    brand: 'Lumina Skin',
    name: 'Lumina Skin — Summer Drop',
    status: 'CONTENT READY',
    dueDate: '2026-05-28',
    assetCount: 56,
    collaborators: [
      { initials: 'JS', tone: 'pink' },
      { initials: 'NV', tone: 'iris' },
      { initials: 'BR', tone: 'peach' },
      { initials: 'CD', tone: 'sky' },
    ],
    thumbColor: 'bg-gradient-to-br from-iris-100 to-cloud-200',
  },
  {
    id: 'bloom',
    brand: 'Bloom Nutrition',
    name: 'Bloom — Q2 Hero Push',
    status: 'PLANNING',
    dueDate: '2026-06-08',
    assetCount: 18,
    collaborators: [
      { initials: 'JS', tone: 'pink' },
      { initials: 'TQ', tone: 'iris' },
    ],
    thumbColor: 'bg-gradient-to-br from-cloud-100 to-peach-100',
  },
];

// ── Recent (visible-on-page) sample of assets. The full 1,248 catalog is
// represented by AGGREGATE_COUNT for the stat cards and donut.
export const MOCK_RECENT_ASSETS: Asset[] = [
  {
    id: 'a1',
    name: 'ParakeetAI_UGC_Final_v1.mp4',
    type: 'MP4',
    category: 'Export',
    campaign: 'parakeet',
    campaignLabel: 'ParakeetAI',
    sizeMB: 184.2,
    uploadedAt: `${_daysFromNow(0)}T13:48:00Z`,
    uploadedBy: { initials: 'JS', tone: 'pink' },
    health: 'ready',
  },
  {
    id: 'a2',
    name: 'Goodie_Product_Hero_01.png',
    type: 'PNG',
    category: 'Screenshot',
    campaign: 'goodie',
    campaignLabel: 'Goodie AI',
    sizeMB: 4.8,
    uploadedAt: `${_daysFromNow(0)}T11:21:00Z`,
    uploadedBy: { initials: 'JS', tone: 'pink' },
    health: 'ready',
  },
  {
    id: 'a3',
    name: 'Lumina_Script_v3.docx',
    type: 'DOCX',
    category: 'Script',
    campaign: 'lumina',
    campaignLabel: 'Lumina Skin',
    sizeMB: 0.6,
    uploadedAt: `${_daysFromNow(0)}T09:02:00Z`,
    uploadedBy: { initials: 'NV', tone: 'iris' },
    health: 'ready',
  },
  {
    id: 'a4',
    name: 'Bloom_Content_Plan.xlsx',
    type: 'XLSX',
    category: 'Brief',
    campaign: 'bloom',
    campaignLabel: 'Bloom Nutrition',
    sizeMB: 1.2,
    uploadedAt: '2026-05-18T20:14:00Z',
    uploadedBy: { initials: 'JS', tone: 'pink' },
    health: 'in-progress',
  },
  {
    id: 'a5',
    name: 'ParakeetAI_Brief_FINAL.pdf',
    type: 'PDF',
    category: 'Brief',
    campaign: 'parakeet',
    campaignLabel: 'ParakeetAI',
    sizeMB: 2.4,
    uploadedAt: '2026-05-18T16:40:00Z',
    uploadedBy: { initials: 'RT', tone: 'iris' },
    health: 'ready',
  },
  {
    id: 'a6',
    name: 'Goodie_BRoll_Bundle.zip',
    type: 'ZIP',
    category: 'B-Roll',
    campaign: 'goodie',
    campaignLabel: 'Goodie AI',
    sizeMB: 612.0,
    uploadedAt: '2026-05-18T14:05:00Z',
    uploadedBy: { initials: 'AL', tone: 'sky' },
    health: 'ready',
  },
  {
    id: 'a7',
    name: 'Lumina_Hero_Shot_04.jpg',
    type: 'JPG',
    category: 'Screenshot',
    campaign: 'lumina',
    campaignLabel: 'Lumina Skin',
    sizeMB: 7.1,
    uploadedAt: '2026-05-18T11:30:00Z',
    uploadedBy: { initials: 'BR', tone: 'peach' },
    health: 'ready',
  },
  {
    id: 'a8',
    name: 'Bloom_Brand_Guidelines.pdf',
    type: 'PDF',
    category: 'Brand File',
    campaign: 'bloom',
    campaignLabel: 'Bloom Nutrition',
    sizeMB: 8.9,
    uploadedAt: '2026-05-17T22:11:00Z',
    uploadedBy: { initials: 'TQ', tone: 'iris' },
    health: 'in-progress',
  },
  {
    id: 'a9',
    name: 'ParakeetAI_Invoice_May.pdf',
    type: 'PDF',
    category: 'Invoice',
    campaign: 'parakeet',
    campaignLabel: 'ParakeetAI',
    sizeMB: 0.3,
    uploadedAt: '2026-05-17T18:25:00Z',
    uploadedBy: { initials: 'JS', tone: 'pink' },
    health: 'ready',
  },
];

// Aggregate counts used by stat cards + donut. Reflects a 1,248-asset library.
export const AGGREGATE = {
  total: 1248,
  brandFolders: 73,
  recentUploads7d: 23,
  missing: 17,
  readyToSend: 38,
  storageUsedGB: 68.4,
  storageCapGB: 200,
  storagePct: 34,
  health: {
    ready: 632,
    inProgress: 389,
    needsAttention: 159,
    missing: 68,
  },
};

export const ASSET_FILTER_TABS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Assets' },
  { id: 'briefs', label: 'Briefs' },
  { id: 'screenshots', label: 'Screenshots' },
  { id: 'scripts', label: 'Scripts' },
  { id: 'product-links', label: 'Product Links' },
  { id: 'exports', label: 'Exports' },
  { id: 'submitted', label: 'Submitted Videos' },
  { id: 'b-roll', label: 'B-Roll' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'brand-files', label: 'Brand Files' },
];

export interface RecentActivity {
  id: string;
  verb: 'Uploaded' | 'Moved' | 'Marked' | 'Downloaded';
  detail: string;
  meta?: string;
  agoLabel: string; // "2h ago", etc.
}

export const MOCK_RECENT_ACTIVITY: RecentActivity[] = [
  {
    id: 'r1',
    verb: 'Uploaded',
    detail: 'ParakeetAI_UGC_Final_v1.mp4',
    meta: 'to ParakeetAI / Exports',
    agoLabel: '2h ago',
  },
  {
    id: 'r2',
    verb: 'Moved',
    detail: '8 files',
    meta: 'Goodie AI → Submitted Videos',
    agoLabel: '4h ago',
  },
  {
    id: 'r3',
    verb: 'Marked',
    detail: 'GoodieAI_Script as ready',
    meta: 'Status: Ready to Send',
    agoLabel: '6h ago',
  },
  {
    id: 'r4',
    verb: 'Uploaded',
    detail: '4 screenshots',
    meta: 'to Lumina Skin / Screenshots',
    agoLabel: 'Yesterday',
  },
  {
    id: 'r5',
    verb: 'Downloaded',
    detail: 'Bloom_Content_Plan.xlsx',
    meta: 'shared with TQ',
    agoLabel: 'Yesterday',
  },
];

export interface NextMoveAssetTask {
  id: string;
  title: string;
  brand: string;
  context: string;
  ctaLabel: string;
  ctaHref: string;
  accent: 'pink' | 'iris' | 'peach';
}

export const MOCK_ASSET_NEXT_MOVES: NextMoveAssetTask[] = [
  {
    id: 'nm1',
    title: 'Upload final export for ParakeetAI',
    brand: 'ParakeetAI',
    context: 'Campaign due May 12 · Waiting on final deliverable',
    ctaLabel: 'Open Folder',
    ctaHref: '/assets?folder=parakeet',
    accent: 'pink',
  },
  {
    id: 'nm2',
    title: 'Attach product screenshots for Goodie AI',
    brand: 'Goodie AI',
    context: 'Missing 4 screenshots · Needed for final review',
    ctaLabel: 'Add Assets',
    ctaHref: '/assets?folder=goodie',
    accent: 'iris',
  },
];

// Filter helpers (used by /assets page if Julz wires up filtering later).
export function filterAssetsByCategory(
  assets: Asset[],
  category: AssetCategory | 'all'
) {
  if (category === 'all') return assets;
  return assets.filter(a => a.category === category);
}

export function healthCounts(): { label: string; value: number; color: string; pct: number }[] {
  const total = AGGREGATE.total;
  return [
    { label: 'Ready to Send',   value: AGGREGATE.health.ready,          color: '#22C55E', pct: Math.round((AGGREGATE.health.ready / total) * 100) },
    { label: 'In Progress',     value: AGGREGATE.health.inProgress,     color: '#9D6BFF', pct: Math.round((AGGREGATE.health.inProgress / total) * 100) },
    { label: 'Needs Attention', value: AGGREGATE.health.needsAttention, color: '#F97316', pct: Math.round((AGGREGATE.health.needsAttention / total) * 100) },
    { label: 'Missing',         value: AGGREGATE.health.missing,        color: '#EF4444', pct: Math.round((AGGREGATE.health.missing / total) * 100) },
  ];
}
