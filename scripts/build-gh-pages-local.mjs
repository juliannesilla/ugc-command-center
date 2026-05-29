#!/usr/bin/env node
// build-gh-pages-local.mjs
//
// Local mirror of the GitHub Pages CI deploy build (.github/workflows/deploy.yml).
// Lets you verify the static-export build on your machine without pushing.
//
// What it does (identical sequence to CI):
//   1. Move app/api out of the build tree  (Edge/Node API routes can't be
//      statically exported — output:'export' would error on them).
//   2. Run `next build` with DEPLOY_TARGET=gh-pages so next.config.js turns on
//      output:'export' + basePath + assetPrefix.
//   3. ALWAYS move app/api back, even if the build fails (try/finally).
//
// Why this exists as a script instead of an inline package.json one-liner:
//   - The old one-liner needed the `cross-env` package (which was never
//     installed) to set DEPLOY_TARGET cross-platform → it silently no-op'd on
//     Windows. Node sets env vars the same way on every OS, so no dep needed.
//   - The old one-liner used `|| true`, which swallowed real build failures and
//     made every local build look like it "passed". This version propagates the
//     real exit code so a broken build is actually visible.
//
// DIJKSTRA / Code Health Squad — 2026-05-29. No app code touched.

import { existsSync, renameSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const API_DIR = 'app/api';
const TMP_DIR = 'app/_api_tmp_for_local_gh_pages_build';

function moveApiOut() {
  if (existsSync(API_DIR)) {
    renameSync(API_DIR, TMP_DIR);
    console.log(`[build:gh-pages-local] moved ${API_DIR} -> ${TMP_DIR}`);
  }
}

function restoreApi() {
  if (existsSync(TMP_DIR)) {
    renameSync(TMP_DIR, API_DIR);
    console.log(`[build:gh-pages-local] restored ${TMP_DIR} -> ${API_DIR}`);
  }
}

let exitCode = 0;

moveApiOut();
try {
  const result = spawnSync('npx', ['next', 'build'], {
    stdio: 'inherit',
    shell: true, // needed so `npx` resolves on Windows
    env: { ...process.env, DEPLOY_TARGET: 'gh-pages', NODE_ENV: 'production' },
  });
  // spawnSync sets .status to the child's exit code, or .error if it couldn't spawn.
  if (result.error) {
    console.error('[build:gh-pages-local] failed to start next build:', result.error.message);
    exitCode = 1;
  } else {
    exitCode = result.status ?? 1;
  }
} finally {
  restoreApi(); // ALWAYS restore, success or failure.
}

if (exitCode === 0) {
  console.log('[build:gh-pages-local] build OK — static export is in ./out');
} else {
  console.error(`[build:gh-pages-local] build FAILED (exit ${exitCode})`);
}
process.exit(exitCode);
