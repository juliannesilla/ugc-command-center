'use client';

// Payment money-flow charts — Phase A.14v V9B (YELLEN / Wave 2).
//
// Source: lib/payments/from-canonical.ts (reads data/brands-canonical.json).
// Spec: dashboard-spec/02-campaign-pipeline-views-architecture.md view #8.
//
// Composes two recharts views above the per-payment table:
//   1. Donut — payments by status (paid / pending / overdue / awaiting)
//   2. Bar — top brands by total potential value (numeric only)
//
// HR-10 HONEST EMPTY STATES — at Wave 2 truth: only Monat ($54.40) is paid.
// Bar chart shows ParakeetAI as the lone numeric pending row + lists
// MWM.ai + Phobaxx in an unclear-terms caption beneath. We do not invent.

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import {
  getPaymentsByStatus,
  getTopBrandsByPotential,
  getBrandsWithUnclearTerms,
  type PaymentBucket,
} from '@/lib/payments/from-canonical';

// ── Donut ────────────────────────────────────────────────────────────────
// One slice per non-zero bucket. Center label shows total count + dollars.
export function PaymentsStatusDonut() {
  const slices = getPaymentsByStatus();
  const totalCount = slices.reduce((s, x) => s + x.count, 0);
  const totalDollars = slices.reduce((s, x) => s + x.amount, 0);
  const nonZero = slices.filter((s) => s.count > 0);

  return (
    <div className="glass-card rounded-2xl p-6 shadow-card">
      <div className="mb-4">
        <h2 className="section-title font-display text-lg font-bold text-ink-900">
          Money flow — by status
        </h2>
        <p className="text-xs text-ink-700">
          {totalCount} brands across the pipeline · {formatMoney(totalDollars)} in numeric commitments
        </p>
      </div>

      {totalCount === 0 ? (
        <EmptyChart message="No brand rows in canonical pipeline yet." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[200px,1fr] gap-6 items-center">
          {/* Donut */}
          <div className="relative h-[200px] w-[200px] mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={nonZero}
                  innerRadius={62}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="label"
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                >
                  {nonZero.map((s) => (
                    <Cell key={s.bucket} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.98)',
                    border: '1px solid rgba(234,220,255,0.6)',
                    borderRadius: 14,
                    fontSize: 12,
                    padding: '8px 12px',
                    boxShadow:
                      '0 8px 24px -8px rgba(157,107,255,0.18), 0 2px 6px -2px rgba(124,107,220,0.10)',
                  }}
                  formatter={(value: number, _name: string, item) => {
                    // item.payload has the slice's amount + label
                    type SlicePayload = { amount: number; label: string };
                    const payload = (item as unknown as { payload: SlicePayload }).payload;
                    return [
                      `${value} brand${value === 1 ? '' : 's'} · ${formatMoney(payload.amount)}`,
                      payload.label,
                    ];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="text-center">
                <div className="font-display text-3xl text-ink-900 leading-none tabular-nums">
                  {totalCount}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ink-700">
                  Brands
                </div>
              </div>
            </div>
          </div>

          {/* Legend with dollars */}
          <ul className="space-y-2">
            {slices.map((s) => (
              <li
                key={s.bucket}
                className="flex items-center justify-between gap-3 rounded-xl bg-cloud-soft/60 px-3 py-2 ring-1 ring-cloud-100"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ background: s.color }}
                    aria-hidden
                  />
                  <span className="text-[12px] font-medium text-ink-900 truncate">{s.label}</span>
                </span>
                <span className="text-[11.5px] text-ink-700 tabular-nums whitespace-nowrap">
                  <span className="font-semibold text-ink-900">{s.count}</span>
                  <span className="mx-1 text-ink-300">·</span>
                  {formatMoney(s.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Bar (top brands by potential value) ───────────────────────────────────
const BUCKET_FILL: Record<PaymentBucket, string> = {
  paid: '#34D399',
  pending: '#F59E0B',
  overdue: '#F87171',
  awaiting_contract: '#94A3B8',
};

export function TopBrandsByPotentialBar() {
  const brands = getTopBrandsByPotential(8);
  const unclear = getBrandsWithUnclearTerms();

  return (
    <div className="glass-card rounded-2xl p-6 shadow-card">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="section-title font-display text-lg font-bold text-ink-900">
            Top brands by potential value
          </h2>
          <p className="text-xs text-ink-700">
            Base + bonus where numeric · sorted descending
          </p>
        </div>
        {brands.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-emerald-700 ring-1 ring-emerald-200">
            <TrendingUp className="h-3 w-3" />
            {brands.length} numeric
          </span>
        )}
      </div>

      {brands.length === 0 ? (
        <EmptyChart message="No numeric payment amounts in pipeline yet — everything is awaiting contract or retainer-structured." />
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={brands}
              layout="vertical"
              margin={{ top: 8, right: 24, bottom: 0, left: 8 }}
              barCategoryGap={10}
            >
              <CartesianGrid
                stroke="rgba(157,107,255,0.08)"
                strokeDasharray="3 4"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#6B5E80' }}
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`)}
              />
              <YAxis
                type="category"
                dataKey="brand"
                tick={{ fontSize: 11, fill: '#5A4A6E' }}
                tickLine={false}
                axisLine={false}
                width={120}
                tickMargin={4}
              />
              <Tooltip
                cursor={{ fill: 'rgba(234,220,255,0.35)' }}
                contentStyle={{
                  background: 'rgba(255,255,255,0.98)',
                  border: '1px solid rgba(234,220,255,0.6)',
                  borderRadius: 14,
                  fontSize: 12,
                  padding: '8px 12px',
                  boxShadow:
                    '0 8px 24px -8px rgba(157,107,255,0.18), 0 2px 6px -2px rgba(124,107,220,0.10)',
                }}
                formatter={(v: number) => [formatMoney(v), 'Potential']}
              />
              <Bar dataKey="total_potential" name="Potential" radius={[0, 6, 6, 0]}>
                {brands.map((b) => (
                  <Cell key={b.brand_id} fill={BUCKET_FILL[b.bucket]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Honest unclear-terms caption row */}
      {unclear.length > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50/60 px-3 py-2 ring-1 ring-amber-200/60">
          <AlertCircle className="h-3.5 w-3.5 text-amber-700 mt-0.5 shrink-0" />
          <p className="text-[11.5px] text-ink-700 leading-relaxed">
            <span className="font-semibold text-ink-900">{unclear.length} signed contract{unclear.length === 1 ? '' : 's'}</span>{' '}
            with non-fixed terms (not chartable as $):{' '}
            {unclear.map((b, i) => (
              <span key={b.brand_id}>
                <span className="font-medium text-ink-900">{b.brand}</span>
                <span className="text-ink-600"> ({b.terms_note})</span>
                {i < unclear.length - 1 && <span className="text-ink-300">, </span>}
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Shared empty state ────────────────────────────────────────────────────
function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-[200px] grid place-items-center rounded-xl bg-cloud-soft/40 ring-1 ring-cloud-100">
      <p className="text-[12px] text-ink-700 text-center max-w-xs px-6">{message}</p>
    </div>
  );
}

// ── Composite (drop-in for /payments page) ────────────────────────────────
export function PaymentCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <PaymentsStatusDonut />
      <TopBrandsByPotentialBar />
    </div>
  );
}
