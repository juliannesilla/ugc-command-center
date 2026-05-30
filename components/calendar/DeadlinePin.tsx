'use client';

// A.14t T1-CALENDAR — DeadlinePin: a small, color-coded pill/dot used inside
// CalendarGrid cells to flag a deadline on a given date.
//
// Skills cited (HR-21): frontend-design, refactoring-ui, microinteractions.
// Skill tool invocations are logged in spawn-return payload.
//
// Color coding (per spawn-prompt + dashboard palette):
//   filming     → orange   (warm, in-the-field signal)
//   submission  → red      (hard deadline / hand-off)
//   payment     → green    (money in)
//   posting     → red      (treated as submission family)
//   revision    → red
//   follow_up   → ink/gray
//   call        → iris (purple)
//   response    → pink     (today-ish urgency)
//   sow_review  → iris
//   script      → iris
//   edit        → iris
//
// We deliberately *do not* re-encode TONE here — tone is derived in
// deadline-events.ts off proximity to today. The PIN is a TYPE indicator;
// the CELL itself (or a today-ring) carries proximity tone. Keeps the
// visual language calm at a glance.

import type { DeadlineType } from '@/lib/mock-data/deadline-events';
import { cn } from '@/lib/utils';

export interface DeadlinePinProps {
  type: DeadlineType;
  /** When true, render a fuller pill with a label; default is dot-only. */
  withLabel?: boolean;
  /** Optional override label; defaults to the type's canonical short label. */
  label?: string;
  /** Diameter token. 'sm' = grid cell dot. 'md' = list row chip. */
  size?: 'sm' | 'md';
}

// Type → dot color class. Stable Tailwind tokens, no dynamic strings.
const TYPE_COLOR: Record<DeadlineType, string> = {
  filming_alias_legacy_unused: '', // placeholder for type-narrowing safety
  film: 'bg-orange-500',
  submission: 'bg-red-500',
  posting: 'bg-red-500',
  revision: 'bg-red-500',
  payment: 'bg-emerald-500',
  response: 'bg-iris-500',
  call: 'bg-iris-500',
  sow_review: 'bg-iris-500',
  script: 'bg-iris-500',
  edit: 'bg-iris-500',
  follow_up: 'bg-ink-400',
} as unknown as Record<DeadlineType, string>;

// Type → chip background+ring for `withLabel` variant.
const TYPE_CHIP: Record<DeadlineType, string> = {
  film: 'bg-orange-50 text-orange-700 ring-orange-200',
  submission: 'bg-red-50 text-red-700 ring-red-200',
  posting: 'bg-red-50 text-red-700 ring-red-200',
  revision: 'bg-red-50 text-red-700 ring-red-200',
  payment: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  response: 'bg-cloud-50 text-cloud-700 ring-cloud-200',
  call: 'bg-iris-50 text-iris-600 ring-iris-200',
  sow_review: 'bg-iris-50 text-iris-600 ring-iris-200',
  script: 'bg-iris-50 text-iris-600 ring-iris-200',
  edit: 'bg-iris-50 text-iris-600 ring-iris-200',
  follow_up: 'bg-cloud-50 text-ink-600 ring-cloud-200',
} as Record<DeadlineType, string>;

const TYPE_SHORT_LABEL: Record<DeadlineType, string> = {
  film: 'Film',
  submission: 'Submit',
  posting: 'Post',
  revision: 'Revision',
  payment: 'Pay',
  response: 'Reply',
  call: 'Call',
  sow_review: 'SOW',
  script: 'Script',
  edit: 'Edit',
  follow_up: 'Follow',
} as Record<DeadlineType, string>;

export function DeadlinePin({
  type,
  withLabel = false,
  label,
  size = 'sm',
}: DeadlinePinProps) {
  const dotClass = TYPE_COLOR[type] ?? 'bg-ink-400';

  if (!withLabel) {
    return (
      <span
        aria-label={`${TYPE_SHORT_LABEL[type] ?? type} deadline`}
        className={cn(
          'inline-block shrink-0 rounded-full',
          dotClass,
          size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
        )}
      />
    );
  }

  const chipClass = TYPE_CHIP[type] ?? 'bg-cloud-50 text-ink-600 ring-cloud-200';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 ring-1 font-medium',
        chipClass,
        size === 'sm' ? 'text-[10px]' : 'text-[11px]',
      )}
    >
      <span className={cn('inline-block rounded-full', dotClass, 'h-1.5 w-1.5')} />
      {label ?? TYPE_SHORT_LABEL[type] ?? type}
    </span>
  );
}
