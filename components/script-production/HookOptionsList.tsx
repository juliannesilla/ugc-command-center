/**
 * HookOptionsList
 *
 * Phase A.14i Wave 2a — agent A14I-2a SCRIPT-CARD.
 *
 * Renders the 5 candidate opening hooks per campaign as a vertical list of
 * numbered chips. Mirrors the mockup pattern at
 * `UGC/_meta/mockups/17-script-production.png` — left column "Hook Options"
 * panel where each row is a numbered violet chip + dry-funny hook line +
 * subtle hover/copy affordance.
 *
 * Quoted visual element from mockup: numbered chip on the left (1-5) inside
 * a rounded pill, hook text in ink-800, and a tap target that hints at the
 * "click-to-copy" pattern. We render as a server component for static
 * export; the copy interaction is wired as a <button> with a deterministic
 * `data-hook-copy` attribute so a future client wrapper can hydrate it
 * without rewriting the markup. Today the chip is still a visually-static
 * surface (read-only mirror posture) and `aria-label` exposes the action.
 */

import { Copy, Quote } from "lucide-react";

interface HookOptionsListProps {
  /** Ordered candidate hooks (max 5 rendered per mockup). */
  hooks: string[];
  /** Tone hint: defaults to "skeptic" / dry-funny opener per script.json. */
  toneHint?: string;
  className?: string;
}

export function HookOptionsList({ hooks, toneHint, className }: HookOptionsListProps) {
  const visible = hooks.slice(0, 5);

  return (
    <section
      className={`rounded-2xl bg-cloud-50 ring-1 ring-cloud-100 p-4 ${
        className ?? ""
      }`}
      aria-label="Hook options"
    >
      <header className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <Quote className="h-3.5 w-3.5 text-iris-500" aria-hidden="true" />
          <h4 className="font-display text-[12px] font-semibold text-ink-900 uppercase tracking-[0.18em]">
            Hook options
          </h4>
        </div>
        <span className="text-[10px] font-medium text-ink-600 tabular-nums shrink-0">
          {visible.length}/5
        </span>
      </header>

      {toneHint && (
        <p className="text-[11px] italic text-ink-700 mb-2 leading-snug">
          Tone: {toneHint}
        </p>
      )}

      {visible.length === 0 ? (
        <p className="text-[12px] text-ink-700 italic">
          No hook options drafted yet.
        </p>
      ) : (
        <ol className="flex flex-col gap-1.5" role="list">
          {visible.map((hook, i) => (
            <li key={`${i}-${hook.slice(0, 24)}`}>
              <button
                type="button"
                data-hook-copy={hook}
                aria-label={`Copy hook ${i + 1}: ${hook}`}
                // Polish: top-design + microinteractions. Hover state stacks
                // (a) ring color → iris, (b) bg → soft iris wash,
                // (c) subtle 1px translate-y for "lift" affordance,
                // (d) shadow-card on hover, (e) numbered chip rotates the bg
                // color to deeper iris to signal interactivity. Apple HIG:
                // focus-visible has its own ring distinct from hover.
                className="group w-full text-left flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-white ring-1 ring-cloud-100 hover:ring-iris-200 hover:bg-iris-50/50 hover:shadow-card active:bg-iris-50/80 hover:-translate-y-px transition-all duration-200 ease-out cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-iris-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cloud-50 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <span
                  aria-hidden="true"
                  className="shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-iris-100 text-iris-600 group-hover:bg-iris-200 group-hover:text-iris-700 text-[10px] font-bold tabular-nums leading-none transition-colors duration-200 ease-out motion-reduce:transition-none"
                >
                  {i + 1}
                </span>
                <span className="flex-1 min-w-0 text-[12.5px] leading-snug text-ink-800">
                  {hook}
                </span>
                <Copy
                  className="h-3 w-3 text-ink-300 group-hover:text-iris-500 mt-1 shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default HookOptionsList;
