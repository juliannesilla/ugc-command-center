# Brands Canonical — DARWIN Merge Summary

**Generated:** 2026-05-27 by DARWIN (sub-agent V6, A.14v Wave 2)
**Sources:** sideshift-canonical.jsonl (OPRAH, n=34) + gmail-brand-inbox.jsonl (RBG, n=35) + linear-pipeline-canonical.jsonl (ADA, n=1)
**Output:** `data/brands-canonical.jsonl` (1 header + 41 brand rows = 42 lines)

---

## 🟢 BOTTOM LINE

41 unique brands canonicalized across SideShift, Gmail direct, Brkfst marketplace, and Linear. **3 signed contracts** (MWM.ai, Phobaxx, ParakeetAI). **10 P0 awaiting-Julz actions** (Bolt sample, CA Campaign sign, Hunch reply, Triips reply, Blint sample, Aniwell sample, Megprime GC examples, Tsenta call, Veed.io call, Sherlock call, Masterhooks call, MWM.ai GTM kickoff, Phobaxx GTM kickoff). **1 confirmed paid** brand (Monat $54.40 MLM, 3 deposits). **5 conflicts** flagged. **5 auto-fix items** ready for Claude execution.

## 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW

1. **Tomorrow (May 28) — Bolt.new sample video** to Larine Georgi (Julz committed)
2. **By Friday (May 29) — Megprime Pay** GC examples (brand deadline)
3. **Wed May 27** — discovery calls: Tsenta 8:15 AM, Veed.io 10:40 AM PDT
4. **Thu May 28** — discovery calls: Masterhooks 10:00 AM, Sherlock 2:30 PM
5. **Now-ish** — sign CA Campaign contract (12 days awaiting)
6. **Now-ish** — respond to Hunch (Discord join + setup call)
7. **Now-ish** — respond to Triips founder Omar (selected)
8. **Now-ish** — send sample videos: Blint (20-30s) + Aniwell
9. **Today (May 27)** — MWM.ai GTM strategy + first batch (committed)
10. **Today (May 27)** — Phobaxx GTM strategy kickoff (committed)

---

## Counts

| Metric | Count |
|---|---|
| Total unique brands | 41 |
| Signed contracts | 3 (MWM.ai, Phobaxx, ParakeetAI) |
| Awaiting Julz (any urgency) | 14 |
| Awaiting Julz P0 | 10 |
| Paid brands (90d) | 1 (Monat — $54.40 total) |
| Closed / declined | 3 (Granola, Nomysh, Wand-referral) |
| Conflicts flagged | 5 |
| Auto-fix queue (Claude-actionable) | 5 |
| Linear status drift detected | 1 (JUL-25 ParakeetAI) |

## Pipeline source breakdown

| Source | # Brands |
|---|---|
| sideshift | 34 |
| gmail-direct (via sideshift relay) | 24 (overlap w/ sideshift) |
| gmail-direct (true direct, not via sideshift) | 4 (Bazzaal, Nomysh, LTK, Monat) |
| brkfst marketplace | 1 entry aggregating 8 briefs |
| linear-direct | 1 (ParakeetAI / JUL-25) |
| imessage | 1 (Chance AI moved off-band) |

## Status distribution

| Status | Count | Brands |
|---|---|---|
| signed | 3 | MWM.ai, Phobaxx, ParakeetAI |
| paid | 1 | Monat Global |
| submitted | 1 | ParakeetAI (also signed) |
| contract_pending_julz | 3 | MyCal AI, Loopsy, CA Campaign |
| awaiting_julz (sample/action) | 6 | Hunch, Blint, Aniwell, Megprime, Triips, Natural Write |
| in_negotiation | 18 | Goodie AI, Bolt.new, Tsenta, Masterhooks, Sherlock, Veed, Heyoka, KarmaTech, Minee Wipes, Chance AI, Astor, madduck, HiveScales, Lollapaloozalab, Project Bullhorn, EnterMaurs, Lotus Shop, PromptArmor |
| intake | 6 | Momentary, Lovable, Elizaveta Leonova, Alicia Wang, Bazzaal, LTK |
| closed/declined | 3 | Granola, Nomysh, Wand |
| brkfst marketplace (separate) | 1 (8 briefs) | Brkfst.io |

## Auto-fix queue (HR-38 — Claude-actionable, no Julz needed)

| Action | Command | Target | Justification |
|---|---|---|---|
| Create Linear issue | `save_issue` | MWM.ai campaign hub w/ 13-stage checklist | signed contract not in Linear |
| Create Linear issue | `save_issue` | Phobaxx campaign hub w/ 13-stage checklist | signed contract not in Linear |
| Extract PDF payment | `read_pdf` | Contract Agreement - Phobaxx.pdf | resolve unknown payment_amount |
| Advance Linear status | `save_issue` | JUL-25 status: Backlog → Done/Closed | ADA-caught drift (13/13 done) |
| Open GDoc brief | `read_gdoc` | Elizaveta Leonova GDoc | resolve brand identity + payment |
| Open Gmail thread | `get_thread` | Bazzaal thread 19d8c562599270a0 | extract full payment terms |

## Top 5 conflicts (full log: `darwin-conflicts-log.md`)

1. **JUL-25 ParakeetAI status drift** — Linear=Backlog, but description shows 13/13 stages + already submitted (ADA catch)
2. **MyCal AI payment** — message body says $25/$150, agreement says $300/$1000 (agreement wins per Julz)
3. **Astor thread-inversion** — OPRAH flagged Julz may have been speaking AS Astor brand rep, not creator
4. **Monat = MLM not UGC** — categorically different pipeline; dashboard placement decision needed
5. **Phobaxx payment unknown** — inside PDF, HR-10 honest "null with reason"

## Schema (per brand row)

```
brand_id · brand_name_canonical · aliases[] · pipeline_source[] ·
contract_signed (bool) · contract_signed_at · contract_link ·
status · dashboard_visible (bool) ·
payment_amount_usd · payment_terms_days · bonus_amount_usd · payment_terms_note ·
deliverables[] · deadlines{filming_by, submission_by, payment_by} · do_not_say[] ·
key_contact{name, email, role, channel} ·
last_msg_at · last_msg_direction ·
awaiting_julz (bool) · awaiting_julz_action · awaiting_julz_since · urgency (P0-P3) ·
sources{sideshift, gmail, linear} · conflicts[] ·
linear_status_drift (bool) · auto_fix_recommended[] · notes
```

## Cross-source recurrences (notable contacts across multiple brands)

- **Alicia** → MWM.ai (signed) + MyCal AI + (possibly) Alicia Wang TBD. Same human? Cross-check needed.
- **Shubhechha (alivetwister31)** → Hunch + new collab thread (Gmail row 24). Same rep, multiple campaigns.
- **Larine Georgi** → Bolt.new (via Impressions Corp). Listed under both contact-name and brand-name in Gmail.
- **Royce Um** → MERGED into Astor (identical $5+$1/1k payment structure confirmed brand rep relationship).

## Verification (HR-19 + superpowers:verification-before-completion)

- Lines in JSONL: `wc -l` = 42 (1 schema header + 41 brand rows) ✅
- Source citations: every row has `sources.sideshift` OR `sources.gmail` OR `sources.linear` ✅
- HR-10 honest: 8 fields marked `null` w/ reason (Phobaxx $, Bazzaal $, etc.) ✅
- Auto-fix queue: 6 items, all Claude-actionable, no false-defer ✅
- Conflicts: 5 documented separately ✅
