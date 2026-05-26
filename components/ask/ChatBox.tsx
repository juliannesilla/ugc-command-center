// A.14t T7 — /ask ChatBox client component.
//
// Textarea + "Copy command" button. Builds `npm run ask -- "<query>"` and
// auto-copies to clipboard so Julz can paste-and-run in her terminal in one
// keystroke. Right rail shows example questions (click → fills textarea).
// Recent answers from data/ask-history.jsonl render below the input.
//
// Why no in-browser fetch: ANTHROPIC_API_KEY must NOT ship to the browser.
// The CLI keeps the key server-side (env var in her terminal session). UI is
// a launcher; the script is the engine.
//
// HR-21 CITE = INVOKE: skills frontend-design, emil-design-eng,
//   refactoring-ui (chrome consistency w/ rest of app).
// HR-4 SMALLEST: text-area + button + history list + examples sidebar. No
//   in-browser polling, no SSE — clipboard hand-off is the smallest viable.

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type AskHistoryEntry = {
  ts: string;
  run_id: string;
  query: string;
  answer: string;
  model: string;
  cost_estimate_usd: number;
};

interface ChatBoxProps {
  history: AskHistoryEntry[];
  exampleQuestions: string[];
}

function escapeForShell(q: string): string {
  // Double-quote-wrap for `npm run ask -- "<q>"`. Escape inner double-quotes.
  // Strip newlines (questions stay single-line in clipboard).
  return q.replace(/\n+/g, ' ').replace(/"/g, '\\"').trim();
}

function fmtRelative(iso: string): string {
  try {
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diffMs = now - then;
    const mins = Math.floor(diffMs / 60_000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch {
    return iso;
  }
}

export default function ChatBox({ history, exampleQuestions }: ChatBoxProps) {
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedFlag, setSavedFlag] = useState(false);

  const command = query.trim()
    ? `npm run ask -- "${escapeForShell(query)}"${savedFlag ? ' --save' : ''}`
    : '';

  async function handleCopy() {
    if (!command) return;
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Fallback: select the readonly input below
      const el = document.getElementById('ask-command-output') as HTMLInputElement | null;
      el?.select();
      document.execCommand('copy');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  function fillExample(q: string) {
    setQuery(q);
  }

  return (
    <section className="px-7 md:px-12 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

        {/* MAIN — input + command + history */}
        <div className="min-w-0">
          {/* Input card */}
          <div className="rounded-2xl border border-ink-200/70 bg-white/80 backdrop-blur-sm shadow-sm p-6">
            <label
              htmlFor="ask-query"
              className="block text-[11px] uppercase tracking-[0.14em] font-medium text-ink-600 mb-3"
            >
              Your question
            </label>
            <textarea
              id="ask-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your UGC data..."
              rows={4}
              className={cn(
                'w-full resize-none rounded-lg border border-ink-200 bg-white',
                'px-4 py-3 text-[15px] leading-relaxed text-ink-900',
                'placeholder:text-ink-400 placeholder:italic',
                'focus:outline-none focus:ring-2 focus:ring-iris-400/40 focus:border-iris-400',
              )}
            />

            <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
              <label className="inline-flex items-center gap-2 text-sm text-ink-700 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={savedFlag}
                  onChange={(e) => setSavedFlag(e.target.checked)}
                  className="h-4 w-4 rounded border-ink-300 text-iris-500 focus:ring-iris-400"
                />
                <span>Save to history (<code className="font-mono text-xs">--save</code>)</span>
              </label>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!command}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
                  'transition-all duration-150',
                  command
                    ? 'bg-ink-900 text-white hover:bg-ink-800 active:scale-[0.98]'
                    : 'bg-ink-100 text-ink-400 cursor-not-allowed',
                )}
              >
                {copied ? (
                  <>
                    <CheckIcon />
                    Copied — paste in terminal
                  </>
                ) : (
                  <>
                    <ClipboardIcon />
                    Copy command
                  </>
                )}
              </button>
            </div>

            {command && (
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-[0.14em] font-medium text-ink-600 mb-2">
                  Run in your terminal
                </p>
                <input
                  id="ask-command-output"
                  type="text"
                  readOnly
                  value={command}
                  className="w-full rounded-md border border-ink-200 bg-ink-50/50 px-3 py-2 font-mono text-[13px] text-ink-800"
                />
                <p className="mt-2 text-xs text-ink-600 italic">
                  Then paste the answer back into the conversation, or set{' '}
                  <code className="font-mono">--save</code> to log it to{' '}
                  <code className="font-mono">data/ask-history.jsonl</code>.
                </p>
              </div>
            )}
          </div>

          {/* Recent answers */}
          <div className="mt-8">
            <h2 className="text-sm uppercase tracking-[0.14em] font-medium text-ink-600 mb-4">
              Recent Q&amp;A {history.length > 0 ? `(${history.length})` : ''}
            </h2>

            {history.length === 0 ? (
              <div className="rounded-xl border border-dashed border-ink-200 bg-white/50 p-6 text-sm text-ink-600 italic">
                No saved Q&amp;A yet. Run a question with <code className="font-mono not-italic">--save</code> to populate this list.
              </div>
            ) : (
              <ul className="space-y-4">
                {history.map((entry) => (
                  <li
                    key={entry.run_id}
                    className="rounded-xl border border-ink-200/70 bg-white/80 p-5 shadow-sm"
                  >
                    <div className="flex items-baseline justify-between gap-3 mb-2">
                      <p className="font-display font-medium text-ink-900 text-[15px] leading-snug">
                        {entry.query}
                      </p>
                      <span className="text-[11px] tracking-wide text-ink-500 shrink-0">
                        {fmtRelative(entry.ts)}
                      </span>
                    </div>
                    <details className="text-sm text-ink-700">
                      <summary className="cursor-pointer text-iris-600 hover:text-iris-700 select-none">
                        Show answer
                      </summary>
                      <pre className="mt-3 whitespace-pre-wrap font-body text-[14px] leading-relaxed text-ink-800 bg-ink-50/40 rounded-md p-4">
                        {entry.answer}
                      </pre>
                      <p className="mt-2 text-[11px] text-ink-500 italic">
                        cost ${entry.cost_estimate_usd?.toFixed(4) ?? '0.0000'} · {entry.model}
                      </p>
                    </details>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* RIGHT RAIL — example questions */}
        <aside className="lg:sticky lg:top-6 self-start">
          <div className="rounded-2xl border border-ink-200/70 bg-white/60 backdrop-blur-sm p-5">
            <h3 className="text-[11px] uppercase tracking-[0.14em] font-medium text-ink-600 mb-3">
              Try one of these
            </h3>
            <ul className="space-y-2">
              {exampleQuestions.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onClick={() => fillExample(q)}
                    className={cn(
                      'w-full text-left rounded-lg px-3 py-2 text-sm leading-snug',
                      'text-ink-800 bg-white/70 border border-ink-200/60',
                      'hover:border-iris-300 hover:bg-iris-50/40 hover:text-ink-900',
                      'transition-colors duration-150',
                    )}
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 rounded-xl border border-ink-200/60 bg-cloud-soft/50 p-4 text-xs text-ink-700 leading-relaxed">
            <p className="font-medium text-ink-900 mb-1">How this works</p>
            <p>
              Claude reads your <code className="font-mono">data/</code> JSONL files +{' '}
              <code className="font-mono">UGC/_meta/</code> source-of-truth docs and
              answers using only what's in your data. If the answer isn't there, it
              tells you what data to add.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ClipboardIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
