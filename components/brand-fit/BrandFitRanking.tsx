"use client";

/**
 * BrandFitRanking — client island for /brand-fit page.
 * ─────────────────────────────────────────────────────────────────────────
 * Renders all 31 brand-fit scores in a sortable table. Server component
 * (`app/brand-fit/page.tsx`) reads the JSONL at build time and hands rows
 * down pre-parsed; this island handles sort/filter UI only.
 *
 * DEFAULT SORT
 *   Fit DESC (best fits at top → Julz's reply-priority queue reads top-down).
 *
 * SORTABLE COLUMNS
 *   Brand · Fit · Niche match · Brand safety
 *
 * SKILLS APPLIED (HR-21)
 *   - frontend-design     → editorial table, color-graded badges
 *   - apple-hig-expert    → 44pt tap target on sort headers, 150ms ease-out
 *   - refactoring-ui      → de-emphasized labels, 32px tabular value badges
 *   - microinteractions   → arrow flip on sort direction, badge hover scale
 *   - ux-heuristics       → aria-sort, recognition-not-recall (badge color)
 *
 * HR-2 PRESERVE: zero coupling to /brand-responses components — different
 * data shape, different sort semantics.
 */

import { useMemo, useState } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

export interface BrandFitRow {
  thread_id: string;
  brand: string;
  score: number; // 1-10
  reasoning: string;
  niche_match: "strong" | "moderate" | "weak";
  brand_safety: "safe" | "review" | "avoid";
  scored_at: string;
}

type SortKey = "brand" | "score" | "niche_match" | "brand_safety";
type SortDir = "asc" | "desc";

// Niche / safety ordering for sortable rank. Higher = better.
const NICHE_RANK = { strong: 3, moderate: 2, weak: 1 } as const;
const SAFETY_RANK = { safe: 3, review: 2, avoid: 1 } as const;

function FitBadge({
  score,
  reasoning,
  niche,
  safety,
}: {
  score: number;
  reasoning: string;
  niche: BrandFitRow["niche_match"];
  safety: BrandFitRow["brand_safety"];
}) {
  // Spec: 8-10 green / 5-7 yellow / 1-4 red. Ring + tabular nums for clarity.
  const tone =
    score >= 8
      ? "bg-green-100 text-green-800 ring-green-200"
      : score >= 5
      ? "bg-yellow-100 text-yellow-800 ring-yellow-200"
      : "bg-red-100 text-red-800 ring-red-200";
  const tip = `Fit ${score}/10 · ${niche} / ${safety}${reasoning ? ` — ${reasoning}` : ""}`;
  return (
    <span
      className={`inline-flex h-8 w-11 items-center justify-center rounded-lg ring-1 font-mono text-[14px] font-bold tabular-nums transition-transform duration-150 ease-out hover:scale-110 cursor-help ${tone}`}
      title={tip}
      aria-label={`Brand fit score ${score} out of 10`}
    >
      {score}
    </span>
  );
}

function NicheChip({ value }: { value: BrandFitRow["niche_match"] }) {
  const tone =
    value === "strong"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : value === "moderate"
      ? "bg-cloud-50 text-cloud-700 ring-cloud-100"
      : "bg-ink-100 text-ink-600 ring-ink-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] ring-1 ${tone}`}
    >
      {value}
    </span>
  );
}

function SafetyChip({ value }: { value: BrandFitRow["brand_safety"] }) {
  const tone =
    value === "safe"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : value === "review"
      ? "bg-amber-50 text-amber-700 ring-amber-100"
      : "bg-red-50 text-red-700 ring-red-100";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] ring-1 ${tone}`}
    >
      {value}
    </span>
  );
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: "left" | "center";
}) {
  const Icon = !active ? ArrowUpDown : dir === "desc" ? ArrowDown : ArrowUp;
  return (
    <th
      scope="col"
      aria-sort={!active ? "none" : dir === "desc" ? "descending" : "ascending"}
      className={`px-5 py-3 font-semibold ${align === "center" ? "text-center" : "text-left"}`}
    >
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 rounded-md px-1 py-0.5 transition-colors duration-150 ease-out hover:text-ink-900 cursor-pointer ${
          active ? "text-ink-900" : "text-ink-700"
        }`}
      >
        <span>{label}</span>
        <Icon
          className={`h-3 w-3 shrink-0 transition-transform duration-150 ease-out ${
            active ? "text-cloud-600" : "text-ink-600"
          }`}
          aria-hidden
        />
      </button>
    </th>
  );
}

export function BrandFitRanking({ rows }: { rows: BrandFitRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "brand":
          cmp = a.brand.localeCompare(b.brand);
          break;
        case "score":
          cmp = a.score - b.score;
          break;
        case "niche_match":
          cmp = NICHE_RANK[a.niche_match] - NICHE_RANK[b.niche_match];
          break;
        case "brand_safety":
          cmp = SAFETY_RANK[a.brand_safety] - SAFETY_RANK[b.brand_safety];
          break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
    return arr;
  }, [rows, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      // First click on a column defaults to DESC for numeric/rank fields,
      // ASC for brand (alphabetical reads top-down). Apple HIG: predictable.
      setSortDir(key === "brand" ? "asc" : "desc");
    }
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-3xl bg-white/85 backdrop-blur shadow-card ring-1 ring-cloud-100 px-7 py-16 text-center text-ink-700">
        <p className="font-display text-lg text-ink-700">
          No brand-fit scores yet.
        </p>
        <p className="mt-2 text-[13px]">
          Run{" "}
          <code className="rounded bg-cloud-50 px-1.5 py-0.5 text-[12px] font-mono ring-1 ring-cloud-100">
            npm run score-brand-fit
          </code>{" "}
          locally with{" "}
          <code className="rounded bg-cloud-50 px-1.5 py-0.5 text-[12px] font-mono ring-1 ring-cloud-100">
            ANTHROPIC_API_KEY
          </code>{" "}
          set to populate{" "}
          <code className="rounded bg-cloud-50 px-1.5 py-0.5 text-[12px] font-mono ring-1 ring-cloud-100">
            data/brand-fit-scores.jsonl
          </code>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white/85 backdrop-blur shadow-card ring-1 ring-cloud-100">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="bg-cloud-50/60 text-[10px] uppercase tracking-[0.16em]">
              <SortHeader
                label="Brand"
                active={sortKey === "brand"}
                dir={sortDir}
                onClick={() => handleSort("brand")}
              />
              <SortHeader
                label="Fit"
                active={sortKey === "score"}
                dir={sortDir}
                onClick={() => handleSort("score")}
                align="center"
              />
              <SortHeader
                label="Niche match"
                active={sortKey === "niche_match"}
                dir={sortDir}
                onClick={() => handleSort("niche_match")}
              />
              <SortHeader
                label="Brand safety"
                active={sortKey === "brand_safety"}
                dir={sortDir}
                onClick={() => handleSort("brand_safety")}
              />
              <th
                scope="col"
                className="px-5 py-3 font-semibold text-left text-ink-700"
              >
                Reasoning
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, idx) => (
              <tr
                key={`${r.thread_id || r.brand}-${idx}`}
                className="group border-t border-cloud-100 transition-colors duration-150 ease-out bg-white hover:bg-cloud-50/40"
              >
                <td className="px-5 py-3.5 align-middle">
                  <p className="font-display text-[14px] font-semibold text-ink-900 truncate">
                    {r.brand}
                  </p>
                  {r.scored_at && (
                    <p className="text-[10.5px] uppercase tracking-[0.14em] text-ink-600 font-mono">
                      {new Date(r.scored_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </td>
                <td className="px-5 py-3.5 align-middle text-center">
                  <FitBadge
                    score={r.score}
                    reasoning={r.reasoning}
                    niche={r.niche_match}
                    safety={r.brand_safety}
                  />
                </td>
                <td className="px-5 py-3.5 align-middle">
                  <NicheChip value={r.niche_match} />
                </td>
                <td className="px-5 py-3.5 align-middle">
                  <SafetyChip value={r.brand_safety} />
                </td>
                <td className="px-5 py-3.5 align-middle">
                  <p
                    className="max-w-[42rem] text-[12.5px] leading-relaxed text-ink-600"
                    title={r.reasoning}
                  >
                    {truncate(r.reasoning, 200)}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
