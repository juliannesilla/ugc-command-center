/**
 * ScriptProductionCard
 *
 * Phase A.14i Wave 2a — agent A14I-2a SCRIPT-CARD.
 *
 * One card per active campaign on the cross-campaign Script & Production
 * page. Surface combines five panels from the mockup
 * `UGC/_meta/mockups/17-script-production.png`:
 *
 *   1. HOOK OPTIONS (5 numbered chips)         → <HookOptionsList />
 *   2. CORE BEATS (HOOK / INTRO / BODY / CTA)  → inline list
 *   3. SCRIPT DETAIL (verbatim script lines)   → readonly <textarea>
 *   4. A-ROLL + B-ROLL CHECKLIST               → <ABRollChecklist />
 *   5. EDIT CHECKLIST (post-prod gates)        → <EditChecklist />
 *
 * Quoted visual element from mockup: the "Plan it. Film it. Edit it. Ship
 * it." banner sits above the grid; each campaign card uses a soft cloud
 * surface (rounded-3xl + ring-1 ring-cloud-200 + shadow-soft) with the
 * panels laid out in a 2-column responsive split — script content on the
 * left, production checklists on the right.
 *
 * Cross-agent contract:
 * - <ABRollChecklist /> + <EditChecklist /> belong to agent A14I-2b. This
 *   card imports them and adapts the raw production.json checklist shape
 *   (`{ id, label, done: boolean }`) into the canonical `ChecklistItem`
 *   tri-state shape they expect.
 * - <HookOptionsList /> is co-owned by this agent (A14I-2a).
 *
 * Pure server component. All data arrives via props; no useState.
 */

import { Calendar, FileText, MapPin } from "lucide-react";
import { StatusChip, type ChipTone } from "@/components/ui/status-chip";
import { ABRollChecklist, type ChecklistItem } from "./ABRollChecklist";
import { EditChecklist } from "./EditChecklist";
import { HookOptionsList } from "./HookOptionsList";
import type { Campaign } from "@/lib/types/campaign";

// ───────────────────────────────────────────────────────────────────────────
// Local types that mirror the script.json + production.json mock shapes.
// We intentionally keep these inline (not in lib/types/) — same rationale as
// `ABRollChecklist.ChecklistItem`: the campaign type stays focused on the
// canonical 40-field row, while per-page surface shapes live with their
// consumers.
// ───────────────────────────────────────────────────────────────────────────

interface ScriptBeat {
  ts: string;
  section: string;
  line: string;
}

export interface ScriptShape {
  hooks?: string[];
  coreAngle?: string;
  scriptDraft?: ScriptBeat[];
  ctas?: { primary?: string; secondary?: string; tertiary?: string };
  notes?: string[];
}

interface ProductionItem {
  id: string;
  label: string;
  done: boolean;
}

export interface ProductionShape {
  productionStage?: number;
  brollChecklist?: ProductionItem[];
  talkingHeadChecklist?: ProductionItem[];
  editChecklist?: ProductionItem[];
  filmingStatus?: {
    status?: string;
    scheduledAt?: string;
    location?: string;
  };
}

interface ScriptProductionCardProps {
  campaign: Campaign;
  script?: ScriptShape;
  production?: ProductionShape;
}

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────

const STAGE_TONE: Record<string, ChipTone> = {
  FILMING: "yellow",
  EDITING: "blue",
  "SCRIPT READY": "iris",
  "STRATEGY READY": "iris",
  QA: "orange",
  SUBMITTED: "green",
  ACCEPTED: "green",
  POSTED: "green",
  PAID: "green",
};

const SECTION_TONE: Record<string, string> = {
  HOOK: "bg-iris-100 text-iris-600 ring-iris-200",
  INTRO: "bg-cloud-100 text-cloud-700 ring-cloud-200",
  BODY: "bg-peach-100 text-peach-500 ring-peach-300",
  CTA: "bg-emerald-100 text-emerald-700 ring-emerald-200",
};

function toChecklistItems(
  raw: ProductionItem[] | undefined,
  /** When false (default), `done: true` maps to "approved". */
  asInProgress = false,
): ChecklistItem[] {
  if (!raw || raw.length === 0) return [];
  return raw.map((item) => ({
    id: item.id,
    label: item.label,
    status: item.done ? (asInProgress ? "filmed" : "approved") : "not-started",
  }));
}

function formatDueDate(due: string | undefined): string {
  if (!due) return "—";
  try {
    const d = new Date(due);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return due;
  }
}

function deriveScriptDraftText(beats: ScriptBeat[] | undefined): string {
  if (!beats || beats.length === 0) return "";
  return beats
    .map((b) => `[${b.ts}] ${b.section.padEnd(6)} ${b.line}`)
    .join("\n");
}

// ───────────────────────────────────────────────────────────────────────────
// Component
// ───────────────────────────────────────────────────────────────────────────

export function ScriptProductionCard({
  campaign,
  script,
  production,
}: ScriptProductionCardProps) {
  const hooks = script?.hooks ?? [];
  const beats = script?.scriptDraft ?? [];
  const scriptText = deriveScriptDraftText(beats);

  // A-Roll = talking-head shots. B-Roll = brollChecklist. Edit = post-prod.
  const aRoll = toChecklistItems(production?.talkingHeadChecklist);
  const bRoll = toChecklistItems(production?.brollChecklist);
  const editItems = toChecklistItems(production?.editChecklist);

  const stageTone = STAGE_TONE[campaign.current_stage] ?? "iris";

  return (
    <article
      className="rounded-3xl bg-white ring-1 ring-cloud-200 shadow-soft p-5 md:p-6 flex flex-col gap-5"
      aria-label={`${campaign.brand} — script & production card`}
    >
      {/* HEADER ──────────────────────────────────────────────────────────── */}
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-iris-500">
            Script &amp; Production
          </p>
          <h3 className="font-display text-xl font-semibold text-ink-900 mt-1 truncate">
            {campaign.brand}
          </h3>
          <p className="text-sm text-ink-600 mt-0.5 truncate">
            {campaign.product}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <StatusChip tone={stageTone}>{campaign.current_stage}</StatusChip>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-ink-500">
            <Calendar className="h-3 w-3" aria-hidden="true" />
            Due {formatDueDate(campaign.due_date)}
          </span>
        </div>
      </header>

      {/* SCRIPT + HOOKS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LEFT: Hook options */}
        <HookOptionsList
          hooks={hooks}
          toneHint={
            script?.coreAngle
              ? script.coreAngle.split(".").slice(0, 1).join(".")
              : undefined
          }
        />

        {/* RIGHT: Core beats */}
        <section
          className="rounded-2xl bg-iris-50/60 ring-1 ring-iris-100 p-4"
          aria-label="Core beats"
        >
          <header className="flex items-center justify-between gap-2 mb-3">
            <h4 className="font-display text-[12px] font-semibold text-ink-900 uppercase tracking-[0.18em]">
              Core beats
            </h4>
            <span className="text-[10px] font-medium text-ink-400 tabular-nums shrink-0">
              {beats.length} beat{beats.length === 1 ? "" : "s"}
            </span>
          </header>
          {beats.length === 0 ? (
            <p className="text-[12px] text-ink-500 italic">
              No script beats drafted yet.
            </p>
          ) : (
            <ol className="flex flex-col gap-1.5">
              {beats.map((b, i) => (
                <li
                  key={`${i}-${b.ts}`}
                  className="flex items-start gap-2.5 text-[12px] leading-snug"
                >
                  <span
                    className={`shrink-0 inline-flex items-center justify-center px-1.5 py-0.5 rounded-md ring-1 text-[9.5px] font-bold uppercase tracking-wide ${
                      SECTION_TONE[b.section] ??
                      "bg-cloud-100 text-cloud-700 ring-cloud-200"
                    }`}
                  >
                    {b.section}
                  </span>
                  <span className="font-mono text-[10px] tabular-nums text-ink-400 mt-0.5 shrink-0">
                    {b.ts}
                  </span>
                  <span className="text-ink-800 flex-1 min-w-0">{b.line}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {/* SCRIPT DETAIL ─────────────────────────────────────────────────── */}
      <section aria-label="Script detail">
        <header className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <FileText
              className="h-3.5 w-3.5 text-iris-500"
              aria-hidden="true"
            />
            <h4 className="font-display text-[12px] font-semibold text-ink-900 uppercase tracking-[0.18em]">
              Script detail
            </h4>
          </div>
          {campaign.required_length && (
            <span className="text-[10px] text-ink-400">
              Target length: {campaign.required_length}
            </span>
          )}
        </header>
        <textarea
          readOnly
          aria-readonly="true"
          value={
            scriptText ||
            "Script not drafted yet — pull from script.json once SOW is locked."
          }
          className="w-full min-h-[120px] resize-y rounded-xl bg-cloud-50/70 ring-1 ring-cloud-100 p-3 text-[12px] leading-relaxed font-mono text-ink-800 focus:outline-none focus:ring-2 focus:ring-iris-300"
        />
      </section>

      {/* A-ROLL / B-ROLL + EDIT CHECKLISTS (agent A14I-2b) ───────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* A14I-2b owns rendering — if either checklist has no data we
            still render the empty-state via the component's emptyHint. */}
        {(aRoll.length > 0 || bRoll.length > 0) ? (
          <ABRollChecklist aRoll={aRoll} bRoll={bRoll} />
        ) : (
          // TODO(A14I-2b): once production data is populated for every
          // campaign, this fallback can be removed — ABRollChecklist
          // already renders its own empty-state per column.
          <div
            className="rounded-3xl bg-white ring-1 ring-cloud-200 shadow-soft p-5 text-[12px] text-ink-500 italic"
            aria-label="A-Roll / B-Roll placeholder"
          >
            A-Roll / B-Roll checklist will populate once production data is
            seeded for {campaign.brand}.
          </div>
        )}

        {editItems.length > 0 ? (
          <EditChecklist items={editItems} />
        ) : (
          // TODO(A14I-2b): same as above — EditChecklist owns its own
          // empty state once data is wired across all campaigns.
          <div
            className="rounded-3xl bg-white ring-1 ring-cloud-200 shadow-soft p-5 text-[12px] text-ink-500 italic"
            aria-label="Edit checklist placeholder"
          >
            Edit checklist will populate once post-production gates are
            scoped for {campaign.brand}.
          </div>
        )}
      </div>

      {/* FILMING META FOOTER ──────────────────────────────────────────── */}
      {production?.filmingStatus &&
        (production.filmingStatus.status ||
          production.filmingStatus.location) && (
          <footer className="flex flex-wrap items-center gap-3 text-[11px] text-ink-500 pt-2 border-t border-cloud-100">
            {production.filmingStatus.status && (
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-iris-400" />
                Filming: {production.filmingStatus.status}
              </span>
            )}
            {production.filmingStatus.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                {production.filmingStatus.location}
              </span>
            )}
          </footer>
        )}
    </article>
  );
}

export default ScriptProductionCard;
