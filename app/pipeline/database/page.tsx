'use client';

import { useMemo, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Plus, Columns3, ArrowUpDown, X } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { StatCard } from '@/components/ui/stat-card';
import { cn, formatMoney } from '@/lib/utils';
import { DATABASE_CAMPAIGNS, DATABASE_STAT_COLUMNS } from '@/lib/mock-data/database-rows';
import {
  COLUMNS,
  DEFAULT_VISIBLE,
  FILTER_CHIPS,
  SORT_PRESETS,
  type ColumnKey,
  type FilterKey,
  type SortPresetKey,
} from '@/components/database/column-config';
import {
  StageCell,
  StatusCell,
  PriorityCell,
  PaymentCell,
  RiskCell,
  ScoreCell,
  LinkCell,
  WaitingOnCell,
  MoneyCell,
  BonusCell,
  DateCell,
} from '@/components/database/cell-renderers';
import type { Campaign } from '@/lib/types/campaign';

const PAGE_SIZE = 15;
const STAT_ACCENTS = ['pink','pink','iris','iris','orange','orange','green','green'] as const;

function brandInitials(name: string) {
  return name
    .split(/[\s/-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

function brandGradient(name: string): string {
  const palettes = [
    'from-peach-300 to-rose-400',
    'from-iris-300 to-cloud-500',
    'from-cloud-300 to-iris-400',
    'from-rose-300 to-peach-400',
    'from-orange-300 to-rose-400',
    'from-emerald-300 to-cloud-400',
    'from-amber-300 to-orange-400',
  ];
  const code = name.charCodeAt(0) || 0;
  return palettes[code % palettes.length];
}

/** Renders a single cell value for the given column key. */
function renderCell(col: ColumnKey, c: Campaign): React.ReactNode {
  switch (col) {
    case 'campaign_id':           return <span className="font-mono text-[11px] text-ink-500">{c.campaign_id}</span>;
    case 'brand':                 return (
      <div className="flex items-center gap-2 min-w-0">
        <span
          title={c.brand}
          className={cn(
            'grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br text-white font-display font-semibold text-[10px] shadow-card ring-2 ring-white',
            brandGradient(c.brand),
          )}
        >
          {brandInitials(c.brand)}
        </span>
        <span className="font-semibold text-ink-900 truncate" title={c.brand}>{c.brand}</span>
      </div>
    );
    case 'product':               return <span className="text-ink-700 truncate block max-w-[180px]" title={c.product}>{c.product}</span>;
    case 'campaign_name':         return <span className="text-ink-700 truncate block max-w-[260px]" title={c.campaign_name}>{c.campaign_name}</span>;
    case 'platform_source':       return <span className="text-[11.5px] text-ink-600 capitalize">{c.platform_source}</span>;
    case 'contact_name':          return <span className="text-[11.5px] text-ink-600 truncate block max-w-[180px]" title={c.contact_name}>{c.contact_name}</span>;
    case 'contact_channel':       return <span className="text-[11.5px] text-ink-600 capitalize">{c.contact_channel}</span>;
    case 'current_stage':         return <StageCell value={c.current_stage} />;
    case 'status':                return <StatusCell value={c.status} />;
    case 'priority':              return <PriorityCell value={c.priority} />;
    case 'waiting_on_who':        return <WaitingOnCell value={c.waiting_on_who} />;
    case 'campaign_type':         return <span className="text-[11.5px] text-ink-600 capitalize">{c.campaign_type.replace(/_/g, ' ')}</span>;
    case 'product_category':      return <span className="text-[11.5px] text-ink-600 capitalize">{c.product_category.replace(/_/g, ' ')}</span>;
    case 'deliverable_count':     return <span className="text-[11.5px] tabular-nums text-ink-700">{c.deliverable_count}</span>;
    case 'required_format':       return <span className="text-[11.5px] text-ink-600 capitalize">{c.required_format.replace(/_/g, ' ')}</span>;
    case 'required_length':       return <span className="text-[11.5px] text-ink-600">{c.required_length ?? '—'}</span>;
    case 'due_date':              return <DateCell value={c.due_date} />;
    case 'follow_up_date':        return <DateCell value={c.follow_up_date} />;
    case 'call_date':             return <DateCell value={c.call_date} />;
    case 'base_pay':              return <MoneyCell value={c.base_pay} />;
    case 'bonus_potential':       return <BonusCell value={c.bonus_potential} />;
    case 'total_potential_value': return <MoneyCell value={c.total_potential_value} />;
    case 'payment_status':        return <PaymentCell value={c.payment_status} />;
    case 'sow_link':              return <LinkCell href={c.sow_link} label="SOW" />;
    case 'job_link':              return <LinkCell href={c.job_link} label="Job posting" />;
    case 'asset_folder':          return <LinkCell href={c.asset_folder} label="Asset folder" />;
    case 'script_link':           return <LinkCell href={c.script_link} label="Script" />;
    case 'submission_link':       return <LinkCell href={c.submission_link} label="Submission" />;
    case 'posted_link':           return <LinkCell href={c.posted_link} label="Posted" />;
    case 'readiness_score':       return <ScoreCell value={c.readiness_score} />;
    case 'brand_fit_score':       return <ScoreCell value={c.brand_fit_score} />;
    case 'risk_level':            return <RiskCell value={c.risk_level} />;
    case 'next_action':           return <span className="text-[11.5px] text-ink-700 truncate block max-w-[220px]" title={c.next_action}>{c.next_action}</span>;
    case 'notes':                 return <span className="text-[11.5px] text-ink-500 truncate block max-w-[260px]" title={c.notes ?? ''}>{c.notes ?? '—'}</span>;
  }
}

export default function PipelineDatabasePage() {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set(['active']));
  const [sortKey, setSortKey] = useState<SortPresetKey>('default');
  const [visibleCols, setVisibleCols] = useState<Set<ColumnKey>>(new Set(DEFAULT_VISIBLE));
  const [colsOpen, setColsOpen] = useState(false);
  const [page, setPage] = useState(1);

  const toggleFilter = (k: FilterKey) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
    setPage(1);
  };

  const toggleCol = (k: ColumnKey) => {
    setVisibleCols(prev => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let rows: Campaign[] = DATABASE_CAMPAIGNS;
    if (activeFilters.size > 0) {
      const predicates = FILTER_CHIPS.filter(f => activeFilters.has(f.key)).map(f => f.predicate);
      rows = rows.filter(c => predicates.every(p => p(c)));
    }
    if (query) {
      const q = query.toLowerCase();
      rows = rows.filter(c =>
        c.brand.toLowerCase().includes(q) ||
        c.campaign_name.toLowerCase().includes(q) ||
        c.product.toLowerCase().includes(q) ||
        c.contact_name.toLowerCase().includes(q) ||
        c.next_action.toLowerCase().includes(q) ||
        (c.notes ?? '').toLowerCase().includes(q),
      );
    }
    const preset = SORT_PRESETS.find(p => p.key === sortKey)!;
    return [...rows].sort(preset.compare);
  }, [query, activeFilters, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);
  const visibleColumns = COLUMNS.filter(c => visibleCols.has(c.key));

  return (
    <>
      <Header pageEyebrow="Campaign Pipeline" pageTitle="Database view" />

      <div className="px-7 md:px-12 -mt-8 pb-20 space-y-8">
        {/* ============ TOP STAT CARDS ============ */}
        <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-5">
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

        {/* ============ SAVED FILTER CHIPS (spec L233-L246) ============ */}
        <section className="rounded-3xl bg-white p-4 ring-1 ring-cloud-100 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="stat-label text-ink-500">Saved filters</h2>
            {activeFilters.size > 0 && (
              <button
                type="button"
                onClick={() => { setActiveFilters(new Set()); setPage(1); }}
                className="inline-flex items-center gap-1 text-[11px] text-ink-500 hover:text-ink-700 transition"
              >
                <X className="h-3 w-3" />
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTER_CHIPS.map(f => {
              const active = activeFilters.has(f.key);
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => toggleFilter(f.key)}
                  aria-pressed={active}
                  className={cn(
                    'inline-flex items-center rounded-full px-3 py-1.5 text-[11.5px] font-medium ring-1 transition-[transform,box-shadow,background-color,color] duration-200 ease-out active:scale-95',
                    active
                      ? 'bg-cloud-sunset text-white ring-cloud-sunset shadow-card motion-safe:hover:shadow-glow'
                      : 'bg-cloud-soft text-ink-700 ring-cloud-100 hover:bg-cloud-50 hover:ring-cloud-200',
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ============ SEARCH + SORT + COLUMNS ============ */}
        <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-white p-3 ring-1 ring-cloud-100 shadow-card">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type="search"
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search brand, campaign, contact, next action…"
              className="w-full rounded-2xl bg-cloud-soft pl-9 pr-3 py-2 text-[13px] text-ink-900 placeholder:text-ink-400 ring-1 ring-cloud-100 focus:ring-cloud-300 focus:outline-none transition"
            />
          </div>

          <div className="group flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-ink-400 group-hover:text-ink-600 transition-colors duration-150" />
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value as SortPresetKey)}
              className="rounded-2xl bg-cloud-soft px-3 py-2 text-[13px] font-medium text-ink-700 ring-1 ring-cloud-100 hover:ring-cloud-200 focus:ring-cloud-300 focus:outline-none transition-[box-shadow,border-color,background-color] duration-200 ease-out cursor-pointer"
            >
              {SORT_PRESETS.map(p => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setColsOpen(o => !o)}
              aria-expanded={colsOpen}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-cloud-soft px-3 py-2 text-[13px] font-medium text-ink-700 ring-1 ring-cloud-100 hover:bg-cloud-50 hover:ring-cloud-200 transition-[box-shadow,background-color] duration-200 ease-out"
            >
              <Columns3 className="h-4 w-4 text-ink-400" />
              Columns
              <span className="text-[10px] text-ink-500">({visibleCols.size}/{COLUMNS.length})</span>
            </button>
            {colsOpen && (
              <div className="absolute right-0 top-full mt-2 z-20 w-72 max-h-[420px] overflow-y-auto rounded-2xl bg-white p-3 shadow-card ring-1 ring-cloud-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="stat-label text-ink-500">Show/hide columns</p>
                  <button
                    type="button"
                    onClick={() => setVisibleCols(new Set(DEFAULT_VISIBLE))}
                    className="text-[11px] text-iris-600 hover:text-iris-700"
                  >
                    Reset
                  </button>
                </div>
                <div className="space-y-1">
                  {COLUMNS.map(col => (
                    <label key={col.key} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-cloud-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleCols.has(col.key)}
                        onChange={() => toggleCol(col.key)}
                        disabled={col.key === 'brand'}
                        className="accent-cloud-sunset"
                      />
                      <span className={cn('text-[12px]', col.key === 'brand' ? 'text-ink-400' : 'text-ink-700')}>
                        {col.label}
                        {col.key === 'brand' && <span className="ml-1 text-[10px] text-ink-400">(sticky)</span>}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p className="ml-auto text-[12px] text-ink-500">
            <span className="font-display text-base text-ink-900 mr-1">{filtered.length}</span>
            of {DATABASE_CAMPAIGNS.length} campaigns
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-cloud-sunset px-4 py-2 text-[12px] font-semibold text-white shadow-soft hover:shadow-glow transition-[box-shadow,transform] duration-200 ease-out motion-safe:hover:-translate-y-px active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Campaign
          </button>
        </div>

        {/* ============ TABLE ============ */}
        {/* A.14j Wave 1a T4 tokens: h-12 lg:h-14 rows · px-4 py-3 cells · 11px/0.14em uppercase headers · 13.5px/leading-snug body · even:bg-cloud-50/40 zebra */}
        <div className="rounded-3xl bg-white shadow-card ring-1 ring-cloud-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px] leading-snug border-separate border-spacing-0">
              <thead className="bg-cloud-soft text-left">
                <tr className="text-[11px] uppercase tracking-[0.14em] text-ink-600">
                  {visibleColumns.map((col, idx) => (
                    <th
                      key={col.key}
                      className={cn(
                        'h-12 lg:h-14 px-4 py-3 font-medium whitespace-nowrap border-b border-cloud-100 hover:bg-cloud-50/60 transition-colors duration-150 cursor-default select-none',
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center',
                        col.key === 'brand' && 'sticky left-0 z-10 bg-cloud-soft',
                        idx === 0 && col.key !== 'brand' && 'pl-4',
                      )}
                      style={{ minWidth: col.width }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr key={row.campaign_id} className="group even:bg-cloud-50/40 transition-colors duration-150">
                    {visibleColumns.map(col => (
                      <td
                        key={col.key}
                        className={cn(
                          'h-12 lg:h-14 px-4 py-3 border-b border-cloud-50 align-middle group-hover:bg-cloud-50/60 transition-colors duration-150 ease-out',
                          col.align === 'right' && 'text-right',
                          col.align === 'center' && 'text-center',
                          col.key === 'brand' && 'sticky left-0 z-[1] bg-white group-even:bg-cloud-50/40 group-hover:bg-cloud-50',
                        )}
                        style={{ minWidth: col.width }}
                      >
                        {renderCell(col.key, row)}
                      </td>
                    ))}
                  </tr>
                ))}
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={visibleColumns.length} className="px-4 py-16 text-center">
                      <p className="text-ink-700 font-display text-base mb-1">No campaigns match your filters.</p>
                      <p className="text-ink-400 text-[12px]">Try removing a filter chip or clearing search.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          <div className="flex items-center justify-between gap-3 border-t border-cloud-100 px-4 py-3 bg-cloud-soft/40">
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 8).map(p => (
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
              {totalPages > 8 && <span className="text-ink-400 text-[11px]">…</span>}
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
