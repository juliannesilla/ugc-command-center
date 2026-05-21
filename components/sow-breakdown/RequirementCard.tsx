// Implements: mockup #26 — 4-col × 4-row grid of 14 requirement cards
// (Deliverables · Required Length · Format · Theme · Tone · Required Messaging ·
//  Product Mention/Demo · Posting Requirements · Usage Rights · Payment ·
//  Bonus · Deadline · Revision Policy · Missing Info · Clarifying Questions).
// Each: icon + title + bullet list + status pill (e.g., "5 Deliverables",
// "Conversational", "Required", "Performance Based", "5 days left",
// "1 Revision Round", "3 items missing", "3 open questions").
//
// Owner: A14L-L1 SOW DETAIL. Server component, fully driven by props so a
// single card primitive can render every variant.

import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, AlertCircle, CircleDashed } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RequirementStatus = 'complete' | 'incomplete' | 'missing' | 'attention';

export type RequirementCardProps = {
  icon: LucideIcon;
  title: string;
  items: string[];
  pill?: { label: string; tone?: PillTone };
  status?: RequirementStatus;
  source?: string;
  className?: string;
};

export type PillTone =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'iris'
  | 'cloud';

const PILL_TONES: Record<PillTone, string> = {
  neutral: 'bg-ink-900/5 text-ink-700 ring-ink-900/10',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  danger:  'bg-rose-50 text-rose-700 ring-rose-200',
  iris:    'bg-iris-50 text-iris-600 ring-iris-200',
  cloud:   'bg-cloud-50 text-cloud-700 ring-cloud-200',
};

const STATUS_DOT: Record<RequirementStatus, { color: string; Icon: LucideIcon; label: string }> = {
  complete:   { color: 'text-emerald-500', Icon: CheckCircle2,  label: 'Complete' },
  incomplete: { color: 'text-amber-500',   Icon: CircleDashed,  label: 'In progress' },
  missing:    { color: 'text-rose-500',    Icon: AlertCircle,   label: 'Missing' },
  attention:  { color: 'text-iris-500',    Icon: AlertCircle,   label: 'Needs attention' },
};

export function RequirementCard({
  icon: Icon,
  title,
  items,
  pill,
  status = 'incomplete',
  source,
  className,
}: RequirementCardProps) {
  const pillTone = pill?.tone ?? 'neutral';
  const statusInfo = STATUS_DOT[status];
  const StatusIcon = statusInfo.Icon;

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-2xl bg-white/90 backdrop-blur-sm',
        'ring-1 ring-iris-100 shadow-card px-4 py-4',
        'transition-all duration-200 ease-out',
        'hover:shadow-soft hover:-translate-y-0.5 hover:ring-iris-200',
        className,
      )}
      aria-label={`${title} — ${statusInfo.label}`}
    >
      {/* Header: icon + title + status dot */}
      <header className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-iris-50 text-iris-500 ring-1 ring-iris-100 shrink-0">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <h3 className="font-display text-[15px] text-ink-900 leading-tight truncate">{title}</h3>
        </div>
        <StatusIcon
          aria-label={statusInfo.label}
          className={cn('h-4 w-4 shrink-0 mt-1', statusInfo.color)}
        />
      </header>

      {/* Bullet list */}
      {items.length > 0 && (
        <ul className="space-y-1.5 text-[12.5px] text-ink-700 leading-snug">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-iris-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Footer: pill + source */}
      <footer className="mt-3 pt-3 border-t border-iris-100 flex items-center justify-between gap-2">
        {pill && (
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-semibold ring-1',
              PILL_TONES[pillTone],
            )}
          >
            {pill.label}
          </span>
        )}
        {source && (
          <span className="text-[10px] uppercase tracking-[0.14em] text-ink-400 font-medium tabular-nums">
            {source}
          </span>
        )}
      </footer>
    </article>
  );
}

export default RequirementCard;
