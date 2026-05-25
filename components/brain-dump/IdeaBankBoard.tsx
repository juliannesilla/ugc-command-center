'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import { Plus, Filter, LayoutGrid } from 'lucide-react';
import { IdeaCard } from './IdeaCard';
import {
  BOARD_COLUMNS,
  INITIAL_CARDS,
  type ColumnId,
  type IdeaCard as IdeaCardType,
} from '@/lib/mock-data/brain-dump';
import { cn } from '@/lib/utils';

function Column({
  id,
  label,
  emoji,
  count,
  cards,
}: {
  id: ColumnId;
  label: string;
  emoji: string;
  count: number;
  cards: IdeaCardType[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col gap-2 rounded-2xl p-3 ring-1 transition-all duration-200 ease-out min-h-[420px]',
        isOver
          ? 'bg-iris-50/80 ring-iris-300 shadow-soft scale-[1.005]'
          : 'bg-white/50 ring-cloud-100',
        'motion-reduce:transition-none motion-reduce:scale-100',
      )}
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-base" aria-hidden>{emoji}</span>
          <h4 className="text-sm font-semibold text-ink-900">{label}</h4>
        </div>
        <span className="rounded-full bg-cloud-100 text-cloud-700 px-2 py-0.5 text-[10px] font-semibold">
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {cards.map((c) => (
          <IdeaCard key={c.id} card={c} />
        ))}
      </div>
      <button
        type="button"
        className="mt-1 inline-flex items-center justify-center gap-1 rounded-lg border border-dashed border-cloud-200 text-ink-500 px-2 py-1.5 text-xs hover:bg-cloud-50 transition-colors"
      >
        <Plus className="h-3 w-3" />
        Add Idea
      </button>
    </div>
  );
}

export function IdeaBankBoard() {
  const [cards, setCards] = useState<IdeaCardType[]>(INITIAL_CARDS);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const newCol = over.id as ColumnId;
    setCards((prev) =>
      prev.map((c) => (c.id === active.id ? { ...c, columnId: newCol } : c)),
    );
  };

  const activeCard = cards.find((c) => c.id === activeId) ?? null;

  return (
    <div className="glass-card rounded-3xl p-6 lg:p-7 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="section-title font-display text-[22px] font-medium tracking-tight text-ink-900">
            Idea Bank Board
          </h3>
          <p className="text-xs text-ink-500">
            Drag cards across columns to organize. New ideas land in their best-fit column.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button className="inline-flex items-center gap-1 rounded-full bg-white/80 ring-1 ring-cloud-200 px-3 py-1.5 hover:bg-white">
            <LayoutGrid className="h-3.5 w-3.5 text-iris-400" />
            View Board
          </button>
          <button className="inline-flex items-center gap-1 rounded-full bg-white/80 ring-1 ring-cloud-200 px-3 py-1.5 hover:bg-white">
            <Filter className="h-3.5 w-3.5 text-iris-400" />
            Filter
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">
          {BOARD_COLUMNS.map((col) => (
            <Column
              key={col.id}
              id={col.id}
              label={col.label}
              emoji={col.emoji}
              count={col.count}
              cards={cards.filter((c) => c.columnId === col.id)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeCard ? <IdeaCard card={activeCard} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
