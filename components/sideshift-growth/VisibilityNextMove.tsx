import { ArrowUpRight, Eye, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProfileField } from '@/lib/mock-data/sideshift-growth';

/**
 * "Visibility Next Move" smart-feature panel.
 * Source: spec L856–L867 — surfaces top 3 actions.
 */
export function VisibilityNextMove({ moves }: { moves: ProfileField[] }) {
  if (moves.length === 0) return null;

  return (
    <section
      aria-labelledby="visibility-next-move-heading"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-iris-50 via-white to-peach-50 ring-1 ring-iris-200 shadow-card px-7 md:px-12 py-6"
    >
      <span
        aria-hidden
        className="absolute -top-12 -left-10 h-36 w-36 rounded-full bg-iris-200/50 blur-3xl"
      />
      <span
        aria-hidden
        className="absolute -bottom-14 -right-10 h-40 w-40 rounded-full bg-peach-200/50 blur-3xl"
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cloud-sunset text-white shadow-soft">
            <Eye className="h-3.5 w-3.5" />
          </span>
          <p className="text-[10.5px] uppercase tracking-[0.22em] text-cloud-700 font-semibold">
            Visibility Next Move
          </p>
        </div>

        <h2
          id="visibility-next-move-heading"
          className="mt-2 font-display text-2xl text-ink-900 leading-tight"
        >
          Do these next.
        </h2>
        <p className="mt-1 text-[13px] text-ink-600 max-w-lg">
          The three highest-impact actions to bump your visibility on SideShift
          right now.
        </p>

        <ol className="mt-5 grid gap-3 md:grid-cols-3">
          {moves.map((move, idx) => (
            <li key={move.key}>
              <button
                type="button"
                aria-label={`Action ${idx + 1}: ${move.improveLabel}`}
                className={cn(
                  'group w-full text-left rounded-2xl bg-white/90 backdrop-blur ring-1 ring-cloud-100 px-4 py-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft hover:ring-iris-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud-sunset',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cloud-sunset/10 text-cloud-sunset text-[11px] font-bold tabular-nums">
                    {idx + 1}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-ink-400 transition group-hover:text-cloud-sunset group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <p className="mt-3 font-display text-[15px] leading-tight text-ink-900">
                  {move.improveLabel}
                </p>
                <p className="mt-1 text-[11.5px] text-ink-500 leading-snug">
                  {move.label} · {move.why}
                </p>
                <div className="mt-3 inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.14em] font-semibold text-emerald-700">
                  <Zap className="h-3 w-3" />
                  Boost visibility
                </div>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
