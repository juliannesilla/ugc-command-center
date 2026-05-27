'use client';

import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { CURRENT_PERIOD, PREVIOUS_PERIOD } from '@/lib/mock-data/analytics';

export function DateRangePicker() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-full bg-white/80 ring-1 ring-cloud-200 px-3.5 py-2 text-xs font-semibold text-ink-800 shadow-card hover:bg-white transition-colors"
      >
        <Calendar className="h-3.5 w-3.5 text-iris-400" />
        <span>{CURRENT_PERIOD.label}</span>
        <span className="text-ink-600">vs</span>
        <span className="text-ink-700">{PREVIOUS_PERIOD.label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-ink-700" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white shadow-soft ring-1 ring-cloud-200 p-3 z-20 text-sm">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-700 mb-2">
            Compare
          </p>
          <ul className="flex flex-col gap-1">
            {['Last 30 days', 'Last 90 days', 'This quarter', 'YTD', 'Custom…'].map((opt) => (
              <li key={opt}>
                <button className="w-full text-left rounded-lg px-2 py-1.5 hover:bg-cloud-50 text-ink-800">
                  {opt}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
