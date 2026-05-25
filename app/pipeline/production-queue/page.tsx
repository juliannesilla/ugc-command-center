// Pipeline · Production Queue — film/edit workflow Kanban.
//
// Source: `_meta/dashboard-spec/02-campaign-pipeline-views-architecture.md`
// section 7 "Production Queue View" (L514-L594):
//
//   "This is your film/edit workflow board. Use this when your campaigns have
//    moved past strategy and into actual content production." (L518-L520)
//
//   "Kanban or table grouped by production status." (L524)
//
//   13 production statuses (L526-L540):
//     Not Started · Script Ready · Shot Map Ready · B-Roll Needed ·
//     Filming Scheduled · Filmed · Editing · Captions Needed · QA Needed ·
//     Exported · Submitted · Revision Needed · Final Approved
//
//   Per-card fields (L542-L562): 14-field schema — see ProductionQueueCard.tsx
//   Default filter (L566-L568): active deliverables, NOT submitted OR revision
//   Saved chips (L569-L576): 7 chips
//   Sort (L578-L584): due date · production status · priority · time needed
//   Smart Feature (L586-L594): 6-checklist production readiness score
//
// Phase A.14e Wave 3 (E6) — NEW route. Sidebar gains a 15th item ("Production
// Queue") pointing to /pipeline/production-queue, placed AFTER "Ready to
// Execute" per task spec.

import { Clapperboard } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { MOCK_CAMPAIGNS, productionData, scriptData } from '@/lib/mock-data/campaigns';
import { FilterBar } from '@/components/production-queue/FilterBar';
import { ProductionQueueColumn } from '@/components/production-queue/ProductionQueueColumn';
import {
  buildDeliverableCards,
  buildExtraInFlightCards,
  isDefaultVisible,
  sortDeliverables,
  getChipCount,
  PRODUCTION_STATUS_ORDER,
  FILTER_CHIPS,
  type FilterChipKey,
  type ProductionPayload,
} from '@/components/production-queue/helpers';

export const metadata = {
  title: 'Production Queue · UGC | Campaign HQ',
  description:
    'Film/edit workflow board. Per-deliverable Kanban across 13 production statuses.',
};

export default function ProductionQueuePage() {
  // 1. Materialize per-deliverable cards from canonical campaign rows.
  //    Cards are per-deliverable, not per-campaign, so a 3-deliverable
  //    contract emits 3 cards across the queue.
  const realDeliverables = buildDeliverableCards(MOCK_CAMPAIGNS, {
    productionData: productionData as unknown as Record<string, ProductionPayload>,
    scriptData: scriptData as unknown as Record<
      string,
      { hooks?: string[]; coreAngle?: string }
    >,
  });
  // A.14g Wave 2 — audit L148 PRODUCTION-QUEUE-FINALIZE: augment with synthetic
  // in-flight cards so every production stage has ≥1 card without distorting
  // MOCK_CAMPAIGNS (relied on by 6+ other routes).
  const allDeliverables = [
    ...realDeliverables,
    ...buildExtraInFlightCards(MOCK_CAMPAIGNS),
  ];

  // 2. Default filter per spec L566-L568.
  const visibleDeliverables = allDeliverables
    .filter(isDefaultVisible)
    .sort(sortDeliverables);

  // 3. Saved filter chip counts (operate on the visible set per UX convention —
  //    a chip count of 0 still shows the chip so user sees the option exists).
  const chipCounts = FILTER_CHIPS.reduce(
    (acc, chip) => {
      acc[chip.key] = getChipCount(visibleDeliverables, chip.key);
      return acc;
    },
    {} as Record<FilterChipKey, number>,
  );

  // 4. Group by production status — empty columns still render so user sees
  //    the entire 13-stage workflow shape.
  const byStatus = PRODUCTION_STATUS_ORDER.map((status) => ({
    status,
    deliverables: visibleDeliverables.filter((d) => d.productionStatus === status),
  }));

  const isEmpty = visibleDeliverables.length === 0;

  return (
    <>
      <Header
        pageEyebrow="Campaign Pipeline · Film/Edit Board"
        pageTitle="Production queue"
      />

      <main className="px-7 md:px-12 py-6 space-y-6 flex flex-col flex-1 min-h-0">
        {/* Filter + sort + chips */}
        <FilterBar
          totalCount={allDeliverables.length}
          visibleCount={visibleDeliverables.length}
          chipCounts={chipCounts}
        />

        {/* Empty state */}
        {isEmpty ? (
          <section className="rise rise-3 rounded-3xl bg-white/75 backdrop-blur-sm ring-1 ring-cloud-100 shadow-card p-10 md:p-16 text-center">
            <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-cloud-100 text-cloud-700 ring-1 ring-cloud-200">
              <Clapperboard className="h-6 w-6" />
            </span>
            <h2 className="font-display text-[22px] font-medium tracking-tight text-ink-900 leading-tight mb-2">
              No deliverables in production right now.
            </h2>
            <p className="text-[13.5px] text-ink-500 max-w-md mx-auto leading-relaxed">
              When campaigns move past strategy, they land here.{' '}
              <a
                href="/pipeline/ready-to-execute"
                className="font-semibold text-iris-600 hover:text-iris-700 underline-offset-2 hover:underline"
              >
                Check Ready to Execute
              </a>{' '}
              for the next ones to push into production.
            </p>
          </section>
        ) : (
          <div className="rise rise-3 flex-1 min-h-0 overflow-x-auto pb-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-[12px] text-ink-500">
                <span className="font-display text-lg text-ink-900 mr-2">
                  {PRODUCTION_STATUS_ORDER.length}
                </span>
                production statuses · {visibleDeliverables.length} cards live · drag &amp; drop ready
              </p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-ink-500">
                Refreshed 2 min ago
              </p>
            </div>

            <div className="flex gap-6 lg:gap-8 items-start min-w-max">
              {byStatus.map(({ status, deliverables }) => (
                <ProductionQueueColumn
                  key={status}
                  status={status}
                  deliverables={deliverables}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
