'use client';

import { cn } from '@/lib/utils';
import { healthCounts, AGGREGATE } from '@/lib/mock-data/assets';

export function AssetHealthDonut() {
  const segs = healthCounts();
  const total = AGGREGATE.total;
  // SVG donut with stroke-dasharray segments
  const R = 56;
  const C = 2 * Math.PI * R;

  let offset = 0;
  const arcs = segs.map((s, i) => {
    const portion = s.value / total;
    const len = portion * C;
    const arc = (
      <circle
        key={i}
        cx="64"
        cy="64"
        r={R}
        fill="none"
        stroke={s.color}
        strokeWidth="14"
        strokeDasharray={`${len} ${C - len}`}
        strokeDashoffset={-offset}
        transform="rotate(-90 64 64)"
        strokeLinecap="butt"
      />
    );
    offset += len;
    return arc;
  });

  return (
    <section className="card-secondary rounded-2xl border border-cloud-100 bg-white/85 backdrop-blur p-6 shadow-card">
      <div className="flex items-baseline justify-between">
        <h3 className="section-title font-display text-[15px] text-ink-900">Asset Health</h3>
        <span className="text-[10.5px] uppercase tracking-[0.16em] text-ink-600">
          {total.toLocaleString()} total
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative shrink-0">
          <svg viewBox="0 0 128 128" className="h-32 w-32">
            <circle cx="64" cy="64" r={R} fill="none" stroke="#E9E6FC" strokeWidth="14" />
            {arcs}
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="font-display text-2xl text-ink-900 leading-none">
                {total.toLocaleString()}
              </p>
              <p className="text-[9.5px] uppercase tracking-[0.18em] text-ink-600 mt-0.5">
                Assets
              </p>
            </div>
          </div>
        </div>

        <ul className="flex-1 space-y-1.5">
          {segs.map(s => (
            <li key={s.label} className="flex items-center justify-between text-[11.5px]">
              <span className="flex items-center gap-2 text-ink-700">
                <span
                  className={cn('h-2 w-2 rounded-full')}
                  style={{ backgroundColor: s.color }}
                />
                {s.label}
              </span>
              <span className="text-ink-700 font-medium tabular-nums">
                {s.value} <span className="text-ink-600">· {s.pct}%</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
