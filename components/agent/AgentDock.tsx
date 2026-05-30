'use client';

// A.AA Wave 1c — GLOBAL AGENT DOCK ("permanent chat on every page", Julz's ask).
// A floating "Ask ELON" button mounted in the root layout → opens a chat panel
// that streams from /api/agent and is CONTEXT-AWARE (passes the current route so
// Julz doesn't have to re-explain what she's looking at).
//
// Live on Vercel (where /api/agent runs). On the GH-Pages static export the route
// doesn't exist, so the first send falls back to a friendly "activate on Vercel"
// notice instead of erroring.
//
// Skills (HR-21): frontend-design, refactoring-ui (hierarchy/spacing/contrast),
//   emil-design-eng (panel motion), web-accessibility (focus + Escape + labels).

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Sparkles, X, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type Msg = { role: 'user' | 'assistant'; text: string };

const SUGGESTIONS = [
  "Which brands haven't replied in over a week?",
  'What needs my attention today?',
  "Summarize Phobaxx's deal",
];

export function AgentDock() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to newest, focus input on open, Escape closes.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  async function send(text: string) {
    const query = text.trim();
    if (!query || busy) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: query }, { role: 'assistant', text: '' }]);
    setBusy(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query, routeContext: pathname }),
      });

      const ctype = res.headers.get('content-type') ?? '';
      if (!res.ok || !res.body || !ctype.startsWith('text/plain')) {
        // GH-Pages (no API route) or server error → graceful fallback.
        setMessages((m) => {
          const next = [...m];
          next[next.length - 1] = {
            role: 'assistant',
            text:
              "I'm not live on this deployment yet — the in-dashboard agent runs once the site is on Vercel (one quick login). For now, ask on the **/ask** page or in chat.",
          };
          return next;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const next = [...m];
          next[next.length - 1] = { role: 'assistant', text: acc };
          return next;
        });
      }
    } catch {
      setMessages((m) => {
        const next = [...m];
        next[next.length - 1] = {
          role: 'assistant',
          text: 'Something went wrong reaching the agent. Try again in a moment.',
        };
        return next;
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Floating launcher — present on every route */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ask ELON — open the in-dashboard assistant"
          className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-cloud-sunset pl-4 pr-5 py-3 text-white shadow-card-lg ring-1 ring-iris-300/40 transition-all duration-200 ease-out hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud-300"
        >
          <Sparkles className="h-5 w-5" />
          <span className="font-display text-sm font-semibold">Ask ELON</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Ask ELON"
          className="fixed z-50 inset-x-3 bottom-3 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[400px] max-h-[78vh] flex flex-col rounded-2xl bg-white shadow-card-lg ring-1 ring-cloud-200/70 overflow-hidden motion-popover-in"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 px-4 py-3 bg-cloud-sunset text-white">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="font-display text-sm font-semibold truncate">Ask ELON</span>
              <span className="text-[11px] text-white/75 truncate">· knows your data</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/15 active:scale-95 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-cloud-50/40">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-[13px] text-ink-700 leading-relaxed px-1">
                  Ask anything about your campaigns, brand deals, or SideShift threads — I answer
                  from your own data and cite the source.
                </p>
                <div className="space-y-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="w-full text-left rounded-xl border border-cloud-200/70 bg-white px-3 py-2 text-[13px] text-ink-800 hover:border-iris-300 hover:bg-iris-50/40 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap break-words',
                    m.role === 'user'
                      ? 'bg-iris-500 text-white rounded-br-sm'
                      : 'bg-white text-ink-900 ring-1 ring-cloud-200/70 rounded-bl-sm',
                  )}
                >
                  {m.text || (busy && i === messages.length - 1 ? '…' : '')}
                </div>
              </div>
            ))}
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-cloud-100 p-2.5 bg-white"
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                placeholder="Ask about your business…"
                className="flex-1 resize-none rounded-xl border border-cloud-200 bg-white px-3 py-2 text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-iris-400/40 focus:border-iris-400 max-h-28"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send"
                className={cn(
                  'grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-all duration-150',
                  busy || !input.trim()
                    ? 'bg-cloud-100 text-ink-400 cursor-not-allowed'
                    : 'bg-iris-500 text-white hover:bg-iris-600 active:scale-95',
                )}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
