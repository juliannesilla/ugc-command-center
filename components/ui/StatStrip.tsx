// Implements: A.14n Wave 2a — N3-PRIMITIVES-HEROKPI
// KPI density primitive — horizontal row of stat tiles.
// Spec: _meta/dashboard-spec/06-a14n-visual-baseline.md Top-10 gap #3
//   "KPI tiles render full-width stacked instead of tight inline row"
// Mockups: 05-overview-good-morning-julianne.png (5 tiles inline below hero),
//          12-creator-command-center-full.png (6-tile dense row).
// Honors A.14j T5 utilities: .card-stat / .stat-label / .stat-number / tabular-nums.
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface StatTile {
  /** Numeric or string value — uses tabular-nums for column alignment */
  number: string | number;
  /** Uppercase eyebrow label below the number */
  label: string;
  /** Optional sub-line (e.g. "campaigns" / "this month") */
  sub?: string;
  /** Optional icon rendered in upper-right rounded chip */
  icon?: ReactNode;
  /** Optional accent ring color — defaults to cloud */
  accent?: "iris" | "pink" | "orange" | "peach" | "green" | "cloud";
}

export interface StatStripProps {
  /** 3-6 tiles supported — grid auto-scales at lg breakpoint */
  tiles: StatTile[];
  /** Optional className override */
  className?: string;
}

const ACCENT_CHIP: Record<NonNullable<StatTile["accent"]>, string> = {
  iris: "bg-iris-50 text-iris-600 ring-iris-100",
  pink: "bg-pink-50 text-pink-600 ring-pink-100",
  orange: "bg-orange-50 text-orange-600 ring-orange-100",
  peach: "bg-amber-50 text-amber-600 ring-amber-100",
  green: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  cloud: "bg-cloud-50 text-cloud-700 ring-cloud-100",
};

// Static map keeps Tailwind JIT happy (dynamic lg:grid-cols-${n} would be purged).
const LG_COLS: Record<number, string> = {
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

/**
 * StatStrip — horizontal row of KPI tiles honoring A.14j stat-tile spec.
 *
 * Usage:
 *   <StatStrip
 *     tiles={[
 *       { number: 16, label: "Total Active", sub: "campaigns", accent: "iris" },
 *       { number: "$1,200", label: "Pending", sub: "this week", accent: "pink" },
 *       { number: 0, label: "Overdue", accent: "orange" },
 *     ]}
 *   />
 *
 * Grid: 2-col mobile → 3-col sm → N-col lg (N = tile count, capped 3-6).
 * Each tile uses .card-stat utility for consistent ring/padding/radius.
 */
export function StatStrip({ tiles, className }: StatStripProps) {
  const n = tiles.length;
  const lgClass = LG_COLS[n] ?? LG_COLS[Math.min(6, Math.max(3, n))];

  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-5",
        lgClass,
        className,
      )}
      role="list"
      aria-label="Key stats"
    >
      {tiles.map((t) => {
        const accent = t.accent ?? "cloud";
        return (
          <div
            key={t.label}
            role="listitem"
            className="card-stat group min-w-0 hover:-translate-y-0.5 hover:shadow-soft transition duration-200 ease-out will-change-transform"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="stat-label leading-tight truncate">{t.label}</p>
              {t.icon && (
                <span
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-xl ring-1 transition duration-200 ease-out group-hover:scale-105 group-hover:ring-2",
                    ACCENT_CHIP[accent],
                  )}
                  aria-hidden
                >
                  {t.icon}
                </span>
              )}
            </div>
            <p className="stat-number mt-2 truncate">{t.number}</p>
            {t.sub && (
              <p className="text-[10.5px] font-normal text-ink-400 mt-1 truncate">
                {t.sub}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
