# A.14y Wave 0.9 — HOLMES-V3 Contract-PDF Clause-Extraction Brief

> **Author:** HOLMES (Sherlock Holmes persona — gated-portal scrapers + clause extraction). Reports STEVE → ELON.
> **Type:** Ready-to-fire spawn package (PLANNING/AUTHORING — extraction NOT run here; see §5 blocker).
> **Date authored:** 2026-05-29
> **Phase:** A.14y Wave 0.9
> **Format:** HR-51 · Constraints: HR-1 · HR-10 · HR-15 · HR-19 · HR-21 · HR-25 · HR-26 · HR-34 · HR-50

---

## 🔗 QUICK LINKS

| Resource | Path / URL |
|---|---|
| **This brief** | `C:\Users\julia\OneDrive\Desktop\ugc-command-center\_meta\dashboard-spec\06-a14y-wave-0.9-holmes-v3-brief.md` |
| **Canonical JSONL (merge target)** | `C:\Users\julia\OneDrive\Desktop\ugc-command-center\data\brands-canonical.jsonl` |
| **Canonical JSON mirror** | `C:\Users\julia\OneDrive\Desktop\ugc-command-center\data\brands-canonical.json` |
| **Merge script (NORMA cron)** | `C:\Users\julia\OneDrive\Desktop\ugc-command-center\scripts\merge-canonical.mjs` |
| **SOW enrich script (idempotent, writes `.bak`)** | `C:\Users\julia\OneDrive\Desktop\ugc-command-center\scripts\enrich-canonical-sow.mjs` |
| **SOW Breakdown UI (renders the terms)** | `C:\Users\julia\OneDrive\Desktop\ugc-command-center\components\sow-breakdown\SowDetailPanel.tsx` + `SowBreakdownTable.tsx` |
| **Per-campaign SOW markdown (mwm)** | `C:\Users\julia\OneDrive\Desktop\UGC\sideshift-mwm-ai\03-sow-breakdown.md` |
| **Per-campaign SOW markdown (phobaxx)** | `C:\Users\julia\OneDrive\Desktop\UGC\sideshift-phobaxx\03-sow-breakdown.md` |
| **MWM PDF (candidate, see §5 identity warning)** | `C:\Users\julia\Downloads\mww.ai.pdf` (7 pp, 39,477 B) |
| **Phobaxx PDF (candidate, see §5 identity warning)** | `C:\Users\julia\Downloads\Contract Agreement _ Phobaxx.pdf` (5 pp, 27,692 B) |
| **Linear — MWM** | https://linear.app/julianne/issue/JUL-26/mwmai-tiktok-ig-reels-youtube-shorts-retainer |
| **Linear — Phobaxx** | https://linear.app/julianne/issue/JUL-27/phobaxx-30-postsmonth-organic-native |
| **HOLMES-V3 closeout (on completion)** | `~/.claude/sessions/agent-reports/2026-05-29/A.14y-wave-0.9/HOLMES-V3.md` |

---

## 🟢 BOTTOM LINE

- This is the **ready-to-fire HOLMES-V3 package**: the moment the contract PDFs are confirmed-present, ELON pastes §1 into an `Agent` call and the run executes with zero re-planning.
- **Plot twist found during pre-flight (HR-34 verify-own-reads):** candidate PDFs *already exist* in `C:\Users\julia\Downloads\` — `mww.ai.pdf` (7 pp) and `Contract Agreement _ Phobaxx.pdf` (5 pp). They are NOT the exact filenames the task assumed, and their byte sizes (39 KB / 27 KB) do **not** match the SideShift display sizes the canonical row records (188.1 KB / 153.1 KB). **Identity + completeness must be verified at read-time before any merge** — this is a real HR-15 trap, not a green light.
- **The prize:** Phobaxx `payment_amount_usd` is currently `null` (HR-10-blocked across HOLMES-V1 + V2). MWM's video-length / tone / usage-rights are unconfirmed. Both rows have empty `do_not_say[]`, all-null `deadlines{}`, and **no usage-rights / revision / kill-fee / FTC / exclusivity / termination fields at all** — those clauses live only as loose strings inside `honest_concerns[]`. HOLMES-V3 fills every one of these from the signed PDFs and writes them to canonical so the dashboard SOW Breakdown renders the real, executable terms (HR-53).
- **Blocker honesty (HR-10):** I did **not** run the extraction — that requires the confirmed-correct PDFs open in the pdf MCP, and the identity/size mismatch above means ELON (or Julz) must confirm-or-re-pull first. This brief is the package; the extraction is the trigger-gated run.

---

## 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW

### **1. Confirm the two PDFs in Downloads are the real signed contracts — OR let ELON re-pull them**
The files `mww.ai.pdf` and `Contract Agreement _ Phobaxx.pdf` are sitting in `C:\Users\julia\Downloads\`, but they're smaller than the SideShift originals (39 KB vs 188 KB for MWM; 27 KB vs 153 KB for Phobaxx). Either (a) open them for 5 seconds and confirm they're the full signed agreements, or (b) tell ELON "re-pull from SideShift" and ELON foregrounds the SideShift tab in Chrome and re-downloads the 188.1 KB / 153.1 KB originals.

### **2. Say "HOLMES go"**
Once the PDFs are confirmed (or re-pulled), say **"HOLMES go"** (or just "download the 2 PDFs OR I pull them via Chrome MCP, then HOLMES go"). ELON dispatches §1 of this brief in one line. HOLMES-V3 extracts every clause, merges to canonical, and the dashboard SOW Breakdown shows the real terms within the same turn.

---

## 0. Context — Why this brief exists

HOLMES-V1 (A.14v Wave 2A) and HOLMES-V2 (A.14v Wave 4) both **failed to extract these two contracts** — not from incompetence, but from a hard platform gate: the contract PDFs live as attachments inside SideShift's chat, and the SideShift right-pane conversation panel **will not mount in a background/hidden browser tab**, which is the only kind of tab Chrome MCP can drive. V2's verbatim root-cause finding (preserved in the canonical `phobaxx` row, `conflicts[0].holmes_v2_probe_2026-05-27`):

> "ROOT CAUSE IDENTIFIED via JS probe: `document.visibilityState='hidden'`, `document.hidden=true`. Chrome MCP tabs operate in a non-foreground tab group; SideShift conversation panel does not bind Firebase channel listener when document is hidden. JS visibility spoof … did not unblock. … CONCLUSION: SideShift chat panel cannot be scraped via Chrome MCP without Julz manually foregrounding the tab."

So the unblock has always been: **get the PDFs onto local disk**, then run a *local* pdf-MCP extraction (no browser gate). That local-extraction run is HOLMES-V3. This document pre-authors it so the instant the PDFs land, there is zero planning latency — ELON fires one line.

**HR-10 honest status of the PDFs (re-verified this turn via `Bash ls` + `file`):**
- `C:\Users\julia\Downloads\mww.ai.pdf` — EXISTS, 7-page PDF v1.3, 39,477 bytes. ⚠️ filename is `mww` (not `mwm`); size ≠ canonical's recorded 188.1 KB. **Treat as candidate, verify at read-time.**
- `C:\Users\julia\Downloads\Contract Agreement _ Phobaxx.pdf` — EXISTS, 5-page PDF v1.3, 27,692 bytes. ⚠️ separator is `_` (not `-`); size ≠ canonical's recorded 153.1 KB. **Treat as candidate, verify at read-time.**
- The canonical `contract_link` strings still point at the SideShift-original filenames (`Contract Agreement - MWM.AI.pdf (188.1 kB)` / `Contract Agreement - Phobaxx.pdf (153.1 kB)`).

---

## 1. THE SPAWN PROMPT (copy-paste ready for ELON's `Agent` call)

> ELON: paste everything in the box below as the sub-agent prompt. Use `isolation: "worktree"` (HR-36 — this run writes to canonical JSONL + UGC markdown; worktree prevents a parallel-agent git race). Single agent, so no batching needed.

```
You are HOLMES-V3 (Sherlock Holmes persona — gated-portal scrapers + contract clause-extraction).
Reporting chain: HOLMES-V3 → STEVE (engineering team lead) → ELON (final QA).
Phase: A.14y Wave 0.9. This is the local-disk PDF extraction run that HOLMES-V1 and HOLMES-V2
were blocked from completing (SideShift visibility-gated panel — see canonical phobaxx row
conflicts[0]). The PDFs are now (claimed) on local disk, so the browser gate no longer applies.

═══ MISSION ═══
Extract every contract clause from the two SIGNED UGC contracts, then merge the extracted terms
into data/brands-canonical.jsonl rows `mwm-ai` and `phobaxx` so the dashboard SOW Breakdown
(components/sow-breakdown/SowDetailPanel.tsx) renders the REAL, executable terms. No mock data,
no inference where the PDF states a fact (HR-49, HR-1). Where the PDF is genuinely silent, write
null + add the gap to honest_concerns[] (HR-10 honesty — do not fabricate a number).

═══ SKILLS — INVOKE EACH VIA THE Skill TOOL (HR-21 CITE=INVOKE, HR-25 ≥6) ═══
Call the Skill tool for each of these BEFORE using its method, and record the call timestamp +
one-line influence note for your closeout:
  1. pdf-viewer:open                              — open + render each PDF
  2. legal:review-contract                        — clause taxonomy + payment/usage/termination analysis
  3. anthropic-skills:meeting-analyzer            — (apply its extraction discipline to structured clause pull)
  4. data-quality-auditor:data-quality-auditor    — validate extracted values before merge (silent-null trap, type conformance)
  5. operations:runbook                           — follow §2 rubric + §3 merge as a stepwise runbook
  6. superpowers:verification-before-completion    — no completion claim without fresh evidence (re-read merged JSONL row)

═══ STEP 0 — IDENTITY + COMPLETENESS GATE (HR-15, HR-34) ═══
Before extracting ANYTHING, verify each candidate PDF is the real signed contract:
  • Open C:/Users/julia/Downloads/mww.ai.pdf via pdf-viewer:open (display_pdf) AND Read its bytes
    (mcp__plugin_pdf-viewer_pdf__read_pdf_bytes) — confirm it is a 7-page MWM.ai UGC contract
    (look for "MWM", brand/creator party names, signature block, $50 / 5-post retainer language).
  • Open C:/Users/julia/Downloads/Contract Agreement _ Phobaxx.pdf the same way — confirm it is a
    5-page Phobaxx UGC contract (look for "Phobaxx", "30 posts", signature block, a $ amount).
  • The byte sizes (39 KB / 27 KB) are SMALLER than the SideShift display sizes the canonical row
    records (188.1 KB / 153.1 KB). If a PDF is a flattened/print export it may still be complete —
    but if it is truncated, a cover page only, or the WRONG document, STOP that brand's extraction
    and report "identity FAIL — needs re-pull from SideShift" for that brand. Do NOT merge a
    document you could not positively identify. Run the OTHER brand if only one fails.
  • If a path is missing entirely, do NOT claim "outside writeable root" (HR-34) — re-Glob
    C:/Users/julia/Downloads/*.pdf and C:/Users/julia/**/*Phobaxx* / *MWM* / *mww* first, then
    report the actual missing path with the actual tool error.

═══ STEP 1 — EXTRACT (per PDF, follow the §2 rubric in 06-a14y-wave-0.9-holmes-v3-brief.md) ═══
For each confirmed PDF, pull every field in the §2 rubric. Quote the exact clause text for each
extracted value (you will store a short source quote in the merge for auditability). Where a clause
is absent, mark the field null/empty and log WHY in honest_concerns[]. Cross-check extracted values
against the existing canonical row and the per-campaign 03-sow-breakdown.md — if the PDF CONTRADICTS
the current canonical value (e.g. canonical says $50 but PDF says $75), the PDF wins (it is the
signed source of truth); record the prior value + the correction in a `conflicts[]` entry with
status "resolved_by_pdf_2026-05-29".

═══ STEP 2 — MERGE TO CANONICAL (follow §3 field map exactly) ═══
Edit data/brands-canonical.jsonl rows brand_id="mwm-ai" and brand_id="phobaxx" per the §3 map.
  • PRESERVE every existing field not in the map (HR-2 — do not drop sources{}, linear{}, fit_score
    rationale, etc.). Edit only the mapped fields + append to conflicts[]/honest_concerns[]/notes.
  • Set contract_status="signed" and contract_signed=true (already true; confirm).
  • Update contract_link to the LOCAL verified filename + "(verified local, NN pp, <bytes> B,
    extracted 2026-05-29 by HOLMES-V3)" so the provenance is honest about which file was read.
  • Add the NEW clause fields that do not yet exist on the row (usage_rights, revision_policy,
    kill_fee_usd, ftc_disclosure, exclusivity, termination — see §3). These are net-new schema keys;
    that is intentional and authorized by this brief (HR-1 cite: this brief §3).
  • Set last_processed_by="HOLMES-V3" + last_processed_at=<ISO now>.
  • Back up first: copy brands-canonical.jsonl → brands-canonical.jsonl.bak before editing
    (mirror enrich-canonical-sow.mjs behavior).

═══ STEP 3 — PROPAGATE + VERIFY (HR-19, HR-49, verification-before-completion) ═══
  • Run `node scripts/merge-canonical.mjs` if present (regenerates brands-canonical.json mirror
    from the JSONL) OR manually sync the .json mirror so dashboard reads match. Confirm exit 0.
  • Re-Read the two edited JSONL rows (fresh Read) and paste the mwm-ai + phobaxx
    payment_amount_usd, deliverables, usage_rights, do_not_say, deadlines, contract_status values
    into your closeout as evidence. "I edited it" is NOT evidence — the re-Read is.
  • Optionally also update UGC/sideshift-{slug}/03-sow-breakdown.md with the confirmed $ + clauses
    so the per-campaign source markdown matches canonical (HR-11 one living doc).
  • DO NOT screenshot the live dashboard yourself unless ELON asks — HR-33 live-URL verification is
    ELON's Tier-2 job. Your job ends at canonical + mirror + re-Read evidence.

═══ HARD-RULE BRIEFING (enforce all) ═══
HR-1 (cite/no-creep — net-new schema keys authorized by this brief §3) · HR-2 (preserve existing
canonical fields) · HR-10 (honest: null + concern when PDF silent; never fabricate $) · HR-15
(verify artifact = re-Read merged row, not "I edited it") · HR-19 (source PDF ≠ merged artifact —
prove the merge) · HR-21 (invoke every cited skill via Skill tool) · HR-25 (≥6 skills) · HR-34
(verify own reads via Read/Glob before any "inaccessible" claim) · HR-49 (canonical-only, no mock) ·
HR-50 (NO PARTIAL — extract ALL rubric fields for BOTH confirmed PDFs; if one PDF fails identity,
fully process the other + explicitly report the failed one, do not half-merge).

═══ RETURN (HR-30/45 format) ═══
Open with `## 🟢 BOTTOM LINE` (bullets: which PDFs confirmed, the headline numbers extracted —
esp. Phobaxx $ — what merged, what stayed null) + `## 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW`.
Then: per-brand extracted-clause table, the conflicts[] you resolved, the re-Read evidence block,
and skill-invocation log (skill name · Skill-tool-call timestamp · one-line influence).
Write HR-39 closeout to ~/.claude/sessions/agent-reports/2026-05-29/A.14y-wave-0.9/HOLMES-V3.md
AND append a JSONL row to ~/.claude/sessions/agent-reports.jsonl.
```

---

## 2. CLAUSE-EXTRACTION RUBRIC (the exact fields to pull from each PDF)

> Apply the `legal:review-contract` clause taxonomy. For EACH field: extract the value **and** a short verbatim source quote (≤25 words) for the audit trail. If the clause is absent, write `null`/`[]` and add a one-line reason to `honest_concerns[]` — never guess (HR-10).

| # | Clause | What to pull | Canonical target field (see §3) | If absent |
|---|---|---|---|---|
| **R1** | **Payment amount** | The $ figure(s): per-cycle, per-post, flat, or monthly | `payment_amount_usd` (number) | `null` + concern `payment_amount_not_in_pdf` |
| **R2** | **Payment structure** | Retainer vs per-post vs flat vs milestone; what triggers a payment | `payment_timing` (string) + `payment_terms_note` | keep existing note + flag |
| **R3** | **Payment timing / net terms** | Net-N days, on-approval, on-post, 50/50 split, etc. | `payment_terms_days` (number) | `null` + concern |
| **R4** | **Bonus / performance pay** | Any bonus, view-threshold bonus, whitelisting top-up | `bonus_amount_usd` (number) | `null` (no concern needed if truly none) |
| **R5** | **Total potential value** | Upper cap if the contract states one (else recurring/uncapped) | `payment_total_potential` (number\|null) | `null` |
| **R6** | **Deliverable counts** | # of videos/posts, and per-cycle vs total | `deliverables[].count` | flag mismatch vs canonical |
| **R7** | **Platforms** | TikTok / IG Reels / YouTube Shorts / other; cross-post rights | `deliverables[].platform` | flag |
| **R8** | **Formats / specs** | Vertical 1080×1920, duration (sec), aspect, organic-native vs ad | `deliverables[].format` + **R8a video_length** | `null` + concern (MWM's known gap) |
| **R9** | **Usage rights** | Org/paid/whitelisting, who may boost, on which channels | `usage_rights.scope` (string) | `null` + concern `usage_rights_not_in_pdf` |
| **R10** | **Usage window** | Perpetual vs N-month license; renewal | `usage_rights.window` (string) | `null` + concern |
| **R11** | **Exclusivity** | Category exclusivity, competitor restrictions, non-compete window | `exclusivity` (string\|null) | `null` (note if explicitly "none") |
| **R12** | **Revision policy** | # of free revision rounds; revision-fee thereafter | `revision_policy` (string) | `null` + concern |
| **R13** | **Kill fee** | Fee if brand cancels mid-production; % of total | `kill_fee_usd` (number\|null) + note | `null` + concern `no_kill_fee_clause` |
| **R14** | **FTC / disclosure** | #ad / #sponsored / "paid partnership" tag requirements | `ftc_disclosure` (string) | `null` + concern (compliance risk) |
| **R15** | **Do-not-say list** | Banned claims, prohibited language, off-limits topics | `do_not_say[]` (string array) | `[]` (note if PDF has none) |
| **R16** | **Deadlines** | Filming-by, submission-by, payment-by dates | `deadlines.{filming_by,submission_by,payment_by}` | `null` each + concern |
| **R17** | **Termination terms** | Notice period, cause vs convenience, wind-down, surviving clauses | `termination` (object: `{notice_days, for_cause, for_convenience, survival}`) | `null` + concern |
| **R18** | **Parties + signature** | Brand legal name, creator party, signature presence + date | confirm `contract_signed`/`contract_signed_at`; brand name → validate `brand_name_canonical` | flag if unsigned (would downgrade `status`) |

**Severity tagging (data-quality-auditor confidence loop):** tag each extracted value 🟢 Verified (quoted directly from PDF), 🟡 Likely (inferred from adjacent clause), 🔴 Assumed (not in PDF — must be `null`, not a guess). Only 🟢 values overwrite a non-null canonical field.

---

## 3. CANONICAL MERGE LOGIC (extracted clause → JSONL field → rendered UI)

**Target file:** `C:\Users\julia\OneDrive\Desktop\ugc-command-center\data\brands-canonical.jsonl`
**Rows:** line with `"brand_id":"mwm-ai"` and line with `"brand_id":"phobaxx"`.
**Method:** `Edit` the two JSONL lines in place (HR-11 living doc; HR-2 preserve all unmapped fields). Back up to `.bak` first. Then regen the `.json` mirror via `merge-canonical.mjs`.

### 3a. Existing fields — overwrite from PDF (these keys already exist on both rows)

| Rubric | Canonical key | Current MWM value | Current Phobaxx value | HOLMES-V3 action |
|---|---|---|---|---|
| R1 | `payment_amount_usd` | `50` | **`null`** ← headline blocker | Overwrite with PDF $ (Phobaxx is the prize) |
| R3 | `payment_terms_days` | `30` | `30` | Confirm / correct from PDF |
| R4 | `bonus_amount_usd` | `null` | `null` | Set if PDF states a bonus |
| R2 | `payment_terms_note` | `"$50 retainer every 5 approved posts"` | `"30 total posts \| 30 posts per month \| 2 deliverables; $ amount inside PDF — HR-10 unresolved"` | Rewrite to confirmed terms; **drop the "HR-10 unresolved" tail** once resolved |
| R2 | `payment_timing` | `"per_5_approved_posts"` | `"monthly_30_posts"` | Confirm / correct |
| R5 | `payment_total_potential` | `null` | `null` | Set if capped |
| R6/R7/R8 | `deliverables[]` | 3 items (TT/Reels/Shorts ×5) | 1 item (TT+Reels+Shorts ×30) | Reconcile counts/platforms/formats; **add `duration_sec` to each format if PDF specifies (MWM's video-length gap)** |
| R15 | `do_not_say[]` | `[]` | `[]` | Populate from PDF banned-claims clause |
| R16 | `deadlines{}` | all `null` | all `null` | Set filming/submission/payment dates if PDF states them |
| — | `contract_status` | `"signed"` | `"signed"` | Confirm `signed` |
| — | `contract_signed` / `_at` | `true` / `2026-05-26` | `true` / `2026-05-26` | Confirm from signature block (R18) |
| — | `contract_link` | `"…- MWM.AI.pdf (188.1 kB)"` | `"…- Phobaxx.pdf (153.1 kB)"` | Append `+ " — verified local <filename>, NN pp, <bytes> B, extracted 2026-05-29 HOLMES-V3"` (provenance honesty re: which file was actually read) |
| — | `awaiting_brand_action` | `"Send video length spec + tone guide + usage rights window"` | `"Confirm video-only vs photo/carousel split + send payment $ amount"` | Shrink to only what the PDF did NOT resolve |
| — | `honest_concerns[]` | 4 items | 4 items | **Remove** each concern the PDF now resolves (e.g. drop `payment_amount_blocked_pending_PDF`, `usage_rights_pending`); **keep/add** any the PDF leaves open |
| — | `last_processed_by` / `_at` | `CLAUDE-A14Y-W06C` / … | same | Set to `HOLMES-V3` / ISO now |

### 3b. NET-NEW clause fields — add to both rows (do NOT currently exist on canonical; authorized by this brief §1)

> These six clauses are presently captured only as loose strings inside `honest_concerns[]` (e.g. `"usage_rights_pending"`). HOLMES-V3 promotes them to first-class structured keys so the SOW Breakdown UI can render them as discrete rows.

| Rubric | New canonical key | Type | Example shape |
|---|---|---|---|
| R9/R10 | `usage_rights` | object | `{ "scope": "organic + paid whitelisting", "window": "12 months", "channels": ["brand handles"], "source_quote": "…" }` |
| R11 | `exclusivity` | string\|null | `"category exclusivity, 30-day competitor restriction"` or `null` |
| R12 | `revision_policy` | string\|null | `"2 free rounds, $25/round thereafter"` |
| R13 | `kill_fee_usd` | number\|null | `25` (plus `kill_fee_note` if % based) |
| R14 | `ftc_disclosure` | string\|null | `"#ad + Paid partnership label required on all posts"` |
| R17 | `termination` | object\|null | `{ "notice_days": 14, "for_cause": "...", "for_convenience": true, "survival": "usage rights survive" }` |

Each new key SHOULD carry a `source_quote` (or the parent object should) so the value is auditable back to the PDF clause (HR-19).

### 3c. Conflict handling (when PDF contradicts canonical)

If an extracted 🟢 value differs from the current canonical value, append to that row's `conflicts[]`:
```json
{ "field": "<key>", "issue": "canonical=<old> but signed PDF=<new>",
  "sources": ["HOLMES-V3 PDF extraction 2026-05-29 — quote: \"…\""],
  "status": "resolved_by_pdf_2026-05-29", "resolver": "HOLMES-V3" }
```
The PDF (signed source of truth) wins; canonical is corrected to match.

### 3d. Propagation chain (extracted → rendered, satisfying HR-53)

```
PDF clause (signed source of truth)
   │  pdf-viewer:open + read_pdf_bytes  →  HOLMES-V3 extraction (§2 rubric)
   ▼
data/brands-canonical.jsonl  (Edit rows mwm-ai + phobaxx, §3 map)   ← .bak written first
   │  node scripts/merge-canonical.mjs  (regen mirror)
   ▼
data/brands-canonical.json   (dashboard read source)
   │  lib loaders → campaigns/SOW data shape
   ▼
components/sow-breakdown/SowDetailPanel.tsx + SowBreakdownTable.tsx
   ▼
Dashboard "SOW Breakdown" renders REAL payment $, deliverables, usage rights,
revision policy, kill fee, FTC reqs, do-not-say, deadlines, termination
   →  Julz opens the campaign and just EXECUTES (HR-53).
```

> **Note for HOLMES-V3:** the SOW UI components read a campaign-shaped object via the `lib` loaders, not the raw canonical keys directly. If a newly-added §3b key (e.g. `usage_rights`, `revision_policy`) does not surface in the rendered panel, that means the loader/transform in `lib/` needs a one-line passthrough added — flag it to STEVE/ELON as a follow-up rather than silently leaving the field un-rendered (HR-50 — the merge isn't "done" until the term is visible on the dashboard or the gap is explicitly reported).

---

## 4. TRIGGER

**Fire condition (any one):**
- Julz says **"HOLMES go"** (or "download the 2 PDFs OR I pull them via Chrome MCP, then HOLMES go"), **OR**
- The SideShift re-pull (ELON, foregrounded Chrome tab) lands the confirmed 188.1 KB / 153.1 KB originals in `C:\Users\julia\Downloads\`, **OR**
- ELON/Julz confirms the existing `mww.ai.pdf` + `Contract Agreement _ Phobaxx.pdf` candidates are the full signed contracts (Step 0 identity gate passes by human spot-check).

**Dispatch action:** ELON pastes §1 verbatim into an `Agent` call with `isolation: "worktree"`. One line, zero re-planning. ELON then runs the same-turn Tier-2 gate (HR-47) on HOLMES-V3's return — independently re-Reading one merged row + (HR-33) screenshotting the live SOW Breakdown for the affected brand.

---

## 5. CURRENT BLOCKER — HONEST STATUS (HR-10)

| Item | Status | Detail |
|---|---|---|
| Extraction run | **NOT executed** | This is an authoring task. No PDF was opened in the pdf MCP; no canonical row was edited. By design — extraction is trigger-gated (§4). |
| MWM PDF on disk | ⚠️ **Candidate present, unverified** | `C:\Users\julia\Downloads\mww.ai.pdf` exists (7 pp, 39,477 B) but filename (`mww`≠`mwm`) and size (39 KB ≠ recorded 188.1 KB) don't match the canonical record. Identity unconfirmed — Step 0 gate handles this. |
| Phobaxx PDF on disk | ⚠️ **Candidate present, unverified** | `C:\Users\julia\Downloads\Contract Agreement _ Phobaxx.pdf` exists (5 pp, 27,692 B) but size (27 KB ≠ recorded 153.1 KB) doesn't match. Identity unconfirmed. |
| SideShift re-pull (ELON) | **Available on request** | If candidates fail Step 0, ELON foregrounds the SideShift tab in Chrome and re-downloads the 188.1/153.1 KB originals — the browser-gate workaround documented in HOLMES-V2's finding. This is the one step that genuinely needs a foregrounded browser session. |
| Why I didn't just run it anyway | **HR-15 / HR-50 discipline** | Running extraction on a possibly-wrong/truncated PDF and merging it to canonical would poison the dashboard with bad terms — worse than waiting for a 5-second human confirm. The package is ready; the confirm is the gate. |

**Net:** zero delay once the PDFs are confirmed. The brief is the package; "HOLMES go" is the only missing input.

---

## ELON QA GATE — this authoring deliverable (HR-7 / HR-20, inline, this turn)

| # | Check | Result |
|---|---|---|
| 1 | File written to exact spec path | 🟢 `_meta/dashboard-spec/06-a14y-wave-0.9-holmes-v3-brief.md` |
| 2 | §1 spawn prompt copy-paste ready, names PDFs + pdf MCP | 🟢 includes `pdf-viewer:open` + `read_pdf_bytes`, both paths, isolation:worktree |
| 3 | §2 rubric covers all required clauses | 🟢 R1–R18: payment amount/structure/timing, deliverables/platforms/formats, usage/window/exclusivity, revision, kill fee, FTC, do-not-say, deadlines, termination |
| 4 | §3 merge map uses REAL canonical field names | 🟢 verified by reading actual `mwm-ai` + `phobaxx` rows (payment_amount_usd, bonus_amount_usd, deliverables[], do_not_say[], deadlines{}, contract_status, etc.); net-new keys flagged as net-new |
| 5 | §4 trigger stated | 🟢 "HOLMES go" / SideShift land / human confirm |
| 6 | §5 blocker honest (HR-10) | 🟢 discloses extraction NOT run + the filename/size mismatch I found, rather than parroting "PDFs not downloaded" |
| 7 | ≥6 skills invoked via Skill tool (HR-25/21) | 🟢 pdf-viewer:open, legal:review-contract, meeting-analyzer, data-quality-auditor, operations:runbook, verification-before-completion — all launched this turn |
| 8 | HR-51/45 format (Quick Links → bulleted Bottom Line → bold numbered actions) | 🟢 present at top |
| 9 | Problems ship with solutions (HR-26) | 🟢 every blocker has a remediation path (Step 0 gate, ELON re-pull, loader-passthrough follow-up note) |
| 10 | Verified own reads before claims (HR-34/15) | 🟢 canonical rows, scripts, UI components, PDF existence all confirmed via Bash/file before writing — no assumed paths |

**Self-verdict:** PASS (authoring scope). Extraction correctness is HOLMES-V3's gate, not this brief's.
