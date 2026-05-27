// Production Queue · top KPI stat row — A.14i.
//
// Mockup source: `_meta/mockups/03-production-queue.png` — a horizontal strip
// of ~8-9 compact tiles ABOVE the kanban, each showing icon dot + numeral +
// micro-label. Counts derive from the visible deliverable set so they reflect
// the active filter.

import type { LucideIcon } from 'lucide-react';
import {
  Layers,
  FileText,
  CalendarClock,
  Film,
  Scissors,
  ClipboardCheck,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DeliverableCard } from './helpers';

interface Tile {
  key: string;
  label: string;
  icon: LucideIcon;
  count: number;
  tone:
    | 'iris'
    | 'cloud'
    | 'peach'
    | 'orange'
    | 'amber'
    | 'sky'
    | 'emerald'
    | 'rose';
}

const TONE_DOT: Record<Tile['tone'], string> = {
  iris: 'bg-iris-500',
  cloud: 'bg-cloud-500',
  peach: 'bg-peach-500',
  orange: 'bg-orange-500',
  amber: 'bg-amber-500',
  sky: 'bg-sky-500',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
};

const TONE_ICON: Record<Tile['tone'], string> = {
  iris: 'text-iris-600',
  cloud: 'text-cloud-700',
  peach: 'text-peach-700',
  orange: 'text-orange-600',
  amber: 'text-amber-600',
  sky: 'text-sky-600',
  emerald: 'text-emerald-600',
  rose: 'text-rose-600',
};

export function KpiStatRow({ deliverables }: { deliverables: DeliverableCard[] }) {
  const count = (predicate: (d: DeliverableCard) => boolean) =>
    deliverables.filter(predicate).length;

  const tiles: Tile[] = [
    {
      key: 'total',
      label: 'Total live',
      icon: Layers,
      count: deliverables.length,
      tone: 'iris',
    },
    {
      key: 'script',
      label: 'Script ready',
      icon: FileText,
      count: count(
        (d) =>
          d.productionStatus === 'script_ready' ||
          d.productionStatus === 'shot_map_ready',
      ),
      tone: 'cloud',
    },
    {
      key: 'filming',
      label: 'Filming',
      icon: CalendarClock,
      count: count(
        (d) =>
          d.productionStatus === 'filming_scheduled' ||
          d.productionStatus === 'b_roll_needed',
      ),
      tone: 'peach',
    },
    {
      key: 'filmed',
      label: 'Filmed',
      icon: Film,
      count: count((d) => d.productionStatus === 'filmed'),
      tone: 'orange',
    },
    {
      key: 'editing',
      label: 'Editing',
      icon: Scissors,
      count: count(
        (d) =>
          d.productionStatus === 'editing' ||
          d.productionStatus === 'captions_needed',
      ),
      tone: 'amber',
    },
    {
      key: 'qa',
      label: 'QA',
      icon: ClipboardCheck,
      count: count((d) => d.productionStatus === 'qa_needed'),
      tone: 'sky',
    },
    {
      key: 'exported',
      label: 'Ready to ship',
      icon: Send,
      count: count((d) => d.productionStatus === 'exported'),
      tone: 'emerald',
    },
    {
      key: 'revision',
      label: 'Revision',
      icon: AlertTriangle,
      count: count((d) => d.productionStatus === 'revision_needed'),
      tone: 'rose',
    },
  ];

  return (
    <section
      aria-label="Production queue summary"
      className="rise rise-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2"
    >
      {tiles.map((tile) => {
        const Icon = tile.icon;
        return (
          <div
            key={tile.key}
            className="rounded-2xl bg-white/80 backdrop-blur-sm ring-1 ring-cloud-100 shadow-card px-3 py-2.5 flex items-center gap-2.5"
          >
            <span
              className={cn(
                'grid h-8 w-8 place-items-center rounded-xl bg-cloud-50 ring-1 ring-cloud-100 relative',
              )}
            >
              <Icon className={cn('h-3.5 w-3.5', TONE_ICON[tile.tone])} />
              <span
                className={cn(
                  'absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full ring-2 ring-white',
                  TONE_DOT[tile.tone],
                )}
                aria-hidden="true"
              />
            </span>
            <div className="min-w-0">
              <p className="font-display text-[18px] text-ink-900 leading-none">
                {tile.count}
              </p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-ink-700 font-semibold mt-0.5 truncate">
                {tile.label}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
