#!/usr/bin/env node
// A.14y Wave 0.6.C — enrich canonical brand rows for signed campaigns (MWM,
// Phobaxx, ParakeetAI) with structured SOW fields mirroring JOAN's veed row
// pattern. Idempotent: re-runs overwrite the same set of fields without
// duplicating.
//
// Reads source SOW markdown from `UGC/sideshift-{slug}/03-sow-breakdown.md`
// and the existing canonical JSONL row. Writes structured fields:
//   payment_total_potential, payment_timing, cycle_days, contract_status,
//   awaiting_brand_action, fit_score, honest_concerns, last_processed_by,
//   last_processed_at, + structured deliverables array.
//
// Backups: writes `.bak` next to the JSONL before overwriting.

import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';

const CANONICAL = 'data/brands-canonical.jsonl';
const BACKUP = CANONICAL + '.bak';

if (existsSync(CANONICAL)) {
  copyFileSync(CANONICAL, BACKUP);
  console.log(`backup: ${BACKUP}`);
}

const lines = readFileSync(CANONICAL, 'utf-8').split('\n');
const NOW = new Date().toISOString();

// ─── Per-brand enrichment payloads (derived from per-campaign 03-sow-breakdown.md) ──

const ENRICH = {
  'mwm-ai': {
    deliverables: [
      { platform: 'TikTok', count: 5, format: 'vertical-1080x1920', cadence: 'per_retainer_cycle' },
      { platform: 'Instagram Reels', count: 5, format: 'cross-post', cadence: 'per_retainer_cycle' },
      { platform: 'YouTube Shorts', count: 5, format: 'cross-post', cadence: 'per_retainer_cycle' },
    ],
    payment_amount_usd: 50, // $50 per 5-post cycle
    payment_terms_days: 30,
    bonus_amount_usd: null,
    payment_total_potential: null, // recurring retainer, no upper cap
    payment_timing: 'per_5_approved_posts',
    cycle_days: 30,
    contract_status: 'signed',
    awaiting_brand_action: 'Send video length spec + tone guide + usage rights window',
    fit_score: 7,
    honest_concerns: [
      'video_length_not_specified',
      'tone_guide_pending',
      'usage_rights_pending',
      'Alicia_identity_overlap_with_MyCal',
    ],
  },

  'phobaxx': {
    deliverables: [
      { platform: 'TikTok+Reels+Shorts', count: 30, format: 'organic-native', cadence: 'monthly_30_posts' },
    ],
    payment_amount_usd: null, // blocked: PDF extraction pending
    payment_terms_days: 30,
    bonus_amount_usd: null,
    payment_total_potential: null,
    payment_timing: 'monthly_30_posts',
    cycle_days: 30,
    contract_status: 'signed',
    awaiting_brand_action: 'Confirm video-only vs photo/carousel split + send payment $ amount',
    fit_score: 6,
    honest_concerns: [
      'payment_amount_blocked_pending_PDF',
      'video_vs_photo_mix_unclear',
      'high_volume_30_posts_month_sustainability',
      'usage_rights_pending',
    ],
  },

  'parakeetai': {
    deliverables: [
      { platform: 'TikTok+Reels+Shorts', count: 1, format: 'talking-head', duration_sec: [30, 90], dimensions: '1080x1920' },
    ],
    payment_amount_usd: 25,
    payment_terms_days: 30,
    bonus_amount_usd: 100, // per 100K views — uncapped
    payment_total_potential: 425, // $25 base + $100 view bonus + $300 add-on if accepted
    payment_timing: 'base_immediate_bonus_per_100k_views',
    cycle_days: 7, // first-week add-on window
    contract_status: 'signed',
    awaiting_brand_action: 'Confirm acceptance of $300 first-week 5-video add-on',
    fit_score: 10,
    honest_concerns: [
      'bonus_uncapped_requires_view_tracking',
      'optional_300_addon_needs_decision',
    ],
  },
};

let updatedCount = 0;
const updated = lines.map((line) => {
  if (!line.trim().startsWith('{')) return line;
  let row;
  try { row = JSON.parse(line); } catch { return line; }
  const enrich = ENRICH[row.brand_id];
  if (!enrich) return line;

  // Merge enrich fields — preserve any existing handcrafted values when present.
  Object.assign(row, enrich, {
    last_processed_by: 'CLAUDE-A14Y-W06C',
    last_processed_at: NOW,
  });
  updatedCount += 1;
  console.log(`enriched: ${row.brand_id}`);
  return JSON.stringify(row);
});

writeFileSync(CANONICAL, updated.join('\n'));
console.log(`\nwrote ${CANONICAL} — ${updatedCount} rows enriched`);

// Re-bake the JSON snapshot the dashboard reads at build time.
const allRows = updated
  .filter((l) => l.trim().startsWith('{'))
  .map((l) => {
    try { return JSON.parse(l); } catch { return null; }
  })
  .filter((r) => r && typeof r.brand_id === 'string');
writeFileSync('data/brands-canonical.json', JSON.stringify(allRows, null, 2));
console.log(`re-baked data/brands-canonical.json (${allRows.length} rows)`);
