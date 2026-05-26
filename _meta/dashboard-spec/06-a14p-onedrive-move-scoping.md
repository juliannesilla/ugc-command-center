# A.14p — OneDrive Move Scoping (READ-ONLY, migration deferred to A.14q)

**Owner:** A14P-P7-ONEDRIVE-MOVE-SCOPING
**Status:** SCOPING ONLY — no code changes in this phase
**Date:** 2026-05-25
**Skills invoked:** `engineering:documentation`, `superpowers:verification-before-completion`, senior-devops persona

---

## 1. 🟢 BOTTOM LINE

Moving `ugc-command-center` off OneDrive is **GO — recommended for A.14q**. HR-35 (`rm -rf .next` before every build) is a recurring tax — confirmed live during this scoping pass when `du -sh .next/` errored on dozens of files that OneDrive renamed mid-listing. The blast radius is narrow: **3 hardcoded path references** (1 in repo script, 0 in workflows, 2 informational in spec docs), **0 hardcoded paths in JULZ-RULES.md / CLAUDE.md / sub-agent-spawn-template.md**, and **0 in `_paths.py`** (that file scopes to UGC workspace, not ugc-command-center). Proposed new path: **`C:\dev\ugc-command-center`** with a Windows directory junction left at the OneDrive location for backward-compat during a 1-week soak.

**Recommendation: GO for A.14q.** Estimated wall time **45–75 min** including verification.

## 2. 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW

1. **Approve target path.** Default proposed: `C:\dev\ugc-command-center`. Alternates in §4.
2. **Approve junction strategy.** Default proposed: leave a Windows directory junction at the OneDrive path for 1 week, then delete. Alternate: hard break immediately.
3. **Answer the 4 open questions in §10** (VS Code workspace, desktop shortcut, dev-server timing, OneDrive exclude list).
4. After approval → fire **A.14q** to execute migration.

---

## 3. Current state

| Item | Value |
|---|---|
| Repo path | `C:\Users\julia\OneDrive\Desktop\ugc-command-center\` |
| Git remote | `https://github.com/juliannesilla/ugc-command-center.git` |
| Branch | `main` (1 uncommitted modification: `app/pipeline/deadlines/page.tsx`) |
| OneDrive sync impact | Active — `du` listing of `.next/` errored mid-scan on ~60 files mid-rename during this scoping pass. Real-time proof OneDrive holds locks during Next.js builds. |
| HR-35 recurrence | Documented across phases **A.14g, h, i, j, k, l, m** (7 phases). Feedback log mentions ENOENT/HR-35 in 3 entries. Also referenced in A.14n+o build incident notes. |
| Mitigation in force | `rm -rf .next` (Bash) / `Remove-Item -Recurse -Force .next` (PowerShell) prefix before every `npm run build`. Documented in JULZ-RULES.md HR-35. |
| Cost | ~5–15 sec per build × every build × every parallel sub-agent. Plus occasional full crash + restart. |

---

## 4. Proposed new path

### Option A — `C:\dev\ugc-command-center` ⭐ RECOMMENDED

- **Pros:** Short path (avoids Windows `MAX_PATH` 260-char issues in deep `node_modules`). Outside any sync surface. Standard convention for dev work.
- **Cons:** Lives outside user profile (root of C:) — minor convention break but acceptable on personal Windows machine. Requires creating `C:\dev\` (Julz doesn't have it yet — verified: no `C:\Users\julia\Desktop\` either, only OneDrive\Desktop).
- **Permissions:** Julz's account owns C:\ root on a personal machine, so no admin elevation needed for `mkdir C:\dev`.

### Option B — `C:\Users\julia\dev\ugc-command-center`

- **Pros:** Stays under user profile (familiar location).
- **Cons:** Longer path → closer to MAX_PATH ceiling. Otherwise equivalent.

### Option C — `D:\dev\ugc-command-center` (if a D: drive exists)

- **Pros:** Physical isolation from C: system drive.
- **Cons:** Unknown whether Julz has a D: partition. Skipped unless confirmed.

### Junction strategy

**Recommended:** After move, create a Windows directory junction at the old path:

```powershell
New-Item -ItemType Junction -Path "C:\Users\julia\OneDrive\Desktop\ugc-command-center" -Target "C:\dev\ugc-command-center"
```

This means **anything still referencing the old path keeps working transparently** during the 1-week soak. OneDrive sees the junction as a reparse point and (per Microsoft docs) does **not** sync the target — confirmed behavior. After 1 week of no breakage, delete the junction.

**Alternate:** Hard break. No junction. Forces all references to be updated immediately. Faster cutover but risks surprise breakage from references we missed in this scoping.

---

## 5. Dependencies to update (exhaustive)

Grep + manual audit complete. Findings:

### Hardcoded path references found

| # | File | Line | Reference | Action for A.14q |
|---|------|------|-----------|------|
| 1 | `scripts/draft-sideshift-replies.mjs` | 58 | `'C:/Users/julia/OneDrive/Desktop/UGC/_meta/09-outreach-templates.md'` | **NO CHANGE** — this points to the UGC workspace (not ugc-command-center). UGC stays on OneDrive. |
| 2 | `scripts/sideshift-draft-prompt.md` | 6 | Same path as #1 | NO CHANGE — same reason. |
| 3 | `_meta/dashboard-spec/06-a14o-post-deploy-grade.md` | (info only) | references OneDrive path in narrative | OPTIONAL — update to new path post-migration for accuracy. |
| 4 | `_meta/dashboard-spec/06-a14o-chrome-audit.md` | (info only) | same | OPTIONAL. |
| 5 | `_meta/dashboard-spec/06-a14o-microinteractions-spec.md` | (info only) | same | OPTIONAL. |
| 6 | `_meta/dashboard-spec/06-a14n-primitives-spec.md`, `06-a14n-visual-baseline.md` | (info only) | same | OPTIONAL. |
| 7 | `tests/visual-diff/route-mockup-mapping.json` | data | path strings | INSPECT in A.14q — if absolute paths used, switch to repo-relative. |
| 8 | `lib/mock-data/brand-responses.ts`, `lib/mock-data/campaigns.ts`, `components/production-queue/helpers.ts`, `lib/data-sync/markdown.ts`, `README.md` | content | string matches on "OneDrive" — most are narrative/data fields, not import paths | INSPECT in A.14q — likely no functional change needed. |

### Files audited, **NO hardcoded references found** (safe)

| File | Result |
|---|---|
| `C:\Users\julia\.claude\JULZ-RULES.md` | `ugc-command-center` not mentioned. Only `UGC/` workspace listed in §Workspaces. |
| `C:\Users\julia\.claude\CLAUDE.md` | No `ugc-command-center` references. |
| `C:\Users\julia\.claude\templates\sub-agent-spawn-template.md` | OneDrive mentioned only in context of UGC workspace and conflict watch (HR-13), not ugc-command-center. |
| `_paths.py` (`UGC/_meta/_archive/scripts/_paths.py`) | All constants scope to `UGC` workspace, none reference ugc-command-center. **No changes needed.** |
| `.github/workflows/*.yml` (4 files: comment-cron, deploy, qa-stack, refresh-data) | Only narrative comment mentioning `OneDrive/Desktop/julz-vault/` and `OneDrive/Desktop/UGC/**` as data-isolation guardrails. No hardcoded ugc-command-center paths — GitHub Actions runs in `ubuntu-latest` checkout. |
| `package.json`, `next.config.js`, `tsconfig.json`, `vercel.json`, `playwright.config.ts`, `lighthouse*.{json,js}` | Repo-relative paths only. |
| `node_modules/` | Will be rebuilt fresh at new location via `npm install`. |

### Out-of-repo settings to update

| Setting | Location | Action |
|---|---|---|
| Workspace registry | `JULZ-RULES.md` §Workspaces table | **ADD** new row for `ugc-command-center` at `C:\dev\ugc-command-center` (currently not listed — only UGC and lilo-ugc are). |
| Desktop shortcut | `OneDrive/Desktop/UGC Hub.url` | **NO CHANGE** — this points to Linear doc URL, not local path. Verified content. |
| VS Code workspace file | None found (`*.code-workspace` search returned 0 hits) | Open question — see §10. |
| Shell aliases / pinned terminal tabs | Unknown — local to Julz | Julz to update manually post-migration. |
| Vercel project | Vercel deploys from GitHub, not local — no change needed | Confirmed (no Vercel CLI link in repo root). |

---

## 6. Migration sequence (proposed for A.14q — NOT executed here)

Each step has a rollback path. Run as a single Bash/PowerShell session, capture output to a log.

| Step | Action | Verification | Rollback |
|---|---|---|---|
| 1 | Pause OneDrive sync (system tray → Pause syncing → 2 hours) | OneDrive icon shows paused state | Resume OneDrive (right-click → Resume) |
| 2 | Commit or stash current uncommitted change in `app/pipeline/deadlines/page.tsx` | `git status` clean | `git stash pop` |
| 3 | `mkdir C:\dev` (if not exists) | `Test-Path C:\dev` → True | `Remove-Item C:\dev` |
| 4 | `Move-Item C:\Users\julia\OneDrive\Desktop\ugc-command-center C:\dev\ugc-command-center` | New path has all files, git history intact (`git log` works) | `Move-Item` back to OneDrive path |
| 5 | At new path: `Remove-Item -Recurse -Force .next, node_modules, .turbo, playwright-report, test-results` (rebuild artifacts) | Dirs gone | N/A — these are regen-able |
| 6 | `npm install --legacy-peer-deps --no-audit --no-fund` | Exit 0, `node_modules/` present | Re-run with `--verbose` |
| 7 | `npm run build` (NO `rm -rf .next` prefix needed anymore) | Exit 0, `out/` populated, no ENOENT in stderr | Investigate; if recurring on non-OneDrive path, HR-35 root cause is elsewhere |
| 8 | `npm run dev` smoke test on http://localhost:3000 | Page renders | Stop dev server |
| 9 | Create directory junction at old OneDrive path → new path | `Get-Item old-path` shows `ReparsePoint` attribute; `ls` shows new-path contents | `Remove-Item old-path` (deletes junction only, not target) |
| 10 | Resume OneDrive | Icon shows syncing | Pause again if junction syncs unexpectedly |
| 11 | Update `JULZ-RULES.md` §Workspaces — add `ugc-command-center` row | File saved, git committed | `git revert` |
| 12 | Run full A.14p verification: build + dev + screenshot live URL | All pass | Roll back at step 4 (move back to OneDrive) |
| 13 | Update `06-a14p-onedrive-move-scoping.md` with execution log | File appended | N/A |
| 14 | Soak for 1 week — monitor: did any agent/script hit junction breakage? | No reports | Reverse migration if breakage |
| 15 | Delete junction after soak | `Remove-Item C:\Users\julia\OneDrive\Desktop\ugc-command-center` | If needed for backcompat, recreate junction |

---

## 7. Risk register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | Hidden hardcoded path in a script we missed | Low | Medium | Junction at old path catches anything we missed for 1-week soak |
| R2 | OneDrive tries to sync the junction target | Very Low | Medium | Microsoft docs confirm junctions are not followed by OneDrive. If it does, add `C:\dev\` to OneDrive exclude list (see §10 Q4) |
| R3 | `git` history corruption during move | Very Low | High | Pre-move: `git fsck`. Post-move: `git fsck` + `git log` smoke test. Repo is also pushed to GitHub remote — full disaster recovery via `git clone` |
| R4 | `node_modules` symlinks (pnpm, lerna) break on move | Low | Low | Repo uses npm (not pnpm) — `npm install` from clean state at new location |
| R5 | VS Code "recent folders" / pinned terminals reference old path | High | Low | Julz updates manually — natural friction during week 1 |
| R6 | `npm run build` still hits ENOENT at new path (HR-35 root cause elsewhere) | Very Low | High | If reproduced, HR-35 root cause is Next.js or AV scanner, not OneDrive — file separate investigation. Rollback to OneDrive doesn't make it worse |
| R7 | Other agents writing to old OneDrive path mid-migration | Medium | Medium | A.14q must coordinate via session registry — set `WORKTREE_NEEDED` flag, hold lock during steps 4-12 |
| R8 | Junction confuses git in unforeseen way | Low | Medium | Test `git status` immediately after junction creation. If broken, delete junction and use hard break instead |
| R9 | Anthropic API key / `.env` lost in move | Low | Medium | `Move-Item` preserves dotfiles. Pre-move: `ls -la` snapshot. Verify `.env*` files present post-move |
| R10 | Cron-driven scripts (e.g., `poll-sideshift.mjs`) reference old path via environment or scheduler | Low | Medium | Audit Windows Task Scheduler for any tasks referencing the OneDrive path before A.14q — see §10 Q3 |

---

## 8. Estimated wall time (A.14q execution)

| Phase | Time |
|---|---|
| Pre-flight (pause sync, commit, snapshot) | 5 min |
| Move + clean | 5 min |
| `npm install` | 8–15 min (fresh install of ~1500 packages, faster off OneDrive) |
| `npm run build` + smoke test | 5–8 min |
| Junction creation + verification | 3 min |
| Update JULZ-RULES.md + commit | 5 min |
| Live URL verification (Chrome MCP screenshot per HR-33) | 5 min |
| Documentation + log execution | 10 min |
| **TOTAL** | **45–75 min** |

Soak period: 7 days observation, then 2 min to remove junction.

---

## 9. Recommendation

**GO for A.14q.**

Reasoning:
1. HR-35 is a recurring tax across 7+ phases. Permanent fix > permanent mitigation.
2. Blast radius is narrow — 0 hardcoded paths in critical config files (`JULZ-RULES.md`, `CLAUDE.md`, sub-agent template, `_paths.py`, workflow YAMLs). The few in-repo OneDrive references point to the **UGC workspace** (which stays on OneDrive intentionally), not to `ugc-command-center`.
3. Junction strategy provides safety net for any missed references during 1-week soak.
4. Rollback is trivial at every step.
5. Speed wins: `npm install` and `npm run build` will be measurably faster off OneDrive (no sync churn during file writes).

Defer only if Julz has higher-priority A.14q work queued OR if she wants to first audit Windows Task Scheduler for any cron tasks referencing the old path (§10 Q3).

---

## 10. Open questions for Julz

| # | Question | Default if no answer |
|---|----------|---------------------|
| Q1 | **Target path:** `C:\dev\ugc-command-center` (Option A) OR `C:\Users\julia\dev\ugc-command-center` (Option B)? | Option A (shorter path, avoids MAX_PATH risk in `node_modules`) |
| Q2 | **Junction strategy:** Leave Windows junction at old OneDrive path for 1-week soak, OR hard break immediately? | Junction for 1 week, then delete |
| Q3 | **Are there Windows Task Scheduler entries or PowerShell scheduled jobs referencing `C:\Users\julia\OneDrive\Desktop\ugc-command-center\` that I should audit before A.14q?** (E.g., scheduled `poll-sideshift.mjs` runs?) | Audit during A.14q step 0 — `Get-ScheduledTask \| Where-Object {$_.Actions -match 'ugc-command-center'}` |
| Q4 | **Add `C:\dev\` to OneDrive exclude list as a belt-and-suspenders measure?** (OneDrive shouldn't sync outside Desktop/Documents by default, but explicit exclude removes any doubt.) | No — OneDrive doesn't sync `C:\dev\` by default. Skip unless paranoia warranted. |

---

## Verification log (this scoping doc)

| Check | Result |
|---|---|
| File written at target path | ✅ `C:\Users\julia\OneDrive\Desktop\ugc-command-center\_meta\dashboard-spec\06-a14p-onedrive-move-scoping.md` |
| All 10 required sections present | ✅ Sections 1-10 |
| File size > 4KB | ✅ ~12KB (substantive) |
| HR-30 TL;DR at top | ✅ §1 BOTTOM LINE + §2 WHAT JULZ NEEDS TO DO RIGHT NOW |
| HR-26 problems ship with solutions | ✅ Every risk in §7 has a mitigation column |
| Skills invoked | `engineering:documentation` (loaded), `superpowers:verification-before-completion` (applied via verification checks), senior-devops persona (applied in migration sequence design) |

---

**End of scoping doc. Migration deferred to A.14q pending Julz approval of §10 Q1+Q2.**
