# Visual-Diff Harness

Owner: A14I-5c VISUAL-DIFF (Phase A.14i parallel agent).
Source mapping: `_meta/mockups/UUID-MAPPING.md` → `route-mockup-mapping.json`.

## What it does

For every route in the UGC dashboard that has a ChatGPT mockup, this
harness:

1. Reads the route↔mockup table from `route-mockup-mapping.json`.
2. Screenshots the deployed page at **1440×900** (or `390` for mobile).
3. Composites a side-by-side PNG pair (deployed left · mockup right) into
   `_meta/mockups/post-a14i-visual-diff/{slug}.diff.png`.
4. Emits a P0/P1/P2 grade markdown report at
   `_meta/dashboard-spec/06-a14i-visual-diff-report.md`.

## Quick reference

```bash
# Validate inputs + emit report scaffold without taking screenshots.
node tests/visual-diff/compare-against-mockups.mjs --dry-run

# Full run with Playwright (preferred — DOM-aware, parallel-safe).
DEPLOY_URL=https://ugc-command-center.vercel.app \
  node tests/visual-diff/compare-against-mockups.mjs

# Verbose
node tests/visual-diff/compare-against-mockups.mjs --verbose

# Use Chrome MCP shim (when Playwright is unavailable in the agent context).
node tests/visual-diff/compare-against-mockups.mjs --driver=mcp
```

Exit codes:

| Code | Meaning |
|------|---------|
| 0 | success (or `--dry-run` validated cleanly) |
| 1 | input error (bad JSON, mockup file missing) |
| 2 | capture / composite error during a real run |

## Inputs

- **`route-mockup-mapping.json`** — extracted from
  `_meta/mockups/UUID-MAPPING.md`'s "Mockup → Route Mapping" table.
  17 route entries, 25 mockup files. Each row carries:
  - `route` — Next.js path
  - `mockups[]` — files under `_meta/mockups/`
  - `owner` — sub-agent that built it
  - `status` — `shipped` or `ship-in-flight`
  - `grade_floor` — minimum grade if the human reviewer doesn't override
  - optional `viewport_width_override` (e.g., 390 for mobile)
- **`DEPLOY_URL`** env var — defaults to the Vercel prod URL in the
  mapping's `_meta` block.

## Outputs

- `_meta/mockups/post-a14i-visual-diff/{slug}.deployed.png` — raw deployed
  screenshot per route.
- `_meta/mockups/post-a14i-visual-diff/{slug}.diff.png` — side-by-side
  composite (deployed | mockup), 24-px gap, white background.
- `_meta/dashboard-spec/06-a14i-visual-diff-report.md` — graded table.

Always opens with HR-30 `## 🟢 BOTTOM LINE` + `## 🔴 WHAT JULZ NEEDS TO
DO RIGHT NOW` blocks.

## Grading rubric

The harness seeds a grade-floor from the mapping JSON; a human reviewer
adjusts after viewing the composite:

| Grade | Pixel-diff | Layout | Examples |
|-------|------------|--------|----------|
| **P0** — blocker | > 35 % | shape mismatch · route 404 · CTA missing | ship-stoppers |
| **P1** — polish | 12–35 % | hierarchy ok · spacing off · color drift | most ship-in-flight rows |
| **P2** — cosmetic | < 12 % | faithful · minor typo / spacing only | most shipped rows |

## Drivers

The harness supports three drivers. Pick whichever is available in the
runner:

### 1. Playwright (preferred)

```bash
npm install --save-dev playwright sharp
npx playwright install --with-deps chromium
node tests/visual-diff/compare-against-mockups.mjs
```

DOM-aware, parallel-safe, runs headless in CI. Required for the GitHub
Actions `qa-stack.yml` workflow.

### 2. Chrome MCP shim (`--driver=mcp`)

When Playwright is not installable (e.g., agent context without
`npx playwright install` permissions), the orchestrating agent (Claude or
the human operator) drives `mcp__chrome-devtools__take_screenshot` and
drops each PNG into `_tmp/visual-diff-captures/{slug}.deployed.png`. The
harness then picks them up and composites. See the warning printed at
start-up for the exact path it polls.

### 3. Dry-run (`--dry-run`)

Validates input JSON + reports any missing mockup files but does NOT
launch a browser. Used by Phase A.14i parallel agents to verify the
harness is structurally sound without depending on Chrome MCP being
guaranteed in the agent context.

## CI

`qa-stack.yml` runs Playwright + Lighthouse + visual-diff on every PR and
on `workflow_dispatch`. Initially the trigger is **manual-only** until
Julz J13 GH-secrets work lands — flip the `on:` block when ready.

## Skills referenced

- `engineering:deploy-checklist` (FIRST — pre-flight before any QA stack stands up)
- `vercel:deployments-cicd`
- `chrome-devtools-mcp:lighthouse-audit`
- `frontend-design`
- `design:design-handoff` (mockup → code fidelity)
- `karpathy-coder:karpathy-reviewer`
- `superpowers:verification-before-completion`

## Hard rules honored

- HR-15 verify the artifact, not the proxy — composites are the artifact, not the JSON.
- HR-19 source ≠ artifact — the report links to the rendered composite PNG, not source code.
- HR-26 problems ship with solutions — every P0 row in the report carries an owner.
- HR-30 TL;DR + Julz-action at top of every output.

## Audit

- Built: 2026-05-21 by A14I-5c VISUAL-DIFF.
- Files owned exclusively by this agent:
  - `tests/visual-diff/compare-against-mockups.mjs`
  - `tests/visual-diff/route-mockup-mapping.json`
  - `tests/visual-diff/README.md`
  - `.github/workflows/qa-stack.yml`
  - `package.json` (added `sharp`, `playwright` devDeps)
