import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_TODOS } from '@/lib/mock-data/deadlines';
import type { DeadlinePriority } from '@/lib/data-sync/types';

const dot: Record<DeadlinePriority, string> = {
  High:   'text-rose-500 fill-rose-500',
  Medium: 'text-amber-500 fill-amber-500',
  Low:    'text-iris-400  fill-iris-400',
};

export function PrioritizedToDo() {
  return (
    <section className="rounded-2xl border border-cloud-100 bg-white/85 backdrop-blur p-6 shadow-card">
      <h3 className="font-display text-[15px] text-ink-900">Prioritized To-Do</h3>
      <ul className="mt-3 space-y-2.5">
        {MOCK_TODOS.map(t => (
          <li key={t.id} className="flex items-start gap-2.5">
            <Circle className={cn('h-2.5 w-2.5 mt-1 shrink-0', dot[t.priority])} strokeWidth={0} />
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] text-ink-900 leading-snug">{t.label}</p>
              <p className="text-[10.5px] uppercase tracking-[0.12em] text-ink-400 mt-0.5">
                {t.due} · {t.priority}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
