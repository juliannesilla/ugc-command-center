/**
 * ABRollChecklist
 *
 * Phase A.14i Wave 2b — agent A14I-2b SCRIPT-CHECKLISTS.
 *
 * Combined A-Roll + B-Roll production checklist surfaced on the Script &
 * Production page (mockup `UGC/_meta/mockups/17-script-production.png` —
 * right-side stacked checklist panels).
 *
 * Pure presentational server component (no state). Consumed by
 * `ScriptProductionCard` which owns the data + page composition.
 *
 * Visual quote from mockup: each checklist row pairs a left-side circular
 * status indicator with a label in the middle and a small status pill on
 * the right — placed inside a rounded-3xl white card with cloud-200 ring
 * and soft shadow, matching the existing QAMatrix surface treatment.
 */

import { Camera, Film, CircleDot, CheckCircle2, Circle } from "lucide-react";

/**
 * Per-row checklist item.
 *
 * Shared between ABRollChecklist + EditChecklist. Defined here (re-exported
 * from EditChecklist via re-export) rather than in `lib/types/campaign.ts`
 * because the campaign type intentionally stays focused on the canonical
 * 40-field row (see `lib/types/campaign.ts` doc header — "~40 fields per
 * the prompt spec"). Adding a per-page UI shape there would muddy that
 * contract. Both checklist components are the only consumers.
 */
export interface ChecklistItem {
  /** Stable key for React list reconciliation. */
  id: string;
  /** Short, scannable row label (e.g. "Hook take", "Product hero shot"). */
  label: string;
  /** Optional helper text — one short sentence under the label. */
  hint?: string;
  /** Tri-state status drives the indicator + pill styling. */
  status: "not-started" | "filmed" | "approved";
}

interface ABRollChecklistProps {
  aRoll: ChecklistItem[];
  bRoll: ChecklistItem[];
  /** Optional override; defaults to a soft camera/film icon header. */
  className?: string;
}

const STATUS_TONE: Record<
  ChecklistItem["status"],
  {
    pill: string;
    label: string;
    indicator: typeof CircleDot;
    indicatorClass: string;
    rowClass: string;
  }
> = {
  "not-started": {
    pill: "bg-cloud-100 text-ink-500 ring-cloud-200",
    label: "Not started",
    indicator: Circle,
    indicatorClass: "text-cloud-300",
    rowClass: "",
  },
  filmed: {
    pill: "bg-amber-50 text-amber-700 ring-amber-200",
    label: "Filmed",
    indicator: CircleDot,
    indicatorClass: "text-amber-500",
    rowClass: "",
  },
  approved: {
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    label: "Approved",
    indicator: CheckCircle2,
    indicatorClass: "text-emerald-600",
    rowClass: "",
  },
};

function ChecklistRow({ item }: { item: ChecklistItem }) {
  const tone = STATUS_TONE[item.status];
  const Indicator = tone.indicator;
  return (
    <li
      className={`flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-iris-50/40 transition ${tone.rowClass}`}
    >
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

function ChecklistColumn({
  title,
  icon: Icon,
  items,
  emptyHint,
}: {
  title: string;
  icon: typeof Camera;
  items: ChecklistItem[];
  emptyHint: string;
}) {
  const approved = items.filter((i) => i.status === "approved").length;
  const total = items.length;
  return (
    <section className="flex-1 min-w-0">
      <header className="flex items-center justify-between gap-3 px-3 pb-2 mb-1 border-b border-cloud-100">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="h-4 w-4 text-iris-500 shrink-0" aria-hidden="true" />
          <h4 className="font-display text-[13px] font-semibold text-ink-900 uppercase tracking-wide truncate">
            {title}
          </h4>
        </div>
        <span className="text-[11px] font-medium text-ink-500 shrink-0 tabular-nums">
          {total > 0 ? `${approved}/${total}` : "—"}
        </span>
      </header>
      {items.length === 0 ? (
        <p className="px-3 py-3 text-[12px] text-ink-500 italic">{emptyHint}</p>
      ) : (
        <ul className="space-y-0.5">
          {items.map((item) => (
            <ChecklistRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}

export function ABRollChecklist({ aRoll, bRoll, className }: ABRollChecklistProps) {
  const totalApproved =
    aRoll.filter((i) => i.status === "approved").length +
    bRoll.filter((i) => i.status === "approved").length;
  const totalItems = aRoll.length + bRoll.length;
  const pct = totalItems > 0 ? Math.round((totalApproved / totalItems) * 100) : 0;

  return (
    <div
      className={`rounded-3xl bg-white ring-1 ring-cloud-200 shadow-soft p-5 ${
        className ?? ""
      }`}
    >
      <header className="flex items-baseline justify-between gap-3 mb-3">
        <h3 className="font-display text-[15px] font-semibold text-ink-900">
          A-Roll + B-Roll checklist
        </h3>
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
            {totalItems > 0 ? `${pct}%` : "—"}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-ink-400">
            approved
          </span>
        </div>
      </header>

      <div className="flex flex-col gap-5 md:flex-row md:gap-6">
        <ChecklistColumn
          title="A-Roll"
          icon={Camera}
          items={aRoll}
          emptyHint="No A-Roll shots scoped yet."
        />
        <div
          aria-hidden="true"
          className="hidden md:block w-px bg-cloud-100 self-stretch"
        />
        <ChecklistColumn
          title="B-Roll"
          icon={Film}
          items={bRoll}
          emptyHint="No B-Roll shots scoped yet."
        />
      </div>
    </div>
  );
}

export default ABRollChecklist;
