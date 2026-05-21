# Playwright E2E Tests — UGC Command Center

End-to-end smoke tests for the dashboard. Specs live in this folder; runner
config lives at the repo root (`playwright.config.ts`).

## One-time setup

```bash
npm install
npx playwright install --with-deps chromium
```

The `--with-deps` flag installs the OS libraries Chromium needs (skip on macOS).

## Running locally

```bash
# Headless run, auto-spawns `npm run dev` and tears it down.
npm run test:e2e

# Interactive UI mode (recommended for authoring).
npm run test:e2e -- --ui

# Single spec.
npm run test:e2e -- tests/playwright/sidebar-nav.spec.ts

# Debug a spec step-by-step.
npm run test:e2e -- --debug tests/playwright/login-flow.spec.ts
```

The Playwright config will auto-launch `npm run dev` on port 3000 unless
`PLAYWRIGHT_BASE_URL` is set.

## Targeting a preview / static export

```bash
# Vercel preview URL
PLAYWRIGHT_BASE_URL=https://ugc-command-center-xyz.vercel.app npm run test:e2e

# Local static export (after `npm run build && npx serve out -p 4173`)
PLAYWRIGHT_BASE_URL=http://localhost:4173 PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e
```

## Running in CI

The GitHub Actions QA workflow (owned by A14I-5c) should:

1. `npm ci`
2. `npx playwright install --with-deps chromium`
3. `npm run test:e2e`
4. Upload `playwright-report/` as an artifact on failure.

## Spec inventory

| Spec | What it covers |
|---|---|
| `sidebar-nav.spec.ts` | All 18 sidebar items render and route without error overlay |
| `pipeline-board.spec.ts` | Kanban columns render, cards render or empty state, scroll container exists |
| `brand-responses-split-pane.spec.ts` | Row click updates right pane + sets `?id=` in URL; deep-link works |
| `sow-quick-actions.spec.ts` | Each Quick Action button is clickable; no console errors |
| `brain-dump-drag.spec.ts` | Drag a hook card between columns (uses raw mouse events for @dnd-kit) |
| `login-flow.spec.ts` | Password gate: empty/wrong/correct + already-authed redirect |

## Selector strategy

Tests prefer `data-testid` selectors (per HR-25, robust to copy changes).
When no `data-testid` exists, tests fall back to role-based selectors
(`getByRole`) and text-content matchers. If you add a new interactive
surface to the dashboard, please add the `data-testid` attributes listed in
each spec's locators — the tests are designed to be a forcing function for
consistent testid hygiene.

## Known fragilities

- **Login**: dev fallback password is `ugc`. If `NEXT_PUBLIC_UGC_PASSWORD_HASH`
  is set to a custom value in your env, set `UGC_DEV_PASSWORD` so the
  login-flow test can authenticate.
- **Brain Dump drag**: @dnd-kit uses pointer events. The spec uses manual
  `page.mouse.move/down/up` with intermediate moves; if drag-and-drop
  behavior changes, see comments in `brain-dump-drag.spec.ts`.
- **Empty seed data**: pipeline-board, brand-responses, and brain-dump
  specs gracefully skip / annotate when no seed data is present rather than
  failing hard. This is intentional for static-export builds where MSW /
  fixtures aren't loaded.
