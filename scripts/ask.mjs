#!/usr/bin/env node
/**
 * ask.mjs — A.14t T7 AI Q&A search engine over Julz's UGC data (localhost CLI)
 *
 * Reads available UGC data (sideshift messages, brand-fit scores, drafts,
 * campaigns, mock-data campaigns index, UGC OS top-200, outreach templates
 * top-100), composes a system prompt with Tier-1 canonical voice + cite-or-
 * say-so rules, calls Anthropic SDK, prints the markdown answer to stdout
 * and optionally appends Q&A to data/ask-history.jsonl.
 *
 * Pattern: clones structure of `scripts/draft-sideshift-replies.mjs` (SDK
 * usage, spend ledger, fence-stripping) and `scripts/parse-sow.mjs` (arg
 * parsing, --help, --dry-run, spend-cap-before-call).
 *
 * Hard rules applied:
 *   HR-1  CITE: every data source loaded is cited inline in the system prompt
 *               by filename. Answer must cite filenames or admit absence.
 *   HR-10 ACCESS HONESTY: errors loudly if ANTHROPIC_API_KEY missing,
 *                          exits 0 with remediation rather than 1, per spec.
 *   HR-21 CITE = INVOKE: skills frontend-design, senior-backend, claude-api,
 *                        superpowers:verification-before-completion (cited
 *                        in parent agent boot).
 *   HR-34 VERIFY OWN WRITES: jsonl appends followed by Read-verify.
 *   HR-35 ONEDRIVE BUILD-LOCK: caller (build step) rm -rf .next before build.
 *   HR-36 COMMIT IMMEDIATELY: caller (build step) git commit + push.
 *
 * Env:
 *   ANTHROPIC_API_KEY   required for real runs
 *   ANTHROPIC_MODEL     default claude-opus-4-7-20260101
 *   MAX_DAILY_USD       default 5 (T7 spec-locked)
 *   REPO_ROOT_OVERRIDE  default: derived from __dirname/..
 *
 * Usage:
 *   npm run ask -- "Which brands haven't replied in over a week?"
 *   npm run ask -- "Summarize ParakeetAI's SOW" --save
 *   npm run ask -- --help
 *   npm run ask -- "test query" --dry-run
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = process.env.REPO_ROOT_OVERRIDE
  ? path.resolve(process.env.REPO_ROOT_OVERRIDE)
  : path.resolve(__dirname, '..');

// ----------------------------------------------------------------------------
// arg parsing — supports positional query + --save + --dry-run + --help
// ----------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { _: [] };
  for (const raw of argv.slice(2)) {
    if (raw === '--help' || raw === '-h') { args.help = true; continue; }
    if (raw === '--dry-run') { args.dryRun = true; continue; }
    if (raw === '--save') { args.save = true; continue; }
    const eq = raw.indexOf('=');
    if (raw.startsWith('--') && eq > 0) {
      args[raw.slice(2, eq)] = raw.slice(eq + 1);
    } else if (raw.startsWith('--')) {
      args[raw.slice(2)] = true;
    } else {
      args._.push(raw);
    }
  }
  return args;
}

const ARGS = parseArgs(process.argv);

const HELP_TEXT = `
ask.mjs — A.14t T7 AI Q&A search engine over your UGC data

USAGE
  npm run ask -- "<your question>" [--save] [--dry-run]
  npm run ask -- --help

ARGUMENTS
  "<your question>"   Positional query string. Wrap in quotes for multi-word.

OPTIONAL
  --save              Append Q&A to data/ask-history.jsonl
  --dry-run           Skip Anthropic API call. Validate inputs + show context size.
  --help, -h          Show this message.

ENV
  ANTHROPIC_API_KEY   Required for non-dry-run. If missing, script exits 0
                      with remediation steps (no crash).
  ANTHROPIC_MODEL     Default: claude-opus-4-7-20260101
  MAX_DAILY_USD       Default: 5  (script aborts if today's spend ≥ cap)

DATA SOURCES (auto-loaded, cited inline in the system prompt)
  - data/sideshift-messages.jsonl     (last 30 inbound+outbound messages)
  - data/brand-fit-scores.jsonl       (if exists)
  - data/sideshift-drafts.jsonl       (if exists)
  - data/campaigns-created.jsonl      (if exists)
  - lib/mock-data/campaigns/index.ts  (head — campaign registry shape)
  - UGC/_meta/00-operating-system.md  (top 200 lines)
  - UGC/_meta/09-outreach-templates.md (top 100 lines)

EXAMPLES
  npm run ask -- "Which brands haven't replied in over a week?"
  npm run ask -- "What's my highest-paying active campaign?" --save
  npm run ask -- "Summarize ParakeetAI's SOW"
  npm run ask -- "Which @geezjulz pillar performs best?" --save
`.trimStart();

if (ARGS.help) {
  process.stdout.write(HELP_TEXT);
  process.exit(0);
}

// ----------------------------------------------------------------------------
// config
// ----------------------------------------------------------------------------

const QUERY = (ARGS._[0] ?? '').trim();
const MAX_DAILY_USD = Number(process.env.MAX_DAILY_USD ?? 5);
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-7-20260101';

const DATA_DIR = path.join(REPO_ROOT, 'data');
const HISTORY_PATH = path.join(DATA_DIR, 'ask-history.jsonl');
const SPEND_LEDGER = path.join(REPO_ROOT, 'scripts', 'cron-output', 'ask-spend.jsonl');
const RUN_ID = `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;

const UGC_ROOT = 'C:/Users/julia/OneDrive/Desktop/UGC';
const SIDESHIFT_MESSAGES_PATH = path.join(DATA_DIR, 'sideshift-messages.jsonl');
const BRAND_FIT_PATH = path.join(DATA_DIR, 'brand-fit-scores.jsonl');
const SIDESHIFT_DRAFTS_PATH = path.join(DATA_DIR, 'sideshift-drafts.jsonl');
const CAMPAIGNS_CREATED_PATH = path.join(DATA_DIR, 'campaigns-created.jsonl');
const CAMPAIGNS_INDEX_PATH = path.join(REPO_ROOT, 'lib', 'mock-data', 'campaigns', 'index.ts');
const UGC_OS_PATH = path.join(UGC_ROOT, '_meta', '00-operating-system.md');
const OUTREACH_PATH = path.join(UGC_ROOT, '_meta', '09-outreach-templates.md');

// Pricing per 1M tokens — matches draft-sideshift-replies.mjs (HR-1: cite source).
const PRICING = {
  'claude-opus-4-5-20250929':    { input: 15, output: 75 },
  'claude-opus-4-7-20260101':    { input: 15, output: 75 },
  'claude-sonnet-4-5-20250929':  { input: 3,  output: 15 },
  default:                       { input: 15, output: 75 },
};

// ----------------------------------------------------------------------------
// logging
// ----------------------------------------------------------------------------

function log(level, ...parts) {
  const line = `[${new Date().toISOString()}] [${level}] ${parts.join(' ')}`;
  console.error(line); // stderr so stdout stays clean for the answer
}
const info = (...p) => log('INFO', ...p);
const warn = (...p) => log('WARN', ...p);
const err = (...p) => log('ERROR', ...p);

// ----------------------------------------------------------------------------
// file readers (all graceful — return empty/null on ENOENT, per HR-10 honesty)
// ----------------------------------------------------------------------------

async function safeReadFile(p, maxBytes = 60_000) {
  try {
    const raw = await fs.readFile(p, 'utf8');
    return raw.length > maxBytes ? raw.slice(0, maxBytes) + '\n…[truncated]' : raw;
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    warn(`safeReadFile ${p} failed:`, e.message);
    return null;
  }
}

async function readJsonl(p) {
  const raw = await safeReadFile(p, 1_000_000);
  if (!raw) return [];
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      try { return JSON.parse(l); } catch { return null; }
    })
    .filter(Boolean);
}

async function readFirstNLines(p, n) {
  const raw = await safeReadFile(p, 200_000);
  if (!raw) return null;
  return raw.split('\n').slice(0, n).join('\n');
}

// ----------------------------------------------------------------------------
// context builder — RAG-lite
// ----------------------------------------------------------------------------

function summarizeSideshiftMessages(rows, limit = 30) {
  // Keep last N by ts (most recent first, then re-reverse for chronological reading).
  const sorted = [...rows]
    .filter((r) => r && r.brand)
    .sort((a, b) => String(b.ts ?? '').localeCompare(String(a.ts ?? '')))
    .slice(0, limit);
  return sorted.map((r) => ({
    id: r.id,
    brand: r.brand,
    campaign_title: r.campaign_title ?? '',
    direction: r.direction,
    status: r.status,
    ts: r.ts,
    preview: (r.last_message_preview ?? r.message_text ?? '').slice(0, 240),
  }));
}

async function buildContext() {
  const ctx = {};

  const sideshiftMessages = await readJsonl(SIDESHIFT_MESSAGES_PATH);
  ctx.sideshift_messages = {
    source: 'data/sideshift-messages.jsonl',
    total_count: sideshiftMessages.length,
    last_30: summarizeSideshiftMessages(sideshiftMessages, 30),
  };

  const brandFit = await readJsonl(BRAND_FIT_PATH);
  ctx.brand_fit_scores = {
    source: 'data/brand-fit-scores.jsonl',
    total_count: brandFit.length,
    rows: brandFit.slice(0, 50),
  };

  const drafts = await readJsonl(SIDESHIFT_DRAFTS_PATH);
  ctx.sideshift_drafts = {
    source: 'data/sideshift-drafts.jsonl',
    total_count: drafts.length,
    rows: drafts.slice(0, 30).map((d) => ({
      id: d.id,
      brand: d.brand,
      template_used: d.template_used,
      generated_at: d.generated_at,
      draft_preview: (d.draft_text ?? '').slice(0, 240),
    })),
  };

  const campaignsCreated = await readJsonl(CAMPAIGNS_CREATED_PATH);
  ctx.campaigns_created = {
    source: 'data/campaigns-created.jsonl',
    total_count: campaignsCreated.length,
    rows: campaignsCreated.slice(0, 30),
  };

  const campaignsIndex = await safeReadFile(CAMPAIGNS_INDEX_PATH, 6_000);
  ctx.campaigns_registry = {
    source: 'lib/mock-data/campaigns/index.ts (head)',
    content: campaignsIndex ?? '_(file not found)_',
  };

  const ugcOs = await readFirstNLines(UGC_OS_PATH, 200);
  ctx.ugc_operating_system = {
    source: 'UGC/_meta/00-operating-system.md (top 200 lines)',
    content: ugcOs ?? '_(file not found — source-of-truth missing)_',
  };

  const outreach = await readFirstNLines(OUTREACH_PATH, 100);
  ctx.outreach_templates = {
    source: 'UGC/_meta/09-outreach-templates.md (top 100 lines)',
    content: outreach ?? '_(file not found)_',
  };

  return ctx;
}

// ----------------------------------------------------------------------------
// system prompt — Tier-1 voice + cite-or-say-so
// ----------------------------------------------------------------------------

function buildSystemPrompt(ctx) {
  const dataBlock = Object.entries(ctx)
    .map(([key, val]) => {
      if (val.content) {
        return `### ${key} (source: ${val.source})\n\n${val.content}`;
      }
      if (Array.isArray(val.rows) || Array.isArray(val.last_30)) {
        const rows = val.rows ?? val.last_30 ?? [];
        return `### ${key} (source: ${val.source}, total_count=${val.total_count})\n\n${JSON.stringify(rows, null, 2)}`;
      }
      return `### ${key} (source: ${val.source})\n\n${JSON.stringify(val, null, 2)}`;
    })
    .join('\n\n---\n\n');

  return `You are Julz Silla's AI assistant. You know her UGC business inside out.

Tier-1 canonical voice (applies to every answer):
  clear · structured · strategic · practical · polished · bold · semi-casual ·
  punchy · high-standard. Bestie + direct. No fluff. Short over long.

Banned: "Hey guys" · overpromise language · hardship reveals.

ANSWER RULES (HR-1 cite-or-creep, HR-10 access-honesty, HR-30 TL;DR-at-top):

1. Answer using ONLY the data provided below. If the answer isn't in the data,
   say so honestly and tell Julz exactly what data she'd need to add (file path
   + what content).

2. Cite sources by filename whenever you reference a fact (e.g., "per
   data/sideshift-messages.jsonl, Tsenta last replied 2026-05-26").

3. Open every answer with a 2-line TL;DR (state of play in 1 sentence + the
   one action Julz should take if any). Then the detail.

4. Format as markdown. Use tables for comparisons. Use lists for actions.
   No emoji-spam — one or two at most for section markers if useful.

5. If Julz asks something ambiguous, give the smallest-interpretation answer
   FIRST and offer the broader interpretation as a follow-up question.

--- DATA AVAILABLE ---

${dataBlock}

--- END DATA ---`;
}

// ----------------------------------------------------------------------------
// spend ledger
// ----------------------------------------------------------------------------

async function readSpendToday() {
  try {
    const raw = await fs.readFile(SPEND_LEDGER, 'utf8');
    const today = new Date().toISOString().slice(0, 10);
    return raw
      .split('\n')
      .filter(Boolean)
      .map((l) => { try { return JSON.parse(l); } catch { return null; } })
      .filter((r) => r && r.ts?.startsWith(today))
      .reduce((sum, r) => sum + (r.cost_usd ?? 0), 0);
  } catch (e) {
    if (e.code === 'ENOENT') return 0;
    throw e;
  }
}

async function appendSpend(entry) {
  await fs.mkdir(path.dirname(SPEND_LEDGER), { recursive: true });
  await fs.appendFile(SPEND_LEDGER, JSON.stringify(entry) + '\n', 'utf8');
}

function priceUsd({ inputTokens, outputTokens, model }) {
  const p = PRICING[model] ?? PRICING.default;
  return (inputTokens / 1_000_000) * p.input + (outputTokens / 1_000_000) * p.output;
}

// ----------------------------------------------------------------------------
// Anthropic call (lazy-imported so --dry-run + missing-key cases work)
// ----------------------------------------------------------------------------

async function callClaude({ systemPrompt, query }) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 4_000,
    system: systemPrompt,
    messages: [{ role: 'user', content: query }],
  });

  let text = '';
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
      text += chunk.delta.text;
    }
  }
  const final = await stream.finalMessage();
  const usage = final.usage ?? { input_tokens: 0, output_tokens: 0 };
  return { text: text.trim(), usage, sessionId: final.id };
}

// ----------------------------------------------------------------------------
// history append + verify (HR-34)
// ----------------------------------------------------------------------------

async function appendHistory(entry) {
  await fs.mkdir(path.dirname(HISTORY_PATH), { recursive: true });
  await fs.appendFile(HISTORY_PATH, JSON.stringify(entry) + '\n', 'utf8');
  // Read-verify (HR-34): confirm last line matches what we wrote.
  const raw = await fs.readFile(HISTORY_PATH, 'utf8');
  const lines = raw.split('\n').filter(Boolean);
  const last = lines[lines.length - 1];
  if (!last || !last.includes(entry.run_id)) {
    throw new Error(`HR-34 verify failed: last line of ${HISTORY_PATH} does not contain run_id ${entry.run_id}`);
  }
}

// ----------------------------------------------------------------------------
// main
// ----------------------------------------------------------------------------

async function main() {
  // Validate query
  if (!QUERY) {
    err('No question provided. Run with --help for usage.');
    process.stdout.write(HELP_TEXT);
    return 2;
  }

  info(`run_id=${RUN_ID} dry_run=${!!ARGS.dryRun} save=${!!ARGS.save} model=${MODEL}`);
  info(`query: ${QUERY.slice(0, 120)}${QUERY.length > 120 ? '…' : ''}`);

  // Build context
  const ctx = await buildContext();
  const systemPrompt = buildSystemPrompt(ctx);
  info(`context built: system_prompt_chars=${systemPrompt.length}`);

  // Dry-run short-circuit
  if (ARGS.dryRun) {
    info('--dry-run: skipping Anthropic call, skipping any write.');
    process.stdout.write(`\nDRY RUN PASS — query="${QUERY}" context_chars=${systemPrompt.length}\n`);
    process.stdout.write(`Context sources loaded:\n`);
    for (const [k, v] of Object.entries(ctx)) {
      process.stdout.write(`  - ${k}: ${v.source} (count=${v.total_count ?? 'n/a'})\n`);
    }
    return 0;
  }

  // API key check — HR-10 access honesty, exit 0 with remediation per spec
  if (!process.env.ANTHROPIC_API_KEY) {
    process.stdout.write(`
ANTHROPIC_API_KEY not set — cannot answer your question.

To fix:
  1. Get a key at https://console.anthropic.com/settings/keys
  2. PowerShell: $env:ANTHROPIC_API_KEY = "sk-ant-..."
     Bash:       export ANTHROPIC_API_KEY="sk-ant-..."
  3. Re-run: npm run ask -- "${QUERY}"

Or run with --dry-run to inspect the context Claude would receive.
`);
    return 0;
  }

  // Spend cap
  const spentToday = await readSpendToday();
  info(`spent_today_usd=${spentToday.toFixed(4)} cap=$${MAX_DAILY_USD}`);
  if (spentToday >= MAX_DAILY_USD) {
    err(`Daily spend cap reached ($${spentToday.toFixed(2)} >= $${MAX_DAILY_USD}). Aborting.`);
    process.stdout.write(`\nDaily spend cap reached — try again tomorrow or raise MAX_DAILY_USD.\n`);
    return 1;
  }

  // Real call
  info(`calling Claude API (${MODEL})…`);
  const { text, usage, sessionId } = await callClaude({ systemPrompt, query: QUERY });

  const costUsd = priceUsd({
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    model: MODEL,
  });
  await appendSpend({
    ts: new Date().toISOString(),
    run_id: RUN_ID,
    query_preview: QUERY.slice(0, 120),
    model: MODEL,
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    cost_usd: costUsd,
    claude_session_id: sessionId,
  });
  info(`spend=$${costUsd.toFixed(4)} in=${usage.input_tokens} out=${usage.output_tokens} session=${sessionId}`);

  // Print answer to stdout (clean — logs go to stderr)
  process.stdout.write('\n' + text + '\n\n');
  process.stdout.write(`---\n_cost: $${costUsd.toFixed(4)} · model: ${MODEL} · session: ${sessionId}_\n`);

  // Optional save
  if (ARGS.save) {
    await appendHistory({
      ts: new Date().toISOString(),
      run_id: RUN_ID,
      query: QUERY,
      answer: text,
      model: MODEL,
      cost_estimate_usd: costUsd,
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
      claude_session_id: sessionId,
    });
    info(`saved Q&A to ${HISTORY_PATH}`);
  }

  return 0;
}

main()
  .then((code) => process.exit(code ?? 0))
  .catch((e) => {
    err('FATAL:', e?.stack ?? String(e));
    process.exit(1);
  });
