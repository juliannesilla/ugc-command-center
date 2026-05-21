import { Wand2 } from 'lucide-react';
import { IDEA_TO_SCRIPT_STEPS } from '@/lib/mock-data/brain-dump';

export function IdeaToScriptConverter() {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-card flex flex-col gap-3">
      <div className="flex items-center gap-1.5">
        <Wand2 className="h-4 w-4 text-iris-400" />
        <h4 className="text-sm font-semibold text-ink-900">Idea → Script Conversion</h4>
      </div>
      <ol className="flex flex-col gap-2">
        {IDEA_TO_SCRIPT_STEPS.map((step) => (
          <li key={step.id} className="flex items-start gap-2.5 text-xs">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-iris-100 text-iris-600 font-semibold text-[10.5px] shrink-0">
              {step.id}
            </span>
            <span className="text-ink-800 leading-relaxed">{step.label}</span>
          </li>
        ))}
      </ol>
      <button
        type="button"
        className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-cloud-500 text-white px-3 py-2 text-sm font-semibold shadow-soft hover:bg-cloud-600 transition-colors"
      >
        <Wand2 className="h-4 w-4" />
        Convert Idea to Script
      </button>
    </div>
  );
}
