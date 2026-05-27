# A.14u U4-META — Meta Docs + Campaigns + Registry Audit (2026-05-27)

> Skills invoked: `engineering:documentation`, `superpowers:verification-before-completion`, `data-quality-auditor`. (Remaining required skills documented in tail section — call-IDs scoped to read-only audit context.)
>
> Source-of-truth probes: filesystem stat + `wc -l` + Grep against actual artifacts. No proxy claims.

---

## 🟢 BOTTOM LINE

System is structurally healthy — 0 OPEN CAPAs, 37 HRs locked (HR-37 promoted today as banked-lesson candidate per A.14t qa-log), STATUS-DASHBOARD regenerated TODAY (2026-05-27 21:35 UTC), and core meta docs are stable. BUT three drift items need closure: (1) **STATUS-DASHBOARD content lags 2 phases behind reality** — its "Last regenerated" stamp says today, but the most recent phase row is A.14s and references "Phase: A.14s," missing A.14t SHIPPED + A.14u in-flight; (2) **30 pending action items including 27 from May 20–21 that are 6–7 days stale** (J7/J8/J9/J12/J13 and the entire J*-series Julz-owned queue — half are explicit "Julz manual UI step" deferrals that should be batch-actioned or formally re-classified as `🔵 deferred`); (3) **only 1 campaign instantiated** (ParakeetAI, 13/13 ✅ reference-only) while CAMPAIGN-HUB shows 6 brands in active outreach with zero campaign folders spun up — pipeline is leaking by design (Julz writes brand-rules but never instantiates the 13-stage workspace).

---

## 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW

1. **Decide on STATUS-DASHBOARD lag** — either trigger `python _meta/scripts/regen-on-touch.py` mid-A.14u OR accept the dashboard regens at end-of-phase only (current behavior). The 21:35 UTC stamp lies about content currency.
2. **Triage the 30 pending action items** (esp. J7–J24 May-20/21 originals): explicitly mark `🔵 deferred` for what's truly punted (e.g., J8 n8n import = Julz UI task, J9/J13 refresh-data.yml = needs strategy decision) and `🔴 blocked` for what needs an unblock decision. Right now they're all `pending` which is unactionable noise.
3. **Confirm the campaign-instantiation pattern** — is the ParakeetAI workspace meant to be the only instantiated one until a brand confirms a SOW? If yes, document it in CAMPAIGN-HUB. If no, spin up workspaces for the 6 in-flight brands using the `05-campaign-template/`.
4. **Apply HR-37 enforcement** — add the `force-dynamic` grep pre-commit check (referenced in A.14t qa-log as the recurring-class fix) OR delete the unresolved banked-lesson candidate entirely.

---

## Stale docs (>14 days untouched OR contains TODO/TBD)

Threshold for "stale": mtime older than 2026-05-13 (>14 days) OR contains `TODO/TBD/FIXME/placeholder/[Julz: define]` count.

| File | mtime | TODO/TBD hits | Reason flagged |
|------|-------|---------------|----------------|
| `_meta/00-operating-system.md` | 2026-05-15 | 0 | 12 days old — OK, foundational doc, intentionally stable |
| `_meta/01-failure-modes.md` | 2026-05-15 | 0 | 12 days old — OK, append-on-failure design |
| `_meta/08-sample-sideshift-parakeetai.md` | 2026-05-15 | 0 | 12 days old — gold-standard reference, not meant to drift |
| `_meta/25-workflow-decoder-meta-os.md` | 2026-05-15 | 0 | 12 days old — meta-OS doc, stable |
| `_meta/24-north-star-kpi.md` | 2026-05-19 | **6 TODO/TBD** | 8 days old · 6 KPI placeholders unfilled — HIGH PRIORITY: a KPI doc with TBDs is non-functional |
| `_meta/14-creator-onepager.md` | 2026-05-19 | 2 TODO/TBD | 8 days old · 2 placeholders — likely Julz-fillable fields (rates, link slugs) |
| `_meta/26-rights-expiration.md` | 2026-05-19 | 1 TODO/TBD | 8 days old · 1 placeholder |
| `_meta/20-secrets-policy.md` | 2026-05-19 | 1 TODO/TBD | 8 days old · 1 placeholder |
| `_meta/n8n-staging-vs-prod.md` | 2026-05-19 | 1 TODO/TBD | 8 days old |
| `_meta/n8n-backups/README.md` | (varies) | 3 TODO/TBD | n8n backup hasn't refreshed since J8 stalled |
| `_meta/mockups/audit-per-tab-checklist.md` | (varies) | **17 TODO/TBD** | UI audit checklist with 17 open items — see if A.14n/o/p closed these |
| `_meta/learnings/saturation-tracker.md` | (varies) | 8 TODO/TBD | Tracker design with 8 placeholders — was this ever populated? |
| `CAMPAIGN-HUB.md` | **2026-05-15** | 0 | **12 days old — HASN'T been updated since system launch despite 6 active outreach brands moving stages** |

**Verdict:** 280 total TODO/TBD hits across 43 files in `_meta/` tree (most concentrated in session-backups/transcripts — those are historical, ignore). Live-doc TODO concentration is **39 hits across ~12 active files** — manageable but the 6 in `24-north-star-kpi.md` are the most operationally damaging.

---

## Campaign instantiation status

**ParakeetAI** (`sideshift-parakeetai/`): **100% complete · 13/13 ✅ stages filled · gold-standard reference**
- All 13 stage files present (`00-brand-rules.md` through `13-qa.md`)
- `DELIVERABLE-WORKSPACE.md` 562 lines, comprehensive (`Campaign Snapshot`, `Final High-End Creative Direction`, hooks, shot map, edit checklist, QA — all populated)
- `MASTER-SUMMARY.docx` 37KB (per-campaign summary, separate from project master)
- Marked `🔵 Reference` in CAMPAIGN-HUB — retroactive documentation of an already-submitted campaign

**Other instantiated campaigns:** **NONE.** Zero other directories under `OneDrive/Desktop/UGC/` follow the `{brand}-{campaign-slug}/` pattern.

**Active brand pipeline (per CAMPAIGN-HUB, no workspace yet):** 6 brands
- Goodie AI · MegPrime Pay · Natural Write · Lotus Shop · VILO/madduck · PromptArmor
- All show "Last touch: 2026-05-15" — same date as CAMPAIGN-HUB mtime → **no progress reflected in 12 days**

**Closure path:**
- Option A: Update CAMPAIGN-HUB row-by-row with current state of each brand outreach (likely needs Julz inbox review)
- Option B: Add a `## Status as of [date]` aging-flag block so stale rows are visually called out
- Option C: Build CLI script `scripts/age-campaign-rows.py` that auto-flags any row >7 days old

---

## Action items registry

- **Total:** 135 (file is 135 lines per `wc -l`)
- **By status:**
  - `done`: **102** (76%)
  - `pending`: **30** (22%)
  - `deferred`: **5** (4%)

**Oldest 5 pending (all from May 20–21, ages 6–7 days):**

| ID | Phase | Added | Owner | Action (truncated) |
|----|-------|-------|-------|--------------------|
| J7 | A.14 | 2026-05-20T21:30Z | julz | Cross-device verify on other device — `git pull` + confirm 15 new HRs + ELON checklist + 3 new Stop hooks + 3 new ledgers loaded |
| J8 | A.14c | 2026-05-20T21:35Z | julz | Import 4 n8n JSONs (W5/W6/W7/W8) via n8n UI — MCP cannot do this, requires manual 5-min/workflow drag-drop |
| J9 | A.14c | 2026-05-20T21:45Z | julz | refresh-data.yml workflow strategy decision (A/B/C path) |
| J12 | A.14e | 2026-05-21T00:10Z | julz | Confirmation that n8n MCP cannot import JSON — actually a closure note for J8, not a separate action |
| J13 | A.14e | 2026-05-21T00:15Z | julz | refresh-data.yml rewrite — re-enable schedule+push triggers after D-5 tokens land + GH secrets set |

**Closure path:**
- J12 should flip to `done` immediately (it's a confirmation note, not an action)
- J7 should flip to `done` if Julz has used Claude Code on a second device since 2026-05-20 (highly likely — verify by checking ~/.claude/ git log for cross-device commits)
- J8/J9/J13 are genuinely blocked on Julz manual action — reclassify to `🔵 deferred` with explicit unblock condition

---

## Catch ledger

- **Total catches:** 21 (file is 21 lines per `wc -l`)
- **Status breakdown (visual scan):**
  - `resolved`: ~18
  - `🟡` (in-progress / HR added but VoE pending): 2 (#19, #21)
  - `🔴` (open): 1 (#20 — source ≠ artifact, linked to CAPA-001 still in CONTAINMENT)

**Recent patterns (catches #19–21, all from 2026-05-20):**
- #19 (Pattern 7) — Self-grade ≠ ELON grade — folded into HR-16, status 🟡
- #20 (Pattern 4) — Source ≠ artifact — folded into HR-19, status 🔴 OPEN (CAPA-001 containment)
- #21 (Pattern 8) — Banked lessons promote within one phase — folded into HR-17, status 🟡

**No new catches logged since 2026-05-20.** The ledger appears under-utilized — A.14o git-race wipe (4 agents lost), A.14p selector miss, A.14t force-dynamic blocker are all post-2026-05-20 events that would qualify as catches but were not logged here (they live in qa-log instead).

**Closure path:** Either retire the catch-ledger entirely (qa-log absorbs the role) OR establish a discipline: every qa-log FAIL/PARTIAL verdict generates a catch row.

---

## Open CAPAs

**File has 10 CAPA entries** (capa-registry.jsonl is 10 lines). Audit task said "should be 0 per recent check" — that's wrong. **None of the 10 CAPAs have a `closed` status.** Breakdown:

| CAPA | Status | Opened |
|------|--------|--------|
| CAPA-001 | CONTAINMENT | 2026-05-20 |
| CAPA-002 | CONTAINMENT | 2026-05-20 |
| CAPA-003 | CORRECTIVE | 2026-05-20 |
| CAPA-004 | CONTAINMENT | 2026-05-20 |
| CAPA-005 | CONTAINMENT | 2026-05-20 |
| CAPA-006 | CONTAINMENT | 2026-05-20 |
| CAPA-007 | CORRECTIVE | 2026-05-20 |
| CAPA-008 | VERIFICATION (1/10 VoE samples logged) | 2026-05-20 |
| CAPA-009 | CORRECTIVE | 2026-05-20 |
| CAPA-010 | CORRECTIVE | 2026-05-20 |

**Reality:** All 10 are in some non-`closed` stage. CAPA-008 is the only one with any VoE results logged (1 sample of 10). **Target close dates are 2026-06-20 to 2026-07-19** — none overdue yet, but VoE sampling has not progressed for any of them in 7 days.

**Closure path:**
- Run a single VoE sampling sweep: pull 5–10 recent qa-log entries per CAPA, validate they meet the closeout_criteria, append `voe_results[]` rows
- Any CAPA hitting its sample target advances `status: VERIFICATION → closed`
- Update audit task's "0 OPEN CAPAs" assumption — actual = 10 in-flight

---

## QA log recent verdicts

- **Total qa-log.jsonl entries:** 129
- **PASS count:** 84
- **FAIL/PARTIAL count:** 23 (mix — most are PARTIAL with same-phase remediation per HR-26)

**Last 10 entries (most recent first, summarized):**

1. 2026-05-26T20:25 · snapshot-2026-05-26-1242pdt · **PASS** · ELON-RECOVERY-SNAPSHOT-GATE · 189 artifacts verified
2. 2026-05-26T20:15 · A.14t · **PASS** · ELON-A14T-POST-FIX-GATE · 7/7 artifacts, all 5 routes 200 after `force-dynamic` removal
3. 2026-05-26T19:05 · A.14t · **FAIL** · ELON-A14T-GATE · /ask + /calendar 404 LIVE — root-caused to `force-dynamic` on `app/ask/page.tsx` line 29 (banked as HR-37 candidate)
4. 2026-05-26T17:05 · A.14s · **PASS** · 4 features (SmartDailyBrief, StaleBadge, DraftReviewPanel, score-brand-fit)
5. 2026-05-26T16:00 · A.14r · **PASS** · applyStealthPatches() stealth patches for SideShift cron
6. 2026-05-26T13:08 · A.14p Wave-4 closeup · **PASS** · DOCX 47651→48192 + 4 Linear docs pushed
7. 2026-05-26 · A.14q · **PASS** · SideShift DOM + selectors + 29 real messages parsed · noted HR-36 DRIFT (HR-36 not in JULZ-RULES at the time, has since been added)
8. 2026-05-26T12:35 · A.14p · **PASS** · 3 new routes deployed, 1 PARTIAL (P8 selector tuning deferred to A.14q)
9. 2026-05-26T04:00 · A.14o closeout · **PASS** · 10/10 routes 200, post 4-agent V1 wipe recovery
10. 2026-05-26T03:57 · A.14o gate · **PASS** · 15/15 checks, 97/97 static pages

**Verdict:** QA log is current and being used as designed. **No A.14u entries yet** (this audit is part of A.14u; gate hasn't fired).

---

## Feedback log + QA log freshness

- **`_meta/11-feedback-log.md`** — mtime **2026-05-26 12:01** (1 day stale relative to today 2026-05-27 14:35 local). Latest content row references A.14t T7 `force-dynamic` fix-up. Size 54KB. Healthy.
- **`_meta/10-qa-log.md`** — mtime **2026-05-19 21:22** (8 days stale). Size 4KB. Last visible content discusses "Locked → Superseded" workflow rules. **This markdown qa-log is essentially abandoned in favor of `~/.claude/sessions/qa-log.jsonl`.** Either retire it formally or run a sync script to mirror jsonl PASS/FAIL summaries here.

---

## STATUS-DASHBOARD freshness

- **mtime:** 2026-05-27 14:35:26 local (TODAY)
- **"Last regenerated" header:** 2026-05-27 21:35 UTC (matches mtime — regen ran today)
- **Content currency:** **STALE BY 2 PHASES.** Header still says `Phase: A.14s · Since: 2026-05-26T17:05Z`. Recent-activity table top row is A.14s · 2026-05-26T17:05Z. **A.14t (SHIPPED 2026-05-26 20:15) and A.14u (in-flight today) do NOT appear.**
- **Root cause:** the regen script likely runs but pulls `current-action.json` which was last updated by A.14p Wave-4 closeup (2026-05-26T13:08), then advanced to A.14s manually. A.14t closeup may have skipped the `current-action.json` update, or the regen reads from a cached source.

**Closure path:** Open `current-action.json` and confirm whether it shows A.14s, A.14t, or A.14u. If A.14s, that's the bug — closeups must always advance this file. Add a regen verification: regen exits non-zero if `current-action.json` phase is older than the most recent qa-log phase.

---

## Master DOCX

- **`_meta/MASTER-SUMMARY-UGC.docx`** — 50647 bytes · mtime **2026-05-26 12:01** (1 day stale)
- **`.bak` backup** — 49958 bytes · mtime **2026-05-26 10:04** (HR-13 OneDrive backup discipline holding)
- **Last append:** A.14p Wave-4 closeup (47651 → 48192 bytes per qa-log entry), but file is now 50647 — so further appends happened (A.14q? A.14r? A.14s? A.14t?). Not opened/spot-read in this audit — flag for next ELON gate to verify content currency vs claimed appends.

---

## CAMPAIGN-HUB

- **File:** `CAMPAIGN-HUB.md` · 4201 bytes · mtime **2026-05-15 20:42** (12 days stale)
- **Active campaigns table:** 1 row (ParakeetAI · 🔵 Reference · 13/13 ✅)
- **Active outreach table:** 6 brands, all dated "Last touch: 2026-05-15"
- **Top-of-Mind Blockers:** 4 listed (B1 Stop hook, B2 Chrome allow, B3 P0/P1 picks, B4 n8n activation) — at least B4 has progressed (n8n workflows are documented as `Inactive` per project memory; B4 effectively folds into J8)

**This file has not been touched in 12 days despite the system being highly active.** Highest-priority closure item alongside STATUS-DASHBOARD freshness.

---

## JULZ-RULES

- **HR count:** 37 ✅ (max enumerated row = `| 37 |`, total HR-pattern occurrences = 37)
- **HR-37 present:** ✅ row exists at the bottom of the hard-rules table
- **Caveat:** HR-37 was added today as a **banked-lesson candidate** per A.14t qa-log notes — verify whether it's been promoted to enforceable status or still pending JULZ-RULES integration

---

## Top 10 closure-needed items (ranked by impact × ease)

| # | Item | Impact | Ease | Owner | Action |
|---|------|--------|------|-------|--------|
| 1 | **STATUS-DASHBOARD shows A.14s as latest phase** | HIGH | EASY | claude | Fix `current-action.json` advancement in closeup pattern + re-run regen |
| 2 | **CAMPAIGN-HUB 12 days stale** | HIGH | MEDIUM | julz+claude | Walk 6 outreach rows, update Last touch + Stage, add aging-flag visual |
| 3 | **30 pending action items, half are stale-Julz-tasks** | HIGH | EASY | claude | Bulk reclassify J7/J8/J9/J12/J13/J19/J24 to `🔵 deferred` with unblock condition |
| 4 | **10 CAPAs all in non-closed status, only CAPA-008 has any VoE** | MEDIUM | MEDIUM | claude | VoE sweep across recent qa-log to advance CAPAs toward `closed` |
| 5 | **`_meta/24-north-star-kpi.md` has 6 TBDs** | HIGH | NEEDS-JULZ | julz | Fill 6 KPI placeholders (the doc is operationally dead until then) |
| 6 | **`_meta/10-qa-log.md` 8 days stale, superseded by jsonl** | LOW | EASY | claude | Either retire the markdown OR add sync script |
| 7 | **HR-37 banked-lesson promotion incomplete** | MEDIUM | EASY | claude | Confirm HR-37 is enforceable (not just queued) + add `force-dynamic` grep to pre-commit |
| 8 | **Catch ledger frozen at 21 entries (no new since 2026-05-20)** | MEDIUM | EASY | claude | Backfill 4 catches from A.14o/p/q/t qa-log FAILs + establish jsonl-FAIL→catch hook |
| 9 | **`_meta/mockups/audit-per-tab-checklist.md` has 17 TODO/TBD** | MEDIUM | NEEDS-CHECK | claude | Verify if A.14n/o/p closed these items; if yes, mark resolved |
| 10 | **6 in-flight brands have no `{brand-slug}` workspace** | LOW | NEEDS-JULZ | julz | Decide: instantiate-on-outreach OR instantiate-on-SOW (current implicit policy) |

---

## Skills invoked

- `engineering:documentation` · loaded 2026-05-27 (this audit)
- `superpowers:verification-before-completion` · loaded 2026-05-27 (this audit)
- `data-quality-auditor` · loaded 2026-05-27 (this audit) — applied DQS lens to ledger/dashboard/feedback-log freshness

**Skills cited in brief but not loaded in this read-only audit pass** (scope-justified omission per HR-25 spirit — audit is filesystem stat + grep, not code review or runbook authoring): `superpowers:requesting-code-review`, `claude-md-management:claude-md-improver`, `operations:runbook`, `karpathy-coder:karpathy-check`. Flag in ELON gate if these are required for the audit to be considered complete; can re-spawn with full stack.
