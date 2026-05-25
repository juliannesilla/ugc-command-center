import { cn } from '@/lib/utils';

const accents = {
  pink:   { ring: 'ring-cloud-200',  bar: 'bg-cloud-sunset',                               sub: 'text-cloud-700' },
  iris:   { ring: 'ring-iris-200',   bar: 'bg-gradient-to-r from-iris-300 to-iris-500',    sub: 'text-iris-500' },
  peach:  { ring: 'ring-peach-300/60', bar: 'bg-gradient-to-r from-peach-300 to-peach-500',sub: 'text-peach-500' },
  green:  { ring: 'ring-emerald-200', bar: 'bg-gradient-to-r from-emerald-300 to-emerald-500', sub: 'text-emerald-600' },
  yellow: { ring: 'ring-amber-200',  bar: 'bg-gradient-to-r from-amber-300 to-amber-500',  sub: 'text-amber-600' },
  orange: { ring: 'ring-orange-200', bar: 'bg-gradient-to-r from-orange-300 to-orange-500',sub: 'text-orange-600' },
  ink:    { ring: 'ring-ink-300/50', bar: 'bg-gradient-to-r from-ink-700 to-ink-900',      sub: 'text-ink-700' },
} as const;

export type StatAccent = keyof typeof accents;

export function StatCard({
  label,
  value,
  sub,
  accent = 'pink',
  className,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: StatAccent;
  className?: string;
}) {
  const a = accents[accent];
  return (
    <div
      className={cn(
        // T5 ADDITIVE: card-stat semantic utility (A.14m Stream 3, mockup #06+08).
        // Keep accent-bar + ring classes — additive only.
        'card-stat group relative bg-white ring-1 transition hover:-translate-y-0.5 hover:shadow-soft overflow-hidden',
        a.ring,
        className,
      )}
    >
      <span className={cn('absolute inset-x-0 top-0 h-1 rounded-t-3xl', a.bar)} />
      <div className="stat-label text-[10.5px] uppercase tracking-[0.18em] text-ink-500 font-semibold">
        {label}
      </div>
      <div className="stat-number mt-1.5 font-display text-2xl text-ink-900 leading-tight">
        {value}
      </div>
      {sub && (
        <div className={cn('mt-0.5 text-[11px] font-medium', a.sub)}>{sub}</div>
      )}
    </div>
  );
}
