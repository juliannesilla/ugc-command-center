#!/usr/bin/env node
/**
 * process-comments.mjs — Headless Claude API comment-fix cron (A.14j Wave 1c)
 *
 * Reads data/comments.jsonl, filters status=open, calls Anthropic API with the
 * system prompt at scripts/comment-cron-prompt.md, applies returned patches to
 * a fresh branch, opens a DRAFT PR, and marks each comment in_progress.
 *
 * Owners: A14J-X2 (this script). Sibling owners: A14J-X1 (.github/workflows/comment-cron.yml),
 * other agents (app code, lib/comments/*).
 *
 * Hard rules applied: HR-1 (cite), HR-15 (verify artifact), HR-19 (source≠artifact),
 * HR-25 (skills sweep), HR-26 (problems ship with solutions), HR-27 (locked decisions),
 * HR-30 (TL;DR at top of PR body).
 *
 * Env:
 *   ANTHROPIC_API_KEY    required (unless --dry-run)
 *   MAX_DAILY_USD        default 30
 *   ANTHROPIC_MODEL      default claude-opus-4-7 (override via env)
 *   GH_TOKEN             required for PR creation (unless --dry-run)
 *
 * Usage:
 *   node scripts/process-comments.mjs            # real run
 *   node scripts/process-comments.mjs --dry-run  # no API call, no git ops, no PR
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const ARGS = new Set(process.argv.slice(2));
const DRY_RUN = ARGS.has('--dry-run');

const COMMENTS_PATH = path.join(REPO_ROOT, 'data', 'comments.jsonl');
const PROMPT_PATH = path.join(REPO_ROOT, 'scripts', 'comment-cron-prompt.md');
const OUTPUT_DIR = path.join(REPO_ROOT, 'scripts', 'cron-output');
const SPEND_LEDGER = path.join(OUTPUT_DIR, 'spend-ledger.jsonl');

const MAX_DAILY_USD = Number(process.env.MAX_DAILY_USD ?? 30);
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-5-20250929';

// Claude API pricing per 1M tokens (Opus 4.x tier as of 2026-05).
// Adjust if model env override targets a different tier.
const PRICING = {
  'claude-opus-4-5-20250929':    { input: 15, output: 75 },
  'claude-opus-4-7':    { input: 15, output: 75 },
  'claude-sonnet-4-5-20250929':  { input: 3,  output: 15 },
  default:                       { input: 15, output: 75 },
};

const RUN_ID = `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;
const RUN_LOG = path.join(OUTPUT_DIR, `run-${RUN_ID}.log`);

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
// comments jsonl I/O (inline — cross-agent timing avoids hard import of lib/comments)
// ----------------------------------------------------------------------------

async function readComments() {
  try {
    const raw = await fs.readFile(COMMENTS_PATH, 'utf8');
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

async function writeComments(comments) {
  const body = comments.map((c) => JSON.stringify(c)).join('\n') + '\n';
  await fs.mkdir(path.dirname(COMMENTS_PATH), { recursive: true });
  await fs.writeFile(COMMENTS_PATH, body, 'utf8');
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
// shell helpers
// ----------------------------------------------------------------------------

function sh(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { cwd: REPO_ROOT, encoding: 'utf8', ...opts });
  if (res.status !== 0) {
    throw new Error(`${cmd} ${args.join(' ')} failed (${res.status}): ${res.stderr || res.stdout}`);
  }
  return res.stdout.trim();
}

// ----------------------------------------------------------------------------
// Anthropic API call
// ----------------------------------------------------------------------------

async function callClaude({ systemPrompt, comments }) {
  // Lazy import so --dry-run works without the dep installed locally.
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userMessage = JSON.stringify(comments, null, 2);

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
// patch application
// ----------------------------------------------------------------------------

async function applyPatches(commentResults) {
  const summaries = [];
  for (const result of commentResults) {
    const diffs = [];
    for (const change of result.files_changed ?? []) {
      const absPath = path.resolve(REPO_ROOT, change.path);
      if (!absPath.startsWith(REPO_ROOT)) {
        throw new Error(`refusing to write outside repo: ${change.path}`);
      }
      let current = '';
      try {
        current = await fs.readFile(absPath, 'utf8');
      } catch (e) {
        if (e.code !== 'ENOENT') throw e;
      }
      if (change.before && !current.includes(change.before)) {
        warn(`before-block not found in ${change.path}; skipping this file for ${result.comment_id}`);
        diffs.push({ path: change.path, status: 'skipped-no-match' });
        continue;
      }
      const next = change.before
        ? current.replace(change.before, change.after)
        : change.after;
      await fs.mkdir(path.dirname(absPath), { recursive: true });
      await fs.writeFile(absPath, next, 'utf8');
      diffs.push({ path: change.path, status: 'applied' });
    }
    summaries.push({ comment_id: result.comment_id, diffs, analysis: result.analysis });
  }
  return summaries;
}

// ----------------------------------------------------------------------------
// git + PR
// ----------------------------------------------------------------------------

function createBranchAndPush(branch) {
  sh('git', ['checkout', '-b', branch]);
  sh('git', ['add', '-A']);
  // empty-commit guard
  const status = spawnSync('git', ['diff', '--cached', '--quiet'], { cwd: REPO_ROOT });
  if (status.status === 0) {
    warn('no staged changes; skipping commit/push');
    return false;
  }
  sh('git', ['commit', '-m', `comment-batch: address comments (${RUN_ID})`]);
  sh('git', ['push', '-u', 'origin', branch]);
  return true;
}

function openDraftPR({ branch, title, body }) {
  // Use gh CLI; fall back to logging instructions if unavailable.
  const probe = spawnSync('gh', ['--version'], { cwd: REPO_ROOT });
  if (probe.status !== 0) {
    warn('gh CLI unavailable — PR not opened. Branch pushed; open PR manually.');
    return null;
  }
  const out = sh('gh', [
    'pr', 'create',
    '--draft',
    '--title', title,
    '--body', body,
    '--head', branch,
  ]);
  return out;
}

// ----------------------------------------------------------------------------
// main
// ----------------------------------------------------------------------------

async function main() {
  info(`run_id=${RUN_ID} dry_run=${DRY_RUN} model=${MODEL}`);

  const comments = await readComments();
  const open = comments.filter((c) => c.status === 'open');
  info(`total=${comments.length} open=${open.length}`);

  if (open.length === 0) {
    info('No open comments to process');
    return 0;
  }

  // Daily spend cap check
  const spentToday = await readSpendToday();
  info(`spent_today_usd=${spentToday.toFixed(4)} cap=${MAX_DAILY_USD}`);
  if (spentToday >= MAX_DAILY_USD) {
    warn(`Daily spend cap reached ($${spentToday.toFixed(2)} >= $${MAX_DAILY_USD}); skipping run`);
    return 0;
  }

  if (DRY_RUN) {
    info('--dry-run: skipping Anthropic call, git ops, and PR creation');
    info(`would process ${open.length} comment(s): ${open.map((c) => c.id).join(', ')}`);
    return 0;
  }

  // Real run — load prompt and call Claude
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not set');
  }
  const systemPrompt = await fs.readFile(PROMPT_PATH, 'utf8');

  info(`calling Claude API (${MODEL}) with ${open.length} comment(s)`);
  const { parsed, usage, session_id } = await callClaude({ systemPrompt, comments: open });

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

  // Apply patches
  const commentResults = parsed.comments ?? [];
  if (commentResults.length === 0) {
    warn('Claude returned 0 comment results; aborting');
    return 1;
  }
  const summaries = await applyPatches(commentResults);

  // Branch + commit + push
  const branch = `comment-batch-${RUN_ID}`;
  const pushed = createBranchAndPush(branch);
  if (!pushed) {
    warn('Nothing to push; no PR opened');
    return 0;
  }

  // Open draft PR
  const date = new Date().toISOString().slice(0, 10);
  const title = `Comment batch ${date}: ${commentResults.length} comments addressed`;
  const bodyLines = [
    '## 🟢 BOTTOM LINE',
    parsed.bottom_line ?? `${commentResults.length} comments addressed in this batch.`,
    '',
    '## 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW',
    '1. Review the diff per comment below',
    '2. Verify rendered artifact matches `verification_notes.user_facing_effect`',
    '3. Mark `ready` and merge, or leave a follow-up comment',
    '',
    `**claude_session_id:** \`${session_id}\``,
    `**run_id:** \`${RUN_ID}\``,
    '',
    '---',
    '',
    '## Per-comment summary',
    '',
  ];
  for (const r of commentResults) {
    bodyLines.push(`### ${r.comment_id}`);
    bodyLines.push('');
    bodyLines.push(`**Analysis:** ${r.analysis}`);
    bodyLines.push('');
    bodyLines.push('**Files changed:**');
    const summ = summaries.find((s) => s.comment_id === r.comment_id);
    for (const d of summ?.diffs ?? []) {
      bodyLines.push(`- \`${d.path}\` — ${d.status}`);
    }
    bodyLines.push('');
    bodyLines.push(`**User-facing effect:** ${r.verification_notes?.user_facing_effect ?? '—'}`);
    if (r.verification_notes?.deferred?.length) {
      bodyLines.push('');
      bodyLines.push('**Deferred:**');
      for (const d of r.verification_notes.deferred) bodyLines.push(`- ${d}`);
    }
    bodyLines.push('');
  }
  bodyLines.push('---');
  bodyLines.push('');
  bodyLines.push('## Tier-2 self-review (per HR-25/26)');
  bodyLines.push('');
  bodyLines.push(`- Ran: ${parsed.tier2_self_review?.ran ? 'yes' : 'no'}`);
  if (parsed.tier2_self_review?.issues_found_and_fixed?.length) {
    bodyLines.push('- Issues found & fixed:');
    for (const i of parsed.tier2_self_review.issues_found_and_fixed) bodyLines.push(`  - ${i}`);
  }
  if (parsed.tier2_self_review?.remaining_concerns?.length) {
    bodyLines.push('- Remaining concerns:');
    for (const i of parsed.tier2_self_review.remaining_concerns) bodyLines.push(`  - ${i}`);
  }

  const prUrl = openDraftPR({ branch, title, body: bodyLines.join('\n') });
  if (prUrl) info(`draft PR: ${prUrl}`);

  // Update comments.jsonl with status=in_progress + session id
  const processedIds = new Set(commentResults.map((r) => r.comment_id));
  const updated = comments.map((c) =>
    processedIds.has(c.id)
      ? {
          ...c,
          status: 'in_progress',
          claude_session_id: session_id,
          batch_run_id: RUN_ID,
          batch_pr_url: prUrl ?? null,
          updated_at: new Date().toISOString(),
        }
      : c,
  );
  await writeComments(updated);
  sh('git', ['checkout', 'main']);
  sh('git', ['pull', '--ff-only', 'origin', 'main']);
  sh('git', ['add', COMMENTS_PATH]);
  const ledgerStatus = spawnSync('git', ['diff', '--cached', '--quiet'], { cwd: REPO_ROOT });
  if (ledgerStatus.status !== 0) {
    sh('git', ['commit', '-m', `comment-batch: mark ${processedIds.size} comment(s) in_progress (${RUN_ID})`]);
    sh('git', ['push', 'origin', 'main']);
  }

  info(`done: ${processedIds.size} comment(s) marked in_progress; PR=${prUrl ?? 'n/a'}`);
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
