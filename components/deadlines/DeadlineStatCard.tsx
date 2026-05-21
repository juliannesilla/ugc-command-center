import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatTone = 'red' | 'orange' | 'iris' | 'cloud' | 'green';

const tones: Record<StatTone, { ring: string; text: string; bg: string; accent: string }> = {
  red:    { ring: 'ring-rose-200',    text: 'text-rose-700',    bg: 'bg-rose-50/80',    accent: 'bg-rose-500' },
  orange: { ring: 'ring-orange-200',  text: 'text-orange-700',  bg: 'bg-orange-50/80',  accent: 'bg-orange-500' },
  iris:   { ring: 'ring-iris-200',    text: 'text-iris-600',    bg: 'bg-iris-50/80',    accent: 'bg-iris-400' },
  cloud:  { ring: 'ring-cloud-200',   text: 'text-cloud-700',   bg: 'bg-cloud-50/80',   accent: 'bg-cloud-500' },
  green:  { ring: 'ring-emerald-200', text: 'text-emerald-700', bg: 'bg-emerald-50/80', accent: 'bg-emerald-500' },
};

export function DeadlineStatCard({
  label,
  value,
  tone,
  sub,
  viewHref = '#',
}: {
  label: string;
  value: number | string;
  tone: StatTone;
  sub?: string;
  viewHref?: string;
}) {
  const t = tones[tone];
  // UX Heuristic #1 (visibility of system status): pulse the accent rail on
  // "red" (overdue) tone so eye is drawn to highest-urgency stat. Respects
  // prefers-reduced-motion via motion-safe variant.
  const overduePulse = tone === 'red';
  return (
    <div className={cn(
      'group relative rounded-2xl border border-white/60 backdrop-blur p-4 ring-1 shadow-card overflow-hidden',
      'motion-safe:hover:-translate-y-0.5 hover:shadow-soft transition-[transform,box-shadow] duration-200 ease-out',
      t.ring, t.bg,
    )}>
      <span className={cn(
        'absolute top-0 left-0 h-full w-1',
        overduePulse && 'motion-safe:animate-pulse',
        t.accent,
      )} />
      <p className="text-[10.5px] uppercase tracking-[0.16em] text-ink-500 font-semibold">
        {label}
      </p>
      <p className={cn('mt-1 font-display text-[34px] leading-none tabular-nums', t.text)}>
        {value}
      </p>
      {sub && <p className="mt-1 text-[11px] text-ink-500">{sub}</p>}
      <a
        href={viewHref}
        className={cn(
          'mt-2 inline-flex items-center gap-1 text-[11px] font-semibold hover:opacity-80 transition-opacity duration-150',
          t.text,
        )}
      >
        View
        <ArrowUpRight className="h-3 w-3 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>
    </div>
  );
}
