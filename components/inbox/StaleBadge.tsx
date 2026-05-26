"use client";

/**
 * StaleBadge
 * ─────────────────────────────────────────────────────────────────────────
 * Phase A.14s · A14S-S3-STALE-FLAGGER
 *
 * Surfaces conversation staleness as a visual severity badge per row in
 * /inbox/unified. Lets Julz triage 30+ brand conversations in one pass:
 * who's silent on her, who she owes a reply to, and who's been waiting
 * dangerously long.
 *
 * SEVERITY THRESHOLDS
 *   - outbound + age > 7d            → 🟡 yellow  "Brand silent 7d+ — chase?"
 *   - inbound  + age > 24h           → 🔴 red     "You owe reply >24h"
 *   - inbound  + age > 72h           → ⚫ dark    "URGENT — you owe >3d"
 *     (urgent supersedes the 24h red — most severe wins)
 *   - otherwise                      → null (no badge)
 *
 * EXPORTS
 *   - StaleBadge (component)
 *   - computeStaleness (pure helper — shared with parent list for filtering
 *     and urgency-aware sorting per A14S-S3 spec)
 *
 * SKILLS APPLIED (HR-21)
 *   - frontend-design                      → editorial pill, tone-driven palette
 *   - ux-heuristics:ux-heuristics          → severity ranking 3-step scale,
 *                                            visibility of system status
 *   - vercel:nextjs                        → client component, static-export safe
 *   - microinteractions                    → tone-as-feedback (color = urgency)
 *   - refactoring-ui                       → constrained type ramp, no shadow
 *                                            competition w/ source badge
 */

export type Direction = "inbound" | "outbound" | "unknown";

export type StalenessLevel = "urgent" | "owed" | "silent" | "none";

export type Staleness = {
  level: StalenessLevel;
  label: string;
  /** 3 = urgent, 2 = owed, 1 = silent, 0 = none. Used for urgency-desc sort. */
  rank: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

/**
 * Pure helper. Returns the staleness classification for a row.
 * Most severe match wins (urgent > owed > silent > none).
 */
export function computeStaleness(
  direction: Direction,
  ts: string,
  now: number = Date.now()
): Staleness {
  if (!ts) return { level: "none", label: "", rank: 0 };
  const parsed = new Date(ts).getTime();
  if (!Number.isFinite(parsed)) return { level: "none", label: "", rank: 0 };
  const age = now - parsed;
  if (age < 0) return { level: "none", label: "", rank: 0 };

  if (direction === "inbound") {
    if (age > 72 * HOUR_MS) {
      return { level: "urgent", label: "URGENT — you owe >3d", rank: 3 };
    }
    if (age > 24 * HOUR_MS) {
      return { level: "owed", label: "You owe reply >24h", rank: 2 };
    }
  }
  if (direction === "outbound" && age > 7 * DAY_MS) {
    return { level: "silent", label: "Brand silent 7d+ — chase?", rank: 1 };
  }
  return { level: "none", label: "", rank: 0 };
}

type Props = {
  direction: Direction;
  ts: string;
  /** Optional — let tests inject a fixed clock. */
  now?: number;
  className?: string;
};

const PALETTE: Record<
  Exclude<StalenessLevel, "none">,
  { dot: string; pill: string; ring: string }
> = {
  // ⚫ dark — urgent (highest contrast, ink slab so it reads first)
  urgent: {
    dot: "🚨",
    pill: "bg-ink-900 text-white",
    ring: "ring-ink-900/30",
  },
  // 🔴 red — owed >24h. Uses peach-* family which is the dashboard's warm-warn.
  owed: {
    dot: "⏰",
    pill: "bg-peach-100 text-peach-800",
    ring: "ring-peach-300/50",
  },
  // 🟡 yellow — silent brand. Uses iris-50/700 to feel calmer than red.
  silent: {
    dot: "💤",
    pill: "bg-amber-100 text-amber-800",
    ring: "ring-amber-300/50",
  },
};

export function StaleBadge({ direction, ts, now, className = "" }: Props) {
  const s = computeStaleness(direction, ts, now);
  if (s.level === "none") return null;
  const tone = PALETTE[s.level];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ring-1 ${tone.pill} ${tone.ring} ${className}`}
      title={s.label}
      aria-label={s.label}
    >
      <span aria-hidden="true">{tone.dot}</span>
      <span>{s.label}</span>
    </span>
  );
}
