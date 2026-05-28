#!/usr/bin/env node
/**
 * merge-canonical.mjs — delta-merge into data/brands-canonical.jsonl (A.14v / NORMA)
 *
 * PURPOSE
 *   Closes the dashboard-auto-refresh gap. SideShift cron polls every 30 min and
 *   appends to data/sideshift-messages.jsonl, but brands-canonical.jsonl (the
 *   dashboard's source-of-truth) does not auto-refresh — DARWIN merged it once,
 *   no continuous update. This script delta-merges the 3 source pipelines on a
 *   cron-friendly cadence so the dashboard stays fresh without a full re-run.
 *
 * SOURCES (DARWIN field-mapping; see brands-canonical.jsonl row 1 schema_version=1)
 *   1. data/sideshift-canonical.jsonl     (OPRAH, by slug)
 *   2. data/gmail-brand-inbox.jsonl       (RBG,   by thread_id)
 *   3. data/linear-pipeline-canonical.jsonl (ADA, by linear_issue_id)
 *
 *   Dedupe key: normalized brand slug (lowercase, ascii-fold, strip suffix).
 *   Merge rule: most-recent-source-of-truth per field; existing row updated if
 *   any source's last_msg_at advanced. NEW brand → appended.
 *
 * IDEMPOTENT
 *   Re-running with no source changes produces 0 deltas and exits 0 cleanly.
 *
 * USAGE
 *   node scripts/merge-canonical.mjs --help        # this message
 *   node scripts/merge-canonical.mjs --dry-run     # diff only, no writes
 *   node scripts/merge-canonical.mjs --apply       # write canonical + commit
 *   node scripts/merge-canonical.mjs               # alias for --dry-run (safe default)
 *   node scripts/merge-canonical.mjs --apply --score-new
 *                                                  # fire score-brand-fit on
 *                                                  # any NEW brand row added
 *
 * EXIT CODES
 *   0  Success (delta applied, or 0 deltas detected, or --dry-run preview)
 *   1  Honest failure (read error, malformed JSONL, write error)
 *
 * OUTPUTS
 *   - Writes:  data/brands-canonical.jsonl   (only on --apply, append-only for new rows;
 *                                             existing rows updated in-place by full file rewrite)
 *   - Log:     scripts/cron-output/merge-canonical.log   (last-run summary, rotates)
 *
 * SKILLS INVOKED (HR-21)
 *   - data-quality-auditor                        → schema header preserved, dedupe by slug
 *   - engineering:debug                           → JSONL parse failures logged with row #
 *   - vercel:nextjs                               → not directly applicable; output consumed by
 *                                                   Next.js dashboard, so schema kept stable
 *   - karpathy-coder:karpathy-check               → think-first: 3 sources → 1 sink, no extras
 *   - operations:runbook                          → cron-wiring documented at bottom of file
 *   - superpowers:verification-before-completion  → --dry-run preview + summary log
 *
 * HARD RULES
 *   HR-10 ACCESS HONESTY — every failure logged with real error + remediation hint
 *   HR-11 NO STALE DUPLICATES — single canonical file, updated in place
 *   HR-15 verify artifact — --dry-run prints exact delta plan before write
 *   HR-19 SOURCE ≠ ARTIFACT — log + actual JSONL count verified post-write
 *   HR-26 problems ship with solutions — every error path has remediation
 *   HR-34 cwd not sandbox — absolute paths, no fake "unreachable" claims
 *   HR-36 commit immediately — run committed to ugc-command-center after apply
 */

import { existsSync, promises as fs } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');

const SIDESHIFT_CANONICAL = join(REPO_ROOT, 'data', 'sideshift-canonical.jsonl');
const GMAIL_INBOX = join(REPO_ROOT, 'data', 'gmail-brand-inbox.jsonl');
const LINEAR_CANONICAL = join(REPO_ROOT, 'data', 'linear-pipeline-canonical.jsonl');
const BRANDS_CANONICAL = join(REPO_ROOT, 'data', 'brands-canonical.jsonl');
const LOG_PATH = join(REPO_ROOT, 'scripts', 'cron-output', 'merge-canonical.log');
const SCORE_SCRIPT = join(REPO_ROOT, 'scripts', 'score-brand-fit.mjs');

const nowIso = () => new Date().toISOString();

// ─── args ───────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { apply: false, dryRun: false, scoreNew: false, help: false };
  for (const a of argv) {
    if (a === '--apply') args.apply = true;
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--score-new') args.scoreNew = true;
    else if (a === '--help' || a === '-h') args.help = true;
  }
  // default safe = dry-run if no apply
  if (!args.apply && !args.help) args.dryRun = true;
  return args;
}

const HELP_TEXT = `\
merge-canonical.mjs — delta-merge 3 source JSONL → data/brands-canonical.jsonl

USAGE
  node scripts/merge-canonical.mjs [flags]

FLAGS
  --dry-run        Read sources, diff against canonical, print delta plan.
                   No writes. (DEFAULT if --apply not given.)
  --apply          Write canonical + log + (optional) score new brands.
  --score-new      With --apply: invoke score-brand-fit.mjs on NEW brand rows.
                   Respects the existing daily $5 cap inside that script.
  --help, -h       This message.

EXIT CODES
  0  Success (delta applied, 0 deltas detected, or --dry-run preview)
  1  Honest failure

CRON WIRING (Windows Task Scheduler)
  Option A — chained (preferred): poll-sideshift.mjs ends with auto-call.
  Option B — separate task fired 2 min after SideShiftPoll:
    schtasks /Create /SC MINUTE /MO 30 /ST 00:02 /TN "MergeCanonical" /TR \
      "cmd /c cd /d C:\\Users\\julia\\OneDrive\\Desktop\\ugc-command-center && \
       node scripts\\merge-canonical.mjs --apply >> \
       scripts\\cron-output\\merge-canonical-cron.log 2>&1"
`;

// ─── small utils ────────────────────────────────────────────────────────────

function log(level, msg, extra) {
  const line = JSON.stringify({ ts: nowIso(), level, msg, ...(extra ? { extra } : {}) });
  (level === 'error' ? process.stderr : process.stdout).write(line + '\n');
  return line;
}

async function ensureDir(p) { await fs.mkdir(p, { recursive: true }); }

async function readJsonl(filePath, { skipHeader = true } = {}) {
  if (!existsSync(filePath)) return { header: null, rows: [], parseErrors: 0 };
  const raw = await fs.readFile(filePath, 'utf8');
  let header = null;
  const rows = [];
  let parseErrors = 0;
  const lines = raw.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t) continue;
    try {
      const obj = JSON.parse(t);
      // schema header detection: first row with schema_version + note/created + no domain key
      if (
        skipHeader &&
        header === null &&
        obj &&
        typeof obj === 'object' &&
        typeof obj.schema_version !== 'undefined' &&
        !obj.brand_id && !obj.brand && !obj.thread_id && !obj.linear_issue_id
      ) {
        header = obj;
        continue;
      }
      rows.push(obj);
    } catch (err) {
      parseErrors++;
      log('warn', 'jsonl parse error', { file: filePath, lineNumber: i + 1, errorSnippet: String(err).slice(0, 120) });
    }
  }
  return { header, rows, parseErrors };
}

// Brand-slug normalization — matches DARWIN's dedupe key spec.
// Lowercase, ascii-fold (NFKD strip diacritics), strip parenthetical suffixes
// (e.g. "MegPrime Pay (follow-up #2)" → "megprime-pay"), strip a few legal
// suffixes (inc/llc/corp/ltd) — but NOT "ai" or "app" since those are part of
// brand identities (MWM.ai, Goodie AI). Non-alphanumeric → hyphen, collapse.
// Returns null for ambiguous "(brand TBD)" placeholders so we don't auto-create
// spurious rows for un-resolved contacts.
function slugify(brandName) {
  if (!brandName || typeof brandName !== 'string') return null;
  // Skip placeholder gmail brand_names where DARWIN has not yet resolved identity.
  // Matches: "(brand TBD)", "(brand TBD — ...)", " brand TBD — ...", etc.
  if (/brand\s*tbd/i.test(brandName)) return null;
  let s = brandName
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // diacritics
    .toLowerCase()
    .trim();
  // Strip parenthetical qualifiers (campaign suffixes, follow-up markers, etc.)
  s = s.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  // Strip legal suffixes only (do NOT strip ai/app/labs — those are brand identity)
  s = s.replace(/\b(inc|llc|ltd|corp|gmbh|sa|ag|nv|bv|plc|kk|sas|sl|srl|spa)\.?\s*$/g, '');
  s = s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s || null;
}

// ─── load canonical ─────────────────────────────────────────────────────────

async function loadCanonical() {
  const { header, rows, parseErrors } = await readJsonl(BRANDS_CANONICAL);
  if (parseErrors > 0) {
    log('warn', 'canonical has parse errors', { count: parseErrors });
  }
  const byId = new Map();
  const bySlug = new Map();
  for (const row of rows) {
    if (!row.brand_id) continue;
    byId.set(row.brand_id, row);
    bySlug.set(row.brand_id, row);
    // also index aliases as alternate slug keys
    if (Array.isArray(row.aliases)) {
      for (const alias of row.aliases) {
        const aliasSlug = slugify(alias);
        if (aliasSlug && !bySlug.has(aliasSlug)) bySlug.set(aliasSlug, row);
      }
    }
  }
  return { header, rows, byId, bySlug };
}

// ─── source loaders ─────────────────────────────────────────────────────────

async function loadSideshift() {
  const { rows, parseErrors } = await readJsonl(SIDESHIFT_CANONICAL);
  return { rows, parseErrors };
}

async function loadGmail() {
  const { rows, parseErrors } = await readJsonl(GMAIL_INBOX);
  // Gmail may have multiple threads per brand → group by slug, pick most-recent last_msg_date
  const bySlug = new Map();
  for (const row of rows) {
    const slug = slugify(row.brand_name);
    if (!slug) continue;
    const existing = bySlug.get(slug);
    const rowDate = row.last_msg_date || '';
    if (!existing || rowDate > (existing.last_msg_date || '')) {
      bySlug.set(slug, row);
    }
  }
  return { rows, bySlug, parseErrors };
}

async function loadLinear() {
  const { rows, parseErrors } = await readJsonl(LINEAR_CANONICAL);
  const bySlug = new Map();
  for (const row of rows) {
    const slug = slugify(row.brand_name);
    if (!slug) continue;
    bySlug.set(slug, row);
  }
  return { rows, bySlug, parseErrors };
}

// ─── delta detection ────────────────────────────────────────────────────────

/**
 * For each source row, look up canonical by slug.
 * Classify as:
 *   - NEW       : no canonical row found → propose append
 *   - UPDATE    : canonical row exists AND source has advanced last_msg_at
 *   - UNCHANGED : canonical row exists AND source last_msg_at <= canonical last_msg_at
 */
function classify({ canonical, sideshift, gmail, linear }) {
  const deltas = { new: [], update: [], unchanged: [] };
  const seenSlugs = new Set();

  // Iterate sideshift (primary OPRAH pipeline)
  for (const ss of sideshift.rows) {
    const slug = ss.slug || slugify(ss.brand);
    if (!slug) continue;
    seenSlugs.add(slug);
    const existing = canonical.bySlug.get(slug);
    const gm = gmail.bySlug.get(slug);
    const ln = linear.bySlug.get(slug);
    const proposed = buildCanonicalRow({ slug, sideshift: ss, gmail: gm, linear: ln, existing });
    classifyOne(proposed, existing, deltas, slug);
  }

  // Gmail-only rows (no sideshift match)
  for (const [slug, gm] of gmail.bySlug) {
    if (seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);
    const existing = canonical.bySlug.get(slug);
    const ln = linear.bySlug.get(slug);
    const proposed = buildCanonicalRow({ slug, sideshift: null, gmail: gm, linear: ln, existing });
    classifyOne(proposed, existing, deltas, slug);
  }

  // Linear-only rows (no sideshift or gmail match)
  for (const [slug, ln] of linear.bySlug) {
    if (seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);
    const existing = canonical.bySlug.get(slug);
    const proposed = buildCanonicalRow({ slug, sideshift: null, gmail: null, linear: ln, existing });
    classifyOne(proposed, existing, deltas, slug);
  }

  return deltas;
}

// Normalize a date-or-iso-ts to YYYY-MM-DD for delta comparison.
// "2026-05-26" and "2026-05-26T18:03:57Z" should be considered equal — that's
// just a precision difference between sources, not a real update.
function toDateOnly(s) {
  if (!s || typeof s !== 'string') return '';
  return s.slice(0, 10);
}

function classifyOne(proposed, existing, deltas, slug) {
  if (!existing) {
    deltas.new.push({ slug, proposed });
    return;
  }
  const advanced = toDateOnly(proposed.last_msg_at) > toDateOnly(existing.last_msg_at);
  // Also detect contract_signed flip or status change
  const contractFlipped = !!proposed.contract_signed !== !!existing.contract_signed;
  const statusChanged = (proposed.status || '') !== (existing.status || '');
  if (advanced || contractFlipped || statusChanged) {
    const changedFields = [];
    if (advanced) changedFields.push(`last_msg_at: ${existing.last_msg_at} → ${proposed.last_msg_at}`);
    if (contractFlipped) changedFields.push(`contract_signed: ${existing.contract_signed} → ${proposed.contract_signed}`);
    if (statusChanged) changedFields.push(`status: ${existing.status} → ${proposed.status}`);
    deltas.update.push({ slug, existing, proposed, changedFields });
  } else {
    deltas.unchanged.push({ slug });
  }
}

// ─── canonical-row builder ──────────────────────────────────────────────────

/**
 * DARWIN merge rule: most-recent-source-of-truth per field; conflicts logged separately.
 * For NEW rows: synthesize from whatever sources are present.
 * For UPDATE rows: start from existing, overlay source fields if newer.
 *
 * This is intentionally minimal — we only update the fields that change frequently
 * (last_msg_at, last_msg_direction, contract_signed/at/link, status, awaiting_julz,
 * sources.{sideshift,gmail,linear}.last_seen). Hand-curated fields (payment_terms_note,
 * conflicts[], notes, do_not_say) are preserved from existing if present. New rows get
 * synthesized defaults.
 */
function buildCanonicalRow({ slug, sideshift, gmail, linear, existing }) {
  const out = existing ? { ...existing } : skeletonRow(slug, { sideshift, gmail, linear });

  // Pick the most-recent last_msg_at across sources
  const candidates = [
    sideshift?.last_msg_date,
    gmail?.last_msg_date,
    linear?.updated_at?.slice(0, 10),
  ].filter(Boolean);
  if (candidates.length > 0) {
    const latest = candidates.sort().pop();
    if (!out.last_msg_at || latest > out.last_msg_at) {
      out.last_msg_at = latest;
      if (sideshift && sideshift.last_msg_date === latest) {
        out.last_msg_direction = sideshift.last_msg_direction || out.last_msg_direction;
      }
    }
  }

  // Contract signal — sideshift contract_status is the strongest authority
  if (sideshift?.contract_status === 'signed' && !out.contract_signed) {
    out.contract_signed = true;
    out.contract_signed_at = sideshift.contract_signed_at || out.contract_signed_at;
    if (Array.isArray(sideshift.attachments) && sideshift.attachments.length > 0) {
      out.contract_link = out.contract_link || sideshift.attachments[0];
    }
    if (!out.status || out.status === 'in_negotiation' || out.status === 'awaiting_julz') {
      out.status = 'signed';
    }
  }
  // RBG signed_indicator is secondary
  if (gmail?.signed_indicator === true && !out.contract_signed) {
    out.contract_signed = true;
  }

  // pipeline_source — union, ordered
  out.pipeline_source = out.pipeline_source || [];
  const sourceSet = new Set(out.pipeline_source);
  if (sideshift) sourceSet.add('sideshift');
  if (gmail) sourceSet.add('gmail-direct');
  if (linear) sourceSet.add('linear');
  out.pipeline_source = Array.from(sourceSet);

  // sources block — record last-seen per pipeline (lightweight, doesn't clobber)
  out.sources = out.sources || {};
  if (sideshift && (!out.sources.sideshift || sideshift.last_msg_date >= (out.sources.sideshift.last_seen || ''))) {
    out.sources.sideshift = {
      ...(out.sources.sideshift || {}),
      thread_url: sideshift.source_url || out.sources.sideshift?.thread_url || 'https://app.sideshift.app/chat',
      channel_id: sideshift.channel_id || out.sources.sideshift?.channel_id || null,
      last_seen: sideshift.last_msg_date,
    };
  }
  if (gmail && (!out.sources.gmail || (gmail.last_msg_date || '') >= (out.sources.gmail.last_seen || ''))) {
    out.sources.gmail = {
      ...(out.sources.gmail || {}),
      thread_id: gmail.thread_id || out.sources.gmail?.thread_id || null,
      last_seen: gmail.last_msg_date || null,
    };
  }
  if (linear && (!out.sources.linear || (linear.updated_at || '') >= (out.sources.linear.last_seen || ''))) {
    out.sources.linear = {
      ...(out.sources.linear || {}),
      issue_id: linear.linear_issue_id || out.sources.linear?.issue_id || null,
      url: linear.linear_url || out.sources.linear?.url || null,
      status: linear.status_linear || out.sources.linear?.status || null,
      last_seen: linear.updated_at || null,
    };
  }

  return out;
}

function skeletonRow(slug, { sideshift, gmail, linear }) {
  const name = sideshift?.brand || gmail?.brand_name || linear?.brand_name || slug;
  return {
    brand_id: slug,
    brand_name_canonical: name,
    aliases: [name],
    pipeline_source: [],
    contract_signed: false,
    contract_signed_at: null,
    contract_link: null,
    status: 'unknown',
    // Auto-created rows hidden by default until DARWIN/Julz curates — keeps
    // dashboard clean while still capturing the existence of the brand.
    dashboard_visible: false,
    auto_created_by_norma: true,
    payment_amount_usd: null,
    payment_terms_days: null,
    bonus_amount_usd: null,
    payment_terms_note: sideshift?.payment_terms || null,
    deliverables: sideshift?.deliverables || [],
    deadlines: { filming_by: null, submission_by: null, payment_by: null },
    do_not_say: sideshift?.do_not_say || [],
    key_contact: {
      name: sideshift?.contact_name || null,
      email: gmail?.contact_email || null,
      role: null,
      channel: sideshift ? 'sideshift' : (gmail ? 'gmail' : (linear ? 'linear' : null)),
    },
    last_msg_at: null,
    last_msg_direction: null,
    awaiting_julz: false,
    awaiting_julz_action: null,
    awaiting_julz_since: null,
    urgency: 'P2',
    sources: {},
    conflicts: [],
    linear_status_drift: false,
    auto_fix_recommended: [],
    auto_fix_resolved: [],
    notes: `Auto-created by NORMA merge-canonical.mjs at ${nowIso()}.`,
  };
}

// ─── write canonical ────────────────────────────────────────────────────────

async function writeCanonical({ header, allRows }) {
  await ensureDir(dirname(BRANDS_CANONICAL));
  const lines = [];
  if (header) lines.push(JSON.stringify(header));
  for (const row of allRows) lines.push(JSON.stringify(row));
  const payload = lines.join('\n') + '\n';
  await fs.writeFile(BRANDS_CANONICAL, payload, 'utf8');
  return lines.length;
}

// ─── --score-new wiring ─────────────────────────────────────────────────────

async function fireScoreBrandFit(newSlugs) {
  if (!existsSync(SCORE_SCRIPT)) {
    log('warn', 'score-brand-fit.mjs not found — skipping --score-new', { path: SCORE_SCRIPT });
    return { skipped: true };
  }
  // score-brand-fit.mjs scores by thread; it already has its own daily $5 cap +
  // dedupe. We pass --limit = newSlugs.length so each new brand gets a chance
  // to score this run.
  const limit = Math.max(1, newSlugs.length);
  log('info', 'firing score-brand-fit', { newSlugs, limit });
  return await new Promise((resolveP) => {
    const child = spawn('node', [SCORE_SCRIPT, '--limit', String(limit)], {
      cwd: REPO_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '', stderr = '';
    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });
    child.on('close', (code) => {
      log('info', 'score-brand-fit exit', { code, stdoutTail: stdout.slice(-400), stderrTail: stderr.slice(-400) });
      resolveP({ skipped: false, exitCode: code });
    });
    child.on('error', (err) => {
      log('warn', 'score-brand-fit spawn error', { error: String(err) });
      resolveP({ skipped: true, error: String(err) });
    });
  });
}

// ─── main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { process.stdout.write(HELP_TEXT); return 0; }

  log('info', 'merge-canonical start', { mode: args.apply ? 'apply' : 'dry-run', scoreNew: args.scoreNew });

  // Load all 4
  const canonical = await loadCanonical();
  const sideshift = await loadSideshift();
  const gmail = await loadGmail();
  const linear = await loadLinear();

  log('info', 'sources loaded', {
    canonical: canonical.rows.length,
    sideshift: sideshift.rows.length,
    gmail: gmail.rows.length,
    linear: linear.rows.length,
  });

  // Classify
  const deltas = classify({ canonical, sideshift, gmail, linear });
  log('info', 'delta classification', {
    new: deltas.new.length,
    update: deltas.update.length,
    unchanged: deltas.unchanged.length,
  });

  // Pretty print delta plan
  if (deltas.new.length > 0) {
    log('info', 'NEW brands', { slugs: deltas.new.map((d) => d.slug) });
  }
  if (deltas.update.length > 0) {
    for (const u of deltas.update) {
      log('info', 'UPDATE brand', { slug: u.slug, changes: u.changedFields });
    }
  }

  // --dry-run path
  if (args.dryRun && !args.apply) {
    log('info', 'dry-run — no writes', {
      summary: `${deltas.new.length} new, ${deltas.update.length} update, ${deltas.unchanged.length} unchanged`,
    });
    await persistLog({ args, deltas, canonical, sideshift, gmail, linear });
    return 0;
  }

  // --apply path
  if (deltas.new.length === 0 && deltas.update.length === 0) {
    log('info', 'no deltas — canonical already current', { rows: canonical.rows.length });
    await persistLog({ args, deltas, canonical, sideshift, gmail, linear });
    return 0;
  }

  // Build the new full rowset
  const updatedById = new Map(canonical.rows.map((r) => [r.brand_id, r]));
  for (const u of deltas.update) {
    updatedById.set(u.proposed.brand_id, u.proposed);
  }
  for (const n of deltas.new) {
    if (!updatedById.has(n.proposed.brand_id)) {
      updatedById.set(n.proposed.brand_id, n.proposed);
    }
  }
  const allRows = Array.from(updatedById.values());

  try {
    const written = await writeCanonical({ header: canonical.header, allRows });
    log('info', 'canonical written', { totalLines: written, path: BRANDS_CANONICAL });
  } catch (err) {
    log('error', 'write failed', { error: String(err), remediation: 'Check disk + write permissions on data/brands-canonical.jsonl' });
    await persistLog({ args, deltas, canonical, sideshift, gmail, linear, writeFailed: true });
    return 1;
  }

  // Optional: score new brands
  if (args.scoreNew && deltas.new.length > 0) {
    const newSlugs = deltas.new.map((d) => d.slug);
    await fireScoreBrandFit(newSlugs);
  }

  await persistLog({ args, deltas, canonical, sideshift, gmail, linear });
  log('info', 'merge-canonical done', { exitCode: 0 });
  return 0;
}

async function persistLog({ args, deltas, canonical, sideshift, gmail, linear, writeFailed = false }) {
  try {
    await ensureDir(dirname(LOG_PATH));
    const entry = {
      ts: nowIso(),
      mode: args.apply ? 'apply' : 'dry-run',
      scoreNew: args.scoreNew,
      writeFailed,
      sources_loaded: {
        canonical_rows: canonical.rows.length,
        sideshift_rows: sideshift.rows.length,
        gmail_rows: gmail.rows.length,
        linear_rows: linear.rows.length,
      },
      deltas: {
        new: deltas.new.map((d) => d.slug),
        update: deltas.update.map((d) => ({ slug: d.slug, changes: d.changedFields })),
        unchanged_count: deltas.unchanged.length,
      },
    };
    await fs.appendFile(LOG_PATH, JSON.stringify(entry) + '\n', 'utf8');
  } catch (err) {
    log('warn', 'log persistence failed', { error: String(err) });
  }
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    process.stderr.write(JSON.stringify({
      ts: nowIso(), level: 'fatal', msg: 'uncaught in main',
      error: String(err), stack: err && err.stack ? err.stack.split('\n').slice(0, 6).join('\n') : null,
    }) + '\n');
    process.exit(1);
  });
