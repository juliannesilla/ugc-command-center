// Pipeline · Ready to Execute — maker-mode view.
//
// Source: `_meta/dashboard-spec/02-campaign-pipeline-views-architecture.md`
// section 6 "Ready to Execute View" (L431-L512):
//
//   "This is your maker-mode view. Use this when you do not want to think —
//    you just want to create." (L435-L437)
//
//   "Card view or checklist view grouped by execution type." (L441)
//
//   Include campaigns where (L443-L452):
//     - SOW reviewed = yes
//     - Product research / positioning / concept complete
//     - Script status ready or almost ready
//     - Missing critical info = no
//     - Next action involves film, edit, QA, or submit
//
//   Execution groups (L454-L461):
//     Ready to Script · Ready to Film · Ready to Edit · Ready for QA ·
//     Ready to Submit
//
//   Smart feature (L502-L510): "Batch Mode" suggestions when ≥2 share traits.
//
// Phase A.14e Wave 2 (E5) — NEW route. E4 owns adding the sidebar nav entry.
// All filter / sort / batch / time-estimate logic lives in
// `components/ready-to-execute/helpers.ts` (pure functions, server-safe).

import { Hammer } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { MOCK_CAMPAIGNS } from '@/lib/mock-data/campaigns';
import { BatchModeSuggestions } from '@/components/ready-to-execute/BatchModeSuggestions';
import { FilterBar } from '@/components/ready-to-execute/FilterBar';
import { ExecutionGroupSection } from '@/components/ready-to-execute/ExecutionGroupSection';
import {
  isReadyToExecute,
  getExecutionGroup,
  getBatchSuggestions,
  getChipCount,
  EXECUTION_GROUP_ORDER,
  FILTER_CHIPS,
  type FilterChipKey,
} from '@/components/ready-to-execute/helpers';

export const metadata = {
  title: 'Ready to Execute · UGC | Campaign HQ',
  description:
    'Maker mode. Campaigns with critical info complete, ready to film, edit, QA, or submit.',
};

export default function ReadyToExecutePage() {
  // 1. Default filter per spec L443-L452 + L481-L485.
  const ready = MOCK_CAMPAIGNS.filter(isReadyToExecute);

  // 2. Group by execution type per spec L454-L461.
  const byGroup = EXECUTION_GROUP_ORDER.map((group) => ({
    group,
    campaigns: ready.filter((c) => getExecutionGroup(c) === group),
  }));

  // 3. Smart feature: Batch Mode suggestions (spec L502-L510).
  const batchSuggestions = getBatchSuggestions(ready);

  // 4. Saved filter chip counts (spec L487-L493).
  const chipCounts = FILTER_CHIPS.reduce(
    (acc, chip) => {
      acc[chip.key] = getChipCount(ready, chip.key);
      return acc;
    },
    {} as Record<FilterChipKey, number>,
  );

  return (
    <>
      <Header
        pageEyebrow="Campaign Pipeline · Maker Mode"
        pageTitle="Ready to execute"
      />

      <main className="px-7 md:px-12 py-6 space-y-6">
        {/* Batch Mode panel — only renders if ≥1 N≥2 pattern exists */}
        <BatchModeSuggestions suggestions={batchSuggestions} />

        {/* Filter + sort + chips */}
        <FilterBar totalCount={ready.length} chipCounts={chipCounts} />

        {/* Empty state */}
        {ready.length === 0 ? (
          <section className="rise rise-3 rounded-3xl bg-white/75 backdrop-blur-sm ring-1 ring-cloud-100 shadow-card p-10 md:p-16 text-center">
            <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-iris-50 text-iris-500 ring-1 ring-iris-100">
              <Hammer className="h-6 w-6" />
            </span>
            <h2 className="font-display text-2xl text-ink-900 leading-tight mb-2">
              No campaigns ready to execute right now.
            </h2>
            <p className="text-[13.5px] text-ink-500 max-w-md mx-auto leading-relaxed">
              Check{' '}
              <a
                href="/pipeline/needs-attention"
                className="font-semibold text-iris-600 hover:text-iris-700 underline-offset-2 hover:underline"
              >
                Needs Attention
              </a>{' '}
              to unblock waiting campaigns.
            </p>
          </section>
        ) : (
          <div className="space-y-6">
            {byGroup.map(({ group, campaigns }, i) => (
              <ExecutionGroupSection
                key={group}
                group={group}
                campaigns={campaigns}
                riseIndex={i + 3}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
