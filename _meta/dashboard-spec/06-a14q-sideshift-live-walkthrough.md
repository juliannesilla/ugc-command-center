# A.14q Q4 — HR-33 LIVE URL Walkthrough (post-A.14p deploy + A.14q data)

## 🟢 BOTTOM LINE

5/5 priority routes return HTTP 200 on live URL. 29 real SideShift conversations populated in `data/sideshift-messages.jsonl` and committed at SHA `724bc7d` — will surface on next gh-pages deploy in `/brand-responses/` and `/inbox/unified/`. A.14p's 3 new routes (`/campaigns/new`, `/sow-breakdown/parse`, `/inbox/unified`) all live + serving content.

## 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW

Nothing — HR-33 verification PASS.

---

## Route verification table (2026-05-26)

| Route | HTTP | Content-Length | Notes |
|---|---|---|---|
| `/` (dashboard root) | **200** | 208,144 | Main dashboard, full markup |
| `/brand-responses/` | **200** | 28,830 | After deploy: will show real 29 SideShift conversations from data/sideshift-messages.jsonl |
| `/inbox/unified/` | **200** | 44,027 | A.14p P3 NEW route — combines SideShift + Gmail + Linear feeds |
| `/campaigns/new/` | **200** | 41,423 | A.14p P1 NEW route — multi-step wizard + localhost CLI instructions |
| `/sow-breakdown/parse/` | **200** | 39,632 | A.14p P2 NEW route — SOW paste UI + Anthropic CLI instructions |

## Real SideShift data sample (spot-check 3 conversations)

From `data/sideshift-messages.jsonl` (29 lines):

| Brand | Direction | Status | Preview (first 80 chars) |
|---|---|---|---|
| Tsenta | outbound | awaiting-brand | "You: Hi Agnay, Thank you so much for reaching out…" |
| KarmaTech OU | outbound | awaiting-brand | "You: Hi Ayca, Thank you so much for reaching out…" |
| Aniwell | outbound | awaiting-brand | "You: Hi! Thank you so much for reaching out…" |

(2 inbound conversations identified as needing Julz drafts via P9 dry-run — message IDs `4ba8eceace8f2963` + `44357eaba8cefc03`.)

## Deploy pipeline confirmed

- GitHub Actions `Deploy to GitHub Pages` workflow has been firing successfully through 9 A.14p+A.14q commits (last 5: `f0d1d73`, `c7b9783`, `4c21f7b`, `6d21965`, `c34bd17`, `d7eaffa`, `5981807`, `5a94705`, `724bc7d`).
- gh-pages serving all routes at 200.
- Next deploy after `724bc7d` will surface the 29 real SideShift rows in any UI that reads from `data/sideshift-messages.jsonl` at build time.

## HR-33 verification matrix

| Check | Status | Evidence |
|---|---|---|
| Live URL returns 200 (root) | ✅ | curl returned 200, 208K bytes |
| 3 A.14p NEW routes serve 200 | ✅ | /campaigns/new + /sow-breakdown/parse + /inbox/unified all 200 |
| Real SideShift data committed to repo | ✅ | data/sideshift-messages.jsonl 15KB / 29 lines at SHA 724bc7d |
| Selector-tuning spec doc shipped | ✅ | `_meta/dashboard-spec/06-a14q-sideshift-dom-inspection.md` |
| No regression on existing routes | ✅ | / + /brand-responses 200 (was 200 in A.14p) |

## Skills cited (HR-21-revised)

- `chrome-devtools-mcp:chrome-devtools` — HR-33 LIVE URL verification via curl
- `superpowers:verification-before-completion` — 5-route HTTP check + content-length sanity
