// PipelineCardCampaign — board card backed by the canonical Campaign row.
//
// Source: `02-campaign-pipeline-views-architecture.md` view #2 (L128-L143)
// — exact "Card Fields to Show" table:
//   Brand · Product · Campaign Type · Deliverable Count · Due Date ·
//   Payment / Value · Priority · Next Action · Status Pill.
// Plus L164-L173 "Blocked? indicator" (NEW in Wave 2):
//   Missing SOW · Missing payment info · Waiting on brand ·
//   Usage rights unclear · Deadline missing.
// Plus prompt L535-L549 "Missing Info Detector" — yellow badge if any.
//
// HR-2 PRESERVE INTENT: the legacy `PipelineCard` (PipelineCardType prop) is
// untouched; this is a parallel component that consumes `Campaign`.

import { AlertTriangle, Calendar, FileText, GripVertical, Info } from 'lucide-react';
import { cn, formatMoney } from '@/lib/utils';
import { StatusChip, type ChipTone } from '@/components/ui/status-chip';
import { getBlockers, getMissingInfo } from '@/lib/scoring';
import type {
  Campaign,
  CampaignPriority,
  CampaignStatus,
  CampaignType,
} from '@/lib/types/campaign';

const priorityDot: Record<CampaignPriority, string> = {
  high:   'bg-rose-500',
  medium: 'bg-orange-400',
  low:    'bg-cloud-300',
};

const statusTone: Record<CampaignStatus, ChipTone> = {
  active:    'green',
  waiting:   'yellow',
  blocked:   'red',
  submitted: 'blue',
  paid:      'iris',
  archived:  'pink',
};

const campaignTypeLabel: Record<CampaignType, string> = {
  talking_head: 'Talking head',
  demo:         'Demo',
  paid_ad:      'Paid ad',
  organic_post: 'Organic',
  review:       'Review',
  affiliate:    'Affiliate',
  retainer:     'Retainer',
};

function brandInitials(name: string) {
  return name
    .split(/[\s/-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

function formatDueDate(iso?: string): { label: string; overdue: boolean } | null {
  if (!iso) return null;
  const d = new Date(iso);
  const today = new Date('2026-05-20'); // matches MEMORY currentDate
  const overdue = d.getTime() < today.getTime();
  return {
    label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    overdue,
  };
}

/** Renders `total_potential_value` or falls back to base_pay; em-dash if neither. */
function valueLabel(c: Campaign): string {
  if (c.total_potential_value !== undefined && c.total_potential_value > 0) {
    return formatMoney(c.total_potential_value);
  }
  if (c.base_pay !== undefined && c.base_pay > 0) {
    return formatMoney(c.base_pay);
  }
  return '—';
}

export function PipelineCardCampaign({ card }: { card: Campaign }) {
  const due = formatDueDate(card.due_date);
  const blockers = card.blockers?.length > 0 ? card.blockers : getBlockers(card);
  const missing = card.missing_info?.length > 0 ? card.missing_info : getMissingInfo(card);
  const hoverDetail = [
    blockers.length > 0 ? `Blocked: ${blockers.join(' · ')}` : '',
    missing.length > 0 ? `Missing: ${missing.join(' · ')}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <article
      className="group relative rounded-2xl bg-white p-3 shadow-card ring-1 ring-cloud-100 hover:ring-cloud-300 hover:shadow-soft motion-safe:hover:-translate-y-0.5 transition-[transform,box-shadow,border-color] duration-200 ease-out cursor-grab active:cursor-grabbing active:scale-[0.99]"
      title={hoverDetail || undefined}
    >
      {/* Drag handle affordance — surfaces on hover for DnD discoverability (microinteractions / Apple HIG) */}
      <span
        aria-hidden="true"
        className="absolute top-1.5 right-1.5 text-ink-300 opacity-0 group-hover:opacity-70 transition-opacity duration-150"
      >
        <GripVertical className="h-3 w-3" />
      </span>
      {/* TOP: brand initials + brand/product + priority dot + blocked/missing indicators */}
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            'grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white font-display font-semibold text-[13px] bg-gradient-to-br shadow-card',
            'from-cloud-300 to-iris-300',
          )}
        >
          {brandInitials(card.brand)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className={cn('h-1.5 w-1.5 rounded-full shrink-0', priorityDot[card.priority])}
              title={`Priority: ${card.priority}`}
            />
            <span className="text-[10.5px] uppercase tracking-[0.14em] text-ink-500 truncate flex-1">
              {card.brand}
            </span>
            {/* Indicators */}
            <div className="flex items-center gap-1 shrink-0">
              {blockers.length > 0 && (
                <span
                  className="grid h-4 w-4 place-items-center rounded-full bg-rose-100 ring-1 ring-rose-200"
                  title={`Blocked: ${blockers.join(' · ')}`}
                  aria-label={`Blocked: ${blockers.join(', ')}`}
                >
                  <AlertTriangle className="h-2.5 w-2.5 text-rose-600" />
                </span>
              )}
              {missing.length > 0 && (
                <span
                  className="grid h-4 w-4 place-items-center rounded-full bg-amber-100 ring-1 ring-amber-200"
                  title={`Missing: ${missing.join(' · ')}`}
                  aria-label={`Missing info: ${missing.join(', ')}`}
                >
                  <Info className="h-2.5 w-2.5 text-amber-700" />
                </span>
              )}
            </div>
          </div>
          <h4 className="mt-0.5 text-[13px] font-semibold text-ink-900 leading-snug line-clamp-1">
            {card.product}
          </h4>
        </div>
      </div>

      {/* TYPE + DELIVERABLE COUNT */}
      <div className="mt-2 flex items-center justify-between gap-1.5 text-[10px]">
        <span className="inline-flex items-center gap-1 rounded-full bg-cloud-50 px-2 py-0.5 text-cloud-700 ring-1 ring-cloud-100">
          {campaignTypeLabel[card.campaign_type]}
        </span>
        <span
          className="inline-flex items-center gap-1 rounded-full bg-iris-50 px-2 py-0.5 text-iris-600 ring-1 ring-iris-100"
          title={`${card.deliverable_count} deliverable${card.deliverable_count === 1 ? '' : 's'}`}
        >
          <FileText className="h-2.5 w-2.5" />
          {card.deliverable_count}
        </span>
      </div>

      {/* VALUE + DUE DATE */}
      <div className="mt-2.5 flex items-center justify-between text-[11px]">
        <span className="font-display text-cloud-700 text-sm">
          {valueLabel(card)}
        </span>
        {due && (
          <span
            className={cn(
              'inline-flex items-center gap-1',
              due.overdue ? 'text-rose-600 font-semibold' : 'text-ink-500',
            )}
          >
            <Calendar className="h-3 w-3" />
            {due.label}
          </span>
        )}
      </div>

      {/* NEXT ACTION (1-line truncate) */}
      <p className="mt-2 text-[11px] text-ink-600 leading-snug line-clamp-1">
        {card.next_action}
      </p>

      {/* STATUS PILL */}
      <div className="mt-2 flex items-center justify-between">
        <StatusChip tone={statusTone[card.status]} className="text-[9.5px]">
          {card.status}
        </StatusChip>
        <span
          title="Julianne Silla"
          className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-peach-300 via-rose-300 to-iris-400 text-white font-display font-semibold text-[9px] ring-2 ring-white shadow-card"
        >
          J
        </span>
      </div>
    </article>
  );
}
