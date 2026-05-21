// Section wrapper for one of the 5 Execution Groups.
//
// Source: spec section 6 "Execution Groups" (L454-L461) — group cards by
// execution type. Renders header + count + responsive card grid.

import type { Campaign } from '@/lib/types/campaign';
import { ExecutionCard } from './ExecutionCard';
import {
  EXECUTION_GROUP_LABEL,
  sortReadyToExecute,
  type ExecutionGroup,
} from './helpers';

const groupAccent: Record<ExecutionGroup, string> = {
  ready_to_script: 'from-iris-200 to-iris-400',
  ready_to_film: 'from-cloud-300 to-cloud-sunset',
  ready_to_edit: 'from-amber-200 to-orange-400',
  ready_for_qa: 'from-emerald-200 to-emerald-400',
  ready_to_submit: 'from-cloud-200 to-iris-400',
};

const groupCopy: Record<ExecutionGroup, string> = {
  ready_to_script: 'Concept locked. Time to draft the words.',
  ready_to_film: 'Script signed off. Set the camera up.',
  ready_to_edit: 'Footage in the can. Stitch + caption + cut.',
  ready_for_qa: 'Final edit ready. Watch with brand-fresh eyes.',
  ready_to_submit: 'QA cleared. Send + tag + log.',
};

export function ExecutionGroupSection({
  group,
  campaigns,
  riseIndex,
}: {
  group: ExecutionGroup;
  campaigns: Campaign[];
  riseIndex: number;
}) {
  if (campaigns.length === 0) return null;

  const sorted = [...campaigns].sort(sortReadyToExecute);

  return (
    <section className={`rise rise-${Math.min(riseIndex, 6)}`}>
      <header className="mb-3 flex items-end justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`h-7 w-1.5 rounded-full bg-gradient-to-b ${groupAccent[group]} shrink-0`}
          />
          <div className="min-w-0">
            <h2 className="font-display text-xl md:text-2xl text-ink-900 leading-tight">
              {EXECUTION_GROUP_LABEL[group]}
            </h2>
            <p className="text-[12px] text-ink-500 leading-snug">
              {groupCopy[group]}
            </p>
          </div>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-600 ring-1 ring-cloud-100">
          {campaigns.length} {campaigns.length === 1 ? 'campaign' : 'campaigns'}
        </span>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {sorted.map((c) => (
          <ExecutionCard key={c.campaign_id} campaign={c} />
        ))}
      </div>
    </section>
  );
}
