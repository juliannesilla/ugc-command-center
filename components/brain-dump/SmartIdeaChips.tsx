'use client';

import { SMART_CHIPS } from '@/lib/mock-data/brain-dump';
import { cn } from '@/lib/utils';

export function SmartIdeaChips({ onPick }: { onPick?: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {SMART_CHIPS.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onPick?.(chip.id)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-all',
            chip.shuffle
              ? 'bg-iris-400 text-white ring-iris-500 hover:bg-iris-500 shadow-glow'
              : 'bg-white/80 text-ink-800 ring-cloud-200 hover:bg-cloud-50',
          )}
        >
          <span aria-hidden>{chip.icon}</span>
          {chip.label}
        </button>
      ))}
    </div>
  );
}
