# 🚀 Take the dashboard LIVE on Vercel (your ~3-minute step)

**Outcome:** flips the **live "Ask ELON" agent** + a **real password gate** ON. Everything else (recolor, mobile, readability, approvals) is already done and deploys to GitHub Pages the moment you merge PR #1 — but the *live agent needs a server*, and only Vercel gives it one. This is the one thing ELON literally can't do for you (it's your account login).

> `DEPLOY_TARGET=vercel` is already baked into `vercel.json`, so Vercel builds in the right mode automatically. You just import + paste 2-3 env values.

---

## 1. Import the repo to Vercel (~90 sec) — easiest path, no CLI
**Outcome:** Vercel builds + hosts the app, and auto-deploys on every future push.
- Go to **https://vercel.com/new** → **Import Git Repository** → pick **`juliannesilla/ugc-command-center`**.
- Framework preset = **Next.js** (auto-detected). Leave build settings as-is (`vercel.json` handles them).
- **Don't deploy yet** — first add the env vars in step 2 (or deploy, then add them + redeploy).

## 2. Add environment variables (~60 sec)
**Outcome:** the agent can call Claude + the password gate turns on. In the Vercel project → **Settings → Environment Variables**, add:

| Name | Value | Why |
|------|-------|-----|
| `ANTHROPIC_API_KEY` | `sk-ant-...` (the one you already gave ELON) | Powers the live agent. **Server-only — never shipped to the browser.** |
| `UGC_PASSWORD_HASH` | sha256 of your dashboard password (see below) | Turns on the real server-side login gate (`lib/auth/middleware.ts`). |
| `ANTHROPIC_MODEL` *(optional)* | `claude-opus-4-8` | Already the default; only set to override. |

**Compute `UGC_PASSWORD_HASH`** (PowerShell — replace `YOURPASSWORD`):
```powershell
$p='YOURPASSWORD'; ([System.BitConverter]::ToString((New-Object System.Security.Cryptography.SHA256Managed).ComputeHash([Text.Encoding]::UTF8.GetBytes($p))) -replace '-').ToLower()
```
Paste the resulting 64-char string as `UGC_PASSWORD_HASH`.

## 3. Deploy + verify (~30 sec)
**Outcome:** confirm the agent is live.
- Click **Deploy** (or **Redeploy** if you deployed before adding env). Wait for the green build.
- Open the **`*.vercel.app`** URL → log in → click the **Ask ELON** button (bottom-right) → ask *"What needs my attention today?"* → you should get a **streamed answer citing your data**.

---

## What you DON'T need to do
- ❌ Set `DEPLOY_TARGET` — baked into `vercel.json`.
- ❌ Touch DNS — the `*.vercel.app` URL works immediately. (Custom domain is optional, later.)
- ❌ Re-give the Anthropic key — same one you already provided.

## After it's live
- Every push to `main` (or merge of PR #1) auto-deploys.
- The GitHub-Pages site can stay as a backup, or be retired once Vercel is your primary.
- Tell ELON **"vercel is live"** and the agent + real auth are confirmed end-to-end (HR-33 live screenshot).
