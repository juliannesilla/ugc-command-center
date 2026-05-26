# A.14r — Headless SideShift Poll + Windows Task Scheduler Cron

## 🟢 BOTTOM LINE

`scripts/poll-sideshift.mjs` now runs fully autonomously in headless mode (chrome-headless-shell binary + 8 stealth patches bypass SideShift's React bot detection). Verified end-to-end: 30 conversations scraped, dedup logic confirmed (sha256(thread_id + preview) = stable id across polls). Ready for Windows Task Scheduler to run every 30 min.

## 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW

One-time cron setup (~30 sec, elevated PowerShell). Pick frequency:

**Every 30 minutes (recommended):**
```powershell
schtasks /Create /SC MINUTE /MO 30 /TN "SideShiftPoll" /TR "cmd /c cd /d C:\Users\julia\OneDrive\Desktop\ugc-command-center && node scripts\poll-sideshift.mjs >> scripts\sideshift-output\cron.log 2>&1" /RU "%USERNAME%"
```

**Every hour:**
```powershell
schtasks /Create /SC HOURLY /TN "SideShiftPoll" /TR "cmd /c cd /d C:\Users\julia\OneDrive\Desktop\ugc-command-center && node scripts\poll-sideshift.mjs >> scripts\sideshift-output\cron.log 2>&1" /RU "%USERNAME%"
```

**4x daily (8am/12pm/4pm/8pm):**
```powershell
schtasks /Create /SC DAILY /ST 08:00 /TN "SideShiftPoll-AM" /TR "..."
schtasks /Create /SC DAILY /ST 12:00 /TN "SideShiftPoll-Noon" /TR "..."
schtasks /Create /SC DAILY /ST 16:00 /TN "SideShiftPoll-PM" /TR "..."
schtasks /Create /SC DAILY /ST 20:00 /TN "SideShiftPoll-Evening" /TR "..."
```

To remove later: `schtasks /Delete /TN "SideShiftPoll" /F`

---

## How it works

1. **Cron fires** → runs `node scripts/poll-sideshift.mjs` from repo root
2. **Script launches `chrome-headless-shell`** (Playwright bundled binary, intact at 201MB, AV doesn't quarantine it like regular chrome.exe)
3. **Stealth patches inject pre-page-load** — overrides `navigator.webdriver`, `plugins`, `languages`, removes `cdc_*` fingerprint, fakes `window.chrome`, patches WebGL vendor + permissions API
4. **Navigates to `app.sideshift.app/chat`** using the persistent profile dir at `~/.agent-browser/sideshift-profile/` (created during A.14q `--setup` interactive Google OAuth login)
5. **React app renders normally** — bot detection bypassed, ~3-5s for first row to appear
6. **Scrapes ≥5 rows** then waits 1s for late-rendering tail, finds 30 total
7. **Dedup vs `data/sideshift-messages.jsonl`** — id = sha256(thread_id + preview.slice(140))
8. **Appends only new rows** + logs to `scripts/sideshift-output/poll-{run-id}.log`
9. **Exit 0** — Task Scheduler logs success in `scripts/sideshift-output/cron.log`

## Log files

- **Cron stdout/stderr:** `scripts/sideshift-output/cron.log` (appended)
- **Per-run structured JSON:** `scripts/sideshift-output/poll-<timestamp>.log`
- **Output JSONL:** `data/sideshift-messages.jsonl` (committed to repo via cron)

## Optional: auto-commit + push the JSONL

If you want the gh-pages dashboard to refresh with new data on every cron tick, wrap the command to also commit + push:

```powershell
schtasks /Create /SC MINUTE /MO 30 /TN "SideShiftPoll" /TR "cmd /c cd /d C:\Users\julia\OneDrive\Desktop\ugc-command-center && node scripts\poll-sideshift.mjs && git add data/sideshift-messages.jsonl && git diff --cached --quiet || (git commit -m \"data: SideShift poll %DATE% %TIME%\" && git push origin main) >> scripts\sideshift-output\cron.log 2>&1" /RU "%USERNAME%"
```

This makes the cron commit+push only if there are new messages (the `git diff --cached --quiet` check). Otherwise it skips.

## Troubleshooting

| Symptom | Diagnosis | Fix |
|---|---|---|
| Cron silently failing (no log entries) | Task Scheduler couldn't find node | Set fully-qualified node path: `C:\Program Files\nodejs\node.exe` |
| `STEALTH_FAILED or render-stall` in logs | SideShift updated bot detection beyond our patches | Re-run `--setup` to refresh OAuth, then check `_meta/dashboard-spec/06-a14q-sideshift-dom-inspection.md` to update selectors |
| 30 new rows per poll (dedup not working) | id computation drifted | Re-check `makeMessageId(threadId, preview.slice(140))` — must be stable per content not per ts |
| Exit code 1 with `OAuth session expired` | Profile dir cookies aged out (~weeks/months) | Re-run `node scripts/poll-sideshift.mjs --setup` for one-time Google sign-in |
| Cron runs but data file unchanged | Headless launched but rows still 0 | Check `scripts/sideshift-output/poll-*.log` for `STEALTH_FAILED` diagnostic block |

## Stealth patches applied (A.14r)

Reference: see `applyStealthPatches()` function in `scripts/poll-sideshift.mjs`. 8 patches:

1. `navigator.webdriver` → `undefined`
2. `navigator.plugins` → realistic 5-plugin array
3. `navigator.languages` → `['en-US', 'en']`
4. `cdc_*` properties on `window` → deleted (ChromeDriver fingerprint)
5. `window.chrome` → fake object with runtime/loadTimes/csi/app
6. `Notification.permission` → `'default'` instead of `'denied'`
7. WebGL `getParameter` → returns realistic GPU info (Intel Iris)
8. `navigator.permissions.query({name: 'notifications'})` → `'default'`

Plus realistic launch args:
- `userAgent` matches Chrome Stable 148 (not chrome-headless-shell)
- `locale: 'en-US'`, `timezoneId: 'America/Los_Angeles'`
- `--lang=en-US,en;q=0.9`
- `--disable-blink-features=AutomationControlled`

## Verification (already done in A.14r execution)

- Headless launch succeeds via `chrome-headless-shell` (no AV quarantine)
- React chat-list renders 30 rows after ~3-5s wait
- Scrape extracts brand + preview + relative ts correctly
- Dedup confirmed: 2nd consecutive poll → 30 scraped, 29 dedupes, 1 legitimate new
- Exit code 0, JSONL writes clean
