'use client';

/**
 * Needs Attention / Fix First — campaign triage view.
 *
 * Source: `_meta/dashboard-spec/02-campaign-pipeline-views-architecture.md`
 * Section 5 "Needs Attention / Fix First View".
 *
 * Filters MOCK_CAMPAIGNS against 14 triage triggers, groups results into 10
 * issue categories, sorts by severity → due date → waiting-on-me → value.
 *
 * Owned by E4 (Phase A.14e Wave 2).
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  AlertOctagon,
  Flame,
  UserCheck,
  Building2,
} from 'lucide-react';
import { Header } from '@/components/ui/header';
import { StatStrip } from '@/components/ui';
import { MOCK_CAMPAIGNS } from '@/lib/mock-data/campaigns';
import {
  buildAllIssues,
  sortIssues,
  applyFilter,
  groupByCategory,
  SAVED_FILTERS,
  type SavedFilter,
} from '@/components/needs-attention/triage';
import { IssueGroup } from '@/components/needs-attention/IssueGroup';
import { EmptyState } from '@/components/needs-attention/EmptyState';
import { FilterChips } from '@/components/needs-attention/FilterChips';

export default function NeedsAttentionPage() {
  const [filter, setFilter] = useState<SavedFilter>('all');

  // Build + sort all issues once per render.
  const allIssues = useMemo(
    () => sortIssues(buildAllIssues(MOCK_CAMPAIGNS)),
    [],
  );

  // Count per saved filter (for chip badges).
  const counts = useMemo(() => {
    const out = {} as Record<SavedFilter, number>;
    for (const f of SAVED_FILTERS) {
      out[f.key] = applyFilter(allIssues, f.key).length;
    }
    return out;
  }, [allIssues]);

  const filtered = useMemo(() => applyFilter(allIssues, filter), [allIssues, filter]);
  const grouped = useMemo(() => groupByCategory(filtered), [filtered]);

  // Top-line stats.
  const highCount   = allIssues.filter((i) => i.severity === 'high').length;
  const waitingOnMe = allIssues.filter((i) => i.isWaitingOnMe).length;
  const affectedBrands = new Set(allIssues.map((i) => i.campaign.brand)).size;

  return (
    <>
      <Header pageEyebrow="Campaign Pipeline" pageTitle="Needs Attention" />

      <main className="flex-1 px-7 md:px-12 py-6 space-y-8">
        {/* Breadcrumb back */}
        <div className="flex items-center gap-3 text-[12px] text-ink-500">
          <Link
            href="/pipeline/board"
            className="inline-flex items-center gap-1 hover:text-cloud-700 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Board
          </Link>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1 text-rose-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            Fix-first triage
          </span>
        </div>

        {/* Stat strip — A.14n Wave 2b adopts N3-PRIMITIVES StatStrip per mockup #24
            (fix-first-needs-attention shows 4-tile inline density above filter chips). */}
        <StatStrip
          tiles={[
            {
              number: allIssues.length,
              label: 'Total issues',
              sub: `${grouped.length} categories`,
              accent: 'pink',
              icon: <AlertOctagon className="h-4 w-4" />,
            },
            {
              number: highCount,
              label: 'High severity',
              sub: 'Resolve first',
              accent: 'orange',
              icon: <Flame className="h-4 w-4" />,
            },
            {
              number: waitingOnMe,
              label: 'Waiting on me',
              sub: 'Your turn',
              accent: 'iris',
              icon: <UserCheck className="h-4 w-4" />,
            },
            {
              number: affectedBrands,
              label: 'Affected brands',
              sub: `of ${MOCK_CAMPAIGNS.length} campaigns`,
              accent: 'peach',
              icon: <Building2 className="h-4 w-4" />,
            },
          ]}
        />

        {/* Filter chips + sort note */}
        <section className="flex flex-wrap items-center justify-between gap-3">
          <FilterChips active={filter} onChange={setFilter} counts={counts} />
          <p className="text-[10.5px] uppercase tracking-[0.18em] text-ink-500">
            Sort: severity → due date → waiting on me → value
          </p>
        </section>

        {/* Body */}
        {grouped.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {grouped.map((g) => (
              <IssueGroup
                key={g.category}
                category={g.category}
                items={g.items}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
