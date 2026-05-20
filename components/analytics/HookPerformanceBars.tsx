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
    <div className="glass-card rounded-2xl p-5 shadow-card">
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
            <CartesianGrid stroke="rgba(157,107,255,0.10)" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: '#7A6B8E' }}
              tickLine={false}
              axisLine={false}
              domain={[0, 60]}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 11, fill: '#5A4A6E' }}
              tickLine={false}
              axisLine={false}
              width={104}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(255,197,224,0.45)',
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(v: number) => `${v}%`}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: '#5A4A6E' }}
              iconType="circle"
            />
            <Bar dataKey="viewRate" name="Avg View Rate" fill="#FF6B9D" radius={[0, 6, 6, 0]} />
            <Bar dataKey="completion" name="Completion Rate" fill="#9D6BFF" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
