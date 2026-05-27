import { ArrowRight } from 'lucide-react';
import { IDEAS_TO_SCRIPTS } from '@/lib/mock-data/brain-dump';

export function IdeasToScriptList() {
  return (
    <div className="card-secondary glass-card rounded-2xl p-4 shadow-card">
      <h4 className="section-title text-sm font-semibold text-ink-900 mb-3">
        Ideas to Turn Into Scripts
      </h4>
      <ul className="flex flex-col gap-2">
        {IDEAS_TO_SCRIPTS.map((item) => (
          <li
            key={item.id}
            className="group flex items-start gap-2 rounded-xl bg-white/70 ring-1 ring-cloud-100 px-3 py-2 hover:bg-white transition-colors"
          >
            <span className="mt-0.5 inline-flex items-center rounded-full bg-iris-100 text-iris-600 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide ring-1 ring-iris-200 shrink-0">
              {item.chip}
            </span>
            <p className="flex-1 text-xs leading-snug text-ink-800">{item.text}</p>
            <ArrowRight className="h-3.5 w-3.5 text-ink-600 group-hover:text-iris-500 transition-colors mt-0.5" />
          </li>
        ))}
      </ul>
    </div>
  );
}
