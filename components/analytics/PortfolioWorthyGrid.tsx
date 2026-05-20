import { PORTFOLIO_POSTS } from '@/lib/mock-data/analytics';
import { Play } from 'lucide-react';

export function PortfolioWorthyGrid() {
  return (
    <div className="glass-card rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink-900">
            Portfolio-Worthy Posts
          </h3>
          <p className="text-xs text-ink-500">Save these for case studies & pitch decks</p>
        </div>
        <button
          type="button"
          className="text-xs font-semibold text-iris-500 hover:text-iris-600"
        >
          View All →
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PORTFOLIO_POSTS.map((post) => (
          <article
            key={post.id}
            className="group relative overflow-hidden rounded-xl ring-1 ring-cloud-100/60 bg-white/70 hover:shadow-soft transition-shadow"
          >
            <div className="aspect-[4/5] bg-gradient-to-br from-cloud-100 via-iris-100 to-peach-100 flex items-center justify-center text-5xl">
              <span aria-hidden>{post.thumbnail}</span>
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-ink-900/30">
                <Play className="h-6 w-6 text-white" fill="white" />
              </span>
              <span className="absolute top-2 left-2 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-semibold text-ink-700 ring-1 ring-cloud-100">
                {post.platform}
              </span>
            </div>
            <div className="p-3">
              <p className="text-xs font-medium text-ink-900 line-clamp-2 min-h-[2rem]">
                {post.title}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-ink-600">
                <span>{post.views} views</span>
                <span className="font-semibold text-emerald-700">{post.engagement} eng</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
