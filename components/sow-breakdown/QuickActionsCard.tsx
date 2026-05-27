// Implements: mockup #26 right-rail bottom "Quick Actions" card —
//   "Mark as Reviewed" + "Add a Note" buttons.
//
// Owner: A14L-L1 SOW DETAIL. Static read-only mirror — buttons render but
// don't mutate state (this is the GH Pages export). Hover/focus interactions
// included for tactile feel (microinteractions skill).

import { CheckCheck, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QuickActionsCard({ className }: { className?: string }) {
  return (
    <section
      aria-label="Quick actions"
      className={cn(
        'rounded-2xl bg-white/85 backdrop-blur ring-1 ring-iris-100 shadow-card p-4',
        className,
      )}
    >
      <p className="text-[10.5px] uppercase tracking-[0.18em] text-ink-700 font-semibold mb-3">
        Quick Actions
      </p>

      <div className="space-y-2">
        <button
          type="button"
          className={cn(
            'group w-full flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5',
            'bg-cloud-sunset text-white font-medium text-[13px] shadow-soft',
            'transition-all duration-150 ease-out',
            'hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud-500 focus-visible:ring-offset-2',
          )}
        >
          <span className="inline-flex items-center gap-2">
            <CheckCheck className="h-4 w-4" aria-hidden />
            Mark as Reviewed
          </span>
          <span aria-hidden className="text-white/80 transition-transform group-hover:translate-x-0.5">→</span>
        </button>

        <button
          type="button"
          className={cn(
            'group w-full flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5',
            'bg-iris-50 text-iris-600 font-medium text-[13px] ring-1 ring-iris-100',
            'transition-all duration-150 ease-out',
            'hover:bg-iris-100 hover:ring-iris-200 hover:-translate-y-0.5 active:translate-y-0',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-400 focus-visible:ring-offset-2',
          )}
        >
          <span className="inline-flex items-center gap-2">
            <StickyNote className="h-4 w-4" aria-hidden />
            Add a Note
          </span>
          <span aria-hidden className="text-iris-400 transition-transform group-hover:translate-x-0.5">→</span>
        </button>
      </div>

      <p className="mt-3 text-[10.5px] text-ink-600 leading-snug">
        Read-only mirror — actions log to your live command center on next sync.
      </p>
    </section>
  );
}

export default QuickActionsCard;
