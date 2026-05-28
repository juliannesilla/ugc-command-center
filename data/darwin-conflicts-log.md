# DARWIN Conflicts Log — Wave 2 / A.14v

**Generated:** 2026-05-27
**Method:** field-by-field comparison across sideshift / gmail / linear sources after dedup by normalized brand slug.
**Format:** one section per conflict, with source citations + resolution recommendation.

---

## C1 — ParakeetAI Linear status drift (P0 — auto-fixable)

- **Brand:** ParakeetAI
- **Field:** `status` / `status_linear`
- **Conflict:** Linear `status_linear` = `Backlog` (`status_type`: `backlog`); but issue description shows `stage_13: 13/13 (all stages checked)` and note states "actual ParakeetAI submission already happened — this is the documented version showing what the workflow's end state looks like."
- **Sources:**
  - linear row 1 (JUL-25) — `status_linear: Backlog`
  - linear row 1 description — `stage 13/13 checked + submission complete`
  - sideshift row 34 — last julz msg 2026-05-15, brand reply still awaited, but Linear shows completed workflow
- **Caught by:** ADA (Wave 1 V5)
- **Resolution:** AUTO-FIX — advance JUL-25 status `Backlog → Done` or `Closed` via Linear `save_issue` MCP call.
- **Command:** `mcp__f8269c34-2998-4104-aa20-bce0b00cd257__save_issue` with issue_id `JUL-25`, status update.

---

## C2 — MyCal AI payment terms (P1 — needs brand reply)

- **Brand:** MyCal AI Calorie Tracker
- **Field:** `bonus_amount_usd` / `payment_terms_note`
- **Conflict:** Initial message body says `$25 @ 100K views / $150 @ 1M views`. Formal agreement says `$300 @ 100K / $1000 @ 1M`. Julz directive: "agreement is source of truth."
- **Sources:**
  - sideshift row 3, payment_terms field
- **Resolution:** Hold for Alicia response. NO auto-fix — needs brand confirmation. Documented as `note` field in canonical row; canonical `payment_terms_note` uses agreement values.

---

## C3 — Astor thread-direction anomaly (P2 — needs Julz human-verify)

- **Brand:** Astor
- **Field:** `thread_direction` / `role`
- **Conflict:** OPRAH (sideshift row 24) flagged: "this conversation appears to have Julz speaking AS Astor brand rep — possibly her own brand or she was hiring; verify". Gmail row 4 ("Royce Um") shows identical payment structure ($5 base + $1/1000 views), supporting that Royce Um is Astor's actual rep and Julz was responding AS creator (not AS brand) — but `last_msg_preview` "Exactly correct. $5 base pay per qualifying video..." reads like a brand confirmation, not a creator question.
- **Sources:**
  - sideshift row 24 — `verified: preview_only_INVERTED`
  - gmail row 4 — `payment_amount_mentioned: $5 base + $1/1000 views`
- **Resolution:** Cannot auto-resolve from data alone. Canonical row merges Royce Um into Astor and notes anomaly in `conflicts[]`. Julz to confirm via opening SideShift thread visually.

---

## C4 — Monat Global = MLM, not classic UGC (P3 — categorization decision)

- **Brand:** Monat Global
- **Field:** `deliverable_type` / pipeline classification
- **Conflict:** Monat's 3 payments ($54.40 total across Apr 24 / May 1 / May 8) come from MyPayQuicker — MLM commission payouts. This is categorically different from UGC contract payment. Dashboard placement decision: include on UGC dashboard or split to passive-income / MLM tracker?
- **Sources:**
  - gmail rows 25, 26, 27 — all from `no-reply@mypayquicker.com`
- **Resolution:** Hold pending Julz decision. Canonical row marks `dashboard_visible: false` (defaults Monat off UGC dashboard); reclassify if Julz wants it included.

---

## C5 — Phobaxx payment unknown (P1 — Claude can resolve via PDF read)

- **Brand:** Phobaxx
- **Field:** `payment_amount_usd`
- **Conflict:** Sideshift row 2 marks `payment_amount_usd: unknown_extract_from_pdf`. The amount lives inside the signed contract PDF (`Contract Agreement - Phobaxx.pdf, 153.1 kB`) which OPRAH did not download/parse.
- **Sources:**
  - sideshift row 2
- **Resolution:** AUTO-FIX recommended — Claude to read PDF and extract payment terms. If PDF lives on SideShift CDN, may require download first.

---

## C6 — Cross-brand contact "Alicia" recurrence (low priority, monitoring)

- **Brands:** MWM.ai (Alicia), MyCal AI (Alicia), Alicia Wang TBD
- **Field:** `key_contact.name`
- **Question:** Is "Alicia" the same human running 3 brand campaigns, or 3 different Alicias?
- **Sources:**
  - sideshift row 1 (Alicia → MWM.ai)
  - sideshift row 3 (Alicia → MyCal AI)
  - gmail row 10 (Alicia Wang → brand TBD)
- **Resolution:** Cannot resolve from data. Flag for Julz attention; matters for relationship management. NOT a data conflict in canonical schema (each brand row has its own `key_contact`), but a cross-row observation worth surfacing.

---

## C7 — Brkfst.io pipeline isolation (resolved)

- **Brand:** Brkfst.io (marketplace)
- **Field:** `pipeline_source`
- **Conflict:** RBG explicitly flagged Brkfst as a SEPARATE pipeline from SideShift. 8 distinct briefs in 90d through this channel. Not to be bucketed with SideShift brands.
- **Sources:**
  - gmail rows 28-35 (all from `hello@mail.brkfst.io`)
- **Resolution:** RESOLVED. Canonical schema accommodates via `pipeline_source: ["brkfst"]` array (vs `["sideshift"]`). One aggregate canonical row for Brkfst marketplace with all 8 brief_ids in `notes`. No further action.

---

## C8 — Wand referral pipeline (resolved)

- **Brand:** Wand
- **Field:** `status` / dashboard placement
- **Conflict:** Wand is a referral Julz is forwarding (not her own campaign). Dashboard should not list Wand as Julz pipeline.
- **Sources:**
  - sideshift row 23
- **Resolution:** RESOLVED. `dashboard_visible: false` on canonical row.

---

## Conflict summary (post-HOLMES Wave 2 execution, 2026-05-27)

| ID | Brand | Severity | Auto-fixable | Owner | Status |
|---|---|---|---|---|---|
| C1 | ParakeetAI | P0 | YES — Linear save_issue | Claude | ✅ RESOLVED by HOLMES — JUL-25 advanced Backlog → Done at 2026-05-28T02:22:15Z |
| C2 | MyCal AI | P1 | NO — needs brand reply | Brand (Alicia) | 🟡 OPEN — Julz can nudge if stale |
| C3 | Astor | P2 | NO — needs Julz visual | Julz | 🟡 OPEN — human visual verify |
| C4 | Monat Global | P3 | NO — categorization decision | Julz | 🟡 OPEN — categorization pref |
| C5 | Phobaxx | P1 | YES — PDF parse | Claude | 🔴 HR-10 UNRESOLVED by HOLMES — PDF not on local disk (SideShift CDN attachment only). Julz needs to download to unblock. |
| C6 | Alicia recurrence | P3 | NO — observational | Julz / monitoring | 🟡 OPEN — observational |
| C7 | Brkfst | resolved | — | done | ✅ |
| C8 | Wand | resolved | — | done | ✅ |

## HOLMES (A.14v Wave 2) execution log — 2026-05-27

**Auto-fixes shipped:**

- ✅ **C1 — ParakeetAI JUL-25 status advance:** `Backlog → Done` via Linear save_issue. Comment posted (id `1d09bf07-7664-4d1f-8358-11c3573ff6f5`). Verified via independent get_issue → status="Done", statusType="completed", completedAt=2026-05-28T02:22:15.611Z.
- ✅ **MWM.ai Linear issue:** Created JUL-26 ("MWM.ai — TikTok + IG Reels + YouTube Shorts retainer"), priority Urgent, state In Progress. 13-stage checklist mirrored from JUL-25. URL: https://linear.app/julianne/issue/JUL-26/mwmai-tiktok-ig-reels-youtube-shorts-retainer
- ✅ **Phobaxx Linear issue:** Created JUL-27 ("Phobaxx — 30 posts/month organic native"), priority Urgent, state In Progress. 13-stage checklist mirrored from JUL-25; PDF-blocked items left unchecked with HR-10 reason. URL: https://linear.app/julianne/issue/JUL-27/phobaxx-30-postsmonth-organic-native
- ✅ **Bazzaal Gmail thread (queue item 6):** Full thread extracted via Gmail MCP get_thread (thread 19d8c562599270a0). Finding: NOT a per-creator paid brief — it's a mass-blast recruitment offer requiring Google Form application (https://forms.gle/h6XGHLrCXunjzx436). Tiered-by-follower-count compensation; no public $ amounts. Min 10K followers IG/TikTok. Geos USA/UK/AU/NZ. Canonical row reclassified P1 → P2.

**HR-10 honest blockers:**

- 🔴 **C5 Phobaxx PDF (queue item 4):** SideShift CDN attachment. HOLMES Glob probes empty (`C:/Users/julia/**/Phobaxx*`, `C:/Users/julia/Downloads/**/*Phobaxx*`). No Gmail thread exists for Phobaxx. **Julz to-do:** download Phobaxx contract PDF from SideShift chat → save to local disk → re-spawn HOLMES.
- 🔴 **Elizaveta Leonova GDoc (queue item 5):** SideShift Gmail-relay truncates URL at `...` (28-char prefix only). `read_file_content` with prefix → `Entity not found`. Drive search by sender → no matches. **Julz to-do:** open SideShift chat → click GDoc link → copy full URL → paste back.

**Net auto-fix outcome:** 4 of 6 shipped, 2 HR-10 unresolved with clear unblock paths to Julz.
