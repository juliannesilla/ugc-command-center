import { Folder, Plus } from 'lucide-react';
import { StatusChip, type ChipTone } from '@/components/ui/status-chip';
import { cn } from '@/lib/utils';
import type { Campaign } from '@/lib/data-sync/types';

const statusTone: Record<Campaign['status'], ChipTone> = {
  'IN PROGRESS': 'iris',
  'IN REVIEW': 'yellow',
  'CONTENT READY': 'green',
  'PLANNING': 'blue',
  'COMPLETE': 'pink',
};

const avatarTones: Record<'pink' | 'iris' | 'peach' | 'sky', string> = {
  pink: 'bg-cloud-200 text-cloud-700',
  iris: 'bg-iris-100 text-iris-600',
  peach: 'bg-peach-100 text-peach-500',
  sky: 'bg-sky-100 text-sky-700',
};

export function CampaignFolderCard({ folder }: { folder: Campaign }) {
  // A.14o W2-S4 microinteractions: Saffer §3 Feedback (hover-lift) + Kowalski
  // spec — replace transition-all/300ms with explicit props + 200ms ease-out.
  return (
    <article className="card-secondary group relative flex flex-col rounded-2xl border border-cloud-100 bg-white/85 backdrop-blur p-4 shadow-card hover:shadow-soft motion-safe:hover:-translate-y-0.5 transition-[transform,box-shadow,border-color] duration-200 ease-out will-change-transform active:scale-[0.99]">
      <div className={cn('relative h-24 w-full rounded-xl overflow-hidden mb-3', folder.thumbColor)}>
        <div className="absolute inset-0 bg-grain opacity-30 mix-blend-overlay" />
        <Folder className="absolute bottom-2 right-2 h-5 w-5 text-white/70 drop-shadow" strokeWidth={1.5} />
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display text-[15px] leading-tight text-ink-900 truncate">
            {folder.brand}
          </h3>
          <p className="mt-0.5 text-[11px] text-ink-700 truncate">
            Due {new Date(folder.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
        <StatusChip tone={statusTone[folder.status]} className="shrink-0">
          {folder.status}
        </StatusChip>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] font-medium text-ink-600">
          {folder.assetCount} assets
        </span>
        <div className="flex -space-x-1.5">
          {folder.collaborators.slice(0, 4).map((c, i) => (
            <span
              key={i}
              className={cn(
                'grid h-6 w-6 place-items-center rounded-full ring-2 ring-white text-[9px] font-bold',
                avatarTones[c.tone],
              )}
            >
              {c.initials}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function NewCampaignFolderCard() {
  return (
    <button
      type="button"
      className="group flex h-full min-h-[180px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-cloud-200 bg-white/40 text-ink-700 hover:border-cloud-400 hover:bg-cloud-50/60 hover:text-cloud-700 transition"
    >
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white shadow-card group-hover:scale-105 transition-transform duration-200 ease-out">
        <Plus className="h-5 w-5" />
      </span>
      <span className="text-[12px] font-semibold uppercase tracking-[0.14em]">
        New Campaign Folder
      </span>
    </button>
  );
}
