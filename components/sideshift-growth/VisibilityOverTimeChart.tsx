'use client';

/**
 * VisibilityOverTimeChart — line chart for SideShift Growth dashboard.
 *
 * Source: mockup #20 (lower-right large chart card "Visibility Over Time").
 * Wave 2b A.14n N3-SIDESHIFT-REBUILD.
 *
 * Pattern lifted from `components/analytics/ViewsOverTimeChart.tsx` (same
 * Recharts API, A.14m a11y-compliant tick colors, lavender→pink palette).
 */

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { VISIBILITY_OVER_TIME } from '@/lib/mock-data/sideshift-growth';

export function VisibilityOverTimeChart() {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-card">
      <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h2 className="section-title font-display text-lg font-semibold text-ink-900">
            Visibility Over Time
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">
            12-week trend · current score{' '}
            <span className="font-semibold text-iris-600">84</span>
            <span className="text-emerald-600 ml-2 font-semibold">+22 since Mar</span>
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-ink-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cloud-sunset" />
            Visibility Score
          </span>
        </div>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={VISIBILITY_OVER_TIME}
            margin={{ top: 8, right: 12, bottom: 4, left: -8 }}
          >
            <defs>
              <linearGradient id="visibilityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B9D" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#FF6B9D" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="rgba(157,107,255,0.08)"
              strokeDasharray="3 4"
              vertical={false}
            />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: '#7A6B8E' }}
              tickLine={false}
              axisLine={false}
              interval={1}
              tickMargin={8}
            />
            <YAxis
              domain={[40, 100]}
              tick={{ fontSize: 11, fill: '#6B5E80' }}
              tickLine={false}
              axisLine={false}
              width={32}
              tickMargin={6}
            />
            <Tooltip
              cursor={{
                stroke: 'rgba(157,107,255,0.25)',
                strokeWidth: 1,
                strokeDasharray: '3 3',
              }}
              contentStyle={{
                background: 'rgba(255,255,255,0.98)',
                border: '1px solid rgba(234,220,255,0.6)',
                borderRadius: 14,
                fontSize: 12,
                padding: '8px 12px',
                boxShadow:
                  '0 8px 24px -8px rgba(157,107,255,0.18), 0 2px 6px -2px rgba(255,107,157,0.10)',
              }}
              labelStyle={{
                color: '#5A4A6E',
                fontWeight: 600,
                fontSize: 11,
                marginBottom: 4,
                letterSpacing: '0.02em',
              }}
              itemStyle={{ color: '#1A1224', padding: 0 }}
              formatter={(v: number) => `${v} / 100`}
            />
            <Area
              type="monotone"
              dataKey="score"
              name="Visibility Score"
              stroke="#FF6B9D"
              strokeWidth={2.5}
              fill="url(#visibilityFill)"
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
