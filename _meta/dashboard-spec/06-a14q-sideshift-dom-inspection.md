# A.14q Q1 — SideShift DOM Inspection (post-A.14p P8 selector miss)

## 🟢 BOTTOM LINE

SideShift uses Tailwind-utility classes on bare DOM (no `data-testid`, no `data-conversation`). Chat-list rows are `ul.py-0 > li` containing a `button.group/row` with the avatar IMG + content DIV. Brand name = `h4`, relative timestamp = `span.tabular-nums`, preview = trailing `span`. Inspected 2026-05-26 via Claude-in-Chrome MCP against Julz's live authenticated tab. 29 rows present.

## 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW

Nothing — findings feed directly into Q2 (script update).

---

## Locked structure

```html
<ul class="py-0 [overflow-anchor:none]">
  <li class="relative min-w-0 [overflow-anchor:none] px-2 pb-1.5 last:pb-3 animate-in fade-in-0 duration-150">
    <div class="group/dm-list-item relative">
      <button class="group/row relative flex w-full items-center gap-3 rounded-[22px] px-3 py-3 ...">
        <div class="relative shrink-0">
          <img class="h-12 w-12 rounded-[16px] object-cover" src="https://firebasestorage.googleapis.com/...">
        </div>
        <div class="min-w-0 flex-1">
          <h4 class="min-w-0 flex-1 truncate text-[14px] leading-[1.2] font-medium ...">{BRAND_NAME}</h4>
          <span class="shrink-0 text-right text-[12px] tabular-nums text-[#A2ACBB]">{REL_TIMESTAMP}</span>
          <span class="">{LAST_MESSAGE_PREVIEW}</span>
        </div>
      </button>
    </div>
  </li>
  ...
</ul>
```

## Concrete selectors for `scripts/poll-sideshift.mjs`

| Field | Selector | Notes |
|---|---|---|
| Row container | `ul.py-0` | Single instance, holds all rows |
| Chat row | `ul.py-0 > li` | 29 rows in Julz's inbox on inspection |
| Click target | `li button` (only one `button` per row) | For thread URL capture if needed |
| Brand name | `li h4` | E.g., "Tsenta", "KarmaTech OU" |
| Relative timestamp | `li span.tabular-nums` | "23m", "1h", "Yesterday" — NOT ISO |
| Last preview | LAST `<span>` inside `button > div.min-w-0` that is NOT the timestamp | Text often starts "You: " for outbound |
| Avatar | `li img` | src = firebasestorage URL |

## Known limitations + workarounds

- **No anchor `href`** — clicks are React onClick. Threadable by clicking each row (invasive). For poll v1: use synthetic thread_id = `sha256(brand + preview.slice(0,80))`. Collision risk only if same brand sends two msgs with identical first-80-chars (negligible).
- **No `<time datetime>` ISO timestamp** — only relative ("23m", "1h"). Parse relative → approximate ISO via `nowIso() - parsedMinutesOrHours`. Or stamp with `nowIso()` and accept ~30min granularity (cron runs every 30min anyway).
- **No `aria-label`** on rows — can't extract thread metadata from accessibility tree.
- **Preview's `<span>` has empty class** — must select by position (last span in content div), not class.

## Skill citations (HR-21-revised)

- `chrome-devtools-mcp:chrome-devtools` — live DOM probe via Claude-in-Chrome
- `superpowers:verification-before-completion` — inspection drove selector decisions, no fabrication

## Source

Inspected from tabId 545258415 on `https://app.sideshift.app/chat` at 2026-05-26T~12:50Z. Live data from Julz's logged-in session (julzsilla@gmail.com via Google OAuth). 29 conversations visible in inbox.
