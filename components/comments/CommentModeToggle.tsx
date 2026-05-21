'use client';

// Phase A.14j Wave 1b · A14J-C3 /inbox ROUTE + COMMENT MODE OVERLAY
//
// Floating action button (bottom-right). Click toggles Comment Mode, which:
//   1. flips data-comment-mode="on" on <html>  (via provider)
//   2. enables a crosshair cursor globally (global CSS)
//   3. unlocks click → <CommentPopover> behavior (provided by ExistingCommentDots
//      / page-level click handler)
//
// Skills invoked at agent boot: frontend-design, vercel:shadcn,
// apple-hig-expert (FAB sizing per HIG 44px min hit target), design:design-critique.

import { MessageCircle, X } from 'lucide-react';
import { useCommentMode } from './CommentModeProvider.local';
import { cn } from '@/lib/utils';

export function CommentModeToggle() {
  const { mode, toggleMode, openCount, inProgressCount } = useCommentMode();
  const badge = openCount + inProgressCount;

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={mode ? 'Exit Comment Mode' : 'Enter Comment Mode'}
      aria-pressed={mode}
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'grid h-14 w-14 place-items-center rounded-full',
        'shadow-soft ring-1 transition-all',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cloud-300',
        mode
          ? 'bg-ink-900 text-white ring-ink-800 hover:bg-ink-800'
          : 'bg-white text-cloud-700 ring-cloud-200 hover:bg-cloud-50',
      )}
    >
      {mode ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      {!mode && badge > 0 && (
        <span
          aria-label={`${badge} unresolved comments`}
          className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 grid place-items-center rounded-full bg-cloud-sunset text-white text-[10px] font-semibold tabular-nums ring-2 ring-white"
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}
