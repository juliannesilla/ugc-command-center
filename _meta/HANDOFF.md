# 🤝 HANDOFF — UGC Command Center dashboard (read this first)

> **Purpose:** pick up the dashboard rebuild cold (new session / Cowork) with full context. Read this + the plan file + JULZ-RULES, then continue at **Wave B1**.

## What this project is
Julz's **UGC Command Center** — a Next.js dashboard for her UGC creator business (pipeline, brands, SOWs, production, payments, analytics). Password-gated, deployed to **GitHub Pages (static export)**.
- **Live:** https://juliannesilla.github.io/ugc-command-center/
- **Repo:** `C:\Users\julia\OneDrive\Desktop\ugc-command-center` · GitHub `juliannesilla/ugc-command-center`
- **Main branch live commit:** `d8696be` (7 waves shipped + verified by live screenshot 2026-06-02)
- **Full plan + per-wave HR-46 config:** `C:\Users\julia\.claude\plans\continue-please-in-full-tranquil-canyon.md`
- **Rules (auto-load on this machine):** `~/.claude/CLAUDE.md` + `~/.claude/JULZ-RULES.md` (HR-1..56)

## ✅ DONE + LIVE on main (7 waves)
Recolor pink→**lavender/iris** (token remap, zero residual pink) · **mobile nav drawer** · **AA readability** (ink darkened) · **live "Ask ELON" agent dock** on every page (`app/api/agent/route.ts` + `components/agent/AgentDock.tsx`; works on Vercel, gh-pages shows "activate on Vercel" fallback) · **/initiatives** approvals tab · **/accounts** tracker · **skip-to-content** a11y.

## 🔴 OPEN WORK — start here (the 35-ask reconciliation is in the plan file)
1. **Wave B1 — KILL MOCK DATA (Julz's #1 rule, HR-49).** `lib/mock-data` is still imported **63× across 31 `app/` routes**. Repoint each to `data/*.jsonl` / `brands-canonical.jsonl` via existing `*/from-canonical.ts` adapters; where no real data exists, render an **honest empty state** (HR-10), never fixtures. *This is the headline + biggest lift.* Julz: **"no mock anything. need real data."**
2. **Wave B2 — 5 "Coming soon" pages** (payments, templates, settings, documents, content-hub) → real content or honest bestie-voice states (NOT "Coming soon").
3. **Wave B3 — Mobile depth:** bottom-tab nav (mockup #16) + boards/tables genuinely usable @390px.
4. **Wave B4 — Per-route audit/fix** (#13/14/16/18/19/29/30/31): empty viz, truncated currency, [id] 404s, header chrome, layout drift — live-audit via Chrome MCP, fix each.
5. **Wave B5 — Overview shape (DECISION):** keep hybrid scroll vs trim `/` to single-viewport (mockup #05). Ask Julz.

## 🔑 Blockers that are JULZ's hands only (don't re-ask for the API key — it's set)
- **Vercel login** → makes Ask ELON actually answer + real auth gate. Steps: `_meta/VERCEL-SETUP.md`. (`ANTHROPIC_API_KEY` is already in `~/.claude/settings.local.json`; `DEPLOY_TARGET=vercel` baked into `vercel.json`.)
- **GitHub secrets** (`LINEAR_API_TOKEN`/`N8N_API_TOKEN`/`UGC_SOURCE`) → flips on the 15-min auto-update (`refresh-data.yml`, = initiative I-6, approved).

## ⚙️ Build / deploy gotchas (will bite you otherwise)
- **Build with `npm run build:gh-pages-local`** (NOT plain `npm run build`) — it moves `app/api/*` out before static export (api routes can't static-export). Raw `next build` fails on `/api/sideshift-send` force-dynamic.
- **Push to `main` IS allowed** (Julz authorized it 2026-06-02). gh-pages auto-deploys on push to main (~2 min). Verify with Chrome MCP screenshot at the live URL (HR-33).
- **OneDrive `.next` lock:** `Remove-Item -Recurse -Force .next` before parallel builds (HR-35).
- **Commit messages via `-F <file>`** (PowerShell mangles embedded `"` quotes passed to `git -m`). Write the message with `[IO.File]::WriteAllText(... UTF8Encoding($false))` to avoid a BOM in the subject.
- **GREP RELIABLY — never the brace-glob `{a,b}` form** (it silently matches nothing on this box and HID leftover pink twice). Use path-scoped greps (`-path app`, `-path components`).
- **HR-49 / no-mock:** `lib/mock-data/_fixtures/` is the only OK mock location (tests). Track debt in `~/.claude/sessions/mock-data-debt.jsonl`.

## 🧭 Approved initiatives (acting on these)
I-5 EMILY auto-draft SideShift replies (hold for 1-tap send) · I-6 15-min auto-update (needs secrets) · I-7 Vercel agent (needs login). Per-agent autonomy: `~/.claude/sessions/agent-governance.jsonl`.

## How to continue (new session or Cowork)
1. `cd` into the repo (or open the repo folder in Cowork).
2. First prompt: **"Read `_meta/HANDOFF.md` + `~/.claude/plans/continue-please-in-full-tranquil-canyon.md`, then continue Wave B1 (kill mock data), pushing to main in batches with a live screenshot per batch."**
3. JULZ-RULES + memory auto-load from `~/.claude/`. Honor the HR-54 output contract + HR-46 plan config.
