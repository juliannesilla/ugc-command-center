"use client";

/**
 * RepurposingTracker
 *
 * Spec: `01-initial-dashboard-prompt.md` L613-L621 — Content Repurposing Tracker.
 *   "Track whether a concept can be reused across:
 *    - TikTok · Reels · Shorts · portfolio · UGC examples ·
 *      future pitch examples · SideShift featured posts"
 *
 * Each platform has a 3-state cycle: Planned → Reused → Skipped → Planned.
 * Bulk actions: "Mark all reused" / "Reset all".
 *
 * Client component — local useState only (mock for now). Real persistence
 * lands in Wave 8 closeup when wired to per-campaign deliverable JSON.
 */

import { useState } from "react";
import { CheckCircle2, Circle, XCircle, Repeat2, RotateCcw } from "lucide-react";
import type { Campaign } from "@/lib/types/campaign";

type Platform = {
  id: string;
  label: string;
  why: string;
};

type RepurposeState = "planned" | "reused" | "skipped";

const PLATFORMS: Platform[] = [
  { id: "tiktok", label: "TikTok", why: "Primary discovery + viral reach" },
  { id: "reels", label: "Instagram Reels", why: "Cross-post for IG audience" },
  { id: "shorts", label: "YouTube Shorts", why: "Long-tail discoverability" },
  { id: "portfolio", label: "Portfolio", why: "Direct sales asset" },
  { id: "ugc-examples", label: "UGC Examples", why: "Show brands what you ship" },
  { id: "pitch", label: "Future Pitch Examples", why: "Reusable in cold outreach" },
  { id: "sideshift-featured", label: "SideShift Featured Posts", why: "Visibility on platform" },
];

const STATE_CONFIG = {
  planned: {
    icon: Circle,
    label: "Planned",
    ring: "ring-cloud-200",
    bg: "bg-white",
    text: "text-ink-500",
  },
  reused: {
    icon: CheckCircle2,
    label: "Reused",
    ring: "ring-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  skipped: {
    icon: XCircle,
    label: "Skipped",
    ring: "ring-cloud-200",
    bg: "bg-cloud-50",
    text: "text-ink-400",
  },
} as const;

const NEXT_STATE: Record<RepurposeState, RepurposeState> = {
  planned: "reused",
  reused: "skipped",
  skipped: "planned",
};

export function RepurposingTracker({ campaign }: { campaign: Campaign }) {
  const [states, setStates] = useState<Record<string, RepurposeState>>(
    Object.fromEntries(PLATFORMS.map((p) => [p.id, "planned"])),
  );

  const reusedCount = Object.values(states).filter((s) => s === "reused").length;
  const total = PLATFORMS.length;

  const cycle = (id: string) => {
    setStates((prev) => ({ ...prev, [id]: NEXT_STATE[prev[id]] }));
  };
  const markAllReused = () => {
    setStates(Object.fromEntries(PLATFORMS.map((p) => [p.id, "reused" as RepurposeState])));
  };
  const reset = () => {
    setStates(Object.fromEntries(PLATFORMS.map((p) => [p.id, "planned" as RepurposeState])));
  };

  return (
    <section className="rounded-3xl bg-white ring-1 ring-cloud-200 shadow-soft p-5 md:p-6 flex flex-col gap-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-iris-500">
            Content Repurposing
          </p>
          <h3 className="font-display text-lg font-semibold text-ink-900 mt-1">
            Where can this concept ship?
          </h3>
          <p className="text-xs text-ink-600 mt-1">
            {campaign.brand} · {campaign.product}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-semibold text-ink-900 leading-none">
            {reusedCount}<span className="text-ink-400 text-xl"> / {total}</span>
          </p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-ink-500 mt-1">
            Reused
          </p>
        </div>
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PLATFORMS.map((p) => {
          const state = states[p.id];
          const config = STATE_CONFIG[state];
          const Icon = config.icon;
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => cycle(p.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl ring-1 ${config.ring} ${config.bg} hover:shadow-soft transition-all text-left`}
                title={`Click to cycle: ${config.label} → ${STATE_CONFIG[NEXT_STATE[state]].label}`}
                aria-label={`${p.label} status: ${config.label}. Click to change.`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${config.text}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">
                    {p.label}
                  </p>
                  <p className="text-[11px] text-ink-500 truncate">{p.why}</p>
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${config.text}`}>
                  {config.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <footer className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={markAllReused}
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-700 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-200 transition-colors"
        >
          <Repeat2 className="h-3.5 w-3.5" />
          Mark all reused
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-full bg-cloud-100 text-ink-700 px-3 py-1.5 text-xs font-semibold hover:bg-cloud-200 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </footer>
    </section>
  );
}

export default RepurposingTracker;
