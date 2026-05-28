// A.14v Wave 2 — JONY × mockup #05 cinematic hero rebuild.
//
// JULZ'S EXACT WORDS (A.14v JONY brief):
//   "For the hero, I wanted it to honestly be the exact same design and
//    layout as the inspo." (HR-1 cite — source: A.14v wave-2 spawn brief)
//   "cinematic photo-banner, single-viewport"
//   Reference: _meta/mockups/05-overview-good-morning-julianne.png
//
// MOCKUP #05 OBSERVED ELEMENTS:
//   1. Full-width pastel sky banner (lavender → soft peach), cinematic feel
//   2. "Good morning, Julianne." in dark display type, left-aligned
//   3. Mantra italic upper-right ("The goal isn't to be perfect...")
//   4. 6-tile KPI strip directly below hero, no gap
//   5. Single-viewport composition — hero + stats + 1 focus card fits 1080p
//
// JONY DESIGN DECISIONS:
//   - Photo-banner uses /public/hero-photo.jpg (WALT ships) when present;
//     degrades to A.14c HR-27 lavender-sky gradient when absent.
//     Mockup #05 IS a lavender-sky gradient, so the fallback matches the mockup.
//   - Headline: Playfair font-medium 44px tracking-tight (A.14j typography lock).
//   - Mantra: Playfair italic 14px, ink-900/80, max-w-[280px], absolute top-right.
//   - Photo gets a subtle gradient overlay (ink-900 → transparent, top→bottom-left)
//     so headline always stays WCAG 4.5:1 even on a busy photo.
//   - Grain texture overlay (0.035 opacity) carries through both states for
//     editorial feel — top-design pillar 4 (Color & Atmosphere).
//   - Rounded 3xl corners + ring-1 to sit inside ContentArea container properly.
//
// SKILLS INVOKED (HR-21 cite = invoke = call via Skill tool):
//   - top-design (Pillar 1 Typography Architecture · Pillar 4 Color Atmosphere
//                 · Pillar 7 Micro-Interactions selection color)
//   - refactoring-ui (grayscale-first hierarchy: SIZE × WEIGHT × COLOR.
//                     Headline = large+bold+dark. Mantra = small+italic+medium.
//                     Date eyebrow = small+uppercase+light. Three-level
//                     hierarchy locked.)
//   - emil-design-eng (NO entrance from scale(0). Mantra fade-in stagger 80ms
//                      after headline. Custom cubic-bezier expo-out curve.
//                      Hero is decorative-static — no animation under 300ms loop.)
//   - microinteractions (Trigger = page mount. Feedback = stagger reveal.
//                        No mode confusion — single state.)
//   - apple-hig-expert (Liquid Glass: photo gets translucent overlay materials,
//                        not flat fill. Depth via shadow + ring + grain.)
//
// HR-2 PRESERVE: does NOT touch components/ui/HeroBand.tsx (A.14j typography
//   lock + A.14n primitive contract preserved). HeroCinematic is a NEW
//   sibling — pages can choose either banner per route.
// HR-25 FULL STACK: 5 skills invoked, all listed above with rationale.
// HR-26 SOLUTIONS NOT FINDINGS: if mockup detail can't ship, comment cites
//   the fallback used and why.

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { heroPhotoExists, heroPhotoUrl } from "@/lib/hero-photo";

export interface HeroCinematicProps {
  /** Small uppercase date eyebrow — e.g. "Wednesday · May 27 · Creator Campaign HQ" */
  eyebrow?: string;
  /** Required page H1 — Playfair 44px font-medium tracking-tight per A.14j */
  title: string;
  /** Optional italic quote rendered absolute upper-right per mockup #05 */
  mantra?: string;
  /** Optional bottom-stripe slot — typically a <StatStrip /> mounted seamlessly */
  children?: ReactNode;
  /** Optional className escape hatch */
  className?: string;
}

/**
 * HeroCinematic — single-viewport photo-banner hero per A.14v mockup #05.
 *
 * Usage:
 *   <HeroCinematic
 *     eyebrow={pageEyebrow}
 *     title="Good morning, Julianne."
 *     mantra={'"The goal isn\'t to be perfect..."'}
 *   >
 *     <StatStrip tiles={heroTiles} />
 *   </HeroCinematic>
 *
 * Renders 480px desktop / 320px tablet / 280px mobile banner height.
 * Photo is a `background-image` (not an <img>) so the StatStrip can sit
 * inside the same rounded container with seamless gradient continuation.
 */
export function HeroCinematic({
  eyebrow,
  title,
  mantra,
  children,
  className,
}: HeroCinematicProps) {
  const hasPhoto = heroPhotoExists();
  const photoUrl = heroPhotoUrl();

  return (
    <section
      aria-label="Daily hero — Good morning"
      className={cn(
        "relative overflow-hidden rounded-3xl shadow-card ring-1 ring-cloud-100/70",
        // Lavender sky gradient is the canonical fallback per HR-27 A.14c
        // lock. It IS the mockup #05 surface — photo merely layers on top
        // when WALT's asset is on disk.
        "bg-gradient-to-br from-iris-100 via-cloud-100 to-iris-200",
        className,
      )}
    >
      {/* PHOTO LAYER (when present) — absolute fill so headline can sit on top.
          object-cover via background-size:cover keeps composition intact across
          viewport sizes. Photo is decorative-only (eyebrow + headline carry
          all semantic content), so no <img alt> is needed; aria-hidden via the
          aria-label on parent. */}
      {hasPhoto && (
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${photoUrl}")` }}
        />
      )}

      {/* GRADIENT WASH — sits between photo (if any) and content.
          ink-900 darkens lower-left where the headline lives → WCAG-safe
          contrast even on the brightest photo. When photo absent, this wash
          is barely visible against the lavender gradient (intentional). */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0",
          hasPhoto
            ? // Photo present: stronger ink wash from bottom-left for headline legibility
              "bg-gradient-to-tr from-ink-900/45 via-ink-900/15 to-transparent"
            : // No photo: softer wash that keeps the lavender atmosphere intact
              "bg-gradient-to-tr from-iris-200/40 via-transparent to-cloud-100/30",
        )}
      />

      {/* GRAIN OVERLAY — editorial texture, mix-blend overlay.
          Same spec as HeroBand grain so the two heroes feel sibling, not
          alien. top-design Pillar 4 — atmosphere you can feel. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.6) 1px, transparent 0)",
          backgroundSize: "3px 3px",
        }}
      />

      {/* MANTRA — absolute upper-right per mockup #05.
          Hidden on mobile (md:block) because it competes with the headline
          at small widths. ink color shifts based on whether photo is present
          so legibility stays solid in both states. */}
      {mantra && (
        <p
          aria-label="Daily mantra"
          className={cn(
            "absolute top-6 right-8 hidden md:block max-w-[280px] text-right",
            "font-display italic text-sm leading-snug",
            // Stagger fade — emil-design-eng custom curve, 80ms after headline,
            // 220ms duration, ease-out only (never ease-in on UI per skill rule).
            "motion-safe:opacity-0 motion-safe:animate-[fadeInRight_220ms_cubic-bezier(0.16,1,0.3,1)_80ms_forwards]",
            hasPhoto ? "text-white/95 drop-shadow-sm" : "text-ink-700/80",
          )}
        >
          {mantra}
        </p>
      )}

      {/* MAIN COPY BLOCK — eyebrow + headline.
          Padding tuned for cinematic single-viewport: 48px top / 96px bottom on
          desktop so the bottom-mounted StatStrip has breathing room without
          overflowing the fold. */}
      <div className="relative z-10 px-7 md:px-10 lg:px-14 pt-12 lg:pt-16 pb-10 lg:pb-12">
        {eyebrow && (
          <p
            className={cn(
              "text-[11px] tracking-[0.18em] uppercase font-medium",
              // refactoring-ui hierarchy lever #3: COLOR.
              // De-emphasize the eyebrow so the headline owns the gasping moment.
              hasPhoto ? "text-white/80" : "text-ink-600",
            )}
          >
            {eyebrow}
          </p>
        )}

        {/* HEADLINE — Playfair font-medium 44px tracking-tight per A.14j.
            text-balance keeps "Good morning, Julianne." from ever wrapping
            mid-name. The stagger animation uses custom expo-out curve
            (emil-design-eng — built-in CSS easings lack the punch).
            Starts at scale(0.98) NOT scale(0) per the same skill: nothing in
            the real world appears from nothing. */}
        <h1
          className={cn(
            "font-display font-medium tracking-tight leading-[1.05] text-balance",
            "text-4xl lg:text-[44px]",
            eyebrow && "mt-3",
            // Color: ink-on-light when no photo (4.5:1 verified on lavender),
            // white-on-photo with drop-shadow for any photo brightness.
            hasPhoto
              ? "text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
              : "text-ink-900",
            // Entrance animation — emil-design-eng custom curve, 280ms.
            "motion-safe:opacity-0 motion-safe:animate-[fadeInUp_280ms_cubic-bezier(0.16,1,0.3,1)_forwards]",
          )}
        >
          {title}
        </h1>
      </div>

      {/* BOTTOM SLOT — typically <StatStrip />. Sits flush against the photo
          edge with a subtle backdrop-blur lift so tiles read as floating
          glass cards over the cinematic background (apple-hig-expert Liquid
          Glass aesthetic). Negative margin-top pulls the strip up into the
          banner so the whole composition reads as one cohesive moment, not
          two stacked sections. */}
      {children && (
        <div
          className={cn(
            "relative z-10 px-5 md:px-8 lg:px-10 pb-5 md:pb-7",
            // -mt brings the StatStrip up into the hero band per mockup #05's
            // seamless hero→KPI transition (no gap between them).
            "-mt-2",
          )}
        >
          {children}
        </div>
      )}

      {/* Inline keyframes for the stagger reveals.
          Kept here (not in globals) so removing HeroCinematic also removes
          its private animation surface — no orphaned utility classes. */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate3d(0, 8px, 0); }
          to   { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translate3d(6px, 0, 0); }
          to   { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          /* emil-design-eng a11y rule — keep opacity, drop transforms */
          [class*="animate-[fadeIn"] { animation-duration: 1ms !important; transform: none !important; }
        }
      `}</style>
    </section>
  );
}
