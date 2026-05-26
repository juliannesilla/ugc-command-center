#!/usr/bin/env node
/**
 * score-brand-fit.mjs — A.14s S4 Anthropic-driven brand-fit triage scorer
 *
 * Reads data/sideshift-messages.jsonl, scores each unscored thread_id 1-10
 * against Julz Silla's UGC creator brand-fit rubric, appends results to
 * data/brand-fit-scores.jsonl. Idempotent — skips already-scored thread_ids.
 *
 * Voice/niche anchor (cited HR-1):
 *   - UGC/_meta/00-operating-system.md — Tier-1 canonical voice
 *   - UGC/_meta/09-outreach-templates.md — niche + intake context
 *
 * Hard rules applied:
 *   HR-10 ACCESS HONESTY — missing ANTHROPIC_API_KEY → clean exit 0 with remediation
 *   HR-15 verify artifact: --dry-run exits 0, prints what would happen
 *   HR-21 cite=invoke skills: frontend-design, claude-api, copywriting, verification-before-completion
 *   HR-26 problems ship with solutions — spend cap, dry-run short-circuit
 *   HR-27 decisions lock — paths confirmed: messages → data/sideshift-messages.jsonl,
 *         scores → data/brand-fit-scores.jsonl, spend → scripts/cron-output/brand-fit-spend.jsonl
 *
 * Env:
 *   ANTHROPIC_API_KEY    required (unless --dry-run)
 *   MAX_DAILY_USD        default 5 (per A.14s S4 spec)
 *   ANTHROPIC_MODEL      default claude-opus-4-7-20260101
 *
 * Flags:
 *   --dry-run            no API call, no writes
 *   --help               print usage
 *   --limit N            cap how many threads scored this run
 *
 * Usage:
 *   node scripts/score-brand-fit.mjs --dry-run
 *   node scripts/score-brand-fit.mjs
 *   node scripts/score-brand-fit.mjs --limit 5
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

// ----- args -------------------------------------------------------------
const argv = process.argv.slice(2);
const HELP = argv.includes('--help') || argv.includes('-h');
const DRY_RUN = argv.includes('--dry-run');
let LIMIT = Infinity;
{
  const i = argv.indexOf('--limit');
  if (i !== -1 && argv[i + 1]) {
    const n = Number(argv[i + 1]);
    if (Number.isFinite(n) && n > 0) LIMIT = n;
  }
}

if (HELP) {
  console.log(`score-brand-fit.mjs — A.14s S4 brand-fit scorer

Reads data/sideshift-messages.jsonl, scores each unscored thread 1-10 for
brand fit with Julz Silla's UGC creator profile via the Anthropic API.

Flags:
  --dry-run        no API call, no writes (preview only)
  --limit N        cap how many threads to score this run
  --help, -h       this message

Env:
  ANTHROPIC_API_KEY    required for real runs
  MAX_DAILY_USD        default 5
  ANTHROPIC_MODEL      default claude-opus-4-7-20260101

Output:
  data/brand-fit-scores.jsonl     append-only score ledger
  scripts/cron-output/brand-fit-spend.jsonl   $/day cap ledger
`);
  process.exit(0);
}

// ----- paths ------------------------------------------------------------
const MESSAGES_PATH = path.join(REPO_ROOT, 'data', 'sideshift-messages.jsonl');
const SCORES_PATH = path.join(REPO_ROOT, 'data', 'brand-fit-scores.jsonl');
const OUTPUT_DIR = path.join(REPO_ROOT, 'scripts', 'cron-output');
const SPEND_LEDGER = path.join(OUTPUT_DIR, 'brand-fit-spend.jsonl');

const MAX_DAILY_USD = Number(process.env.MAX_DAILY_USD ?? 5);
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-7-20260101';

// Claude Opus 4.x pricing per 1M tokens (matches draft-sideshift-replies pattern)
const PRICING = {
  'claude-opus-4-5-20250929':    { input: 15, output: 75 },
  'claude-opus-4-7-20260101':    { input: 15, output: 75 },
  'claude-sonnet-4-5-20250929':  { input: 3,  output: 15 },
  default:                       { input: 15, output: 75 },
};

const RUN_ID = `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;

// ----- logging ----------------------------------------------------------
function log(level, ...parts) {
  console.log(`[${new Date().toISOString()}] [${level}] ${parts.join(' ')}`);
}
const info = (...p) => log('INFO', ...p);
const warn = (...p) => log('WARN', ...p);
const err = (...p) => log('ERROR', ...p);

// ----- jsonl I/O --------------------------------------------------------
async function readJsonl(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const rows = [];
    for (const line of raw.split('\n')) {
      const t = line.trim();
      if (!t) continue;
      try {
        const obj = JSON.parse(t);
        // skip schema-header rows
        if (obj && typeof obj === 'object' && obj.schema && !obj.thread_id) continue;
        rows.push(obj);
      } catch {
        // skip malformed
      }
    }
    return rows;
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

async function appendJsonl(filePath, rows) {
  if (rows.length === 0) return;
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const body = rows.map((r) => JSON.stringify(r)).join('\n') + '\n';
  await fs.appendFile(filePath, body, 'utf8');
}

// ----- spend ledger -----------------------------------------------------
async function readSpendToday() {
  try {
    const raw = await fs.readFile(SPEND_LEDGER, 'utf8');
    const today = new Date().toISOString().slice(0, 10);
    return raw
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        try { return JSON.parse(line); } catch { return null; }
      })
      .filter(Boolean)
      .filter((row) => row.ts?.startsWith(today))
      .reduce((sum, row) => sum + (row.usd ?? 0), 0);
  } catch (e) {
    if (e.code === 'ENOENT') return 0;
    throw e;
  }
}

async function appendSpend(entry) {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.appendFile(SPEND_LEDGER, JSON.stringify(entry) + '\n', 'utf8');
}

function priceUsd({ inputTokens, outputTokens, model }) {
  const p = PRICING[model] ?? PRICING.default;
  return (inputTokens / 1_000_000) * p.input + (outputTokens / 1_000_000) * p.output;
}

// ----- prompt -----------------------------------------------------------
const SYSTEM_PROMPT = `You are a brand-fit triage scorer for Julz Silla, a UGC (user-generated content)
creator. Julz needs to triage a flood of inbound brand outreach 1-10 to know
what to reply to first.

JULZ'S PROFILE (Tier-1 canonical voice from UGC/_meta/00-operating-system.md):
  Voice: clear, structured, strategic, practical, polished, bold, semi-casual,
         punchy, high-standard. Bestie + direct. No fluff.
  On-camera UGC overlay (video deliverables only): dry funny, professional
         punk, slightly exasperated when appropriate.
  Bans: "Hey guys", overpromise language, hardship reveals that shift focus
        from the work.

NICHE FIT (from UGC/_meta/09-outreach-templates.md):
  STRONG    — AI / SaaS / B2B tech / dev tools / productivity
  MODERATE  — beauty / skincare / wellness (when product quality matches polish)
  CASE-BY-CASE — travel / lifestyle / consumer apps (depends on brand voice fit)
  WEAK      — fast fashion, MLM, gambling, anything requiring "Hey guys" energy,
              hardship-bait pivots, anti-feminist or culturally regressive briefs.

BRAND SAFETY:
  safe   — established brand, clear product, professional outreach
  review — unclear product / vague brief / new brand / needs more intake
  avoid  — red flags (scam patterns, unpaid "exposure" asks, MLM, ToS violations)

SCORING RUBRIC (1-10):
  9-10: STRONG niche match + safe + clear paid brief. Reply first.
  7-8:  Strong/moderate niche + safe + likely paid. Reply soon.
  4-6:  Moderate niche OR needs more intake to assess. Reply when bandwidth.
  1-3:  Weak niche, brand-safety concerns, or unpaid/exposure-only. Deprioritize.

OUTPUT FORMAT:
Return ONLY a JSON object (no markdown fences, no prose preamble):
{
  "score": 1-10,
  "reasoning": "one concise sentence — what drives the score",
  "niche_match": "strong" | "moderate" | "weak",
  "brand_safety": "safe" | "review" | "avoid"
}`;

function buildUserPrompt({ brand, messageText, campaignTitle }) {
  return `Brand: ${brand}
Campaign: ${campaignTitle || '(none specified)'}
Last message (excerpt):
"""
${(messageText ?? '').slice(0, 1500)}
"""

Score this brand 1-10 for fit with Julz's UGC creator profile. Return JSON only.`;
}

// ----- validation (manual, no Zod dep needed) ---------------------------
function validateScore(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('response not an object');
  }
  const score = Number(raw.score);
  if (!Number.isFinite(score) || score < 1 || score > 10) {
    throw new Error(`score out of range 1-10: ${raw.score}`);
  }
  const reasoning = String(raw.reasoning ?? '').trim();
  if (!reasoning) throw new Error('reasoning is empty');
  const niche = String(raw.niche_match ?? '').toLowerCase();
  if (!['strong', 'moderate', 'weak'].includes(niche)) {
    throw new Error(`niche_match invalid: ${raw.niche_match}`);
  }
  const safety = String(raw.brand_safety ?? '').toLowerCase();
  if (!['safe', 'review', 'avoid'].includes(safety)) {
    throw new Error(`brand_safety invalid: ${raw.brand_safety}`);
  }
  return {
    score: Math.round(score),
    reasoning,
    niche_match: niche,
    brand_safety: safety,
  };
}

// ----- Anthropic call (lazy import so --dry-run needs no key) -----------
async function scoreOne(client, msg) {
  const userPrompt = buildUserPrompt({
    brand: msg.brand,
    messageText: msg.message_text ?? msg.last_message_preview ?? '',
    campaignTitle: msg.campaign_title,
  });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  // Extract text from response content blocks
  let text = '';
  for (const block of response.content ?? []) {
    if (block.type === 'text') text += block.text;
  }

  // Strip code fences if present despite instructions
  let jsonText = text.trim();
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  }

  // Find first JSON object if model added prose
  const braceMatch = jsonText.match(/\{[\s\S]*\}/);
  if (braceMatch) jsonText = braceMatch[0];

  const parsed = JSON.parse(jsonText);
  const validated = validateScore(parsed);
  const usage = response.usage ?? { input_tokens: 0, output_tokens: 0 };
  return { validated, usage };
}

// ----- main -------------------------------------------------------------
async function main() {
  info(`run_id=${RUN_ID} dry_run=${DRY_RUN} model=${MODEL} limit=${LIMIT === Infinity ? 'none' : LIMIT}`);

  const messages = await readJsonl(MESSAGES_PATH);
  const existingScores = await readJsonl(SCORES_PATH);

  // Dedupe messages by thread_id — JSONL has many messages per thread
  const seenThreads = new Set();
  const uniqueByThread = [];
  for (const m of messages) {
    const tid = m.thread_id ?? m.id;
    if (!tid || seenThreads.has(tid)) continue;
    seenThreads.add(tid);
    uniqueByThread.push({ ...m, thread_id: tid });
  }

  const scoredThreadIds = new Set(
    existingScores.map((s) => s.thread_id).filter(Boolean),
  );
  const toScore = uniqueByThread.filter((m) => !scoredThreadIds.has(m.thread_id));
  const targets = toScore.slice(0, Number.isFinite(LIMIT) ? LIMIT : toScore.length);

  info(`messages_total=${messages.length} unique_threads=${uniqueByThread.length} already_scored=${scoredThreadIds.size} would_score=${targets.length}`);

  if (targets.length === 0) {
    info('Nothing to score — all threads already have brand-fit scores.');
    return 0;
  }

  // Rough cost estimate — Opus 4.7 at ~1200 input + 100 output tokens per call
  const estPerCall = priceUsd({ inputTokens: 1200, outputTokens: 100, model: MODEL });
  const estTotal = estPerCall * targets.length;
  info(`estimated cost: $${estTotal.toFixed(4)} ($${estPerCall.toFixed(5)}/call × ${targets.length})`);

  if (DRY_RUN) {
    info(`--dry-run: Would score ${targets.length} messages, ${scoredThreadIds.size} already scored, estimated cost $${estTotal.toFixed(4)}`);
    for (const m of targets.slice(0, 5)) {
      info(`  → would score: brand="${m.brand}" thread_id=${m.thread_id}`);
    }
    if (targets.length > 5) info(`  → ... and ${targets.length - 5} more`);
    return 0;
  }

  // HR-10 ACCESS HONESTY: missing key = clean exit with remediation
  if (!process.env.ANTHROPIC_API_KEY) {
    warn('ANTHROPIC_API_KEY not set — nothing scored.');
    warn('Remediation:');
    warn('  1. Set the key in your shell:  export ANTHROPIC_API_KEY=sk-ant-...');
    warn('  2. Or for a one-off run:        ANTHROPIC_API_KEY=sk-ant-... npm run score-brand-fit');
    warn('  3. Verify with --dry-run first: npm run score-brand-fit -- --dry-run');
    return 0;
  }

  // Spend cap check
  const spentToday = await readSpendToday();
  info(`spent_today_usd=$${spentToday.toFixed(4)} cap=$${MAX_DAILY_USD}`);
  if (spentToday >= MAX_DAILY_USD) {
    warn(`Daily spend cap reached ($${spentToday.toFixed(2)} >= $${MAX_DAILY_USD}); skipping run`);
    return 0;
  }

  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let success = 0;
  let failed = 0;
  let runSpendUsd = 0;

  for (const m of targets) {
    // Per-iteration cap re-check (safety against runaway)
    if (spentToday + runSpendUsd >= MAX_DAILY_USD) {
      warn(`Spend cap reached mid-run — stopping at ${success} scored.`);
      break;
    }

    try {
      const { validated, usage } = await scoreOne(client, m);
      const usd = priceUsd({
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        model: MODEL,
      });
      runSpendUsd += usd;

      const row = {
        thread_id: m.thread_id,
        brand: m.brand,
        score: validated.score,
        reasoning: validated.reasoning,
        niche_match: validated.niche_match,
        brand_safety: validated.brand_safety,
        scored_at: new Date().toISOString(),
        model: MODEL,
        run_id: RUN_ID,
        token_usage: {
          input_tokens: usage.input_tokens,
          output_tokens: usage.output_tokens,
          usd,
        },
      };
      await appendJsonl(SCORES_PATH, [row]);
      await appendSpend({
        ts: new Date().toISOString(),
        run_id: RUN_ID,
        thread_id: m.thread_id,
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
        usd,
        model: MODEL,
      });
      success += 1;
      info(`scored brand="${m.brand}" score=${validated.score} niche=${validated.niche_match} safety=${validated.brand_safety} usd=$${usd.toFixed(5)}`);
    } catch (e) {
      failed += 1;
      err(`failed to score thread_id=${m.thread_id} brand="${m.brand}": ${e?.message ?? String(e)}`);
    }
  }

  info(`done: success=${success} failed=${failed} run_spend=$${runSpendUsd.toFixed(4)}`);
  return failed > 0 && success === 0 ? 1 : 0;
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    err('FATAL:', e?.stack ?? String(e));
    process.exit(1);
  });
