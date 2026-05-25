import { Sparkles, Bookmark } from 'lucide-react';
import { BEST_NEW_IDEA } from '@/lib/mock-data/brain-dump';

export function BestNewIdeaCard() {
  return (
    <div className="card-secondary rounded-3xl bg-gradient-to-br from-cloud-200/60 via-iris-100/60 to-peach-100/50 ring-1 ring-cloud-200 p-6 lg:p-7 shadow-soft">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-iris-500" />
          <h4 className="text-sm font-semibold text-ink-900">Best New Idea</h4>
        </div>
        {BEST_NEW_IDEA.badge && (
          <span className="inline-flex items-center rounded-full bg-iris-500 text-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
            {BEST_NEW_IDEA.badge}
          </span>
        )}
      </div>
      <p className="font-display text-base leading-snug text-ink-900 mb-3">
        "{BEST_NEW_IDEA.text}"
      </p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {BEST_NEW_IDEA.chips.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center rounded-full bg-white/80 text-ink-700 px-2 py-0.5 text-[10.5px] font-semibold ring-1 ring-cloud-100"
          >
            {chip}
          </span>
        ))}
      </div>
      <p className="text-[11px] text-ink-500 mb-3">Captured {BEST_NEW_IDEA.capturedAgo}</p>
      <button
        type="button"
        className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-ink-900 text-white px-3 py-2 text-sm font-semibold hover:bg-ink-800 transition-colors"
      >
        <Bookmark className="h-4 w-4" />
        Save & Keep
      </button>
    </div>
  );
}
