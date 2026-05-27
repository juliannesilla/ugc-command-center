'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Star, GripVertical } from 'lucide-react';
import type { IdeaCard as IdeaCardType } from '@/lib/mock-data/brain-dump';
import { cn } from '@/lib/utils';

export function IdeaCard({ card }: { card: IdeaCardType }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: { columnId: card.columnId },
  });

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={cn(
        'group rounded-xl bg-white ring-1 ring-cloud-100 p-2.5 shadow-card transition-all duration-200 ease-out will-change-transform',
        'hover:shadow-soft hover:-translate-y-0.5 hover:ring-iris-200',
        isDragging && 'shadow-soft ring-iris-300 rotate-[1.5deg] scale-[1.03]',
        'motion-reduce:transition-none motion-reduce:hover:transform-none',
      )}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          aria-label="Drag idea"
          className="text-ink-300 hover:text-ink-600 cursor-grab active:cursor-grabbing pt-0.5 transition-colors duration-150 group-hover:text-ink-700"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs leading-snug text-ink-900">{card.text}</p>
            {card.starred && (
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
            )}
          </div>
          <div className="mt-1 flex items-center gap-1">
            {card.isNew && (
              <span className="inline-flex items-center rounded-full bg-iris-100 text-iris-600 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide ring-1 ring-iris-200">
                New
              </span>
            )}
            {card.tag && (
              <span className="inline-flex items-center rounded-full bg-cloud-50 text-cloud-700 px-1.5 py-0.5 text-[9.5px] font-semibold ring-1 ring-cloud-100">
                {card.tag}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
