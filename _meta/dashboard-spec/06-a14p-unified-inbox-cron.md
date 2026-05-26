# A.14p P3 — Unified Brand Inbox: local polling + cron setup

**Owner:** A14P-P3-UNIFIED-INBOX
**Phase:** A.14p
**Status:** Live shell · waiting on env vars before scripts populate real data
**Last update:** 2026-05-26

---

## 🟢 BOTTOM LINE

A new `/inbox/unified` route is live on gh-pages. It merges 3 brand-relevant data streams (SideShift creator chats, Gmail UGC-Brand-Outreach label, Linear UGC Pipeline comments) into one chronologically-sorted inbox. The UI reads pre-written JSONL files from `data/` at gh-pages build time — no API routes, no server actions, gh-pages-compatible. Polling scripts run locally (or via Windows Task Scheduler cron) and write the JSONLs. Once you commit + push the JSONLs, the next gh-pages deploy refreshes the UI.

## 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW

1. **Add Gmail OAuth env vars** to `.claude/settings.local.json` envs block (instructions below).
2. **Add Linear API token** to the same env block.
3. **Run each poll script once** to confirm output: `npm run poll-gmail-brand` + `npm run poll-linear-pipeline`.
4. **Optionally set up Windows Task Scheduler** for 30-min cron (instructions in §4 below).
5. Commit + push the updated JSONLs so the UI refreshes on the next gh-pages deploy.

---

## 1. Data flow

```
┌──────────────────┐    poll-gmail-brand.mjs       ┌─────────────────────────────┐
│  Gmail API       │ ────────────────────────────▶ │ data/gmail-brand-inbox.jsonl │
└──────────────────┘                               └─────────────────────────────┘
┌──────────────────┐    poll-linear-pipeline.mjs   ┌─────────────────────────────────┐
│  Linear GraphQL  │ ────────────────────────────▶ │ data/linear-pipeline-comments…  │
└──────────────────┘                               └─────────────────────────────────┘
┌──────────────────┐    poll-sideshift.mjs (A.14l) ┌──────────────────────────────────┐
│  SideShift web   │ ────────────────────────────▶ │ data/sideshift-messages.jsonl    │
└──────────────────┘                               └──────────────────────────────────┘
                                                                  │
                                                                  ▼
                                              ┌────────────────────────────────────┐
                                              │ git commit + push                   │
                                              │ gh-pages deploy                     │
                                              │ /inbox/unified renders merged feed  │
                                              └────────────────────────────────────┘
```

The UI server component (`app/inbox/unified/page.tsx`) reads all 3 JSONL files at build time via `fs.readFileSync`, normalizes each source's schema into a unified `UnifiedEntry` shape, sorts descending by timestamp, and hands the merged array to `UnifiedBrandInbox` (client component).

If any JSONL is missing or empty, that source shows a "No data yet — run `npm run poll-<source>` locally" badge in the UI rather than crashing.

---

## 2. Required env vars

Add to `~/.claude/settings.local.json` under the `env` block (or a local `.env` you source before running). Both polling scripts handle missing vars gracefully with a NEEDS-SECRETS warning + exit 0, so no cron failure if you haven't wired things yet.

### Gmail OAuth (3 vars)

| Var | What it is | Where to get it |
|---|---|---|
| `GMAIL_CLIENT_ID` | OAuth 2.0 client ID | console.cloud.google.com → APIs & Services → Credentials |
| `GMAIL_CLIENT_SECRET` | OAuth 2.0 client secret | Same place |
| `GMAIL_REFRESH_TOKEN` | Long-lived refresh token | developers.google.com/oauthplayground → use your own client → scope `https://www.googleapis.com/auth/gmail.readonly` → Exchange |

**Optional:**
- `GMAIL_LABEL` (default `UGC-Brand-Outreach`) — Gmail label name to filter on
- `GMAIL_MAX_THREADS` (default 50) — max threads to pull per poll

### Linear API (1 var)

| Var | What it is | Where to get it |
|---|---|---|
| `LINEAR_API_TOKEN` | Personal API key | linear.app → Settings → API → Personal API keys → Create key |

**Optional:**
- `LINEAR_PROJECT_ID` — UUID of UGC Pipeline project. If unset, script resolves by name.
- `LINEAR_PROJECT_NAME` (default `UGC Pipeline`) — fallback name lookup
- `LINEAR_MAX_COMMENTS` (default 200) — cap on total comments per poll

### SideShift (covered by A.14l)

- `SIDESHIFT_PASSWORD` — set per J30 protocol
- `SIDESHIFT_EMAIL` (default `julianne.mktg@gmail.com`)

---

## 3. Manual usage

```bash
cd C:\Users\julia\OneDrive\Desktop\ugc-command-center

# Dry-run any script (no API calls, prints plan + exits 0):
node scripts/poll-gmail-brand.mjs --dry-run
node scripts/poll-linear-pipeline.mjs --dry-run

# Real poll (writes data/<source>.jsonl):
npm run poll-gmail-brand
npm run poll-linear-pipeline
npm run poll-sideshift

# Help:
node scripts/poll-gmail-brand.mjs --help
node scripts/poll-linear-pipeline.mjs --help
```

After running, `git status` should show modified `data/*.jsonl` files. Commit + push, and the next gh-pages deploy bakes them into the UI.

---

## 4. Windows Task Scheduler cron (30-min interval)

1. Open **Task Scheduler** (Win+R → `taskschd.msc`).
2. **Create Basic Task** → name `UGC Unified Inbox Poll`.
3. **Trigger** → Daily, recur every 1 day, then on the Triggers tab edit → "Repeat task every 30 minutes, for a duration of 1 day."
4. **Action** → Start a program:
   - Program: `cmd.exe`
   - Arguments: `/c cd /d C:\Users\julia\OneDrive\Desktop\ugc-command-center && npm run poll-gmail-brand && npm run poll-linear-pipeline && npm run poll-sideshift && git add data/ && git commit -m "chore(inbox): scheduled poll" && git push origin main`
5. **Settings** → check "Run task as soon as possible after a scheduled start is missed" + "If the task fails, restart every 5 minutes (up to 3 times)."

Env vars must be set at the **System** level (not user-only) for the scheduled task to see them. Run `sysdm.cpl` → Advanced → Environment Variables → System variables → add each.

For the commit + push step to work non-interactively, configure a credential helper:

```bash
git config --global credential.helper manager-core
```

Then push once manually to cache credentials.

---

## 5. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `LINEAR_API_TOKEN missing — graceful exit 0` | Env var not set | Add to `.claude/settings.local.json` envs |
| `OAuth refresh failed (400)` | Refresh token expired or revoked | Re-issue via OAuth Playground (step 2 above) |
| `project not found by name` | Linear project renamed | Set `LINEAR_PROJECT_ID` directly |
| UI shows "No data yet" for a source | JSONL empty or only has header | Run that source's poll script + commit |
| Build fails locally with ENOENT on `.next/export/...` | OneDrive sync race (HR-35) | `rm -rf .next` then re-run `npm run build` |

---

## 6. Skills invoked (HR-21 audit trail)

- `frontend-design` — editorial source-color row layout, hierarchy
- `vercel:nextjs` — server component reading fs at build time for static export
- `senior-backend` — Gmail OAuth + Linear GraphQL clients
- `engineering:documentation` — this doc + script header blocks + --help output
- `superpowers:verification-before-completion` — --dry-run smoke path on both scripts
- `refactoring-ui` — vertical rhythm, type ramp, hover states on row + badge

---

## 7. Files shipped this phase

| File | Purpose |
|---|---|
| `app/inbox/unified/page.tsx` | Server component, reads 3 JSONLs at build time |
| `components/inbox/UnifiedBrandInbox.tsx` | Client list + filter chips + empty-state honesty banner |
| `components/inbox/UnifiedDetailPanel.tsx` | Slide-over with source-specific Reply CTA |
| `scripts/poll-gmail-brand.mjs` | Gmail label → JSONL poller |
| `scripts/poll-linear-pipeline.mjs` | Linear project comments → JSONL poller |
| `data/gmail-brand-inbox.jsonl` | Empty stub w/ schema header; populated by poller |
| `data/linear-pipeline-comments.jsonl` | Empty stub w/ schema header; populated by poller |
| `package.json` | Adds `poll-gmail-brand` + `poll-linear-pipeline` + `poll-sideshift` scripts |
| `_meta/dashboard-spec/06-a14p-unified-inbox-cron.md` | This doc |
