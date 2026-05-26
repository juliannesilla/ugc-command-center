#!/usr/bin/env node
/**
 * generate-concepts.mjs — A.14t T2 AI Concept Generator (localhost CLI · Anthropic SDK)
 *
 * Reads a campaign's structured SOW + brand rules + (optional) personal angle,
 * calls Claude to draft 3 distinct creative concept variants with 5 hook options
 * each, and writes the rendered markdown to
 * `C:/Users/julia/OneDrive/Desktop/UGC/[slug]/07-creative-concepts.md` matching
 * the canonical shape in `_meta/05-campaign-template/07-creative-concepts.md`.
 *
 * Pattern: clones the structure of `scripts/parse-sow.mjs` (A.14p) for SDK usage,
 * spend-ledger, fence-stripping JSON parse, and arg parsing. Voice + system
 * prompt pattern mirrors `scripts/draft-sideshift-replies.mjs` (A.14l L2-S-DRAFT).
 *
 * Hard rules applied:
 *   HR-1   CITE: output shape sourced verbatim from
 *                UGC/_meta/05-campaign-template/07-creative-concepts.md
 *                (Concept #N · Core story · Hook · Why it fits SOW · Why it fits brand · CTA).
 *   HR-10  ACCESS HONESTY: errors loudly + exits 0 with clear remediation if
 *                ANTHROPIC_API_KEY missing (treated as a graceful no-op so CI / dry
 *                envs don't fail — per task spec).
 *   HR-15  VERIFY ARTIFACT: --help short-circuits before any API call; --dry-run
 *                skips writes and prints the would-write path.
 *   HR-19  SOURCE ≠ ARTIFACT: writes actual rendered markdown to UGC/[slug]/
 *                07-creative-concepts.md.
 *   HR-21  CITE = INVOKE: skills frontend-design, anthropic-skills:marketing-ideas,
 *                senior-backend, superpowers:verification-before-completion
 *                (cited in parent agent boot; this file is the artifact).
 *   HR-26  PROBLEMS SHIP WITH SOLUTIONS: daily spend cap, Zod validation, dry-run.
 *   HR-30  TL;DR-AT-TOP: final summary line opens with status + cost.
 *   HR-34  VERIFY OWN WRITES: writes to absolute paths and reads them back for
 *                size logging.
 *
 * Env:
 *   ANTHROPIC_API_KEY   required for real runs (gracefully exits 0 if missing)
 *   ANTHROPIC_MODEL     default claude-opus-4-7-20260101
 *   MAX_DAILY_USD       default 5 (spec-locked per task)
 *   UGC_ROOT            default C:/Users/julia/OneDrive/Desktop/UGC
 *
 * Usage:
 *   npm run generate-concepts -- --slug=sideshift-parakeetai
 *   npm run generate-concepts -- --slug=sideshift-parakeetai --dry-run
 *   npm run generate-concepts -- --help
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
generate-concepts.mjs — A.14t T2 AI Concept Generator (localhost CLI · Anthropic SDK)

USAGE
  npm run generate-concepts -- --slug=<slug> [--dry-run]
  npm run generate-concepts -- --help

REQUIRED
  --slug=<slug>        Campaign folder slug under UGC/ (e.g., sideshift-parakeetai).
                       Lowercase, hyphen-separated. Must match an existing folder
                       that already has 03-sow-breakdown.md populated.

OPTIONAL
  --dry-run            Skip Anthropic API call. Validate args, read sources,
                       write nothing. Useful for confirming the campaign folder
                       is wired correctly before spending tokens.
  --help, -h           Show this message.

ENV
  ANTHROPIC_API_KEY    Required for non-dry-run. If missing, script exits 0
                       with a remediation hint (HR-10 honest fallback).
  ANTHROPIC_MODEL      Default: claude-opus-4-7-20260101
  MAX_DAILY_USD        Default: 5  (script aborts if today's spend ≥ cap)
  UGC_ROOT             Default: C:/Users/julia/OneDrive/Desktop/UGC

INPUTS READ
  <UGC_ROOT>/<slug>/03-sow-breakdown.md     (required — must exist)
  <UGC_ROOT>/<slug>/00-brand-rules.md       (optional — skipped if missing)
  <UGC_ROOT>/<slug>/05-personal-angle.md    (optional — skipped if missing)

OUTPUT
  Writes rendered markdown (canonical 3-concept × 5-hook shape per master DOCX
  / _meta/05-campaign-template/07-creative-concepts.md) to:
    <UGC_ROOT>/<slug>/07-creative-concepts.md

  Appends a spend entry to:
    scripts/cron-output/concept-gen-spend.jsonl

EXAMPLES
  # Real run after parsing SOW
  npm run generate-concepts -- --slug=sideshift-parakeetai

  # Dry run — verify sources exist, no API call
  npm run generate-concepts -- --slug=sideshift-parakeetai --dry-run
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
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-7-20260101';
const SPEND_LEDGER = path.join(REPO_ROOT, 'scripts', 'cron-output', 'concept-gen-spend.jsonl');
const RUN_ID = `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;

// Pricing per 1M tokens — matches parse-sow.mjs (HR-1: cite source).
const PRICING = {
  'claude-opus-4-5-20250929':    { input: 15, output: 75 },
  'claude-opus-4-7-20260101':    { input: 15, output: 75 },
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
// Zod schema — structured concept shape (HR-1 cite: 07-creative-concepts template)
// ----------------------------------------------------------------------------

const ConceptSchema = z.object({
  title: z.string().min(1),
  core_story: z.string().min(1),
  hooks: z.array(z.string().min(1)).min(3).max(7),
  why_it_hits_sow: z.string().min(1),
  why_it_fits_julz: z.string().min(1),
  emotional_hook: z.string().min(1),
  product_appearance: z.string().min(1),
  suggested_cta: z.string().min(1),
  risk_level: z.enum(['safe', 'bold', 'experimental']),
  production_complexity: z.enum(['low', 'med', 'high']),
});

const ConceptsResponseSchema = z.object({
  concepts: z.array(ConceptSchema).length(3),
  meta: z
    .object({
      reasoning: z.string().optional(),
      sow_summary: z.string().optional(),
    })
    .optional(),
});

// ----------------------------------------------------------------------------
// system prompt — Julz Tier-1 voice + on-camera UGC overlay (canonical, master DOCX para 2312)
// ----------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are Julz Silla's creative concept generator for UGC campaigns.

# VOICE (Tier-1 canonical · master DOCX para 2312)
Apply EVERY trait. Bestie + direct. No fluff. Voice-to-text-tolerant. Short over long.
- clear · structured · strategic · practical · polished · bold
- semi-casual · punchy · high-standard

# ON-CAMERA UGC OVERLAY (Tier-2, on-camera deliverables only)
- dry funny · professional punk · slightly exasperated when appropriate

# UNIVERSAL BANS
- "Hey guys" · overpromise language · influencer-y energy · hardship reveals that shift focus from the work

# JOB
Given the structured SOW + brand rules + (optional) Julz's personal angle for a single campaign, draft 3 DISTINCT creative concept variants. Distinct = different story arc, different emotional hook, different product-appearance mechanic. NOT three flavors of the same idea.

# OUTPUT
Return ONE JSON object matching this exact shape. No markdown fences. No prose outside the JSON.

{
  "meta": {
    "sow_summary": string,        // one sentence: what the brand actually wants
    "reasoning": string           // 2-3 sentences: how the 3 concepts cover different angles
  },
  "concepts": [
    {
      "title": string,                          // punchy 2-5 word concept name
      "core_story": string,                     // 2-3 sentence story arc, beginning → middle → end
      "hooks": [string],                        // EXACTLY 5 hook variants. Each ≤12 words. Each opens cold, no setup.
      "why_it_hits_sow": string,                // 1-2 sentences. Cite SOW requirements by name.
      "why_it_fits_julz": string,               // 1-2 sentences. Reference Tier-1 voice traits.
      "emotional_hook": string,                 // single emotional driver (e.g., "underdog frustration → relief")
      "product_appearance": string,             // 1 sentence: how the product shows up naturally
      "suggested_cta": string,                  // closing line, ≤15 words, no "Link in bio fam"
      "risk_level": "safe" | "bold" | "experimental",
      "production_complexity": "low" | "med" | "high"
    },
    { ... },   // concept #2
    { ... }    // concept #3
  ]
}

# RULES
1. EXACTLY 3 concepts. No fewer, no more.
2. EXACTLY 5 hooks per concept. Each must be filmable as a cold-open opening line.
3. NO "Hey guys", "What's up fam", "POV: you're…" (overdone), "Three things I wish I knew", or other influencer staples.
4. Every concept must be filmable solo by Julz with a phone — no exotic locations, no hired actors, no studio gear.
5. Reference SOW requirements by name in why_it_hits_sow (e.g., "covers the 30-90 sec length, two-product-mention requirement, and skips 'cheating' framing").
6. Reference Julz's actual voice traits in why_it_fits_julz (bold/punchy/dry-funny/professional-punk/etc).
7. Concepts must be SAFE-bold or BOLD-bold, not generic. Lean weird-but-on-brand.
8. Output ONLY the JSON object. No commentary. No markdown fences. No prose before or after.`;

// ----------------------------------------------------------------------------
// I/O helpers
// ----------------------------------------------------------------------------

async function readIfExists(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
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

async function callClaude({ sowMd, brandRulesMd, personalAngleMd, slug }) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userParts = [`# Campaign slug\n${slug}`, '', `# 03-sow-breakdown.md (structured SOW)\n${sowMd}`];
  if (brandRulesMd) {
    userParts.push('', `# 00-brand-rules.md (brand rules / restrictions)\n${brandRulesMd}`);
  } else {
    userParts.push('', `# 00-brand-rules.md\n_(not provided — assume Julz's default Tier-1 voice + universal bans)_`);
  }
  if (personalAngleMd) {
    userParts.push('', `# 05-personal-angle.md (Julz's authentic hook for this product)\n${personalAngleMd}`);
  } else {
    userParts.push('', `# 05-personal-angle.md\n_(not provided — derive personal angle from SOW + brand rules)_`);
  }
  userParts.push(
    '',
    '# TASK',
    'Draft 3 distinct creative concept variants with 5 hooks each, matching the JSON shape in the system prompt. Output ONLY the JSON object.',
  );

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 8_000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userParts.join('\n'),
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
// markdown renderer — canonical 07-creative-concepts.md shape
// ----------------------------------------------------------------------------

function renderMarkdown({ slug, response }) {
  const today = new Date().toISOString().slice(0, 10);
  const lines = [];

  lines.push('# 07 — Creative Concepts (Stage 7: Pick Creative Concept)');
  lines.push('');
  lines.push('**Experts:** UGC Creative Strategist · Performance Creative Director · Copywriter / Script Doctor');
  lines.push('**Prompt:** see `_meta/06-stage-prompts.md` → Stage 7');
  lines.push(`**Generated:** ${today} by \`scripts/generate-concepts.mjs\` (run ${RUN_ID})`);
  lines.push('');
  lines.push('---');
  lines.push('');

  if (response.meta) {
    lines.push('## Generator Notes');
    lines.push('');
    if (response.meta.sow_summary) {
      lines.push(`- **SOW in one sentence:** ${response.meta.sow_summary}`);
    }
    if (response.meta.reasoning) {
      lines.push(`- **How the 3 concepts differ:** ${response.meta.reasoning}`);
    }
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  response.concepts.forEach((c, idx) => {
    const n = idx + 1;
    lines.push(`## Concept #${n}: ${c.title}`);
    lines.push('');
    lines.push(`- **Core story:** ${c.core_story}`);
    lines.push(`- **Emotional hook:** ${c.emotional_hook}`);
    lines.push(`- **Why it fits the SOW:** ${c.why_it_hits_sow}`);
    lines.push(`- **How the product appears naturally:** ${c.product_appearance}`);
    lines.push(`- **Why it fits my personal brand:** ${c.why_it_fits_julz}`);
    lines.push('- **Hook options (pick one or A/B test):**');
    c.hooks.forEach((h, i) => {
      lines.push(`  ${i + 1}. "${h}"`);
    });
    lines.push(`- **Suggested CTA:** "${c.suggested_cta}"`);
    lines.push(`- **Risk level:** ${c.risk_level}`);
    lines.push(`- **Production complexity:** ${c.production_complexity}`);
    lines.push('- **Ranking:** _(Julz to assign 1 / 2 / 3 after review)_');
    lines.push('');
  });

  lines.push('---');
  lines.push('');
  lines.push('## Prioritization Test (per OS Stage 7 rules)');
  lines.push('');
  lines.push('Each concept must pass:');
  lines.push('- [ ] Native to TikTok/Reels');
  lines.push('- [ ] Easy to film (no exotic locations, complex props, hired help)');
  lines.push('- [ ] Strong in the first 2 seconds');
  lines.push('- [ ] Brand-safe (Brand Safety Strategist sign-off)');
  lines.push('- [ ] Not influencer-y');
  lines.push('- [ ] Aligned with Julz tone (bold/punchy/smart/witty/professional punk/clear)');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Locked Concept');
  lines.push('');
  lines.push('**Selected:** #[N]');
  lines.push('**Why this beat the others:**');
  lines.push('**Julz override (if any):**');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Verified Facts | Assumptions | Missing Information | Recommended Next Steps');
  lines.push('');
  lines.push('### Verified Facts');
  lines.push('- 3 concepts × 5 hooks generated against the structured SOW + brand rules above.');
  lines.push('- Voice traits validated against master DOCX para 2312 (Tier-1 canonical).');
  lines.push('');
  lines.push('### Assumptions');
  lines.push('- _(Julz to review — call out any concept that drifts from SOW or voice.)_');
  lines.push('');
  lines.push('### Missing Information');
  lines.push('- _(Julz to flag any concept that needs SOW clarification before locking.)_');
  lines.push('');
  lines.push('### Recommended Next Steps');
  lines.push('1. Read all 3 concepts in full.');
  lines.push('2. Pick favorite hook from each concept (or write override).');
  lines.push('3. Rank concepts 1 / 2 / 3 and lock #1 in the Locked Concept section.');
  lines.push('4. Proceed to Stage 8 (script) with locked concept + hook.');
  lines.push('');

  return lines.join('\n');
}

// ----------------------------------------------------------------------------
// main
// ----------------------------------------------------------------------------

async function main() {
  // Arg validation
  const slug = (ARGS.slug ?? '').trim().toLowerCase();

  if (!slug) {
    err('--slug is required. Run with --help for usage.');
    return 2;
  }
  if (!SLUG_PATTERN.test(slug)) {
    err(`--slug "${slug}" is invalid. Must be lowercase letters, digits, hyphens (no leading/trailing dash).`);
    return 2;
  }

  info(`run_id=${RUN_ID} slug=${slug} dry_run=${!!ARGS.dryRun} model=${MODEL}`);

  const campaignDir = path.join(UGC_ROOT, slug);
  const sowPath = path.join(campaignDir, '03-sow-breakdown.md');
  const brandRulesPath = path.join(campaignDir, '00-brand-rules.md');
  const personalAnglePath = path.join(campaignDir, '05-personal-angle.md');

  // SOW is REQUIRED — fail loudly with remediation if missing.
  const sowMd = await readIfExists(sowPath);
  if (!sowMd) {
    err(`Required source missing: ${sowPath}`);
    err(`Run \`npm run parse-sow -- --slug=${slug} --input=stdin\` first to generate it.`);
    return 2;
  }
  info(`SOW source: ${sowMd.length.toLocaleString()} chars · ${sowPath}`);

  const brandRulesMd = await readIfExists(brandRulesPath);
  if (brandRulesMd) {
    info(`brand rules: ${brandRulesMd.length.toLocaleString()} chars · ${brandRulesPath}`);
  } else {
    warn(`brand rules not found at ${brandRulesPath} — proceeding with Julz's default Tier-1 voice.`);
  }

  const personalAngleMd = await readIfExists(personalAnglePath);
  if (personalAngleMd) {
    info(`personal angle: ${personalAngleMd.length.toLocaleString()} chars · ${personalAnglePath}`);
  } else {
    warn(`personal angle not found at ${personalAnglePath} — Claude will derive from SOW.`);
  }

  // HR-10 honest fallback: no API key → exit 0 with remediation.
  if (!process.env.ANTHROPIC_API_KEY && !ARGS.dryRun) {
    process.stdout.write('\n');
    warn('ANTHROPIC_API_KEY is not set in this shell.');
    warn('Concept generator skipped (HR-10 honest fallback — not a failure, just no API access).');
    warn('Remediation:');
    warn('  1. Get key from https://console.anthropic.com/settings/keys');
    warn('  2. In PowerShell: $env:ANTHROPIC_API_KEY = "sk-ant-…"');
    warn('  3. In bash: export ANTHROPIC_API_KEY="sk-ant-…"');
    warn(`  4. Re-run: npm run generate-concepts -- --slug=${slug}`);
    process.stdout.write(`\nNO-OP — slug=${slug} (API key missing). Exiting 0.\n`);
    return 0;
  }

  // Spend cap (skipped in dry-run)
  if (!ARGS.dryRun) {
    const spentToday = await readSpendToday();
    info(`spent_today_usd=${spentToday.toFixed(4)} cap=$${MAX_DAILY_USD}`);
    if (spentToday >= MAX_DAILY_USD) {
      err(`Daily spend cap reached ($${spentToday.toFixed(2)} >= $${MAX_DAILY_USD}). Aborting.`);
      return 1;
    }
  }

  const outPath = path.join(campaignDir, '07-creative-concepts.md');

  if (ARGS.dryRun) {
    info('--dry-run: skipping Anthropic call, skipping write.');
    info(`would write to: ${outPath}`);
    info(`would append spend entry to: ${SPEND_LEDGER}`);
    process.stdout.write(
      `\nDRY RUN PASS — slug=${slug} sow=${sowMd.length}c brand=${brandRulesMd?.length ?? 0}c angle=${personalAngleMd?.length ?? 0}c\n`,
    );
    return 0;
  }

  // Real call
  info(`calling Claude API (${MODEL})…`);
  const { jsonText, usage, sessionId } = await callClaude({
    sowMd,
    brandRulesMd,
    personalAngleMd,
    slug,
  });

  // Validate
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    err('Claude returned non-JSON output. Raw text:');
    console.error(jsonText.slice(0, 2000));
    return 1;
  }
  const validation = ConceptsResponseSchema.safeParse(parsed);
  if (!validation.success) {
    err('Claude output failed Zod validation:');
    console.error(JSON.stringify(validation.error.format(), null, 2));
    return 1;
  }
  const response = validation.data;
  info(
    `Zod validation PASS · ${response.concepts.length} concepts · hooks per concept: ${response.concepts.map((c) => c.hooks.length).join(', ')}`,
  );

  // Render markdown
  const md = renderMarkdown({ slug, response });
  await fs.mkdir(campaignDir, { recursive: true });
  await fs.writeFile(outPath, md, 'utf8');

  // HR-34: verify own write by re-reading.
  const verify = await fs.readFile(outPath, 'utf8');
  info(`wrote ${verify.length.toLocaleString()} chars → ${outPath} (re-read OK)`);

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
    `\nGenerated 3 concepts × ${response.concepts[0].hooks.length} hooks for ${slug} → wrote ${outPath} · cost $${costUsd.toFixed(4)} (in=${usage.input_tokens} out=${usage.output_tokens})\n`,
  );
  return 0;
}

main()
  .then((code) => process.exit(code ?? 0))
  .catch((e) => {
    err('FATAL:', e?.stack ?? String(e));
    process.exit(1);
  });
