// Production Queue card — one deliverable.
//
// Source: spec section 7 "Production Queue View" — "Key Fields" (L542-L562):
//   Campaign · Deliverable Name · Format · Length · Hook Selected ·
//   Script/Shot Map/B-Roll/Screen Rec/Film/Edit/Captions/QA Status ·
//   Submission Status · Due Date · Notes
// PLUS the 6-checklist production-readiness score (L586-L594).

import Link from 'next/link';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  Circle,
  StickyNote,
  GripVertical,
  ArrowUpRight,
} from 'lucide-react';
import { StatusChip } from '@/components/ui/status-chip';
import { cn } from '@/lib/utils';
import {
  type DeliverableCard,
  formatDueLabel,
  getDueTone,
  getFormatPill,
  getProductionReadinessChecklist,
  getProductionReadinessPct,
  pillToneFor,
} from './helpers';

export function ProductionQueueCard({ deliverable }: { deliverable: DeliverableCard }) {
  const { campaign, production } = deliverable;
  const formatPill = getFormatPill(campaign);
  const dueTone = getDueTone(deliverable.dueDate);
  const dueLabel = formatDueLabel(deliverable.dueDate);
  const checklist = getProductionReadinessChecklist(campaign, production);
  const derivedPct = getProductionReadinessPct(campaign, production);
  // A.14g Wave 2: synthetic cards pre-compute readiness pct (no productionData).
  const readinessPct = deliverable.readinessOverridePct ?? derivedPct;
  // A.14g Wave 2 — audit L148: deep-link cards to per-campaign production view.
  const productionHref = `/campaigns/${campaign.campaign_id}/production`;

  return (
    <Link
      href={productionHref}
      aria-label={`Open ${campaign.brand} production view`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-iris-300 rounded-3xl"
    >
    <article className="group relative rounded-3xl bg-white/85 backdrop-blur-sm ring-1 ring-cloud-100/70 shadow-card hover:shadow-soft hover:ring-iris-200 motion-safe:hover:-translate-y-0.5 transition-[transform,box-shadow,border-color] duration-200 ease-out overflow-hidden cursor-grab active:cursor-grabbing active:scale-[0.99]">
      {/* drag-handle affordance — DnD-ready visual cue (microinteractions) */}
      <span
        aria-hidden="true"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-80 text-ink-600 group-hover:text-iris-500 transition-[opacity,color] duration-200 ease-out"
      >
        <GripVertical className="h-3 w-3" />
      </span>
      {/* due-urgency accent stripe */}
      <span
        className={cn(
          'absolute inset-x-0 top-0 h-0.5',
          dueTone === 'red' && 'bg-gradient-to-r from-rose-300 to-rose-500',
          dueTone === 'orange' && 'bg-gradient-to-r from-orange-300 to-orange-500',
          dueTone === 'yellow' && 'bg-gradient-to-r from-amber-300 to-amber-400',
          dueTone === 'green' && 'bg-gradient-to-r from-emerald-300 to-emerald-400',
          dueTone === 'iris' && 'bg-gradient-to-r from-iris-200 to-iris-400',
        )}
      />

      <div className="p-4 space-y-2.5">
        {/* Header — brand + product + format pill */}
        <header className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-[14px] text-ink-900 leading-tight truncate">
              {campaign.brand}
            </h3>
            <StatusChip tone={formatPill.tone} className="shrink-0 !text-[9.5px] !px-1.5">
              {formatPill.label}
            </StatusChip>
          </div>
          <p className="text-[11.5px] text-ink-700 truncate">{campaign.product}</p>
          <p className="text-[10.5px] text-ink-600 truncate">
            {deliverable.isSynthetic
              ? deliverable.deliverableName.split(' · ').slice(1).join(' · ') ||
                'Production cut'
              : deliverable.total > 1
                ? `Deliverable ${deliverable.index} of ${deliverable.total}`
                : 'Single deliverable'}
            {deliverable.length ? ` · ${deliverable.length}` : ''}
          </p>
          <p className="inline-flex items-center gap-1 text-[10px] text-iris-600 font-semibold opacity-0 group-hover:opacity-100 transition">
            Open production view
            <ArrowUpRight className="h-2.5 w-2.5" />
          </p>
        </header>

        {/* Due + hook row */}
        <div className="flex items-center justify-between gap-2">
          <StatusChip
            tone={
              dueTone === 'iris'
                ? 'iris'
                : dueTone === 'green'
                  ? 'green'
                  : (dueTone as 'red' | 'orange' | 'yellow')
            }
            className="!text-[9.5px] !px-1.5"
          >
            <Clock className="h-2.5 w-2.5" />
            {dueLabel}
          </StatusChip>
          {deliverable.hookSelected && (
            <StatusChip tone="iris" className="!text-[9.5px] !px-1.5">
              <Sparkles className="h-2.5 w-2.5" />
              Hook
            </StatusChip>
          )}
        </div>

        {/* Status pill grid — 9 pills per spec L549-L560 */}
        <div className="rounded-xl bg-cloud-50/70 p-2 ring-1 ring-cloud-100 space-y-1.5">
          <p className="text-[9px] uppercase tracking-[0.14em] text-ink-700 font-semibold">
            Production stages
          </p>
          <div className="grid grid-cols-3 gap-1">
            <PillRow label="Script" value={deliverable.scriptStatus} />
            <PillRow label="Shot map" value={deliverable.shotMapStatus} />
            <PillRow label="B-roll" value={deliverable.brollStatus} />
            <PillRow label="Screen rec" value={deliverable.screenRecordingStatus} />
            <PillRow label="Film" value={deliverable.filmStatus} />
            <PillRow label="Edit" value={deliverable.editStatus} />
            <PillRow label="Captions" value={deliverable.captionsStatus} />
            <PillRow label="QA" value={deliverable.qaStatus} />
            <PillRow label="Submit" value={deliverable.submissionStatus} />
          </div>
        </div>

        {/* Production readiness 6-checklist */}
        <div className="rounded-xl bg-iris-50/60 p-2 ring-1 ring-iris-100 space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-[9px] uppercase tracking-[0.14em] text-iris-700 font-semibold inline-flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" />
              Readiness
            </p>
            <p className="font-display text-[13px] text-iris-700 leading-none">
              {readinessPct}%
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5">
            {checklist.map((item) => (
              <li
                key={item.key}
                className="flex items-center gap-1 text-[10px] leading-tight"
              >
                {item.done ? (
                  <CheckCircle2 className="h-2.5 w-2.5 shrink-0 text-emerald-500" />
                ) : (
                  <Circle className="h-2.5 w-2.5 shrink-0 text-ink-300" />
                )}
                <span className={cn('truncate', item.done ? 'text-ink-700' : 'text-ink-600')}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Notes (truncated) */}
        {deliverable.notes && (
          <div className="flex items-start gap-1.5 text-[10.5px] text-ink-700 leading-snug">
            <StickyNote className="h-2.5 w-2.5 mt-0.5 shrink-0 text-ink-600" />
            <p className="line-clamp-2">{deliverable.notes}</p>
          </div>
        )}
      </div>
    </article>
    </Link>
  );
}

function PillRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[8.5px] uppercase tracking-[0.08em] text-ink-600 font-semibold truncate">
        {label}
      </span>
      <StatusChip
        tone={pillToneFor(value)}
        className="!text-[8.5px] !px-1 !py-0 !tracking-normal !normal-case truncate inline-block"
      >
        {value}
      </StatusChip>
    </div>
  );
}
