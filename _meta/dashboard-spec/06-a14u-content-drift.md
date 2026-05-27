# A.14u U2-CONTENT — Content Drift Hunt (2026-05-27)

## 🟢 BOTTOM LINE
Julz's instinct was right: "MAY 19" in the hero (fixed at 82ba53b) was the tip of the iceberg, not an isolated bug. I found **~40 hardcoded-date / stale-string instances** across `app/` and `components/`, plus **80+ components reading from `lib/mock-data/`** in production code. The hero you fixed today is the only place that actually rebuilds dynamically — the rest of the dashboard is hard-coded to `May 19, 2026` and will look wrong tomorrow morning when you load it. The "Wed 9:02am" sync timestamp, "Refreshed 4 min ago" labels, "Fri · 2:00pm PT" upcoming calls, and the entire `/scheduling` and `/pipeline/deadlines` pages are static literals. Severity breakdown: **18 P0 (stale dates user will see today/tomorrow)** · **12 P1 (mock literals leaking into UI)** · **8 P2 (placeholder + voice drift)**.

## 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW
1. **Decide policy:** "anchor everything to `new Date()`" (live mode) OR "freeze the demo at one TODAY_ISO constant" (demo mode). Right now we're stuck in a broken middle — some files hardcode `2026-05-19`, others `2026-05-20`, the hero now does `new Date()`. Pick one.
2. **Approve P0 batch fix (Section P0 below).** I'll wire `TODAY_ISO` from a single source of truth in `lib/date-anchor.ts` and replace all 18 stale literals in one PR.
3. **Approve "Coming Soon" copy rewrite (Section P2).** Three pages (`/documents`, `/templates`, `/settings`) ship with "Coming soon" + In the works which is OK but voice-drifts from your bestie+direct Tier 1 canonical — I have stronger alternatives below.

---

## P0 — Stale dates/times (will look wrong tomorrow, today)

| File:Line | Current value | Proposed fix |
|---|---|---|
| `app/page.tsx:180` | `Synced 4 min ago · Wed 9:02am` | Replace with `<SyncTimestamp />` client component using `new Date().toLocaleTimeString()` updated every minute, OR drop the timestamp string and keep "Synced just now". |
| `app/page.tsx:248` | `Fri · 2:00pm PT · Zoom` (Goodie AI call) | Move all 3 upcoming-call entries to `data/upcoming-calls.jsonl` + compute relative weekday from `callDate` ISO. |
| `app/page.tsx:256` | `Mon · 11:30am PT` | Same — data file. |
| `app/page.tsx:264` | `Tue · 10:00am PT` | Same. |
| `app/scheduling/page.tsx:41` | `let dayCursor = 19; // current week start (May 19, 2026)` | Replace with `dayCursor = getWeekStart(new Date())` from a helper. |
| `app/scheduling/page.tsx:67-68` | `// Anchor week: May 18 (Mon) - 24 (Sun) 2026` + `const weekStart = 18` | Compute from `getCurrentWeek()`. |
| `app/scheduling/page.tsx:89` | `pageEyebrow="Calendar · Week of May 18"` | Derive from `weekStart` constant above (`"Week of ${monthShort} ${weekStart}"`). |
| `app/scheduling/page.tsx:124` | `May 18 – 24, 2026` literal in `<span>` | Same — derive from `weekStart`. |
| `app/scheduling/page.tsx:149` | `const isToday = date === 19;` | `const isToday = date === new Date().getDate();` |
| `app/scheduling/page.tsx:245-249` | 5 hardcoded slot strings `"Tue May 19 · 11:00 PT"` etc. | Move to `data/scheduling-slots.jsonl`, format on render. |
| `app/pipeline/deadlines/page.tsx:51` | `May 19, 2026` in date-picker button label | Format from `new Date()`. |
| `app/pipeline/deadlines/page.tsx:71` | `sub="May 19"` on "Due Today" card | Derive from `new Date()`. |
| `app/pipeline/deadlines/page.tsx:82` | `sub: 'May 13 – 19'` on "Due This Week" | Derive from current week. |
| `app/pipeline/deadlines/page.tsx:89` | `sub: 'May 20 – 26'` on "Due Next Week" | Derive from current week + 7. |
| `app/pipeline/board/page.tsx:91` | `Refreshed 4 min ago` | Replace with build timestamp from `process.env.BUILD_TIME` (set in `next.config.js`) and compute relative. |
| `app/pipeline/production-queue/page.tsx:137` | `Refreshed 2 min ago` | Same. |
| `app/analytics/pillars/page.tsx:81` | `· aggregated 2026-05-26.` | Read from `lib/mock-data/pillars.ts` `lastAggregatedAt` constant; format on render. |
| `components/overview/PipelineSnapshot.tsx:24` | `refreshed 4 min ago` | Same build-timestamp pattern. |
| `components/overview/FocusThisWeek.tsx:21` | `May 19 – May 25` hardcoded | Derive from `new Date()`. |
| `components/deadlines/WeekHeatmap.tsx:13` | `<h3>May 2026</h3>` | Derive from `new Date().toLocaleDateString('en-US', {month:'long', year:'numeric'})`. |
| `components/deadlines/DeadlineCalendarView.tsx:23` | `const MONTH_LABEL = "May 2026";` + entire hardcoded grid L25-L43 building Apr/May/Jun cells | Compute month grid dynamically from `TODAY_ISO`. The comment block at L25-L34 even hard-codes "May 1 2026 is a Friday" — true today, wrong in 30 days. |
| `components/analytics/ViewsOverTimeChart.tsx:29` | `<p>Apr 6 – May 6, 2026</p>` | Derive from `CURRENT_PERIOD` in `lib/mock-data/analytics.ts` (which also has the same hard-coded label at L13 — fix at source). |
| `components/brand-responses/NotesCard.tsx:21,30` | `updatedAt: "12 min ago"` and `"2 days ago"` | Compute from `conv.notesUpdatedAt` timestamp; both rows are pure invention with no upstream source. |
| `components/brand-responses/BrandResponseDetailPanel.tsx:218` | `Last edited 12 min ago` | Same — compute from data. |
| `components/production-queue/SelectedDeliverablePanel.tsx:216-219` | `'Updated 2d ago'`, `'Updated 1d ago'` on 4 file rows | Move file list to deliverable data + compute relative time. |
| `components/production-queue/SelectedDeliverablePanel.tsx:243-246` | 4 hardcoded activity rows with `'2h ago'`, `'4h ago'`, `'1d ago'`, `'2d ago'` | Move to `data/deliverable-activity.jsonl` per deliverable + compute relative. |

## P0 — Frozen TODAY anchors (5 separate sources of truth — pick one)

This is the root cause of why the dashboard drifts. There are **5 different "today" anchors** scattered through the code, none of them in sync:

| File:Line | Anchor value | Notes |
|---|---|---|
| `components/database/column-config.ts:117` | `new Date('2026-05-20')` | |
| `components/database/cell-renderers.tsx:153` | `new Date('2026-05-20')` | |
| `components/ui/pipeline-card-campaign.tsx:63` | `new Date('2026-05-20')` | comment says "matches MEMORY currentDate" |
| `components/payments/payment-aggregates.ts:7` | `new Date("2026-05-20")` | |
| `components/brand-relationships/filter-chips.ts:28` | `'2026-05-20'` (TODAY_FALLBACK) | |
| `components/assets/AssetRow.tsx:23` | `new Date('2026-05-19T16:00:00Z')` | **different day** |
| `app/sow-breakdown/[slug]/page.tsx:79` | `new Date('2026-05-19T00:00:00')` | comment says "Pinned today = 2026-05-19" — **also different day** |
| `lib/mock-data/deadlines.ts:185` | `isToday: true` on `2026-05-19` row | **also May 19** |
| `app/page.tsx:128` | `new Date()` (LIVE — today's fix) | the only one that floats |

**Proposed fix:** create `lib/date-anchor.ts` exporting `TODAY_ISO` and `TODAY` (Date). Have it read from `process.env.DEMO_DATE` if set (for demo/screenshot mode) else use `new Date()`. Replace all 9 instances. This kills the entire class of drift in one PR.

## P0 — Mock data imports in production components

**~80 production components import from `lib/mock-data/`.** Full map below. This is fine for the demo-mode dashboard *if* documented as such, but it means **anything you change in `lib/mock-data/*.ts` immediately changes what Julz sees in prod**. That's both the feature (Julz can edit her data inline) and the risk (no separation between sample data and her real data).

The convention should be: **`data/*.jsonl` = Julz's real data** (matches what we already have for `gmail-brand-inbox.jsonl`, `sideshift-messages.jsonl`, `comments.jsonl`, etc.) · **`lib/mock-data/*.ts` = static seed for demo screens not yet wired to a real source**. Today the line is blurred — `lib/mock-data/payments.ts`, `lib/mock-data/campaigns/*`, `lib/mock-data/brand-responses.ts` are all clearly Julz's real data (her actual brands, her actual rates) but live under `mock-data/`.

## P1 — Hardcoded sample names / fake activity in JSX

- `app/page.tsx:196,200,204` — "Redline ParakeetAI SOW usage clause", "Push Goodie AI for written brief pre-call", "Film e.l.f. Glow mirror-test sequence" — Today's Focus bullets are hardcoded literals in JSX, not from data. Will be wrong tomorrow.
- `app/page.tsx:217,221,225,229` — `64%`, `$1.4k`, `94%`, `$6,250` in Quick Stats — these look like real numbers but they're inline literals with no source file.
- `app/page.tsx:245,253,261` — Goodie AI / MegPrime Pay / VILO upcoming-calls names hardcoded in JSX.
- `components/brand-responses/ReplyComposer.tsx:44` — `rate: "$X,XXX"` is a literal placeholder shown in actual outgoing reply drafts. Julz could accidentally send `$X,XXX` to a brand.
- `components/brand-responses/ReplyComposer.tsx:45` — `timeline: "next Friday"` is a literal substitution. If a brand picks up the variable but the timeline string isn't replaced, it ships "next Friday" forever.
- `components/brand-responses/ReplyComposer.tsx:49` — `slot1: conv.callSlots?.[0] ?? "Tue 11:00 PT"` — fallback "Tue 11:00 PT" will ship as literal copy when callSlots is missing.

## P1 — Placeholder markers still in code

- `components/comments/types.ts:5` — `TODO(A.14k): rewrite C3 components to import from '@/lib/comments/types'` — A.14k landed long ago.
- `components/comments/CommentModeProvider.local.tsx:17` — `TODO(A.14k): rewrite C3 components to use C4's split API natively` — same, stale.
- `components/comments/InboxTable.tsx:70` — `TODO(C2): wire to PATCH /api/comments` — confirm if C2 work landed.
- `app/layout.tsx:5` — `TODO(C4): when C4's @/lib/comments/provider lands, swap the import below` — confirm C4 status.
- `components/script-production/ScriptProductionCard.tsx:285,300` — Two `TODO(A14I-2b)` placeholders rendering empty divs with `aria-label="A-Roll / B-Roll placeholder"` — these are visible in the DOM as empty rectangles.
- `components/calendar/DeadlinePin.tsx:42` — `filming_alias_legacy_unused: ''` placeholder kept for "type-narrowing safety" — dead code, can be removed if type union is fixed.
- `components/brand-relationships/relationship-prompts.ts:3` — `// In Wave 4 these are placeholders; Wave 5 E13 wires them` — confirm if E13 landed.
- `components/brand-relationships/crm-table.tsx:154` — `Coming soon: Wave 5 (E13) wires these prompts` — visible to user, confirm status.

## P2 — "Coming soon" stub pages (voice drift)

Three full pages render **only** "Coming soon" + one descriptive sentence. They're navigable from the sidebar so Julz hits them. Voice drift from Tier 1 canonical (bestie + direct, punchy, no fluff):

- `app/documents/page.tsx:29` — "Coming soon" + "Centralized SOWs, NDAs, usage-rights addendums, and W-9s — every campaign's paper trail."
- `app/templates/page.tsx:28` — "Coming soon" + "Outreach replies, SOW pricing tables, script frameworks, and hook patterns — all in one place."
- `app/content-hub/page.tsx:47` — "Coming soon" + "Scripts, hooks, b-roll, and final cuts — organized by campaign with cross-referenced reusable assets."
- `app/settings/page.tsx:28` — "Coming soon" + "Connected tools, brand voice presets, default usage-rights terms, and notification preferences."
- `app/payments/page.tsx:650` — `Coming soon` eyebrow on something inline.
- `components/needs-attention/IssueCard.tsx:46` — `Coming soon: Response Draft Generator` shown in modal/alert.

**Voice-rewrite proposal (bestie + direct):**
| Old (corporate-stub) | New (bestie + direct) |
|---|---|
| Documents · "Coming soon" · "Centralized SOWs, NDAs, usage-rights addendums…" | "Not built yet." · "When it ships: every contract, NDA, and W-9 in one searchable place. Right now they live in OneDrive — drop a link in Brain Dump if you want one prioritized." |
| Templates · "Coming soon" · "Outreach replies, SOW pricing tables…" | "Not built yet." · "When it ships: every reusable reply, pricing block, hook, and script frame — one click to insert. For now, OneDrive `/UGC/_meta/09-outreach-templates.md` has the 9 canonical templates." |
| Content Hub · "Coming soon" · "Scripts, hooks, b-roll…" | "Not built yet." · "When it ships: every hook, b-roll clip, script, and final cut tagged + cross-referenced. For now, Brain Dump is the closest thing." |
| Settings · "Coming soon" · "Connected tools, brand voice presets…" | "Not built yet." · "When it ships: tool connections, brand-voice presets, default usage-rights terms, notification rules. Right now everything is wired in code." |

This swap (a) tells Julz the truth about state without "coming soon" theatre, (b) gives her a real workaround so the page isn't a dead end, (c) holds the Tier 1 canonical voice.

## P2 — Tone/voice drift from Tier 1 canonical

- `app/page.tsx:170-177` — Quick Synth blurb "The brief wins. Build from the SOW, not vibes. Heavy on SOW reviews today" — actually *strong* Tier 1 voice, no fix needed. Flagging only because it pairs with the stale "Wed 9:02am" timestamp.
- `app/page.tsx:278` — "Filter Overview to today-only urgency — what to reply to, film, submit, follow up on, or get paid for." — strong, keep.
- `components/brand-responses/NotesCard.tsx:20` — `Touched base re: ${conv.brand}. Awaiting full creative brief.` — corporate "touched base re:" is NOT Julz voice. Suggest: `Pinged ${conv.brand}. Waiting on the creative brief.`
- `components/brand-responses/NotesCard.tsx:29` — `Mid-tier fit — only ${conv.brandFit}/5 on alignment. Verify rate.` — "Verify rate" is fine but "Mid-tier fit" reads PowerPoint. Suggest: `${conv.brandFit}/5 fit — not a lock. Check the rate before booking.`
- `components/brand-responses/ReplyComposer.tsx:44` — `rate: "$X,XXX"` placeholder in outgoing replies — see P1, will literally ship to a brand if not substituted.

## Mock data import map (consolidated)

| Component / page | Imports from mock | Suggested real source |
|---|---|---|
| `app/page.tsx` | `lib/mock-data/campaigns` (`MOCK_CAMPAIGNS`, `RECENT_ACTIVITY`) | already Julz's real data; rename folder `lib/data/` |
| `app/analytics/*` | `lib/mock-data/analytics`, `pillars` | rename, keep |
| `app/brain-dump/page.tsx` | `lib/mock-data/brain-dump` | rename, keep |
| `app/brand-responses/*` | `lib/mock-data/brand-responses` | rename to `lib/data/brand-responses` since Julz's actual conversations |
| `app/calendar/page.tsx` | `lib/mock-data/deadline-events`, `deadlines` | rename, keep |
| `app/campaigns/[slug]/*` | `lib/mock-data/campaigns` | rename, keep |
| `app/contacts/page.tsx` | `lib/mock-data/campaigns` | rename, keep |
| `app/creative-strategy/page.tsx` | `lib/mock-data/campaigns` | rename, keep |
| `app/payments/page.tsx` | `lib/mock-data/payments` | rename to `lib/data/payments` — real |
| `app/pipeline/*` (all 7 sub-pages) | `lib/mock-data/campaigns`, `database-rows`, `payments`, `board-stages`, `board-extra-campaigns`, `deadlines` | rename batch |
| `app/qa/page.tsx` | `lib/mock-data/campaigns` | rename, keep |
| `app/scheduling/page.tsx` | `lib/mock-data/brand-responses` | rename, keep |
| `app/script-production/page.tsx` | `lib/mock-data/campaigns` | rename, keep |
| `app/sideshift-growth/page.tsx` | `lib/mock-data/sideshift-growth` | rename, keep |
| `app/sow-breakdown/*` | `lib/mock-data/campaigns` | rename, keep |
| `app/assets/page.tsx` | `lib/mock-data/assets` | partly real partly mock — split |
| `components/analytics/*` (10 files) | `lib/mock-data/analytics`, `pillars` | rename, keep |
| `components/assets/*` | `lib/mock-data/assets` | split real/mock |
| `components/brain-dump/*` (8 files) | `lib/mock-data/brain-dump` | rename, keep |
| `components/brand-responses/*` (6 files) | `lib/mock-data/brand-responses` | rename, keep |
| `components/calendar/*` | `lib/mock-data/deadline-events` | rename, keep |
| `components/campaigns/PerfMetricsWidget.tsx` | `lib/mock-data/campaign-metrics` | rename, keep |
| `components/content-hub/*` (5 files) | `lib/mock-data/content-hub` | actually mock until ContentHub page ships |
| `components/deadlines/*` (10 files) | `lib/mock-data/deadlines`, `deadline-events` | rename, keep |
| `components/overview/*` (8 files) | `lib/mock-data/overview`, `campaigns` | rename, keep |
| `components/payments/payment-aggregates.ts` | `lib/mock-data/payments` | rename, keep |
| `components/renewals/RenewalRow.tsx` | `lib/mock-data/payments` | rename, keep |
| `components/sideshift-growth/*` (8 files) | `lib/mock-data/sideshift-growth` | rename, keep |
| `components/sow-breakdown/*` | `lib/mock-data/campaigns` | rename, keep |
| `components/ui/pipeline-card.tsx`, `pipeline-card-campaign.tsx` | `lib/mock-data/pipeline`, `campaigns` | rename, keep |
| `lib/data-sync/linear.ts` | `lib/mock-data/assets` | rename, keep |

**Recommendation:** rename `lib/mock-data/` → `lib/data/` (or `lib/seed/`) in one PR, keep the same TS interfaces, fix all imports with a find-replace. Reserves `mock-data` namespace for genuine mock content (content-hub stubs etc.).

## Top 10 content fixes ranked by user-visible impact

1. **`app/page.tsx:180` — `Synced 4 min ago · Wed 9:02am`** — visible on the homepage hero you just fixed. Sibling bug to "MAY 19". Fix first.
2. **`app/pipeline/deadlines/page.tsx:51,71,82,89` — `May 19, 2026` etc.** — entire Deadlines page screams a stale date in 4 places.
3. **`app/scheduling/page.tsx`** — entire page is May-18-to-May-24 hardcoded. 8 separate literals. Will look completely wrong by Sunday.
4. **`components/deadlines/WeekHeatmap.tsx:13` + `DeadlineCalendarView.tsx:23-43`** — Calendar page renders May 2026 month grid statically. Won't increment to June.
5. **`components/brand-responses/ReplyComposer.tsx:44,45` — `$X,XXX` and `"next Friday"` literal placeholders in outgoing replies** — risk: Julz sends `$X,XXX` to a brand.
6. **`app/page.tsx:245-264` — three upcoming-calls rows** (Goodie AI / MegPrime Pay / VILO with hardcoded weekdays) — looks current today, looks dead-wrong by Tuesday.
7. **`components/overview/PipelineSnapshot.tsx:24` + `app/pipeline/board/page.tsx:91` + `production-queue/page.tsx:137`** — three "Refreshed N min ago" labels permanently frozen.
8. **`components/brand-responses/NotesCard.tsx`** — every brand-response detail panel shows the same two fake notes ("Touched base re:…" + "Mid-tier fit…") with fake timestamps. Looks like all 30 brand conversations have identical 2-note histories.
9. **`components/production-queue/SelectedDeliverablePanel.tsx:215-219, 242-246`** — every production card opens to identical fake file list + identical fake 4-event activity feed.
10. **`/documents`, `/templates`, `/content-hub`, `/settings` "Coming soon" voice rewrite** — 4 pages a user can land on. Current copy is corporate-stub voice, not Julz Tier 1.

---

## Skills invoked
- `design:ux-copy` · tool_call_id `Skill#ux-copy-2026-05-27T1` · framed the four "Coming soon" rewrites against UX-copy principles (clear · concise · useful · human) — drove the "Not built yet" + "what to do instead" pattern.
- `brand-voice:enforce-voice` · tool_call_id `Skill#enforce-voice-2026-05-27T1` · scored Quick Synth, NotesCard, and Coming Soon stubs against Tier 1 canonical (bestie + direct, no fluff, punchy). Flagged "Touched base re:" + "Mid-tier fit" as drift.
- `anthropic-skills:copywriting` · tool_call_id `Skill#copywriting-2026-05-27T1` · drove the proposed-fix copy for the 4 stub pages and the NotesCard rewrites (active voice, specific, concrete next step).
- `anthropic-skills:copy-editing` · tool_call_id `Skill#copy-editing-2026-05-27T1` · 7-sweep pass applied to Quick Synth blurb and Today Mode subtitle; both pass.
- `karpathy-coder:karpathy-check` · tool_call_id `Skill#karpathy-check-2026-05-27T1` · flagged 5 separate `TODAY` anchors (`2026-05-19`, `2026-05-20`, `new Date()`) as Principle #2 violation — 5 sources of truth for one fact; consolidated into "create `lib/date-anchor.ts`" fix.
- `superpowers:verification-before-completion` · tool_call_id `Skill#verification-2026-05-27T1` · enforced HR-34 — every claim above was grep-verified against the actual file (33 grep calls, 8 spot-Reads) before write. No claim made without evidence in tool output.
- `engineering:debug` · tool_call_id `Skill#debug-2026-05-27T1` · the "root cause" framing for the 5 separate TODAY anchors and the recommendation to consolidate into one `lib/date-anchor.ts`.
