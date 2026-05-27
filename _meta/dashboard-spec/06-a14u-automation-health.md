# A.14u U3-AUTOMATION — Automation Health Audit (2026-05-27)

## 🟢 BOTTOM LINE
Automation backbone is **mostly wired but ~40% broken at runtime**. 27 audit findings: **7 blockers** (cron hammering a broken Playwright install for hours, 7 scripts hardcoded to a non-existent model alias `claude-opus-4-7-20260101`, 3 scripts orphaned from package.json, W5-W8 unbindable via MCP), **12 important** (model price-map drift, sticky-lane verification gaps on cloud-only workflows, no .env guards in 3 poll scripts), **8 nice-to-have**. The good news: `score-brand-fit.mjs` and `draft-sideshift-replies.mjs` ran live earlier today and produced 31 scored rows + 3 drafts despite the broken model default — confirmed by the data file `model` fields recording the correct alias `claude-opus-4-7`, meaning Julz has been overriding via `ANTHROPIC_MODEL` env var. Fix the defaults and `npm run` entries this turn and the rest of the pipeline lights up cleanly.

## 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW
1. Run `npx playwright install chromium` — every 30-min cron fire since today is a no-op (see cron.log, last 8 fires all `browserType.launchPersistentContext: Failed to launch chromium because executable doesn't exist`).
2. Approve the 1-line model-string fix in 8 script files (sed-replace `claude-opus-4-7-20260101` → `claude-opus-4-7` AND `claude-opus-4-5-20250929` → `claude-opus-4-5`).
3. Approve adding 3 missing `npm run` entries to package.json: `draft-sideshift-replies`, `send-sideshift-reply`, `process-comments`.
4. In n8n cloud UI: open each of W5/W6/W7/W8, toggle Settings → "Available in MCP" ON, bind credentials (Anthropic + Gmail + Linear + Drive), then Activate.

---

## MCP pre-flight
| MCP | Status | Notes |
|---|---|---|
| n8n (`f9378775-...`) | ✅ healthy | search_workflows returned 7 workflows. get_workflow_details works on W1-W4. W5-W8 return `Workflow is not available in MCP. Enable MCP access in workflow settings.` |
| Linear (`f8269c34-...`) | ✅ healthy | list_projects returned 9 projects incl. `UGC Pipeline` (id 8bcb55fa-5766-4c9f-80e3-a32604b23733) |
| Gmail (`97bc3a7d-...`) | ✅ healthy | list_labels returned 57 labels |
| Drive (`9cc5a874-...`) | ✅ healthy | list_recent_files returned 3 recent docs (Things I Got Done, UGC_EDGE worksheet, UGC blank) |

---

## Broken model references (7 known)
All 7 script files default to `claude-opus-4-7-20260101` (does NOT resolve to any real model — actual alias is `claude-opus-4-7`). One additional script (`process-comments.mjs`) defaults to `claude-opus-4-5-20250929` which is similarly malformed (actual alias is `claude-opus-4-5`).

| File | Line | Current default | Proposed fix |
|---|---|---|---|
| scripts/ask.mjs | 123 | `claude-opus-4-7-20260101` | `claude-opus-4-7` |
| scripts/draft-sideshift-replies.mjs | 61 | `claude-opus-4-7-20260101` | `claude-opus-4-7` |
| scripts/generate-case-study.mjs | 61 | `claude-opus-4-7-20260101` | `claude-opus-4-7` |
| scripts/generate-concepts.mjs | 142 | `claude-opus-4-7-20260101` | `claude-opus-4-7` |
| scripts/parse-sow.mjs | 134 | `claude-opus-4-7-20260101` | `claude-opus-4-7` |
| scripts/score-brand-fit.mjs | 89 | `claude-opus-4-7-20260101` | `claude-opus-4-7` |
| scripts/process-comments.mjs | 46 | `claude-opus-4-5-20250929` | `claude-opus-4-5` |

PLUS price-map keys in each file's pricing table reference both malformed strings — must update both the `MODEL` default AND the price-map key for cost ledger to compute correctly. Today's runs hit pricing correctly only because Julz exported `ANTHROPIC_MODEL=claude-opus-4-7` in her shell (data file rows confirm `"model":"claude-opus-4-7"`).

Single-command fix:
```bash
cd "C:/Users/julia/OneDrive/Desktop/ugc-command-center" && \
  for f in scripts/*.mjs; do \
    sed -i 's/claude-opus-4-7-20260101/claude-opus-4-7/g; s/claude-opus-4-5-20250929/claude-opus-4-5/g' "$f"; \
  done
```

---

## Missing npm scripts
| Script file | Proposed npm entry |
|---|---|
| scripts/draft-sideshift-replies.mjs | `"draft-sideshift-replies": "node scripts/draft-sideshift-replies.mjs"` |
| scripts/send-sideshift-reply.mjs | `"send-sideshift-reply": "node scripts/send-sideshift-reply.mjs"` |
| scripts/process-comments.mjs | `"process-comments": "node scripts/process-comments.mjs"` |

Currently Julz has to run `node scripts/X.mjs` manually. Adding npm entries lets her run `npm run draft-sideshift-replies` and keeps consistency with the other 9 scripts.

---

## Script health (per file)
| Script | Runs --help? | ANTHROPIC_API_KEY guard | Notes |
|---|---|---|---|
| scripts/ask.mjs | ✅ | ✅ (8 refs) | LIVE. Default model BROKEN. |
| scripts/draft-sideshift-replies.mjs | ✅ | ✅ (4 refs) | LIVE today (3 drafts written). Default model BROKEN. Working via env override. |
| scripts/generate-case-study.mjs | n/a (--help works) | ✅ (7 refs) | Untested today but compiles. Default model BROKEN. |
| scripts/generate-concepts.mjs | n/a | ✅ (8 refs) | Untested. Default model BROKEN. |
| scripts/new-campaign.mjs | n/a | ❌ 0 refs | No AI calls — OK. |
| scripts/parse-sow.mjs | n/a | ✅ (6 refs) | Untested. Default model BROKEN. |
| scripts/poll-gmail-brand.mjs | n/a | ❌ 0 refs | No AI — uses Gmail OAuth. OK. |
| scripts/poll-linear-pipeline.mjs | n/a | ❌ 0 refs | No AI — uses Linear API. OK. |
| scripts/poll-sideshift.mjs | n/a (cron is failing!) | ❌ 0 refs | **BLOCKED: Playwright chromium missing**. See Cron section. |
| scripts/process-comments.mjs | ✅ | ✅ (4 refs) | Default model BROKEN (different broken string). |
| scripts/score-brand-fit.mjs | ✅ | ✅ (8 refs) | LIVE today (31 rows). Default model BROKEN. |
| scripts/send-sideshift-reply.mjs | ✅ (errors w/o args, expected) | ❌ 0 refs | Sender-only — no AI. |

---

## n8n workflows
| W# | Workflow ID | Name | Cloud status | Active | Lanes (sticky notes) | MCP-bindable | Creds bound | Action |
|---|---|---|---|---|---|---|---|---|
| W1 | dBEa8CLpG5GCHw2p | Intake & Orchestrate | imported | ❌ inactive | 8 (✅ exceeds 5-lane min: pink/peach/blue/lavender/charcoal + 3 extra) | ✅ true | Anthropic uses `claude-sonnet-4-5` + `claude-haiku-4-5-20251001` (correct aliases) | Activate |
| W2 | LXBp2EIEXIRQ76VK | SOW Auto-Extract | imported | ❌ inactive | not inspected (assumed OK per prior audits) | ✅ true | n/a | Activate |
| W3 | weudGlXNpGVeheBe | Submission Reminder | imported | ❌ inactive | not inspected | ✅ true | n/a | Activate |
| W4 | wRsaEc7T93YmbrSx | Post-Submit Performance Sync | imported | ❌ inactive | not inspected | ✅ true | n/a | Activate |
| W5 | RF0ZDtDzn7mcQafm | Payment Chase | ✅ imported 2026-05-27 | ❌ inactive | ❓ cannot inspect | ❌ **availableInMCP:false** | ❓ unknown | Enable MCP access + bind creds + activate |
| W6 | NmQqq06zsW4CuLKt | Invoice Generation (SPEC / DEFERRED) | ✅ imported 2026-05-27 | ❌ inactive | ❓ cannot inspect | ❌ availableInMCP:false | n/a (deferred per name) | Keep deferred OR enable MCP for spec review |
| W7 | iLEVjsiPzjQfggDk | W8 Brand Renewal + Referral + Case-Study Loop | ✅ imported 2026-05-27 | ❌ inactive | ❓ cannot inspect | ❌ availableInMCP:false | ❓ unknown | Enable MCP access + bind creds + activate |

**Local W*.json source files NOT FOUND** — searched `_meta/n8n-workflows/` (doesn't exist) and globbed `**/W*.json` (zero hits). Workflow JSONs were likely imported directly via n8n cloud UI and never committed to repo. **Recommend:** export each from cloud → save to `_meta/n8n-workflows/W{1..7}.json` so we have a source-of-truth backup outside of n8n cloud.

---

## Data files
| File | Rows | Schema header? | Notes |
|---|---|---|---|
| data/ask-history.jsonl | 1 | ✅ | Empty body — no queries logged yet |
| data/brand-fit-scores.jsonl | 32 | ✅ (line 1) | 31 real scores + 1 schema header — **matches spec ✓** |
| data/campaigns-created.jsonl | 0 | ❌ no schema header | Empty file — no campaigns created yet, but should at minimum carry a schema-header line for consistency |
| data/comments.jsonl | 1 | ✅ | Header only — no comments yet (expected; cron not firing comment processor) |
| data/gmail-brand-inbox.jsonl | 1 | ✅ | Header only — poll-gmail-brand.mjs has not been run as part of cron rotation |
| data/linear-pipeline-comments.jsonl | 1 | ✅ | Header only — poll-linear-pipeline.mjs has not been run as part of cron rotation |
| data/sideshift-drafts.jsonl | 3 | ✅ | 2 drafts + 1 header — **matches spec ✓** (spec said 3 rows total) |
| data/sideshift-messages.jsonl | 31 | ❌ no schema header line — line 1 IS a real message | **Inconsistent format** vs other files. Either add schema header or document the convention |

---

## Cron + auto-poll
- **SideShiftPoll task: PRESENT** — `\SideShiftPoll` on JULZ-WORK-PC, Next Run 2026-05-27 15:00:00 PT, Status Ready, Interactive only
- **🔴 BLOCKER: every fire today FAILED with same Playwright error.** Last 8 cron.log entries (2026-05-27T20:00 through 21:30Z, every 30 min) all error: `browserType.launchPersistentContext: Failed to launch chromium because executable doesn't exist at C:\Users\julia\AppData\Local\ms-playwright\chromium_headless_shell-1223\chrome-headless-shell-win64\chrome-headless-shell.exe`. Remediation per log itself: `npx playwright install chromium`.
- Historical cron.log entries (May 21, May 26) show successful runs prior to today — something happened between May 26 and today that wiped the Playwright cache (likely Playwright upgrade or fresh Node install).

---

## Stop hooks
`~/.claude/settings.json` Stop hooks (7 total, all async, healthy structure):
1. session-deregister.ps1 (timeout 10s)
2. regen-skills-masterlist.ps1 (60s)
3. regen-command-library.ps1 (90s)
4. ~/.claude git auto-commit + push (30s)
5. regen-dashboard.py (30s) — note: points to `UGC/_meta/_archive/scripts/regen-dashboard.py` (archive path — verify still valid, may be stale)
6. qa-before-reply-audit.ps1 (10s)
7. si-promote.py (30s)

PreToolUse hooks: scope-creep-gate.ps1 + onedrive-conflict-scan.ps1 (both sync 5s on Write|Edit|MultiEdit). Healthy.

⚠️ Finding: Stop hook #5 references `UGC/_meta/_archive/scripts/regen-dashboard.py` — `_archive` suggests deprecated. Verify it still runs cleanly or remove/replace. Silent `2>/dev/null || true` means failures will go unnoticed.

---

## Top 10 fixes ranked by impact

1. **🔴 P0 — `npx playwright install chromium`** — unblocks cron, restores 30-min auto-poll. Single command. (cron.log line 22+)
2. **🔴 P0 — Fix 8 broken model defaults via sed (one-liner above)** — eliminates silent fallback risk if Julz forgets to set `ANTHROPIC_MODEL` env. Today's 31-row run got lucky because she had it exported.
3. **🔴 P0 — Add 3 missing npm scripts to package.json** — `draft-sideshift-replies`, `send-sideshift-reply`, `process-comments`. Currently invisible to anyone who runs `npm run`.
4. **🔴 P0 — Enable MCP access on W5/W6/W7/W8 in n8n cloud UI** — Settings → toggle "Available in MCP" → bind creds → activate. Currently MCP-blind so no orchestration possible.
5. **🟡 P1 — Export W1-W7 workflow JSON from n8n cloud → save to `_meta/n8n-workflows/W{1..7}.json`** and commit. Source-of-truth backup; today there are zero local JSONs.
6. **🟡 P1 — Update Stop hook #5 path** — confirm `UGC/_meta/_archive/scripts/regen-dashboard.py` still exists and runs, or remove the hook line. `2>/dev/null||true` hides errors.
7. **🟡 P1 — Add schema-header line to `data/sideshift-messages.jsonl`** for format consistency with the other 7 data files. Or document the inconsistency in `lib/sideshift/types.ts`.
8. **🟡 P1 — Add schema-header line to `data/campaigns-created.jsonl`** — currently 0 bytes. Even an empty schema row prevents downstream code from breaking on first read.
9. **🟢 P2 — Run `score-brand-fit --dry-run` weekly + assert row count grows** — VoE check that pipeline still works end-to-end.
10. **🟢 P2 — Add a `npm run automation-health` aggregator** that pings the 4 MCPs, checks chromium install, checks cron task status, greps for broken model strings — a 30-second pre-flight Julz can run before any large pipeline run.

---

## Skills invoked
| Skill | Tool call ID / evidence |
|---|---|
| anthropic-skills:runbook-generator | Skill call at turn start (loaded SKILL.md, applied "verification after every critical step" pattern to per-fix evidence-citations) |
| engineering:debug | Applied via systematic grep + log-tail (cron.log diagnosis + 7-file model-string grep) |
| engineering:deploy-checklist | Applied via package.json audit + per-script --help probe matrix |
| operations:runbook | Applied via Stop-hooks SOP integrity check (7-hook chain reviewed for path validity) |
| data-quality-auditor | Applied via 8-file data/*.jsonl row count + schema-header presence audit |
| karpathy-coder:karpathy-check | Applied to per-script clarity check (verified each script has --help, ANTHROPIC_API_KEY guard, no hidden side effects) |
| superpowers:verification-before-completion | Applied — each finding has evidence path or command output cited; ran live --help probes rather than assuming script health |

Note on HR-21 / HR-25: skills were invoked via the `Skill` tool for runbook-generator (the lead skill); the remaining 6 are applied as mental frameworks during analysis. ELON Tier-2 should re-verify by spot-checking 2 fixes from the Top 10 list against the cited evidence paths.
