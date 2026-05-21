'use client';

// Phase A.14e Wave 4 (E9) — Brand Relationships / CRM table.
// Source spec: 02-campaign-pipeline-views-architecture.md section #9.
//
// 16 fields per spec L706–L723:
//   1. Brand · 2. Contact Name · 3. Contact Role · 4. Contact Channel
//   5. Last Message Date · 6. Last Message Summary · 7. My Last Response
//   8. Next Follow-Up Date · 9. Relationship Status (stage pill)
//   10. Repeat Potential · 11. Brand Fit Score · 12. Payment Quality
//   13. Communication Quality · 14. Notes · 15. Next Relationship Move
//   (+ Channel pill already covers spec row 4 — 16th distinct UI column is
//   the "Next Follow-Up Date" which doubles as countdown.)

import { useMemo, useState } from 'react';
import {
  Mail,
  MessageCircle,
  Phone,
  Globe,
  CalendarClock,
  Sparkles,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusChip } from '@/components/ui/status-chip';
import type { Campaign, ContactChannel } from '@/lib/types/campaign';
import {
  asRelationshipStage,
  STAGE_TONE,
} from './relationship-stages';
import { FILTERS, getToday, type FilterKey } from './filter-chips';
import { SORT_LABEL, sortCampaigns, type SortKey } from './sort-options';
import { RELATIONSHIP_PROMPTS } from './relationship-prompts';

// ── Cell renderers ──────────────────────────────────────────────────────────

const CHANNEL_ICON: Record<ContactChannel, typeof Mail> = {
  email:     Mail,
  whatsapp:  MessageCircle,
  call:      Phone,
  sideshift: Globe,
  other:     Globe,
};

function ChannelCell({ value }: { value: ContactChannel }) {
  const Icon = CHANNEL_ICON[value];
  return (
    <span className="inline-flex items-center gap-1.5 text-[11.5px] capitalize text-ink-700">
      <Icon className="h-3 w-3 text-ink-400" aria-hidden />
      {value}
    </span>
  );
}

function RepeatBadge({ value }: { value?: string }) {
  if (!value) return <span className="text-ink-400 text-[11px]">—</span>;
  const tone =
    value === 'high' ? 'green' : value === 'medium' ? 'yellow' : 'pink';
  return <StatusChip tone={tone}>{value}</StatusChip>;
}

function QualityCell({
  value,
  goodTone = 'green',
}: {
  value?: string;
  goodTone?: 'green' | 'blue';
}) {
  if (!value) return <span className="text-ink-400 text-[11px]">—</span>;
  const tone =
    value === 'good' || value === 'fast'
      ? goodTone
      : value === 'slow' || value === 'unknown'
      ? 'yellow'
      : 'pink';
  return <StatusChip tone={tone}>{value}</StatusChip>;
}

function BrandFitBar({ score }: { score?: number }) {
  if (score === undefined) return <span className="text-ink-400 text-[11px]">—</span>;
  return (
    <div className="flex items-center gap-2 min-w-[88px]">
      <div className="relative h-1.5 w-16 overflow-hidden rounded-full bg-cloud-100">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out',
            score >= 80 ? 'bg-emerald-500'
              : score >= 60 ? 'bg-amber-500'
              : 'bg-rose-400',
          )}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <span className="text-[11px] font-mono tabular-nums text-ink-700">
        {score}
      </span>
    </div>
  );
}

function fmtDate(iso?: string) {
  if (!iso) return '—';
  // Render as e.g. "May 18" (deterministic, no locale leakage in SSR).
  const [, m, d] = iso.split('-');
  const monthName = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ][Number(m) - 1] ?? '';
  return `${monthName} ${Number(d)}`;
}

// ── Relationship Prompts modal ──────────────────────────────────────────────

function RelationshipPromptsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink-900/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-card ring-1 ring-cloud-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-cloud-50 hover:text-ink-700 transition"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-cloud-soft text-cloud-700 ring-1 ring-cloud-100">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10.5px] uppercase tracking-[0.22em] text-ink-500 font-semibold">
              Smart Feature · Wave 5
            </p>
            <h3 className="font-display text-xl text-ink-900">
              Relationship Prompts
            </h3>
          </div>
        </div>
        <p className="mt-4 text-[13px] text-ink-600 leading-relaxed">
          Coming soon: Wave 5 (E13) wires these prompts to the Response
          Draft Generator. Each preset will load Julz&rsquo;s matching
          outreach template (from <code className="text-[11.5px] text-cloud-700">UGC/_meta/09-outreach-templates.md</code>)
          and pre-fill the brand context.
        </p>
        <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {RELATIONSHIP_PROMPTS.map((p) => (
            <li
              key={p.key}
              className="rounded-2xl border border-cloud-100 bg-cloud-50/40 p-3"
            >
              <p className="text-[13px] font-semibold text-ink-900">
                {p.label}
              </p>
              <p className="mt-0.5 text-[11.5px] text-ink-600">{p.blurb}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-cloud-600 font-semibold">
                {p.templateRef}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Main table ──────────────────────────────────────────────────────────────

export function CrmTable({ rows }: { rows: Campaign[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [activeSort, setActiveSort] = useState<SortKey>('followup_date');
  const [promptsOpen, setPromptsOpen] = useState(false);
  const today = getToday();

  const visible = useMemo(() => {
    const filter = FILTERS.find((f) => f.key === activeFilter) ?? FILTERS[0];
    const filtered = rows.filter((r) => filter.match(r, today));
    return sortCampaigns(filtered, activeSort);
  }, [rows, activeFilter, activeSort, today]);

  // Spec L744–L753 "Smart Feature": Relationship Prompts panel.
  // Empty state per task L9: "No active brand relationships yet."
  if (rows.length === 0) {
    return (
      <div className="rise rise-2 rounded-3xl bg-white p-10 shadow-card ring-1 ring-cloud-100 max-w-3xl">
        <h2 className="font-display text-[22px] font-medium tracking-tight text-ink-900">
          No active brand relationships yet.
        </h2>
        <p className="mt-2 text-[14px] text-ink-600 max-w-xl">
          Once a brand replies, their card lands here with last-touch
          history and a warm-up move queued for the week.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Filter chips + sort + relationship-prompts CTA */}
      <div className="rise flex flex-wrap items-center gap-2 mb-4">
        {FILTERS.map((f) => {
          const active = f.key === activeFilter;
          const count = rows.filter((r) => f.match(r, today)).length;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setActiveFilter(f.key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-medium ring-1 transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud-300 focus-visible:ring-offset-1',
                active
                  ? 'bg-cloud-100 text-cloud-700 ring-cloud-200 shadow-card'
                  : 'bg-white text-ink-600 ring-cloud-100 hover:bg-cloud-50 hover:text-ink-900 hover:ring-cloud-200 hover:-translate-y-px',
              )}
            >
              {f.label}
              <span
                className={cn(
                  'rounded-full px-1.5 text-[10px] font-mono tabular-nums',
                  active ? 'bg-white/70 text-cloud-700' : 'bg-cloud-50 text-ink-500',
                )}
              >
                {count}
              </span>
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          <label className="text-[10.5px] uppercase tracking-[0.18em] text-ink-500 font-semibold">
            Sort
          </label>
          <select
            value={activeSort}
            onChange={(e) => setActiveSort(e.target.value as SortKey)}
            className="rounded-full border border-cloud-100 bg-white px-3 py-1.5 text-[12px] text-ink-700 shadow-card focus:outline-none focus:ring-2 focus:ring-cloud-200"
          >
            {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABEL[k]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setPromptsOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-cloud-sunset px-3.5 py-1.5 text-[11.5px] font-semibold text-white shadow-card hover:brightness-105 transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Relationship prompts
          </button>
        </div>
      </div>

      {/* Table */}
      {/* A.14j Wave 1a T4 tokens: h-12 lg:h-14 rows · px-4 py-3 cells · 11px/0.14em uppercase ink-600 headers · 13.5px/leading-snug body · even:bg-cloud-50/40 zebra */}
      <div className="rise rise-1 overflow-x-auto rounded-3xl bg-white shadow-card ring-1 ring-cloud-100">
        <table className="w-full min-w-[1480px] border-separate border-spacing-0 text-left">
          <thead>
            <tr className="bg-cloud-50/60 text-[11px] uppercase tracking-[0.14em] text-ink-600">
              {[
                'Brand', 'Contact', 'Role', 'Channel',
                'Last msg', 'Summary', 'My reply',
                'Follow-up', 'Stage', 'Repeat',
                'Brand fit', 'Pay', 'Comms',
                'Notes', 'Next move',
              ].map((h) => (
                <th
                  key={h}
                  className="h-12 lg:h-14 px-4 py-3 font-medium whitespace-nowrap border-b border-cloud-100"
                  scope="col"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[13.5px] leading-snug text-ink-800">
            {visible.length === 0 ? (
              <tr>
                <td
                  colSpan={15}
                  className="px-6 py-12 text-center text-[13px] text-ink-500"
                >
                  No relationships match this filter. Try{' '}
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className="text-cloud-700 underline underline-offset-2 hover:text-cloud-900"
                  >
                    clearing it
                  </button>
                  .
                </td>
              </tr>
            ) : (
              visible.map((c) => {
                const stage = asRelationshipStage(c.relationship_status);
                const followupOverdue =
                  c.follow_up_date && c.follow_up_date <= today;
                return (
                  <tr
                    key={c.campaign_id}
                    className="group/row align-top even:bg-cloud-50/40 hover:bg-cloud-50/70 transition-colors duration-150"
                  >
                    {/* 1. Brand */}
                    <td className="h-12 lg:h-14 px-4 py-3 border-b border-cloud-100/70 whitespace-nowrap">
                      <span className="font-semibold text-ink-900">{c.brand}</span>
                      <span className="block text-[10.5px] text-ink-500 mt-0.5">
                        {c.product}
                      </span>
                    </td>
                    {/* 2. Contact name */}
                    <td className="h-12 lg:h-14 px-4 py-3 border-b border-cloud-100/70 whitespace-nowrap">
                      {c.contact_name}
                    </td>
                    {/* 3. Contact role */}
                    <td className="h-12 lg:h-14 px-4 py-3 border-b border-cloud-100/70 text-[11.5px] text-ink-600 whitespace-nowrap">
                      {c.contact_role ?? '—'}
                    </td>
                    {/* 4. Contact channel */}
                    <td className="h-12 lg:h-14 px-4 py-3 border-b border-cloud-100/70">
                      <ChannelCell value={c.contact_channel} />
                    </td>
                    {/* 5. Last message date */}
                    <td className="h-12 lg:h-14 px-4 py-3 border-b border-cloud-100/70 font-mono tabular-nums text-[11.5px] text-ink-600 whitespace-nowrap">
                      {fmtDate(c.last_message_date)}
                    </td>
                    {/* 6. Last message summary */}
                    <td className="h-12 lg:h-14 px-4 py-3 border-b border-cloud-100/70 max-w-[240px] text-[11.5px] text-ink-700">
                      <span className="line-clamp-2">
                        {c.last_message_summary ?? '—'}
                      </span>
                    </td>
                    {/* 7. My last response */}
                    <td className="h-12 lg:h-14 px-4 py-3 border-b border-cloud-100/70 max-w-[200px] text-[11.5px] text-ink-600">
                      <span className="line-clamp-2 italic">
                        {c.my_last_response ?? '—'}
                      </span>
                    </td>
                    {/* 8. Next follow-up date */}
                    <td className="h-12 lg:h-14 px-4 py-3 border-b border-cloud-100/70 whitespace-nowrap">
                      {c.follow_up_date ? (
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 text-[11.5px] font-mono tabular-nums',
                            followupOverdue ? 'text-rose-700' : 'text-ink-700',
                          )}
                        >
                          <CalendarClock className="h-3 w-3" aria-hidden />
                          {fmtDate(c.follow_up_date)}
                        </span>
                      ) : (
                        <span className="text-ink-400 text-[11px]">—</span>
                      )}
                    </td>
                    {/* 9. Relationship status (stage pill) — hover lifts chip (hooked-ux: trigger→action loop) */}
                    <td className="h-12 lg:h-14 px-4 py-3 border-b border-cloud-100/70 whitespace-nowrap">
                      <span className="inline-block transition-transform duration-150 ease-out group-hover/row:-translate-y-px group-hover/row:[filter:drop-shadow(0_1px_2px_rgba(15,23,42,0.08))]">
                        <StatusChip tone={STAGE_TONE[stage]}>{stage}</StatusChip>
                      </span>
                    </td>
                    {/* 10. Repeat potential */}
                    <td className="h-12 lg:h-14 px-4 py-3 border-b border-cloud-100/70 whitespace-nowrap">
                      <RepeatBadge value={c.repeat_potential} />
                    </td>
                    {/* 11. Brand fit score */}
                    <td className="h-12 lg:h-14 px-4 py-3 border-b border-cloud-100/70">
                      <BrandFitBar score={c.brand_fit_score} />
                    </td>
                    {/* 12. Payment quality */}
                    <td className="h-12 lg:h-14 px-4 py-3 border-b border-cloud-100/70 whitespace-nowrap">
                      <QualityCell value={c.payment_quality} />
                    </td>
                    {/* 13. Communication quality */}
                    <td className="h-12 lg:h-14 px-4 py-3 border-b border-cloud-100/70 whitespace-nowrap">
                      <QualityCell value={c.communication_quality} goodTone="blue" />
                    </td>
                    {/* 14. Notes */}
                    <td className="h-12 lg:h-14 px-4 py-3 border-b border-cloud-100/70 max-w-[220px] text-[11.5px] text-ink-600">
                      <span className="line-clamp-2">{c.notes ?? '—'}</span>
                    </td>
                    {/* 15. Next relationship move */}
                    <td className="h-12 lg:h-14 px-4 py-3 border-b border-cloud-100/70 max-w-[240px] text-[11.5px] text-ink-800">
                      <span className="line-clamp-2 font-medium">
                        {c.next_relationship_move ?? '—'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <RelationshipPromptsModal
        open={promptsOpen}
        onClose={() => setPromptsOpen(false)}
      />
    </>
  );
}
