# Lighthouse CI — UGC Command Center

Owner: A14I-5b LIGHTHOUSE (Phase A.14i)

## What this enforces

| Category | Threshold | Action on fail |
|----------|-----------|----------------|
| Performance | >= 85 | build fails |
| Accessibility | >= 95 | build fails |
| Best Practices | >= 90 | build fails |
| SEO | >= 85 | build fails |
| CLS | <= 0.1 | build fails |
| LCP | <= 2500 ms | warn (tighten later) |
| FCP | <= 2000 ms | warn |
| TBT | <= 300 ms | warn |
| TTI | <= 3500 ms | warn |

Resource budgets (per-page) are defined in `../../lighthouse-budgets.json` — script <=350KB, CSS <=60KB, total <=1.2MB.

## URLs audited (8)

1. `/`
2. `/pipeline/board`
3. `/pipeline/database`
4. `/brand-responses`
5. `/analytics`
6. `/payments`
7. `/sow-breakdown` (new in A.14i)
8. `/script-production` (new in A.14i)

## How to run locally

### Against built static export (default)

```bash
npm run build        # produces ./out
npm run test:lighthouse
```

LHCI will serve `./out` and audit each route 3x (median is reported).

### Against a live deploy

```bash
LHCI_TARGET_URL=https://ugc-command-center.vercel.app npm run test:lighthouse
```

### Diagnose a single URL

```bash
npx lhci collect --url=http://localhost:3000/analytics --numberOfRuns=1
npx lhci assert
```

## CI integration

`.github/workflows/qa.yml` (owned by A14I-5c) wires `npm run test:lighthouse` into the QA pipeline. Reports are uploaded to `temporary-public-storage` — links posted as PR comments via `@lhci/cli`'s default GitHub status integration.

To swap to a permanent LHCI server, edit `lighthouserc.js` -> `ci.upload.target` to `lhci` and add `serverBaseUrl` + `token`.

## Failure-mode quickref

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `ENOENT: out/` | Static export not built | run `npm run build` first |
| All scores collapse on one run | Cold-start variance | runs already set to 3, median wins |
| `chrome-launcher` fails in CI | Sandbox not available | add `--collect.settings.chromeFlags="--no-sandbox"` |
| CLS regression on `/pipeline/board` | DnD layout shift on hydration | reserve grid space in CSS, audit `@dnd-kit` sortable mount |
| A11y drops below 95 | Missing alt / label / contrast | LHCI report's `audits` section names exact node selectors |

## Skill stack referenced

- `chrome-devtools-mcp:lighthouse-audit` — primary audit harness
- `chrome-devtools-mcp:a11y-debugging` — accessibility node inspection
- `chrome-devtools-mcp:debug-optimize-lcp` — LCP element identification
- `anthropic-skills:performance-profiler` — perf regression analysis
- `anthropic-skills:web-accessibility` — WCAG 2.2 AA mapping
- `vercel:deployments-cicd` — Vercel preview URL integration
- `superpowers:verification-before-completion` — gate before claiming PASS

## Maintenance

When adding a new top-level route:
1. Append to `ROUTES` in `lighthouserc.js`
2. Update the URL list in this README
3. Re-baseline budgets if route is uncommonly heavy (justify in PR)
