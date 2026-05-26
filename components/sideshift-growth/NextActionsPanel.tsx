/**
 * NextActionsPanel — top 3 visibility moves for SideShift Growth dashboard.
 *
 * Source: mockup #20 (top-right "Next Actions" panel — 3 stacked action cards
 *   with visibility-boost lift labels).
 * Wave 2b A.14n N3-SIDESHIFT-REBUILD.
 *
 * hooked-ux skill: TRIGGER (external — explicit "Do this next") + simple
 *   ACTION (one tap) + immediate visibility REWARD ("+18% visibility").
 * refactoring-ui §1: action title is primary (15px/600), sub is secondary
 *   (11px/400), boost is tertiary tag (10px tracked uppercase).
 */

import { ArrowUpRight, Zap } from 'lucide-react';
import { SIDESHIFT_NEXT_ACTIONS } from '@/lib/mock-data/sideshift-growth';

export function NextActionsPanel() {
  return (
    <section
      aria-labelledby="next-actions-heading"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-iris-50 via-white to-peach-50 ring-1 ring-iris-200 shadow-card p-6 h-full flex flex-col"
    >
      <span
        aria-hidden
        className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-iris-200/40 blur-3xl"
      />

      <div className="relative z-10 flex-1 flex flex-col">
        <p className="text-[10.5px] uppercase tracking-[0.22em] text-cloud-700 font-semibold inline-flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-cloud-sunset" />
          Next Actions
        </p>
        <h2
          id="next-actions-heading"
          className="mt-1 font-display text-[20px] font-medium tracking-tight text-ink-900 leading-tight"
        >
          Do these next.
        </h2>
        <p className="mt-1 text-[12px] text-ink-500 leading-snug">
          3 fastest moves to lift your SideShift visibility.
        </p>

        <ol className="mt-4 space-y-2.5 flex-1">
          {SIDESHIFT_NEXT_ACTIONS.map((action, idx) => (
            <li key={action.id}>
              <button
                type="button"
                aria-label={`Action ${idx + 1}: ${action.title}`}
                className="group w-full text-left rounded-2xl bg-white/90 backdrop-blur ring-1 ring-cloud-100 px-4 py-3 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft hover:ring-iris-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud-sunset"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[14px] font-medium text-ink-900 leading-tight">
                      {action.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-500 leading-snug">
                      {action.sub}
                    </p>
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-semibold text-emerald-700">
                      <Zap className="h-3 w-3" />
                      {action.boost}
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-ink-400 shrink-0 transition group-hover:text-cloud-sunset group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
