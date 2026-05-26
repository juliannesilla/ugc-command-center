// A.14t T2 Concept Generator — UI trigger (client island)
//
// HR-2 PRESERVE: gh-pages static export, no server actions, no API routes.
//                This component generates a CLI command + instructions for the
//                user to run locally where ANTHROPIC_API_KEY is available.
// HR-21-revised: skills invoked by parent agent (frontend-design,
//                anthropic-skills:marketing-ideas, senior-backend,
//                superpowers:verification-before-completion).
// HR-30: TL;DR + Julz-action at top of the drawer body.
//
// Pattern source: A.14p P2 SowParser (same UI-shell-localhost-CLI arch).
// Output: builds `npm run generate-concepts -- --slug=[slug]` with copy-to-clipboard.

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

export interface ConceptGenButtonProps {
  /** Optional className passed to outer wrapper. */
  className?: string;
  /** Initial slug (e.g., when launched from a campaign-detail page). */
  defaultSlug?: string;
}

export function ConceptGenButton({ className, defaultSlug = '' }: ConceptGenButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [slug, setSlug] = React.useState(defaultSlug);
  const [copied, setCopied] = React.useState(false);

  const slugValid = SLUG_PATTERN.test(slug.trim());
  const ready = slugValid;

  const command = `npm run generate-concepts -- --slug=${slug || '[slug]'}`;

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable (e.g., insecure context) — user can select-copy from the code block.
    }
  }, [command]);

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
          'transition hover:-translate-y-px hover:shadow-[0_8px_24px_-12px_rgba(236,72,153,0.45)]',
          'hover:border-fuchsia-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60',
        )}
      >
        <span aria-hidden className="text-base leading-none">🎬</span>
        Generate concepts
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-labelledby="concept-gen-title"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close concept generator"
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
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fuchsia-500">
                  A.14t · Stage 7
                </p>
                <h2 id="concept-gen-title" className="mt-1 font-display text-2xl text-ink-900">
                  Generate 3 creative concepts
                </h2>
                <p className="mt-1.5 text-sm text-ink-700">
                  Reads the structured SOW + brand rules + personal angle, then drafts 3 distinct
                  concept variants with 5 hook options each — in Julz Tier-1 voice.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className={cn(
                  'shrink-0 rounded-full border border-ink-900/10 bg-white p-2',
                  'text-ink-700 transition hover:bg-ink-100 hover:text-ink-900',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60',
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
                  'mb-6 rounded-2xl border border-fuchsia-500/20 bg-fuchsia-50/60 p-4',
                  'text-sm text-ink-900',
                )}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fuchsia-500">
                  What to do right now
                </p>
                <ol className="mt-2 space-y-1.5 pl-4 [list-style:decimal]">
                  <li>Type the campaign slug (must already have 03-sow-breakdown.md).</li>
                  <li>Copy the generated command.</li>
                  <li>Run it in a terminal where ANTHROPIC_API_KEY is set.</li>
                  <li>3-concept × 5-hook markdown lands in the campaign folder.</li>
                </ol>
              </section>

              {/* Slug */}
              <label htmlFor="concept-gen-slug" className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-700">
                  Campaign slug
                </span>
                <input
                  id="concept-gen-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.trim().toLowerCase())}
                  placeholder="sideshift-parakeetai"
                  spellCheck={false}
                  autoComplete="off"
                  className={cn(
                    'mt-1.5 block w-full rounded-xl border bg-white px-4 py-2.5',
                    'font-mono text-sm text-ink-900 placeholder:text-ink-400',
                    'focus:outline-none focus:ring-2',
                    slug && !slugValid
                      ? 'border-rose-300 focus:ring-rose-300/60'
                      : 'border-ink-900/12 focus:border-fuchsia-500/60 focus:ring-fuchsia-500/40',
                  )}
                />
                <span className="mt-1.5 block text-xs text-ink-700">
                  Lowercase, hyphen-separated. Must match a folder under{' '}
                  <code className="font-mono text-[11px] text-ink-900">OneDrive/Desktop/UGC/</code>
                  {' '}that already has{' '}
                  <code className="font-mono text-[11px] text-ink-900">03-sow-breakdown.md</code>.
                </span>
                {slug && !slugValid && (
                  <span className="mt-1 block text-xs text-rose-600">
                    Slug must be lowercase letters, digits, and hyphens (no leading/trailing dash).
                  </span>
                )}
              </label>

              {/* Command */}
              <section className="mt-6">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-700">
                    Generated command
                  </h3>
                  <span
                    className={cn(
                      'text-[11px] font-medium',
                      ready ? 'text-emerald-600' : 'text-ink-400',
                    )}
                  >
                    {ready ? 'Ready to copy' : 'Enter a valid slug first'}
                  </span>
                </div>
                <div
                  className={cn(
                    'mt-2 overflow-hidden rounded-2xl border bg-ink-900',
                    ready ? 'border-fuchsia-500/40' : 'border-ink-900',
                  )}
                >
                  <pre className="overflow-x-auto px-5 py-4 font-mono text-[13px] leading-6 text-emerald-200">
                    <span className="text-ink-400">$ </span>
                    {command}
                  </pre>
                  <div className="flex items-center justify-between border-t border-white/10 bg-ink-900/95 px-5 py-2.5">
                    <span className="text-[11px] text-ink-400">
                      Runs locally · needs <code className="text-ink-100">ANTHROPIC_API_KEY</code>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      disabled={!ready}
                      className={cn(
                        'rounded-full px-3.5 py-1.5 text-[11px] font-medium transition',
                        ready
                          ? 'bg-white text-ink-900 hover:bg-fuchsia-50'
                          : 'cursor-not-allowed bg-white/20 text-white/60',
                      )}
                    >
                      {copied ? 'Copied ✓' : 'Copy command'}
                    </button>
                  </div>
                </div>
              </section>

              {/* Inputs the script reads */}
              <section className="mt-6 rounded-2xl border border-ink-900/8 bg-cloud-50 p-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-700">
                  What the script reads (in order)
                </h3>
                <ul className="mt-2 space-y-1.5 text-xs text-ink-700">
                  <li>
                    ▸ <code className="font-mono text-[11px] text-ink-900">03-sow-breakdown.md</code>{' '}
                    <strong>(required)</strong> — structured SOW from{' '}
                    <code className="font-mono text-[11px]">/sow-breakdown/parse</code>
                  </li>
                  <li>
                    ▸ <code className="font-mono text-[11px] text-ink-900">00-brand-rules.md</code>{' '}
                    (optional) — brand-specific bans + tone overrides
                  </li>
                  <li>
                    ▸ <code className="font-mono text-[11px] text-ink-900">05-personal-angle.md</code>{' '}
                    (optional) — Julz's authentic hook into the product
                  </li>
                </ul>
              </section>

              {/* What gets written */}
              <section className="mt-6 rounded-2xl border border-ink-900/8 bg-white p-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-700">
                  What gets written
                </h3>
                <ul className="mt-2 space-y-1.5 text-xs text-ink-700">
                  <li>
                    ▸{' '}
                    <code className="font-mono text-[11px] text-ink-900">
                      UGC/{slug || '[slug]'}/07-creative-concepts.md
                    </code>
                  </li>
                  <li>▸ 3 distinct concepts × 5 cold-open hooks each</li>
                  <li>▸ Per-concept: core story · emotional hook · why-it-hits-SOW · CTA · risk · production complexity</li>
                  <li>▸ Strict-JSON Zod validation — bad output aborts the write</li>
                  <li>
                    ▸ Spend ledger:{' '}
                    <code className="font-mono text-[11px] text-ink-900">
                      scripts/cron-output/concept-gen-spend.jsonl
                    </code>{' '}
                    · daily cap $5
                  </li>
                </ul>
              </section>

              {/* Step-by-step */}
              <section className="mt-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-700">
                  Step-by-step
                </h3>
                <ol className="mt-2 space-y-3 text-sm text-ink-900">
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fuchsia-500 text-[11px] font-semibold text-white">
                      1
                    </span>
                    <div>
                      Confirm the campaign folder has{' '}
                      <code className="font-mono text-xs text-ink-900">03-sow-breakdown.md</code>{' '}
                      (use <em>Parse SOW</em> above if not).
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fuchsia-500 text-[11px] font-semibold text-white">
                      2
                    </span>
                    <div>
                      Open a terminal in the{' '}
                      <code className="font-mono text-xs text-ink-900">ugc-command-center</code> repo
                      and confirm{' '}
                      <code className="font-mono text-xs text-ink-900">ANTHROPIC_API_KEY</code> is set.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fuchsia-500 text-[11px] font-semibold text-white">
                      3
                    </span>
                    <div>Paste the command above and run it. ~30-60 sec end-to-end.</div>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fuchsia-500 text-[11px] font-semibold text-white">
                      4
                    </span>
                    <div>
                      Open the written file, pick your favorite hook per concept, and lock #1 in the
                      "Locked Concept" section.
                    </div>
                  </li>
                </ol>
              </section>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default ConceptGenButton;
