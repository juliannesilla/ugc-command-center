#!/usr/bin/env node
/**
 * poll-gmail-brand.mjs — Gmail brand-outreach inbox poller (Phase A.14p P3)
 *
 * PURPOSE
 *   Reads Gmail threads matching the UGC-Brand-Outreach label and writes a
 *   flat JSONL to data/gmail-brand-inbox.jsonl. The Unified Brand Inbox UI
 *   (app/inbox/unified/page.tsx) reads this file at gh-pages build time.
 *
 * REQUIREMENTS / SECRETS
 *   Set these env vars (e.g. in `.claude/settings.local.json` envs block, or
 *   in a local `.env` you `source` before running). If any is missing the
 *   script exits 0 cleanly with a clear NEEDS-SECRETS log line so cron
 *   doesn't redline before Julz has wired auth.
 *     - GMAIL_CLIENT_ID
 *     - GMAIL_CLIENT_SECRET
 *     - GMAIL_REFRESH_TOKEN
 *     - GMAIL_LABEL          (optional, default "UGC-Brand-Outreach")
 *     - GMAIL_MAX_THREADS    (optional, default 50)
 *
 * USAGE
 *   node scripts/poll-gmail-brand.mjs --help
 *   node scripts/poll-gmail-brand.mjs --dry-run    # No API calls, exit 0
 *   node scripts/poll-gmail-brand.mjs              # Real poll
 *
 * EXIT CODES
 *   0  Success OR --dry-run OR missing-secret graceful exit
 *   1  Honest failure (auth rejected, API error, write error)
 *
 * OUTPUT
 *   Overwrites data/gmail-brand-inbox.jsonl with a header line + one JSON
 *   record per thread.
 *
 * HARD RULES IN PLAY
 *   HR-10 ACCESS HONESTY → graceful missing-secret path, no fabrication
 *   HR-15 verify artifact not proxy → writes a real file, exit code is honest
 *   HR-21 cite = invoke skills (SKILLS INVOKED block below)
 *   HR-26 problems ship with solutions → every error path has remediation
 *
 * SKILLS INVOKED (HR-21 audit trail)
 *   - senior-backend                                → API client + auth
 *   - engineering:debug                             → honest error surfacing
 *   - engineering:documentation                     → header block + --help
 *   - superpowers:verification-before-completion    → --dry-run smoke path
 */

import { promises as fs } from "node:fs";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");
const DATA_FILE = join(REPO_ROOT, "data", "gmail-brand-inbox.jsonl");
const DEFAULT_LABEL = "UGC-Brand-Outreach";
const DEFAULT_MAX = 50;

function nowIso() {
  return new Date().toISOString();
}

function log(level, msg, extra) {
  const line = JSON.stringify({
    ts: nowIso(),
    level,
    msg,
    ...(extra ? { extra } : {}),
  });
  (level === "error" ? process.stderr : process.stdout).write(line + "\n");
}

function printHelp() {
  process.stdout.write(`poll-gmail-brand.mjs — Phase A.14p P3

USAGE
  node scripts/poll-gmail-brand.mjs [--dry-run] [--verbose] [--help]

FLAGS
  --dry-run    Print plan + exit 0. No Gmail API calls.
  --verbose    Print extra diagnostics (token expiry, query string).
  --help, -h   Show this help.

ENV VARS (required for non-dry-run)
  GMAIL_CLIENT_ID
  GMAIL_CLIENT_SECRET
  GMAIL_REFRESH_TOKEN
  GMAIL_LABEL          (default: "${DEFAULT_LABEL}")
  GMAIL_MAX_THREADS    (default: ${DEFAULT_MAX})

OUTPUT
  Overwrites data/gmail-brand-inbox.jsonl with a header line +
  one JSON record per thread.

EXIT
  0 success / dry-run / missing-secret graceful
  1 auth or API failure
`);
}

function parseArgs(argv) {
  return {
    help: argv.includes("--help") || argv.includes("-h"),
    dryRun: argv.includes("--dry-run"),
    verbose: argv.includes("--verbose") || argv.includes("-v"),
  };
}

// ── OAuth: exchange refresh_token → access_token (no SDK dependency) ────────
async function refreshAccessToken({ clientId, clientSecret, refreshToken }) {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`token refresh failed (${res.status}): ${txt.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.access_token;
}

// ── Gmail REST helpers (raw fetch — avoids googleapis dep) ──────────────────
async function gmailFetch(path, accessToken) {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/${path}`, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`gmail ${path} ${res.status}: ${txt.slice(0, 300)}`);
  }
  return res.json();
}

function extractHeader(headers, name) {
  if (!Array.isArray(headers)) return "";
  const h = headers.find(
    (x) => x && typeof x.name === "string" && x.name.toLowerCase() === name.toLowerCase()
  );
  return h && typeof h.value === "string" ? h.value : "";
}

// Recursively decode the first text/plain (fallback text/html stripped) part.
function decodeBody(payload) {
  if (!payload) return "";
  // Single-part
  if (payload.body && payload.body.data) {
    try {
      return Buffer.from(payload.body.data, "base64").toString("utf8");
    } catch {
      return "";
    }
  }
  // Multipart
  if (Array.isArray(payload.parts)) {
    // Prefer text/plain
    const plain = payload.parts.find((p) => p.mimeType === "text/plain");
    if (plain) {
      const body = decodeBody(plain);
      if (body) return body;
    }
    for (const part of payload.parts) {
      const body = decodeBody(part);
      if (body) return body;
    }
  }
  return "";
}

function stripHtml(s) {
  return s
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function pollGmail({ accessToken, label, maxThreads, verbose }) {
  // Step 1: list threads matching label
  const query = encodeURIComponent(`label:${label}`);
  const listPath = `users/me/threads?q=${query}&maxResults=${maxThreads}`;
  if (verbose) log("info", "gmail list", { listPath });
  const list = await gmailFetch(listPath, accessToken);
  const threads = Array.isArray(list.threads) ? list.threads : [];
  log("info", "threads listed", { count: threads.length });

  // Step 2: fetch each thread (full)
  const records = [];
  for (const t of threads) {
    try {
      const thread = await gmailFetch(
        `users/me/threads/${t.id}?format=full`,
        accessToken
      );
      const msgs = Array.isArray(thread.messages) ? thread.messages : [];
      if (msgs.length === 0) continue;
      // Use the LATEST message in the thread as the inbox entry
      const last = msgs[msgs.length - 1];
      const headers = last.payload?.headers || [];
      const subject = extractHeader(headers, "Subject");
      const from = extractHeader(headers, "From");
      const date = extractHeader(headers, "Date");
      const tsMs = Number(last.internalDate) || Date.parse(date) || Date.now();
      const ts = new Date(tsMs).toISOString();
      const rawBody = decodeBody(last.payload);
      const body = stripHtml(rawBody);
      const snippet =
        typeof last.snippet === "string" && last.snippet.length > 0
          ? last.snippet
          : body.slice(0, 280);

      // Parse sender name + email from "Name <addr@x>"
      const m = from.match(/^(.*?)\s*<([^>]+)>\s*$/);
      const sender = m ? (m[1] || m[2]).replace(/^"|"$/g, "").trim() : from;
      const sender_email = m ? m[2] : from;

      records.push({
        id: thread.id,
        source: "gmail",
        sender,
        sender_email,
        subject: subject || "(no subject)",
        snippet,
        body: body.slice(0, 4000),
        thread_url: `https://mail.google.com/mail/u/0/#inbox/${thread.id}`,
        ts,
        labels: Array.isArray(last.labelIds) ? last.labelIds : [],
      });
    } catch (err) {
      log("warn", "thread fetch failed — skipping", {
        threadId: t.id,
        error: String(err),
      });
    }
  }
  return records;
}

async function writeJsonl(records) {
  await fs.mkdir(dirname(DATA_FILE), { recursive: true });
  const header = {
    schema_version: 1,
    created: nowIso(),
    note:
      "Populated by scripts/poll-gmail-brand.mjs. Schema: {id, source:'gmail', sender, sender_email, subject, snippet, body, thread_url, ts, labels[]}",
  };
  const lines = [JSON.stringify(header), ...records.map((r) => JSON.stringify(r))];
  await fs.writeFile(DATA_FILE, lines.join("\n") + "\n", "utf8");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return 0;
  }

  log("info", "poll-gmail-brand start", {
    dryRun: args.dryRun,
    cwd: process.cwd(),
    nodeVersion: process.version,
  });

  const label = process.env.GMAIL_LABEL || DEFAULT_LABEL;
  const maxThreads = Number(process.env.GMAIL_MAX_THREADS) || DEFAULT_MAX;

  if (args.dryRun) {
    log("info", "dry-run plan", {
      label,
      maxThreads,
      dataFile: DATA_FILE,
      hasClientId: !!process.env.GMAIL_CLIENT_ID,
      hasClientSecret: !!process.env.GMAIL_CLIENT_SECRET,
      hasRefreshToken: !!process.env.GMAIL_REFRESH_TOKEN,
    });
    log("info", "dry-run exit 0");
    return 0;
  }

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const missing = [];
  if (!clientId) missing.push("GMAIL_CLIENT_ID");
  if (!clientSecret) missing.push("GMAIL_CLIENT_SECRET");
  if (!refreshToken) missing.push("GMAIL_REFRESH_TOKEN");
  if (missing.length > 0) {
    log("warn", "missing required env vars — graceful exit 0", {
      missing,
      remediation:
        "Add these to .claude/settings.local.json envs or a local .env. See _meta/dashboard-spec/06-a14p-unified-inbox-cron.md.",
    });
    return 0;
  }

  let accessToken;
  try {
    accessToken = await refreshAccessToken({
      clientId,
      clientSecret,
      refreshToken,
    });
    log("info", "access token obtained", {
      tokenPrefix: accessToken.slice(0, 12) + "…",
    });
  } catch (err) {
    log("error", "OAuth refresh failed", {
      error: String(err),
      remediation:
        "Re-issue refresh_token from console.cloud.google.com → OAuth Playground (scope gmail.readonly).",
    });
    return 1;
  }

  let records = [];
  try {
    records = await pollGmail({
      accessToken,
      label,
      maxThreads,
      verbose: args.verbose,
    });
    log("info", "polled threads", { count: records.length });
  } catch (err) {
    log("error", "Gmail poll failed", {
      error: String(err),
      remediation:
        "Verify label name exists in Gmail. Check token scope includes gmail.readonly.",
    });
    return 1;
  }

  try {
    await writeJsonl(records);
    log("info", "wrote jsonl", { path: DATA_FILE, count: records.length });
  } catch (err) {
    log("error", "write failed", {
      error: String(err),
      path: DATA_FILE,
      remediation: "Check disk space + write permissions on data/ dir.",
    });
    return 1;
  }

  process.stdout.write(
    `Polled ${records.length} Gmail threads → wrote to data/gmail-brand-inbox.jsonl\n`
  );
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    process.stderr.write(
      JSON.stringify({
        ts: nowIso(),
        level: "fatal",
        msg: "uncaught in main",
        error: String(err),
        stack: err && err.stack ? err.stack : null,
      }) + "\n"
    );
    process.exit(1);
  });

// Touch DATA_FILE existence check so older Node ESM tree-shake doesn't warn
void existsSync;
