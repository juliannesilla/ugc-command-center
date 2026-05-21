import { CONTENT_HUB_CATEGORIES } from '@/lib/mock-data/content-hub';
import { Library } from 'lucide-react';

export function CategorySidebar() {
  const total = CONTENT_HUB_CATEGORIES.reduce((s, c) => s + c.count, 0);
  return (
    <aside className="rounded-3xl bg-white ring-1 ring-cloud-100/70 shadow-card p-5 lg:p-6 flex flex-col gap-4 lg:sticky lg:top-6 h-fit">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-cloud-soft text-iris-500 ring-1 ring-cloud-100">
          <Library className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">
            Library
          </p>
          <p className="text-sm font-semibold text-ink-900">{total} total pieces</p>
        </div>
      </div>

      <ul className="flex flex-col gap-1">
        {CONTENT_HUB_CATEGORIES.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm text-ink-800 hover:bg-cloud-soft transition-colors"
            >
              <span className="flex items-center gap-2">
                <span aria-hidden>{c.emoji}</span>
                <span className="font-medium">{c.label}</span>
              </span>
              <span className="tabular-nums text-xs font-semibold text-ink-500">
                {c.count}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="rounded-xl bg-gradient-to-br from-iris-100 via-cloud-100 to-peach-100 ring-1 ring-cloud-200 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-700">
          Tip
        </p>
        <p className="text-xs text-ink-700 mt-1 leading-snug">
          Star reusable hooks + phrases — they auto-surface when you start a new script.
        </p>
      </div>
    </aside>
  );
}
