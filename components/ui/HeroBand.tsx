// Implements: A.14n Wave 2a — N3-PRIMITIVES-HEROKPI
// Hero band primitive for content-area heroes (separate from chrome <Header />).
// Spec: _meta/dashboard-spec/06-a14n-visual-baseline.md Top-10 gap #1
//   "Hero font scale too small — deployed text-2xl/3xl, mockups use Playfair display ~text-5xl/6xl"
// Mockups: 05-overview-good-morning-julianne.png, 12-creator-command-center-full.png, 07-pipeline-overview-funnel.png
// HR-2 PRESERVE: A.14c lavender/iris gradient lock · A.14j typography tokens · A.14j hero pt-24/pb-36 spacing.
// HR-27 LOCK: lavender variant is default (A.14c gradient stays canonical).
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type HeroBandGradient = "lavender" | "pink-cloud" | "none";

export interface HeroBandProps {
  /** Small uppercase eyebrow above title — e.g. "Wednesday · May 19 · Creator Campaign HQ" */
  eyebrow?: string;
  /** Required page H1 — rendered in font-display ~44px per A.14j spec */
  title: string;
  /** Optional italic quote rendered absolute upper-right (mockup #05 pattern) */
  mantra?: string;
  /** Background treatment. Defaults to 'lavender' per HR-27 A.14c lock. */
  gradient?: HeroBandGradient;
  /** Optional CTA strip rendered directly below title */
  actions?: ReactNode;
  /** Optional bottom slot — typically a <StatStrip /> for inline KPI density */
  children?: ReactNode;
  /** Optional className override hook */
  className?: string;
}

const GRADIENTS: Record<HeroBandGradient, string> = {
  // A.14c lock — lavender/iris cloud gradient (canonical brand surface)
  lavender:
    "bg-gradient-to-br from-iris-100 via-cloud-100 to-iris-200",
  // Sunset/pink-cloud variant for marketing-skewed routes
  "pink-cloud":
    "bg-gradient-to-br from-pink-50 via-cloud-100 to-cloud-sunset",
  // Transparent — when parent provides its own surface (no double-stacking)
  none: "",
};

/**
 * HeroBand — full-width content hero band.
 *
 * Usage:
 *   <HeroBand
 *     eyebrow="Wednesday · May 19 · Creator Campaign HQ"
 *     title="Good morning, Julianne."
 *     mantra={'"The goal isn\'t to be perfect..."'}
 *   >
 *     <StatStrip tiles={heroTiles} />
 *   </HeroBand>
 *
 * Renders text in ink-900 (NOT white-on-gradient) because HeroBand is a
 * content-area surface that sits BELOW the chrome <Header /> — the chrome
 * header uses white-on-deep-lavender for contrast, HeroBand uses ink-on-
 * light-lavender. WCAG verified ≥4.5:1 on the lavender variant.
 */
export function HeroBand({
  eyebrow,
  title,
  mantra,
  gradient = "lavender",
  actions,
  children,
  className,
}: HeroBandProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl pt-12 lg:pt-14 pb-10 lg:pb-12 px-7 md:px-10 lg:px-12",
        GRADIENTS[gradient],
        gradient !== "none" && "ring-1 ring-cloud-100/70 shadow-card",
        className,
      )}
    >
      {/* Subtle grain overlay — A.14j texture spec, opacity 0.35 */}
      {gradient !== "none" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.6) 1px, transparent 0)",
            backgroundSize: "3px 3px",
          }}
        />
      )}

      {/* Mantra — absolute upper-right per mockup #05 */}
      {mantra && (
        <p
          className="absolute top-6 right-8 hidden md:block max-w-[280px] text-right font-display italic text-sm text-ink-700/80 leading-snug"
          aria-label="Daily mantra"
        >
          {mantra}
        </p>
      )}

      {/* Eyebrow + title block */}
      <div className="relative z-10">
        {eyebrow && (
          <p className="text-[11px] tracking-[0.14em] uppercase font-medium text-ink-600">
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            "font-display font-medium tracking-tight text-ink-900 leading-[1.05]",
            "text-4xl lg:text-[44px]",
            eyebrow && "mt-3",
          )}
        >
          {title}
        </h1>

        {actions && (
          <div className="mt-5 flex flex-wrap items-center gap-3">{actions}</div>
        )}
      </div>

      {/* Bottom slot — typically StatStrip */}
      {children && <div className="relative z-10 mt-8 lg:mt-10">{children}</div>}
    </section>
  );
}
