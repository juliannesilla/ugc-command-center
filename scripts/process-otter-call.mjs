#!/usr/bin/env node
/**
 * process-otter-call.mjs — A.14x Otter → Silla HQ pipeline (Path A: pasted transcript)
 *
 * One-shot deal-term extraction pipeline. Takes a pasted Otter/Zoom/manual
 * transcript, calls Anthropic Opus 4.7 with a strict JSON-schema extraction
 * prompt (JOAN persona), then propagates the result into:
 *
 *   1. data/brands-canonical.jsonl     (merge or create row by brand_slug)
 *   2. UGC/sideshift-{slug}/ folder    (instantiate from _meta/05-campaign-template/
 *                                      OR update 01-campaign-snapshot.md +
 *                                      03-sow-breakdown.md + 00-brand-rules.md)
 *   3. Linear UGC Pipeline project     (create or update issue — optional)
 *   4. ~/.claude/sessions/silla-hq-events.jsonl  (audit row)
 *   5. scripts/cron-output/otter-spend.jsonl     ($/day cap ledger)
 *
 * Output: TL;DR to stdout (brand · payment · deliverables · uncertain count).
 *
 * Dependencies (already installed per repo `package.json` devDependencies):
 *   @anthropic-ai/sdk ^0.30.0
 * If missing: `npm install @anthropic-ai/sdk` from repo root.
 *
 * Env:
 *   ANTHROPIC_API_KEY    required (mandatory; exit 2 if missing)
 *   LINEAR_API_TOKEN     optional (HR-10 honest fallback — skip Linear if missing)
 *   OTTER_DAILY_CAP      default 5 (USD)
 *   ANTHROPIC_MODEL      default claude-opus-4-7
 *
 * Flags:
 *   --input <path>       read transcript from file
 *   --paste "<text>"     transcript as quoted arg (last positional)
 *   --dry-run            extract + show preview; no writes
 *   --brand-slug <slug>  force specific brand match (skip auto-match)
 *   --skip-linear        skip Linear API call
 *   --verbose            log each step
 *   --help, -h           this message
 *
 * Exit codes:
 *   0 — success (or dry-run, or nothing to do)
 *   1 — schema validation failed
 *   2 — missing required env vars
 *   3 — file write failed
 *
 * Hard rules applied (cited verbatim per HR-21):
 *   HR-1  CITE — every emitted file ties back to A.14x plan §3
 *   HR-10 ACCESS HONESTY — missing LINEAR_API_TOKEN → log + skip, do not silently fail
 *   HR-15 verify artifact — --dry-run path exits 0, prints what would happen
 *   HR-19 source ≠ artifact — TL;DR shows the final extracted shape Julz will see
 *   HR-26 problems ship with solutions — spend cap, dry-run, manual override flags
 *   HR-27 decisions lock — paths confirmed at top of file
 *   HR-36 commit-immediately — scripts/process-otter-call: this script
 *   HR-38 no defer — Path B (Otter URL) flagged in stdout banner only when URL detected
 *
 * Citation: UGC/_meta/00-operating-system.md (13-stage OS, Stages 1/3 fillers)
 *
 * Usage:
 *   node scripts/process-otter-call.mjs --help
 *   node scripts/process-otter-call.mjs --input .tmp/otter-call.txt --verbose
 *   node scripts/process-otter-call.mjs --input transcript.txt --dry-run
 *   node scripts/process-otter-call.mjs --paste "JOAN: Hi Julz... [transcript]"
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import os from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const UGC_ROOT = path.resolve(REPO_ROOT, '..', 'UGC');
const TEMPLATE_DIR = path.join(UGC_ROOT, '_meta', '05-campaign-template');
const CANONICAL_PATH = path.join(REPO_ROOT, 'data', 'brands-canonical.jsonl');
const OUTPUT_DIR = path.join(REPO_ROOT, 'scripts', 'cron-output');
const SPEND_LEDGER = path.join(OUTPUT_DIR, 'otter-spend.jsonl');
const EVENTS_LEDGER = path.join(os.homedir(), '.claude', 'sessions', 'silla-hq-events.jsonl');

const MAX_DAILY_USD = Number(process.env.OTTER_DAILY_CAP ?? 5);
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-7';
const LINEAR_PROJECT_ID = '8bcb55fa-5766-4c9f-80e3-a32604b23733'; // UGC Pipeline project

// Claude Opus 4.x pricing per 1M tokens (matches score-brand-fit pattern)
const PRICING = {
  'claude-opus-4-5-20250929': { input: 15, output: 75 },
  'claude-opus-4-7': { input: 15, output: 75 },
  'claude-sonnet-4-5-20250929': { input: 3, output: 15 },
  default: { input: 15, output: 75 },
};

const RUN_ID = `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;

// ----- args ------------------------------------------------------------
const argv = process.argv.slice(2);
const HELP = argv.includes('--help') || argv.includes('-h');
const DRY_RUN = argv.includes('--dry-run');
const SKIP_LINEAR = argv.includes('--skip-linear');
const VERBOSE = argv.includes('--verbose');

function flagValue(name) {
  const i = argv.indexOf(name);
  if (i === -1) return null;
  return argv[i + 1] ?? null;
}
const INPUT_PATH = flagValue('--input');
const PASTE_TEXT = flagValue('--paste');
const FORCE_SLUG = flagValue('--brand-slug');

if (HELP) {
  console.log(`process-otter-call.mjs — A.14x Otter → Silla HQ pipeline

Extracts deal terms from a UGC discovery-call transcript and propagates to:
  - data/brands-canonical.jsonl
  - UGC/sideshift-{slug}/ folder (Stage 1/3/brand-rules)
  - Linear UGC Pipeline (optional)
  - silla-hq-events.jsonl audit log

Flags:
  --input <path>         read transcript from file
  --paste "<text>"       transcript as quoted arg
  --dry-run              preview without writes
  --brand-slug <slug>    force brand match
  --skip-linear          skip Linear API call
  --verbose              step-by-step logs
  --help, -h             this message

Env:
  ANTHROPIC_API_KEY      required
  LINEAR_API_TOKEN       optional (skip Linear if missing)
  OTTER_DAILY_CAP        default 5 USD
  ANTHROPIC_MODEL        default claude-opus-4-7

Exit codes:
  0 success · 1 schema validation failed · 2 missing env · 3 file write failed
`);
  process.exit(0);
}

// ----- logging ---------------------------------------------------------
function log(level, ...parts) {
  console.log(`[${new Date().toISOString()}] [${level}] ${parts.join(' ')}`);
}
const info = (...p) => log('INFO', ...p);
const warn = (...p) => log('WARN', ...p);
const err = (...p) => log('ERROR', ...p);
const vlog = (...p) => {
  if (VERBOSE) log('VERBOSE', ...p);
};

// ----- jsonl I/O -------------------------------------------------------
async function readJsonl(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const rows = [];
    for (const line of raw.split('\n')) {
      const t = line.trim();
      if (!t) continue;
      try {
        rows.push(JSON.parse(t));
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

async function writeJsonlAtomic(filePath, rows) {
  const tmp = filePath + '.tmp';
  const body = rows.map((r) => JSON.stringify(r)).join('\n') + '\n';
  await fs.writeFile(tmp, body, 'utf8');
  await fs.rename(tmp, filePath);
}

async function appendJsonl(filePath, row) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.appendFile(filePath, JSON.stringify(row) + '\n', 'utf8');
}

// ----- spend ledger ----------------------------------------------------
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
      .reduce((sum, row) => sum + (row.cost_usd ?? 0), 0);
  } catch (e) {
    if (e.code === 'ENOENT') return 0;
    throw e;
  }
}

function priceUsd({ inputTokens, outputTokens, model }) {
  const p = PRICING[model] ?? PRICING.default;
  return (inputTokens / 1_000_000) * p.input + (outputTokens / 1_000_000) * p.output;
}

// ----- prompt ----------------------------------------------------------
const SYSTEM_PROMPT = `You are JOAN, Julz Silla's transcript-analyst. Extract deal terms from a UGC brand discovery call transcript into a strict JSON schema. Output ONLY valid JSON, no prose.

Required schema (return ALL fields; use null when truly unknown, NOT empty string):
{
  "brand_name": "<official capitalized name, e.g. 'MWM.ai'>",
  "brand_slug": "<kebab-case lowercase, ascii-fold, e.g. 'mwm-ai'>",
  "contact_name": "<primary contact human name or null>",
  "contact_role": "<role/title or null>",
  "call_datetime": "<ISO-8601 datetime of the call, or null>",
  "payment_amount_usd": <number or null>,
  "bonus_amount_usd": <number or null>,
  "payment_total_potential": <number or null — base + max bonus>,
  "payment_timing": "<e.g. 'net-30 after delivery', 'on approval', null>",
  "cycle_days": <integer or null — campaign cycle length>,
  "deliverables": [
    {"platform": "TikTok|Instagram Reels|YouTube Shorts|...", "count": <int>, "format": "<vertical video|carousel|...>", "duration_sec": <int or null>, "cadence": "<e.g. '1/week', '5-post retainer', null>"}
  ],
  "contract_status": "<discussed|verbal-agreement|signed|negotiating|declined|null>",
  "honest_concerns": ["<concern in Julz's voice>"],
  "julz_action_items": ["<imperative-tense item Julz committed to>"],
  "brand_action_items": ["<imperative-tense item brand committed to>"],
  "fields_extracted": ["<field name>", ...],
  "fields_uncertain": [{"field": "<name>", "reason": "<why uncertain>"}]
}

Rules:
- Output JSON ONLY. No markdown fences. No prose preamble or postamble.
- If a field is not mentioned, use null (or [] for arrays). Do NOT fabricate.
- Add the field name to "fields_uncertain" with a brief reason whenever you're guessing or the transcript was ambiguous.
- "fields_extracted" lists every TOP-LEVEL field you populated with non-null/non-empty value.
- brand_slug: lowercase, replace whitespace and dots with hyphen, strip non-alphanumeric except hyphen.
- Preserve Julz's voice in honest_concerns (bestie + direct, no fluff, no hedge words).`;

function buildUserPrompt(transcript) {
  return `Transcript follows. Extract per the schema. Return JSON only.

---
${transcript}
---`;
}

// ----- validation ------------------------------------------------------
function validateExtraction(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('response not an object');
  const required = [
    'brand_name', 'brand_slug', 'contact_name', 'contact_role',
    'call_datetime', 'payment_amount_usd', 'bonus_amount_usd',
    'payment_total_potential', 'payment_timing', 'cycle_days',
    'deliverables', 'contract_status', 'honest_concerns',
    'julz_action_items', 'brand_action_items',
    'fields_extracted', 'fields_uncertain',
  ];
  for (const k of required) {
    if (!(k in raw)) throw new Error(`schema missing field: ${k}`);
  }
  if (!raw.brand_name || typeof raw.brand_name !== 'string') {
    throw new Error('brand_name is required and must be a string');
  }
  if (!raw.brand_slug || typeof raw.brand_slug !== 'string') {
    throw new Error('brand_slug is required and must be a string');
  }
  if (!Array.isArray(raw.deliverables)) {
    throw new Error('deliverables must be an array');
  }
  if (!Array.isArray(raw.honest_concerns)) raw.honest_concerns = [];
  if (!Array.isArray(raw.julz_action_items)) raw.julz_action_items = [];
  if (!Array.isArray(raw.brand_action_items)) raw.brand_action_items = [];
  if (!Array.isArray(raw.fields_extracted)) raw.fields_extracted = [];
  if (!Array.isArray(raw.fields_uncertain)) raw.fields_uncertain = [];
  // normalize slug to kebab-case as a safety net
  raw.brand_slug = String(raw.brand_slug)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\./g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return raw;
}

// ----- Anthropic call --------------------------------------------------
async function extractFromTranscript(client, transcript) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(transcript) }],
  });

  let text = '';
  for (const block of response.content ?? []) {
    if (block.type === 'text') text += block.text;
  }

  let jsonText = text.trim();
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  }
  const braceMatch = jsonText.match(/\{[\s\S]*\}/);
  if (braceMatch) jsonText = braceMatch[0];

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    throw new Error(`JSON parse failed: ${e.message}. Raw: ${text.slice(0, 200)}`);
  }
  const validated = validateExtraction(parsed);
  const usage = response.usage ?? { input_tokens: 0, output_tokens: 0 };
  return { validated, usage };
}

// ----- canonical merge -------------------------------------------------
function mapExtractionToCanonical(ext, existing = {}) {
  // Preserve fields the transcript didn't mention (HR-10 + HR-11 in-place update)
  const merged = { ...existing };
  merged.brand_id = ext.brand_slug;
  merged.brand_name_canonical = ext.brand_name ?? existing.brand_name_canonical ?? ext.brand_slug;
  merged.aliases = Array.from(new Set([
    ...(existing.aliases ?? []),
    ext.brand_name,
  ].filter(Boolean)));
  merged.pipeline_source = Array.from(new Set([...(existing.pipeline_source ?? []), 'otter']));
  if (ext.contract_status) merged.status = ext.contract_status;
  if (ext.payment_amount_usd != null) merged.payment_amount_usd = ext.payment_amount_usd;
  if (ext.bonus_amount_usd != null) merged.bonus_amount_usd = ext.bonus_amount_usd;
  if (ext.payment_timing) merged.payment_terms_note = ext.payment_timing;
  if (ext.cycle_days != null) merged.cycle_days = ext.cycle_days;
  if (ext.deliverables && ext.deliverables.length > 0) merged.deliverables = ext.deliverables;
  if (ext.contact_name || ext.contact_role) {
    merged.key_contact = {
      ...(existing.key_contact ?? {}),
      name: ext.contact_name ?? existing.key_contact?.name ?? null,
      role: ext.contact_role ?? existing.key_contact?.role ?? null,
    };
  }
  if (ext.julz_action_items.length > 0) {
    merged.awaiting_julz = true;
    merged.awaiting_julz_action = ext.julz_action_items.join('; ');
    merged.awaiting_julz_since = new Date().toISOString().slice(0, 10);
  }
  merged.sources = {
    ...(existing.sources ?? {}),
    otter: {
      last_seen: new Date().toISOString(),
      call_datetime: ext.call_datetime ?? null,
      run_id: RUN_ID,
    },
  };
  // append-only honest_concerns log so prior rounds preserved
  if (ext.honest_concerns.length > 0) {
    const prior = Array.isArray(existing.honest_concerns) ? existing.honest_concerns : [];
    merged.honest_concerns = Array.from(new Set([...prior, ...ext.honest_concerns]));
  }
  return merged;
}

// ----- campaign folder updates -----------------------------------------
async function ensureCampaignFolder(slug) {
  const dest = path.join(UGC_ROOT, `sideshift-${slug}`);
  let created = false;
  try {
    await fs.access(dest);
  } catch {
    // Copy template
    try {
      await fs.access(TEMPLATE_DIR);
    } catch (e) {
      warn(`template dir missing: ${TEMPLATE_DIR} — creating bare folder`);
      await fs.mkdir(dest, { recursive: true });
      return { dest, created: true };
    }
    await copyDir(TEMPLATE_DIR, dest);
    created = true;
  }
  return { dest, created };
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(s, d);
    } else {
      await fs.copyFile(s, d);
    }
  }
}

async function writeCampaignSnapshot(folderPath, ext) {
  const filePath = path.join(folderPath, '01-campaign-snapshot.md');
  const deliverableLines = (ext.deliverables ?? []).map((d) => {
    const parts = [
      d.count != null ? `${d.count}×` : null,
      d.format ?? null,
      d.platform ? `(${d.platform})` : null,
      d.duration_sec != null ? `${d.duration_sec}s` : null,
      d.cadence ? `· ${d.cadence}` : null,
    ].filter(Boolean);
    return `- ${parts.join(' ')}`;
  });
  const body = `# 01 — Campaign Snapshot (Stage 1: Capture)

**Source:** Otter discovery call · processed by A.14x process-otter-call · run ${RUN_ID}
**Call datetime:** ${ext.call_datetime ?? 'unknown'}

---

## Campaign Snapshot

- **Brand:** ${ext.brand_name}
- **Brand slug:** \`${ext.brand_slug}\`
- **Platform/source:** Otter transcript (discovery call)
- **Primary contact:** ${ext.contact_name ?? 'unknown'}${ext.contact_role ? ` (${ext.contact_role})` : ''}
- **Contract status:** ${ext.contract_status ?? 'discussed'}
- **Payment:** ${ext.payment_amount_usd != null ? `$${ext.payment_amount_usd}` : 'TBD'}${ext.bonus_amount_usd ? ` + $${ext.bonus_amount_usd} bonus` : ''}${ext.payment_total_potential != null ? ` · total potential $${ext.payment_total_potential}` : ''}
- **Payment timing:** ${ext.payment_timing ?? 'unknown'}
- **Cycle:** ${ext.cycle_days != null ? `${ext.cycle_days} days` : 'unknown'}

## Deliverables

${deliverableLines.length > 0 ? deliverableLines.join('\n') : '- (none extracted)'}

## Honest concerns (Julz voice)

${ext.honest_concerns.length > 0 ? ext.honest_concerns.map((c) => `- ${c}`).join('\n') : '- (none flagged)'}

## Julz action items

${ext.julz_action_items.length > 0 ? ext.julz_action_items.map((a) => `- [ ] ${a}`).join('\n') : '- (none)'}

## Brand action items

${ext.brand_action_items.length > 0 ? ext.brand_action_items.map((a) => `- [ ] ${a}`).join('\n') : '- (none)'}

## Fields uncertain (review before locking)

${ext.fields_uncertain.length > 0 ? ext.fields_uncertain.map((f) => `- **${f.field}** — ${f.reason}`).join('\n') : '- (none)'}

---

_Generated ${new Date().toISOString()} · run ${RUN_ID}_
`;
  await fs.writeFile(filePath, body, 'utf8');
  return filePath;
}

async function writeSowBreakdown(folderPath, ext) {
  const filePath = path.join(folderPath, '03-sow-breakdown.md');
  const reqRows = [
    ['Deliverables (count, type)', (ext.deliverables ?? []).map((d) => `${d.count ?? '?'}× ${d.format ?? ''} ${d.platform ? `on ${d.platform}` : ''}`.trim()).join('; ') || 'unknown', 'Otter call'],
    ['Required video length', (ext.deliverables ?? []).map((d) => d.duration_sec ? `${d.duration_sec}s` : null).filter(Boolean).join('; ') || 'unknown', 'Otter call'],
    ['Cadence', (ext.deliverables ?? []).map((d) => d.cadence).filter(Boolean).join('; ') || 'unknown', 'Otter call'],
    ['Payment structure', ext.payment_amount_usd != null ? `Base $${ext.payment_amount_usd}${ext.bonus_amount_usd ? ` + bonus $${ext.bonus_amount_usd}` : ''}` : 'unknown', 'Otter call'],
    ['Payment timing', ext.payment_timing ?? 'unknown', 'Otter call'],
    ['Cycle length', ext.cycle_days != null ? `${ext.cycle_days} days` : 'unknown', 'Otter call'],
    ['Contract status', ext.contract_status ?? 'unknown', 'Otter call'],
  ];
  const rowsMd = reqRows.map((r) => `| ${r[0]} | ${r[1]} | ${r[2]} |`).join('\n');
  const body = `# 03 — SOW Breakdown (Stage 3: Extract SOW)

**Source:** Otter discovery call · processed by A.14x process-otter-call · run ${RUN_ID}

---

## Definitive SOW Breakdown (3-col)

| Field | Value | Source citation |
|-------|-------|-----------------|
${rowsMd}

---

## Fields uncertain

${ext.fields_uncertain.length > 0 ? ext.fields_uncertain.map((f) => `- **${f.field}** — ${f.reason}`).join('\n') : '- (none)'}

---

_Generated ${new Date().toISOString()} · run ${RUN_ID}_
`;
  await fs.writeFile(filePath, body, 'utf8');
  return filePath;
}

async function appendBrandRules(folderPath, ext) {
  const filePath = path.join(folderPath, '00-brand-rules.md');
  const appendBlock = `

---

## Otter call append — ${new Date().toISOString().slice(0, 10)} (run ${RUN_ID})

**Primary contact:** ${ext.contact_name ?? 'unknown'}${ext.contact_role ? ` (${ext.contact_role})` : ''}

**Honest concerns surfaced on call:**
${ext.honest_concerns.length > 0 ? ext.honest_concerns.map((c) => `- ${c}`).join('\n') : '- (none)'}

**Brand action items (their side):**
${ext.brand_action_items.length > 0 ? ext.brand_action_items.map((a) => `- [ ] ${a}`).join('\n') : '- (none)'}
`;
  try {
    await fs.appendFile(filePath, appendBlock, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') {
      // create with header + block
      await fs.writeFile(filePath, `# 00 — Brand Rules\n\n**Brand:** ${ext.brand_name}\n${appendBlock}`, 'utf8');
    } else {
      throw e;
    }
  }
  return filePath;
}

// ----- Linear API ------------------------------------------------------
async function linearUpsertIssue(ext) {
  if (SKIP_LINEAR) {
    info('Linear: --skip-linear flag set, skipping');
    return { skipped: true, reason: 'flag' };
  }
  const token = process.env.LINEAR_API_TOKEN;
  if (!token) {
    warn('Linear: LINEAR_API_TOKEN not set — HR-10 honest skip');
    return { skipped: true, reason: 'no-token' };
  }
  const title = `${ext.brand_name} — discovery call ${new Date().toISOString().slice(0, 10)}`;
  const descLines = [
    `**Source:** Otter call (A.14x process-otter-call · ${RUN_ID})`,
    '',
    `**Payment:** ${ext.payment_amount_usd != null ? `$${ext.payment_amount_usd}` : 'TBD'}${ext.bonus_amount_usd ? ` + $${ext.bonus_amount_usd} bonus` : ''}`,
    `**Cycle:** ${ext.cycle_days != null ? `${ext.cycle_days} days` : 'unknown'}`,
    `**Contract status:** ${ext.contract_status ?? 'discussed'}`,
    '',
    '**Deliverables:**',
    ...(ext.deliverables ?? []).map((d) => `- ${d.count ?? '?'}× ${d.format ?? ''} ${d.platform ? `on ${d.platform}` : ''}${d.duration_sec ? ` · ${d.duration_sec}s` : ''}${d.cadence ? ` · ${d.cadence}` : ''}`.trim()),
    '',
    '**Julz action items:**',
    ...(ext.julz_action_items.length > 0 ? ext.julz_action_items.map((a) => `- [ ] ${a}`) : ['- (none)']),
    '',
    '**Brand action items:**',
    ...(ext.brand_action_items.length > 0 ? ext.brand_action_items.map((a) => `- [ ] ${a}`) : ['- (none)']),
    '',
    '**Honest concerns:**',
    ...(ext.honest_concerns.length > 0 ? ext.honest_concerns.map((c) => `- ${c}`) : ['- (none)']),
    '',
    '**Fields uncertain (Julz to confirm):**',
    ...(ext.fields_uncertain.length > 0 ? ext.fields_uncertain.map((f) => `- ${f.field}: ${f.reason}`) : ['- (none)']),
  ];
  const description = descLines.join('\n');

  // Search for existing issue by brand name
  const searchQuery = `query($name: String!, $projectId: String!) {
    issues(filter: { title: { containsIgnoreCase: $name }, project: { id: { eq: $projectId } } }, first: 5) {
      nodes { id title identifier url }
    }
  }`;
  let existingIssueId = null;
  let existingIdentifier = null;
  try {
    const sres = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify({ query: searchQuery, variables: { name: ext.brand_name, projectId: LINEAR_PROJECT_ID } }),
    });
    const sjson = await sres.json();
    const nodes = sjson?.data?.issues?.nodes ?? [];
    if (nodes.length > 0) {
      existingIssueId = nodes[0].id;
      existingIdentifier = nodes[0].identifier;
    }
  } catch (e) {
    warn(`Linear search failed (continuing as create-new): ${e.message}`);
  }

  if (existingIssueId) {
    // Update with comment instead of overwriting body
    const commentMutation = `mutation($issueId: String!, $body: String!) {
      commentCreate(input: { issueId: $issueId, body: $body }) { success comment { id url } }
    }`;
    try {
      const cres = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify({ query: commentMutation, variables: { issueId: existingIssueId, body: description } }),
      });
      const cjson = await cres.json();
      if (cjson?.data?.commentCreate?.success) {
        return { updated: true, issue_id: existingIssueId, identifier: existingIdentifier, url: cjson.data.commentCreate.comment?.url };
      }
      warn(`Linear comment failed: ${JSON.stringify(cjson?.errors ?? cjson)}`);
      return { error: 'comment-failed', issue_id: existingIssueId };
    } catch (e) {
      warn(`Linear comment exception: ${e.message}`);
      return { error: e.message };
    }
  }

  // Create new
  const createMutation = `mutation($title: String!, $description: String!, $projectId: String!) {
    issueCreate(input: { title: $title, description: $description, projectId: $projectId }) {
      success
      issue { id identifier url }
    }
  }`;
  try {
    const cres = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify({ query: createMutation, variables: { title, description, projectId: LINEAR_PROJECT_ID } }),
    });
    const cjson = await cres.json();
    if (cjson?.data?.issueCreate?.success) {
      const issue = cjson.data.issueCreate.issue;
      return { created: true, issue_id: issue.id, identifier: issue.identifier, url: issue.url };
    }
    warn(`Linear create failed: ${JSON.stringify(cjson?.errors ?? cjson)}`);
    return { error: 'create-failed' };
  } catch (e) {
    warn(`Linear create exception: ${e.message}`);
    return { error: e.message };
  }
}

// ----- transcript loader -----------------------------------------------
async function loadTranscript() {
  if (INPUT_PATH) {
    vlog(`reading transcript from ${INPUT_PATH}`);
    return await fs.readFile(INPUT_PATH, 'utf8');
  }
  if (PASTE_TEXT) {
    vlog('using --paste arg as transcript');
    return PASTE_TEXT;
  }
  // stdin
  if (!process.stdin.isTTY) {
    vlog('reading transcript from stdin');
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf8');
  }
  throw new Error('no transcript source: provide --input <path>, --paste "<text>", or pipe to stdin');
}

// ----- main ------------------------------------------------------------
async function main() {
  info(`run_id=${RUN_ID} dry_run=${DRY_RUN} model=${MODEL} skip_linear=${SKIP_LINEAR}`);

  // env validation (HR-10)
  if (!DRY_RUN && !process.env.ANTHROPIC_API_KEY) {
    err('ANTHROPIC_API_KEY not set — exit 2 (HR-10 ACCESS HONESTY)');
    err('Remediation: export ANTHROPIC_API_KEY=sk-ant-... OR run with --dry-run');
    return 2;
  }

  // load transcript
  let transcript;
  try {
    transcript = await loadTranscript();
  } catch (e) {
    err(e.message);
    return 2;
  }
  if (!transcript || transcript.trim().length < 50) {
    err(`transcript too short (${transcript?.length ?? 0} chars) — provide real transcript text`);
    return 1;
  }
  vlog(`transcript loaded: ${transcript.length} chars`);

  // spend cap (skip on dry-run)
  if (!DRY_RUN) {
    const spent = await readSpendToday();
    info(`spent_today_usd=$${spent.toFixed(4)} cap=$${MAX_DAILY_USD}`);
    if (spent >= MAX_DAILY_USD) {
      warn(`Daily spend cap reached ($${spent.toFixed(2)} >= $${MAX_DAILY_USD}). Resume tomorrow OR raise cap via OTTER_DAILY_CAP env var.`);
      return 0;
    }
  }

  // dry-run preview (no API call)
  if (DRY_RUN) {
    info('--dry-run: would call Anthropic with transcript and propagate to canonical/folder/Linear');
    info(`  transcript chars: ${transcript.length}`);
    info(`  model: ${MODEL}`);
    info(`  daily cap: $${MAX_DAILY_USD}`);
    info(`  est cost per call: ~$${priceUsd({ inputTokens: 3000, outputTokens: 1200, model: MODEL }).toFixed(4)}`);
    info(`  force_slug: ${FORCE_SLUG ?? '(auto-detect)'}`);
    info('  skip_linear:', SKIP_LINEAR);
    console.log('\n## 🟢 BOTTOM LINE (dry-run)\nWould extract deal terms from transcript and update canonical + campaign folder + Linear. No writes performed.\n');
    return 0;
  }

  // call Anthropic
  vlog('importing @anthropic-ai/sdk...');
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  vlog('calling Anthropic with extraction prompt...');
  let ext, usage;
  try {
    const r = await extractFromTranscript(client, transcript);
    ext = r.validated;
    usage = r.usage;
  } catch (e) {
    err(`extraction failed: ${e.message}`);
    return 1;
  }

  if (FORCE_SLUG) {
    info(`forcing brand_slug = ${FORCE_SLUG} (was: ${ext.brand_slug})`);
    ext.brand_slug = FORCE_SLUG;
  }

  const cost_usd = priceUsd({
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    model: MODEL,
  });
  info(`extraction success: brand=${ext.brand_name} slug=${ext.brand_slug} fields_extracted=${ext.fields_extracted.length} uncertain=${ext.fields_uncertain.length} cost=$${cost_usd.toFixed(5)}`);

  // append spend
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await appendJsonl(SPEND_LEDGER, {
      ts: new Date().toISOString(),
      brand_slug: ext.brand_slug,
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
      cost_usd,
      model: MODEL,
      run_id: RUN_ID,
    });
  } catch (e) {
    err(`spend ledger write failed: ${e.message}`);
    return 3;
  }

  // merge canonical
  let rows;
  try {
    rows = await readJsonl(CANONICAL_PATH);
  } catch (e) {
    err(`canonical read failed: ${e.message}`);
    return 3;
  }
  const idx = rows.findIndex((r) => r.brand_id === ext.brand_slug || (r.aliases ?? []).map(String).map((s) => s.toLowerCase()).includes(ext.brand_name?.toLowerCase()));
  let merged;
  if (idx >= 0) {
    vlog(`merging into existing canonical row [${idx}] brand_id=${rows[idx].brand_id}`);
    merged = mapExtractionToCanonical(ext, rows[idx]);
    rows[idx] = merged;
  } else {
    vlog(`creating new canonical row for ${ext.brand_slug}`);
    merged = mapExtractionToCanonical(ext, {});
    rows.push(merged);
  }
  try {
    await writeJsonlAtomic(CANONICAL_PATH, rows);
  } catch (e) {
    err(`canonical write failed: ${e.message}`);
    return 3;
  }
  info(`canonical updated: ${rows.length} rows`);

  // campaign folder
  let folderPath, folderCreated;
  try {
    const r = await ensureCampaignFolder(ext.brand_slug);
    folderPath = r.dest;
    folderCreated = r.created;
  } catch (e) {
    err(`campaign folder ensure failed: ${e.message}`);
    return 3;
  }
  vlog(`campaign folder: ${folderPath} ${folderCreated ? '(created)' : '(existed)'}`);
  try {
    await writeCampaignSnapshot(folderPath, ext);
    await writeSowBreakdown(folderPath, ext);
    await appendBrandRules(folderPath, ext);
  } catch (e) {
    err(`campaign folder file writes failed: ${e.message}`);
    return 3;
  }
  info(`campaign files updated in ${folderPath}`);

  // Linear
  let linearResult;
  try {
    linearResult = await linearUpsertIssue(ext);
    info(`Linear: ${JSON.stringify(linearResult)}`);
  } catch (e) {
    warn(`Linear call exception: ${e.message}`);
    linearResult = { error: e.message };
  }

  // audit event
  try {
    await appendJsonl(EVENTS_LEDGER, {
      ts: new Date().toISOString(),
      event: 'otter_call_processed',
      brand_slug: ext.brand_slug,
      brand_name: ext.brand_name,
      deliverables_count: (ext.deliverables ?? []).length,
      fields_extracted_count: (ext.fields_extracted ?? []).length,
      fields_uncertain_count: (ext.fields_uncertain ?? []).length,
      cost_usd,
      linear: linearResult,
      folder_created: folderCreated,
      folder_path: folderPath,
      run_id: RUN_ID,
    });
  } catch (e) {
    warn(`audit event append failed: ${e.message}`);
  }

  // TL;DR
  const payDisplay = ext.payment_amount_usd != null
    ? `$${ext.payment_amount_usd}${ext.bonus_amount_usd ? ` + $${ext.bonus_amount_usd} bonus` : ''}`
    : 'TBD';
  const delivCount = (ext.deliverables ?? []).reduce((a, d) => a + (d.count ?? 0), 0);
  console.log('\n========================================');
  console.log('## 🟢 BOTTOM LINE');
  console.log(`${ext.brand_name} (${ext.brand_slug}) processed. Payment ${payDisplay}. ${delivCount || (ext.deliverables ?? []).length} deliverables. ${ext.fields_uncertain.length} uncertain fields. Status: ${ext.contract_status ?? 'discussed'}.`);
  console.log('');
  console.log('## 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW');
  if (ext.fields_uncertain.length > 0) {
    console.log(`1. Confirm these ${ext.fields_uncertain.length} uncertain field(s):`);
    ext.fields_uncertain.forEach((f, i) => console.log(`   ${String.fromCharCode(97 + i)}. ${f.field} — ${f.reason}`));
  }
  if (ext.julz_action_items.length > 0) {
    console.log(`${ext.fields_uncertain.length > 0 ? '2' : '1'}. Julz action items from the call:`);
    ext.julz_action_items.forEach((a, i) => console.log(`   - ${a}`));
  }
  if (ext.fields_uncertain.length === 0 && ext.julz_action_items.length === 0) {
    console.log('nothing right now — canonical updated, campaign folder ready, Linear synced.');
  }
  console.log('');
  console.log('## Files updated');
  console.log(`- ${CANONICAL_PATH}`);
  console.log(`- ${path.join(folderPath, '01-campaign-snapshot.md')}`);
  console.log(`- ${path.join(folderPath, '03-sow-breakdown.md')}`);
  console.log(`- ${path.join(folderPath, '00-brand-rules.md')}`);
  console.log(`- ${SPEND_LEDGER}`);
  console.log(`- ${EVENTS_LEDGER}`);
  if (linearResult.url) console.log(`- Linear: ${linearResult.url}`);
  console.log('========================================\n');

  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    err('FATAL:', e?.stack ?? String(e));
    process.exit(1);
  });
