#!/usr/bin/env node
/**
 * import-real-data.mjs — A.AA Wave B0: source REAL data into the dashboard.
 *
 * Julz directive: "no mock anything, need real data" + "source ALL real data first".
 * Pulls the two real on-disk sources that aren't in the repo yet:
 *   1. @geezjulz TikTok (42 real posts) — julz-vault CSV → data/tiktok-posts.jsonl (+ aggregates)
 *   2. Asset library (15,383 files) — ASSET-LIBRARY/MANIFEST.jsonl → data/assets-summary.json + data/assets-recent.jsonl
 *
 * HR-10: only real values; no invention. HR-49: feeds the no-mock wiring (B1).
 * Idempotent: overwrites the generated files each run. Run: node scripts/import-real-data.mjs
 */
import { promises as fs } from 'node:fs';
import { createReadStream } from 'node:fs';
import readline from 'node:readline';
import path from 'node:path';

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const DATA = path.join(REPO, 'data');
const TIKTOK_CSV = 'C:/Users/julia/OneDrive/Desktop/julz-vault/01-WORK-CURRENT/social-media/tiktok_data_enhanced.csv';
const ASSET_MANIFEST = 'C:/Users/julia/OneDrive/Desktop/ASSET-LIBRARY/MANIFEST.jsonl';

// ---- minimal RFC-4180 CSV parser (handles quoted fields w/ commas + escaped quotes) ----
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\r') { /* skip */ }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const num = (v) => { const n = Number(String(v ?? '').replace(/[^0-9.\-]/g, '')); return Number.isFinite(n) ? n : 0; };

async function importTikTok() {
  let raw;
  try { raw = await fs.readFile(TIKTOK_CSV, 'utf8'); }
  catch { console.error('[tiktok] CSV not found — skipping:', TIKTOK_CSV); return null; }
  const rows = parseCSV(raw).filter(r => r.some(c => String(c).trim() !== ''));
  const headers = rows[0].map(h => h.trim());
  const idx = (name) => headers.findIndex(h => h.toLowerCase() === name.toLowerCase());
  const H = {
    url: idx('Helper: Original URL'), date: idx('Helper: Original Publish Date (PT)'),
    caption: idx('CAPTION'), likes: idx('LIKES'), comments: idx('COMMENTS'), shares: idx('SHARES'),
    hashtags: idx('HASHTAGS'), pillar: idx('PILLAR'), cta: idx('CTA OR LINK'),
    platform: idx('PLATFORM'), postType: idx('POST TYPE'), dur: idx('Helper: Duration (sec)'),
    file: idx('Helper: Video Filename'),
  };
  const posts = [];
  for (const r of rows.slice(1)) {
    const url = (r[H.url] ?? '').trim();
    const m = url.match(/video\/(\d+)/);
    const caption = (r[H.caption] ?? '').trim();
    if (!url && !caption) continue;
    posts.push({
      post_id: m ? m[1] : '',
      url,
      date: (r[H.date] ?? '').trim(),
      caption,
      likes: num(r[H.likes]), comments: num(r[H.comments]), shares: num(r[H.shares]),
      hashtags: (r[H.hashtags] ?? '').split(',').map(s => s.trim()).filter(Boolean),
      pillar: (r[H.pillar] ?? '').trim() || 'Unclassified',
      cta: (r[H.cta] ?? '').trim(),
      platform: (r[H.platform] ?? 'TikTok').trim(),
      post_type: (r[H.postType] ?? '').trim(),
      duration_sec: num(r[H.dur]),
      video_filename: (r[H.file] ?? '').trim(),
    });
  }
  // aggregates by pillar
  const byPillar = {};
  for (const p of posts) {
    const k = p.pillar;
    byPillar[k] ??= { pillar: k, posts: 0, likes: 0, comments: 0, shares: 0 };
    byPillar[k].posts++; byPillar[k].likes += p.likes; byPillar[k].comments += p.comments; byPillar[k].shares += p.shares;
  }
  const totals = posts.reduce((a, p) => ({ likes: a.likes + p.likes, comments: a.comments + p.comments, shares: a.shares + p.shares }), { likes: 0, comments: 0, shares: 0 });
  const summary = {
    _generated: 'import-real-data.mjs', source: 'julz-vault tiktok_data_enhanced.csv (REAL @geezjulz)',
    total_posts: posts.length, ...totals,
    avg_engagement_per_post: posts.length ? Math.round((totals.likes + totals.comments + totals.shares) / posts.length) : 0,
    by_pillar: Object.values(byPillar).sort((a, b) => b.likes - a.likes),
    top_posts: [...posts].sort((a, b) => b.likes - a.likes).slice(0, 8).map(p => ({ post_id: p.post_id, caption: p.caption.slice(0, 80), likes: p.likes, comments: p.comments, shares: p.shares, pillar: p.pillar, url: p.url })),
  };
  await fs.writeFile(path.join(DATA, 'tiktok-posts.jsonl'), posts.map(p => JSON.stringify(p)).join('\n') + '\n', 'utf8');
  await fs.writeFile(path.join(DATA, 'tiktok-summary.json'), JSON.stringify(summary, null, 2), 'utf8');
  console.log(`[tiktok] ${posts.length} posts → data/tiktok-posts.jsonl · likes=${totals.likes} comments=${totals.comments} shares=${totals.shares} · ${summary.by_pillar.length} pillars`);
  return summary;
}

async function importAssets() {
  let exists = true;
  try { await fs.access(ASSET_MANIFEST); } catch { exists = false; }
  if (!exists) { console.error('[assets] manifest not found — skipping:', ASSET_MANIFEST); return null; }
  const rl = readline.createInterface({ input: createReadStream(ASSET_MANIFEST, 'utf8'), crlfDelay: Infinity });
  let total = 0, media = 0, totalMb = 0;
  const byType = {}, byContent = {}, byMonth = {};
  const recent = [];
  for await (const line of rl) {
    const t = line.trim(); if (!t) continue; total++;
    let o; try { o = JSON.parse(t); } catch { continue; }
    if (!o.type || o.type === 'excluded') continue;
    media++;
    const mb = Number(o.size_mb) || 0; totalMb += mb;
    byType[o.type] = (byType[o.type] || 0) + 1;
    if (o.content_type) byContent[o.content_type] = (byContent[o.content_type] || 0) + 1;
    const mo = (o.date_taken_iso || '').slice(0, 7); if (mo) byMonth[mo] = (byMonth[mo] || 0) + 1;
    recent.push({
      name: o.filename || (o.full_path ? path.basename(o.full_path) : 'file'),
      type: o.type, content_type: o.content_type || '', size_mb: mb,
      date: o.date_taken_iso || '', duration_sec: o.duration_sec || null,
      transcript_excerpt: (o.transcript_excerpt || '').slice(0, 140),
    });
  }
  recent.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const summary = {
    _generated: 'import-real-data.mjs', source: 'ASSET-LIBRARY/MANIFEST.jsonl (REAL)',
    manifest_rows: total, media_files: media, total_gb: Math.round(totalMb / 1024 * 10) / 10,
    by_type: byType, by_content_type: byContent,
    by_month: Object.fromEntries(Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 12)),
  };
  await fs.writeFile(path.join(DATA, 'assets-summary.json'), JSON.stringify(summary, null, 2), 'utf8');
  await fs.writeFile(path.join(DATA, 'assets-recent.jsonl'), recent.slice(0, 60).map(r => JSON.stringify(r)).join('\n') + '\n', 'utf8');
  console.log(`[assets] ${media} real media of ${total} rows · ${summary.total_gb}GB · types=${JSON.stringify(byType)}`);
  return summary;
}

(async () => {
  await fs.mkdir(DATA, { recursive: true });
  await importTikTok();
  await importAssets();
  console.log('[import-real-data] done.');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
