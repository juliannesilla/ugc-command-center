#!/usr/bin/env node
/**
 * draft-sideshift-replies.mjs — Headless Claude API reply-draft generator (A.14l Wave 1)
 *
 * Reads data/sideshift-messages.jsonl, filters direction=inbound AND no existing draft,
 * calls Anthropic SDK with the system prompt at scripts/sideshift-draft-prompt.md
 * (Julz Tier-1 canonical voice + signature + 9 outreach templates referenced from
 * UGC/_meta/09-outreach-templates.md), and writes drafts to data/sideshift-drafts.jsonl.
 *
 * Owners: A14L-L2-S-DRAFT (this script + scripts/sideshift-draft-prompt.md).
 * Sibling owners:
 *   - L2-S-POLL: scripts/poll-sideshift.mjs (DO NOT TOUCH)
 *   - L2-S-DATA: lib/sideshift/* (DO NOT TOUCH — types inlined here as fallback)
 *   - L2-S-UI: detail-pane renderer (reads draft_text from sideshift-drafts.jsonl)
 *
 * Hard rules applied: HR-1 (cite — sourced from _meta/09-outreach-templates.md),
 * HR-15 (verify artifact: --dry-run exits 0, prompt template ≥100 lines),
 * HR-19 (source ≠ artifact — we test the script, not just file existence),
 * HR-21 (cite = invoke — claude-api skill, brand-voice:enforce-voice, copywriting),
 * HR-25 (skills sweep — all applicable skills loaded BEFORE coding),
 * HR-26 (problems ship with solutions — short-circuit before Anthropic call on dry-run,
 *        spend cap to prevent runaway costs, inline types if L2-S-DATA not landed),
 * HR-27 (decisions lock before build — file paths confirmed: data/sideshift-messages.jsonl
 *        input, data/sideshift-drafts.jsonl output, prompt at scripts/sideshift-draft-prompt.md),
 * HR-30 (TL;DR pattern — prompt instructs draft to apply TL;DR if 3+ paragraphs).
 *
 * Env:
 *   ANTHROPIC_API_KEY    required (unless --dry-run)
 *   MAX_DAILY_USD        default 15 (spec-locked)
 *   ANTHROPIC_MODEL      default claude-opus-4-7-20260101 (override via env)
 *
 * Usage:
 *   node scripts/draft-sideshift-replies.mjs            # real run (needs API key)
 *   node scripts/draft-sideshift-replies.mjs --dry-run  # no API call, no writes
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const ARGS = new Set(process.argv.slice(2));
const DRY_RUN = ARGS.has('--dry-run');

const MESSAGES_PATH = path.join(REPO_ROOT, 'data', 'sideshift-messages.jsonl');
const DRAFTS_PATH = path.join(REPO_ROOT, 'data', 'sideshift-drafts.jsonl');
const PROMPT_PATH = path.join(REPO_ROOT, 'scripts', 'sideshift-draft-prompt.md');
const OUTPUT_DIR = path.join(REPO_ROOT, 'scripts', 'sideshift-output');
const SPEND_LEDGER = path.join(OUTPUT_DIR, 'spend-ledger.jsonl');

// Cross-agent dependency: outreach templates source-of-truth. Read at draft time
// so any rev to Julz's voice/signature/intake set propagates without code edit.
const OUTREACH_TEMPLATES_PATH =
  'C:/Users/julia/OneDrive/Desktop/UGC/_meta/09-outreach-templates.md';

const MAX_DAILY_USD = Number(process.env.MAX_DAILY_USD ?? 15);
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-7-20260101';

// Claude API pricing per 1M tokens (Opus 4.x tier as of 2026-05).
const PRICING = {
  'claude-opus-4-5-20250929':    { input: 15, output: 75 },
  'claude-opus-4-7-20260101':    { input: 15, output: 75 },
  'claude-sonnet-4-5-20250929':  { input: 3,  output: 15 },
  default:                       { input: 15, output: 75 },
};

const RUN_ID = `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;
const RUN_LOG = path.join(OUTPUT_DIR, `run-${RUN_ID}.log`);

// ----------------------------------------------------------------------------
// inline SideShift types (HR-26 fallback — used only if L2-S-DATA lib not landed)
// ----------------------------------------------------------------------------
//
// SideShiftMessage shape (verbatim from L2-S-DRAFT spec):
//   {
//     id: string,
//     job_id: string,
//     brand: string,
//     campaign?: string,
//     direction: 'inbound' | 'outbound',
//     from?: string,
//     subject?: string | null,
//     body: string,
//     received_at: string,         // ISO timestamp
//     context?: {
//       prior_messages?: string[],
//       brand_notes?: string,
//       campaign_status?: string
//     }
//   }
//
// SideShiftDraft shape (this script's output):
//   {
//     id: string,                  // matches the SideShiftMessage id
//     brand: string,
//     draft_text: string,
//     template_used: string,
//     intake_gaps_addressed: string[],
//     voice_check: { ... },
//     notes_for_julz: string,
//     model: string,
//     generated_at: string,        // ISO timestamp
//     run_id: string,
//     token_usage: { input_tokens: number, output_tokens: number, usd: number }
//   }

// ----------------------------------------------------------------------------
// logging
// ----------------------------------------------------------------------------

const logBuf = [];
function log(level, ...parts) {
  const line = `[${new Date().toISOString()}] [${level}] ${parts.join(' ')}`;
  console.log(line);
  logBuf.push(line);
}
const info = (...p) => log('INFO', ...p);
const warn = (...p) => log('WARN', ...p);
const err = (...p) => log('ERROR', ...p);

async function flushLog() {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.writeFile(RUN_LOG, logBuf.join('\n') + '\n', 'utf8');
  } catch (e) {
    console.error('failed to flush log:', e);
  }
}

// ----------------------------------------------------------------------------
// jsonl I/O
// ----------------------------------------------------------------------------

async function readJsonl(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));
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
      .map((line) => JSON.parse(line))
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

// ----------------------------------------------------------------------------
// outreach-templates source-of-truth loader (HR-1 cite-or-creep)
// ----------------------------------------------------------------------------

async function readOutreachTemplates() {
  try {
    return await fs.readFile(OUTREACH_TEMPLATES_PATH, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') {
      warn(`outreach templates not found at ${OUTREACH_TEMPLATES_PATH} — proceeding with prompt-only voice context`);
      return null;
    }
    throw e;
  }
}

// ----------------------------------------------------------------------------
// filter: inbound messages without existing drafts
// ----------------------------------------------------------------------------

function selectMessagesToDraft({ messages, existingDrafts }) {
  const draftedIds = new Set(existingDrafts.map((d) => d.id));
  return messages.filter(
    (m) => m.direction === 'inbound' && !draftedIds.has(m.id),
  );
}

// ----------------------------------------------------------------------------
// Anthropic API call (lazy-imported so --dry-run works without the dep)
// ----------------------------------------------------------------------------

async function callClaude({ systemPrompt, messages, outreachTemplates }) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Compose user message: outreach templates source-doc + inbound messages.
  // Templates go FIRST so the model anchors voice/signature/intake-set before
  // generating drafts. Prompt-caching-friendly ordering: stable preamble first,
  // variable payload (messages) last.
  const userParts = [];
  if (outreachTemplates) {
    userParts.push(
      '--- OUTREACH TEMPLATES SOURCE-OF-TRUTH (verbatim from _meta/09-outreach-templates.md) ---',
      outreachTemplates,
      '--- END OUTREACH TEMPLATES ---',
      '',
    );
  }
  userParts.push(
    '--- INBOUND SIDESHIFT MESSAGES TO DRAFT REPLIES FOR ---',
    JSON.stringify(messages, null, 2),
    '--- END INBOUND MESSAGES ---',
  );
  const userMessage = userParts.join('\n');

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 16_000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  let text = '';
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
      text += chunk.delta.text;
    }
  }
  const final = await stream.finalMessage();
  const usage = final.usage ?? { input_tokens: 0, output_tokens: 0 };
  const session_id = final.id;

  // Strip markdown fences if the model wrapped JSON despite instructions.
  let jsonText = text.trim();
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  }
  const parsed = JSON.parse(jsonText);

  return { parsed, usage, session_id, rawText: text };
}

// ----------------------------------------------------------------------------
// main
// ----------------------------------------------------------------------------

async function main() {
  info(`run_id=${RUN_ID} dry_run=${DRY_RUN} model=${MODEL}`);

  const messages = await readJsonl(MESSAGES_PATH);
  const existingDrafts = await readJsonl(DRAFTS_PATH);
  info(`messages_total=${messages.length} drafts_existing=${existingDrafts.length}`);

  const toDraft = selectMessagesToDraft({ messages, existingDrafts });
  info(`messages_to_draft=${toDraft.length}`);

  if (toDraft.length === 0) {
    info('No inbound messages awaiting a draft');
    return 0;
  }

  // Daily spend cap check (skipped in dry-run because no spend incurred)
  if (!DRY_RUN) {
    const spentToday = await readSpendToday();
    info(`spent_today_usd=${spentToday.toFixed(4)} cap=${MAX_DAILY_USD}`);
    if (spentToday >= MAX_DAILY_USD) {
      warn(`Daily spend cap reached ($${spentToday.toFixed(2)} >= $${MAX_DAILY_USD}); skipping run`);
      return 0;
    }
  }

  if (DRY_RUN) {
    // HR-26: short-circuit BEFORE any Anthropic call. No SDK import. No spend.
    info('--dry-run: skipping Anthropic call, skipping draft write');
    info(`would draft for ${toDraft.length} message(s): ${toDraft.map((m) => m.id).join(', ')}`);
    info(`would read outreach templates from: ${OUTREACH_TEMPLATES_PATH}`);
    info(`would read system prompt from: ${PROMPT_PATH}`);
    info(`would write drafts to: ${DRAFTS_PATH}`);
    return 0;
  }

  // Real run
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not set');
  }
  const systemPrompt = await fs.readFile(PROMPT_PATH, 'utf8');
  const outreachTemplates = await readOutreachTemplates();

  info(`calling Claude API (${MODEL}) for ${toDraft.length} draft(s)`);
  const { parsed, usage, session_id } = await callClaude({
    systemPrompt,
    messages: toDraft,
    outreachTemplates,
  });

  // Record spend
  const usd = priceUsd({
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    model: MODEL,
  });
  await appendSpend({
    ts: new Date().toISOString(),
    run_id: RUN_ID,
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    usd,
    model: MODEL,
  });
  info(`spend=$${usd.toFixed(4)} in=${usage.input_tokens} out=${usage.output_tokens} session=${session_id}`);

  // Validate model output and write drafts
  const draftResults = parsed.drafts ?? [];
  if (draftResults.length === 0) {
    warn('Claude returned 0 drafts; aborting');
    return 1;
  }

  // Per-draft cost split (proportional to number of drafts in batch — usage is per-batch)
  const usdPerDraft = usd / draftResults.length;
  const inputPerDraft = Math.round(usage.input_tokens / draftResults.length);
  const outputPerDraft = Math.round(usage.output_tokens / draftResults.length);

  const draftRows = draftResults.map((d) => ({
    id: d.id,
    brand: d.brand,
    draft_text: d.draft_text,
    template_used: d.template_used,
    intake_gaps_addressed: d.intake_gaps_addressed ?? [],
    voice_check: d.voice_check ?? null,
    notes_for_julz: d.notes_for_julz ?? '',
    model: MODEL,
    generated_at: new Date().toISOString(),
    run_id: RUN_ID,
    claude_session_id: session_id,
    token_usage: {
      input_tokens: inputPerDraft,
      output_tokens: outputPerDraft,
      usd: usdPerDraft,
    },
  }));

  await appendJsonl(DRAFTS_PATH, draftRows);
  info(`wrote ${draftRows.length} draft(s) to ${DRAFTS_PATH}`);

  // Log any voice-check failures Claude self-flagged (HR-21 cite=invoke for skills)
  for (const d of draftResults) {
    const vc = d.voice_check ?? {};
    if (vc.tier1_voice_applied === false) {
      warn(`draft ${d.id}: tier1_voice_applied=false`);
    }
    if (vc.signature_included === false) {
      warn(`draft ${d.id}: signature_included=false`);
    }
    if (Array.isArray(vc.banned_phrases_present) && vc.banned_phrases_present.length > 0) {
      warn(`draft ${d.id}: banned phrases present: ${vc.banned_phrases_present.join(', ')}`);
    }
    if (vc.brand_named_specifically === false) {
      warn(`draft ${d.id}: brand_named_specifically=false`);
    }
  }

  if (parsed.tier2_self_review?.remaining_concerns?.length) {
    warn('Tier-2 remaining concerns:');
    for (const c of parsed.tier2_self_review.remaining_concerns) warn(`  - ${c}`);
  }

  info(`done: ${draftRows.length} draft(s) written; session=${session_id}`);
  return 0;
}

main()
  .then(async (code) => {
    await flushLog();
    process.exit(code);
  })
  .catch(async (e) => {
    err('FATAL:', e?.stack ?? String(e));
    await flushLog();
    process.exit(1);
  });
