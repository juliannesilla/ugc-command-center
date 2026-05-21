# UGC | Campaign HQ

Read-only mirror dashboard for the 13-stage UGC Campaign Operating System.
Live at: https://ugc-command-center.vercel.app (Vercel, auto-deploy from `main`)

Stack: Next.js 15 (App Router, Vercel SSR) · Tailwind · TypeScript · Recharts · Framer Motion.

---

## Setup

```bash
pnpm install
cp .env.example .env.local    # then fill in UGC_PASSWORD_HASH
pnpm dev
```

The dashboard runs at http://localhost:3000.

### Generating `UGC_PASSWORD_HASH`

```bash
node -e "crypto.subtle.digest('SHA-256', new TextEncoder().encode(process.argv[1])).then(b=>console.log(Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')))" "yourpassword"
```

---

## Environment variables

| Var | Required | Where | What it does |
|---|---|---|---|
| `UGC_PASSWORD_HASH` | ✅ now | GitHub Actions secret + `.env.local` | sha256 of the dashboard password. Used by middleware + API route. |
| `NEXT_PUBLIC_UGC_PASSWORD_HASH` | ✅ now (static export) | Same | Client-side fallback hash used by `/login` on GitHub Pages. |
| `LINEAR_API_TOKEN` | ⏳ later | GitHub Actions secret | Personal Linear API key, scoped to UGC Pipeline project only (id `8bcb55fa-5766-4c9f-80e3-a32604b23733`). Wired in `lib/data-sync/linear.ts`. |
| `N8N_API_TOKEN` | ⏳ later | GitHub Actions secret | n8n cloud token, scoped to workflows tagged `UGC`. Wired in `lib/data-sync/n8n.ts`. |
| `UGC_SOURCE` | ⏳ later | GitHub Actions secret | Path/URL to the UGC workspace for the cron rsync step. |

---

## Auth modes

### Mode A — static export (GitHub Pages, **today**)

`next.config.js` sets `output: 'export'`. In this mode:

- Middleware (`lib/auth/middleware.ts`) **does not run** — there's no Node server on GitHub Pages.
- API routes (`app/api/auth/login/route.ts`) **are not emitted** by `next build`.
- `app/login/page.tsx` performs a **client-side sha256 check** against `NEXT_PUBLIC_UGC_PASSWORD_HASH` and sets a cookie + localStorage flag on success.

This is a "thin curtain" — it keeps the dashboard out of Google's index and out of casual eyes. It is **not** cryptographic security, because the hash ships in the bundle. For real auth, see Mode B.

### Mode B — Vercel deployment (Phase D v2, future)

When Julz migrates to Vercel:

1. Remove `output: 'export'` from `next.config.js`.
2. Middleware + API route activate automatically.
3. Password lives only as `UGC_PASSWORD_HASH` (server-side) — never shipped to the client.
4. Cookie is `HttpOnly + Secure + 7d`.

---

## Data sync architecture

```
                       ┌─────────────────────────────────────┐
                       │  OneDrive/Desktop/UGC/  (ORIGIN)    │
                       │   ALLOWED PATHS ONLY                │
                       │   ─ briefs/, scripts/, exports/, …  │
                       └─────────────────┬───────────────────┘
                                         │ rsync (cron, 15-min)
                                         ▼
                       ┌─────────────────────────────────────┐
                       │  data/ugc-mirror/  (in-repo)        │
                       │  *.md / *.json only                 │
                       └─────────────────┬───────────────────┘
                                         │ gray-matter parse
                                         ▼
   Linear (UGC project) ────►  lib/data-sync/markdown.ts
   n8n (UGC tag) ───────────►  lib/data-sync/linear.ts
                              lib/data-sync/n8n.ts
                                         │
                                         ▼
                       ┌─────────────────────────────────────┐
                       │  app/**/page.tsx  +  components/**  │
                       └─────────────────┬───────────────────┘
                                         │ next build  (static export)
                                         ▼
                       ┌─────────────────────────────────────┐
                       │  GitHub Pages  (password-gated)     │
                       └─────────────────────────────────────┘
```

### Forbidden paths (hard guardrail)

The live data-sync layer **MUST NOT** read from:

- `OneDrive/Desktop/julz-vault/**`
- `juliannesilla.github.io/julz-command-center/**`
- `OneDrive/Desktop/Julz & RJ — Command Center*.pdf`
- Any `*financial*`, `*household*`, `*identity-theft*`, `*post-hdmz*`, `*RJ*` paths
- `~/Documents/` financial data
- `~/.claude/projects/*/memory/`

The guardrail is enforced in two places:
1. `lib/data-sync/markdown.ts → assertAllowedPath()` (runtime check).
2. `.github/workflows/refresh-data.yml` rsync flags (`--exclude` rules).

### Allowed sources

- `OneDrive/Desktop/UGC/**` (the only filesystem source)
- Linear project id `8bcb55fa-5766-4c9f-80e3-a32604b23733` ("UGC Pipeline") only
- n8n cloud workflows tagged `UGC` only

---

## Mock-to-live swap procedure

The whole `lib/data-sync/` layer ships **mock-only** today (PS-3). To go live, future Julz:

1. **Get tokens.** Generate `LINEAR_API_TOKEN` (scoped read-only to UGC project) + `N8N_API_TOKEN`. Add both to GitHub Actions secrets.
2. **Wire Linear.** Open `lib/data-sync/linear.ts`. Replace the `return Promise.resolve(MOCK_CAMPAIGN_FOLDERS)` line with a `fetch('https://api.linear.app/graphql', …)` call. Filter the GraphQL query to `project.id == UGC_LINEAR_PROJECT_ID`. Map issues to the `Campaign` type.
3. **Wire n8n.** Open `lib/data-sync/n8n.ts`. Replace the mock with `fetch('https://app.n8n.cloud/api/v1/workflows?tag=UGC', { headers: { 'X-N8N-API-KEY': … } })`. Map to `Workflow[]`.
4. **Enable the rsync step.** In `.github/workflows/refresh-data.yml`, uncomment the "Mirror UGC workspace" step. Set the `UGC_SOURCE` secret to your path.
5. **Verify the guardrail.** Run `pnpm build` locally and confirm no forbidden paths leak into `data/ugc-mirror/`. The `assertAllowedPath()` check will throw if anything sneaks in.
6. **Replace mock imports.** Every page that imports from `lib/mock-data/` should switch to the corresponding `lib/data-sync/` function. Mock files stay in the repo as fixtures for tests.
7. **Test the gate.** Confirm `/login` still works in both Mode A and Mode B before deploying.

---

## Owned files (by sub-agent)

- **D-5 (this batch):** `app/assets/`, `app/pipeline/deadlines/`, `app/login/`, `app/api/auth/login/`, `lib/auth/`, `lib/data-sync/`, `lib/mock-data/assets.ts`, `lib/mock-data/deadlines.ts`, `components/assets/`, `components/deadlines/`, `.github/workflows/refresh-data.yml`, README.

---

## Deploy

Production: https://ugc-command-center.vercel.app (auto-deployed from main branch)
Previews: every PR gets a unique URL via Vercel GitHub integration

Local dev: `npm run dev`
Build: `npm run build`

### One-time Vercel handshake (Julz hand-action J23 / J24)

These steps require Julz's browser + interactive paste — Claude cannot run them. Execute in order from the repo root:

```bash
# J23 — link the repo to Vercel
npm i -g vercel
vercel link                          # browser OAuth → pick juliannesilla account → confirm project

# J24 — push secrets to Vercel (production environment)
vercel env add ANTHROPIC_API_KEY production    # paste key
vercel env add GITHUB_TOKEN production         # paste PAT (scopes: repo + workflow)
vercel env add LINEAR_API_TOKEN production     # paste Linear token
vercel env add N8N_API_TOKEN production        # paste n8n cloud token
```

After J23 + J24 land, the next push to `main` triggers Vercel's auto-deploy. Verify at https://vercel.com/juliannesilla/ugc-command-center.
