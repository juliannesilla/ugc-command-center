// One Kanban column = one production status (1 of 13).
//
// Source: spec section 7 L522-L540. Column header shows status label + card
// count. Empty columns render a soft dashed placeholder per board convention.

import { cn } from '@/lib/utils';
import { ProductionQueueCard } from './ProductionQueueCard';
import {
  PRODUCTION_STATUS_LABEL,
  PRODUCTION_STATUS_ACCENT,
  type DeliverableCard,
  type ProductionStatus,
} from './helpers';

const accentBar: Record<
  ReturnType<typeof getStripe>,
  string
> = {
  pink: 'bg-gradient-to-r from-cloud-300 to-cloud-sunset',
  iris: 'bg-gradient-to-r from-iris-300 to-iris-500',
  peach: 'bg-gradient-to-r from-peach-300 to-peach-500',
  orange: 'bg-gradient-to-r from-orange-300 to-orange-500',
  amber: 'bg-gradient-to-r from-amber-300 to-amber-500',
  emerald: 'bg-gradient-to-r from-emerald-300 to-emerald-500',
  rose: 'bg-gradient-to-r from-rose-300 to-rose-500',
  sky: 'bg-gradient-to-r from-sky-300 to-sky-500',
  ink: 'bg-gradient-to-r from-ink-500 to-ink-700',
};

function getStripe(status: ProductionStatus) {
  return PRODUCTION_STATUS_ACCENT[status];
}

export function ProductionQueueColumn({
  status,
  deliverables,
}: {
  status: ProductionStatus;
  deliverables: DeliverableCard[];
}) {
  const stripeKey = getStripe(status);

  return (
    <section className="w-72 shrink-0 rounded-3xl bg-white/75 backdrop-blur-sm shadow-card ring-1 ring-cloud-100 flex flex-col max-h-[78vh]">
      {/* column header */}
      <header className="relative px-3.5 pt-4 pb-3 border-b border-cloud-50">
        <span className={cn('absolute inset-x-3.5 top-0 h-1 rounded-b-full', accentBar[stripeKey])} />
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-700 leading-tight">
            {PRODUCTION_STATUS_LABEL[status]}
          </h3>
          <span className="stat-label text-ink-400">
            {deliverables.length}
          </span>
        </div>
      </header>

      {/* cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {deliverables.length > 0 ? (
          deliverables.map((d) => (
            <ProductionQueueCard key={d.key} deliverable={d} />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-cloud-200 p-3 text-center text-[10.5px] text-ink-400">
            No deliverables in this stage
          </div>
        )}
      </div>
    </section>
  );
}
