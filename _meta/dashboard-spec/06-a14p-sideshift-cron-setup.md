# 06-a14p — SideShift Live Poll: One-Time Setup + Cron

**Status:** LIVE · A.14p Stream 3 unblocker · Owner: A14P-P8-SIDESHIFT-LIVE-POLL
**Last updated:** 2026-05-26

## 🟢 BOTTOM LINE

`scripts/poll-sideshift.mjs` has been rewritten to authenticate via Julz's already-logged-in Chrome session instead of the dead `SIDESHIFT_PASSWORD` headless path (Google OAuth + MFA blocks headless logins). One-time interactive login is required to seed a dedicated Chrome profile dir; after that, the script polls headless on cron.

## 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW

1. Run the one-time setup (Step 1 below) — opens a visible Chrome window for Google OAuth sign-in.
2. After step 1 succeeds, register the Windows Task Scheduler entry (Step 2).
3. Confirm data is flowing by checking `data/sideshift-messages.jsonl` grows after the first cron tick (Step 3).

---

## 1. One-time profile setup

```powershell
cd C:\Users\julia\OneDrive\Desktop\ugc-command-center
node scripts\poll-sideshift.mjs --setup
```

A Chrome window opens pointing at `https://app.sideshift.app/chat`.

- If you land on the SideShift inbox already → you're authenticated against a different profile; sign out and back in via Google (julzsilla@gmail.com).
- If you land on a sign-in screen → click "Continue with Google", choose julzsilla@gmail.com, complete MFA.
- Once you're at the inbox, **close the Chrome window**. The script will detect the close and exit.

The profile dir lives at `C:\Users\julia\.agent-browser\sideshift-profile\` and contains your authenticated cookies. Do not delete it.

### Verify setup worked

```powershell
node scripts\poll-sideshift.mjs --dry-run
```

Should print `profileExists: true`. If it still says `false`, the profile dir wasn't created — re-run `--setup`.

### First real poll (manual)

```powershell
node scripts\poll-sideshift.mjs
```

Tail the log:

```powershell
Get-Content scripts\sideshift-output\poll-*.log -Tail 20
```

Look for `appended to jsonl` with `appended: N` where N > 0. If you see `auth redirect — OAuth session expired`, re-run `--setup`.

## 2. Windows Task Scheduler — 30-min cron

Run from an elevated PowerShell once:

```powershell
schtasks /Create /SC MINUTE /MO 30 /TN "SideShiftPoll" /TR "cmd /c cd /d C:\Users\julia\OneDrive\Desktop\ugc-command-center && node scripts\poll-sideshift.mjs >> scripts\sideshift-output\cron.log 2>&1" /RU "%USERNAME%"
```

Verify it's registered:

```powershell
schtasks /Query /TN "SideShiftPoll"
```

To remove later:

```powershell
schtasks /Delete /TN "SideShiftPoll" /F
```

## 3. Confirm data flow

```powershell
Get-Content data\sideshift-messages.jsonl -Tail 5
```

After the first cron tick (≤30 min), you should see SideShift-message JSON lines below the header line. Each entry conforms to `lib/sideshift/types.ts → SideShiftMessage`.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `profile dir does not exist` | Setup never ran | Run `--setup` |
| `auth redirect — OAuth session expired` | Google session expired (rare; weeks-long) | Re-run `--setup` |
| `no messages scraped — empty inbox or selector drift` | SideShift redesigned OR inbox really is empty | Re-run with `--headed --verbose` to eyeball |
| `browser launch failed` + `Executable doesn't exist` | Playwright Chromium binary not installed | `npx playwright install chromium` |
| `playwright not installed` | Neither `playwright-core` nor `@playwright/test` in node_modules | `npm install playwright-core` |
| Cron log shows nothing | Task Scheduler isn't running it | `schtasks /Query /TN "SideShiftPoll" /V /FO LIST` — check `Last Run Time` |
| Files locked / `ENOENT rename` | OneDrive sync conflict (HR-35) | Move repo off OneDrive (deferred A.14n task) |

## Schema confirmation

The script writes `SideShiftMessage` objects per `lib/sideshift/types.ts`:

```ts
{
  id: string,                 // sha256(thread_id + ts).slice(0,16)
  schema_version: 1,
  thread_id: string,
  brand: string,
  campaign_title: string,
  message_text: string,
  last_message_preview: string,  // ≤140 chars
  ts: string,                    // ISO 8601 UTC
  direction: 'inbound' | 'outbound',
  status: 'awaiting-you' | 'awaiting-brand' | 'no-action',
  thread_url: string,
}
```

Existing header line in `data/sideshift-messages.jsonl` is preserved (append-only).

## Skills cited (HR-21-revised)

- `senior-backend` (primary — Node ESM CLI + Playwright integration)
- `chrome-devtools-mcp:chrome-devtools` (browser automation patterns)
- `engineering:documentation` (this doc)
- `superpowers:verification-before-completion` (`--dry-run` + `--setup` smoke paths)
