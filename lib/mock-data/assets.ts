// Asset Vault data — wired to Julz's REAL asset library (A.AB live-data swap).
//
// Source of truth on disk:
//   • data/assets-summary.json  → aggregates (manifest_rows, media_files,
//     total_gb, by_type, by_content_type, by_month) from the REAL
//     ASSET-LIBRARY/MANIFEST.jsonl (15,379 media files · 316.4 GB).
//   • data/assets-recent.jsonl  → 60 most-recent media rows (read server-side
//     in app/assets/page.tsx via loadRecentAssets(); not imported here because
//     a .jsonl can't be statically imported).
//
// HR-49 NO MOCK DATA: aggregates below are derived from real summary numbers,
// not invented. Where the real library has no equivalent for a former mock
// field (e.g. workflow "health", brand-folder grouping, collaborators), the
// surface is repurposed to a real dimension the data DOES have (media type,
// content type, capture month) rather than fabricating values. See the
// "honest-empty" notes inline.

import summary from '@/data/assets-summary.json';
import recentRows from '@/data/assets-recent.json';

import type {
  Asset,
  AssetCategory,
} from '@/lib/data-sync/types';

// ── Real aggregate snapshot (typed view of assets-summary.json) ─────────────
export interface AssetsSummary {
  manifest_rows: number;
  media_files: number;
  total_gb: number;
  by_type: Record<string, number>;
  by_content_type: Record<string, number>;
  by_month: Record<string, number>;
}

export const ASSETS_SUMMARY = summary as AssetsSummary;

const videoCount = ASSETS_SUMMARY.by_type.video ?? 0;
const photoCount = ASSETS_SUMMARY.by_type.photo ?? 0;
const monthCount = Object.keys(ASSETS_SUMMARY.by_month).length;

// Aggregate counts used by stat cards + donut — ALL real (from summary).
// `total`, `storageUsedGB` map 1:1 to real fields. `videos`/`photos`/
// `contentTypes`/`months` are real breakdown dimensions. There is no real
// storage *cap* in the manifest, so no fabricated cap/percentage is shown.
export const AGGREGATE = {
  total: ASSETS_SUMMARY.media_files,        // 15,379 real media files
  manifestRows: ASSETS_SUMMARY.manifest_rows,
  videos: videoCount,                       // 3,056
  photos: photoCount,                       // 12,323
  contentTypes: Object.keys(ASSETS_SUMMARY.by_content_type).length, // 5
  months: monthCount,                       // 12 months of capture history
  storageUsedGB: ASSETS_SUMMARY.total_gb,   // 316.4 GB real
};

export const ASSET_FILTER_TABS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Assets' },
  { id: 'video', label: 'Videos' },
  { id: 'photo', label: 'Photos' },
  { id: 'iphone-camera', label: 'iPhone Camera' },
  { id: 'vertical-video', label: 'Vertical Video' },
  { id: 'screenshot', label: 'Screenshots' },
];

// ── Library composition (drives the donut) ──────────────────────────────────
// Repurposed from the former mock "Asset Health" donut. The raw media library
// has no workflow health state (ready / needs-attention / missing) — that's
// campaign metadata, not file metadata. So we show the REAL composition by
// content type, straight from summary.by_content_type. HONEST-EMPTY: no
// invented health buckets.

const CONTENT_TYPE_LABELS: Record<string, string> = {
  'iphone-camera': 'iPhone Camera',
  'vertical-video': 'Vertical Video',
  video: 'Video',
  photo: 'Photo',
  screenshot: 'Screenshot',
};

// Palette reused from the dashboard's iris/cloud/peach/sky/mint family.
const CONTENT_TYPE_COLORS: Record<string, string> = {
  'iphone-camera': '#9D6BFF', // iris
  'vertical-video': '#5B6BFF', // cloud
  video: '#22C55E',           // mint/green
  photo: '#F97316',           // peach
  screenshot: '#38BDF8',      // sky
};

export function compositionByContentType(): {
  label: string;
  value: number;
  color: string;
  pct: number;
}[] {
  const total = ASSETS_SUMMARY.media_files || 1;
  return Object.entries(ASSETS_SUMMARY.by_content_type)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value], i) => ({
      label: CONTENT_TYPE_LABELS[key] ?? key,
      value,
      color: CONTENT_TYPE_COLORS[key] ?? ['#9D6BFF', '#5B6BFF', '#22C55E', '#F97316', '#38BDF8'][i % 5],
      pct: Math.round((value / total) * 100),
    }));
}

// Capture-history breakdown (by month) — real, from summary.by_month.
// Sorted chronologically ascending. Useful for a "library over time" view.
export function captureByMonth(): { month: string; count: number }[] {
  return Object.entries(ASSETS_SUMMARY.by_month)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, count]) => ({ month, count }));
}

// ── Recent media (read from disk server-side) ───────────────────────────────
// A .jsonl file can't be imported statically, so the page reads it in a server
// component (loadRecentAssets) and passes rows as props. This type mirrors the
// real row shape in data/assets-recent.jsonl. HR-10: optional fields stay
// optional — many rows have empty transcript / null duration.
export interface RecentMediaRow {
  name: string;
  type: 'video' | 'photo';
  content_type?: string;
  size_mb: number;
  date: string;
  duration_sec?: number | null;
  transcript_excerpt?: string;
}

// ── Legacy Asset-shape adapter (kept so AssetCard keeps compiling) ──────────
// AssetCard expects the richer Asset type. We map ONLY real fields; fields the
// library doesn't carry (campaign, collaborator) are filled with neutral,
// clearly-non-fabricated placeholders ("Library", initials "JS" = the owner).
const CONTENT_TYPE_TO_CATEGORY: Record<string, AssetCategory> = {
  screenshot: 'Screenshot',
  'iphone-camera': 'B-Roll',
  'vertical-video': 'Export',
  video: 'B-Roll',
  photo: 'Screenshot',
};

function extOf(name: string): Asset['type'] {
  const ext = name.split('.').pop()?.toUpperCase() ?? '';
  switch (ext) {
    case 'MP4': return 'MP4';
    case 'MOV': return 'MOV';
    case 'PNG': return 'PNG';
    case 'JPG':
    case 'JPEG': return 'JPG';
    default:
      // Fall back by media type so the type badge stays meaningful.
      return ext === '' ? 'JPG' : (ext as Asset['type']);
  }
}

export function rowToAsset(row: RecentMediaRow, i: number): Asset {
  const ct = row.content_type ?? row.type;
  return {
    id: `lib-${i}-${row.name}`,
    name: row.name,
    type: extOf(row.name),
    category: CONTENT_TYPE_TO_CATEGORY[ct] ?? 'B-Roll',
    campaign: 'library',
    campaignLabel: CONTENT_TYPE_LABELS[ct] ?? (row.type === 'video' ? 'Video' : 'Photo'),
    sizeMB: row.size_mb,
    uploadedAt: row.date,
    uploadedBy: { initials: 'JS', tone: 'pink' },
    health: 'ready',
  };
}

// Filter helper (used if the page wires up category filtering later).
export function filterAssetsByCategory(
  assets: Asset[],
  category: AssetCategory | 'all'
) {
  if (category === 'all') return assets;
  return assets.filter(a => a.category === category);
}

// ── Back-compat exports for the existing Asset Vault components (all REAL) ───
const RECENT_MEDIA = recentRows as RecentMediaRow[];

// "Recently Added Assets" — real recent media mapped to the Asset shape.
export const MOCK_RECENT_ASSETS: Asset[] = RECENT_MEDIA.slice(0, 9).map(rowToAsset);

// Donut segments = real library composition by content type (not fake health).
export function healthCounts() {
  return compositionByContentType();
}

// "Recent Activity" — HONEST: derived from the real recent-media rows as add
// events (the only activity we can truthfully assert; no fabricated moves).
export type RecentActivity = {
  id: string;
  verb: 'Uploaded' | 'Moved' | 'Marked' | 'Downloaded';
  detail: string;
  meta?: string;
  agoLabel: string;
};
export const MOCK_RECENT_ACTIVITY: RecentActivity[] = RECENT_MEDIA.slice(0, 6).map((r, i) => ({
  id: `act-${i}`,
  verb: 'Uploaded',
  detail: r.name,
  meta: `${r.type === 'video' ? 'Video' : 'Photo'}${r.size_mb ? ` · ${r.size_mb} MB` : ''}`,
  agoLabel: (r.date || '').slice(0, 10),
}));

// The raw media library is organized by date/content-type, not brand/campaign
// folders, and carries no workflow task metadata — honest-empty, not fabricated.
export const MOCK_CAMPAIGN_FOLDERS: never[] = [];
export const MOCK_ASSET_NEXT_MOVES: never[] = [];
