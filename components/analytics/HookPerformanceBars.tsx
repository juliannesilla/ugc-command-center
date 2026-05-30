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
// A.14v V9A FLORENCE: real @geezjulz hook classification from CSV (42 posts).
// Y-axis = avg engagement per post (likes+comments+shares), not %.
import { getHookPerformance } from '@/lib/analytics/from-tiktok-csv';

export function HookPerformanceBars() {
  const data = getHookPerformance();
  const maxEng = Math.max(50, ...data.map((d) => d.avgEngagement));
  // round up to next 50 for a clean axis
  const xMax = Math.ceil(maxEng / 50) * 50;
  return (
    <div className="glass-card rounded-2xl p-6 shadow-card">
      <div className="mb-4">
        {/* A.14m Stream 3 a11y fix: h3 → h2 (heading-order). T5 ADDITIVE: section-title. */}
        <h2 className="section-title font-display text-lg font-bold text-ink-900">
          Hook Performance Comparison
        </h2>
        <p className="text-xs text-ink-700">
          Avg engagement per post by hook style · {data.reduce((s, d) => s + d.posts, 0)} @geezjulz posts classified
        </p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 16, bottom: 0, left: 8 }}
            barCategoryGap={14}
          >
            <CartesianGrid stroke="rgba(157,107,255,0.08)" strokeDasharray="3 4" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v) => `${v}`}
              // A.14m Stream 3 a11y fix: #9E91B0 (3.6:1) → #6B5E80 (5.8:1 ✅ WCAG AA).
              tick={{ fontSize: 11, fill: '#6B5E80' }}
              tickLine={false}
              axisLine={false}
              domain={[0, xMax]}
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
                boxShadow: '0 8px 24px -8px rgba(157,107,255,0.18), 0 2px 6px -2px rgba(124,107,220,0.10)',
              }}
              labelStyle={{
                color: '#5A4A6E',
                fontWeight: 600,
                fontSize: 11,
                marginBottom: 4,
                letterSpacing: '0.02em',
              }}
              itemStyle={{ color: '#1A1224', padding: 0 }}
              formatter={(v: number, _name, item) => {
                const posts = item?.payload?.posts;
                return [`${v} avg`, posts != null ? `${posts} post${posts === 1 ? '' : 's'}` : 'avg engagement'];
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: '#5A4A6E', paddingTop: 4 }}
              iconType="circle"
              iconSize={8}
            />
            <Bar dataKey="avgEngagement" name="Avg engagement / post" fill="#7C6BDC" radius={[0, 6, 6, 0]} />
            <Bar dataKey="avgLikes" name="Avg likes / post" fill="#9D6BFF" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
