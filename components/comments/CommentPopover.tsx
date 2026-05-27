'use client';

// Phase A.14j Wave 1b · A14J-C3 /inbox ROUTE + COMMENT MODE OVERLAY
//
// Portal-rendered popover anchored at click coords. Captures:
//   - route URL (from usePathname)
//   - click coords (x_pct, y_pct of viewport so dots reflow on resize)
//   - target DOM selector (closest [data-component] else nodeName + class hint)
// Submits POST /api/comments with X-Comment-Token header. Optimistic
// localStorage write happens via provider.
//
// HR-25: skills invoked — frontend-design, vercel:shadcn, vercel:nextjs,
// apple-hig-expert, design:design-critique, anthropic-skills:mobile-responsiveness,
// superpowers:verification-before-completion.

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { Send } from 'lucide-react';
import { useCommentMode } from './CommentModeProvider.local';
import type { CommentDraft, CommentPriority, CommentRecord } from './types';
import { cn } from '@/lib/utils';

export interface CommentPopoverProps {
  /** Viewport-pixel coords from the click that opened the popover. */
  clientX: number;
  clientY: number;
  /** The DOM element that was clicked, for selector extraction. */
  target: Element | null;
  onClose: () => void;
}

function extractSelector(el: Element | null): string {
  if (!el) return 'unknown';
  const closest = el.closest('[data-component]');
  if (closest) {
    const name = closest.getAttribute('data-component');
    if (name) return `[data-component="${name}"]`;
  }
  // Best-effort fallback: tag + first class token + nth-of-type
  const tag = el.tagName.toLowerCase();
  const cls = (el as HTMLElement).className?.toString().split(/\s+/).filter(Boolean)[0];
  return cls ? `${tag}.${cls}` : tag;
}

export function CommentPopover({ clientX, clientY, target, onClose }: CommentPopoverProps) {
  const pathname = usePathname() ?? '/';
  const { addOptimistic, reconcile, refresh } = useCommentMode();
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<CommentPriority>('P1');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Esc closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  const x_pct = (clientX / window.innerWidth) * 100;
  const y_pct = (clientY / window.innerHeight) * 100;

  // Clamp popover within viewport (320px wide × ~260px tall)
  const POP_W = 320;
  const POP_H = 260;
  const left = Math.max(8, Math.min(clientX, window.innerWidth - POP_W - 8));
  const top = Math.max(8, Math.min(clientY, window.innerHeight - POP_H - 8));

  async function handleSubmit() {
    if (!text.trim()) {
      setError('Add a note before submitting.');
      return;
    }
    setSubmitting(true);
    setError(null);

    const draft: CommentDraft = {
      route: pathname,
      x_pct,
      y_pct,
      target_selector: extractSelector(target),
      text: text.trim(),
      priority,
    };

    const optimistic = addOptimistic(draft);

    // Phase A.14k: GH Pages static export has no /api/comments Edge fn.
    // localStorage-only mode → skip POST, keep optimistic row, close popover.
    // When Vercel migration completes (J23/J24), NEXT_PUBLIC_DEPLOY_TARGET
    // flips to 'vercel' and POST resumes.
    const deployTarget = process.env.NEXT_PUBLIC_DEPLOY_TARGET ?? 'gh-pages';
    if (deployTarget === 'gh-pages') {
      // localStorage-only mode — show ephemeral success in console for debug
      // and close. Comment stays in optimistic state visible in /inbox.
      onClose();
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Comment-Token': process.env.NEXT_PUBLIC_COMMENT_TOKEN ?? '',
        },
        body: JSON.stringify(draft),
      });
      if (res.ok) {
        const server = (await res.json()) as CommentRecord;
        reconcile(optimistic.id, server);
      }
      // On conflict / non-2xx: keep optimistic until next refresh (server wins).
      void refresh();
      onClose();
    } catch {
      // Network failure — optimistic row remains in localStorage.
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  const node = (
    <>
      {/* Backdrop catches outside clicks */}
      <div
        className="motion-backdrop-in fixed inset-0 z-[60] bg-ink-900/10"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-label="Add comment"
        className="motion-popover-in fixed z-[61] w-80 rounded-2xl bg-white shadow-soft ring-1 ring-cloud-200 p-4 space-y-3"
        style={{ left, top }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] uppercase tracking-[0.16em] text-ink-700 font-medium">
            Leave feedback · {pathname}
          </span>
          <span className="text-[10px] text-ink-600 tabular-nums">
            {x_pct.toFixed(0)}%, {y_pct.toFixed(0)}%
          </span>
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="What's wrong, what's missing, what's bugging you?"
          rows={4}
          className="w-full resize-none rounded-xl border border-cloud-200 bg-cloud-50/40 px-3 py-2 text-[13px] text-ink-900 placeholder:text-ink-600 focus:outline-none focus:ring-2 focus:ring-cloud-300"
        />

        <fieldset className="flex items-center gap-1">
          <legend className="sr-only">Priority</legend>
          {(['P0', 'P1', 'P2'] as const).map(p => (
            <label
              key={p}
              className={cn(
                'flex-1 cursor-pointer rounded-lg px-2 py-1.5 text-center text-[11px] font-semibold tracking-wide transition',
                priority === p
                  ? p === 'P0'
                    ? 'bg-chip-red text-white ring-1 ring-chip-red'
                    : p === 'P1'
                    ? 'bg-chip-orange text-white ring-1 ring-chip-orange'
                    : 'bg-chip-blue text-white ring-1 ring-chip-blue'
                  : 'bg-cloud-50 text-ink-600 ring-1 ring-cloud-200 hover:bg-cloud-100',
              )}
            >
              <input
                type="radio"
                name="priority"
                value={p}
                checked={priority === p}
                onChange={() => setPriority(p)}
                className="sr-only"
              />
              {p}
            </label>
          ))}
        </fieldset>

        {error && <p className="text-[11px] text-chip-red">{error}</p>}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-ink-600 hover:bg-cloud-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-ink-800 disabled:opacity-50"
          >
            <Send className="h-3 w-3" />
            {submitting ? 'Saving…' : 'Submit'}
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(node, document.body);
}
