import { cn } from '@/lib/utils';

const tones = {
  green:  'bg-emerald-100 text-emerald-800 ring-emerald-200',
  yellow: 'bg-amber-100  text-amber-800   ring-amber-200',
  orange: 'bg-orange-100 text-orange-800  ring-orange-200',
  red:    'bg-rose-100   text-rose-800    ring-rose-200',
  blue:   'bg-sky-100    text-sky-800     ring-sky-200',
  pink:   'bg-cloud-100  text-cloud-700   ring-cloud-200',
  iris:   'bg-iris-100   text-iris-600    ring-iris-200',
} as const;

export type ChipTone = keyof typeof tones;

export function StatusChip({
  tone = 'pink',
  children,
  className,
}: {
  tone?: ChipTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] ring-1',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
