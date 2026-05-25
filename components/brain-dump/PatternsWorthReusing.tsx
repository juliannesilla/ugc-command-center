import { Repeat2 } from 'lucide-react';
import { REUSABLE_PATTERNS } from '@/lib/mock-data/brain-dump';

export function PatternsWorthReusing() {
  return (
    <div className="card-secondary glass-card rounded-2xl p-6 shadow-card">
      <div className="flex items-center gap-1.5 mb-3">
        <Repeat2 className="h-4 w-4 text-iris-400" />
        <h4 className="section-title text-sm font-semibold text-ink-900">Patterns Worth Reusing</h4>
      </div>
      <ul className="flex flex-col gap-2.5">
        {REUSABLE_PATTERNS.map((p) => (
          <li key={p.id} className="flex items-start justify-between gap-3 text-xs">
            <span className="font-medium text-ink-800 leading-snug">{p.pattern}</span>
            <span className="shrink-0 rounded-full bg-cloud-50 text-cloud-700 px-2 py-0.5 text-[10px] font-semibold ring-1 ring-cloud-100 tabular-nums">
              used {p.used}x
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
