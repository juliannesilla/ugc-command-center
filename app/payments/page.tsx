'use client';

// Money View — Phase A.14e Wave 3 (E8).
//
// Source: UGC/_meta/dashboard-spec/02-campaign-pipeline-views-architecture.md
// view #8 "Payments View" (L597-L673).
//
// Sections:
// 1. 8 top-metric cards (spec L614-L623)
// 2. 8 filter chips + platform/brand dropdowns (spec L646-L655)
// 3. 4 sort presets (spec L659-L662)
// 4. Per-payment table with sticky brand column (spec L625-L644)
// 5. Follow-up generator placeholder per row (spec L664-L673)
// 6. Empty state for the no-payments-tracked case

import { useMemo, useState } from 'react';
import {
  Search,
  ArrowUpDown,
  Send,
  Check,
  X as XIcon,
  FileText,
  ChevronDown,
  Wallet,
} from 'lucide-react';
import { Header } from '@/components/ui/header';
import { type StatAccent } from '@/components/ui/stat-card';
// A.14n N3-CROSS-DATA Wave 2b: StatStrip adopted for the 8-KPI tile row
// (mockup #06 + #08 — tight inline row with accent rings + tabular-nums, not
// stacked cards). HR-2 PRESERVE: full Header with mantra/brand-string locked
// HR-27, table + filter chips + follow-up modal untouched.
import { StatStrip } from '@/components/ui';
import { StatusChip, type ChipTone } from '@/components/ui/status-chip';
import { MoneyCell, BonusCell, DateCell } from '@/components/database/cell-renderers';
import { cn, formatMoney } from '@/lib/utils';
import { MOCK_PAYMENTS, type PaymentRow, type PaymentPlatform } from '@/lib/mock-data/payments';
import type { PaymentStatus } from '@/lib/types/campaign';
import {
  sumExpected,
  sumReceived,
  pendingTotal,
  overdueTotal,
  bonusPotential,
  highestValueActive,
  averagePerDeliverable,
  thisMonthEarned,
  isOverdue,
  hasHighBonus,
  hasUnclearTerms,
  paidThisMonth,
  needsInvoicing,
} from '@/components/payments/payment-aggregates';

// ── Payment status pill colors (spec — Task 8 aesthetic) ───────────────────
const PAYMENT_TONE: Record<PaymentStatus, ChipTone> = {
  unknown: 'pink', // gray-ish via cloud
  pending: 'yellow',
  invoiced: 'blue',
  paid: 'green',
  overdue: 'red',
};

// ── Filter chips (spec L646-L655) ──────────────────────────────────────────
type FilterKey =
  | 'pending'
  | 'overdue'
  | 'paid_this_month'
  | 'high_bonus'
  | 'unclear_terms'
  | 'invoicing_needed';

const FILTER_CHIPS: { key: FilterKey; label: string; predicate: (r: PaymentRow) => boolean }[] = [
  { key: 'pending',          label: 'Pending payment',     predicate: (r) => r.payment_status === 'pending' || r.payment_status === 'invoiced' },
  { key: 'overdue',          label: 'Overdue',              predicate: isOverdue },
  { key: 'paid_this_month',  label: 'Paid this month',      predicate: paidThisMonth },
  { key: 'high_bonus',       label: 'High bonus potential', predicate: hasHighBonus },
  { key: 'unclear_terms',    label: 'Unclear payment terms', predicate: hasUnclearTerms },
  { key: 'invoicing_needed', label: 'Invoicing needed',     predicate: needsInvoicing },
];

// ── Sort presets (spec L659-L662) ──────────────────────────────────────────
type SortKey = 'overdue_first' | 'due_soonest' | 'highest_owed' | 'highest_bonus';

function compareRows(a: PaymentRow, b: PaymentRow, key: SortKey): number {
  switch (key) {
    case 'overdue_first': {
      const ao = isOverdue(a) ? 0 : 1;
      const bo = isOverdue(b) ? 0 : 1;
      if (ao !== bo) return ao - bo;
      // tiebreak by due-soonest
      return compareRows(a, b, 'due_soonest');
    }
    case 'due_soonest': {
      const ad = a.payment_due_date ? new Date(a.payment_due_date).getTime() : Infinity;
      const bd = b.payment_due_date ? new Date(b.payment_due_date).getTime() : Infinity;
      return ad - bd;
    }
    case 'highest_owed': {
      const av = (a.amount_earned ?? a.base_pay ?? 0) - (a.amount_received ?? 0);
      const bv = (b.amount_earned ?? b.base_pay ?? 0) - (b.amount_received ?? 0);
      return bv - av;
    }
    case 'highest_bonus': {
      const av = typeof a.bonus_potential === 'number' ? a.bonus_potential : 0;
      const bv = typeof b.bonus_potential === 'number' ? b.bonus_potential : 0;
      return bv - av;
    }
  }
}

const SORT_LABELS: Record<SortKey, string> = {
  overdue_first: 'Overdue first',
  due_soonest:   'Due soonest',
  highest_owed:  'Highest amount owed',
  highest_bonus: 'Highest bonus potential',
};

// ── Brand avatar helper (matches database view) ───────────────────────────
function brandInitials(name: string): string {
  return name
    .split(/[\s/-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
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
  return palettes[(name.charCodeAt(0) || 0) % palettes.length];
}

// ── Platform pill ─────────────────────────────────────────────────────────
const PLATFORM_TONE: Record<PaymentPlatform, string> = {
  PayPal:          'bg-iris-50 text-iris-700 ring-iris-200',
  Stripe:          'bg-cloud-50 text-cloud-700 ring-cloud-200',
  SideShift:       'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'Bank Transfer': 'bg-amber-50 text-amber-800 ring-amber-200',
  Unknown:         'bg-cloud-50 text-ink-600 ring-cloud-100',
};

export default function PaymentsPage() {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set());
  const [platform, setPlatform] = useState<'all' | PaymentPlatform>('all');
  const [brand, setBrand] = useState<'all' | string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('overdue_first');
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [followUp, setFollowUp] = useState<{ row: PaymentRow; type: string } | null>(null);

  const allPlatforms = useMemo(
    () => Array.from(new Set(MOCK_PAYMENTS.map((r) => r.payment_platform))).sort(),
    [],
  );
  const allBrands = useMemo(
    () => Array.from(new Set(MOCK_PAYMENTS.map((r) => r.brand))).sort(),
    [],
  );

  // ── Aggregates ──────────────────────────────────────────────────────────
  const expected   = sumExpected(MOCK_PAYMENTS);
  const received   = sumReceived(MOCK_PAYMENTS);
  const pending    = pendingTotal(MOCK_PAYMENTS);
  const overdue    = overdueTotal(MOCK_PAYMENTS);
  const bonus      = bonusPotential(MOCK_PAYMENTS);
  const highest    = highestValueActive(MOCK_PAYMENTS);
  const avgPer     = averagePerDeliverable(MOCK_PAYMENTS);
  const monthEarned = thisMonthEarned(MOCK_PAYMENTS);

  // ── Filtered + sorted rows ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    let rows: PaymentRow[] = MOCK_PAYMENTS;

    if (activeFilters.size > 0) {
      const preds = FILTER_CHIPS.filter((f) => activeFilters.has(f.key)).map((f) => f.predicate);
      rows = rows.filter((r) => preds.every((p) => p(r)));
    }
    if (platform !== 'all') rows = rows.filter((r) => r.payment_platform === platform);
    if (brand !== 'all') rows = rows.filter((r) => r.brand === brand);
    if (query) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.brand.toLowerCase().includes(q) ||
          r.campaign_name.toLowerCase().includes(q) ||
          r.deliverable.toLowerCase().includes(q) ||
          (r.notes ?? '').toLowerCase().includes(q),
      );
    }
    return [...rows].sort((a, b) => compareRows(a, b, sortKey));
  }, [query, activeFilters, platform, brand, sortKey]);

  const toggleFilter = (k: FilterKey) =>
    setActiveFilters((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });

  const toggleNotes = (id: string) =>
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // ── 8 metric cards data ─────────────────────────────────────────────────
  const cards: { label: string; value: string; sub?: string; accent: StatAccent }[] = [
    { label: 'Total Expected',       value: formatMoney(expected),    sub: `${MOCK_PAYMENTS.length} deliverables`, accent: 'iris'   },
    { label: 'Total Received',       value: formatMoney(received),    sub: received === 0 ? 'No payouts yet' : 'In hand', accent: 'green'  },
    { label: 'Pending Payments',     value: formatMoney(pending.amount), sub: `${pending.count} awaiting`, accent: 'yellow' },
    { label: 'Overdue Payments',     value: formatMoney(overdue.amount), sub: overdue.count === 0 ? 'All clear' : `${overdue.count} past due`, accent: 'pink'   },
    { label: 'Bonus Potential',      value: formatMoney(bonus),       sub: 'Max upside if hit', accent: 'peach'  },
    { label: 'Highest-Value Active', value: highest?.brand ?? '—',    sub: highest ? formatMoney(highest.total_potential_value ?? 0) : 'None active', accent: 'orange' },
    { label: 'Avg Pay / Deliverable',value: formatMoney(avgPer),      sub: 'Excludes TBD pricing', accent: 'iris'   },
    { label: "This Month's Earned",  value: formatMoney(monthEarned), sub: 'Confirmed deposits', accent: 'green'  },
  ];

  const hasNoPayments = MOCK_PAYMENTS.length === 0;

  return (
    <>
      <Header pageEyebrow="Payments + Bonuses" pageTitle="Cash in motion." />

      <div className="px-7 md:px-12 -mt-8 pb-20 space-y-6 lg:space-y-8">
        {hasNoPayments ? (
          <EmptyState />
        ) : (
          <>
            {/* ============ 8 TOP METRIC CARDS — StatStrip primitive ============
                A.14n N3-CROSS-DATA: mockup #06+#08 cite a tight 8-tile inline row
                with accent rings and tabular-nums alignment. StatStrip handles
                the lg:grid-cols-8 + .card-stat / .stat-label / .stat-number
                rhythm in one place so this matches /pipeline/database + /. */}
            <StatStrip
              tiles={cards.map((c) => ({
                number: c.value,
                label: c.label,
                sub: c.sub,
                // StatStrip palette doesn't include 'yellow' — fold it onto peach
                // (the next-warmest tone) so the 8-card row stays visually varied.
                accent: c.accent === 'yellow' ? 'peach' : c.accent,
              }))}
            />


            {/* ============ FILTER CHIPS + PLATFORM/BRAND DROPDOWNS ============ */}
            <section className="rounded-3xl bg-white p-4 ring-1 ring-cloud-100 shadow-card">
              <div className="flex items-center justify-between mb-3">
                {/* T5 ADDITIVE: section-title (A.14m Stream 3). */}
                <h2 className="section-title text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700">Filters</h2>
                {(activeFilters.size > 0 || platform !== 'all' || brand !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFilters(new Set());
                      setPlatform('all');
                      setBrand('all');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-ink-700 hover:text-ink-700 transition"
                  >
                    <XIcon className="h-3 w-3" />
                    Clear all
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {FILTER_CHIPS.map((f) => {
                  const active = activeFilters.has(f.key);
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => toggleFilter(f.key)}
                      aria-pressed={active}
                      className={cn(
                        'inline-flex items-center rounded-full px-3 py-1.5 text-[11.5px] font-medium ring-1 transition',
                        active
                          ? 'bg-cloud-sunset text-white ring-cloud-sunset shadow-card'
                          : 'bg-cloud-soft text-ink-700 ring-cloud-100 hover:bg-cloud-50',
                      )}
                    >
                      {f.label}
                    </button>
                  );
                })}

                {/* By platform */}
                <div className="relative inline-flex items-center">
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as 'all' | PaymentPlatform)}
                    className="appearance-none rounded-full bg-cloud-soft pl-3 pr-8 py-1.5 text-[11.5px] font-medium text-ink-700 ring-1 ring-cloud-100 hover:bg-cloud-50 focus:ring-cloud-300 focus:outline-none transition"
                  >
                    <option value="all">By platform</option>
                    {allPlatforms.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3 text-ink-600" />
                </div>

                {/* By brand */}
                <div className="relative inline-flex items-center">
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="appearance-none rounded-full bg-cloud-soft pl-3 pr-8 py-1.5 text-[11.5px] font-medium text-ink-700 ring-1 ring-cloud-100 hover:bg-cloud-50 focus:ring-cloud-300 focus:outline-none transition"
                  >
                    <option value="all">By brand</option>
                    {allBrands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3 text-ink-600" />
                </div>
              </div>
            </section>

            {/* ============ SEARCH + SORT BAR ============ */}
            <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-white p-3 ring-1 ring-cloud-100 shadow-card">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-600" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search brand, campaign, deliverable, notes…"
                  className="w-full rounded-2xl bg-cloud-soft pl-9 pr-3 py-2 text-[13px] text-ink-900 placeholder:text-ink-600 ring-1 ring-cloud-100 focus:ring-cloud-300 focus:outline-none transition"
                />
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-ink-600" />
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="rounded-2xl bg-cloud-soft px-3 py-2 text-[13px] font-medium text-ink-700 ring-1 ring-cloud-100 focus:ring-cloud-300 focus:outline-none transition"
                >
                  {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                    <option key={k} value={k}>{SORT_LABELS[k]}</option>
                  ))}
                </select>
              </div>

              <p className="ml-auto text-[12px] text-ink-700">
                <span className="font-display text-base text-ink-900 mr-1">{filtered.length}</span>
                of {MOCK_PAYMENTS.length} payments
              </p>
            </div>

            {/* ============ PER-PAYMENT TABLE ============ */}
            <div className="rounded-3xl bg-white shadow-card ring-1 ring-cloud-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[12.5px] border-separate border-spacing-0">
                  <thead className="bg-cloud-soft text-left">
                    <tr className="text-[10px] uppercase tracking-[0.16em] text-ink-700">
                      <th className="sticky left-0 z-10 bg-cloud-soft px-4 py-3 font-semibold whitespace-nowrap border-b border-cloud-100" style={{ minWidth: 180 }}>Brand</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap border-b border-cloud-100" style={{ minWidth: 220 }}>Campaign</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap border-b border-cloud-100" style={{ minWidth: 180 }}>Deliverable</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap border-b border-cloud-100 text-right" style={{ minWidth: 90 }}>Base Pay</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap border-b border-cloud-100" style={{ minWidth: 160 }}>Bonus Structure</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap border-b border-cloud-100 text-right" style={{ minWidth: 110 }}>Total Potential</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap border-b border-cloud-100 text-right" style={{ minWidth: 100 }}>Earned</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap border-b border-cloud-100 text-right" style={{ minWidth: 100 }}>Received</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap border-b border-cloud-100" style={{ minWidth: 110 }}>Status</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap border-b border-cloud-100" style={{ minWidth: 110 }}>Platform</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap border-b border-cloud-100" style={{ minWidth: 110 }}>Submitted</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap border-b border-cloud-100" style={{ minWidth: 110 }}>Due</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap border-b border-cloud-100" style={{ minWidth: 110 }}>Paid</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap border-b border-cloud-100 text-center" style={{ minWidth: 70 }}>Invoice</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap border-b border-cloud-100 text-center" style={{ minWidth: 130 }}>Follow-Up</th>
                      <th className="px-4 py-3 font-semibold whitespace-nowrap border-b border-cloud-100" style={{ minWidth: 80 }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => {
                      const expanded = expandedNotes.has(r.id);
                      const rowOverdue = isOverdue(r);
                      const isPaid = r.payment_status === 'paid';
                      const isPending = r.payment_status === 'pending' || r.payment_status === 'invoiced';
                      // Visual rhythm: paid (emerald), pending (amber), overdue (rose) left-border accent
                      const rowAccent = rowOverdue
                        ? 'before:bg-rose-400'
                        : isPaid
                          ? 'before:bg-emerald-400'
                          : isPending
                            ? 'before:bg-amber-400'
                            : 'before:bg-transparent';
                      return (
                        <>
                          <tr
                            key={r.id}
                            className={cn(
                              'group transition-colors duration-150',
                              rowOverdue && 'bg-rose-50/30',
                            )}
                          >
                            {/* Sticky brand */}
                            <td
                              className={cn(
                                'sticky left-0 z-[1] bg-white group-hover:bg-cloud-50 px-4 py-3 border-b border-cloud-50 align-middle transition-colors duration-150',
                                'relative before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-r-full before:transition-opacity before:duration-200',
                                rowAccent,
                                rowOverdue && 'bg-rose-50/40 group-hover:bg-rose-50/60',
                              )}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  title={r.brand}
                                  className={cn(
                                    'grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br text-white font-display font-semibold text-[10px] shadow-card ring-2 ring-white transition-transform duration-200 ease-out group-hover:scale-105',
                                    brandGradient(r.brand),
                                  )}
                                >
                                  {brandInitials(r.brand)}
                                </span>
                                <span className="font-semibold text-ink-900 truncate">{r.brand}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 border-b border-cloud-50 group-hover:bg-cloud-50/50 align-middle">
                              <span className="text-ink-700 truncate block max-w-[260px]" title={r.campaign_name}>
                                {r.campaign_name}
                              </span>
                            </td>
                            <td className="px-4 py-3 border-b border-cloud-50 group-hover:bg-cloud-50/50 align-middle">
                              <span className="text-[12px] text-ink-700">{r.deliverable}</span>
                            </td>
                            <td className="px-4 py-3 border-b border-cloud-50 group-hover:bg-cloud-50/50 align-middle text-right">
                              <MoneyCell value={r.base_pay} />
                            </td>
                            <td className="px-4 py-3 border-b border-cloud-50 group-hover:bg-cloud-50/50 align-middle">
                              <BonusCell value={r.bonus_potential} />
                            </td>
                            <td className="px-4 py-3 border-b border-cloud-50 group-hover:bg-cloud-50/50 align-middle text-right">
                              <MoneyCell value={r.total_potential_value} />
                            </td>
                            <td className="px-4 py-3 border-b border-cloud-50 group-hover:bg-cloud-50/50 align-middle text-right">
                              <MoneyCell value={r.amount_earned} />
                            </td>
                            <td className="px-4 py-3 border-b border-cloud-50 group-hover:bg-cloud-50/50 align-middle text-right">
                              <MoneyCell value={r.amount_received} />
                            </td>
                            <td className="px-4 py-3 border-b border-cloud-50 group-hover:bg-cloud-50/50 align-middle">
                              <StatusChip tone={rowOverdue ? 'red' : PAYMENT_TONE[r.payment_status]}>
                                {rowOverdue ? 'overdue' : r.payment_status}
                              </StatusChip>
                            </td>
                            <td className="px-4 py-3 border-b border-cloud-50 group-hover:bg-cloud-50/50 align-middle">
                              <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium ring-1', PLATFORM_TONE[r.payment_platform])}>
                                {r.payment_platform}
                              </span>
                            </td>
                            <td className="px-4 py-3 border-b border-cloud-50 group-hover:bg-cloud-50/50 align-middle">
                              <DateCell value={r.submitted_date} />
                            </td>
                            <td className="px-4 py-3 border-b border-cloud-50 group-hover:bg-cloud-50/50 align-middle">
                              <DateCell value={r.payment_due_date} />
                            </td>
                            <td className="px-4 py-3 border-b border-cloud-50 group-hover:bg-cloud-50/50 align-middle">
                              <DateCell value={r.paid_date} />
                            </td>
                            <td className="px-4 py-3 border-b border-cloud-50 group-hover:bg-cloud-50/50 align-middle text-center">
                              {r.invoice_sent ? (
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 ring-1 ring-emerald-200" title="Invoice sent">
                                  <Check className="h-3 w-3 text-emerald-700" />
                                </span>
                              ) : (
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-cloud-soft ring-1 ring-cloud-200" title="No invoice sent">
                                  <XIcon className="h-3 w-3 text-ink-600" />
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 border-b border-cloud-50 group-hover:bg-cloud-50/50 align-middle text-center">
                              <FollowUpButton row={r} onPick={(type) => setFollowUp({ row: r, type })} />
                            </td>
                            <td className="px-4 py-3 border-b border-cloud-50 group-hover:bg-cloud-50/50 align-middle">
                              {r.notes ? (
                                <button
                                  type="button"
                                  onClick={() => toggleNotes(r.id)}
                                  className="inline-flex items-center gap-1 text-[11px] text-iris-600 hover:text-iris-700 hover:underline"
                                  aria-expanded={expanded}
                                >
                                  <FileText className="h-3 w-3" />
                                  {expanded ? 'Hide' : 'Show'}
                                </button>
                              ) : (
                                <span className="text-ink-300 text-[11.5px]">—</span>
                              )}
                            </td>
                          </tr>
                          {expanded && r.notes && (
                            <tr key={`${r.id}-notes`}>
                              <td colSpan={16} className="sticky left-0 bg-cloud-soft/60 border-b border-cloud-100 px-6 py-3">
                                <p className="text-[12px] text-ink-700 italic leading-relaxed">
                                  <span className="text-[10px] uppercase tracking-[0.16em] not-italic text-ink-700 font-semibold mr-2">Notes ·</span>
                                  {r.notes}
                                </p>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={16} className="px-4 py-16 text-center">
                          <p className="text-ink-700 font-display text-base mb-1">No payments match your filters.</p>
                          <p className="text-ink-600 text-[12px]">Try removing a filter chip or clearing search.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Follow-up generator placeholder modal */}
      {followUp && (
        <FollowUpModal
          row={followUp.row}
          type={followUp.type}
          onClose={() => setFollowUp(null)}
        />
      )}
    </>
  );
}

// ── Empty state (Task 7) ──────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="rise rise-2 rounded-3xl bg-white p-10 shadow-card ring-1 ring-cloud-100 max-w-3xl">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cloud-soft text-cloud-700 ring-1 ring-cloud-100">
        <Wallet className="h-5 w-5" />
      </span>
      {/* T5 ADDITIVE: section-title. */}
      <h2 className="section-title mt-4 font-display text-[22px] font-bold tracking-tight text-ink-900">No payments tracked yet.</h2>
      <p className="mt-2 text-[14px] text-ink-600 max-w-xl">
        Payments appear when campaigns reach Submitted stage.
      </p>
    </div>
  );
}

// ── Follow-up button + modal (Task 6) ─────────────────────────────────────
const FOLLOW_UP_TYPES = [
  { key: 'polite',    label: 'Polite payment follow-up' },
  { key: 'invoice',   label: 'Invoice confirmation' },
  { key: 'bonus',     label: 'Bonus clarification' },
  { key: 'timeline',  label: 'Payment timeline question' },
  { key: 'usage',     label: 'Usage rights / bundle' },
] as const;

function FollowUpButton({
  row,
  onPick,
}: {
  row: PaymentRow;
  onPick: (type: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const needs =
    row.payment_status === 'pending' ||
    row.payment_status === 'invoiced' ||
    row.payment_status === 'unknown' ||
    isOverdue(row);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] ring-1 transition-all duration-200 ease-out will-change-transform hover:scale-105 active:scale-95 motion-reduce:transform-none motion-reduce:transition-none',
          needs
            ? 'bg-cloud-sunset text-white ring-cloud-sunset hover:shadow-glow'
            : 'bg-cloud-soft text-ink-700 ring-cloud-100 hover:bg-cloud-50',
        )}
      >
        <Send className="h-3 w-3" />
        {needs ? 'Send' : 'Draft'}
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1.5 z-20 w-56 rounded-2xl bg-white p-1.5 shadow-card ring-1 ring-cloud-200">
            <p className="px-2 py-1 text-[10px] uppercase tracking-[0.16em] font-semibold text-ink-700">Generate follow-up</p>
            {FOLLOW_UP_TYPES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  onPick(t.label);
                  setOpen(false);
                }}
                className="w-full text-left rounded-lg px-2 py-1.5 text-[12px] text-ink-700 hover:bg-cloud-50 transition"
              >
                {t.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FollowUpModal({
  row,
  type,
  onClose,
}: {
  row: PaymentRow;
  type: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink-900/30 backdrop-blur-sm p-6"
      onClick={onClose}
    >
      <div
        className="rounded-3xl bg-white p-6 ring-1 ring-cloud-200 shadow-card max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-cloud-soft text-cloud-700 ring-1 ring-cloud-100">
            <Send className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] uppercase tracking-[0.18em] text-ink-700 font-semibold">Coming soon</p>
            <h3 className="mt-1 font-display text-xl text-ink-900 leading-tight">Payment Follow-up Generator</h3>
            <p className="mt-2 text-[13px] text-ink-700">
              Will draft a <span className="font-semibold">{type}</span> message for{' '}
              <span className="font-semibold">{row.brand}</span> — campaign <span className="italic">{row.campaign_name}</span>.
            </p>
            <p className="mt-2 text-[12px] text-ink-700">
              Wires up in Wave 5 (E13) via the Response Draft Generator.
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-cloud-soft px-4 py-2 text-[12px] font-semibold text-ink-700 ring-1 ring-cloud-100 hover:bg-cloud-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
