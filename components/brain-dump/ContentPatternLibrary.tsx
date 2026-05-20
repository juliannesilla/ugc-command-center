import { BookMarked } from 'lucide-react';
import { CONTENT_PATTERN_LIBRARY } from '@/lib/mock-data/brain-dump';

export function ContentPatternLibrary() {
  return (
    <div className="glass-card rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <BookMarked className="h-4 w-4 text-iris-400" />
          <h4 className="text-sm font-semibold text-ink-900">Content Pattern Library</h4>
        </div>
        <button className="text-xs font-semibold text-iris-500 hover:text-iris-600">
          View All →
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {CONTENT_PATTERN_LIBRARY.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between rounded-xl bg-white/70 ring-1 ring-cloud-100 px-3 py-2 text-xs"
          >
            <span className="font-medium text-ink-800">{p.pattern}</span>
            <span className="tabular-nums text-ink-500">{p.used}x</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
