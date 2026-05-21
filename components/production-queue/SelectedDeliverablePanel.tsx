// Production Queue · selected-deliverable detail panel — A.14i.
//
// Mockup source: `_meta/mockups/03-production-queue.png` — full-width panel
// below the kanban with the campaign title row + tab nav + 4-column detail
// content (Brief · Shot Map · Files · Activity).
//
// Picks the first in-flight deliverable from the visible set as the focus.
// Static demo content for now; deep-link CTA routes to the full per-campaign
// production view.

import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Folder,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  Film,
} from 'lucide-react';
import { StatusChip } from '@/components/ui/status-chip';
import {
  PRODUCTION_STATUS_LABEL,
  formatDueLabel,
  getDueTone,
  getFormatPill,
  getProductionReadinessChecklist,
  getProductionReadinessPct,
  type DeliverableCard,
} from './helpers';

const TABS = ['Brief', 'Shot map', 'Files', 'Activity'] as const;

export function SelectedDeliverablePanel({
  deliverables,
}: {
  deliverables: DeliverableCard[];
}) {
  // Pick the highest-priority in-flight card (closest to ship).
  const focusOrder = [
    'exported',
    'qa_needed',
    'captions_needed',
    'editing',
    'filmed',
    'filming_scheduled',
    'b_roll_needed',
    'shot_map_ready',
    'script_ready',
  ] as const;
  let selected: DeliverableCard | undefined;
  for (const stage of focusOrder) {
    selected = deliverables.find((d) => d.productionStatus === stage);
    if (selected) break;
  }
  if (!selected) selected = deliverables[0];
  if (!selected) return null;

  const { campaign } = selected;
  const formatPill = getFormatPill(campaign);
  const dueTone = getDueTone(selected.dueDate);
  const dueLabel = formatDueLabel(selected.dueDate);
  const checklist = getProductionReadinessChecklist(campaign, selected.production);
  const readinessPct =
    selected.readinessOverridePct ??
    getProductionReadinessPct(campaign, selected.production);

  const title = selected.isSynthetic
    ? `${campaign.brand} · ${selected.deliverableName.split(' · ').slice(1).join(' · ')}`
    : `${campaign.brand} — ${campaign.product}`;

  return (
    <section className="rise rise-3 rounded-3xl bg-white/85 backdrop-blur-sm ring-1 ring-cloud-100 shadow-card overflow-hidden">
      {/* Header row */}
      <header className="flex flex-wrap items-start justify-between gap-4 p-5 border-b border-cloud-50">
        <div className="flex items-start gap-3 min-w-0">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-iris-50 ring-1 ring-iris-100 text-iris-700 font-display text-lg shrink-0">
            {campaign.brand.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="text-[10.5px] uppercase tracking-[0.18em] text-ink-500 font-semibold">
              Focused deliverable · {PRODUCTION_STATUS_LABEL[selected.productionStatus]}
            </p>
            <h2 className="font-display text-[22px] text-ink-900 leading-tight mt-0.5 truncate">
              {title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusChip tone={formatPill.tone} className="!text-[10px]">
                {formatPill.label}
              </StatusChip>
              {selected.length && (
                <span className="inline-flex items-center gap-1 rounded-full bg-cloud-50 px-2 py-0.5 text-[10px] font-semibold text-ink-600 ring-1 ring-cloud-100">
                  {selected.length}
                </span>
              )}
              <StatusChip
                tone={
                  dueTone === 'iris'
                    ? 'iris'
                    : dueTone === 'green'
                      ? 'green'
                      : (dueTone as 'red' | 'orange' | 'yellow')
                }
                className="!text-[10px]"
              >
                <Clock className="h-2.5 w-2.5" />
                {dueLabel}
              </StatusChip>
              {selected.hookSelected && (
                <StatusChip tone="iris" className="!text-[10px]">
                  <Sparkles className="h-2.5 w-2.5" />
                  Hook locked
                </StatusChip>
              )}
            </div>
          </div>
        </div>

        <Link
          href={`/campaigns/${campaign.campaign_id}/production`}
          className="inline-flex items-center gap-1.5 rounded-full bg-iris-600 px-4 py-2 text-[12px] font-semibold text-white shadow-card hover:bg-iris-700 transition"
        >
          Open production view
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      {/* Tab nav */}
      <nav className="px-5 pt-3 flex flex-wrap items-center gap-1 border-b border-cloud-50">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            type="button"
            className={
              i === 0
                ? 'rounded-t-xl bg-cloud-50 px-3 py-1.5 text-[11.5px] font-semibold text-ink-900 ring-1 ring-cloud-100 ring-b-0 -mb-px'
                : 'rounded-t-xl px-3 py-1.5 text-[11.5px] font-semibold text-ink-500 hover:text-ink-700 transition'
            }
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* 4-column detail grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 p-5">
        {/* Col 1: Readiness checklist */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[10.5px] uppercase tracking-[0.16em] text-ink-500 font-semibold">
              Readiness
            </p>
            <span className="font-display text-[14px] text-iris-700 leading-none">
              {readinessPct}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-cloud-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-iris-300 to-iris-500 rounded-full"
              style={{ width: `${readinessPct}%` }}
              aria-hidden="true"
            />
          </div>
          <ul className="space-y-1.5">
            {checklist.map((item) => (
              <li
                key={item.key}
                className="flex items-center gap-2 text-[11.5px] leading-tight"
              >
                {item.done ? (
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
                ) : (
                  <Circle className="h-3 w-3 shrink-0 text-ink-300" />
                )}
                <span className={item.done ? 'text-ink-700' : 'text-ink-400'}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 2: Brief */}
        <div className="space-y-2.5">
          <p className="text-[10.5px] uppercase tracking-[0.16em] text-ink-500 font-semibold inline-flex items-center gap-1.5">
            <FileText className="h-3 w-3" />
            Brief
          </p>
          <div className="space-y-1.5 text-[11.5px] leading-snug">
            <p className="text-ink-700">
              <span className="font-semibold text-ink-900">Core angle:</span>{' '}
              {campaign.notes || 'Authentic UGC — daytime routine, vertical 9:16.'}
            </p>
            <p className="text-ink-600">
              <span className="font-semibold text-ink-800">Format:</span>{' '}
              {formatPill.label}
              {selected.length ? ` · ${selected.length}` : ''}
            </p>
            <p className="text-ink-600">
              <span className="font-semibold text-ink-800">Stage:</span>{' '}
              {PRODUCTION_STATUS_LABEL[selected.productionStatus]}
            </p>
          </div>
        </div>

        {/* Col 3: Files */}
        <div className="space-y-2.5">
          <p className="text-[10.5px] uppercase tracking-[0.16em] text-ink-500 font-semibold inline-flex items-center gap-1.5">
            <Folder className="h-3 w-3" />
            Files
          </p>
          <ul className="space-y-1.5 text-[11.5px]">
            {[
              { name: 'script-v3.docx', meta: 'Updated 2d ago' },
              { name: 'shot-map.pdf', meta: 'Updated 1d ago' },
              { name: 'b-roll/', meta: '14 clips · 412 MB' },
              { name: 'cut-v2.mp4', meta: 'Exported · 28 MB' },
            ].map((f) => (
              <li
                key={f.name}
                className="flex items-center justify-between gap-2 rounded-xl bg-cloud-50/60 ring-1 ring-cloud-100 px-2.5 py-1.5"
              >
                <span className="inline-flex items-center gap-1.5 min-w-0">
                  <Film className="h-3 w-3 shrink-0 text-cloud-700" />
                  <span className="text-ink-700 font-semibold truncate">{f.name}</span>
                </span>
                <span className="text-[10px] text-ink-500 shrink-0">{f.meta}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4: Activity */}
        <div className="space-y-2.5">
          <p className="text-[10.5px] uppercase tracking-[0.16em] text-ink-500 font-semibold inline-flex items-center gap-1.5">
            <MessageSquare className="h-3 w-3" />
            Activity
          </p>
          <ul className="space-y-2 text-[11px] leading-snug">
            {[
              { who: 'Julz', what: `Marked stage → ${PRODUCTION_STATUS_LABEL[selected.productionStatus]}`, when: '2h ago' },
              { who: 'System', what: `Readiness rose to ${readinessPct}%`, when: '4h ago' },
              { who: 'Julz', what: 'Notes updated', when: '1d ago' },
              { who: 'Brand', what: 'Replied with creative feedback', when: '2d ago' },
            ].map((row, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-iris-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-ink-700">
                    <span className="font-semibold text-ink-900">{row.who}</span>{' '}
                    {row.what}
                  </p>
                  <p className="text-[10px] text-ink-400">{row.when}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
