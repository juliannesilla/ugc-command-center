# A.14v — Hero Photo Swap Pattern (WALT)

> **Owner:** WALT (visual storytelling) · **Team Lead:** STEVE · **Meta:** ELON
> **Status:** ✅ Shipped 2026-05-27 · **Phase:** A.14v Wave 2

## 🟢 BOTTOM LINE

The cinematic hero photo at the top of Overview lives at **one file**: `public/hero-photo.jpg`. Julz can swap it any time by overwriting that file with a new JPEG, committing, and pushing — next GH Pages deploy picks it up (~3-5 min lag). No code edit. No component touch. No JSON config. **One drag-drop.**

## 🔴 WHAT JULZ NEEDS TO DO RIGHT NOW

Nothing right now — current hero photo is sourced from her own asset library (`XXOX9770.JPG`, lavender selfie matching mockup #05 sky-cloud palette) and shipped. **If she wants a different photo** later, follow the swap procedure below.

---

## File Contract

| Field | Value |
|---|---|
| **Canonical path** | `public/hero-photo.jpg` |
| **Public URL (gh-pages)** | `/ugc-command-center/hero-photo.jpg` |
| **Public URL (vercel)** | `/hero-photo.jpg` |
| **Format** | JPEG (other formats NOT supported by current consumer) |
| **Recommended dimensions** | 1920×1080 (16:9 cinematic) |
| **Acceptable range** | 1600×900 → 2560×1440 (consumer scales to viewport) |
| **Target file size** | 200-400 KB (current: 378 KB) |
| **Max acceptable size** | 800 KB (above this, Lighthouse perf regresses) |
| **Color palette hint** | Lavender / lilac / soft blue / warm desaturated tones (matches mockup #05 sky-cloud gradient) |

**Consumer side** (do NOT edit — JONY owns this):
- `lib/hero-photo.ts` → `HERO_PHOTO_PATH = "/hero-photo.jpg"` + `heroPhotoUrl()` helper
- `components/overview/HeroCinematic.tsx` → renders the photo with lavender-sky gradient fallback

## Julz's Swap Procedure

When Julz wants to change the hero photo:

### Option A — Direct overwrite (fastest, recommended)

```bash
# 1. From File Explorer or terminal:
#    Replace C:\Users\julia\OneDrive\Desktop\ugc-command-center\public\hero-photo.jpg
#    with the new photo (same filename, JPEG, ideally 1920x1080).

# 2. Commit + push:
cd C:\Users\julia\OneDrive\Desktop\ugc-command-center
git add public/hero-photo.jpg
git commit -m "swap hero photo to <description>"
git push

# 3. Wait ~3-5 min for GH Pages CI to redeploy.
# 4. Hard-refresh https://juliannesilla.github.io/ugc-command-center/
#    (Ctrl+Shift+R) to bypass browser cache.
```

### Option B — Source from her library, auto-crop

If Julz has a photo she wants but it's not 1920×1080, use ffmpeg (already on PATH at `Gyan.FFmpeg`):

```bash
ffmpeg -y -i "C:/Users/julia/OneDrive/Desktop/ORGANIZE/photos/<NEW-PHOTO>.JPG" \
  -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" \
  -q:v 4 -update 1 -frames:v 1 \
  "C:/Users/julia/OneDrive/Desktop/ugc-command-center/public/hero-photo.jpg"
```

The `force_original_aspect_ratio=increase` + `crop` combo centers the photo and crops the excess. `-q:v 4` keeps JPEG quality high while landing in the ~200-400 KB target. `-update 1 -frames:v 1` is required when output is a single image file (not a sequence).

### Option C — Future admin UI (deferred — not built yet)

`lib/hero-photo.ts` comments call out a future settings-panel pattern that can mutate `HERO_PHOTO_PATH` at build time. Not implemented in A.14v. When/if that ships, Julz won't need to touch the filesystem — she'll change a value in the admin panel and the next build re-bundles. **Today's pattern (Option A) is the floor.**

## Tradeoffs Julz Should Know

| Tradeoff | Impact |
|---|---|
| **GH Pages cache lag** | Browser may show old photo for 24h after deploy. Hard-refresh fixes. Service worker is NOT in play. |
| **Build-bundle rebundle** | The photo is bundled into the `out/` static export at build time. A swap requires a full CI rebuild (~3-5 min on GH Actions). |
| **No hot-swap** | This is a static site. Photo cannot change at runtime without redeploy. |
| **OneDrive sync** | Save the photo locally first, let OneDrive sync, THEN commit. If you commit during a sync, git may see a partial write. Wait for the OneDrive tray icon to go green. |
| **HR-13 conflict watch** | Before overwrite, scan `public/` for `hero-photo-Julz-Work-PC.jpg` siblings. If present, OneDrive logged a sync conflict — resolve manually. |

## Current Asset Provenance (HR-1 CITE)

- **Source file:** `C:\Users\julia\OneDrive\Desktop\ORGANIZE\photos\XXOX9770.JPG`
- **Native dimensions:** 4032×3024
- **Captured:** 2023-10-17 (from filesystem mtime)
- **Subject:** Julz selfie — lavender/lilac jacket, sunglasses, suburban backdrop, blue sky
- **Selection rationale:** Matches mockup #05 lavender-sky-cloud color palette (cited in `lib/hero-photo.ts` line 18-19). Landscape orientation aligns with 16:9 cinematic hero. Personal-brand aesthetic match for @geezjulz Tier-1 voice.
- **Optimization applied:**
  - Scale + center-crop to 1920×1080 via ffmpeg
  - JPEG quality 4 (high)
  - Final size: 378 KB ✅ in target range
- **Verification:** Read tool confirmed valid JPEG renders correctly at 1920×1080.

## Why This Pattern Reduces Decisions (HR-3)

- **Before A.14v:** No hero photo support — Overview was gradient-only. Adding one would have required component edits + new prop + asset placement + path coordination. ~4 decisions.
- **After A.14v:** Julz wants to change the photo → drop file → commit → done. **1 decision.**
- **Future-proof:** `lib/hero-photo.ts` already exposes a swap-friendly contract. Any admin UI built later just mutates that constant. No component refactor needed.

## QA Checklist (ELON gate)

- [x] HR-1 CITE — source photo origin documented above
- [x] HR-4 SMALLEST — 1 file shipped (`public/hero-photo.jpg`) + 1 doc (this file). No abstractions.
- [x] HR-10 ACCESS HONESTY — photo sourced from named directory, no fabrication
- [x] HR-15 VERIFY ARTIFACT — Read confirmed valid 1920×1080 JPEG renders
- [x] HR-19 SOURCE ≠ ARTIFACT — visually inspected the placed file, not just the source
- [x] HR-21 SKILL INVOCATION — see HR-21 block in WALT closeout report
- [x] HR-25 ≥6 SKILLS — listed in closeout
- [x] HR-30 TL;DR — this doc opens with `🟢 BOTTOM LINE` + `🔴 WHAT JULZ NEEDS TO DO RIGHT NOW`
- [x] HR-34 NO FALSE BLOCKERS — OneDrive absolute paths worked first try
- [x] HR-36 COMMIT IMMEDIATELY — see closeout

## Related Files

- `lib/hero-photo.ts` — JONY's path contract + helpers
- `components/overview/HeroCinematic.tsx` — JONY's photo-banner component
- `public/hero-photo.jpg` — THIS asset
- `_meta/dashboard-spec/06-a14v-*` — sibling A.14v specs

---

*Author: WALT (V10B, A.14v Wave 2) · 2026-05-27*
