import { Calendar, Sparkles } from 'lucide-react';
import { cn, formatMoney } from '@/lib/utils';
import type { PipelineCard as PipelineCardType, Health } from '@/lib/mock-data/pipeline';

const healthDot: Record<Health, string> = {
  green:  'bg-emerald-400',
  yellow: 'bg-amber-400',
  orange: 'bg-orange-400',
  red:    'bg-rose-500',
};

const platformAccent: Record<string, string> = {
  TikTok:    'from-cloud-300 to-iris-300',
  'IG Reels':'from-peach-300 to-cloud-300',
  YouTube:   'from-rose-300 to-orange-300',
  Multi:     'from-iris-300 to-cloud-300',
};

function brandInitials(name: string) {
  return name
    .split(/[\s/-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

function formatDeadline(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function PipelineCard({ card }: { card: PipelineCardType }) {
  return (
    <article className="group rounded-2xl bg-white p-3 shadow-card ring-1 ring-cloud-100 hover:ring-cloud-300 hover:shadow-soft hover:-translate-y-0.5 transition cursor-grab">
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            'grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white font-display font-semibold text-[13px] bg-gradient-to-br shadow-card',
            platformAccent[card.platform] ?? 'from-cloud-300 to-iris-300',
          )}
        >
          {brandInitials(card.brand)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={cn('h-1.5 w-1.5 rounded-full', healthDot[card.health])} />
            <span className="text-[10.5px] uppercase tracking-[0.14em] text-ink-700 truncate">
              {card.brand}
            </span>
          </div>
          <h4 className="mt-0.5 text-[13px] font-semibold text-ink-900 leading-snug line-clamp-2">
            {card.campaign}
          </h4>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px]">
        <span className="font-display text-cloud-700 text-sm">
          {formatMoney(card.value)}
        </span>
        {card.deadline && (
          <span className="inline-flex items-center gap-1 text-ink-700">
            <Calendar className="h-3 w-3" />
            {formatDeadline(card.deadline)}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px]">
        <span className="inline-flex items-center gap-1 rounded-full bg-cloud-50 px-2 py-0.5 text-cloud-700 ring-1 ring-cloud-100">
          <Sparkles className="h-2.5 w-2.5" />
          {card.platform}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-ink-600">{card.daysInStage}d</span>
          {/* Creator avatar — Julianne */}
          <span
            title="Julianne Silla"
            className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-peach-300 via-rose-300 to-iris-400 text-white font-display font-semibold text-[9px] ring-2 ring-white shadow-card"
          >
            J
          </span>
        </div>
      </div>
    </article>
  );
}
