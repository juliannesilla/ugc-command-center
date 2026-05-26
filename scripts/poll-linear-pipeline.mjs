#!/usr/bin/env node
/**
 * poll-linear-pipeline.mjs — Linear UGC Pipeline comment poller (Phase A.14p P3)
 *
 * PURPOSE
 *   Reads all comments on issues in the Linear "UGC Pipeline" project and
 *   writes a flat JSONL to data/linear-pipeline-comments.jsonl. The Unified
 *   Brand Inbox UI (app/inbox/unified/page.tsx) reads this file at gh-pages
 *   build time and merges entries with SideShift + Gmail.
 *
 * REQUIREMENTS / SECRETS
 *   Env vars (missing → graceful exit 0 with NEEDS-SECRETS log line):
 *     - LINEAR_API_TOKEN          (personal API key from Linear Settings → API)
 *     - LINEAR_PROJECT_ID         (optional — UUID of UGC Pipeline project.
 *                                  If unset, script looks up project by name
 *                                  matching LINEAR_PROJECT_NAME.)
 *     - LINEAR_PROJECT_NAME       (optional, default "UGC Pipeline")
 *     - LINEAR_MAX_COMMENTS       (optional, default 200)
 *
 * USAGE
 *   node scripts/poll-linear-pipeline.mjs --help
 *   node scripts/poll-linear-pipeline.mjs --dry-run
 *   node scripts/poll-linear-pipeline.mjs
 *
 * EXIT CODES
 *   0  success / dry-run / missing-secret graceful
 *   1  honest failure (auth rejected, GraphQL error, write error)
 *
 * OUTPUT
 *   Overwrites data/linear-pipeline-comments.jsonl with header + one record
 *   per comment.
 *
 * HARD RULES IN PLAY
 *   HR-10 ACCESS HONESTY → graceful missing-secret path
 *   HR-15 verify artifact not proxy → real file write, honest exit code
 *   HR-21 cite = invoke skills (block below)
 *   HR-26 problems ship with solutions → every error path has remediation
 *
 * SKILLS INVOKED (HR-21 audit trail)
 *   - senior-backend                                → GraphQL client
 *   - engineering:debug                             → honest error surfacing
 *   - engineering:documentation                     → header + --help
 *   - superpowers:verification-before-completion    → --dry-run smoke path
 */

import { promises as fs } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");
const DATA_FILE = join(REPO_ROOT, "data", "linear-pipeline-comments.jsonl");
const DEFAULT_PROJECT_NAME = "UGC Pipeline";
const DEFAULT_MAX_COMMENTS = 200;

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
  process.stdout.write(`poll-linear-pipeline.mjs — Phase A.14p P3

USAGE
  node scripts/poll-linear-pipeline.mjs [--dry-run] [--verbose] [--help]

FLAGS
  --dry-run    Print plan + exit 0. No Linear API calls.
  --verbose    Print extra diagnostics (project lookup, query body).
  --help, -h   Show this help.

ENV VARS (required for non-dry-run)
  LINEAR_API_TOKEN        (personal API key)
  LINEAR_PROJECT_ID       (optional — direct UUID)
  LINEAR_PROJECT_NAME     (optional, default: "${DEFAULT_PROJECT_NAME}")
  LINEAR_MAX_COMMENTS     (optional, default: ${DEFAULT_MAX_COMMENTS})

OUTPUT
  Overwrites data/linear-pipeline-comments.jsonl with header line +
  one JSON record per comment.

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

async function linearGraphQL(token, query, variables) {
  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: token,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`linear graphql ${res.status}: ${txt.slice(0, 300)}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(
      `linear graphql errors: ${JSON.stringify(json.errors).slice(0, 400)}`
    );
  }
  return json.data;
}

async function findProjectIdByName(token, name, verbose) {
  const query = `
    query Projects {
      projects(first: 50) {
        nodes { id name }
      }
    }
  `;
  const data = await linearGraphQL(token, query, {});
  const nodes = data?.projects?.nodes || [];
  if (verbose) log("info", "projects fetched", { count: nodes.length });
  const exact = nodes.find((p) => p.name === name);
  if (exact) return exact.id;
  const partial = nodes.find((p) =>
    p.name.toLowerCase().includes(name.toLowerCase())
  );
  if (partial) {
    log("warn", "project name partial match", {
      requested: name,
      matched: partial.name,
    });
    return partial.id;
  }
  return null;
}

async function fetchProjectComments({ token, projectId, max, verbose }) {
  // Linear's `issues` accepts a `filter` with `project: { id: { eq } }`.
  // Each issue carries a `comments` connection.
  const query = `
    query ProjectIssues($projectId: ID!, $first: Int!) {
      issues(filter: { project: { id: { eq: $projectId } } }, first: $first) {
        nodes {
          id
          identifier
          title
          url
          comments(first: 50) {
            nodes {
              id
              body
              createdAt
              user { name email }
              url
            }
          }
        }
      }
    }
  `;
  const data = await linearGraphQL(token, query, { projectId, first: 100 });
  const issues = data?.issues?.nodes || [];
  if (verbose) log("info", "issues fetched", { count: issues.length });
  const records = [];
  for (const issue of issues) {
    const comments = issue.comments?.nodes || [];
    for (const c of comments) {
      records.push({
        id: c.id,
        source: "linear",
        issue_title: `${issue.identifier} ${issue.title}`,
        issue_url: c.url || issue.url,
        commenter: c.user?.name || c.user?.email || "Unknown",
        body: c.body || "",
        ts: c.createdAt,
        project_id: projectId,
      });
      if (records.length >= max) break;
    }
    if (records.length >= max) break;
  }
  // sort DESC by ts before write
  records.sort((a, b) => (Date.parse(b.ts) || 0) - (Date.parse(a.ts) || 0));
  return records.slice(0, max);
}

async function writeJsonl(records) {
  await fs.mkdir(dirname(DATA_FILE), { recursive: true });
  const header = {
    schema_version: 1,
    created: nowIso(),
    note:
      "Populated by scripts/poll-linear-pipeline.mjs. Schema: {id, source:'linear', issue_title, issue_url, commenter, body, ts, project_id}",
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

  log("info", "poll-linear-pipeline start", {
    dryRun: args.dryRun,
    cwd: process.cwd(),
    nodeVersion: process.version,
  });

  const projectName = process.env.LINEAR_PROJECT_NAME || DEFAULT_PROJECT_NAME;
  const max = Number(process.env.LINEAR_MAX_COMMENTS) || DEFAULT_MAX_COMMENTS;

  if (args.dryRun) {
    log("info", "dry-run plan", {
      projectName,
      projectIdEnv: process.env.LINEAR_PROJECT_ID || "(unset — will resolve by name)",
      max,
      dataFile: DATA_FILE,
      hasApiToken: !!process.env.LINEAR_API_TOKEN,
    });
    log("info", "dry-run exit 0");
    return 0;
  }

  const token = process.env.LINEAR_API_TOKEN;
  if (!token) {
    log("warn", "LINEAR_API_TOKEN missing — graceful exit 0", {
      remediation:
        "Settings → API in Linear → Personal API keys → Create key, then set LINEAR_API_TOKEN. See _meta/dashboard-spec/06-a14p-unified-inbox-cron.md.",
    });
    return 0;
  }

  let projectId = process.env.LINEAR_PROJECT_ID;
  if (!projectId) {
    try {
      projectId = await findProjectIdByName(token, projectName, args.verbose);
      if (!projectId) {
        log("error", "project not found by name", {
          searched: projectName,
          remediation:
            "Set LINEAR_PROJECT_ID directly (copy from Linear project URL) or rename env LINEAR_PROJECT_NAME to match.",
        });
        return 1;
      }
      log("info", "project resolved", { projectName, projectId });
    } catch (err) {
      log("error", "project lookup failed", {
        error: String(err),
        remediation:
          "Verify LINEAR_API_TOKEN scope. Try setting LINEAR_PROJECT_ID directly.",
      });
      return 1;
    }
  }

  let records = [];
  try {
    records = await fetchProjectComments({
      token,
      projectId,
      max,
      verbose: args.verbose,
    });
    log("info", "comments fetched", { count: records.length });
  } catch (err) {
    log("error", "comment fetch failed", {
      error: String(err),
      remediation:
        "Confirm projectId is correct. Check token has read access to project.",
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
    `Polled ${records.length} Linear comments → wrote to data/linear-pipeline-comments.jsonl\n`
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
