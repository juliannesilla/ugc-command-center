// Implements: mockup #26 right-rail "WHAT THIS MEANS FOR MY DELIVERABLE" panel —
//   Goal · Audience · Key Focus · Do's (4 green-check items) · Don'ts (3 red-X items) · Tip card
//
// Owner: A14L-L1 SOW DETAIL. Reads `meansSummary` block from per-campaign
// sow.json. Server component.

import { Check, X, Sparkles, Target, Users, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MeansSummary = {
  goal: string;
  audience: string;
  keyFocus: string;
  dos: string[];
  donts: string[];
  tip?: string;
};

function Section({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Target;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-iris-500" aria-hidden />
        <p className="text-[10.5px] uppercase tracking-[0.18em] text-iris-500 font-semibold">
          {label}
        </p>
      </div>
      <div className="text-[12.5px] text-ink-800 leading-relaxed">{children}</div>
    </div>
  );
}

export function WhatThisMeansPanel({
  summary,
  className,
}: {
  summary: MeansSummary;
  className?: string;
}) {
  // Auto-tip if not supplied — Julz-voice fallback
  const tip =
    summary.tip ??
    'Read the SOW once tonight. Annotate three lines you don\'t love. Bring them up before you film.';

  return (
    <aside
      aria-label="What this means for my deliverable"
      className={cn(
        'relative overflow-hidden rounded-3xl bg-gradient-to-br from-iris-50 via-white to-cloud-50',
        'ring-1 ring-iris-200/70 shadow-soft p-5 space-y-4',
        className,
      )}
    >
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-grain opacity-[0.04] mix-blend-multiply" />

      <header className="relative">
        <p className="text-[10px] uppercase tracking-[0.2em] text-iris-600 font-bold">
          What this means for my deliverable
        </p>
        <p className="mt-1 text-[11.5px] text-ink-600 leading-snug">
          Plain-English read of every clause, translated into how you actually film this.
        </p>
      </header>

      <div className="relative space-y-3.5">
        <Section icon={Target} label="Goal">
          {summary.goal}
        </Section>
        <Section icon={Users} label="Audience">
          {summary.audience}
        </Section>
        <Section icon={Compass} label="Key Focus">
          {summary.keyFocus}
        </Section>
      </div>

      {/* Do's */}
      <div className="relative">
        <p className="text-[10.5px] uppercase tracking-[0.18em] text-emerald-700 font-semibold mb-1.5">
          Do
        </p>
        <ul className="space-y-1.5">
          {summary.dos.map((d, i) => (
            <li key={i} className="flex gap-2 text-[12.5px] text-ink-800 leading-snug">
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="h-2.5 w-2.5" aria-hidden strokeWidth={3} />
              </span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Don'ts */}
      <div className="relative">
        <p className="text-[10.5px] uppercase tracking-[0.18em] text-rose-600 font-semibold mb-1.5">
          Don&rsquo;t
        </p>
        <ul className="space-y-1.5">
          {summary.donts.map((d, i) => (
            <li key={i} className="flex gap-2 text-[12.5px] text-ink-800 leading-snug">
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-700">
                <X className="h-2.5 w-2.5" aria-hidden strokeWidth={3} />
              </span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tip card */}
      <div className="relative rounded-2xl bg-cloud-sunset px-4 py-3 text-white shadow-glow">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold">Tip</p>
        </div>
        <p className="text-[12.5px] font-medium leading-snug">{tip}</p>
      </div>
    </aside>
  );
}

export default WhatThisMeansPanel;
