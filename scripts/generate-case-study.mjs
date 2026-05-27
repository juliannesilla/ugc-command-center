#!/usr/bin/env node
/**
 * generate-case-study.mjs — Headless Claude API case-study draft generator (A.14t T6)
 *
 * Closes A.4 G31 deferred-gap: after a campaign ships + gets paid + metrics logged,
 * draft a CASE-STUDY.md at UGC/[slug]/CASE-STUDY.md following the template at
 * UGC/_meta/templates/CASE-STUDY-TEMPLATE.md. Julz reviews → portfolio (W1-A) ingests.
 *
 * Owners: A14T-T6-CASE-STUDY.
 * Sibling pattern: scripts/draft-sideshift-replies.mjs (Anthropic SDK + spend ledger).
 *
 * Hard rules applied: HR-1 (cite — sourced from _meta/templates/CASE-STUDY-TEMPLATE.md),
 * HR-2 (PRESERVE INTENT — feeds existing portfolio index.md ingest),
 * HR-10 (access honesty — exits 0 with remediation if ANTHROPIC_API_KEY missing),
 * HR-15 (verify artifact: --dry-run exits 0),
 * HR-19 (source ≠ artifact — verify CASE-STUDY.md actually written),
 * HR-21 (cite = invoke — claude-api, brand-voice:enforce-voice, marketing:performance-report),
 * HR-26 (problems ship with solutions — $5 daily spend cap, fallback if template missing),
 * HR-34 (verify own writes via fs.stat before declaring success),
 * HR-35 (this script reads UGC paths — NOT a OneDrive build, no .next rm needed here),
 * HR-36 (auto-apply discipline — full skill stack engaged).
 *
 * Env:
 *   ANTHROPIC_API_KEY    required (unless --dry-run)
 *   MAX_DAILY_USD        default 5 (per A.14t T6 spec)
 *   ANTHROPIC_MODEL      default claude-opus-4-7
 *
 * Usage:
 *   node scripts/generate-case-study.mjs --slug=brand-campaign
 *   node scripts/generate-case-study.mjs --slug=brand-campaign --dry-run
 *   node scripts/generate-case-study.mjs --help
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const UGC_ROOT = 'C:/Users/julia/OneDrive/Desktop/UGC';

const ARGS = process.argv.slice(2);
const FLAGS = new Set(ARGS.filter((a) => !a.includes('=') || a.startsWith('--dry-run')));
const KV = Object.fromEntries(
  ARGS.filter((a) => a.includes('='))
    .map((a) => a.replace(/^--/, '').split('=', 2)),
);

const DRY_RUN = ARGS.some((a) => a === '--dry-run' || a.startsWith('--dry-run'));
const HELP = ARGS.some((a) => a === '--help' || a === '-h');
const SLUG = KV.slug ?? null;

const TEMPLATE_PATH = path.join(UGC_ROOT, '_meta', 'templates', 'CASE-STUDY-TEMPLATE.md');
const CAMPAIGNS_JSONL = path.join(REPO_ROOT, 'data', 'campaigns-created.jsonl');
const OUTPUT_DIR = path.join(REPO_ROOT, 'scripts', 'cron-output');
const SPEND_LEDGER = path.join(OUTPUT_DIR, 'case-study-spend.jsonl');

const MAX_DAILY_USD = Number(process.env.MAX_DAILY_USD ?? 5);
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-7';

const PRICING = {
  'claude-opus-4-5-20250929':    { input: 15, output: 75 },
  'claude-opus-4-7':    { input: 15, output: 75 },
  'claude-sonnet-4-5-20250929':  { input: 3,  output: 15 },
  default:                       { input: 15, output: 75 },
};

const RUN_ID = `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;
const RUN_LOG = path.join(OUTPUT_DIR, `case-study-run-${RUN_ID}.log`);

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
// help
// ----------------------------------------------------------------------------
function printHelp() {
  console.log(`
generate-case-study.mjs — Draft CASE-STUDY.md from a UGC campaign folder.

Usage:
  node scripts/generate-case-study.mjs --slug=<campaign-slug>
  node scripts/generate-case-study.mjs --slug=<campaign-slug> --dry-run
  node scripts/generate-case-study.mjs --help

Flags:
  --slug=<slug>   REQUIRED — name of campaign folder under UGC/
  --dry-run       Skip Anthropic call + write. Print what would happen.
  --help, -h      Print this help.

Env:
  ANTHROPIC_API_KEY   required for real runs
  MAX_DAILY_USD       default 5
  ANTHROPIC_MODEL     default claude-opus-4-7

Reads (best-effort, missing files OK):
  UGC/<slug>/03-sow-breakdown.md
  UGC/<slug>/06-script.md
  UGC/<slug>/13-qa.md
  UGC/<slug>/*metrics*.md
  UGC/_meta/templates/CASE-STUDY-TEMPLATE.md
  data/campaigns-created.jsonl  (for status snapshot)

Writes:
  UGC/<slug>/CASE-STUDY.md
  scripts/cron-output/case-study-spend.jsonl
`);
}

// ----------------------------------------------------------------------------
// jsonl I/O
// ----------------------------------------------------------------------------
async function readJsonl(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return raw.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => JSON.parse(l));
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

async function appendSpend(entry) {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.appendFile(SPEND_LEDGER, JSON.stringify(entry) + '\n', 'utf8');
}

async function readSpendToday() {
  try {
    const raw = await fs.readFile(SPEND_LEDGER, 'utf8');
    const today = new Date().toISOString().slice(0, 10);
    return raw.split('\n').filter(Boolean).map((l) => JSON.parse(l))
      .filter((r) => r.ts?.startsWith(today))
      .reduce((sum, r) => sum + (r.usd ?? 0), 0);
  } catch (e) {
    if (e.code === 'ENOENT') return 0;
    throw e;
  }
}

function priceUsd({ inputTokens, outputTokens, model }) {
  const p = PRICING[model] ?? PRICING.default;
  return (inputTokens / 1_000_000) * p.input + (outputTokens / 1_000_000) * p.output;
}

// ----------------------------------------------------------------------------
// best-effort file reader
// ----------------------------------------------------------------------------
async function readOrNull(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
}

async function findFirstMatch(dir, regex) {
  try {
    const entries = await fs.readdir(dir);
    const match = entries.find((e) => regex.test(e));
    if (!match) return null;
    return await fs.readFile(path.join(dir, match), 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
}

// ----------------------------------------------------------------------------
// gather campaign source-of-truth bundle
// ----------------------------------------------------------------------------
async function gatherCampaignSources(slug) {
  const campaignDir = path.join(UGC_ROOT, slug);
  const exists = await fs.stat(campaignDir).then(() => true).catch(() => false);
  if (!exists) {
    throw new Error(`Campaign folder not found: ${campaignDir}`);
  }

  const sow = await readOrNull(path.join(campaignDir, '03-sow-breakdown.md'));
  const script = await readOrNull(path.join(campaignDir, '06-script.md'));
  const qa = await readOrNull(path.join(campaignDir, '13-qa.md'));
  const metrics = await findFirstMatch(campaignDir, /metrics|performance/i);
  const template = await readOrNull(TEMPLATE_PATH);

  const campaigns = await readJsonl(CAMPAIGNS_JSONL);
  const campaignRecord = campaigns.find((c) => c.slug === slug) ?? null;

  return { campaignDir, sow, script, qa, metrics, template, campaignRecord };
}

// ----------------------------------------------------------------------------
// system prompt (inline — HR-1 sources cited verbatim from JULZ-RULES.md voice spec)
// ----------------------------------------------------------------------------
function buildSystemPrompt({ template }) {
  return [
    "You are Julianne (Julz) Silla's case-study writer.",
    "",
    "VOICE — Tier 1 canonical (every output): clear · structured · strategic · practical · polished · bold · semi-casual · punchy · high-standard. Bestie + direct. No fluff. Short over long.",
    "",
    "BANS: \"Hey guys\" · overpromise language (\"guaranteed,\" \"viral,\" \"the best\") · hardship reveals that shift focus from the work.",
    "",
    "JOB: Draft a CASE-STUDY.md for the campaign whose source files are pasted below. The output must follow the EXACT structure of the template (also pasted below). Fill EVERY section. Where source data is missing for a section, write a single italicized placeholder line in brackets: e.g., *[Performance — pending metrics sync]* — do NOT invent numbers.",
    "",
    "REQUIRED SECTIONS (in this order, matching template):",
    "1. Title line: `# Case Study — <BRAND> · <CAMPAIGN>`",
    "2. At a Glance table",
    "3. The Brief (1-2 sentence summary + mandatories + FTC + usage rights)",
    "4. The Concept (hook verbatim, 3-5 bullet story arc, why-this-fit rationale)",
    "5. The Deliverables (table of assets)",
    "6. The Performance (metrics table — placeholder italics if no metrics in source)",
    "7. What Worked (3 numbered wins with 2-3 sentence breakdowns — strategic, data-anchored)",
    "8. What I'd Build On Next (2 numbered insights)",
    "9. Learnings (5 bullets: hook pattern, story structure, brand integration, platform cues, audience signal)",
    "10. Social Proof (testimonial placeholder + top comments — italic placeholder if none)",
    "11. Portfolio Card (40-50 word version for juliannesilla.com — lead with deliverable, weave headline metric IF available, end with strategic insight)",
    "12. Status checklist (mark `Metrics logged` and `Case study auto-generated by W8` ✅, rest blank)",
    "",
    "QUALITY BAR — what Julz brings:",
    "- Lead with strategic intent, not creative interpretation",
    "- Cite SOW alignment explicitly (\"shipped to brief\" framing)",
    "- Anchor every win in either a metric OR a concrete craft decision (hook choice, b-roll cut, pacing call)",
    "- Reference Julz's positioning verbatim where it lands: \"marketing operator first, creator second\" / \"13-stage execution OS\" / \"reads the SOW before opening the camera\"",
    "- The Portfolio Card paragraph is the headline asset — sweat it.",
    "",
    "OUTPUT: Pure markdown. No fences, no preamble, no \"Here's the case study:\". Just the document, ready to write to disk.",
    "",
    "--- CASE-STUDY-TEMPLATE.md (source of truth for structure) ---",
    template ?? '[template not found — match section list above]',
    "--- END TEMPLATE ---",
  ].join('\n');
}

function buildUserPayload({ slug, sow, script, qa, metrics, campaignRecord }) {
  const parts = [
    `Campaign slug: ${slug}`,
    '',
    campaignRecord
      ? `--- CAMPAIGN RECORD (from data/campaigns-created.jsonl) ---\n${JSON.stringify(campaignRecord, null, 2)}\n--- END RECORD ---`
      : '*[no campaign record in data/campaigns-created.jsonl]*',
    '',
    sow
      ? `--- 03-sow-breakdown.md ---\n${sow}\n--- END SOW ---`
      : '*[03-sow-breakdown.md not present — placeholder mandatories]*',
    '',
    script
      ? `--- 06-script.md ---\n${script}\n--- END SCRIPT ---`
      : '*[06-script.md not present — placeholder hook + arc]*',
    '',
    qa
      ? `--- 13-qa.md ---\n${qa}\n--- END QA ---`
      : '*[13-qa.md not present]*',
    '',
    metrics
      ? `--- metrics/performance file ---\n${metrics}\n--- END METRICS ---`
      : '*[no metrics file in campaign folder — Performance section uses italic placeholders]*',
    '',
    'Draft the CASE-STUDY.md now. Pure markdown. No preamble.',
  ];
  return parts.join('\n');
}

// ----------------------------------------------------------------------------
// Anthropic call
// ----------------------------------------------------------------------------
async function callClaude({ systemPrompt, userMessage }) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 8_000,
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

  // Strip accidental fences (model sometimes wraps despite instructions)
  let md = text.trim();
  if (md.startsWith('```')) {
    md = md.replace(/^```(?:markdown|md)?\s*/i, '').replace(/```\s*$/, '');
  }

  return { markdown: md, usage, session_id: final.id };
}

// ----------------------------------------------------------------------------
// main
// ----------------------------------------------------------------------------
async function main() {
  if (HELP) {
    printHelp();
    return 0;
  }

  if (!SLUG) {
    err('Missing required --slug=<campaign-slug>');
    printHelp();
    return 1;
  }

  info(`run_id=${RUN_ID} slug=${SLUG} dry_run=${DRY_RUN} model=${MODEL}`);

  const sources = await gatherCampaignSources(SLUG);
  info(`sources gathered — sow=${!!sources.sow} script=${!!sources.script} qa=${!!sources.qa} metrics=${!!sources.metrics} template=${!!sources.template}`);

  if (!sources.template) {
    warn(`CASE-STUDY-TEMPLATE.md not found at ${TEMPLATE_PATH} — proceeding with inline section list`);
  }

  const outputPath = path.join(sources.campaignDir, 'CASE-STUDY.md');

  if (DRY_RUN) {
    info('--dry-run: skipping Anthropic call + write');
    info(`would write to: ${outputPath}`);
    info(`would call model: ${MODEL}`);
    return 0;
  }

  // HR-10 access honesty
  if (!process.env.ANTHROPIC_API_KEY) {
    err('ANTHROPIC_API_KEY not set — cannot generate case study.');
    err('Remediation: set ANTHROPIC_API_KEY in your shell (export ANTHROPIC_API_KEY=sk-ant-...)');
    err('Or run with --dry-run to preview behavior without an API call.');
    return 0;
  }

  const spentToday = await readSpendToday();
  info(`spent_today_usd=${spentToday.toFixed(4)} cap=${MAX_DAILY_USD}`);
  if (spentToday >= MAX_DAILY_USD) {
    warn(`Daily spend cap reached ($${spentToday.toFixed(2)} >= $${MAX_DAILY_USD}); skipping run`);
    return 0;
  }

  const systemPrompt = buildSystemPrompt({ template: sources.template });
  const userMessage = buildUserPayload({ slug: SLUG, ...sources });

  info(`calling Claude API (${MODEL}) to draft case study for slug=${SLUG}`);
  const { markdown, usage, session_id } = await callClaude({ systemPrompt, userMessage });

  const usd = priceUsd({
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    model: MODEL,
  });
  await appendSpend({
    ts: new Date().toISOString(),
    run_id: RUN_ID,
    slug: SLUG,
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    usd,
    model: MODEL,
    session_id,
  });
  info(`spend=$${usd.toFixed(4)} in=${usage.input_tokens} out=${usage.output_tokens} session=${session_id}`);

  if (!markdown || markdown.length < 200) {
    err(`Model returned suspiciously short output (${markdown.length} chars); aborting write`);
    return 1;
  }

  await fs.writeFile(outputPath, markdown, 'utf8');

  // HR-34 verify own write
  const stat = await fs.stat(outputPath);
  info(`wrote CASE-STUDY.md (${stat.size} bytes) to ${outputPath}`);
  info(`done: session=${session_id}`);
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
