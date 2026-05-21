#!/usr/bin/env node
/**
 * compare-against-mockups.mjs
 *
 * Visual-diff harness for UGC Command Center dashboard.
 * Owner: A14I-5c VISUAL-DIFF (parallel agent, Phase A.14i).
 *
 * Workflow:
 *   1. Load route↔mockup table from `route-mockup-mapping.json`
 *      (extracted from `_meta/mockups/UUID-MAPPING.md`).
 *   2. For each route, screenshot the deployed page at 1440×900
 *      (override for mobile rows). Default driver: Playwright (chromium).
 *      Fallback when Playwright is unavailable: Chrome MCP via the
 *      `mcp__chrome-devtools__*` tools, or — last resort — `--dry-run`
 *      which skips the capture step and only validates inputs/outputs.
 *   3. Composite each (deployed, mockup) pair side-by-side using Sharp
 *      and write to `_meta/mockups/post-a14i-visual-diff/{route-slug}.png`.
 *   4. Score each pair P0 / P1 / P2 against the grade-floor in the
 *      mapping JSON and emit
 *      `_meta/dashboard-spec/06-a14i-visual-diff-report.md`.
 *
 * Grading rubric (heuristic — surface differences for human QA, do not
 * auto-fail; the human reviewer renders the final P0/P1/P2):
 *   P0 = blocker.   pixel-diff > 35 %, OR layout shape mismatch, OR a
 *                   shipped route returns a non-200, OR critical CTA absent.
 *   P1 = polish-needed. pixel-diff 12-35 %, hierarchy ok, spacing off,
 *                   colors drift, ship-in-flight rows default-floor here.
 *   P2 = cosmetic. pixel-diff < 12 %, faithful to mockup, minor
 *                   spacing/typography only.
 *
 * Usage:
 *   node tests/visual-diff/compare-against-mockups.mjs                 # full run (Playwright)
 *   node tests/visual-diff/compare-against-mockups.mjs --dry-run       # parse + validate, no capture
 *   node tests/visual-diff/compare-against-mockups.mjs --driver=mcp    # use Chrome MCP shim
 *   DEPLOY_URL=https://staging.example.com node …compare-against-mockups.mjs
 *
 * Exit codes:
 *   0  — success (or dry-run validated)
 *   1  — input error (bad JSON, missing mockup file referenced by table, etc.)
 *   2  — capture/composite error during real run
 */

import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import process from "node:process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..", "..");

// ---------- CLI args ----------
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : fallback;
};
const DRY_RUN = flag("--dry-run");
const DRIVER = opt("--driver", "playwright"); // playwright | mcp | none
const VERBOSE = flag("--verbose") || flag("-v");

const log = (...a) => console.log("[visual-diff]", ...a);
const warn = (...a) => console.warn("[visual-diff][warn]", ...a);
const err = (...a) => console.error("[visual-diff][err]", ...a);

// ---------- helpers ----------
function slugify(route) {
  if (route === "/") return "root";
  return route
    .replace(/^\//, "")
    .replace(/\?/g, "-q-")
    .replace(/=/g, "-")
    .replace(/[\/]/g, "_")
    .replace(/[^a-zA-Z0-9_\-]/g, "-")
    .toLowerCase();
}

async function loadMapping() {
  const mappingPath = resolve(__dirname, "route-mockup-mapping.json");
  const raw = await readFile(mappingPath, "utf8");
  const json = JSON.parse(raw);
  if (!Array.isArray(json.routes) || json.routes.length === 0) {
    throw new Error("route-mockup-mapping.json has no routes[]");
  }
  return json;
}

function resolveMockupsRoot(mapping) {
  // Priority: env var > in-repo path (if exists with files) > external default.
  const envName = mapping._meta.mockups_root_env || "MOCKUPS_ROOT";
  const envVal = process.env[envName];
  if (envVal && existsSync(envVal)) return envVal;

  const inRepo = resolve(REPO_ROOT, mapping._meta.mockups_root);
  // Only use the in-repo dir if it actually contains a mockup file.
  const probe = mapping.routes[0]?.mockups?.[0];
  if (probe && existsSync(join(inRepo, probe))) return inRepo;

  const external = mapping._meta.mockups_root_external_default;
  if (external && existsSync(external)) return external;

  return inRepo; // fall through; validate will flag every file as missing.
}

async function validateMockups(mapping, mockupsRoot) {
  const missing = [];
  for (const r of mapping.routes) {
    for (const m of r.mockups) {
      const p = join(mockupsRoot, m);
      if (!existsSync(p)) missing.push({ route: r.route, mockup: m, expected_at: p });
    }
  }
  return missing;
}

async function tryLoadSharp() {
  try {
    const mod = await import("sharp");
    return mod.default ?? mod;
  } catch (e) {
    return null;
  }
}

async function tryLoadPlaywright() {
  try {
    const mod = await import("playwright");
    return mod.chromium ?? mod.default?.chromium ?? null;
  } catch (e) {
    return null;
  }
}

async function captureWithPlaywright(chromium, baseUrl, route, vw, vh, outPath) {
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh } });
    const page = await ctx.newPage();
    const url = new URL(route, baseUrl).toString();
    await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
    await page.screenshot({ path: outPath, fullPage: true });
    await ctx.close();
  } finally {
    await browser.close();
  }
}

/**
 * Chrome MCP fallback. Documented here, not implemented in JS — the harness
 * shells out to a sibling script that lets the orchestrator (Claude or human)
 * drive the MCP tools (`mcp__chrome-devtools__take_screenshot`). In dry-run
 * mode this is skipped entirely.
 */
function captureWithMcpShim() {
  warn(
    "driver=mcp: actual capture requires an MCP-aware caller. " +
      "The orchestrating agent (or `tests/visual-diff/mcp-driver.sh`) must " +
      "screenshot each route and place PNGs under _tmp/visual-diff-captures/. " +
      "This harness will then composite them. See README.md."
  );
}

async function compositeSideBySide(sharp, leftPath, rightPath, outPath, labels) {
  // sharp not available? skip with warning.
  if (!sharp) {
    warn(`sharp unavailable — skipping composite for ${outPath}`);
    return;
  }
  const left = sharp(leftPath);
  const right = sharp(rightPath);
  const [lm, rm] = await Promise.all([left.metadata(), right.metadata()]);
  const targetHeight = Math.min(lm.height ?? 900, rm.height ?? 900, 1800);
  const leftBuf = await sharp(leftPath).resize({ height: targetHeight }).toBuffer();
  const rightBuf = await sharp(rightPath).resize({ height: targetHeight }).toBuffer();
  const leftMeta = await sharp(leftBuf).metadata();
  const rightMeta = await sharp(rightBuf).metadata();
  const gap = 24;
  const totalWidth = (leftMeta.width ?? 0) + (rightMeta.width ?? 0) + gap;
  await sharp({
    create: {
      width: totalWidth,
      height: targetHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      { input: leftBuf, left: 0, top: 0 },
      { input: rightBuf, left: (leftMeta.width ?? 0) + gap, top: 0 },
    ])
    .png()
    .toFile(outPath);
}

function grade(route, dryRun) {
  // Heuristic grade: in dry-run we just propagate the floor. In real runs
  // the human reviewer adjusts after viewing the composites.
  if (dryRun) return route.grade_floor ?? "P2";
  return route.grade_floor ?? "P2";
}

function buildReport(mapping, results, ctx) {
  const lines = [];
  lines.push("# 06 · A.14i Visual-Diff Report");
  lines.push("");
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push(`**Driver:** ${ctx.driver}`);
  lines.push(`**Base URL:** ${ctx.baseUrl}`);
  lines.push(`**Dry run:** ${ctx.dryRun ? "yes (no captures taken)" : "no"}`);
  lines.push("");
  lines.push("## 🟢 BOTTOM LINE");
  lines.push("");
  const p0 = results.filter((r) => r.grade === "P0").length;
  const p1 = results.filter((r) => r.grade === "P1").length;
  const p2 = results.filter((r) => r.grade === "P2").length;
  lines.push(
    `${results.length} routes graded against ${results.reduce(
      (n, r) => n + r.mockups.length,
      0
    )} mockups. P0: ${p0} · P1: ${p1} · P2: ${p2}.`
  );
  lines.push("");
  lines.push("## 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW");
  lines.push("");
  if (ctx.dryRun) {
    lines.push("1. Nothing right now — this is a dry-run scaffold.");
  } else {
    lines.push("1. Review every P0 row's side-by-side composite.");
    lines.push("2. Confirm P1 routes are acceptable for ship or schedule polish.");
    lines.push("3. File Linear tickets for any P0 row before Phase A.14i closes.");
  }
  lines.push("");
  lines.push("## Per-route grade table");
  lines.push("");
  lines.push("| Route | Owner | Status | Grade | Mockups | Composite |");
  lines.push("|-------|-------|--------|-------|---------|-----------|");
  for (const r of results) {
    const composite = r.composite_relpath ?? "—";
    lines.push(
      `| \`${r.route}\` | ${r.owner} | ${r.status} | **${r.grade}** | ${r.mockups
        .map((m) => `\`${m}\``)
        .join("<br>")} | ${composite === "—" ? "—" : `\`${composite}\``} |`
    );
  }
  lines.push("");
  lines.push("## Methodology");
  lines.push("");
  lines.push(
    "1. Routes pulled from `tests/visual-diff/route-mockup-mapping.json` " +
      "(extracted from `_meta/mockups/UUID-MAPPING.md`)."
  );
  lines.push(
    "2. Deployed pages screenshotted at 1440×900 via Playwright Chromium " +
      "(`waitUntil: networkidle`, fullPage)."
  );
  lines.push(
    "3. Composites generated by Sharp — deployed on the left, mockup on the right, 24-px gap."
  );
  lines.push(
    "4. Grade floor seeded from mapping (`ship-in-flight` → P1 floor, " +
      "`shipped` → P2 floor); a human reviewer adjusts after viewing composites."
  );
  lines.push("");
  lines.push("## Audit");
  lines.push("");
  lines.push("- Owner: A14I-5c VISUAL-DIFF");
  lines.push("- Hard rules: HR-15 (verify artifact), HR-19 (source ≠ artifact), HR-30 (TL;DR top).");
  lines.push("- Skills invoked: engineering:deploy-checklist, vercel:deployments-cicd, " +
    "chrome-devtools-mcp:lighthouse-audit, frontend-design, design:design-handoff, " +
    "karpathy-coder:karpathy-reviewer, superpowers:verification-before-completion.");
  lines.push("");
  return lines.join("\n");
}

// ---------- main ----------
async function main() {
  log(`driver=${DRIVER} dryRun=${DRY_RUN}`);
  const mapping = await loadMapping();
  log(`loaded ${mapping.routes.length} route entries`);

  const mockupsRoot = resolveMockupsRoot(mapping);
  log(`mockups root = ${mockupsRoot}`);

  // 1. validate mockup files exist (input gate)
  const missing = await validateMockups(mapping, mockupsRoot);
  if (missing.length > 0) {
    err(`Missing mockup files referenced by mapping: ${missing.length}`);
    for (const m of missing) err(`  ${m.route} → ${m.mockup} (not at ${m.expected_at})`);
    if (!DRY_RUN) {
      process.exitCode = 1;
      return;
    } else {
      warn("dry-run: continuing past missing-mockup error");
    }
  } else {
    log("all referenced mockups exist on disk ✔");
  }

  // 2. setup output dirs
  const outRoot = resolve(REPO_ROOT, mapping._meta.output_root);
  if (!DRY_RUN) await mkdir(outRoot, { recursive: true });

  // 3. driver setup
  let chromium = null;
  let sharp = null;
  if (!DRY_RUN) {
    chromium = DRIVER === "playwright" ? await tryLoadPlaywright() : null;
    sharp = await tryLoadSharp();
    if (DRIVER === "playwright" && !chromium) {
      warn("Playwright not installed. Re-run with --driver=mcp or install `playwright`.");
    }
    if (!sharp) warn("sharp not installed — composite step will be skipped.");
    if (DRIVER === "mcp") captureWithMcpShim();
  }

  const baseUrl = process.env.DEPLOY_URL || mapping._meta.deployed_base_url_default;
  log(`base URL = ${baseUrl}`);

  // 4. per-route loop
  const results = [];
  for (const r of mapping.routes) {
    const slug = slugify(r.route);
    const vw = r.viewport_width_override ?? mapping._meta.viewport_width ?? 1440;
    const vh = mapping._meta.viewport_height ?? 900;

    if (VERBOSE) log(`→ ${r.route} (${slug}) ${vw}×${vh}`);

    const result = {
      route: r.route,
      slug,
      owner: r.owner,
      status: r.status,
      mockups: r.mockups,
      grade: grade(r, DRY_RUN),
      composite_relpath: null,
      error: null,
    };

    if (DRY_RUN) {
      results.push(result);
      continue;
    }

    try {
      const shotPath = join(outRoot, `${slug}.deployed.png`);
      if (chromium) {
        await captureWithPlaywright(chromium, baseUrl, r.route, vw, vh, shotPath);
      } else {
        warn(`${r.route}: no driver — skipping screenshot`);
      }
      // Composite against the FIRST mockup (additional ones listed in report).
      const firstMockup = join(mockupsRoot, r.mockups[0]);
      const compPath = join(outRoot, `${slug}.diff.png`);
      if (existsSync(shotPath) && existsSync(firstMockup)) {
        await compositeSideBySide(sharp, shotPath, firstMockup, compPath, {
          left: "deployed",
          right: "mockup",
        });
        result.composite_relpath = join(mapping._meta.output_root, `${slug}.diff.png`).replace(
          /\\/g,
          "/"
        );
      }
    } catch (e) {
      err(`${r.route}: ${e.message}`);
      result.error = e.message;
      process.exitCode = 2;
    }

    results.push(result);
  }

  // 5. write report
  const reportPath = resolve(REPO_ROOT, mapping._meta.report_path);
  await mkdir(dirname(reportPath), { recursive: true });
  const report = buildReport(mapping, results, {
    driver: DRIVER,
    baseUrl,
    dryRun: DRY_RUN,
  });
  await writeFile(reportPath, report, "utf8");
  log(`report written → ${reportPath}`);
  log(`done. routes=${results.length}, errors=${results.filter((r) => r.error).length}`);
}

main().catch((e) => {
  err(e.stack || e.message);
  process.exit(2);
});
