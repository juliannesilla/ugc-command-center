# Dashboard — ALL 35 Julz asks reconciled + finish the misses (HR-46/54 full config)

`Plan mode: ACTIVE · Writeable: this plan file only`
ELON-orchestrated · Team Lead **STEVE** (Build) · QA **ELON-T2** (independent, CAPA-007) · grounded vs. live site + 35-ask thread comb.

## 🔗 QUICK LINKS
- **🌐 LIVE dashboard:** https://juliannesilla.github.io/ugc-command-center/ (7 waves live, `main` @ `d8696be`)
- **Repo:** `C:\Users\julia\OneDrive\Desktop\ugc-command-center` · **GitHub:** `juliannesilla/ugc-command-center` · **PR #1:** merged-equivalent (pushed to main)
- **This plan:** `…/plans/continue-please-in-full-tranquil-canyon.md` · **Vercel doc:** `_meta/VERCEL-SETUP.md`
- **Ledgers:** `~/.claude/sessions/{initiatives,agent-governance,action-items,capa-registry}.jsonl`

## 🟢 BOTTOM LINE
- **35 dashboard asks recovered** from the full thread (you were right — I'd missed many). **~18 done, ~17 open/partial.**
- **Biggest miss = your "NO MOCK ANYTHING" rule (HR-49):** `lib/mock-data` still imported **63× / 31 routes**. That's Wave B1, the headline.
- **Other misses:** 5 "Coming soon" pages · true mobile depth (bottom-tab + 390px tables) · single-viewport overview (your call) · a batch of per-route data/layout fixes.
- **Now built with the full HR-46 stack per wave** (agents · skills · MCP · plugins · tools · HRs · prereq · output · verify · rollback · cost) + the HR-54 contract.
- **I-5/I-6/I-7 = APPROVED** (acting on them; no more re-asking). **API key set** (won't re-ask).

## 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW
### **1. Approve this plan → I run Waves B1-B5**
**Outcome:** every dashboard surface goes real-data + the remaining misses close, pushed to `main` in batches with live screenshots.
- Approve (ExitPlanMode). You authorized "allow all" + the main push, so I execute batch-by-batch.

### **2. One decision inside the plan (Wave B5)**
**Outcome:** locks the overview shape.
- Keep the current **hybrid** overview, or trim `/` to **single-viewport** (mockup #05) with detail behind `/overview/full`? (I'll ask via the question tool.)

### **3. (Optional / your hands, not blocking)**
- **Vercel login** → makes Ask ELON actually answer (`_meta/VERCEL-SETUP.md`). **GitHub secrets** → flips I-6 auto-update on.

## 📋 TEAM INITIATIVE / APPROVAL TABLE (HR-55)
| # | Agent | Recommendation | Status |
|---|-------|----------------|--------|
| I-5 | EMILY | Auto-draft SideShift replies, hold for 1-tap send | ✅ **APPROVED** → wiring |
| I-6 | TIM | Re-enable 15-min auto-update | ✅ **APPROVED** → needs your GitHub secrets to flip on |
| I-7 | LINUS | Finish live agent on Vercel | ✅ **APPROVED** → needs your Vercel login |
| I-8 | NORMA | Wave B1 mock-data purge → canonical/honest-empty | 🟡 proposed (this plan) |

## 🔁 FEEDBACK LOG (this turn)
- **Banked: I missed asks by working from memory, not the thread.** Fix → combed transcript + master plan + spec docs (35 asks) before planning. Going forward: reconcile the full ask-list before any "done" claim.
- **Banked: plans must carry the HR-46 stack + HR-54 contract** — this plan now does; prior drafts didn't (your catch).
- **I-5/6/7 approvals were re-surfaced as "pending" after you approved** — fixed (marked approved, acting).

## 🔬 QA CHECKLIST (this plan)
| # | Check | Status |
|---|-------|--------|
| 1 | Source cited — 35 asks traced to thread/docs w/ citations | ✅ |
| 2 | Artifact-not-proxy — live screenshot already taken; per-wave HR-33 | ✅/🔵 |
| 3 | Independent re-run — ELON-T2 gate per wave | 🔵 |
| 4 | Banked lesson same-turn | ✅ (above) |
| 5 | Tool pre-flight — Chrome MCP + grep verified | ✅ |
| 6 | Skill invocations — ≥6 per wave listed below (HR-25/46) | ✅ planned |
| 7 | Tone / voice | ✅ |
| 8 | Hard rules — HR-46 config + HR-54 contract present | ✅ |
| 9 | Smallest interpretation — fix the asks, no inferred scope | ✅ |
| 10 | qa-log before reply | 🔴 owed at first execution action |

## 🧾 THE 35 ASKS — status (evidence-backed)
**✅ DONE (18):** #2 de-cramp(`5707f2e`) · #3 recolor(Waves 2/2.1+live) · #7 live(`d8696be`) · #8 MWM/Phobaxx scripts · #10 hero font · #11 KPI row · #17 dense board · #22/33 Fit col · #24 date-anchor · #28 bold titles · mobile-nav drawer · AA readability · live-agent UI · Accounts · Approvals · skip-link · horizontal-scroll · video=ProductionQueue.
**🔴/🟡 OPEN (17):** #27/25/26 **mock data (63×/31 routes)** · #35 5 coming-soon pages · #4/20 mobile depth + bottom-tab · #34 single-viewport (decision) · #1 auto-update(secrets) · #5 agent-answers(Vercel) · #9 capability doc(verify) · #12 right-rail · #13 SOW layout · #14 script lane · #16 sideshift-growth · #18 [id] 404s · #19 header chrome · #29 card noise · #30 empty viz · #31 truncated $ · #15 mobile-compact(deferred).

## CONTEXT — why
You said "you missed A LOT… read full thread." I did; the 35-ask list is the complete set. ~18 are done; this plan finishes the rest with the full per-wave execution stack your rules require (HR-46) and your output contract (HR-54), led by the no-mock-data rule.

---

## 🛠️ EXECUTION — Waves B1-B5 (each with full HR-46 stack)

### **Wave B0 — SOURCE ALL REAL DATA (your choice: source-first)** 🔴 step 1
**Outcome:** every real source you have is gathered into the dashboard's `data/` as real JSONL — verified on disk.
- **Real sources FOUND (inventory, on disk now):**
  - **TikTok @geezjulz — 42 REAL posts:** `julz-vault\01-WORK-CURRENT\social-media\tiktok_data_enhanced.csv` (pillar · likes/comments/shares · hashtags · dates · captions · post IDs · video files) → ETL → `data/tiktok-posts.jsonl`.
  - **Asset library — 15,383 REAL files:** `C:\Users\julia\OneDrive\Desktop\ASSET-LIBRARY\MANIFEST.jsonl` (path · type · duration · transcript) → `data/assets-manifest.jsonl`.
  - **46 REAL brands:** `data/brands-canonical.jsonl` (merged SideShift+Gmail+Linear) — already in repo ✅.
  - **SideShift/Gmail/Linear/brand-fit:** real JSONL already in `data/` (refresh via `poll-*.mjs` + `merge-canonical.mjs` where creds exist; honest-skip otherwise).
- **MISSING (needs your login/export):** Instagram + YouTube analytics → honest-empty + flagged (I won't fake them).
- **Council:** NORMA (ETL) · ADA (schema) → TIM. **Skills:** `data-quality-auditor` · `data:build-dashboard` · `data:write-query` · `engineering:debug` · `karpathy-coder:karpathy-check` · `superpowers:verification-before-completion`. **Tools:** new `scripts/import-tiktok.mjs` + Read/Write/Bash. **HRs:** HR-10 · HR-49. **Verify:** `data/tiktok-posts.jsonl` = 42 rows, `assets-manifest.jsonl` = 15,383 rows. **Rollback:** delete generated JSONL. **Cost:** ~$0.5 · ~1 hr.

### **Wave B1 — WIRE every route to the real data (replace ALL mock)** 🔴 step 2, headline
**Outcome:** all 31 mock-importing routes render REAL data or an honest empty state; zero fixtures. Live site shows YOUR brands (ParakeetAI/MWM/Phobaxx/Bolt/Megprime), never fake (Rare Beauty/Ouai/vilo).
- **Campaigns (17 routes on `MOCK_CAMPAIGNS`)** → switch to `lib/mock-data/campaigns/from-canonical.ts` (real 46 brands); retire `board-extra-campaigns.ts` + `database-rows.ts` fakes.
- **analytics.ts + pillars.ts** → new `from-tiktok` adapter over `data/tiktok-posts.jsonl`.
- **assets.ts** → read `data/assets-manifest.jsonl`. **accounts.ts** → derive @geezjulz figures from tiktok posts.
- **brand-responses.ts** → from `sideshift-messages.jsonl` + canonical. **payments.ts** → canonical payment fields (honest-empty where null).
- **deadlines/calendar/sideshift-growth/brain-dump/content-hub** → canonical or honest-empty.
- **Council:** NORMA · LINUS · GRACE → STEVE. **Skills (≥6):** `data:build-dashboard` · `vercel:nextjs` · `refactoring-ui` · `engineering:debug` · `karpathy-coder:karpathy-check` · `data-quality-auditor` · `superpowers:verification-before-completion`. **MCP/plugins:** Chrome DevTools · vercel · chrome-devtools-mcp. **Native:** Grep (`from '@/lib/mock-data'`) · Read/Edit (31 routes) · Bash.
- **HRs:** HR-49 (no mock) · HR-10 (honest empty) · HR-50 (full) · HR-15/33 (verify) · HR-36 (commit-immediately). **Prereq:** B0 done. **Output:** 31 routes real; `mock-data-debt.jsonl` → 0. **Verify:** path-scoped grep 0 fake-fixture imports outside `_fixtures/` + gh-pages green + live screenshots show real brands only. **Rollback:** per-route git revert. **Cost:** ~$3-5 · ~4-6 hrs (batched).

### **Wave B2 — "Coming soon" → real or honest** 🔴
**Outcome:** no dead placeholder pages (payments/documents/templates/settings/content-hub).
- **Council:** JOAN (copy) · WALT (visual) → STEVE
- **Skills (≥6):** `anthropic-skills:copywriting` · `anthropic-skills:copy-editing` · `brand-voice:enforce-voice` · `design:ux-copy` · `frontend-design` · `refactoring-ui`
- **MCP/tools:** Read/Edit · Chrome DevTools · git. **Plugins:** brand-voice · frontend-design.
- **HRs:** HR-10 (honest) · Tier-1 voice (no "Coming soon") · HR-50.
- **Prereq:** B1 data wiring (so real content exists). **Output:** 5 pages real or honest bestie-voice states. **Verify:** live screenshot each. **Rollback:** git revert. **Cost:** ~$0.5 · ~1 hr.

### **Wave B3 — Mobile depth (bottom-tab + 390px)** 🟡
**Outcome:** genuinely usable phone/iPad, not just scrollable.
- **Council:** GRACE · JONY → STEVE
- **Skills (≥6):** `anthropic-skills:mobile-responsiveness` · `ios-hig-design` · `apple-hig-expert` · `refactoring-ui` · `ux-heuristics` · `web-accessibility`
- **MCP/tools:** Chrome DevTools (emulate 390/768/1024) · Read/Edit · git. **Plugins:** chrome-devtools-mcp.
- **HRs:** HR-50 · HR-33 (live verify each breakpoint).
- **Prereq:** none. **Output:** bottom-tab nav component + mounted in layout (md:hidden) + boards/tables usable @390px. **Verify:** Chrome emulate 390/768/1024 — no overflow, tap targets ≥44px. **Rollback:** git revert. **Cost:** ~$1 · ~1.5 hrs.

### **Wave B4 — Per-route audit + fix** 🟡
**Outcome:** verify-items resolved (#13/14/16/18/19/29/30/31).
- **Council:** HOLMES (QA) · DIJKSTRA (code health) → STEVE
- **Skills (≥6):** `a11y-audit` · `chrome-devtools-mcp:chrome-devtools` · `design:design-critique` · `refactoring-ui` · `engineering:debug` · `superpowers:verification-before-completion`
- **MCP/tools:** Chrome DevTools (per-route screenshot+console) · Read/Edit · git. **Plugins:** chrome-devtools-mcp · a11y-audit.
- **HRs:** HR-15/33 · HR-26 (problems ship with fixes) · HR-50.
- **Prereq:** live site (✅). **Output:** each route's gap fixed (empty viz, truncated $, 404s, header chrome, layout drift) with before/after shots. **Verify:** live screenshots. **Rollback:** git revert. **Cost:** ~$1 · ~1.5 hrs.

### **Wave B5 — Overview shape (DECISION)** 🟡
**Outcome:** lock `/` as hybrid or single-viewport (#34).
- **Council:** JONY → STEVE → **Julz decision**
- **Skills (≥6):** `top-design` · `refactoring-ui` · `apple-hig-expert` · `emil-design-eng` · `ux-heuristics` · `frontend-design`
- **HRs:** HR-27 (lock before build) · HR-4 (smallest). **Output:** confirmed shape, built if changed. **Cost:** ~$0.3 + your call.

### Carry-over (your hands): **I-6** auto-update (GitHub secrets) · **I-7/#5** agent (Vercel login). API key already set.

## 🧹 HR-29 PRIOR ACTION-ITEM REGISTRY (still-open, cross-plan)
| ID | Action | Owner | Status |
|----|--------|-------|--------|
| B1-B5 | This plan's waves | Claude | 🟡 pending approval |
| I-6 | refresh-data.yml secrets | Julz | 🔴 |
| I-7 | Vercel login | Julz | 🔴 |
| J-4 / J-5 | PayPal email · job apps | Julz | 🔴 (other projects) |
| B-16..B-21 | brand sample sends | Julz | 🔴 (JOAN drafts ready) |
| CAPA-011..016 | brand-sign + gated-portal blockers | WHITNEY/WATSON | 🟡 |

## EXECUTION MODEL (HR-31/47)
ELON-orchestrated; per wave: sub-agents (worktree where scopes overlap, commit-immediately HR-36) → build green → push `main` (you authorized) → ELON-T2 independent gate same-turn → HR-33 live screenshot → qa-log appended. Batched delivery with a live screenshot per batch. No partial (HR-50): a wave splits before shipping if too big.

## VERIFICATION (end-to-end)
1. **B1:** path-scoped grep shows 0 `lib/mock-data` imports outside `_fixtures/` on touched routes; live screenshots show real data / honest empty states.
2. **B2-B4:** live Chrome screenshots per route; Lighthouse a11y AA; no console errors.
3. **B3:** emulate 390/768/1024/1440 — zero overflow, tap targets OK.
4. **All:** `npm run build:gh-pages-local` green before each push; ELON-T2 verdict logged to `qa-log.jsonl`.
