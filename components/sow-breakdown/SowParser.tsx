// A.14p P2 SOW Parser — UI shell (client island)
//
// HR-2 PRESERVE: gh-pages static export, no server actions, no API routes.
//                This component generates a CLI command + instructions for the
//                user to run locally where ANTHROPIC_API_KEY is available.
// HR-21-revised: skills invoked by parent agent (frontend-design, vercel:nextjs,
//                anthropic-skills:meeting-analyzer, senior-backend,
//                superpowers:verification-before-completion).
// HR-30: TL;DR + Julz-action at top of the drawer body.
//
// Pattern source: A.14p P1 campaign wizard (UI shell that generates
// localhost-run CLI commands). Same arch — no Anthropic API call in the
// browser, the user copy-pastes the command into their terminal.
//
// Output: builds `npm run parse-sow -- --slug=[slug] --input=stdin` or
//   `npm run parse-sow -- --slug=[slug] --input=path/to/sow.txt` and
//   instructs the user how to pipe the SOW text in.

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type Mode = 'stdin' | 'file';

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

export interface SowParserProps {
  /** Optional className passed to outer wrapper. */
  className?: string;
  /** Initial slug (e.g., when launched from a campaign-detail page). */
  defaultSlug?: string;
}

export function SowParser({ className, defaultSlug = '' }: SowParserProps) {
  const [open, setOpen] = React.useState(false);
  const [slug, setSlug] = React.useState(defaultSlug);
  const [sowText, setSowText] = React.useState('');
  const [filePath, setFilePath] = React.useState('');
  const [mode, setMode] = React.useState<Mode>('stdin');
  const [copied, setCopied] = React.useState(false);

  const slugValid = SLUG_PATTERN.test(slug.trim());
  const hasInput = mode === 'stdin' ? sowText.trim().length > 0 : filePath.trim().length > 0;
  const ready = slugValid && hasInput;

  const command =
    mode === 'stdin'
      ? `npm run parse-sow -- --slug=${slug || '[slug]'} --input=stdin`
      : `npm run parse-sow -- --slug=${slug || '[slug]'} --input="${filePath || '[path/to/sow.txt]'}"`;

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable (e.g., insecure context) — fail quiet, user can select-copy from the code block.
    }
  }, [command]);

  const handleCopySow = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(sowText);
    } catch {
      // ignore
    }
  }, [sowText]);

  return (
    <div className={cn('relative', className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center gap-2 rounded-full',
          'border border-ink-900/12 bg-white px-5 py-2.5',
          'text-sm font-medium text-ink-900',
          'shadow-[0_1px_2px_rgba(15,23,42,0.06)]',
          'transition hover:-translate-y-px hover:shadow-[0_8px_24px_-12px_rgba(91,77,255,0.45)]',
          'hover:border-iris-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-iris-500/60',
        )}
      >
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full bg-gradient-to-br from-iris-500 to-iris-500"
        />
        Parse SOW
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sow-parser-title"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close SOW parser"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer */}
          <aside
            className={cn(
              'relative ml-auto flex h-full w-full max-w-[640px] flex-col',
              'border-l border-ink-900/8 bg-white/95 backdrop-blur',
              'shadow-[-24px_0_64px_-16px_rgba(15,23,42,0.18)]',
              'animate-in slide-in-from-right duration-200',
            )}
          >
            <header className="flex items-start justify-between gap-4 border-b border-ink-900/8 px-7 py-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-iris-500">
                  A.14p · Stage 3
                </p>
                <h2 id="sow-parser-title" className="mt-1 font-display text-2xl text-ink-900">
                  Parse SOW into structured fields
                </h2>
                <p className="mt-1.5 text-sm text-ink-700">
                  Paste raw SOW, copy the command, run locally — Anthropic API writes the structured
                  03-sow-breakdown.md back to your campaign folder.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className={cn(
                  'shrink-0 rounded-full border border-ink-900/10 bg-white p-2',
                  'text-ink-700 transition hover:bg-ink-100 hover:text-ink-900',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-iris-500/60',
                )}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                  <path
                    d="M2 2l10 10M12 2L2 12"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-7 py-6">
              {/* HR-30 — what Julz needs to do right now */}
              <section
                aria-label="What to do right now"
                className={cn(
                  'mb-6 rounded-2xl border border-iris-500/20 bg-iris-50/60 p-4',
                  'text-sm text-ink-900',
                )}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-iris-500">
                  What to do right now
                </p>
                <ol className="mt-2 space-y-1.5 pl-4 [list-style:decimal]">
                  <li>Type the campaign slug (folder name under UGC/).</li>
                  <li>Paste the raw SOW text (or point at a saved .txt file).</li>
                  <li>Copy the generated command and run it in your terminal.</li>
                </ol>
              </section>

              {/* Slug */}
              <label htmlFor="sow-parser-slug" className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-700">
                  Campaign slug
                </span>
                <input
                  id="sow-parser-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.trim().toLowerCase())}
                  placeholder="sideshift-parakeetai"
                  spellCheck={false}
                  autoComplete="off"
                  className={cn(
                    'mt-1.5 block w-full rounded-xl border bg-white px-4 py-2.5',
                    'font-mono text-sm text-ink-900 placeholder:text-ink-600',
                    'focus:outline-none focus:ring-2',
                    slug && !slugValid
                      ? 'border-rose-300 focus:ring-rose-300/60'
                      : 'border-ink-900/12 focus:border-iris-500/60 focus:ring-iris-500/40',
                  )}
                />
                <span className="mt-1.5 block text-xs text-ink-700">
                  Lowercase, hyphen-separated. Matches the folder under{' '}
                  <code className="font-mono text-[11px] text-ink-900">OneDrive/Desktop/UGC/</code>.
                </span>
                {slug && !slugValid && (
                  <span className="mt-1 block text-xs text-rose-600">
                    Slug must be lowercase letters, digits, and hyphens (no leading/trailing dash).
                  </span>
                )}
              </label>

              {/* Mode toggle */}
              <div className="mt-6">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-700">
                  Input source
                </span>
                <div
                  role="tablist"
                  aria-label="Input source"
                  className="mt-1.5 inline-flex rounded-full border border-ink-900/12 bg-ink-100/60 p-1"
                >
                  {(['stdin', 'file'] as Mode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="tab"
                      aria-selected={mode === m}
                      onClick={() => setMode(m)}
                      className={cn(
                        'rounded-full px-4 py-1.5 text-xs font-medium transition',
                        mode === m
                          ? 'bg-white text-ink-900 shadow-[0_1px_2px_rgba(15,23,42,0.08)]'
                          : 'text-ink-700 hover:text-ink-900',
                      )}
                    >
                      {m === 'stdin' ? 'Paste text' : 'Use file path'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional input */}
              {mode === 'stdin' ? (
                <label htmlFor="sow-parser-text" className="mt-4 block">
                  <span className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-700">
                      Raw SOW text
                    </span>
                    {sowText && (
                      <button
                        type="button"
                        onClick={handleCopySow}
                        className="text-[11px] font-medium text-iris-500 hover:text-iris-700"
                      >
                        Copy SOW text
                      </button>
                    )}
                  </span>
                  <textarea
                    id="sow-parser-text"
                    value={sowText}
                    onChange={(e) => setSowText(e.target.value)}
                    rows={10}
                    placeholder={
                      'Paste the entire SOW here — brand brief, deliverable count, payment terms, deadlines, do-not-say list, brand portal URL…'
                    }
                    className={cn(
                      'mt-1.5 block w-full rounded-xl border border-ink-900/12 bg-white px-4 py-3',
                      'text-sm leading-6 text-ink-900 placeholder:text-ink-600',
                      'focus:border-iris-500/60 focus:outline-none focus:ring-2 focus:ring-iris-500/40',
                    )}
                  />
                  <span className="mt-1.5 block text-xs text-ink-700">
                    {sowText.length.toLocaleString()} characters · paste includes brand brief +
                    payment + deadlines + restrictions.
                  </span>
                </label>
              ) : (
                <label htmlFor="sow-parser-file" className="mt-4 block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-700">
                    SOW file path
                  </span>
                  <input
                    id="sow-parser-file"
                    value={filePath}
                    onChange={(e) => setFilePath(e.target.value)}
                    placeholder="C:/Users/julia/OneDrive/Desktop/UGC/sideshift-parakeetai/sow/sow-v1.md"
                    spellCheck={false}
                    autoComplete="off"
                    className={cn(
                      'mt-1.5 block w-full rounded-xl border border-ink-900/12 bg-white px-4 py-2.5',
                      'font-mono text-xs text-ink-900 placeholder:text-ink-600',
                      'focus:border-iris-500/60 focus:outline-none focus:ring-2 focus:ring-iris-500/40',
                    )}
                  />
                  <span className="mt-1.5 block text-xs text-ink-700">
                    Absolute path. UTF-8 plain text or markdown.
                  </span>
                </label>
              )}

              {/* Command */}
              <section className="mt-6">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-700">
                    Generated command
                  </h3>
                  <span
                    className={cn(
                      'text-[11px] font-medium',
                      ready ? 'text-emerald-600' : 'text-ink-600',
                    )}
                  >
                    {ready ? 'Ready to copy' : 'Fill slug + input first'}
                  </span>
                </div>
                <div
                  className={cn(
                    'mt-2 overflow-hidden rounded-2xl border bg-ink-900',
                    ready ? 'border-iris-500/40' : 'border-ink-900',
                  )}
                >
                  <pre className="overflow-x-auto px-5 py-4 font-mono text-[13px] leading-6 text-emerald-200">
                    <span className="text-ink-600">$ </span>
                    {command}
                  </pre>
                  <div className="flex items-center justify-between border-t border-white/10 bg-ink-900/95 px-5 py-2.5">
                    <span className="text-[11px] text-ink-600">
                      Runs locally · needs <code className="text-ink-100">ANTHROPIC_API_KEY</code>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      disabled={!ready}
                      className={cn(
                        'rounded-full px-3.5 py-1.5 text-[11px] font-medium transition',
                        ready
                          ? 'bg-white text-ink-900 hover:bg-iris-50'
                          : 'cursor-not-allowed bg-white/20 text-white/60',
                      )}
                    >
                      {copied ? 'Copied ✓' : 'Copy command'}
                    </button>
                  </div>
                </div>
              </section>

              {/* Step-by-step */}
              <section className="mt-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-700">
                  Step-by-step
                </h3>
                <ol className="mt-2 space-y-3 text-sm text-ink-900">
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-iris-500 text-[11px] font-semibold text-white">
                      1
                    </span>
                    <div>
                      Open a terminal in the{' '}
                      <code className="font-mono text-xs text-ink-900">ugc-command-center</code> repo
                      and confirm{' '}
                      <code className="font-mono text-xs text-ink-900">ANTHROPIC_API_KEY</code> is
                      set in your environment.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-iris-500 text-[11px] font-semibold text-white">
                      2
                    </span>
                    <div>
                      Paste the command above and run it.
                      {mode === 'stdin' && (
                        <>
                          {' '}When the prompt blocks waiting for input, paste the SOW text, press
                          <kbd className="mx-1 rounded border border-ink-900/12 bg-white px-1.5 py-0.5 font-mono text-[11px]">
                            Enter
                          </kbd>
                          , then send EOF —
                          <kbd className="mx-1 rounded border border-ink-900/12 bg-white px-1.5 py-0.5 font-mono text-[11px]">
                            Ctrl+D
                          </kbd>
                          on macOS/Linux,
                          <kbd className="mx-1 rounded border border-ink-900/12 bg-white px-1.5 py-0.5 font-mono text-[11px]">
                            Ctrl+Z
                          </kbd>
                          then
                          <kbd className="mx-1 rounded border border-ink-900/12 bg-white px-1.5 py-0.5 font-mono text-[11px]">
                            Enter
                          </kbd>
                          on Windows.
                        </>
                      )}
                      {mode === 'file' && (
                        <>
                          {' '}The script reads the file at the path you pasted — no further input
                          needed.
                        </>
                      )}
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-iris-500 text-[11px] font-semibold text-white">
                      3
                    </span>
                    <div>
                      The script calls Claude, validates the structured fields with Zod, and writes
                      the rendered 3-column table to{' '}
                      <code className="font-mono text-xs text-ink-900">
                        UGC/{slug || '[slug]'}/03-sow-breakdown.md
                      </code>
                      . Spend is appended to{' '}
                      <code className="font-mono text-xs text-ink-900">
                        scripts/cron-output/sow-parse-spend.jsonl
                      </code>
                      . Daily cap: $5 — script aborts if exceeded.
                    </div>
                  </li>
                </ol>
              </section>

              {/* Output preview */}
              <section className="mt-6 rounded-2xl border border-ink-900/8 bg-cloud-50 p-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-700">
                  What gets written
                </h3>
                <ul className="mt-2 space-y-1.5 text-xs text-ink-700">
                  <li>
                    ▸ 3-column Requirement | Detail | What It Means table (per master DOCX para 218)
                  </li>
                  <li>▸ Deliverables, payment, deadlines, do-not-say list, brand portal URL</li>
                  <li>▸ Strict-JSON Zod validation — bad output aborts the write</li>
                  <li>▸ Spend ledger entry: input/output tokens + USD per run</li>
                </ul>
              </section>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default SowParser;
