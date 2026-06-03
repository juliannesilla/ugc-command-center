# Decision Support — G18 (Bolt vs Lovable) + B-18 (Hunch Rate)

> **Author:** DARWIN (Charles Darwin persona — synthesis across many sources, taxonomy) · reports to STEVE → ELON
> **Phase:** A.14y Wave 0.9 · **Date:** 2026-05-29
> **Type:** **DECISION SUPPORT — Julz decides. This document gives her the analysis + a recommended option + alternatives. It does NOT lock anything.**
> **Maps to:** CAPA-011 (G18 competitor-exclusivity) + CAPA-012 (Hunch below-floor rate) in `~/.claude/sessions/capa-registry.jsonl`
> **Skills invoked (HR-25, ≥6):** `data-quality-auditor` · `data:analyze` · `marketing-skills:marketing-skills` · `anthropic-skills:competitor-profiling` · `finance-skills:financial-analyst` · `superpowers:verification-before-completion`

---

## 🔗 QUICK LINKS

- **Canonical brand data:** `C:\Users\julia\OneDrive\Desktop\ugc-command-center\data\brands-canonical.jsonl` (Bolt = row 8, Lovable = row 18, Hunch = row 5)
- **SideShift message log:** `C:\Users\julia\OneDrive\Desktop\ugc-command-center\data\sideshift-messages.jsonl` (Hunch = line 9, Lovable = line 29)
- **Gmail brand inbox:** `C:\Users\julia\OneDrive\Desktop\ugc-command-center\data\gmail-brand-inbox.jsonl` (Bolt = line 3, Lovable = line 11, Hunch/Shubhechha = line 23)
- **Brand-fit scores:** `C:\Users\julia\OneDrive\Desktop\ugc-command-center\data\brand-fit-scores.jsonl` (Hunch = 4/10 line 10, Lovable = 9/10 line 30)
- **CAPA registry:** `C:\Users\julia\.claude\sessions\capa-registry.jsonl` (CAPA-011 = line 11, CAPA-012 = line 12)
- **SideShift threads:** Bolt `recruit:feed_1CbRAHeDQzZQmcFxovjqK7` · Lovable `recruit:feed_1CbRN9PXDguhriZCGhYpiR` · Hunch `recruit:feed_1Cb4pXT6qGwDDU1WvzdEhj` — all at https://app.sideshift.app/chat
- **Hunch Discord (action item):** https://discord.gg/3vF5QcUCNk

---

## 🟢 BOTTOM LINE

- **G18 (Bolt vs Lovable) — RECOMMENDED: Bolt-first with a ≥30-day category-exclusivity gap, then Lovable with a written carve-out.** Both are direct AI-app-builder competitors (Bolt.new and Lovable build the same thing — text-to-app). Bolt is further along (sample stage, contract promised on acceptance) and has a **near-term deliverable already owed**; Lovable is earlier (intake, terms truncated) but scored higher on fit (9/10 vs no Bolt fit score). Running both concurrently risks a competitor-exclusivity breach the moment either contract is signed. Sequence them.
- **Bolt sample to Larine Georgi — STILL LIVE BUT THE DEADLINE (May 28) HAS PASSED as of today (May 29).** Canonical row 8 shows `awaiting_julz: true`, action = "send sample video to Larine tomorrow May 28," urgency P0. The sample is a **prerequisite to even getting Bolt terms** — it is upstream of the whole sequencing decision. Recommendation: ship the Bolt sample first (it's a sample, not a signed exclusivity commitment — low risk), which naturally puts Bolt in the lead slot. Send a 1-line note to Larine re: the slipped date.
- **B-18 (Hunch rate) — RECOMMENDED: COUNTER-OFFER, do not accept as-is, do not hard-pass.** Hunch's effective per-video rate is **~$2.00/video** (their own stated structure: $100 for 50 videos/month) — that is **8x–25x below Julz's $25–$50/video baseline**. But it is the clearest *fixed-cash* offer in the dataset ($200/mo) and the rep (Shubhechha) is driving a second collab too. Counter to anchor the relationship; if they won't move off ~$2/video, it fails the floor and should be passed (or accepted only as a deliberate, eyes-open volume/portfolio play — not as a rate Julz endorses).

---

## 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW

### **1. Decide the Bolt ↔ Lovable sequence (G18 / CAPA-011)**
Pick one of three options in §1.6 below. **DARWIN recommends Option A: Bolt-first + ≥30-day gap + Lovable category carve-out.** This is a GO/NO-GO + ordering call only you can make — it commits you to a competitor in a category where exclusivity is standard.

### **2. Ship (or formally re-time) the Bolt sample to Larine Georgi**
The May 28 deadline passed. Either send the sample today with a short "ran a day behind, here it is" note, OR if you're leaning toward Option C (pass on Bolt), tell Larine you're stepping back so the thread closes clean. **Do not leave a P0 owed-deliverable silently dangling** — that's the worst outcome for the relationship.

### **3. Decide Hunch: counter / accept-as-volume / pass (B-18 / CAPA-012)**
**DARWIN recommends countering** at a number from §2.4. If you want me to draft the SideShift counter message in your voice, say the word and I'll prep it (HR — outreach voice + intake question set on file).

---

## SECTION 1 — G18: Bolt.new vs Lovable Competitor-Exclusivity Conflict (CAPA-011)

### 1.1 Why this is a conflict (the taxonomy)

Both brands occupy the **exact same product category: AI / text-to-app website-and-app builders.** This is not adjacent — it is head-to-head.

- **Bolt.new** — AI app/website builder ("prompt → working app"). Repped by **The Impressions Corporation** (agency). Canonical row 8.
- **Lovable** — AI app/website builder ("prompt → full-stack app"). Direct Bolt competitor in the same buyer's consideration set. Canonical row 18.

CAPA-011 (registry line 11) states the root cause verbatim: *"Brand-fit-engine doesn't pre-check competitor exclusivity clauses against existing signed roster before recommending GO… Bolt.new = signed, Lovable = same category = conflict surfaced only at sign-time not intake-time."*

> **🟡 Data-quality note (data-quality-auditor):** CAPA-011 line 11 says *"Bolt.new = signed."* The **canonical row 8 does NOT support that** — row 8 shows `contract_signed: false`, `status: in_negotiation`, and "contract will follow IF Julz makes program." **Neither Bolt nor Lovable is signed yet per canonical.** This is good news for sequencing: there is no live signed exclusivity to breach *today*. The conflict is **prospective**, triggered the instant *either* contract is signed. The CAPA's "signed" wording is stale/overstated vs. the source data. Confidence: 🟢 Verified against `brands-canonical.jsonl` row 8 (`contract_signed:false`).

### 1.2 Side-by-side comparison (cited to canonical rows)

| Dimension | **Bolt.new** (row 8) | **Lovable** (row 18) |
|---|---|---|
| Canonical status | `in_negotiation` | `intake` |
| Contract signed? | `false` | `false` |
| Stage | **Sample stage** — sample owed, contract promised on acceptance | **Earliest** — awaiting brand reply with full SOW |
| Payment amount | `null` — "not disclosed until program accepted" | `null` — "base pay mentioned in Gmail (truncated)" |
| Payment terms | Not disclosed | Not disclosed (only "We got base p…" captured) |
| Deliverables | 1 sample video (hook + Bolt.new product demo); "create own format = bonus" | None specified yet |
| Filming/submission deadline | **2026-05-28** (now passed) | None |
| Key contact | **Larine Georgi** (agency rep, via Impressions Corp) | **Daisy** (campaign rep) |
| Urgency | **P0** | P1 |
| `awaiting_julz` | **true** — "send sample video to Larine tomorrow May 28" | false — "awaiting brand reply" |
| Brand-fit score | **No score on file** (absent from `brand-fit-scores.jsonl`) | **9/10** — "strong-fit AI/dev tool… warm, professional thread" (line 30) |
| Honest concerns (canonical) | None logged on row 8 | `Bolt_new_sequencing_G18_conflict`, `category_exclusivity_carve_out_needed`, `full_comp_terms_pending` |
| `awaiting_brand_action` (canonical) | — | **"Send full SOW + competitor exclusivity carve-out vs Bolt.new"** |

> **🔴 HR-10 honesty — what we do NOT know (do not fabricate):** Neither brand's **payment, exclusivity clause text, usage-rights window, or term length** is in canonical. Both are `null`. We cannot compare dollar terms because **no dollar terms have been disclosed by either brand.** The Lovable Gmail row (line 11) literally truncates at *"We got base p…"*. Any sequencing decision is being made on **stage + fit + category-risk**, NOT on price (price is unknown for both). This is the honest state of the data.

### 1.3 Script / concept overlap (marketing-skills lens)

Because both products do the same thing (prompt → app), the **creative concept is nearly identical**: a talking-head/demo showing "I described an app and it built it." This *raises* exclusivity risk in two ways:

1. **Audience confusion / authenticity hit:** If @geezjulz posts "Bolt.new changed how I build" and three weeks later "Lovable changed how I build," the audience (and both brands' social teams) will notice. It reads as pay-for-play and dents creator credibility — Julz's most valuable asset.
2. **Reusable-asset collision:** A hook/format built for Bolt is the *same* hook that fits Lovable. Brands paying for UGC generally expect the creator is not simultaneously promoting the direct competitor with a mirror-image video. This is precisely what category-exclusivity clauses exist to prevent.

> **Competitor-profiling note:** In the AI-app-builder category, **category exclusivity for the campaign window is the norm, not the exception.** Lovable's own canonical row already flags it needs a "competitor exclusivity carve-out vs Bolt.new" — meaning the brand side is *already thinking about this*. Expect it to come up in the Lovable SOW.

### 1.4 Exclusivity risk assessment

| Scenario | Exclusivity risk | Notes |
|---|---|---|
| Sign Bolt, then sign Lovable **concurrent / overlapping windows** | 🔴 **High** | Near-certain breach of whichever contract carries a category-exclusivity clause. Could mean clawback, non-payment, or relationship burn with a high-profile brand. |
| Sign Bolt, then Lovable **after a ≥30-day gap** post-Bolt-window | 🟡 **Medium-Low** | Standard cooling-off. Most category-exclusivity windows are 30–90 days; a 30-day minimum gap is the floor, 60–90 is safer. Confirm each contract's actual window before posting the second. |
| Sign **only one**, pass / pause the other | 🟢 **Low** | Cleanest. Trade-off = leaving the other relationship (and its unknown $) on the table. |
| Sign Lovable **with an explicit written carve-out** naming Bolt as a permitted prior engagement | 🟡 **Low-Medium** | Viable if Lovable agrees in writing. Removes ambiguity. Depends on Lovable's willingness (their row suggests they're already considering the carve-out angle). |

### 1.5 The Larine Georgi / Bolt sample — is it still live? (explicit flag per task)

**Yes, still live — but the deadline has slipped.** Verified against canonical row 8:
- `awaiting_julz: true`
- `awaiting_julz_action: "send sample video to Larine tomorrow May 28"`
- `awaiting_julz_since: "2026-05-27"`, `urgency: "P0"`
- `deadlines.submission_by: "2026-05-28"` ← **today is 2026-05-29, so this is now 1 day overdue.**
- Notes: *"Sample stage. Brand confirmed contract will follow if Julz makes program. Julz committed to ship by 5/28."*

**How the sequencing decision affects the sample:**
- The sample is **upstream of everything.** No sample → no Bolt terms → no Bolt contract → no conflict to sequence. So the sample is **low-risk to ship regardless of the final sequencing call**: sending a sample video is *not* signing an exclusivity commitment. It just keeps the Bolt door open.
- Shipping the sample **naturally elects Bolt into the "first" slot** (Option A), because it advances Bolt while Lovable is still at intake. That is consistent with DARWIN's recommended sequence.
- **The only scenario where you should NOT send the sample** is if Julz has already decided to **pass on Bolt entirely** (Option C) — in which case send Larine a clean "stepping back" note instead of letting the P0 dangle.
- **Either way, the dangling P0 must be resolved today** (ship or formally re-time). Silence on an owed, committed, overdue deliverable is the single worst outcome — it burns a high-profile agency relationship (Impressions Corp reps multiple brands).

### 1.6 RECOMMENDATION — G18 sequencing (decision support, not decision)

> **DARWIN's recommended option is A. All three are viable; the trade-offs are laid out so Julz chooses.**

#### **★ Option A (RECOMMENDED) — Bolt-first, ≥30-day gap, then Lovable with a written carve-out**
- **Do:** Ship the Bolt sample today → if accepted, run Bolt campaign → after Bolt's posting window closes, wait ≥30 days → then open Lovable, and ask Lovable for a written carve-out acknowledging the prior Bolt engagement.
- **Why:** Bolt is further along + has an owed deliverable + is time-sensitive (P0). Lovable is at intake and explicitly expects to discuss a carve-out anyway. Sequencing captures *both* relationships while keeping exclusivity clean.
- **Trade-off:** Lovable waits. A 9/10-fit brand sits on ice for ~1 campaign cycle + 30 days. Lovable could lose interest or fill the slot with another creator. Mitigation: tell Daisy now that you're "very interested, finalizing timing, will revert with a start date" to hold the relationship warm without committing to overlapping windows.

#### **Option B — Lovable-first (higher fit), pause Bolt at sample**
- **Do:** Pursue Lovable's full SOW now (9/10 fit, warm thread); hold Bolt at sample without signing; sequence Bolt ≥30 days after Lovable's window.
- **Why:** Lovable scored 9/10 and the thread is "warm, professional." If fit/quality matters more than speed, lead with the stronger-fit brand.
- **Trade-off:** **You'd be sitting on an overdue P0 Bolt deliverable** while chasing the slower (intake-stage, terms-unknown) Lovable thread. You also forgo Bolt's near-term momentum. Higher risk of burning the Impressions Corp relationship. Weaker on the "finish what's owed" principle.

#### **Option C — Pass on one**
- **Do:** Pick the one you actually want long-term; send the other a clean, relationship-preserving "not right now / let's stay in touch" (mirror the Granola precedent — row 7, declined but asked to stay in network).
- **Why:** Zero exclusivity risk, zero juggling, full creative focus on one brand. Cleanest for credibility.
- **Trade-off:** Leaves an unknown-but-possibly-good payday on the table. Given **both brands' terms are still `null`**, passing now is passing *blind* — you'd be declining before knowing the money. DARWIN's view: **don't pass blind.** Prefer A or B until at least one set of real terms is on the table.

> **Cross-cutting caveat (verification-before-completion):** All three options assume category-exclusivity clauses *exist* in these contracts. **We have not seen either contract.** Before Julz signs *anything*, the actual exclusivity clause text + window length must be read (HR-1 cite the clause). The CAPA-011 corrective action — "Add G18-competitor-exclusivity-check as mandatory gate BEFORE recommending GO" — is the systemic fix; this doc is the one-time decision support while that gate is built.

---

## SECTION 2 — B-18: Hunch Rate Decision (CAPA-012)

### 2.1 What Hunch is offering (cited to canonical row 5)

Verbatim from `brands-canonical.jsonl` row 5, `payment_terms_note`:
> *"Up to $200/month = $100 for 50 videos/month + $100 for 30-day consistent daily posting + $2 CPM bonus after 5K views + $20 joining bonus"*

Structured fields (row 5):
- `payment_amount_usd: 200` (monthly ceiling), `bonus_amount_usd: 20` (joining), `payment_terms_days: 30`
- `deliverables`: **50 videos/month, daily, TikTok (fresh account)**, "replicate hooks from Hunch team"
- `key_contact`: alivetwister31 / **Shubhechha** · `urgency: P0` · `awaiting_julz: true`
- Action: "respond to follow-up + join Discord + schedule setup call"
- `fit_score: 4` (also confirmed in `brand-fit-scores.jsonl` line 10: *"consumer/social app… needs more intake"*)
- Canonical `honest_concerns`: `hook_replication_voice_conflict`, `identity_bleed_risk_to_geezjulz`, `low_pay_relative_to_brand_safety_risk`
- Gmail corroboration (line 23, Shubhechha thread): *"You can earn up to $200/month fixed j…"* — confirms the $200/mo ceiling. 🟢 Verified across two sources.

### 2.2 The math — effective per-video rate vs Julz's baseline (finance-skills:financial-analyst)

**Julz baseline (per CAPA-012 line 12):** $25–$50 per video.

**Hunch effective rate** — three honest ways to cut it, because "up to $200" is a *ceiling*, not a guarantee:

| Calculation basis | Monthly $ | Videos/mo | **Effective $/video** | vs. $25 floor | vs. $50 ceiling |
|---|---|---|---|---|---|
| **Pure video pay** ($100 for 50 videos) | $100 | 50 | **$2.00** | **12.5x below** | **25x below** |
| **Video + consistency bonus** ($100 + $100, both fully earned) | $200 | 50 | **$4.00** | **6.25x below** | **12.5x below** |
| **Everything incl. $20 joining (month 1 only)** | $220 | 50 | **$4.40** | 5.7x below | 11.4x below |
| **+ CPM bonus** ($2 CPM after 5K views) | variable | 50 | only material **if videos reliably clear 5K+ views** | depends on virality | depends on virality |

**Reading the math (this matches the task's "$2–$4/video" framing exactly):**
- The realistic floor is **$2.00/video** (just the video pay). The realistic ceiling for guaranteed cash is **$4.00/video** (video + consistency bonus). The $20 joining bonus is one-time.
- To even *reach* Julz's **bottom** baseline of $25/video at 50 videos, Hunch would need to pay **$1,250/month** — i.e., **6.25x their current $200 ceiling.**
- CPM bonus ($2 per 1,000 views above 5K) only becomes meaningful at real scale. On a **fresh** TikTok account (their requirement), early videos rarely clear 5K views, so the CPM upside is speculative for months. Do not bank on it.

> **🟡 Effort/risk overlay (this is the real cost):** 50 videos/month = **~1.67 videos every single day, daily, on a brand-new account, replicating someone else's hooks.** That last part directly triggers the canonical `hook_replication_voice_conflict` + `identity_bleed_risk_to_geezjulz` concerns. So Julz isn't just paid $2–$4/video — she's paid $2–$4/video to produce at punishing volume in a voice that isn't fully hers, on an account that doesn't build her own brand equity. The **risk-adjusted** rate is worse than the headline.

### 2.3 Brand-fit context (data:analyze)

- Hunch fit = **4/10** — the **lowest-but-one** scored brand with terms in the dataset. For contrast: Lovable 9, Veed 9 ($650+$100 for 60 = ~$12.50/video), MyCal 8, MWM 7.
- Hunch's $2–$4/video sits **far below** even the *other* low-cash offers: Astor (row 25) is $5/video + $1/1k CPM — and Astor is already a low anchor. **Hunch is below the lowest.**
- The one genuine positive: it is the **clearest fixed-cash, no-ambiguity offer in the dataset** ($200/mo stated plainly, twice, across SideShift + Gmail). Most other rows are `null` on payment. Certainty has *some* value — but not at 6–25x below floor.

### 2.4 RECOMMENDATION — Hunch (decision support, not decision)

> **DARWIN's recommended option is "Counter." All three laid out with trade-offs.**

#### **★ Option 1 (RECOMMENDED) — COUNTER-OFFER**
- **Suggested anchor:** Counter to **$500/month for 50 videos = $10/video** as the opening ask (still below her $25 floor, but a **5x improvement** on their $2 and a realistic landing zone for a volume deal), **OR** hold firm at the **$25/video floor** ($1,250/mo) and let them counter. A middle settle around **$8–$12/video** would be a defensible volume rate.
- **Alternative structure to propose:** Fewer videos at a real rate — e.g., **15 videos/month at $20/video = $300/mo** — which protects Julz's time and voice while beating their cash ceiling. This reframes from "content farm" to "quality creator."
- **Why:** Keeps a warm, clear-offer relationship alive (Shubhechha is also driving a 2nd collab — RBG/Gmail line 23), tests whether there's real budget, and costs nothing but one message. **Anchoring high is free.**
- **Trade-off:** They may say no / ghost. That's an acceptable outcome — it converts to Option 3 (pass) cleanly.

#### **Option 2 — ACCEPT AS A DELIBERATE VOLUME / PORTFOLIO PLAY**
- **Do:** Accept ~$2–$4/video *eyes-open*, treating it as paid reps + a fresh-account growth experiment + CPM lottery ticket — NOT as an endorsed rate.
- **Why:** Only makes sense IF Julz specifically wants high-volume practice on a throwaway account and the $200/mo is "free money on content I'd batch anyway."
- **Trade-off:** 🔴 Violates the $25–$50 floor by 6–25x. Burns ~50 videos/mo of capacity that could go to **Veed ($650+$100/60≈$12.50/vid, 9-fit)** or other better-paying signed work. Triggers voice-conflict + identity-bleed risk to her real @geezjulz brand. DARWIN does **not** recommend this unless Julz explicitly values the volume reps over the opportunity cost.

#### **Option 3 — PASS (relationship-preserving)**
- **Do:** Decline politely, ask to stay in network for future higher-budget campaigns (Granola precedent, row 7).
- **Why:** Cleanest defense of the rate floor. Frees 50 videos/mo of capacity for better-fit, better-paid work.
- **Trade-off:** Forgoes a guaranteed $200/mo and a warm rep relationship. Slightly premature — **countering first (Option 1) is strictly better** because it preserves the option to pass *after* learning whether budget exists.

> **CAPA-012 systemic context (line 12):** The corrective action is to *"Add UGC pricing-floor rule to memory ($25–$50/video baseline); extend brand-fit-engine to auto-flag below-floor offers with Julz-override prompt"* — mirroring the existing **jobs salary-floor** rule ($85k floor). This Hunch decision is the **first live test** of that floor. Whatever Julz decides, the floor-check should fire automatically on every future intake so this never has to be hand-caught again.

---

## SECTION 3 — Cross-Link & Provenance

- **CAPA-011** (Bolt vs Lovable competitor-exclusivity) — `~/.claude/sessions/capa-registry.jsonl` line 11. Status: CONTAINMENT. Owner: WHITNEY. `blocker_for: "Lovable sign"`. Target close 2026-07-19. This doc supplies the one-time decision support; the permanent fix is the G18 mandatory exclusivity gate in the brand-fit-engine.
- **CAPA-012** (Hunch below-floor rate) — `~/.claude/sessions/capa-registry.jsonl` line 12. Status: CONTAINMENT. Owner: WHITNEY. `blocker_for: "Hunch sign"`. `cross_linked_to: "jobs-salary-formula memory rule (same root-cause class)"`. Target close 2026-07-19.

### Data-quality findings surfaced during this analysis (HR-26 — problems ship with fixes)

| # | Finding | Confidence | Recommended fix |
|---|---|---|---|
| DQ-1 | **CAPA-011 says "Bolt.new = signed"; canonical row 8 says `contract_signed:false`.** Stale/overstated. | 🟢 Verified | Amend CAPA-011 root-cause text to "Bolt = in_negotiation/sample-stage" so the containment isn't premised on a non-existent signature. (Owner: WHITNEY.) Lowers urgency from "active breach" to "prospective." |
| DQ-2 | **Bolt has no row in `brand-fit-scores.jsonl`** (Lovable + Hunch both scored). Asymmetric data — we're sequencing a brand we never fit-scored. | 🟢 Verified | Run the AI brand-fit scorer on the Bolt thread before any GO decision, so Bolt vs Lovable is an apples-to-apples fit comparison. |
| DQ-3 | **Bolt + Lovable payment, exclusivity clause, term length, usage window all `null`.** No price data for either. | 🟢 Verified | Do not sign either on incomplete terms (HR-50 NO PARTIAL applies to *their* SOWs too). Capture full terms before GO. Lovable's own row already lists `full_comp_terms_pending`. |
| DQ-4 | **Bolt sample deadline (2026-05-28) is past** as of 2026-05-29; P0 owed-deliverable dangling. | 🟢 Verified | Resolve today — ship sample or formally re-time with Larine. (Action item #2 above.) |
| DQ-5 | Hunch CPM upside ($2/1k after 5K views) is **non-material on a fresh account** for months. | 🟡 Likely | Exclude CPM from the guaranteed-rate math; treat as speculative upside only. (Reflected in §2.2.) |

---

*Decision support compiled by DARWIN from canonical sources only (HR-1, HR-49 — no mock data). Where terms are unknown, that is stated honestly rather than estimated (HR-10). Julz decides; this document does not lock any choice (HR-4 smallest interpretation — analysis + options, nothing built or committed).*
