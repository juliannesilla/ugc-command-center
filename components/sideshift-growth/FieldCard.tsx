import {
  BadgeCheck,
  Briefcase,
  CalendarCheck2,
  Check,
  Circle,
  CircleDot,
  Flame,
  GraduationCap,
  IdCard,
  Link2,
  Megaphone,
  Sparkles,
  Tags,
  Timer,
  Trophy,
  UserCircle2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusChip, type ChipTone } from '@/components/ui/status-chip';
import type {
  FieldStatus,
  ProfileField,
} from '@/lib/mock-data/sideshift-growth';

const ICONS: Record<ProfileField['icon'], LucideIcon> = {
  UserCircle2,
  IdCard,
  Link2,
  Tags,
  BadgeCheck,
  Sparkles,
  Megaphone,
  Briefcase,
  GraduationCap,
  Trophy,
  Flame,
  Timer,
  CalendarCheck2,
};

const STATUS_TONE: Record<FieldStatus, ChipTone> = {
  complete: 'green',
  partial: 'yellow',
  missing: 'red',
};

const STATUS_LABEL: Record<FieldStatus, string> = {
  complete: 'Complete',
  partial: 'In Progress',
  missing: 'Missing',
};

const STATUS_RING: Record<FieldStatus, string> = {
  complete: 'ring-emerald-200',
  partial: 'ring-amber-200',
  missing: 'ring-rose-200',
};

const STATUS_BAR: Record<FieldStatus, string> = {
  complete: 'bg-gradient-to-r from-emerald-300 to-emerald-500',
  partial: 'bg-gradient-to-r from-amber-300 to-orange-400',
  missing: 'bg-gradient-to-r from-rose-300 to-rose-500',
};

export function FieldCard({ field }: { field: ProfileField }) {
  const Icon = ICONS[field.icon];
  const tone = STATUS_TONE[field.status];
  const isComplete = field.status === 'complete';

  return (
    <article
      className={cn(
        'group relative rounded-2xl bg-white px-4 py-4 shadow-card ring-1 transition hover:-translate-y-0.5 hover:shadow-soft overflow-hidden',
        STATUS_RING[field.status],
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute inset-x-0 top-0 h-1 rounded-t-2xl',
          STATUS_BAR[field.status],
        )}
      />

      <div className="flex items-start gap-3">
        {/* Checkbox-style status indicator */}
        <div
          aria-hidden
          className={cn(
            'mt-0.5 grid h-7 w-7 place-items-center rounded-full ring-1 shrink-0',
            isComplete
              ? 'bg-emerald-500 ring-emerald-500 text-white'
              : field.status === 'partial'
                ? 'bg-amber-50 ring-amber-300 text-amber-700'
                : 'bg-white ring-rose-300 text-rose-400',
          )}
        >
          {isComplete ? (
            <Check className="h-4 w-4" strokeWidth={3} />
          ) : field.status === 'partial' ? (
            <CircleDot className="h-3.5 w-3.5" />
          ) : (
            <Circle className="h-3.5 w-3.5" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="font-display text-[15px] leading-tight text-ink-900">
              <span className="inline-flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-cloud-700" aria-hidden />
                {field.label}
              </span>
            </h3>
            <StatusChip tone={tone}>{STATUS_LABEL[field.status]}</StatusChip>
          </div>

          <p className="mt-1.5 text-[12.5px] text-ink-700 leading-snug">
            {field.detail}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-ink-400 font-semibold">
            {field.why}
          </p>
        </div>
      </div>

      {!isComplete && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-cloud-sunset px-3 py-1.5 text-[11.5px] font-semibold text-white shadow-soft transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud-sunset focus-visible:ring-offset-1"
            aria-label={`Improve ${field.label}: ${field.improveLabel}`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {field.improveLabel}
          </button>
        </div>
      )}
    </article>
  );
}
