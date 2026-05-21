// Implements: 13-sow-breakdown-elf.png + 21-sow-breakdown-summer-glow.png — "What this means for you" plain-English contract-translation callout (blue/peach palette)
//
// Sources (deep-read):
// - 13-sow-breakdown-elf.png: right-rail card titled "What this means for you" with bulleted
//   plain-English interpretations of contract terms (Usage Rights, Exclusivity, etc.).
// - 21-sow-breakdown-summer-glow.png: bottom-right "All terms covered? Confirm with brand" CTA.
//
// Renders a stateless server component. Accepts `points: string[]` — each is one plain-English
// translation sentence. Falls back to an empty state if no points are passed in.

import { cn } from '@/lib/utils';

export type CalloutTone = 'blue' | 'peach' | 'iris';

const toneStyles: Record<CalloutTone, {
  card: string;
  ring: string;
  headerLabel: string;
  bullet: string;
  accentBar: string;
  iconBg: string;
  iconFg: string;
}> = {
  blue: {
    card:        'bg-gradient-to-br from-sky-50 via-white to-iris-50',
    ring:        'ring-sky-200/70',
    headerLabel: 'text-sky-600',
    bullet:      'bg-sky-500',
    accentBar:   'bg-gradient-to-r from-sky-300 to-iris-400',
    iconBg:      'bg-sky-100',
    iconFg:      'text-sky-600',
  },
  peach: {
    card:        'bg-gradient-to-br from-peach-100 via-white to-cloud-50',
    ring:        'ring-peach-300/60',
    headerLabel: 'text-peach-500',
    bullet:      'bg-peach-500',
    accentBar:   'bg-gradient-to-r from-peach-300 to-peach-500',
    iconBg:      'bg-peach-100',
    iconFg:      'text-peach-500',
  },
  iris: {
    card:        'bg-gradient-to-br from-iris-50 via-white to-cloud-50',
    ring:        'ring-iris-200/70',
    headerLabel: 'text-iris-500',
    bullet:      'bg-iris-400',
    accentBar:   'bg-gradient-to-r from-iris-300 to-cloud-400',
    iconBg:      'bg-iris-100',
    iconFg:      'text-iris-500',
  },
};

// Small inline lightbulb-ish icon (kept inline to avoid extra deps)
function InsightIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 3a6 6 0 0 0-3.5 10.9V16a1.5 1.5 0 0 0 1.5 1.5h4a1.5 1.5 0 0 0 1.5-1.5v-2.1A6 6 0 0 0 12 3Z" />
      <path d="M10 20.5h4" />
      <path d="M11 17.5v3" />
      <path d="M13 17.5v3" />
    </svg>
  );
}

export function WhatThisMeansCallout({
  points,
  title = 'What this means for you',
  subtitle,
  tone = 'blue',
  className,
}: {
  /** Plain-English translation sentences, one per bullet. */
  points: string[];
  /** Optional override for the header. Defaults to "What this means for you". */
  title?: string;
  /** Optional one-line caption under the title. */
  subtitle?: string;
  /** Palette variant — defaults to blue. */
  tone?: CalloutTone;
  className?: string;
}) {
  const t = toneStyles[tone];
  const hasPoints = Array.isArray(points) && points.length > 0;

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-3xl ring-1 shadow-card',
        t.card,
        t.ring,
        className,
      )}
      aria-label={title}
    >
      {/* Top accent bar */}
      <span aria-hidden className={cn('absolute inset-x-0 top-0 h-1 rounded-t-3xl', t.accentBar)} />

      {/* Decorative grain overlay */}
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-grain opacity-[0.04] mix-blend-multiply" />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', t.iconBg)}>
            <InsightIcon className={cn('h-5 w-5', t.iconFg)} />
          </div>
          <div className="min-w-0">
            <div className={cn('text-[10.5px] uppercase tracking-[0.18em] font-semibold', t.headerLabel)}>
              Plain English
            </div>
            <h3 className="font-display text-lg text-ink-900 leading-tight mt-0.5">{title}</h3>
            {subtitle && (
              <p className="text-[12px] text-ink-600 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Points list */}
        {hasPoints ? (
          <ul className="mt-4 space-y-2.5">
            {points.map((point, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-2xl bg-white/70 backdrop-blur-sm ring-1 ring-white/80 px-3.5 py-2.5"
              >
                <span
                  aria-hidden
                  className={cn(
                    'mt-1.5 h-2 w-2 shrink-0 rounded-full shadow-[0_0_0_3px_rgba(255,255,255,0.7)]',
                    t.bullet,
                  )}
                />
                <p className="text-[13px] leading-snug text-ink-800">{point}</p>
              </li>
            ))}
          </ul>
        ) : (
          // Empty state — keep tone friendly, don't fabricate fake bullets
          <div className="mt-4 rounded-2xl bg-white/60 ring-1 ring-white/80 px-4 py-3 text-[12.5px] text-ink-600 italic">
            No translations yet — once contract terms are confirmed, plain-English notes will land
            here so you can scan them in seconds.
          </div>
        )}

        {/* Footer hint — encourages confirming terms with brand */}
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-white/50 ring-1 ring-white/70 px-3.5 py-2">
          <span className="text-[11px] text-ink-600">
            Read carefully — these are your interpretations, not legal advice.
          </span>
        </div>
      </div>
    </section>
  );
}

export default WhatThisMeansCallout;
