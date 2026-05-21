# scripts/lib — Dashboard-comment cron pipeline modules

Three small ESM modules consumed by `scripts/process-comments.mjs` (X2). Each is independently testable and has zero cross-coupling beyond ESM imports.

## Modules

### `open-pr.mjs` — Octokit-based draft PR creation

```js
import { openDraftPR } from './lib/open-pr.mjs';

const { pr_number, pr_url, head_sha, reused } = await openDraftPR({
  branch: 'dashboard-comments/2026-05-21-abc123',
  base: 'main',
  title: '[dashboard-comment] Fix typo in hero copy',
  body: prBodyMarkdown, // include Tier-2 verdict block above the diff
  labels: ['dashboard-comment', 'automated'],
});
```

- **Idempotent:** if an open PR already exists for the same head branch, it is reused (no duplicate PR), labels are re-applied, and `reused: true` is returned.
- **Auth:** reads `GITHUB_TOKEN` (or `GH_TOKEN`) from env. Override with `opts.token`.
- **Repo:** reads `GITHUB_REPOSITORY` slug (`owner/repo`). Override with `opts.owner` + `opts.repo`.
- **Dynamic import** of `@octokit/rest` so the module loads in unit tests without the dep installed.
- **Label failures** for missing-on-repo labels are swallowed (status 404/422); other errors propagate.

### `tier2-review.mjs` — Independent ELON Tier-2 reviewer

```js
import Anthropic from '@anthropic-ai/sdk';
import { tier2Review } from './lib/tier2-review.mjs';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const verdict = await tier2Review({
  patches: [{ path: 'app/page.tsx', diff: unifiedDiff, rationale: '...' }],
  anthropic,
  model: 'claude-opus-4-7',
});
// verdict.verdict === 'PASS' | 'PARTIAL' | 'FAIL'
// verdict.findings, verdict.suggested_fixes, verdict.summary, verdict.usage
```

- **Separation of duties (CAPA-007):** the reviewer system prompt explicitly states "you did NOT author these patches."
- **Rule coverage:** HR-15 / HR-19 / HR-21 / HR-25 / HR-26 + visual fidelity + code clarity.
- **Structured output:** reviewer is instructed to emit JSON on the final line. Parse failure ⇒ default `FAIL` verdict (fail-closed).
- **Caller owns the Anthropic client** so X2 can share one client + handle retries/timeouts centrally.

### `spend-ledger.mjs` — Daily Anthropic spend cap

```js
import { readToday, append, capExceeded } from './lib/spend-ledger.mjs';

const { exceeded, spentUsd, remainingUsd } = await capExceeded(5.00);
if (exceeded) { /* skip Tier-2 call this run */ }

await append({ tokens: 12_340, usd: 0.42, model: 'claude-opus-4-7', run_id });
```

- **Storage:** append-only JSONL at `scripts/cron-output/spend-ledger.jsonl` (gitignored — runtime state).
- **Bucket:** UTC `YYYY-MM-DD`.
- **Malformed lines:** silently skipped on read (ledger is best-effort).
- **Fail-closed:** `capExceeded` returns `exceeded: true` once `spentUsd >= maxUsd`.

## How `scripts/process-comments.mjs` (X2) consumes these

X2 orchestrates the pipeline in this order:

1. **Pre-flight cap check** — `capExceeded(DAILY_CAP_USD)` → bail early if true.
2. **Generate patches** (first Anthropic call, X2-owned).
3. **`append(...)`** spend for call #1.
4. **`tier2Review({ patches, anthropic })`** — second Anthropic call.
5. **`append(...)`** spend for call #2.
6. Build PR body that embeds the Tier-2 verdict at the top.
7. **`openDraftPR({ branch, title, body, labels })`** → post `pr_url` back to dashboard.

X2 NEVER modifies these libs — only imports them. This isolation lets the libs be unit-tested in their own runner without the full cron context.

## Testing

```bash
# Smoke-test that all three modules import cleanly:
node -e "Promise.all([
  import('./scripts/lib/open-pr.mjs'),
  import('./scripts/lib/tier2-review.mjs'),
  import('./scripts/lib/spend-ledger.mjs'),
]).then(([a, b, c]) => console.log({
  openPr: Object.keys(a),
  tier2: Object.keys(b),
  spend: Object.keys(c),
}))"
```

No live API calls happen at import time — all I/O is inside exported functions.
