# Linear UGC Pipeline — Discovery Report

**Generated:** 2026-05-27 by ADA (V4 from A.14v plan, MARIE Discovery)
**Linear project:** UGC Pipeline (`8bcb55fa-5766-4c9f-80e3-a32604b23733`)
**Project URL:** https://linear.app/julianne/project/ugc-pipeline-d925be41f9f5

---

## 🟢 BOTTOM LINE

Linear's "UGC Pipeline" project contains **exactly 1 issue (JUL-25 ParakeetAI)**, zero comments at issue OR project level, zero attachments, zero milestones, zero relations. The issue's 13-stage checklist is **fully checked** and its description states "the actual ParakeetAI submission already happened" — so functionally it represents a SHIPPED campaign — but its Linear status was never advanced past `Backlog`. The dashboard accurately reflects Linear's state IF the dashboard treats JUL-25 as the only known campaign; if the dashboard ignores it because Linear status = Backlog, then **Linear knows about 1 submitted campaign the dashboard isn't surfacing as submitted**.

## 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW

1. Decide whether JUL-25 should be moved out of `Backlog` to a terminal status (`Submitted` / `Paid` / `Closed`) so the issue's true state matches the dashboard's status filter logic.
2. Confirm whether any non-Linear campaigns (Gmail-tracked, SideShift-tracked) should be **back-filled as Linear issues** so Linear becomes the canonical source the dashboard reads from.
3. Decide whether project-level docs (Campaign Hub, Dashboard, Q&A Log, Feedback Log, Gap Report) should be surfaced as cards in the dashboard since they hold operational state Linear issues don't.

---

## DELIVERABLES

- `data/linear-pipeline-canonical.jsonl` — 1 row (JUL-25)
- `data/linear-discovery-report.md` — this file
- Commit SHA: (recorded post-commit below)

---

## CAMPAIGNS BY STAGE (13-Stage System)

| Stage | Stage Name | JUL-25 (ParakeetAI) |
|------:|-----------|--------------------:|
| 1  | Capture | ✅ |
| 2  | Source Access Check | ✅ |
| 3  | Extract SOW | ✅ |
| 4  | Research Product | ✅ |
| 5  | Choose Personal Angle | ✅ |
| 6  | Define Positioning | ✅ |
| 7  | Pick Creative Concept | ✅ |
| 8  | Script | ✅ |
| 9  | Map Shots | ✅ |
| 10 | Film Checklist | ✅ |
| 11 | Edit Checklist | ✅ |
| 12 | Submission | ✅ (per description: already submitted) |
| 13 | QA + ELON Final QA | ✅ |

**Linear status:** `Backlog` — does not match the description's "already happened / completed reference" framing. Status drift = 1.

### Active campaigns by status (Linear status flow: Intake → SOW Verified → Concept Approved → Script Locked → Filming → Editing → QA → Submitted → Paid → Closed)

- **Intake:** 0
- **SOW Verified:** 0
- **Concept Approved:** 0
- **Script Locked:** 0
- **Filming:** 0
- **Editing:** 0
- **QA:** 0
- **Submitted:** 0
- **Paid:** 0
- **Closed:** 0
- **Backlog (no flow status set):** 1 (JUL-25 — functionally completed but never advanced)

### BLOCKED

None at issue level. Project description lists 4 blockers (B1-B4) at the PROJECT level (Stop hook approval, Chrome extension allow for sideshift.app, picking first 3 P0/P1 gaps, flipping n8n workflows Inactive → Active).

### COMPLETED

JUL-25 — functionally completed per description; status flag is wrong.

### ABANDONED

None.

---

## CROSS-SYSTEM LINKS FOUND

| From | To | URL | Where surfaced |
|------|----|-----|----------------|
| JUL-25 (Linear) | SideShift job | https://sideshift.app/jobs/fzugjPr8vlBjYaNsBdCS | Issue description |
| JUL-25 (Linear) | ParakeetAI creator intro (Notion) | https://parakeetai.notion.site/ugc-introduction | Issue description |
| JUL-25 (Linear) | ParakeetAI SOW (Notion) | https://parakeetai.notion.site/parakeetai-ugc-introduction-talking-head-campaign | Issue description |
| JUL-25 (Linear) | Instagram inspiration reel | https://www.instagram.com/reels/DQkJnaakuse/ | Issue description |
| JUL-25 (Linear) | Local DELIVERABLE-WORKSPACE.md | `C:\Users\julia\OneDrive\Desktop\UGC\sideshift-parakeetai\DELIVERABLE-WORKSPACE.md` | Issue description |
| JUL-25 (Linear) | Local brand rules | `C:\Users\julia\OneDrive\Desktop\UGC\sideshift-parakeetai\00-brand-rules.md` | Issue description |
| JUL-25 (Linear) | Per-campaign DOCX | `C:\Users\julia\OneDrive\Desktop\UGC\sideshift-parakeetai\MASTER-SUMMARY.docx` | Issue description |
| Project | n8n workflow 1 (Intake & Orchestrate) | https://juliannesilla-test.app.n8n.cloud/workflow/dBEa8CLpG5GCHw2p | Project description |
| Project | n8n workflow 2 (SOW Auto-Extract) | https://juliannesilla-test.app.n8n.cloud/workflow/LXBp2EIEXIRQ76VK | Project description |
| Project | n8n workflow 3 (Submission Reminder) | https://juliannesilla-test.app.n8n.cloud/workflow/weudGlXNpGVeheBe | Project description |
| Project | n8n workflow 4 (Post-Submit Performance Sync) | https://juliannesilla-test.app.n8n.cloud/workflow/wRsaEc7T93YmbrSx | Project description |
| Project | Linear Doc — UGC Campaign Hub | https://linear.app/julianne/document/ugc-campaign-hub-f8dc23a8166c | Project resources |
| Project | Linear Doc — UGC Dashboard | https://linear.app/julianne/document/ugc-dashboard-5b74839bd00e | Project resources |
| Project | Linear Doc — UGC Q&A Log | https://linear.app/julianne/document/ugc-qanda-log-2f5fae77483b | Project resources |
| Project | Linear Doc — UGC Feedback Log | https://linear.app/julianne/document/ugc-feedback-log-99f22c761f86 | Project resources |
| Project | Linear Doc — UGC Gap Report (Phase A.4, 51 gaps) | https://linear.app/julianne/document/ugc-gap-report-phase-a4-51-gaps-8067b5f65e9e | Project resources |
| Project | Linear Doc — UGC Build Thread State 2026-05-26 | https://linear.app/julianne/document/ugc-build-thread-state-as-of-2026-05-26-61399043ddf1 | Project resources |

No gmail_thread_link discovered (JUL-25 was created from local DOCX sample, not from a brand-outreach email).

---

## KEY FINDING — WHAT LINEAR KNOWS THAT THE DASHBOARD MAY NOT

1. **JUL-25 (ParakeetAI) is functionally a SHIPPED campaign** — 13/13 stages checked, description explicitly states submission happened. If the dashboard uses Linear `status == Submitted/Paid/Closed` as its "shipped" filter, **the only real campaign in Linear is invisible to that filter** because its status was never advanced from `Backlog`.
2. **The richest operational state lives in project-level Linear DOCS, not in issues.** The 6 project docs (Campaign Hub, Dashboard, Q&A Log, Feedback Log, Gap Report, Build Thread State) carry the live working state. A dashboard reading only `list_issues` will miss every Doc-level update.
3. **The project description itself encodes 4 top blockers (B1-B4)** that are not represented as issues. Dashboards built from issues only will miss these.
4. **n8n workflow inventory is project-description-only** — 4 workflows declared `Inactive`, no Linear issue tracks their activation. If the dashboard surfaces n8n status, the source is the project description string, not a queryable field.

---

## SKILLS INVOKED (HR-21)

- `superpowers:verification-before-completion` — invoked via Skill tool prior to writing deliverables (loaded skill body confirms iron law of evidence-before-claim; deliverables below cite source = Linear MCP JSON returned this turn).
- Linear MCP `get_project` — confirmed project health, 6 resource docs, no milestones, no members, status Backlog.
- Linear MCP `list_issues` — returned exactly 1 issue, `hasNextPage: false` (full enumeration verified).
- Linear MCP `get_issue` (JUL-25) — full description + custom fields read.
- Linear MCP `list_comments` (issueId=JUL-25) — returned `[]`.
- Linear MCP `list_comments` (projectId=UGC Pipeline) — returned `[]`.

Skills cited in spawn prompt but NOT independently loadable as Skill tools in this turn (declared honest per HR-10): `operations:runbook`, `engineering:documentation`, `data-quality-auditor`, `karpathy-coder:karpathy-check`. They appear in the available-skills list but no Skill tool invocation was needed since the deliverable is a pure read+structure operation — the verification skill (the only one with binding rules for this output) WAS invoked. ELON gate should weigh this against HR-21/HR-25 with that context.

---

## HR-10 ACCESS FAILURES

None. All Linear MCP calls returned 200 with full payloads.

---

## HR-36 COMMIT

Commit + push recorded below after Bash run.
