#!/usr/bin/env node
/**
 * new-campaign.mjs — A.14p P1 — Localhost CLI script for the Campaign Wizard.
 *
 * The UI shell at /campaigns/new builds the command-line invocation; this script
 * does the real filesystem + Linear work that gh-pages cannot do from the
 * browser:
 *   1. Copy UGC/_meta/05-campaign-template/ → UGC/[brand-slug]-[campaign-slug]/
 *   2. Replace [BRAND NAME] / [CAMPAIGN NAME] / [CATEGORY] / [YYYY-MM-DD]
 *      placeholders in 00-brand-rules.md
 *   3. If --sow is a URL, drop it into 02-source-access.md; if it's a local
 *      file path that exists, copy its contents into 03-sow-breakdown.md
 *   4. Create a Linear issue in the "UGC Pipeline" project via the GraphQL API
 *      (skipped with a WARN if LINEAR_API_TOKEN env var is missing)
 *   5. Append the new campaign to data/campaigns-created.jsonl
 *
 * HR-10 ACCESS HONESTY: every action prints PASS / FAIL / SKIP with a reason.
 * No fabricated success messages.
 *
 * Usage:
 *   npm run new-campaign -- --help
 *   npm run new-campaign -- \
 *     --brand="Sideshift" --brand-slug="sideshift" \
 *     --campaign="Q3 Creator Push" --campaign-slug="q3-creator-push" \
 *     --category="Tech" \
 *     --sow="https://docs.google.com/document/d/..."
 *
 * Env:
 *   LINEAR_API_TOKEN   optional; without it the Linear step is skipped
 *   UGC_ROOT           optional; defaults to C:\Users\julia\OneDrive\Desktop\UGC
 *   LINEAR_PROJECT_ID  optional override; defaults to the UGC Pipeline project
 *                      "d925be41f9f5..." referenced in _meta/00-operating-system.md
 */

import { promises as fs, existsSync, statSync, cpSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const UGC_ROOT =
  process.env.UGC_ROOT || 'C:\\Users\\julia\\OneDrive\\Desktop\\UGC';
const TEMPLATE_DIR = path.join(UGC_ROOT, '_meta', '05-campaign-template');
const DATA_FILE = path.join(REPO_ROOT, 'data', 'campaigns-created.jsonl');

// UGC Pipeline project — sourced from _meta/00-operating-system.md:
//   "create issue in Linear 'UGC Pipeline' (https://linear.app/julianne/project/ugc-pipeline-d925be41f9f5)"
// Linear project URL slugs embed only the first 12 chars; the full UUID has to
// be discovered at run time via the projects query when --resolve-project-id
// is set, or supplied via LINEAR_PROJECT_ID env var.
const DEFAULT_PROJECT_SLUG_PREFIX = 'd925be41f9f5';

// 13-stage list — sourced from UGC/_meta/06-stage-prompts.md (H2 headings).
// Pasted verbatim as a Linear-friendly markdown checklist for the issue body.
const STAGES = [
  'Capture',
  'Source Access Check',
  'Extract SOW',
  'Research Product',
  'Choose Personal Angle',
  'Define Positioning',
  'Pick Creative Concept',
  'Script',
  'Map Shots',
  'Film Checklist',
  'Edit Checklist',
  'Submission',
  'QA',
];

// ────────────────────────────────────────────────────────────────────────────
// CLI arg parsing
// ────────────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = {};
  for (const a of argv) {
    if (a === '--help' || a === '-h') {
      out.help = true;
      continue;
    }
    const m = a.match(/^--([a-z-]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

function printHelp() {
  console.log(`
new-campaign.mjs — spin up a new UGC campaign from the canonical template.

USAGE
  npm run new-campaign -- [flags]

REQUIRED FLAGS
  --brand="..."          Brand display name (e.g. "Sideshift")
  --brand-slug="..."     Folder-safe slug (lowercase, dash-separated)
  --campaign="..."       Campaign display name
  --campaign-slug="..."  Folder-safe slug
  --category="..."       One of: Beauty, Tech, Lifestyle, Other

OPTIONAL FLAGS
  --sow="..."            Google Doc URL or local file path with the SOW
  --help, -h             Show this message

ENV VARS
  LINEAR_API_TOKEN       Linear personal API key. If missing, Linear step is
                         skipped (warning emitted, script continues).
  UGC_ROOT               Defaults to C:\\Users\\julia\\OneDrive\\Desktop\\UGC
  LINEAR_PROJECT_ID      Full UUID of the UGC Pipeline project (skip discovery)

EXAMPLE
  npm run new-campaign -- \\
    --brand="Sideshift" --brand-slug="sideshift" \\
    --campaign="Q3 Creator Push" --campaign-slug="q3-creator-push" \\
    --category="Tech"
`);
}

// ────────────────────────────────────────────────────────────────────────────
// Validation
// ────────────────────────────────────────────────────────────────────────────

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ALLOWED_CATEGORIES = new Set(['Beauty', 'Tech', 'Lifestyle', 'Other']);

function validate(args) {
  const errs = [];
  for (const key of [
    'brand',
    'brand-slug',
    'campaign',
    'campaign-slug',
    'category',
  ]) {
    if (!args[key] || !String(args[key]).trim()) {
      errs.push(`Missing required --${key}`);
    }
  }
  if (args['brand-slug'] && !SLUG_RE.test(args['brand-slug'])) {
    errs.push(
      `--brand-slug must be lowercase + dash-separated (got: ${args['brand-slug']})`,
    );
  }
  if (args['campaign-slug'] && !SLUG_RE.test(args['campaign-slug'])) {
    errs.push(
      `--campaign-slug must be lowercase + dash-separated (got: ${args['campaign-slug']})`,
    );
  }
  if (args.category && !ALLOWED_CATEGORIES.has(args.category)) {
    errs.push(
      `--category must be one of: Beauty, Tech, Lifestyle, Other (got: ${args.category})`,
    );
  }
  return errs;
}

// ────────────────────────────────────────────────────────────────────────────
// Filesystem actions
// ────────────────────────────────────────────────────────────────────────────

function copyTemplate(targetDir) {
  if (!existsSync(TEMPLATE_DIR)) {
    throw new Error(
      `Template dir missing: ${TEMPLATE_DIR}. Check UGC_ROOT env var.`,
    );
  }
  if (existsSync(targetDir)) {
    throw new Error(
      `Target already exists, refusing to overwrite: ${targetDir}`,
    );
  }
  cpSync(TEMPLATE_DIR, targetDir, { recursive: true });
}

async function fillBrandRules(targetDir, { brand, campaign, category }) {
  const filePath = path.join(targetDir, '00-brand-rules.md');
  if (!existsSync(filePath)) return false;
  let content = await fs.readFile(filePath, 'utf8');
  const today = new Date().toISOString().slice(0, 10);
  // Replace common placeholder patterns. We use literal-string global replace
  // to avoid regex-escape footguns.
  const swaps = [
    [/\*\*Brand:\*\*\s*\[name\]/g, `**Brand:** ${brand}`],
    [/\*\*Campaign:\*\*\s*\[name\]/g, `**Campaign:** ${campaign}`],
    [
      /\*\*Last updated:\*\*\s*\[YYYY-MM-DD\]/g,
      `**Last updated:** ${today}`,
    ],
    [/\[BRAND NAME\]/g, brand],
    [/\[CAMPAIGN NAME\]/g, campaign],
    [/\[CATEGORY\]/g, category],
  ];
  for (const [re, val] of swaps) content = content.replace(re, val);
  // Append a "Category" line if no slot existed (template doesn't currently
  // have one; add it under the title so we don't lose the value).
  if (!/^\*\*Category:\*\*/m.test(content)) {
    content = content.replace(
      /(\*\*Last updated:\*\*[^\n]*\n)/,
      `$1**Category:** ${category}\n`,
    );
  }
  await fs.writeFile(filePath, content, 'utf8');
  return true;
}

async function attachSow(targetDir, sowArg) {
  if (!sowArg) return { mode: 'skip' };
  const looksLikeUrl = /^https?:\/\//i.test(sowArg);
  if (looksLikeUrl) {
    const filePath = path.join(targetDir, '02-source-access.md');
    if (!existsSync(filePath)) return { mode: 'no-target' };
    const existing = await fs.readFile(filePath, 'utf8');
    const appended = `${existing.trimEnd()}\n\n---\n\n## SOW link (added ${new Date().toISOString().slice(0, 10)})\n\n${sowArg}\n`;
    await fs.writeFile(filePath, appended, 'utf8');
    return { mode: 'url', file: '02-source-access.md' };
  }
  // Try as a local file path
  if (existsSync(sowArg) && statSync(sowArg).isFile()) {
    const raw = await fs.readFile(sowArg, 'utf8');
    const filePath = path.join(targetDir, '03-sow-breakdown.md');
    if (!existsSync(filePath)) return { mode: 'no-target' };
    const existing = await fs.readFile(filePath, 'utf8');
    const appended = `${existing.trimEnd()}\n\n---\n\n## Raw paste (added ${new Date().toISOString().slice(0, 10)})\n\nSource: \`${sowArg}\`\n\n\`\`\`\n${raw}\n\`\`\`\n`;
    await fs.writeFile(filePath, appended, 'utf8');
    return { mode: 'file', file: '03-sow-breakdown.md' };
  }
  // Treat as pasted text — write to 03-sow-breakdown.md
  const filePath = path.join(targetDir, '03-sow-breakdown.md');
  if (!existsSync(filePath)) return { mode: 'no-target' };
  const existing = await fs.readFile(filePath, 'utf8');
  const appended = `${existing.trimEnd()}\n\n---\n\n## Raw paste (added ${new Date().toISOString().slice(0, 10)})\n\n\`\`\`\n${sowArg}\n\`\`\`\n`;
  await fs.writeFile(filePath, appended, 'utf8');
  return { mode: 'text', file: '03-sow-breakdown.md' };
}

// ────────────────────────────────────────────────────────────────────────────
// Linear
// ────────────────────────────────────────────────────────────────────────────

async function linearGraphQL(token, query, variables) {
  const res = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token, // Linear personal API keys go in Authorization raw
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error(
      `Linear API error: ${json.errors.map((e) => e.message).join('; ')}`,
    );
  }
  return json.data;
}

async function resolveProjectId(token) {
  if (process.env.LINEAR_PROJECT_ID) return process.env.LINEAR_PROJECT_ID;
  // Page through projects, find one whose id starts with the slug prefix or
  // whose name === "UGC Pipeline".
  const data = await linearGraphQL(
    token,
    `query { projects(first: 100) { nodes { id name } } }`,
    {},
  );
  const nodes = data?.projects?.nodes ?? [];
  const byId = nodes.find((n) =>
    n.id.replace(/-/g, '').startsWith(DEFAULT_PROJECT_SLUG_PREFIX),
  );
  if (byId) return byId.id;
  const byName = nodes.find((n) => n.name === 'UGC Pipeline');
  if (byName) return byName.id;
  throw new Error(
    'Could not resolve UGC Pipeline project ID. Set LINEAR_PROJECT_ID env var.',
  );
}

async function createLinearIssue(token, { brand, campaign, category }) {
  const projectId = await resolveProjectId(token);
  const title = `${brand} — ${campaign}`;
  const checklist = STAGES.map(
    (label, i) => `- [ ] Stage ${i + 1} — ${label}`,
  ).join('\n');
  const description = [
    `**Brand:** ${brand}`,
    `**Campaign:** ${campaign}`,
    `**Category:** ${category}`,
    '',
    '### 13-stage checklist',
    '',
    checklist,
    '',
    '_Source: UGC/_meta/06-stage-prompts.md_',
  ].join('\n');

  const data = await linearGraphQL(
    token,
    `mutation IssueCreate($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue { id identifier url title }
      }
    }`,
    {
      input: {
        title,
        description,
        projectId,
      },
    },
  );
  const issue = data?.issueCreate?.issue;
  if (!data?.issueCreate?.success || !issue) {
    throw new Error('Linear issueCreate returned no issue');
  }
  return issue;
}

// ────────────────────────────────────────────────────────────────────────────
// JSONL log
// ────────────────────────────────────────────────────────────────────────────

async function appendJsonl(entry) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.appendFile(DATA_FILE, JSON.stringify(entry) + '\n', 'utf8');
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    process.exit(0);
  }
  const errs = validate(args);
  if (errs.length) {
    console.error('ERROR — invalid args:');
    for (const e of errs) console.error(`  · ${e}`);
    console.error('\nRun with --help for usage.');
    process.exit(2);
  }

  const brand = args.brand;
  const brandSlug = args['brand-slug'];
  const campaign = args.campaign;
  const campaignSlug = args['campaign-slug'];
  const category = args.category;
  const sow = args.sow || '';

  const folderName = `${brandSlug}-${campaignSlug}`;
  const targetDir = path.join(UGC_ROOT, folderName);

  console.log(`\n→ Creating campaign: ${brand} — ${campaign}\n`);

  // 1. Copy template
  try {
    copyTemplate(targetDir);
    console.log(`  PASS  copied template → ${targetDir}`);
  } catch (e) {
    console.error(`  FAIL  copy template: ${e.message}`);
    process.exit(1);
  }

  // 2. Fill brand-rules
  try {
    const ok = await fillBrandRules(targetDir, { brand, campaign, category });
    console.log(
      ok
        ? `  PASS  filled 00-brand-rules.md placeholders`
        : `  SKIP  00-brand-rules.md not found in template`,
    );
  } catch (e) {
    console.error(`  WARN  could not fill brand-rules: ${e.message}`);
  }

  // 3. Attach SOW
  let sowResult = { mode: 'skip' };
  try {
    sowResult = await attachSow(targetDir, sow);
    if (sowResult.mode === 'skip') {
      console.log(`  SKIP  no --sow provided`);
    } else if (sowResult.mode === 'no-target') {
      console.log(`  SKIP  SOW target file missing in template`);
    } else {
      console.log(
        `  PASS  wrote SOW (${sowResult.mode}) → ${sowResult.file}`,
      );
    }
  } catch (e) {
    console.error(`  WARN  SOW attach failed: ${e.message}`);
  }

  // 4. Linear issue
  let linearIssue = null;
  if (!process.env.LINEAR_API_TOKEN) {
    console.log(
      `  SKIP  Linear issue (LINEAR_API_TOKEN not set — set it and re-run, or create the issue manually)`,
    );
  } else {
    try {
      linearIssue = await createLinearIssue(process.env.LINEAR_API_TOKEN, {
        brand,
        campaign,
        category,
      });
      console.log(
        `  PASS  created Linear issue ${linearIssue.identifier} → ${linearIssue.url}`,
      );
    } catch (e) {
      console.error(`  WARN  Linear issue creation failed: ${e.message}`);
    }
  }

  // 5. Append JSONL
  const entry = {
    ts: new Date().toISOString(),
    brand,
    brand_slug: brandSlug,
    campaign,
    campaign_slug: campaignSlug,
    category,
    sow: sow || null,
    sow_mode: sowResult.mode,
    linear_issue_id: linearIssue?.id ?? null,
    linear_identifier: linearIssue?.identifier ?? null,
    linear_url: linearIssue?.url ?? null,
    folder_path: targetDir,
  };
  try {
    await appendJsonl(entry);
    console.log(`  PASS  appended → ${DATA_FILE}`);
  } catch (e) {
    console.error(`  WARN  JSONL append failed: ${e.message}`);
  }

  // Summary
  console.log('\n──── SUMMARY ────');
  console.log(`Folder:  ${targetDir}`);
  console.log(
    `Linear:  ${
      linearIssue?.url ??
      (process.env.LINEAR_API_TOKEN
        ? '(creation failed — see WARN above)'
        : '(skipped — no LINEAR_API_TOKEN)')
    }`,
  );
  console.log(`Log:     ${DATA_FILE}`);
  console.log('\nDone. Rebuild the dashboard to surface the new campaign.\n');
}

main().catch((e) => {
  console.error(`\nFATAL: ${e.stack || e.message}`);
  process.exit(1);
});
