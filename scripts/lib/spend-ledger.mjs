// spend-ledger.mjs
// Daily Anthropic API spend tracking for dashboard-comment cron pipeline.
// Append-only JSONL at scripts/cron-output/spend-ledger.jsonl
// HR-25/26 compliant: problem (overspend) ships with solution (capExceeded gate).

import { readFile, appendFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LEDGER_PATH = resolve(__dirname, '..', 'cron-output', 'spend-ledger.jsonl');

function todayBucket() {
  // YYYY-MM-DD in UTC to avoid timezone drift across cron runs
  return new Date().toISOString().slice(0, 10);
}

async function ensureLedgerDir() {
  const dir = dirname(LEDGER_PATH);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

/**
 * Read all entries for today's UTC bucket.
 * @returns {Promise<Array<{ts:string, date:string, tokens:number, usd:number, model:string, run_id:string}>>}
 */
export async function readToday() {
  await ensureLedgerDir();
  if (!existsSync(LEDGER_PATH)) return [];
  const raw = await readFile(LEDGER_PATH, 'utf8');
  const bucket = todayBucket();
  const lines = raw.split('\n').filter(Boolean);
  const entries = [];
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      if (entry.date === bucket) entries.push(entry);
    } catch {
      // Skip malformed lines — ledger is append-only and best-effort.
    }
  }
  return entries;
}

/**
 * Append a single spend entry.
 * @param {{tokens:number, usd:number, model:string, run_id:string}} entry
 */
export async function append({ tokens, usd, model, run_id }) {
  if (typeof tokens !== 'number' || typeof usd !== 'number') {
    throw new TypeError('append() requires numeric tokens and usd');
  }
  if (!model || !run_id) {
    throw new TypeError('append() requires model and run_id strings');
  }
  await ensureLedgerDir();
  const record = {
    ts: new Date().toISOString(),
    date: todayBucket(),
    tokens,
    usd,
    model,
    run_id,
  };
  await appendFile(LEDGER_PATH, JSON.stringify(record) + '\n', 'utf8');
  return record;
}

/**
 * Check whether today's spend has exceeded the cap.
 * @param {number} maxUsd
 * @returns {Promise<{exceeded:boolean, spentUsd:number, remainingUsd:number, entries:number}>}
 */
export async function capExceeded(maxUsd) {
  if (typeof maxUsd !== 'number' || maxUsd < 0) {
    throw new TypeError('capExceeded() requires non-negative numeric maxUsd');
  }
  const today = await readToday();
  const spentUsd = today.reduce((sum, e) => sum + (e.usd || 0), 0);
  return {
    exceeded: spentUsd >= maxUsd,
    spentUsd,
    remainingUsd: Math.max(0, maxUsd - spentUsd),
    entries: today.length,
  };
}

export const _internals = { LEDGER_PATH, todayBucket };
