'use client';

import { useMemo, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { StatCard } from '@/components/ui/stat-card';
import { StatusChip } from '@/components/ui/status-chip';
import { cn, formatMoney } from '@/lib/utils';
import {
  DATABASE_ROWS,
  DATABASE_STAT_COLUMNS,
  type PaymentStatus,
  type ResponseStatus,
} from '@/lib/mock-data/database-rows';
import type { PipelineStage } from '@/lib/mock-data/pipeline';

const PAGE_SIZE = 10;

const STAT_ACCENTS = ['pink','pink','iris','iris','orange','orange','green','green'] as const;

const stageTone = (s: PipelineStage) => {
  if (s.startsWith('NEW') || s.startsWith('RESPOND') || s.startsWith('WAITING')) return 'pink';
  if (s.startsWith('SOW') || s.startsWith('STRATEGY') || s.startsWith('SCRIPT')) return 'iris';
  if (s.startsWith('FILM') || s.startsWith('EDIT') || s.startsWith('QA')) return 'orange';
  if (s.startsWith('SUBMIT')) return 'yellow';
  if (s.startsWith('ACCEPT') || s.startsWith('POSTED') || s.startsWith('PAID')) return 'green';
  return 'pink';
};

const paymentTone: Record<PaymentStatus, 'green'|'yellow'|'orange'|'pink'|'iris'> = {
  'Paid':             'green',
  'Invoiced':         'iris',
  'Awaiting Invoice': 'yellow',
  'In Escrow':        'iris',
  'Pending Brand':    'orange',
  'Not Started':      'pink',
};

const responseTone: Record<ResponseStatus, 'green'|'yellow'|'orange'|'pink'|'iris'|'red'> = {
  'No Reply':  'orange',
  'Pending':   'yellow',
  'Engaged':   'iris',
  'Confirmed': 'green',
  'Declined':  'red',
  'Closed':    'pink',
};

const STAGE_OPTIONS: (PipelineStage | 'ALL')[] = [
  'ALL',
  'NEW LEAD',
  'RESPONDED',
  'WAITING ON BRAND',
  'SOW RECEIVED',
  'SOW REVIEWED',
  'STRATEGY READY',
  'SCRIPT READY',
  'FILMING',
  'EDITING',
  'QA',
  'SUBMITTED',
  'ACCEPTED',
  'POSTED',
  'PAID',
];

export default function PipelineDatabasePage() {
  const [query, setQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<PipelineStage | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return DATABASE_ROWS.filter(r => {
      if (stageFilter !== 'ALL' && r.stage !== stageFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          r.brand.toLowerCase().includes(q) ||
          r.campaign.toLowerCase().includes(q) ||
          r.deliverable.toLowerCase().includes(q) ||
          r.nextStep.toLowerCase().includes(q) ||
          r.notes.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [query, stageFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  return (
    <>
      <Header
        pageEyebrow="Campaign Pipeline"
        pageTitle="Database view"
      />

      <div className="px-6 md:px-10 -mt-6 pb-16 space-y-6">
        {/* ============ TOP STAT CARDS ============ */}
        <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {DATABASE_STAT_COLUMNS.map((s, i) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.count}
              sub={formatMoney(s.value)}
              accent={STAT_ACCENTS[i]}
            />
          ))}
        </section>

        {/* ============ FILTERS ============ */}
        <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-white p-3 ring-1 ring-cloud-100 shadow-card">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type="search"
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search brand, campaign, next step…"
              className="w-full rounded-2xl bg-cloud-soft pl-9 pr-3 py-2 text-[13px] text-ink-900 placeholder:text-ink-400 ring-1 ring-cloud-100 focus:ring-cloud-300 focus:outline-none transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-ink-400" />
            <select
              value={stageFilter}
              onChange={e => { setStageFilter(e.target.value as PipelineStage | 'ALL'); setPage(1); }}
              className="rounded-2xl bg-cloud-soft px-3 py-2 text-[13px] font-medium text-ink-700 ring-1 ring-cloud-100 focus:ring-cloud-300 focus:outline-none transition"
            >
              {STAGE_OPTIONS.map(s => (
                <option key={s} value={s}>{s === 'ALL' ? 'All stages' : s}</option>
              ))}
            </select>
          </div>
          <p className="ml-auto text-[12px] text-ink-500">
            <span className="font-display text-base text-ink-900 mr-1">{filtered.length}</span>
            of {DATABASE_ROWS.length} campaigns
          </p>
        </div>

        {/* ============ TABLE ============ */}
        <div className="rounded-3xl bg-white shadow-card ring-1 ring-cloud-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="bg-cloud-soft text-left">
                <tr className="text-[10px] uppercase tracking-[0.16em] text-ink-500">
                  <th className="px-4 py-3 font-semibold">Brand</th>
                  <th className="px-4 py-3 font-semibold">Campaign</th>
                  <th className="px-4 py-3 font-semibold">Stage</th>
                  <th className="px-4 py-3 font-semibold">Deliverable</th>
                  <th className="px-4 py-3 font-semibold">Deadline</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                  <th className="px-4 py-3 font-semibold">Owner</th>
                  <th className="px-4 py-3 font-semibold">Next Step</th>
                  <th className="px-4 py-3 font-semibold">Response</th>
                  <th className="px-4 py-3 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud-50">
                {pageRows.map(row => (
                  <tr key={row.id} className="hover:bg-cloud-50/60 transition">
                    <td className="px-4 py-3 font-semibold text-ink-900 whitespace-nowrap">{row.brand}</td>
                    <td className="px-4 py-3 text-ink-700 max-w-[200px] truncate" title={row.campaign}>{row.campaign}</td>
                    <td className="px-4 py-3"><StatusChip tone={stageTone(row.stage) as any}>{row.stage}</StatusChip></td>
                    <td className="px-4 py-3 text-ink-600 whitespace-nowrap">{row.deliverable}</td>
                    <td className="px-4 py-3 text-ink-700 whitespace-nowrap font-medium">{row.deadline}</td>
                    <td className="px-4 py-3"><StatusChip tone={paymentTone[row.payment]}>{row.payment}</StatusChip></td>
                    <td className="px-4 py-3">
                      <span
                        title="Julianne Silla"
                        className="inline-grid h-7 w-7 place-items-center rounded-full bg-cloud-soft text-cloud-700 font-display font-semibold text-[11px] ring-1 ring-cloud-200"
                      >
                        {row.ownerInitials}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-700 max-w-[180px] truncate" title={row.nextStep}>{row.nextStep}</td>
                    <td className="px-4 py-3"><StatusChip tone={responseTone[row.response]}>{row.response}</StatusChip></td>
                    <td className="px-4 py-3 text-ink-500 max-w-[220px] truncate" title={row.notes}>{row.notes}</td>
                  </tr>
                ))}
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-ink-400 text-[13px]">
                      No campaigns match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          <div className="flex items-center justify-between gap-3 border-t border-cloud-50 px-4 py-3 bg-cloud-soft/40">
            <p className="text-[11.5px] text-ink-500">
              Showing <span className="font-semibold text-ink-700">{Math.min(start + 1, filtered.length)}</span>
              –<span className="font-semibold text-ink-700">{Math.min(start + PAGE_SIZE, filtered.length)}</span> of {filtered.length}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11.5px] font-medium ring-1 transition',
                  safePage === 1
                    ? 'text-ink-300 ring-cloud-100 cursor-not-allowed'
                    : 'text-ink-700 ring-cloud-200 hover:bg-white',
                )}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={cn(
                    'h-7 min-w-[28px] rounded-full px-2 text-[11.5px] font-semibold transition',
                    p === safePage
                      ? 'bg-cloud-sunset text-white shadow-card'
                      : 'text-ink-600 hover:bg-white',
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11.5px] font-medium ring-1 transition',
                  safePage === totalPages
                    ? 'text-ink-300 ring-cloud-100 cursor-not-allowed'
                    : 'text-ink-700 ring-cloud-200 hover:bg-white',
                )}
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
