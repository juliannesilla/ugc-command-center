// Execution card — single campaign in maker-mode view.
//
// Renders all "Key Fields" per spec section 6 (L463-L477):
//   Brand · Deliverable · Current Execution Step · Script Link · Shot Map Link ·
//   B-Roll Checklist · Asset Folder · Due Date (color-coded) · Estimated Time ·
//   Final QA Status · Next Action
// PLUS the 6-item Production Readiness Score per E5 brief (spec view #7 smart
// feature, extended).

import {
  FileText,
  Camera,
  Film,
  Folder,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import type { Campaign } from '@/lib/types/campaign';
import { StatusChip } from '@/components/ui/status-chip';
import { cn, formatMoney } from '@/lib/utils';
import { getNextMove } from '@/lib/scoring';
import {
  getEstimatedTime,
  getProductionReadinessChecklist,
  getProductionReadinessPct,
  getDueTone,
  formatDueLabel,
  EXECUTION_GROUP_LABEL,
  getExecutionGroup,
} from './helpers';

// B-roll checklist mock progress — derived from stage progression.
// Source: spec L472 "B-Roll Checklist (mini progress: X/Y items done)".
function getBrollProgress(c: Campaign): { done: number; total: number } {
  const total = 5; // 5-item b-roll checklist per campaign baseline
  const stage = c.current_stage;
  if (stage === 'SOW REVIEWED') return { done: 0, total };
  if (stage === 'STRATEGY READY') return { done: 2, total };
  if (stage === 'SCRIPT READY') return { done: 3, total };
  if (stage === 'FILMING') return { done: 4, total };
  return { done: total, total };
}

function getQaStatus(c: Campaign): { label: string; tone: 'yellow' | 'green' | 'iris' } {
  if (c.current_stage === 'SUBMITTED') return { label: 'Submitted', tone: 'iris' };
  if (c.current_stage === 'QA') return { label: 'In QA', tone: 'yellow' };
  if (c.current_stage === 'EDITING') return { label: 'Pre-QA', tone: 'yellow' };
  if (c.current_stage === 'FILMING') return { label: 'Pending edit', tone: 'yellow' };
  return { label: 'Not yet', tone: 'iris' };
}

export function ExecutionCard({ campaign: c }: { campaign: Campaign }) {
  const estimate = getEstimatedTime(c);
  const checklist = getProductionReadinessChecklist(c);
  const readinessPct = getProductionReadinessPct(c);
  const broll = getBrollProgress(c);
  const qa = getQaStatus(c);
  const group = getExecutionGroup(c);
  const dueTone = getDueTone(c.due_date);
  const dueLabel = formatDueLabel(c.due_date);
  const nextMove = getNextMove(c);
  const value = c.total_potential_value ?? c.base_pay ?? 0;

  return (
    <article className="group relative rounded-3xl bg-white/85 backdrop-blur-sm ring-1 ring-cloud-100 shadow-card hover:shadow-soft hover:ring-iris-100 transition overflow-hidden">
      {/* top accent stripe based on due urgency */}
      <span
        className={cn(
          'absolute inset-x-0 top-0 h-1',
          dueTone === 'red' && 'bg-gradient-to-r from-rose-300 to-rose-500',
          dueTone === 'orange' && 'bg-gradient-to-r from-orange-300 to-orange-500',
          dueTone === 'yellow' && 'bg-gradient-to-r from-amber-300 to-amber-400',
          dueTone === 'green' && 'bg-gradient-to-r from-emerald-300 to-emerald-400',
          dueTone === 'iris' && 'bg-gradient-to-r from-iris-300 to-iris-400',
        )}
      />

      <div className="p-5">
        {/* Header: brand + due pill */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className="text-[10.5px] uppercase tracking-[0.18em] text-ink-500 font-semibold mb-1">
              {group ? EXECUTION_GROUP_LABEL[group] : c.current_stage}
            </p>
            <h3 className="font-display text-lg text-ink-900 leading-tight truncate">
              {c.brand}
            </h3>
            <p className="text-[12.5px] text-ink-500 truncate mt-0.5">
              {c.product}
            </p>
          </div>
          <StatusChip tone={dueTone === 'green' ? 'green' : dueTone === 'iris' ? 'iris' : dueTone}>
            {dueLabel}
          </StatusChip>
        </div>

        {/* Deliverable + value strip */}
        <div className="flex items-center justify-between gap-2 mb-4 rounded-2xl bg-cloud-50/70 px-3 py-2 ring-1 ring-cloud-100">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-500 font-semibold">
              Deliverable
            </p>
            <p className="text-[12.5px] text-ink-700 truncate">
              {c.deliverable_count} × {c.required_format.replace('_', ' ')}
              {c.required_length ? ` · ${c.required_length}` : ''}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-500 font-semibold">
              Value
            </p>
            <p className="font-display text-base text-cloud-700 leading-none">
              {value > 0 ? formatMoney(value) : '—'}
            </p>
          </div>
        </div>

        {/* Estimated time + QA status */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="rounded-2xl bg-white p-3 ring-1 ring-cloud-100">
            <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.12em] text-ink-500 font-semibold mb-1">
              <Clock className="h-3 w-3" />
              Est. time
            </div>
            <p className="text-[12.5px] font-semibold text-ink-900 leading-tight">
              {estimate.label}
            </p>
            <p className="text-[10.5px] text-ink-500 mt-0.5">
              {estimate.totalHours} hr total
            </p>
          </div>
          <div className="rounded-2xl bg-white p-3 ring-1 ring-cloud-100">
            <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.12em] text-ink-500 font-semibold mb-1">
              <CheckCircle2 className="h-3 w-3" />
              Final QA
            </div>
            <StatusChip tone={qa.tone} className="!text-[10px]">
              {qa.label}
            </StatusChip>
          </div>
        </div>

        {/* Quick-access link row */}
        <div className="flex items-center gap-1.5 mb-4">
          <LinkPill
            href={c.script_link}
            label="Script"
            icon={<FileText className="h-3 w-3" />}
            available={!!c.script_link}
          />
          <LinkPill
            href={c.script_link} // shot map lives alongside script in mock data
            label="Shot map"
            icon={<Camera className="h-3 w-3" />}
            available={!!c.script_link}
          />
          <LinkPill
            href={c.asset_folder}
            label="Assets"
            icon={<Folder className="h-3 w-3" />}
            available={!!c.asset_folder}
          />
        </div>

        {/* B-roll progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] text-ink-500 font-semibold uppercase tracking-[0.12em] mb-1.5">
            <span className="flex items-center gap-1.5">
              <Film className="h-3 w-3" />
              B-roll checklist
            </span>
            <span className="text-ink-700 normal-case tracking-normal">
              {broll.done}/{broll.total}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-cloud-50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-iris-300 to-cloud-sunset transition-all"
              style={{ width: `${(broll.done / broll.total) * 100}%` }}
            />
          </div>
        </div>

        {/* Production Readiness 6-checklist */}
        <div className="mb-4 rounded-2xl bg-cloud-soft/60 p-3 ring-1 ring-cloud-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-500 font-semibold flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Production readiness
            </p>
            <p className="font-display text-lg text-iris-600 leading-none">
              {readinessPct}%
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
            {checklist.map((item) => (
              <li
                key={item.key}
                className="flex items-center gap-1.5 text-[11px] leading-tight"
              >
                {item.done ? (
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
                ) : (
                  <Circle className="h-3 w-3 shrink-0 text-ink-300" />
                )}
                <span className={cn(item.done ? 'text-ink-700' : 'text-ink-400')}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Action */}
        <div className="flex items-start gap-2.5 rounded-2xl bg-iris-50/80 p-3 ring-1 ring-iris-100">
          <ArrowRight className="h-4 w-4 mt-0.5 text-iris-600 shrink-0" />
          <p className="text-[12.5px] text-ink-800 leading-snug">
            {nextMove}
          </p>
        </div>
      </div>
    </article>
  );
}

function LinkPill({
  href,
  label,
  icon,
  available,
}: {
  href: string | undefined;
  label: string;
  icon: React.ReactNode;
  available: boolean;
}) {
  const className = cn(
    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 transition',
    available
      ? 'bg-white text-ink-700 ring-cloud-200 hover:bg-iris-50 hover:text-iris-600 hover:ring-iris-200'
      : 'bg-cloud-50 text-ink-300 ring-cloud-100 cursor-not-allowed',
  );

  if (!available || !href) {
    return (
      <span className={className} aria-disabled>
        {icon}
        {label}
      </span>
    );
  }

  return (
    <a href={href} className={className}>
      {icon}
      {label}
    </a>
  );
}
