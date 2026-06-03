#!/usr/bin/env node
/**
 * jsonl-to-json.mjs — emit importable .json array siblings for the real-data
 * JSONL files, so components can `import rows from '@/data/x.json'` at build time
 * (static export). JSONL itself isn't importable; this bridges that.
 *
 * Skips schema/header lines (the first line of some JSONL files is metadata, not
 * a record). HR-49 (real data) · HR-10 (no fabrication — pure passthrough).
 * Run: node scripts/jsonl-to-json.mjs   (idempotent; safe to re-run after polls)
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const REPO = path.resolve(
  path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'),
  '..',
);
const DATA = path.join(REPO, 'data');

// key = a field every REAL record has (header lines lack it → skipped). null = keep all non-header lines.
const TARGETS = [
  { in: 'brands-canonical.jsonl', out: 'brands-canonical.json', key: 'brand_id' },
  { in: 'sideshift-messages.jsonl', out: 'sideshift-messages.json', key: 'id' },
  { in: 'brand-fit-scores.jsonl', out: 'brand-fit-scores.json', key: null },
  { in: 'tiktok-posts.jsonl', out: 'tiktok-posts.json', key: null },
  { in: 'assets-recent.jsonl', out: 'assets-recent.json', key: null },
];

let ok = 0;
for (const t of TARGETS) {
  let raw;
  try {
    raw = await fs.readFile(path.join(DATA, t.in), 'utf8');
  } catch {
    console.log(`skip (missing): ${t.in}`);
    continue;
  }
  const rows = [];
  for (const line of raw.split(/\r?\n/)) {
    const s = line.trim();
    if (!s) continue;
    let o;
    try {
      o = JSON.parse(s);
    } catch {
      continue;
    }
    if (o && o._schema) continue; // explicit schema header
    if (t.key && !(t.key in o)) continue; // header line for keyed files (e.g. canonical's note row)
    if (!t.key && o.note && o.schema_version && Object.keys(o).length <= 4) continue; // generic header heuristic
    rows.push(o);
  }
  await fs.writeFile(path.join(DATA, t.out), JSON.stringify(rows, null, 2), 'utf8');
  console.log(`${t.in} -> ${t.out}: ${rows.length} records`);
  ok++;
}
console.log(`[jsonl-to-json] wrote ${ok} files.`);
