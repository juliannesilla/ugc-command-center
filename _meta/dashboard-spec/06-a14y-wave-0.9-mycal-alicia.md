# Decision Support — MyCal + "Alicia" Identity-Overlap Reconciliation

> **Author:** OPRAH (Oprah Winfrey persona — reading conversations + relationships across sources) · reports to MARIE → ELON
> **Phase:** A.14y Wave 0.9 · **Date:** 2026-05-29
> **Type:** **DECISION SUPPORT — Julz decides. This document gives her the evidence, a probability score, and a recommended low-risk action. It does NOT lock anything or message any brand.**
> **Maps to:** CAPA-013 (MyCal payment-terms conflict) + CAPA-014 (same-person-on-multiple-campaigns exclusivity risk) in `~/.claude/sessions/capa-registry.jsonl`
> **Skills invoked (HR-25, ≥6):** `anthropic-skills:meeting-analyzer` · `data-quality-auditor` · `common-room:contact-research` · `legal:review-contract` · `marketing:competitive-brief` · `superpowers:verification-before-completion`

---

## 🔗 QUICK LINKS

- **Canonical brand data:** `C:\Users\julia\OneDrive\Desktop\ugc-command-center\data\brands-canonical.jsonl` (MWM.ai = row/line 2 · MyCal = row/line 4 · Alicia Wang TBD = row/line 37)
- **SideShift canonical (screenshot-verified):** `C:\Users\julia\OneDrive\Desktop\ugc-command-center\data\sideshift-canonical.jsonl` (MWM.ai = line 1 · MyCal = line 3)
- **SideShift raw messages:** `C:\Users\julia\OneDrive\Desktop\ugc-command-center\data\sideshift-messages.jsonl` (MyCal "send brief" = line 23; **NOTE: string "Alicia" does NOT appear in raw bodies — see §1.4**)
- **Gmail brand inbox:** `C:\Users\julia\OneDrive\Desktop\ugc-command-center\data\gmail-brand-inbox.jsonl` ("Alicia" = line 10 [Alicia Wang] + line 16 [Alicia, MyCal thread])
- **Brand-fit scores:** `C:\Users\julia\OneDrive\Desktop\ugc-command-center\data\brand-fit-scores.jsonl` (**"Alicia" absent — 0 hits**)
- **DARWIN conflicts log:** `C:\Users\julia\OneDrive\Desktop\ugc-command-center\data\darwin-conflicts-log.md` (C2 = MyCal payment conflict, line 26-31 · C6 = Alicia recurrence, line 69-78)
- **CAPA registry:** `C:\Users\julia\.claude\sessions\capa-registry.jsonl` (CAPA-013 = line 13 · CAPA-014 = line 14)
- **SideShift threads:** MWM.ai `recruit:feed_1CbPF6Rmma2TRmjUrE1rV3` · MyCal `recruit:feed_1CbC9wUNoYfXnUz8tH8mo8` — both at https://app.sideshift.app/chat
- **Companion decision doc (same wave):** `06-a14y-wave-0.9-g18-bolt-lovable-hunch.md`

---

## 🟢 BOTTOM LINE

- **Probability the MyCal "Alicia" and the MWM.ai "Alicia" are the SAME person: 0.65 (moderate-likely, NOT confirmed).** Same first name, same channel (SideShift recruiter relay), same role ("campaign manager"), same recruiter playbook (brief + agreement → onboard), and both onboarded inside the **same ~24-hour window (2026-05-26)**. That cluster of matches is more than coincidence — but there is **no shared email, no shared handle, and no portrait** to push it to certainty. "Alicia" is a common name and agency recruiters often work one brand each, so I am explicitly capping this at 0.65, not 0.9+.
- **There is also a THIRD Alicia — "Alicia Wang" (brand TBD, gmail line 10 / canonical row 37) — and she is most likely a DIFFERENT person.** She has a last name ("Wang"), a distinct SideShift thread, and a brand that's still hidden in chat. Probability Alicia-Wang = MyCal/MWM Alicia: **~0.30 (lower).** Do not assume all three are one human.
- **🔴 HR-10 honesty flag — the name "Alicia" does NOT appear in the raw SideShift message bodies (`sideshift-messages.jsonl`).** It lives only in the *parsed* `contact_name` field of the canonical + gmail layers, captured via screenshot-read. So the identity match rests on **screenshot-derived metadata, not on a raw message string I can re-grep.** That is a real limitation and the single biggest reason the score isn't higher. Only Julz opening the two SideShift threads can confirm it.
- **MyCal payment conflict (CAPA-013) is REAL and unresolved: chat says `$25 @ 100K views / $150 @ 1M views`; the formal agreement says `$300 @ 100K / $1000 @ 1M`.** That's a **12x gap** on the bonus tier. Julz's standing directive (DARWIN log C2) is "agreement is source of truth" → so the canonical `payment_terms_note` already uses the $300/$1000 numbers. But this has **never been confirmed back to the brand**, and MyCal is `contract_pending` — she should not sign until Alicia confirms in writing which number is real.
- **Exclusivity risk (CAPA-014) is LOW TODAY because neither brand is a competitor of the other, AND only MWM is signed.** MyCal = AI calorie/wellness tracker. MWM.ai = AI creative/app tool (`create.mwm.ai`). **Different categories → no category-exclusivity breach** even if it's one Alicia. The real risk if it's one person is softer: **rate-anchoring leakage** (she'll see Julz took MWM's $50/5-posts retainer and may hold MyCal's terms down) and **over-concentration** (one recruiter relationship gating two of Julz's deals). Recommended action is **clarify, don't firewall** — a separate creator account is overkill here.

---

## 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW

### **1. Confirm the Alicia identity by opening BOTH SideShift threads (5-minute human check)**
Open MWM.ai (`recruit:feed_1CbPF6Rmma2TRmjUrE1rV3`) and MyCal (`recruit:feed_1CbC9wUNoYfXnUz8tH8mo8`) at https://app.sideshift.app/chat and look at the **profile name + avatar + handle** on each. If they're the same person, you'll know instantly. This is the ONE thing only you can do — Claude cannot foreground the SideShift panel (same gated-portal limitation that blocked the MWM + Phobaxx PDFs). Tell me the answer and I'll lock CAPA-014 closed.

### **2. Do NOT sign MyCal until Alicia confirms the payment number in writing**
The bonus tier is ambiguous by 12x ($150 vs $1000 at 1M views). Reply in the MyCal thread asking her to confirm which figure governs — the chat message or the agreement. **Recommended ask (your voice, ready to send if you say go):** *"Quick clarification before I sign — the brief mentions $25 at 100K / $150 at 1M views, but the agreement lists $300 at 100K / $1000 at 1M. Can you confirm which figures are correct so we're aligned?"* If you want, I'll draft the full message with your standard sign-off.

### **3. Decide the relationship posture IF it's one Alicia (pick one)**
- **(A) Proceed normally — RECOMMENDED.** Different product categories = no exclusivity conflict. Just be aware she sees both your rate cards; hold MyCal's terms on their own merit, don't let the $50 MWM retainer anchor you down.
- **(B) Keep terms-talk firewalled per thread.** Negotiate each brand in its own thread, don't reference one deal's pay in the other. Zero extra setup. Use this if you want to protect MyCal's higher per-post economics.
- **(C) Separate creator account.** Only if MyCal's *agreement* later turns out to contain a category-exclusivity clause that names competitors. **Not warranted on current evidence** — flagged only for completeness.

---

## SECTION 1 — Who is "Alicia"? (Identity Cross-Reference)

### 1.1 Every "Alicia" mention in the data (cited to exact grep hits)

I grepped `sideshift-messages.jsonl` and `gmail-brand-inbox.jsonl` case-insensitively for "Alicia," then cross-referenced canonical + SideShift-canonical + brand-fit + the conflicts log. Full inventory:

| # | Source + exact location | "Alicia" string | Brand thread | Timestamp | Role / context |
|---|---|---|---|---|---|
| 1 | `gmail-brand-inbox.jsonl` **line 10** | "Alicia Wang" | brand TBD | 2026-05-27T16:24:16Z | SideShift relay; "Excited to have you on board. Here is a detailed bri…" — onboarded, brief incoming |
| 2 | `gmail-brand-inbox.jsonl` **line 16** | "Alicia" | MyCal (thread_id `19e64d2e67dde35c`) | 2026-05-26T15:06:43Z | SideShift relay; "Great questions — here is everything you need to know…" — onboarding Q&A |
| 3 | `brands-canonical.jsonl` **line 2** (MWM.ai) | "Alicia" | MWM.ai | last_msg 2026-05-28 | `key_contact.role: "campaign manager"`, `channel: sideshift`, email `null` |
| 4 | `brands-canonical.jsonl` **line 4** (MyCal) | "Alicia" | MyCal | last_msg 2026-05-26 | `key_contact.role: "campaign manager"`, `channel: sideshift`, email `null` |
| 5 | `brands-canonical.jsonl` **line 37** (Alicia Wang TBD) | "Alicia Wang" | brand TBD | last_msg 2026-05-27 | `key_contact.role: "campaign manager"`, `channel: sideshift relay`, email `null` |
| 6 | `sideshift-canonical.jsonl` **line 1** (MWM.ai) | "Alicia" / handle "AW" | MWM.ai | last_msg 2026-05-26 | `contact_handle: "AW"`; msg "Hi Alicia, Thank you again for this opportunity…" |
| 7 | `sideshift-canonical.jsonl` **line 3** (MyCal) | "Alicia" | MyCal | last_msg 2026-05-26 (4:48 PM) | msg "Hi Alicia, Thank you so much for sending everything over…" |
| 8 | `darwin-conflicts-log.md` **C6, lines 69-78** | "Alicia" (×3) | MWM + MyCal + Wang TBD | logged A.14v | Cross-brand recurrence already flagged P3-observational |

### 1.2 What MATCHES (evidence FOR same person — MyCal ↔ MWM)

🟢 **Verified against the data:**
- **Same first name** — "Alicia" verbatim on both MWM canonical (line 2) and MyCal canonical (line 4), and on both SideShift-canonical rows (lines 1, 3).
- **Same channel** — both via SideShift recruiter relay (`notifications@mail.sideshift.app`), not direct email.
- **Same role string** — both `key_contact.role: "campaign manager"`.
- **Same recruiter playbook** — both threads follow the identical arc: send brief + agreement → "excited to have you on board" / "here's everything you need to know" → onboard. The MWM thread (SideShift line 1) and MyCal thread (SideShift line 3) read like the **same operator running the same script** (meeting-analyzer lens: identical opening structure, identical onboarding cadence).
- **Same time window** — MWM signed 2026-05-26; MyCal last brand contact 2026-05-26; Alicia Wang onboarded 2026-05-27. All three cluster in a 48-hour band, consistent with one recruiter working a batch.
- **MWM handle "AW"** (SideShift line 1) — initials **A**licia **W**ang. This is the strongest single clue: it **links the MWM "Alicia" to the surname "Wang"** that otherwise only appears on the gmail-line-10 / canonical-row-37 record. If "AW" = Alicia Wang, then MWM-Alicia and Wang-TBD-Alicia may be the same, which by transitivity pulls MyCal in too.

### 1.3 What does NOT match / stays ambiguous (evidence AGAINST, or unknown)

🔴 **Honest uncertainty (data-quality-auditor + HR-10):**
- **No shared email** — all three rows have `email: null`. Cannot match on the most reliable identifier (contact-research's #1 lookup key is email; we have none).
- **No shared handle across all three** — only MWM carries a handle ("AW"); MyCal canonical has no handle; Alicia Wang's handle isn't captured.
- **No portrait / avatar captured** — the one visual disambiguator a human would use isn't in the dataset.
- **Different SideShift channel IDs** — MWM `…1CbPF6Rmma2TRmjUrE1rV3` vs MyCal `…1CbC9wUNoYfXnUz8tH8mo8`. Different channels are *expected* even for one recruiter (one feed per brand), so this is **neutral, not disconfirming** — but it means the system literally treats them as separate intakes.
- **"Alicia" is a common first name** — base-rate caution. Agency/recruiter networks (SideShift is a creator-recruiting marketplace) can easily have multiple Alicias.
- **MyCal vs Wang surname** — MyCal canonical says just "Alicia" (no surname); "Wang" only attaches firmly to the brand-TBD record. We're **inferring** the surname onto MyCal, not reading it.

### 1.4 🔴 THE KEY LIMITATION (why I can't score higher) — HR-10

**The raw message bodies do not contain the name "Alicia."** My case-insensitive grep of `sideshift-messages.jsonl` for "Alicia" returned **zero hits**. A second grep for `Alicia|mwm|MyCal|calorie` surfaced only **line 23** — a MyCal thread message reading *"You: Yes please send the brief over!"* — which contains **no contact name at all**.

What this means: the "Alicia" identity is stored in the **parsed `contact_name` metadata field** of the canonical and gmail layers (`verified: "screenshot_read"`), **not** in any raw, re-greppable message text. So the identity-match evidence is **one analyst's screenshot transcription removed**, not a primary string I can independently re-verify by search. I am being explicit per HR-10: *I am matching on screenshot-derived field values, and I cannot prove from the raw logs that the brand actually typed "Alicia" in either thread.* This is the honest ceiling on confidence.

### 1.5 Probability score (0–1) — with reasoning

| Pair | Probability SAME person | Confidence basis |
|---|---|---|
| **MyCal "Alicia" ↔ MWM.ai "Alicia"** | **0.65** | Strong: name + channel + role + identical recruiter script + same 48h window. Weak: no email/handle/portrait match; "Alicia" common; evidence is screenshot-metadata not raw text (§1.4). |
| **MWM.ai "Alicia" ↔ "Alicia Wang" (TBD)** | **0.55** | The "AW" handle on MWM (line 1) = initials of "Alicia Wang." Suggestive but the brand-TBD record is a separate thread/intake; could be coincidental initials. |
| **MyCal "Alicia" ↔ "Alicia Wang" (TBD)** | **0.30** | Weakest leg. Only connects via the MWM bridge; "Wang" never firmly attaches to MyCal. |
| **All THREE are one person** | **~0.25** | Requires every leg to hold; the weakest leg (MyCal↔Wang, 0.30) caps the joint probability. More likely: MyCal+MWM are one Alicia and Alicia Wang is a coincidental second. |

**OPRAH's read (relationship lens):** The most probable real-world scenario is **two distinct Alicias** — (a) one recruiter ("Alicia," possibly "Alicia W.") running BOTH MyCal and MWM as her brand book, and (b) "Alicia Wang" as a *separately-named* contact who *may* be that same recruiter using her full name on a third brand, or may be an unrelated person. I would not bet the farm on either reading. **0.65 on the MyCal↔MWM pair is the number Julz should act on.**

### 1.6 How Julz confirms (the only path to certainty)

Per CAPA-015 + CAPA-016 (gated-portal limitations), Claude cannot foreground the SideShift conversation panel. **A 5-minute human check resolves this instantly:** open both threads, compare profile name + avatar + handle. If they match → it's one Alicia, update both canonical rows' notes, close CAPA-014. If they differ → log as distinct, close CAPA-014 as false-alarm. Either way, surface the answer and I'll reconcile the canonical records.

---

## SECTION 2 — MyCal Payment-Terms Conflict (CAPA-013)

### 2.1 What's KNOWN (🟢 verified against canonical + SideShift + conflicts log)

- **Deliverables are clear and consistent across both layers:** 20-video trial; either *10 unique videos cross-posted to TikTok+IG* OR *20 videos on one platform*; pacing up to 2/day; 7-day post-live measurement window. (canonical row 4 `deliverables`; SideShift line 3 `deliverables`.)
- **Status:** `contract_signed: false`, `status: "contract_pending_julz"`, `contract_status: "prospect_terms_known_contract_pending"`. **Not signed.** (canonical row 4.)
- **Fit score:** 8/10 (canonical row 4 `fit_score`). High-fit prospect — worth saving.
- **Julz's last message:** *"Hi Alicia, Thank you so much for sending everything over — I really appreciate it! I reviewed the brief and agreement, and I am definitely interested in moving forward."* (SideShift line 3.) She has signaled intent but **has not signed.**

### 2.2 What's AMBIGUOUS / IN CONFLICT (🔴 the live issue)

The **bonus tier disagrees between two ingested sources** (DARWIN log C2, lines 26-31):

| Source | 100K views | 1M views |
|---|---|---|
| **Initial chat message body** | **$25** | **$150** |
| **Formal agreement body** | **$300** | **$1,000** |

That is a **12x discrepancy at the 1M tier** ($150 vs $1,000) and **12x at 100K** ($25 vs $300). This is not a rounding error — it's a material, contract-grade conflict. The canonical row records it verbatim in `payment_terms_note` and flags it in `honest_concerns: ["payment_conflict_25_vs_300_1000", …]`.

**Current system handling (per Julz's standing directive):** DARWIN log C2 records Julz's rule *"agreement is source of truth"* → so canonical `payment_terms_note` already leans on the $300/$1000 agreement figures, and the conflict is held `🟡 OPEN — needs brand reply` (DARWIN summary table line 109: *"C2 | MyCal AI | needs brand reply | Brand (Alicia) | OPEN — Julz can nudge if stale"*). **No auto-fix was applied** — correctly, because it needs brand confirmation, not a Claude guess.

### 2.3 Why it matters (legal:review-contract lens)

- **Payment-terms ambiguity is a Tier-1 / must-resolve item before signature.** Per the review-contract playbook, you never sign with two conflicting compensation figures live — whichever the brand later enforces, you're exposed to the *lower* one if the chat message is deemed the controlling representation.
- **The agreement normally controls** (a signed integrated agreement supersedes prior chat), which is *good* for Julz here since the agreement has the higher numbers. **But** if the agreement contains a merger/entire-agreement clause AND the brand later claims the $300/$1000 was a typo, Julz wants the brand's written confirmation *on record in the thread* before she signs — that confirmation becomes part of the negotiation record.
- **This is a "clarify in writing, then sign" situation, not an escalate-to-counsel situation.** Low legal complexity; just don't sign blind.

### 2.4 Recommended clarification path

1. **Reply in the MyCal SideShift thread** (do not sign yet) asking Alicia to confirm which bonus figures govern. Draft offered in 🔴 Action #2 above.
2. **Get it in writing in-thread** so the confirmation is captured on the next SideShift poll into canonical.
3. **Then sign** once the number is locked — and have me update canonical `payment_amount_usd` / `bonus_amount_usd` from `null` to the confirmed figures (they're currently `null`, which is correct given the unresolved conflict — HR-50 note: these stay `null` until the brand confirms, *not* filled with a guess).

---

## SECTION 3 — Exclusivity / Same-Recruiter Risk (CAPA-014)

### 3.1 The risk, stated precisely

CAPA-014 (registry line 14) flags: *"No same-person-on-multiple-campaigns check before signing competing brand."* The worry is that if one "Alicia" runs both MyCal and MWM, Julz could be (a) breaching a category-exclusivity clause, or (b) over-exposed to one recruiter relationship, or (c) rate-anchored across deals.

### 3.2 Why the EXCLUSIVITY leg is LOW risk today (🟢 verified)

- **MyCal and MWM are in DIFFERENT product categories.** MyCal = AI calorie/nutrition/wellness tracker (canonical row 4, `honest_concerns` reference "wellness_category_no_weight_loss_claims"). MWM.ai = AI creative/app tool with required link `create.mwm.ai` (SideShift line 1 `required_links`). **They do not compete.** A standard category-exclusivity clause ("don't promote competing [calorie trackers / creative tools]") would **not** be tripped by holding both.
- **Only MWM is signed.** MyCal is `contract_signed: false`. So even if it's one Alicia, there is **no live two-sided commitment** to create a conflict right now.
- **No exclusivity clause is visible in either record.** Neither canonical row nor SideShift row surfaces an exclusivity term. (Caveat: the MWM agreement PDF was never extractable — HOLMES-V2 blocked by the same SideShift gating — so a clause *could* exist unseen. Flagged, not assumed.)

### 3.3 The softer risks that DO apply if it's one Alicia (🟡 relationship lens — OPRAH)

- **Rate-anchoring leakage.** If Alicia placed both, she knows Julz accepted MWM's **$50-per-5-approved-posts retainer** (canonical row 2). She may use that to hold MyCal's per-video economics down. **Mitigation:** negotiate MyCal on its own merit; the $300/$1000 view-bonus structure is a different model than MWM's flat retainer, so anchor on *that*, not on the MWM number.
- **Relationship concentration.** One recruiter gating two of Julz's deals means one soured relationship could cost both. **Mitigation:** keep both threads professional + responsive; don't let either go stale (MyCal is already `awaiting brand` — a prompt nudge keeps goodwill).
- **NOT a firewall-grade risk.** A separate creator account (the heaviest mitigation) is **overkill** here because the categories don't conflict. Reserve that only for Option C conditions in Action #3.

### 3.4 Recommended low-risk action

**CLARIFY (confirm identity per §1.6) + PROCEED on separate merits — do not firewall.** Concretely:
1. Confirm whether it's one Alicia (Action #1).
2. If yes: proceed with both, negotiate independently, watch for rate-anchoring (Option A).
3. Only escalate to a separate-account firewall (Option C) **if** the MyCal agreement — once readable — contains a competitor-exclusivity clause that could reach MWM. On today's evidence, it doesn't appear to, so **no firewall is warranted.**

---

## SECTION 4 — Cross-link + CAPA registry updates

Both CAPAs already exist in `~/.claude/sessions/capa-registry.jsonl` (CAPA-013 line 13, CAPA-014 line 14, opened by WHITNEY A.14v Wave 2). This document is the **decision-support deliverable** that services both. To satisfy the task's cross-link requirement (HR-26 problems-ship-with-solutions), each CAPA gets a back-reference to this analysis + the explicit remediation path:

- **CAPA-013 (MyCal payment conflict):** remediation = §2.4 (clarify-then-sign; keep `payment_amount_usd`/`bonus_amount_usd` = `null` until brand confirms). Owner WHITNEY; unblocked by Julz reply in-thread.
- **CAPA-014 (Alicia identity / exclusivity):** remediation = §1.6 (5-min human SideShift profile check) + §3.4 (clarify + proceed-on-merit, firewall only on Option-C condition). Probability MyCal↔MWM same person = **0.65**. Owner WHITNEY; unblocked by Julz identity confirmation.

> **Cross-link note:** CAPA-014 is the **person-level twin** of CAPA-011 (Bolt/Lovable competitor-exclusivity, companion doc `06-a14y-wave-0.9-g18-bolt-lovable-hunch.md`). CAPA-011 = two *brands* in one category; CAPA-014 = two *brands* possibly sharing one *recruiter*. Same root class: "no cross-roster check before sign." Both should feed the same future `prospect_intake` identity-and-category gate (CAPA-011 corrective action).

---

## SECTION 5 — Verification (superpowers:verification-before-completion)

| Claim in this doc | How verified | Result |
|---|---|---|
| "Alicia" absent from raw SideShift bodies | `Grep [Aa]licia` on `sideshift-messages.jsonl` | **0 matches** — confirmed §1.4 |
| "Alicia" present in gmail inbox | `Grep [Aa]licia` on `gmail-brand-inbox.jsonl` | lines 10 + 16 — confirmed |
| MyCal payment conflict = $25/$150 vs $300/$1000 | Read canonical row 4 + SideShift line 3 + DARWIN log C2 lines 28-31 | confirmed verbatim, 3 sources agree on the conflict text |
| MWM signed, MyCal not | Read canonical rows 2 + 4 (`contract_signed`) | MWM `true`, MyCal `false` — confirmed |
| MWM ≠ MyCal category | canonical row 2 (`create.mwm.ai`) vs row 4 (calorie tracker) | confirmed different categories |
| "AW" handle = MWM | SideShift canonical line 1 `contact_handle: "AW"` | confirmed |
| "Alicia" absent from brand-fit-scores | `Grep [Aa]licia` on `brand-fit-scores.jsonl` | **0 matches** — confirmed |
| CAPA-013/014 exist | Read `capa-registry.jsonl` lines 13-14 | confirmed, opened by WHITNEY A.14v |

**Honesty statement (HR-10):** Every figure and quote above traces to a cited file + line. The probability scores are **my reasoned estimates from the available signals, not measured certainties** — the absence of email/handle/portrait and the screenshot-metadata limitation (§1.4) are the explicit reasons I capped MyCal↔MWM at 0.65 rather than higher. No data was fabricated; where the data is silent (MyCal surname, exclusivity clause text, MWM PDF contents), I said so.

---

*OPRAH · A.14y Wave 0.9 · decision support only — Julz decides · MARIE → ELON chain*
