'use client';

// A.14t T4 PILLARS: client chart for @geezjulz TikTok content-pillar performance.
// Recharts pattern mirrors HookPerformanceBars (vertical layout, brand colors,
// WCAG-AA tick colors). Two side-by-side charts: post count + avg engagement.

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';
import { PILLAR_DATA, PILLAR_TOTALS } from '@/lib/mock-data/pillars';

const PILLAR_FILLS = [
  '#7C6BDC', // signal pink — top performer
  '#9D6BFF', // iris purple
  '#6BD4FF', // sky
  '#FFB36B', // peach
  '#6BFFA8', // mint
  '#C26BFF', // lavender
];

export function PillarChart() {
  if (!PILLAR_DATA.length) {
    return (
      <div className="glass-card rounded-2xl p-6 shadow-card">
        <h2 className="section-title font-display text-lg font-bold text-ink-900">
          Pillar performance
        </h2>
        <p className="mt-2 text-sm text-ink-700">
          No pillar data available yet — classify @geezjulz posts in the source
          spreadsheet to populate.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* CHART 1: Post count per pillar */}
      <div className="glass-card rounded-2xl p-6 shadow-card">
        <div className="mb-4">
          <h2 className="section-title font-display text-lg font-bold text-ink-900">
            Posts per pillar
          </h2>
          <p className="text-xs text-ink-700">
            How your {PILLAR_TOTALS.totalPosts} @geezjulz posts split across content pillars
          </p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={PILLAR_DATA}
              layout="vertical"
              margin={{ top: 8, right: 16, bottom: 0, left: 8 }}
              barCategoryGap={12}
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
              />
              <YAxis
                type="category"
                dataKey="label"
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
                labelStyle={{
                  color: '#5A4A6E',
                  fontWeight: 600,
                  fontSize: 11,
                  marginBottom: 4,
                }}
                itemStyle={{ color: '#1A1224', padding: 0 }}
                formatter={(v: number) => `${v} posts`}
              />
              <Bar dataKey="posts" name="Posts" radius={[0, 6, 6, 0]}>
                {PILLAR_DATA.map((_, i) => (
                  <Cell key={i} fill={PILLAR_FILLS[i % PILLAR_FILLS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 2: Avg engagement per pillar */}
      <div className="glass-card rounded-2xl p-6 shadow-card">
        <div className="mb-4">
          <h2 className="section-title font-display text-lg font-bold text-ink-900">
            Avg engagement per pillar
          </h2>
          <p className="text-xs text-ink-700">
            (likes + comments + shares) ÷ posts — which pillars resonate hardest
          </p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={PILLAR_DATA}
              layout="vertical"
              margin={{ top: 8, right: 16, bottom: 0, left: 8 }}
              barCategoryGap={12}
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
              />
              <YAxis
                type="category"
                dataKey="label"
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
                labelStyle={{
                  color: '#5A4A6E',
                  fontWeight: 600,
                  fontSize: 11,
                  marginBottom: 4,
                }}
                itemStyle={{ color: '#1A1224', padding: 0 }}
                formatter={(v: number) => `${Number(v).toFixed(1)} / post`}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: '#5A4A6E', paddingTop: 4 }}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                dataKey="avgLikes"
                name="Avg likes"
                fill="#7C6BDC"
                radius={[0, 6, 6, 0]}
              />
              <Bar
                dataKey="avgEngagement"
                name="Avg engagement"
                fill="#9D6BFF"
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
