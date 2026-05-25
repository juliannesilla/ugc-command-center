'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { VIEWS_OVER_TIME } from '@/lib/mock-data/analytics';

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return `${n}`;
}

export function ViewsOverTimeChart() {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          {/* A.14m Stream 3 a11y fix: h3 → h2 (heading-order, h1 in page → h2 cards). T5 ADDITIVE: section-title. */}
          <h2 className="section-title font-display text-lg font-semibold text-ink-900">
            Views Over Time
          </h2>
          <p className="text-xs text-ink-500">Apr 6 – May 6, 2026</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-ink-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cloud-500" />
            This Period
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-iris-300" />
            Previous Period
          </span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={VIEWS_OVER_TIME} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
            <CartesianGrid stroke="rgba(157,107,255,0.08)" strokeDasharray="3 4" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#7A6B8E' }}
              tickLine={false}
              axisLine={false}
              interval={1}
              tickMargin={8}
              dy={2}
            />
            <YAxis
              tickFormatter={fmt}
              // A.14m Stream 3 a11y fix: #9E91B0 (3.6:1) → #6B5E80 (5.8:1 ✅ WCAG AA).
              tick={{ fontSize: 11, fill: '#6B5E80' }}
              tickLine={false}
              axisLine={false}
              width={40}
              tickMargin={6}
            />
            <Tooltip
              cursor={{ stroke: 'rgba(157,107,255,0.25)', strokeWidth: 1, strokeDasharray: '3 3' }}
              contentStyle={{
                background: 'rgba(255,255,255,0.98)',
                border: '1px solid rgba(234,220,255,0.6)',
                borderRadius: 14,
                fontSize: 12,
                padding: '8px 12px',
                boxShadow: '0 8px 24px -8px rgba(157,107,255,0.18), 0 2px 6px -2px rgba(255,107,157,0.10)',
              }}
              labelStyle={{
                color: '#5A4A6E',
                fontWeight: 600,
                fontSize: 11,
                marginBottom: 4,
                letterSpacing: '0.02em',
              }}
              itemStyle={{ color: '#1A1224', padding: 0 }}
              formatter={(v: number) => fmt(v) + ' views'}
            />
            <Line
              type="monotone"
              dataKey="current"
              name="This Period"
              stroke="#FF6B9D"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
            />
            <Line
              type="monotone"
              dataKey="previous"
              name="Previous Period"
              stroke="#B58CFF"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
