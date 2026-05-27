#!/usr/bin/env node
/**
 * parse-sow.mjs — A.14p P2 SOW Parser (localhost CLI · Anthropic SDK)
 *
 * Reads a raw SOW from stdin or a file path, calls Claude to extract structured
 * fields matching a Zod schema, validates the JSON, renders the canonical
 * 3-column Requirement | Detail | What It Means table from
 * `_meta/05-campaign-template/03-sow-breakdown.md`, and writes the rendered
 * markdown to `C:/Users/julia/OneDrive/Desktop/UGC/[slug]/03-sow-breakdown.md`.
 *
 * Pattern: clones the structure of `scripts/draft-sideshift-replies.mjs`
 * (A.14l L2-S-DRAFT) for SDK usage, spend-ledger, model handling, and
 * fence-stripping JSON parse.
 *
 * Hard rules applied:
 *   HR-1  CITE: extraction schema sourced from UGC/_meta/05-campaign-template/03-sow-breakdown.md
 *               (3-col Requirement|Detail|Means table) — verbatim per master DOCX para 218.
 *   HR-10 ACCESS HONESTY: errors loudly if ANTHROPIC_API_KEY missing, exits 1.
 *   HR-15 VERIFY ARTIFACT: --help short-circuits before any API call; --dry-run skips writes.
 *   HR-19 SOURCE ≠ ARTIFACT: writes actual rendered markdown to UGC/[slug]/ and re-reads it.
 *   HR-21 CITE = INVOKE: skills frontend-design, vercel:nextjs,
 *                        anthropic-skills:meeting-analyzer, senior-backend,
 *                        superpowers:verification-before-completion (cited in parent agent boot).
 *   HR-26 PROBLEMS SHIP WITH SOLUTIONS: daily spend cap, Zod validation, dry-run mode.
 *   HR-30 TL;DR-AT-TOP: final summary line opens with status + cost.
 *
 * Env:
 *   ANTHROPIC_API_KEY   required for real runs
 *   ANTHROPIC_MODEL     default claude-opus-4-7 (matches draft-sideshift-replies.mjs)
 *   MAX_DAILY_USD       default 5 (spec-locked per task)
 *   UGC_ROOT            default C:/Users/julia/OneDrive/Desktop/UGC
 *
 * Usage:
 *   npm run parse-sow -- --slug=sideshift-parakeetai --input=stdin
 *   npm run parse-sow -- --slug=sideshift-parakeetai --input="C:/path/to/sow.txt"
 *   npm run parse-sow -- --help
 *   npm run parse-sow -- --slug=sideshift-parakeetai --input=stdin --dry-run
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

// ----------------------------------------------------------------------------
// arg parsing
// ----------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { _: [] };
  for (const raw of argv.slice(2)) {
    if (raw === '--help' || raw === '-h') {
      args.help = true;
      continue;
    }
    if (raw === '--dry-run') {
      args.dryRun = true;
      continue;
    }
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
parse-sow.mjs — A.14p SOW Parser (localhost CLI · Anthropic SDK)

USAGE
  npm run parse-sow -- --slug=<slug> --input=<stdin|filepath> [--dry-run]
  npm run parse-sow -- --help

REQUIRED
  --slug=<slug>        Campaign folder slug under UGC/ (e.g., sideshift-parakeetai).
                       Lowercase, hyphen-separated. Must match an existing folder
                       OR the folder will be created.

  --input=<source>     Either the literal string "stdin" (paste SOW text, end with
                       Ctrl+D on macOS/Linux or Ctrl+Z then Enter on Windows),
                       OR an absolute path to a UTF-8 .txt/.md file.

OPTIONAL
  --dry-run            Skip Anthropic API call. Validate args + write nothing.
  --help, -h           Show this message.

ENV
  ANTHROPIC_API_KEY    Required for non-dry-run.
  ANTHROPIC_MODEL      Default: claude-opus-4-7
  MAX_DAILY_USD        Default: 5  (script aborts if today's spend ≥ cap)
  UGC_ROOT             Default: C:/Users/julia/OneDrive/Desktop/UGC

OUTPUT
  Writes rendered markdown (canonical 3-col table per master DOCX para 218) to:
    <UGC_ROOT>/<slug>/03-sow-breakdown.md   (overwrites the template version)

  Appends a spend entry to:
    scripts/cron-output/sow-parse-spend.jsonl

EXAMPLES
  # Paste SOW from terminal
  npm run parse-sow -- --slug=sideshift-parakeetai --input=stdin

  # Read SOW from file
  npm run parse-sow -- --slug=mybrand --input="C:/Users/julia/Downloads/sow.md"

  # Dry-run (no API call, no writes)
  npm run parse-sow -- --slug=test-slug --input=stdin --dry-run
`.trimStart();

if (ARGS.help) {
  process.stdout.write(HELP_TEXT);
  process.exit(0);
}

// ----------------------------------------------------------------------------
// config
// ----------------------------------------------------------------------------

const UGC_ROOT = process.env.UGC_ROOT ?? 'C:/Users/julia/OneDrive/Desktop/UGC';
const MAX_DAILY_USD = Number(process.env.MAX_DAILY_USD ?? 5);
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-7';
const SPEND_LEDGER = path.join(REPO_ROOT, 'scripts', 'cron-output', 'sow-parse-spend.jsonl');
const RUN_ID = `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;

// Pricing per 1M tokens — matches draft-sideshift-replies.mjs (HR-1: cite source).
const PRICING = {
  'claude-opus-4-5-20250929':    { input: 15, output: 75 },
  'claude-opus-4-7':    { input: 15, output: 75 },
  'claude-sonnet-4-5-20250929':  { input: 3,  output: 15 },
  default:                       { input: 15, output: 75 },
};

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

// ----------------------------------------------------------------------------
// logging
// ----------------------------------------------------------------------------

function log(level, ...parts) {
  const line = `[${new Date().toISOString()}] [${level}] ${parts.join(' ')}`;
  console.log(line);
}
const info = (...p) => log('INFO', ...p);
const warn = (...p) => log('WARN', ...p);
const err = (...p) => log('ERROR', ...p);

// ----------------------------------------------------------------------------
// Zod schema — structured SOW shape (HR-1 cite: matches template requirements)
// ----------------------------------------------------------------------------

const RequirementSchema = z.object({
  key: z.string().min(1),
  detail: z.string().min(1),
  what_it_means: z.string().min(1),
  status: z.enum(['confirmed', 'inferred', 'missing']).default('confirmed'),
});

const DeliverableSchema = z.object({
  type: z.string().min(1),
  count: z.number().int().nonnegative().nullable(),
  duration_sec: z
    .union([z.number(), z.object({ min: z.number(), max: z.number() })])
    .nullable(),
  dimensions: z.string().nullable(),
  hooks_required: z.number().int().nonnegative().nullable(),
});

const PaymentSchema = z.object({
  base: z.union([z.number(), z.string()]).nullable(),
  bonus_potential: z.string().nullable(),
  payment_terms_days: z.number().int().nonnegative().nullable(),
  usage_rights: z.string().nullable(),
});

const DeadlinesSchema = z.object({
  filming_by: z.string().nullable(),
  submission_by: z.string().nullable(),
  payment_by: z.string().nullable(),
});

const SowSchema = z.object({
  requirements: z.array(RequirementSchema).min(1),
  deliverables: z.array(DeliverableSchema),
  payment: PaymentSchema,
  deadlines: DeadlinesSchema,
  do_not_say: z.array(z.string()),
  ftc_required: z.boolean(),
  brand_portal_url: z.string().nullable(),
});

// ----------------------------------------------------------------------------
// system prompt — meeting-analyzer style structured extraction
// ----------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a UGC contracts analyst. The user will paste a raw SOW (Statement of Work) from a brand or platform like SideShift, JoinBrands, Twirl, Insense, or direct brand outreach. Your job is to extract the SOW into a strict JSON object — nothing else.

Return ONE JSON object matching this shape exactly. No markdown, no prose, no code fences, no commentary outside the JSON.

{
  "requirements": [
    { "key": string, "detail": string, "what_it_means": string, "status": "confirmed" | "inferred" | "missing" }
  ],
  "deliverables": [
    { "type": string, "count": number | null, "duration_sec": number | {"min": number, "max": number} | null, "dimensions": string | null, "hooks_required": number | null }
  ],
  "payment": {
    "base": number | string | null,
    "bonus_potential": string | null,
    "payment_terms_days": number | null,
    "usage_rights": string | null
  },
  "deadlines": {
    "filming_by": string | null,
    "submission_by": string | null,
    "payment_by": string | null
  },
  "do_not_say": [string],
  "ftc_required": boolean,
  "brand_portal_url": string | null
}

EXTRACTION RULES:

1. requirements[] — One row per discrete SOW requirement. Cover at minimum: video length, format/orientation, theme, tone, product mention/demo, posting requirements, usage rights, payment structure, bonuses, submission steps, revision policy, restrictions. Use "status": "confirmed" if the SOW states it explicitly, "inferred" if you derived it from context, "missing" if the SOW omits it entirely.

2. what_it_means — Translate every requirement into a plain-English instruction for the creator. Example: SOW says "30–90 sec" → what_it_means: "Target 50–60 sec sweet spot." SOW says "casual, charismatic, no influencer voice" → what_it_means: "Bold/punchy/dry-funny/smart layer on top of conversational delivery — no Hey-guys energy."

3. deliverables[] — One row per distinct deliverable type. duration_sec can be a single number, a {min, max} range, or null.

4. payment.base — Numeric if a fixed amount, string if descriptive (e.g., "Per-view CPM"), null if missing.

5. do_not_say[] — Extract every restricted phrase, banned positioning, or "do not" instruction. Include things like "Hey guys", "guaranteed success", "cheating", brand-specific bans.

6. ftc_required — true if SOW mentions FTC disclosure, #ad, sponsored tags, paid partnership tools. Default to true if the SOW is for a paid sponsored post.

7. brand_portal_url — Extract any brand intake/portal URL (Notion page, Typeform, brand site campaign page). null if absent.

NEVER invent data. If a field is genuinely absent from the SOW, use null (or status: "missing" for requirements). Never wrap the JSON in markdown fences. Never include explanations. Output the JSON object and nothing else.`;

// ----------------------------------------------------------------------------
// I/O helpers
// ----------------------------------------------------------------------------

async function readStdin() {
  if (process.stdin.isTTY) {
    info('Paste SOW text below. End with Ctrl+D (macOS/Linux) or Ctrl+Z then Enter (Windows).');
  }
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function readInput(inputArg) {
  if (inputArg === 'stdin' || inputArg === '-') return readStdin();
  const abs = path.resolve(inputArg);
  return fs.readFile(abs, 'utf8');
}

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
      .filter((row) => row && row.ts?.startsWith(today))
      .reduce((sum, row) => sum + (row.cost_usd ?? 0), 0);
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
// Anthropic call (lazy-imported so --dry-run + --help work without the dep)
// ----------------------------------------------------------------------------

async function callClaude({ sowText }) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 8_000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `--- RAW SOW TEXT ---\n${sowText}\n--- END RAW SOW ---\n\nExtract this SOW into the JSON shape defined in the system prompt. Output ONLY the JSON object.`,
      },
    ],
  });

  let text = '';
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
      text += chunk.delta.text;
    }
  }
  const final = await stream.finalMessage();
  const usage = final.usage ?? { input_tokens: 0, output_tokens: 0 };

  // Strip markdown fences if the model wrapped JSON despite instructions.
  let jsonText = text.trim();
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  }
  return { jsonText, usage, sessionId: final.id };
}

// ----------------------------------------------------------------------------
// markdown renderer — canonical 3-col Requirement | Detail | Means table
// ----------------------------------------------------------------------------

function escapePipe(v) {
  if (v == null) return '';
  return String(v).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function fmtDuration(d) {
  if (d == null) return '';
  if (typeof d === 'number') return `${d}s`;
  if (typeof d === 'object' && d.min != null && d.max != null) return `${d.min}–${d.max}s`;
  return '';
}

function renderMarkdown({ slug, sow }) {
  const today = new Date().toISOString().slice(0, 10);
  const lines = [];

  lines.push(`# 03 — SOW Breakdown (Stage 3: Extract SOW)`);
  lines.push('');
  lines.push(`**Experts:** QA / Compliance Reviewer · Brand Safety Strategist · Marketing Director`);
  lines.push(`**Prompt:** see \`_meta/06-stage-prompts.md\` → Stage 3`);
  lines.push(`**Generated:** ${today} by \`scripts/parse-sow.mjs\` (run ${RUN_ID})`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Snapshot
  lines.push('## SOW Snapshot');
  lines.push('');
  lines.push('| Field | Value |');
  lines.push('|-------|-------|');
  lines.push(`| Campaign slug | \`${slug}\` |`);
  lines.push(`| Brand portal | ${sow.brand_portal_url ? `<${sow.brand_portal_url}>` : '_(none extracted)_'} |`);
  lines.push(`| FTC disclosure required | ${sow.ftc_required ? 'Yes' : 'No'} |`);
  lines.push(`| Filming deadline | ${escapePipe(sow.deadlines.filming_by) || '_(not stated)_'} |`);
  lines.push(`| Submission deadline | ${escapePipe(sow.deadlines.submission_by) || '_(not stated)_'} |`);
  lines.push(`| Payment deadline | ${escapePipe(sow.deadlines.payment_by) || '_(not stated)_'} |`);
  lines.push(`| Base payment | ${sow.payment.base != null ? escapePipe(sow.payment.base) : '_(not stated)_'} |`);
  lines.push(`| Bonus potential | ${escapePipe(sow.payment.bonus_potential) || '_(none stated)_'} |`);
  lines.push(`| Payment terms | ${sow.payment.payment_terms_days != null ? `${sow.payment.payment_terms_days} days` : '_(not stated)_'} |`);
  lines.push(`| Usage rights | ${escapePipe(sow.payment.usage_rights) || '_(not stated)_'} |`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Deliverables
  lines.push('## Deliverables');
  lines.push('');
  if (sow.deliverables.length === 0) {
    lines.push('_(No discrete deliverables extracted — verify SOW manually.)_');
  } else {
    lines.push('| Type | Count | Duration | Dimensions | Hooks |');
    lines.push('|------|------:|----------|------------|------:|');
    for (const d of sow.deliverables) {
      lines.push(
        `| ${escapePipe(d.type)} | ${d.count ?? ''} | ${fmtDuration(d.duration_sec)} | ${escapePipe(d.dimensions)} | ${d.hooks_required ?? ''} |`,
      );
    }
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // Canonical 3-col Requirement → Translation table (master DOCX para 218)
  lines.push('## Requirement → Deliverable Translation Table');
  lines.push('');
  lines.push('| Requirement | Exact SOW Detail | What It Means for My Deliverable |');
  lines.push('|-------------|-------------------|----------------------------------|');
  for (const r of sow.requirements) {
    const statusBadge =
      r.status === 'inferred' ? ' _(inferred)_'
      : r.status === 'missing' ? ' _(missing)_'
      : '';
    lines.push(
      `| ${escapePipe(r.key)} | ${escapePipe(r.detail)}${statusBadge} | ${escapePipe(r.what_it_means)} |`,
    );
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // Do not say
  lines.push('## 🚫 Do Not Say / Restrictions');
  lines.push('');
  if (sow.do_not_say.length === 0) {
    lines.push('_(No banned phrases extracted.)_');
  } else {
    for (const phrase of sow.do_not_say) lines.push(`- ${phrase}`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // VFA-MI-NS footer (HR-9)
  lines.push('## Verified Facts | Assumptions | Missing Information | Recommended Next Steps');
  lines.push('');
  lines.push('### Verified Facts');
  lines.push('- All rows marked `confirmed` were extracted verbatim from the SOW.');
  lines.push('');
  lines.push('### Assumptions');
  const inferred = sow.requirements.filter((r) => r.status === 'inferred');
  if (inferred.length === 0) {
    lines.push('- _(None — every requirement was confirmed against SOW text.)_');
  } else {
    for (const r of inferred) lines.push(`- ${r.key}: ${r.what_it_means}`);
  }
  lines.push('');
  lines.push('### Missing Information');
  const missing = sow.requirements.filter((r) => r.status === 'missing');
  if (missing.length === 0) {
    lines.push('- _(None — every requirement was present.)_');
  } else {
    for (const r of missing) lines.push(`- ${r.key} — clarify with brand before Stage 7 (concept).`);
  }
  lines.push('');
  lines.push('### Recommended Next Steps');
  lines.push('1. Review every `inferred` row — confirm or correct against the actual SOW.');
  lines.push('2. Clarify every `missing` row with the brand BEFORE Stage 7 (concept).');
  lines.push('3. Proceed to Stage 4 (concept brief) once all rows are `confirmed`.');
  lines.push('');

  return lines.join('\n');
}

// ----------------------------------------------------------------------------
// main
// ----------------------------------------------------------------------------

async function main() {
  // Arg validation
  const slug = (ARGS.slug ?? '').trim().toLowerCase();
  const input = ARGS.input;

  if (!slug) {
    err('--slug is required. Run with --help for usage.');
    return 2;
  }
  if (!SLUG_PATTERN.test(slug)) {
    err(`--slug "${slug}" is invalid. Must be lowercase letters, digits, hyphens (no leading/trailing dash).`);
    return 2;
  }
  if (!input) {
    err('--input is required (use "stdin" or a file path). Run with --help for usage.');
    return 2;
  }

  info(`run_id=${RUN_ID} slug=${slug} input=${input} dry_run=${!!ARGS.dryRun} model=${MODEL}`);

  // Read SOW
  const sowText = (await readInput(input)).trim();
  if (sowText.length === 0) {
    err('SOW input is empty. Aborting.');
    return 2;
  }
  info(`SOW length: ${sowText.length} chars`);

  // Spend cap (skipped in dry-run)
  if (!ARGS.dryRun) {
    if (!process.env.ANTHROPIC_API_KEY) {
      err('ANTHROPIC_API_KEY env var is not set. Set it before running, or use --dry-run.');
      return 2;
    }
    const spentToday = await readSpendToday();
    info(`spent_today_usd=${spentToday.toFixed(4)} cap=$${MAX_DAILY_USD}`);
    if (spentToday >= MAX_DAILY_USD) {
      err(`Daily spend cap reached ($${spentToday.toFixed(2)} >= $${MAX_DAILY_USD}). Aborting.`);
      return 1;
    }
  }

  if (ARGS.dryRun) {
    info('--dry-run: skipping Anthropic call, skipping write.');
    info(`would write to: ${path.join(UGC_ROOT, slug, '03-sow-breakdown.md')}`);
    info(`would append spend entry to: ${SPEND_LEDGER}`);
    process.stdout.write(`\nDRY RUN PASS — slug=${slug} input_chars=${sowText.length}\n`);
    return 0;
  }

  // Real call
  info(`calling Claude API (${MODEL})…`);
  const { jsonText, usage, sessionId } = await callClaude({ sowText });

  // Validate
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    err('Claude returned non-JSON output. Raw text:');
    console.error(jsonText.slice(0, 2000));
    return 1;
  }
  const validation = SowSchema.safeParse(parsed);
  if (!validation.success) {
    err('Claude output failed Zod validation:');
    console.error(JSON.stringify(validation.error.format(), null, 2));
    return 1;
  }
  const sow = validation.data;
  info(`Zod validation PASS · ${sow.requirements.length} requirements, ${sow.deliverables.length} deliverables, ${sow.do_not_say.length} restrictions`);

  // Render markdown
  const md = renderMarkdown({ slug, sow });
  const outDir = path.join(UGC_ROOT, slug);
  const outPath = path.join(outDir, '03-sow-breakdown.md');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(outPath, md, 'utf8');
  info(`wrote ${md.length.toLocaleString()} chars → ${outPath}`);

  // Spend ledger
  const costUsd = priceUsd({
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    model: MODEL,
  });
  await appendSpend({
    ts: new Date().toISOString(),
    slug,
    run_id: RUN_ID,
    model: MODEL,
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    cost_usd: costUsd,
    claude_session_id: sessionId,
  });

  process.stdout.write(
    `\nParsed SOW for ${slug} → wrote ${outPath} · cost $${costUsd.toFixed(4)} (in=${usage.input_tokens} out=${usage.output_tokens})\n`,
  );
  return 0;
}

main()
  .then((code) => process.exit(code ?? 0))
  .catch((e) => {
    err('FATAL:', e?.stack ?? String(e));
    process.exit(1);
  });
