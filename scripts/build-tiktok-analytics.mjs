#!/usr/bin/env node
// A.14v V9A FLORENCE: parses julz-vault tiktok_data_enhanced.csv (42 @geezjulz
// posts) → bakes lib/analytics/tiktok-data.json for ViewsOverTimeChart +
// HookPerformanceBars to consume at build time.
//
// SOURCE: C:/Users/julia/OneDrive/Desktop/julz-vault/01-WORK-CURRENT/social-media/tiktok_data_enhanced.csv
// CSV columns include: Helper: Original Publish Date (PT), CAPTION, LIKES,
// COMMENTS, SHARES, HASHTAGS, PILLAR.
//
// HR-10 ACCESS HONESTY: CSV has NO views column. We expose "engagement"
// (likes + comments + shares) as the y-axis, NOT fabricated views. Chart
// label/copy updated accordingly in the React component.
//
// Run: node scripts/build-tiktok-analytics.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const CSV_PATH =
  'C:/Users/julia/OneDrive/Desktop/julz-vault/01-WORK-CURRENT/social-media/tiktok_data_enhanced.csv';
const OUT_PATH = resolve(REPO_ROOT, 'lib/analytics/tiktok-data.json');

// --- minimal RFC-4180 CSV parser (handles quoted fields with commas) ---
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let i = 0;
  let inQuotes = false;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += c;
      i += 1;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (c === ',') {
      row.push(field);
      field = '';
      i += 1;
      continue;
    }
    if (c === '\r') {
      i += 1;
      continue;
    }
    if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i += 1;
      continue;
    }
    field += c;
    i += 1;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function toNum(v) {
  const n = Number(String(v ?? '').replace(/[, ]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

// --- hook classifier — keyword heuristic on first ~80 chars of caption ---
const HOOK_RULES = [
  { id: 'question', label: 'Question hook', test: (c) => /\?/.test(c.slice(0, 80)) },
  { id: 'story', label: 'Storytime', test: (c) => /\b(story\s?time|let me tell|i was|i used to|growing up|when i)\b/i.test(c) },
  { id: 'list', label: 'List / Tips', test: (c) => /^\s*\d+\s*(things|ways|tips|reasons|lessons|signs)\b/i.test(c) || /\b(top\s+\d|here'?s\s+\d)\b/i.test(c) },
  { id: 'save', label: 'Save / CTA hook', test: (c) => /\b(save this|share this|comment below|drop a|tell me|tag someone)\b/i.test(c) },
  { id: 'vulnerable', label: 'Vulnerable / POV', test: (c) => /\b(pov|honestly|real talk|nobody talks about|truth is|i'?ll be honest)\b/i.test(c) },
  { id: 'relatable', label: 'Relatable statement', test: (c) => /^(if you|when you|me when|that moment)\b/i.test(c) },
];

function classifyHook(caption) {
  const c = caption || '';
  for (const rule of HOOK_RULES) {
    if (rule.test(c)) return { id: rule.id, label: rule.label };
  }
  return { id: 'declarative', label: 'Declarative / Other' };
}

// --- main ---
const raw = readFileSync(CSV_PATH, 'utf8');
const rows = parseCsv(raw);
const header = rows[0];
const dataRows = rows.slice(1).filter((r) => r.length >= 5 && r.some((v) => v && v.trim()));

const idx = (name) => header.findIndex((h) => h.trim() === name);
const COL = {
  date: idx('Helper: Original Publish Date (PT)'),
  caption: idx('CAPTION'),
  likes: idx('LIKES'),
  comments: idx('COMMENTS'),
  shares: idx('SHARES'),
  pillar: idx('PILLAR'),
};

// Validate
for (const [k, v] of Object.entries(COL)) {
  if (v < 0) throw new Error(`Column not found in CSV header: ${k}`);
}

// --- aggregate per-date totals (engagement = likes + comments + shares) ---
const byDate = new Map();
let totalPosts = 0;
let totalLikes = 0;
let totalComments = 0;
let totalShares = 0;
const hookBuckets = new Map();

for (const r of dataRows) {
  const dateStr = (r[COL.date] || '').trim();
  if (!dateStr) continue;
  // Parse "M/D/YYYY" → Date
  const [m, d, y] = dateStr.split('/').map((s) => parseInt(s, 10));
  if (!m || !d || !y) continue;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (isNaN(date.valueOf())) continue;

  const likes = toNum(r[COL.likes]);
  const comments = toNum(r[COL.comments]);
  const shares = toNum(r[COL.shares]);
  const engagement = likes + comments + shares;
  const caption = r[COL.caption] || '';

  totalPosts += 1;
  totalLikes += likes;
  totalComments += comments;
  totalShares += shares;

  const isoKey = date.toISOString().slice(0, 10); // YYYY-MM-DD
  if (!byDate.has(isoKey)) {
    byDate.set(isoKey, { date: isoKey, engagement: 0, posts: 0, likes: 0, comments: 0, shares: 0 });
  }
  const bucket = byDate.get(isoKey);
  bucket.engagement += engagement;
  bucket.posts += 1;
  bucket.likes += likes;
  bucket.comments += comments;
  bucket.shares += shares;

  const hook = classifyHook(caption);
  if (!hookBuckets.has(hook.id)) {
    hookBuckets.set(hook.id, { id: hook.id, label: hook.label, posts: 0, totalLikes: 0, totalComments: 0, totalShares: 0, totalEngagement: 0 });
  }
  const hb = hookBuckets.get(hook.id);
  hb.posts += 1;
  hb.totalLikes += likes;
  hb.totalComments += comments;
  hb.totalShares += shares;
  hb.totalEngagement += engagement;
}

// --- Views Over Time series: sort ascending by date, format label "MMM DD" ---
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const sortedDates = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));

// Split into "current" (most recent half) vs "previous" (older half) for the
// recharts dual-line shape established A.14e D-4. With only 42 posts spanning
// ~Apr 2025 → Sep 2025, we plot all dates on one line and leave "previous" as
// null (legend hides it) — honest representation, not synthesized comparison.
const viewsOverTime = sortedDates.map((b) => {
  const [y, m, d] = b.date.split('-').map((s) => parseInt(s, 10));
  return {
    date: `${MONTHS[m - 1]} ${String(d).padStart(2, '0')}`,
    isoDate: b.date,
    current: b.engagement,
    previous: null, // honest — no prior-period data in source
    posts: b.posts,
    likes: b.likes,
    comments: b.comments,
    shares: b.shares,
  };
});

// --- Hook Performance: avg engagement per post per hook, sorted by avg desc ---
const hookPerformance = Array.from(hookBuckets.values())
  .map((h) => {
    const avgEngagement = h.posts > 0 ? h.totalEngagement / h.posts : 0;
    const avgLikes = h.posts > 0 ? h.totalLikes / h.posts : 0;
    const avgComments = h.posts > 0 ? h.totalComments / h.posts : 0;
    return {
      id: h.id,
      label: h.label,
      posts: h.posts,
      avgEngagement: Math.round(avgEngagement * 10) / 10,
      avgLikes: Math.round(avgLikes * 10) / 10,
      avgComments: Math.round(avgComments * 10) / 10,
      totalEngagement: h.totalEngagement,
    };
  })
  .sort((a, b) => b.avgEngagement - a.avgEngagement);

const out = {
  generatedAt: new Date().toISOString(),
  source:
    'julz-vault/01-WORK-CURRENT/social-media/tiktok_data_enhanced.csv',
  notes: [
    'CSV has no views column — y-axis is engagement (likes + comments + shares).',
    'Hook classifier is keyword-based on first ~80 chars of CAPTION.',
    'previous-period series is null (only one period of data exists).',
  ],
  totals: {
    posts: totalPosts,
    likes: totalLikes,
    comments: totalComments,
    shares: totalShares,
    engagement: totalLikes + totalComments + totalShares,
    dateRange: viewsOverTime.length
      ? {
          start: viewsOverTime[0].isoDate,
          end: viewsOverTime[viewsOverTime.length - 1].isoDate,
        }
      : null,
  },
  viewsOverTime,
  hookPerformance,
};

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');

console.log(`[build-tiktok-analytics] wrote ${OUT_PATH}`);
console.log(
  `  posts=${out.totals.posts} likes=${out.totals.likes} comments=${out.totals.comments} shares=${out.totals.shares}`
);
console.log(
  `  viewsOverTime points=${viewsOverTime.length} (${out.totals.dateRange?.start} → ${out.totals.dateRange?.end})`
);
console.log(`  hookPerformance buckets=${hookPerformance.length}`);
for (const h of hookPerformance) {
  console.log(`    - ${h.label.padEnd(24)} posts=${h.posts}  avgEngagement=${h.avgEngagement}`);
}
