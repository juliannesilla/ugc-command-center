'use client';

// Phase A.14j Wave 1b · A14J-C3 /inbox ROUTE + COMMENT MODE OVERLAY
//
// Renders existing comment dots for the current route at saved x_pct/y_pct.
// Also owns the click-capture overlay that, when Comment Mode is ON, fires
// <CommentPopover> at the click coords. This is the single place we listen
// for "drop a new comment" gestures.
//
// Skills: frontend-design, vercel:shadcn, apple-hig-expert,
// design:design-critique, anthropic-skills:mobile-responsiveness.

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useCommentMode } from './CommentModeProvider.local';
import { CommentPopover } from './CommentPopover';
import { cn } from '@/lib/utils';
import type { CommentRecord } from './types';

interface PopoverState {
  clientX: number;
  clientY: number;
  target: Element | null;
}

function dotColor(status: CommentRecord['status']) {
  if (status === 'resolved') return 'bg-chip-green text-white line-through decoration-2';
  if (status === 'in_progress') return 'bg-chip-blue text-white';
  return 'bg-chip-yellow text-ink-900';
}

export function ExistingCommentDots() {
  const pathname = usePathname() ?? '/';
  const { mode, comments } = useCommentMode();
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const [activeThread, setActiveThread] = useState<string | null>(null);

  const routeComments = comments.filter(c => c.route === pathname);

  // Global click capture while Comment Mode is ON
  const handleGlobalClick = useCallback(
    (e: MouseEvent) => {
      if (!mode) return;
      const target = e.target as Element | null;
      // Ignore clicks inside the toggle / existing popover / existing dots
      if (target?.closest('[data-comment-ui]')) return;
      e.preventDefault();
      e.stopPropagation();
      setPopover({ clientX: e.clientX, clientY: e.clientY, target });
    },
    [mode],
  );

  useEffect(() => {
    if (!mode) return;
    document.addEventListener('click', handleGlobalClick, true);
    return () => document.removeEventListener('click', handleGlobalClick, true);
  }, [mode, handleGlobalClick]);

  return (
    <>
      {/* Existing dots — always visible (not just in Comment Mode) so Julz
          sees what she's already flagged on every page. */}
      <div className="pointer-events-none fixed inset-0 z-40" aria-hidden={!mode}>
        {routeComments.map((c, idx) => (
          <button
            key={c.id}
            type="button"
            data-comment-ui="dot"
            onClick={e => {
              e.stopPropagation();
              setActiveThread(prev => (prev === c.id ? null : c.id));
            }}
            aria-label={`Comment ${idx + 1}: ${c.status}`}
            className={cn(
              'pointer-events-auto absolute grid h-6 w-6 -translate-x-1/2 -translate-y-1/2',
              'place-items-center rounded-full text-[10px] font-bold tabular-nums ring-2 ring-white shadow-card',
              'hover:scale-110 transition',
              dotColor(c.status),
            )}
            style={{ left: `${c.x_pct}%`, top: `${c.y_pct}%` }}
          >
            {idx + 1}
          </button>
        ))}

        {/* Thread reveal (read-only stub — full thread UI is C4/C2 follow-up) */}
        {activeThread &&
          routeComments
            .filter(c => c.id === activeThread)
            .map(c => (
              <div
                key={`thread-${c.id}`}
                data-comment-ui="thread"
                className="pointer-events-auto absolute z-[55] w-64 -translate-x-1/2 rounded-xl bg-white p-3 shadow-soft ring-1 ring-cloud-200"
                style={{ left: `${c.x_pct}%`, top: `calc(${c.y_pct}% + 18px)` }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-ink-700 font-medium">
                    {c.priority} · {c.status.replace('_', ' ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveThread(null)}
                    className="text-ink-600 hover:text-ink-900 text-xs"
                    aria-label="Close thread"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-[12px] text-ink-900 leading-relaxed">{c.text}</p>
                {c.pr_url && (
                  <a
                    href={c.pr_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-[11px] font-medium text-cloud-700 hover:underline"
                  >
                    PR →
                  </a>
                )}
              </div>
            ))}
      </div>

      {/* Crosshair cue when Comment Mode is ON. Plain <style> element — we
          avoid touching globals.css (T5 owns that file). */}
      {mode && (
        <style
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `
              html[data-comment-mode='on'],
              html[data-comment-mode='on'] body,
              html[data-comment-mode='on'] *:not([data-comment-ui]):not([data-comment-ui] *) {
                cursor: crosshair !important;
              }
            `,
          }}
        />
      )}

      {popover && (
        <div data-comment-ui="popover">
          <CommentPopover
            clientX={popover.clientX}
            clientY={popover.clientY}
            target={popover.target}
            onClose={() => setPopover(null)}
          />
        </div>
      )}
    </>
  );
}
