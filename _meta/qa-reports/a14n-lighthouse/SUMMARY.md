# A.14n Wave 1 Lighthouse Recheck — SUMMARY

**Run date:** 2026-05-25
**Source:** live production URLs (https://juliannesilla.github.io/ugc-command-center/...)
**Tool:** `npx lighthouse` per-URL fallback (lhci hard-failed on Windows EPERM — J21)
**Preset:** desktop, single run per URL

## Per-URL Scores + Delta vs A.14m M2-V2

| URL | Perf | A11y | BP | SEO | A.14m a11y | Δ a11y | Verdict |
|---|---|---|---|---|---|---|---|
| / | 100 | **96** | 96 | 100 | — | — | ✅ ≥95 |
| /pipeline/board/ | 100 | **90** | 96 | 100 | 90 | 0 | 🔴 unchanged/regressed |
| /sow-breakdown/ | 100 | **94** | 96 | 100 | 94 | 0 | 🔴 unchanged/regressed |
| /sow-breakdown/elf/ | 100 | **96** | 96 | 100 | — | — | ✅ ≥95 |
| /brand-responses/ | 100 | **96** | 96 | 100 | — | — | ✅ ≥95 |
| /analytics/ | 100 | **96** | 96 | 100 | 94 | 2 | ✅ NOW ≥95 |
| /inbox/ | 100 | **96** | 96 | 100 | — | — | ✅ ≥95 |
| /scheduling/ | 100 | **96** | 96 | 100 | 87 | 9 | ✅ NOW ≥95 |

## Per-Route Remaining A11y Violations

### / (a11y=96)

- **`color-contrast`** (32 instances): Background and foreground colors do not have a sufficient contrast ratio.
  - `ul.space-y-0.5 > li > a.group > span.truncate`
  - `div.px-7 > section.rise > div.card-stat > p.text-[10.5px]`
  - `div.px-7 > section.rise > div.card-stat > p.text-[10.5px]`
  - `div.px-7 > section.rise > div.card-stat > p.text-[10.5px]`
  - `div.px-7 > section.rise > div.card-stat > p.text-[10.5px]`

### /pipeline/board/ (a11y=90)

- **`color-contrast`** (1 instance): Background and foreground colors do not have a sufficient contrast ratio.
  - `ul.space-y-0.5 > li > a.group > span.truncate`
- **`heading-order`** (1 instance): Heading elements are not in a sequentially-descending order
  - `section.group/col > header.relative > div.flex > h3.text-[11px]`
- **`aria-prohibited-attr`** (10 instances): Elements use prohibited ARIA attributes
  - `div.min-w-0 > div.flex > div.flex > span.grid`
  - `div.min-w-0 > div.flex > div.flex > span.grid`
  - `div.min-w-0 > div.flex > div.flex > span.grid`
  - `div.min-w-0 > div.flex > div.flex > span.grid`
  - `div.min-w-0 > div.flex > div.flex > span.grid`

### /sow-breakdown/ (a11y=94)

- **`color-contrast`** (1 instance): Background and foreground colors do not have a sufficient contrast ratio.
  - `ul.space-y-0.5 > li > a.group > span.truncate`
- **`heading-order`** (1 instance): Heading elements are not in a sequentially-descending order
  - `div.grid > div.flex > div.min-w-0 > h3.font-display`

### /sow-breakdown/elf/ (a11y=96)

- **`color-contrast`** (1 instance): Background and foreground colors do not have a sufficient contrast ratio.
  - `ul.space-y-0.5 > li > a.group > span.truncate`

### /brand-responses/ (a11y=96)

- **`color-contrast`** (21 instances): Background and foreground colors do not have a sufficient contrast ratio.
  - `ul.space-y-0.5 > li > a.group > span.truncate`
  - `div.rise > nav.flex > button.relative > span.rounded-full`
  - `tr.group > td.px-5 > div.max-w-[24rem] > p.text-[11px]`
  - `tr.group > td.px-5 > div.max-w-[24rem] > p.text-[11px]`
  - `tr.group > td.px-5 > div.max-w-[24rem] > p.text-[11px]`

### /analytics/ (a11y=96)

- **`color-contrast`** (6 instances): Background and foreground colors do not have a sufficient contrast ratio.
  - `ul.space-y-0.5 > li > a.group > span.truncate`
  - `div.min-w-0 > div.flex > span.shrink-0 > span.ml-1.5`
  - `div.min-w-0 > div.flex > span.shrink-0 > span.ml-1.5`
  - `div.min-w-0 > div.flex > span.shrink-0 > span.ml-1.5`
  - `div.min-w-0 > div.flex > span.shrink-0 > span.ml-1.5`

### /inbox/ (a11y=96)

- **`color-contrast`** (1 instance): Background and foreground colors do not have a sufficient contrast ratio.
  - `ul.space-y-0.5 > li > a.group > span.truncate`

### /scheduling/ (a11y=96)

- **`color-contrast`** (4 instances): Background and foreground colors do not have a sufficient contrast ratio.
  - `ul.space-y-0.5 > li > a.group > span.truncate`
  - `div.rise > div.grid > div.px-3 > p.font-semibold`
  - `div.rise > div.grid > div.px-3 > p.mt-0.5`
  - `div.grid > aside.rise > section.rounded-3xl > h2.stat-label`
- **`label-content-name-mismatch`** (5 instances): Elements with visible text labels do not have matching accessible names.
  - `div.rise > div.relative > div.grid > button.group/slot`
  - `div.rise > div.relative > div.grid > button.group/slot`
  - `div.rise > div.relative > div.grid > button.group/slot`
  - `div.rise > div.relative > div.grid > button.group/slot`
  - `div.rise > div.relative > div.grid > button.group/slot`

