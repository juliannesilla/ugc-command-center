// A.14v Wave 2 — JONY × WALT shared contract for the cinematic hero photo.
//
// WHY THIS FILE EXISTS:
//   Phase A.14v rebuilds the Overview hero to mockup #05 exactly — a single-
//   viewport cinematic photo-banner. JONY owns the layout component
//   (components/overview/HeroCinematic.tsx). WALT owns the actual hero asset
//   shipped under /public/hero-photo.jpg. This helper is the contract between
//   them so neither agent needs to touch the other's file just to swap a path.
//
//   Future admin-override pattern: a CMS or settings panel can mutate
//   HERO_PHOTO_PATH at build time without touching the component itself.
//   For now both consumers (JONY component + WALT asset) point at the same
//   absolute public path.
//
// FALLBACK CONTRACT (HR-10 access-honest):
//   If /public/hero-photo.jpg is missing at request time, the consumer MUST
//   degrade gracefully to the lavender sky-cloud gradient locked by HR-27
//   (A.14c). Mockup #05 itself shows the lavender-sky gradient, so the
//   fallback IS the mockup — no visible defect even pre-asset.
//
// HR-1 CITE: Julz brief A.14v JONY ("hero photo-banner cinematic full-width
//   per mockup #05") + WALT brief A.14v ("shipping public/hero-photo.jpg in
//   parallel; use placeholder if not yet on disk").
// HR-4 SMALLEST: 1 constant + 1 helper. No abstractions, no overrides yet.

import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Absolute public path to the cinematic hero asset.
 * Next.js basePath is applied automatically by the consumer
 * (HeroCinematic resolves the deploy-target prefix via NEXT_PUBLIC_DEPLOY_TARGET
 * because static export under GH Pages adds /ugc-command-center).
 */
export const HERO_PHOTO_PATH = "/hero-photo.jpg" as const;

/**
 * Build-time check: does the hero photo asset exist in /public?
 * Safe to call from a server component — uses node:fs.
 * Returns false in any environment where /public is not on disk (Edge,
 * Vercel preview at import-time, etc.) which correctly degrades to gradient.
 */
export function heroPhotoExists(): boolean {
  try {
    const abs = path.join(process.cwd(), "public", "hero-photo.jpg");
    return existsSync(abs);
  } catch {
    return false;
  }
}

/**
 * Resolve the deploy-aware public URL for the hero photo.
 * Honors next.config.mjs basePath when DEPLOY_TARGET=gh-pages.
 */
export function heroPhotoUrl(): string {
  const isGhPages =
    (process.env.NEXT_PUBLIC_DEPLOY_TARGET ?? "gh-pages") === "gh-pages";
  const basePath = isGhPages ? "/ugc-command-center" : "";
  return `${basePath}${HERO_PHOTO_PATH}`;
}
