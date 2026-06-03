import { BookMarked } from 'lucide-react';
import { CONTENT_PATTERN_LIBRARY } from '@/lib/mock-data/brain-dump';

export function ContentPatternLibrary() {
  return (
    <div className="card-secondary glass-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <BookMarked className="h-4 w-4 text-iris-400" />
          <h4 className="section-title text-sm font-semibold text-ink-900">Content Pattern Library</h4>
        </div>
      </div>
      {CONTENT_PATTERN_LIBRARY.length === 0 ? (
        <p className="text-xs italic text-ink-600 py-2">
          Empty for now &mdash; patterns you save will collect here for quick reuse.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {CONTENT_PATTERN_LIBRARY.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-xl bg-white/70 ring-1 ring-cloud-100 px-3 py-2 text-xs"
            >
              <span className="font-medium text-ink-800">{p.pattern}</span>
              <span className="tabular-nums text-ink-700">{p.used}x</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}