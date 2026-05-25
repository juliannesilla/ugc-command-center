import { Upload, FolderInput, CheckCircle2, Download } from 'lucide-react';
import { MOCK_RECENT_ACTIVITY, type RecentActivity } from '@/lib/mock-data/assets';
import { cn } from '@/lib/utils';

const verbIcon: Record<RecentActivity['verb'], React.ComponentType<{ className?: string }>> = {
  Uploaded:   Upload,
  Moved:      FolderInput,
  Marked:     CheckCircle2,
  Downloaded: Download,
};

const verbTone: Record<RecentActivity['verb'], string> = {
  Uploaded:   'bg-cloud-100 text-cloud-700',
  Moved:      'bg-iris-100  text-iris-600',
  Marked:     'bg-emerald-100 text-emerald-700',
  Downloaded: 'bg-sky-100   text-sky-700',
};

export function RecentActivityList() {
  return (
    <section className="card-secondary rounded-2xl border border-cloud-100 bg-white/85 backdrop-blur p-6 shadow-card">
      <div className="flex items-baseline justify-between">
        <h3 className="section-title font-display text-[15px] text-ink-900">Recent Activity</h3>
        <span className="text-[10.5px] uppercase tracking-[0.16em] text-ink-400">Last 48h</span>
      </div>
      <ul className="mt-3 space-y-2.5">
        {MOCK_RECENT_ACTIVITY.map(item => {
          const Icon = verbIcon[item.verb];
          return (
            <li key={item.id} className="flex items-start gap-2.5">
              <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-lg', verbTone[item.verb])}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] text-ink-900 leading-tight">
                  <span className="font-semibold">{item.verb}</span>{' '}
                  <span className="text-ink-700">{item.detail}</span>
                </p>
                {item.meta && (
                  <p className="text-[11px] text-ink-500 truncate">{item.meta}</p>
                )}
              </div>
              <span className="shrink-0 text-[10.5px] uppercase tracking-[0.12em] text-ink-400">
                {item.agoLabel}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
