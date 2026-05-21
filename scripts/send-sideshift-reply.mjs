#!/usr/bin/env node
// send-sideshift-reply.mjs
// A14L Wave 1 · L2-S-SEND agent-browser send action.
//
// Invoked by /api/sideshift-send (vercel mode) as a child process. Navigates
// app.sideshift.app/chat/<thread_id>, fills the reply textarea with
// --reply-text, and clicks Send. Logs every step to scripts/sideshift-output/
// (timestamped JSONL) so a post-hoc audit can verify the artifact (HR-15/HR-19).
//
// --dry-run short-circuits BEFORE any browser action. Exits 0 after logging
// the planned action. Used by L2-S-SEND verification.
//
// Skills cited (HR-21/HR-25):
//   brightdata-plugin:brd-browser-debug — browser CLI conventions, retries
//   anthropic-skills:owasp-security      — env var hygiene (no token in logs)
//   karpathy-coder:karpathy-check        — minimal control flow
//   superpowers:verification-before-completion — explicit verify step
//
// Decisions locked (HR-27):
//   - AGENT_BROWSER_BIN env override → defaults to 'agent-browser' on PATH
//   - SIDESHIFT_BASE_URL env override → defaults to 'https://app.sideshift.app'
//   - Output dir: scripts/sideshift-output/send-<ts>-<thread>.jsonl
//
// Usage:
//   node scripts/send-sideshift-reply.mjs \
//     --thread-id abc123 \
//     --brand "Acme Co" \
//     --message-id msg_456 \
//     --reply-text "..." \
//     [--dry-run]
//
// Exit codes: 0 = success (or dry-run OK), 1 = arg validation failure,
//             2 = browser action failure, 3 = post-send verification failure.

import { spawn } from 'node:child_process';
import { mkdir, appendFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─────────────────────────────────────────────────────────────────────────────
// Arg parsing — no deps; keep flag-pair simple.
// ─────────────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = { dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') {
      out.dryRun = true;
      continue;
    }
    if (a.startsWith('--')) {
      const key = a.slice(2).replace(/-/g, '_');
      const val = argv[i + 1];
      if (val === undefined || val.startsWith('--')) {
        out[key] = true;
      } else {
        out[key] = val;
        i++;
      }
    }
  }
  return out;
}

function requireStr(obj, key) {
  const v = obj[key];
  if (typeof v !== 'string' || v.length === 0) {
    throw new Error(`Missing required arg --${key.replace(/_/g, '-')}`);
  }
  return v;
}

// ─────────────────────────────────────────────────────────────────────────────
// Log helper — append-only JSONL per send attempt. Never logs reply_text in
// full (HR + OWASP — content may contain anything Julz pasted). Logs hash +
// length for audit. Logs no secrets.
// ─────────────────────────────────────────────────────────────────────────────

async function logStep(logPath, step) {
  await mkdir(dirname(logPath), { recursive: true });
  const line = JSON.stringify({ ts: new Date().toISOString(), ...step }) + '\n';
  await appendFile(logPath, line, 'utf-8');
}

function shortHash(s) {
  // Lightweight non-cryptographic hash for audit correlation only.
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16);
}

// ─────────────────────────────────────────────────────────────────────────────
// Browser action — shells out to agent-browser CLI. The exact CLI surface is
// stubbed behind helpers so it can be swapped (Playwright direct, BrightData
// browser, etc.) without touching the orchestration.
// ─────────────────────────────────────────────────────────────────────────────

async function runBrowserAction({ threadId, replyText, baseUrl, browserBin, logPath }) {
  const url = `${baseUrl.replace(/\/$/, '')}/chat/${encodeURIComponent(threadId)}`;
  await logStep(logPath, { phase: 'browser_navigate', url });

  // Convention: `agent-browser send-chat <url> --textarea-selector ... --send-selector ... --text-stdin`
  const args = [
    'send-chat',
    url,
    '--textarea-selector',
    'textarea[data-test="chat-reply"], textarea[name="reply"], textarea',
    '--send-selector',
    'button[data-test="send"], button[type="submit"]',
    '--text-stdin',
    '--timeout-ms',
    '20000',
  ];

  return new Promise((resolveP) => {
    const child = spawn(browserBin, args, {
      env: process.env,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));
    child.on('error', (err) => {
      resolveP({ code: 127, stdout, stderr: stderr + '\n' + String(err) });
    });
    child.on('close', (code) => resolveP({ code: code ?? 1, stdout, stderr }));
    // Feed reply text via stdin so it never appears in `ps` output (OWASP).
    child.stdin.write(replyText);
    child.stdin.end();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const threadId = requireStr(args, 'thread_id');
  const brand = requireStr(args, 'brand');
  const messageId = requireStr(args, 'message_id');
  const replyText = requireStr(args, 'reply_text');
  const dryRun = Boolean(args.dryRun);

  const baseUrl = process.env.SIDESHIFT_BASE_URL ?? 'https://app.sideshift.app';
  const browserBin = process.env.AGENT_BROWSER_BIN ?? 'agent-browser';

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const logPath = resolve(
    __dirname,
    'sideshift-output',
    `send-${ts}-${threadId.slice(0, 20)}.jsonl`,
  );

  await logStep(logPath, {
    phase: 'start',
    thread_id: threadId,
    brand,
    message_id: messageId,
    reply_text_len: replyText.length,
    reply_text_hash: shortHash(replyText),
    dry_run: dryRun,
    base_url: baseUrl,
  });

  if (dryRun) {
    await logStep(logPath, { phase: 'dry_run_exit', would_navigate: `${baseUrl}/chat/${threadId}` });
    process.stdout.write(
      JSON.stringify({ ok: true, dry_run: true, log: logPath }) + '\n',
    );
    return 0;
  }

  const res = await runBrowserAction({ threadId, replyText, baseUrl, browserBin, logPath });
  await logStep(logPath, {
    phase: 'browser_result',
    code: res.code,
    stdout_tail: res.stdout.slice(-500),
    stderr_tail: res.stderr.slice(-500),
  });

  if (res.code !== 0) {
    process.stderr.write(
      `send-sideshift-reply: browser action failed code=${res.code}\n${res.stderr}\n`,
    );
    return 2;
  }

  // HR-15 verification stub — real impl would re-fetch chat + assert message
  // hash appears. Skipped in v1; recorded as deferred (HR-26).
  await logStep(logPath, {
    phase: 'verification_deferred',
    note: 'v1: trust agent-browser exit code; v2: re-fetch + assert message hash',
  });

  process.stdout.write(JSON.stringify({ ok: true, status: 'sent', log: logPath }) + '\n');
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    process.stderr.write(`send-sideshift-reply: fatal ${err?.stack ?? err}\n`);
    process.exit(1);
  });
