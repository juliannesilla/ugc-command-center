'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export interface DonutSegment {
  name: string;
  value: number;
  color: string;
}

export function DonutChart({
  data,
  centerLabel,
  centerValue,
  size = 180,
  innerRadius = 56,
  outerRadius = 78,
}: {
  data: DonutSegment[];
  centerLabel?: string;
  centerValue?: string | number;
  size?: number;
  innerRadius?: number;
  outerRadius?: number;
}) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
            startAngle={90}
            endAngle={-270}
          >
            {data.map(s => (
              <Cell key={s.name} fill={s.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {(centerValue !== undefined || centerLabel) && (
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="text-center">
            {centerValue !== undefined && (
              <div className="font-display text-3xl text-ink-900 leading-none">
                {centerValue}
              </div>
            )}
            {centerLabel && (
              <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-ink-700">
                {centerLabel}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
