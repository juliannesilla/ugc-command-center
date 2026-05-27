// Phase A.14u F6 · A14U-F6-BRAND-FIT — NEW Brand Fit ranking page.
//
// PURPOSE
//   Single sortable table of every brand scored by scripts/score-brand-fit.mjs
//   so Julz can scan the entire inbound funnel by signal-to-noise in one pass.
//   Default sort: Fit DESC (best fits first), so her reply-priority queue reads
//   top-down.
//
// DATA SOURCE
//   data/brand-fit-scores.jsonl — append-only ledger (first line = schema
//   header, rest = one JSON object per scored thread). Read at build time via
//   `fs.readFileSync` so the static export bundles the rankings into the
//   gh-pages deploy (HR-2 PRESERVE: no /api route, no server actions).
//
// HONESTY (HR-10)
//   If the JSONL file is missing OR has zero parseable score rows, the page
//   renders a calm empty state with the exact npm command Julz needs to run
//   to populate it — never fabricates rankings.
//
// SKILLS APPLIED (HR-21 audit trail)
//   - frontend-design                                → editorial KPI tiles + table
//   - apple-hig-expert                               → clarity/deference/depth tokens
//   - vercel:shadcn                                  → reuses PageHeader, no new deps
//   - refactoring-ui                                 → grayscale-first hierarchy, constrained scale
//   - design:design-critique                         → self-critique pass (see end of file)
//   - microinteractions                              → hover scale on Fit badges, row hover, sort affordance
//   - superpowers:verification-before-completion     → DEPLOY_TARGET=gh-pages build PASS gate
//
// HR-2 PRESERVE: existing /brand-responses route untouched (additive change
// there is the Fit column on the Gmail queue, owned by MessageQueue.tsx).
//
// HR-37: NO `export const dynamic = "force-dynamic"` — gh-pages requires
// fully static generation.

import fs from "node:fs";
import path from "node:path";
import { Header } from "@/components/ui/header";
import { PageHeader } from "@/components/ui";
import { ReadOnlyMirrorBadge } from "@/components/ui/read-only-mirror-badge";
import { BrandFitRanking, type BrandFitRow } from "@/components/brand-fit/BrandFitRanking";

export const metadata = {
  title: "Brand Fit Rankings · UGC | Campaign HQ",
  description:
    "Every brand scored 1-10 by niche fit and brand safety. Reply-priority queue at a glance.",
};

function readBrandFitScores(): BrandFitRow[] {
  const filePath = path.join(process.cwd(), "data", "brand-fit-scores.jsonl");
  const out: BrandFitRow[] = [];
  if (!fs.existsSync(filePath)) return out;
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch {
    return out;
  }
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let obj: Record<string, unknown>;
    try {
      obj = JSON.parse(trimmed) as Record<string, unknown>;
    } catch {
      continue;
    }
    // Skip schema header line (carries {schema, version} but no brand/score).
    if (typeof obj.brand !== "string" || typeof obj.score !== "number") {
      continue;
    }
    const niche = String(obj.niche_match ?? "");
    const safety = String(obj.brand_safety ?? "");
    out.push({
      thread_id: String(obj.thread_id ?? ""),
      brand: String(obj.brand),
      score: Math.max(1, Math.min(10, Number(obj.score))),
      reasoning: String(obj.reasoning ?? ""),
      niche_match:
        niche === "strong" || niche === "moderate" || niche === "weak"
          ? niche
          : "moderate",
      brand_safety:
        safety === "safe" || safety === "review" || safety === "avoid"
          ? safety
          : "review",
      scored_at: String(obj.scored_at ?? ""),
    });
  }
  return out;
}

export default function BrandFitPage() {
  const rows = readBrandFitScores();
  const total = rows.length;
  const topFits = rows.filter((r) => r.score >= 8).length;
  const avoid = rows.filter((r) => r.score <= 3).length;
  const avg =
    total === 0
      ? 0
      : Math.round((rows.reduce((s, r) => s + r.score, 0) / total) * 10) / 10;

  // Top brand by Fit (for hero subtitle). Ties broken by appearance order.
  const top = [...rows].sort((a, b) => b.score - a.score)[0] ?? null;

  // Friendly today date for the hero subtitle (UTC-safe).
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const subtitle = top
    ? `${total} brand${total === 1 ? "" : "s"} scored ${today} · top fit: ${top.brand} ${top.score}/10`
    : `No brand-fit scores yet — run \`npm run score-brand-fit\` locally with ANTHROPIC_API_KEY set.`;

  return (
    <>
      <Header />
      <PageHeader
        variant="hero"
        eyebrow="Brand · Fit · Ranked"
        title="Brand Fit Rankings"
        subtitle={subtitle}
        actions={<ReadOnlyMirrorBadge />}
        className="pb-28 lg:pb-32"
      />

      {/* KPI tiles — pulled up over hero band edge (mockup #18 layered density). */}
      <section className="-mt-20 px-7 md:px-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiTile
            label="Top fits ≥ 8"
            value={topFits}
            accent="emerald"
            hint={topFits > 0 ? "Reply first" : "—"}
          />
          <KpiTile
            label="Avoid ≤ 3"
            value={avoid}
            accent="red"
            hint={avoid > 0 ? "Deprioritize" : "—"}
          />
          <KpiTile
            label="Average fit"
            value={avg}
            accent="cloud"
            hint={total > 0 ? "Across all" : "—"}
            valueSuffix="/10"
          />
          <KpiTile
            label="Total scored"
            value={total}
            accent="iris"
            hint={total > 0 ? "Brands" : "Run scorer"}
          />
        </div>
      </section>

      <section className="-mt-6 px-7 md:px-12 pb-16">
        <BrandFitRanking rows={rows} />
      </section>
    </>
  );
}

/**
 * Local KPI tile — kept inline so /brand-fit doesn't drag in /overview deps.
 * Uses same glass-card pattern as /brand-responses stat row for visual rhythm.
 * Apple HIG: clarity (large tabular value), deference (muted accent bg),
 * depth (subtle shadow-card + ring).
 */
function KpiTile({
  label,
  value,
  accent,
  hint,
  valueSuffix,
}: {
  label: string;
  value: number;
  accent: "emerald" | "red" | "cloud" | "iris";
  hint: string;
  valueSuffix?: string;
}) {
  const accentMap = {
    emerald: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    cloud: "bg-cloud-100 text-cloud-700",
    iris: "bg-iris-100 text-iris-600",
  } as const;
  return (
    <div className="glass-card rounded-3xl px-5 py-5 text-left text-ink-900">
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex h-6 items-center rounded-full px-2 text-[10px] font-semibold uppercase tracking-[0.14em] ${accentMap[accent]}`}
        >
          {hint}
        </span>
      </div>
      <p className="mt-3 font-display text-[32px] leading-none text-ink-900 tabular-nums">
        {value}
        {valueSuffix && (
          <span className="ml-0.5 text-[18px] text-ink-500 font-normal">
            {valueSuffix}
          </span>
        )}
      </p>
      <p className="mt-1.5 text-[10px] uppercase tracking-[0.16em] text-ink-500">
        {label}
      </p>
    </div>
  );
}

/*
 * design:design-critique self-pass
 * ────────────────────────────────
 * - First impression: KPI tiles set the funnel size + signal strength before
 *   the eye reaches the table. Tile values use 32px tabular nums so the eye
 *   can compare 4 numbers without scanning labels first.
 * - Visual hierarchy: hero subtitle calls out the top fit by name (Julz's
 *   reply-first target). Inside the table, brand name is bold ink-900, the
 *   score badge is the loudest element (color + ring + bold tabular), niche
 *   and safety chips sit one level down (small caps, muted).
 * - Reasoning column: truncated to 200 chars with full text in the title
 *   tooltip — so it never visually overwhelms the badges on first scan but
 *   stays a hover away.
 * - Consistency: Fit badge tones match the SideShift FitBadge (emerald 8-10,
 *   amber→yellow 5-7, red 1-4) so muscle memory transfers between routes.
 *   (Spec asked for yellow 5-7; we use yellow-100/800 instead of amber.)
 * - A11y: badge carries aria-label "Brand fit score N out of 10"; sort header
 *   carries aria-sort; rows are buttons so keyboard users can tab/enter to
 *   re-sort; tooltip surfaces niche + safety + reasoning text (color-only
 *   signalling is not the sole channel).
 */
