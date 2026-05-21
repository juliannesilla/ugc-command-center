import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Overall progress bar at top of the SideShift Growth page.
 * Source: spec L827 "Progress dashboard + checklist".
 */
export function ProgressHero({
  percent,
  completeCount,
  partialCount,
  missingCount,
  totalCount,
}: {
  percent: number;
  completeCount: number;
  partialCount: number;
  missingCount: number;
  totalCount: number;
}) {
  const barColor =
    percent >= 90
      ? 'from-emerald-400 to-emerald-600'
      : percent >= 70
        ? 'from-iris-400 to-cloud-sunset'
        : percent >= 40
          ? 'from-peach-400 to-orange-400'
          : 'from-rose-400 to-rose-600';

  return (
    <section
      aria-labelledby="profile-progress-heading"
      className="relative overflow-hidden rounded-3xl bg-white/85 backdrop-blur ring-1 ring-cloud-100 shadow-card px-7 md:px-12 py-6"
    >
      {/* atmospheric blur orbs */}
      <span
        aria-hidden
        className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-iris-200/40 blur-3xl"
      />
      <span
        aria-hidden
        className="absolute -bottom-16 -left-8 h-44 w-44 rounded-full bg-peach-200/40 blur-3xl"
      />

      <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-[10.5px] uppercase tracking-[0.22em] text-cloud-700 font-semibold">
            SideShift Profile Completion
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <h2
              id="profile-progress-heading"
              className="font-display text-4xl md:text-5xl text-ink-900 leading-none tracking-tight tabular-nums"
            >
              {percent}%
            </h2>
            <span className="text-[12px] text-ink-500 font-medium">
              of profile filled
            </span>
          </div>
          <p className="mt-2 text-[13px] text-ink-600 max-w-lg leading-relaxed">
            Every completed field improves brand trust, search rank, and
            visibility on SideShift. Aim for {Math.max(percent + 10, 95)}% next.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-4 md:min-w-[300px]">
          <Stat label="Complete" value={completeCount} tone="emerald" />
          <Stat label="Partial" value={partialCount} tone="amber" />
          <Stat label="Missing" value={missingCount} tone="rose" />
        </div>
      </div>

      {/* progress bar */}
      <div className="relative z-10 mt-6">
        <div className="h-2.5 w-full rounded-full bg-cloud-50 ring-1 ring-cloud-100 overflow-hidden">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-label={`Profile ${percent}% complete (${completeCount} of ${totalCount} fields fully done)`}
            className={cn(
              'h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ease-out',
              barColor,
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-ink-500">
          <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.14em]">
            <Sparkles className="h-3.5 w-3.5 text-cloud-sunset" />
            {completeCount}/{totalCount} fields done
          </span>
          <span className="tabular-nums">{percent}/100</span>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'emerald' | 'amber' | 'rose';
}) {
  const toneCls =
    tone === 'emerald'
      ? 'text-emerald-700 bg-emerald-50 ring-emerald-200'
      : tone === 'amber'
        ? 'text-amber-700 bg-amber-50 ring-amber-200'
        : 'text-rose-700 bg-rose-50 ring-rose-200';
  return (
    <div className={cn('rounded-2xl ring-1 px-3 py-2.5 text-center', toneCls)}>
      <div className="font-display text-xl leading-none tabular-nums">
        {value}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.16em] font-semibold">
        {label}
      </div>
    </div>
  );
}
