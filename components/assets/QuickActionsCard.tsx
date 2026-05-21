import { Upload, FolderPlus, Link2, BellRing } from 'lucide-react';

const ACTIONS = [
  { label: 'Upload Files',        icon: Upload,     tone: 'cloud' },
  { label: 'Create New Folder',   icon: FolderPlus, tone: 'iris' },
  { label: 'Generate Share Link', icon: Link2,      tone: 'peach' },
  { label: 'Request Missing Assets', icon: BellRing, tone: 'sky' },
] as const;

const toneClass = {
  cloud: 'bg-cloud-100 text-cloud-700',
  iris:  'bg-iris-100  text-iris-600',
  peach: 'bg-peach-100 text-peach-500',
  sky:   'bg-sky-100   text-sky-700',
};

export function QuickActionsCard() {
  return (
    <section className="rounded-2xl border border-cloud-100 bg-white/85 backdrop-blur p-6 shadow-card">
      <h3 className="font-display text-[15px] text-ink-900">Quick Actions</h3>
      <ul className="mt-3 space-y-1.5">
        {ACTIONS.map(({ label, icon: Icon, tone }) => (
          <li key={label}>
            <button
              type="button"
              className="group w-full flex items-center gap-3 rounded-xl px-2.5 py-2 hover:bg-cloud-50 transition text-left"
            >
              <span className={`grid h-8 w-8 place-items-center rounded-lg ${toneClass[tone]} group-hover:scale-105 transition`}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="text-[12.5px] font-semibold text-ink-900">{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
