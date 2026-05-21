import { Copy, Star, ArrowUpRight } from 'lucide-react';
import type { ContentItem } from '@/lib/mock-data/content-hub';

const TYPE_LABEL: Record<string, string> = {
  hook: 'Hook',
  script: 'Script',
  broll: 'B-Roll',
  cta: 'CTA',
  phrase: 'Phrase',
  pattern: 'Pattern',
  asset: 'Asset',
  shot: 'Shot',
  note: 'Note',
};

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-cloud-100 text-ink-600 ring-cloud-200',
  ready: 'bg-iris-100 text-iris-600 ring-iris-200',
  filmed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  reusable: 'bg-peach-100 text-ink-700 ring-peach-300',
};

interface Props {
  item: ContentItem;
}

export function ContentCard({ item }: Props) {
  const accent = item.campaignAccent ?? '#5B6BFF';
  return (
    <article className="group relative rounded-2xl bg-white ring-1 ring-cloud-100 shadow-card p-4 flex flex-col gap-3 hover:shadow-soft hover:-translate-y-0.5 transition-all">
      {/* Accent bar */}
      <span
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
        style={{ backgroundColor: accent, opacity: 0.85 }}
        aria-hidden
      />

      {/* Header row: type pill + status + star */}
      <div className="flex items-center justify-between pl-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center rounded-full bg-ink-900/90 text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5">
            {TYPE_LABEL[item.type] ?? item.type}
          </span>
          <span
            className={[
              'inline-flex items-center rounded-full ring-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5',
              STATUS_STYLES[item.status] ?? STATUS_STYLES.draft,
            ].join(' ')}
          >
            {item.status}
          </span>
        </div>
        {item.reusable && (
          <Star className="h-3.5 w-3.5 text-peach-500 fill-peach-400" aria-label="reusable" />
        )}
      </div>

      {/* Body */}
      <p className="pl-2 text-[13.5px] leading-snug text-ink-900 font-medium">
        {item.body}
      </p>

      {/* Footer: campaign + meta + copy */}
      <div className="pl-2 flex items-center justify-between gap-2 mt-auto pt-1">
        <div className="flex items-center gap-2 min-w-0">
          {item.campaignBrand && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-700 truncate">
              <span
                className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{ backgroundColor: accent }}
                aria-hidden
              />
              {item.campaignBrand}
            </span>
          )}
          {item.meta && (
            <span className="text-[11px] text-ink-500 tabular-nums truncate">{item.meta}</span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded-lg bg-cloud-soft text-ink-600 hover:bg-cloud-100 ring-1 ring-cloud-100"
            aria-label="Copy"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded-lg bg-cloud-soft text-ink-600 hover:bg-cloud-100 ring-1 ring-cloud-100"
            aria-label="Open"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
