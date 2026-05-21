/**
 * EditChecklist
 *
 * Phase A.14i Wave 2b — agent A14I-2b SCRIPT-CHECKLISTS.
 *
 * Post-production gates surfaced on the Script & Production page (mockup
 * `UGC/_meta/mockups/17-script-production.png` — lower-right checklist
 * panel, treated here as the canonical post-prod / edit gate set).
 *
 * Gates covered (each a `ChecklistItem`):
 *   color · audio mix · captions · FTC disclosure burned in ·
 *   music licensing verified · end card · platform-spec dimensions
 *
 * Pure presentational server component (no state). Same row pattern as
 * `ABRollChecklist` — left indicator · label/hint · right status pill —
 * inside the same rounded-3xl white card with cloud-200 ring + soft
 * shadow surface treatment used across the dashboard.
 */

import { Scissors, CheckCircle2, CircleDot, Circle } from "lucide-react";
import type { ChecklistItem } from "./ABRollChecklist";

// Re-export so callers (e.g. ScriptProductionCard) can import the shared
// row type from either checklist file without caring which one declared it.
export type { ChecklistItem } from "./ABRollChecklist";

interface EditChecklistProps {
  items: ChecklistItem[];
  /** Optional override; defaults to the post-prod gate header. */
  className?: string;
}

const STATUS_TONE: Record<
  ChecklistItem["status"],
  {
    pill: string;
    label: string;
    indicator: typeof CircleDot;
    indicatorClass: string;
  }
> = {
  "not-started": {
    pill: "bg-cloud-100 text-ink-500 ring-cloud-200",
    label: "Pending",
    indicator: Circle,
    indicatorClass: "text-cloud-300",
  },
  filmed: {
    // Reused enum: in post-prod context, "filmed" maps to "in progress".
    pill: "bg-amber-50 text-amber-700 ring-amber-200",
    label: "In progress",
    indicator: CircleDot,
    indicatorClass: "text-amber-500",
  },
  approved: {
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    label: "Cleared",
    indicator: CheckCircle2,
    indicatorClass: "text-emerald-600",
  },
};

function EditRow({ item }: { item: ChecklistItem }) {
  const tone = STATUS_TONE[item.status];
  const Indicator = tone.indicator;
  return (
    <li className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-iris-50/40 transition">
      <Indicator
        className={`h-[18px] w-[18px] mt-[2px] shrink-0 ${tone.indicatorClass}`}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-ink-900 leading-tight">
          {item.label}
        </div>
        {item.hint && (
          <div className="text-[11px] text-ink-500 mt-0.5 leading-snug">
            {item.hint}
          </div>
        )}
      </div>
      <span
        className={`shrink-0 inline-flex items-center text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ring-1 ${tone.pill}`}
      >
        {tone.label}
      </span>
    </li>
  );
}

export function EditChecklist({ items, className }: EditChecklistProps) {
  const cleared = items.filter((i) => i.status === "approved").length;
  const total = items.length;
  const pct = total > 0 ? Math.round((cleared / total) * 100) : 0;

  return (
    <div
      className={`rounded-3xl bg-white ring-1 ring-cloud-200 shadow-soft p-5 ${
        className ?? ""
      }`}
    >
      <header className="flex items-baseline justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Scissors
            className="h-4 w-4 text-iris-500 shrink-0"
            aria-hidden="true"
          />
          <h3 className="font-display text-[15px] font-semibold text-ink-900">
            Edit checklist
          </h3>
        </div>
        <div className="flex items-baseline gap-2 shrink-0">
          <span
            className={`font-display text-base font-semibold tabular-nums ${
              pct >= 80
                ? "text-emerald-700"
                : pct >= 50
                ? "text-amber-700"
                : "text-ink-500"
            }`}
          >
            {total > 0 ? `${pct}%` : "—"}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-ink-400">
            cleared
          </span>
        </div>
      </header>

      {items.length === 0 ? (
        <p className="px-3 py-4 text-[12px] text-ink-500 italic">
          No post-production gates configured yet.
        </p>
      ) : (
        <ul className="space-y-0.5">
          {items.map((item) => (
            <EditRow key={item.id} item={item} />
          ))}
        </ul>
      )}

      <p className="mt-4 pt-3 border-t border-cloud-100 text-[11px] text-ink-500 leading-snug">
        Gates cover color, audio mix, captions, FTC disclosure burn-in, music
        licensing, end card, and platform-spec dimensions. All must clear
        before a deliverable can move to QA.
      </p>
    </div>
  );
}

export default EditChecklist;
