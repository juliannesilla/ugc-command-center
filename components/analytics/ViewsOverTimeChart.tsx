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
          <h3 className="font-display text-lg font-semibold text-ink-900">
            Views Over Time
          </h3>
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
          <LineChart data={VIEWS_OVER_TIME} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
            <CartesianGrid stroke="rgba(157,107,255,0.10)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#7A6B8E' }}
              tickLine={false}
              axisLine={false}
              interval={1}
            />
            <YAxis
              tickFormatter={fmt}
              tick={{ fontSize: 11, fill: '#7A6B8E' }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(255,197,224,0.45)',
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(v: number) => fmt(v) + ' views'}
            />
            <Line
              type="monotone"
              dataKey="current"
              name="This Period"
              stroke="#FF6B9D"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="previous"
              name="Previous Period"
              stroke="#B58CFF"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
