import { cn } from '@/lib/utils';
import type { Asset, AssetType } from '@/lib/data-sync/types';

const typeAccent: Record<AssetType, string> = {
  MP4:  'bg-iris-100  text-iris-600',
  MOV:  'bg-iris-100  text-iris-600',
  PNG:  'bg-cloud-100 text-cloud-700',
  JPG:  'bg-cloud-100 text-cloud-700',
  DOCX: 'bg-sky-100   text-sky-700',
  PDF:  'bg-rose-100  text-rose-700',
  XLSX: 'bg-emerald-100 text-emerald-700',
  ZIP:  'bg-peach-100 text-peach-500',
};

const avatarTones = {
  pink: 'bg-cloud-200 text-cloud-700',
  iris: 'bg-iris-100  text-iris-600',
  peach: 'bg-peach-100 text-peach-500',
  sky:   'bg-sky-100   text-sky-700',
};

function ago(iso: string) {
  const now = new Date().getTime(); // A.14u F2: dynamic
  const then = new Date(iso).getTime();
  const diff = (now - then) / 1000;
  if (diff < 60 * 60)        return `${Math.max(1, Math.round(diff / 60))}m ago`;
  if (diff < 60 * 60 * 24)   return `${Math.round(diff / 3600)}h ago`;
  if (diff < 60 * 60 * 48)   return 'Yesterday';
  return `${Math.round(diff / 86400)}d ago`;
}

export function AssetCard({ asset }: { asset: Asset }) {
  return (
    <article
      tabIndex={0}
      className="card-secondary group flex flex-col rounded-2xl border border-cloud-100 bg-white/85 backdrop-blur p-3.5 shadow-card transition-all duration-200 ease-out will-change-transform hover:shadow-soft hover:-translate-y-0.5 hover:scale-[1.02] hover:border-cloud-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-300 focus-visible:ring-offset-2 focus-visible:ring-offset-cloud-soft motion-reduce:transition-none motion-reduce:hover:transform-none"
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[10px] font-bold tracking-wider transition-transform duration-200 ease-out group-hover:scale-105',
            typeAccent[asset.type],
          )}
        >
          {asset.type}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-ink-900 truncate leading-tight">
            {asset.name}
          </p>
          <p className="mt-0.5 text-[11px] text-ink-700 truncate">
            {asset.campaignLabel} · {asset.sizeMB.toFixed(asset.sizeMB < 10 ? 1 : 0)} MB
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10.5px] uppercase tracking-[0.14em] text-ink-600">
          {ago(asset.uploadedAt)}
        </span>
        <span
          className={cn(
            'grid h-6 w-6 place-items-center rounded-full text-[9px] font-bold',
            avatarTones[asset.uploadedBy.tone],
          )}
        >
          {asset.uploadedBy.initials}
        </span>
      </div>
    </article>
  );
}
