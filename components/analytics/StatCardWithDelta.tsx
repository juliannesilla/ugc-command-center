import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

type Props = {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: 'positive' | 'negative' | 'neutral';
  sublabel?: string;
  className?: string;
};

export function StatCardWithDelta({
  label,
  value,
  delta,
  deltaTone = 'positive',
  sublabel,
  className,
}: Props) {
  const toneClass =
    deltaTone === 'positive'
      ? 'text-emerald-700 bg-emerald-50 ring-emerald-200'
      : deltaTone === 'negative'
      ? 'text-rose-700 bg-rose-50 ring-rose-200'
      : 'text-ink-600 bg-ink-300/20 ring-ink-300';

  const Arrow = deltaTone === 'negative' ? ArrowDownRight : ArrowUpRight;

  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-4 shadow-card flex flex-col gap-2',
        className,
      )}
    >
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-500">
        {label}
      </span>
      <div className="flex items-baseline gap-3">
        <span className="font-display text-3xl font-semibold text-ink-900 leading-none">
          {value}
        </span>
        {delta && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1',
              toneClass,
            )}
          >
            <Arrow className="h-3 w-3" />
            {delta}
          </span>
        )}
      </div>
      {sublabel && (
        <span className="text-[11px] text-ink-500">{sublabel}</span>
      )}
    </div>
  );
}
