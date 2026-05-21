'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { HOOK_PERFORMANCE } from '@/lib/mock-data/analytics';

export function HookPerformanceBars() {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-card">
      <div className="mb-4">
        <h3 className="font-display text-lg font-semibold text-ink-900">
          Hook Performance Comparison
        </h3>
        <p className="text-xs text-ink-500">
          Avg view rate vs. completion rate, by hook style
        </p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={HOOK_PERFORMANCE}
            layout="vertical"
            margin={{ top: 8, right: 16, bottom: 0, left: 8 }}
            barCategoryGap={14}
          >
            <CartesianGrid stroke="rgba(157,107,255,0.08)" strokeDasharray="3 4" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: '#9E91B0' }}
              tickLine={false}
              axisLine={false}
              domain={[0, 60]}
              tickMargin={6}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 11, fill: '#5A4A6E' }}
              tickLine={false}
              axisLine={false}
              width={104}
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
              formatter={(v: number) => `${v}%`}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: '#5A4A6E', paddingTop: 4 }}
              iconType="circle"
              iconSize={8}
            />
            <Bar dataKey="viewRate" name="Avg View Rate" fill="#FF6B9D" radius={[0, 6, 6, 0]} />
            <Bar dataKey="completion" name="Completion Rate" fill="#9D6BFF" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
