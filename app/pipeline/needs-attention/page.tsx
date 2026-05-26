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

  // A.14o O3-V2 (recovered from V1 git-race wipe) — severity-grouped jump
  // strip counts per mockup #24. Mapping: P0 = high, P1 = medium, P2 = low.
  const p0Count = filtered.filter((i) => i.severity === 'high').length;
  const p1Count = filtered.filter((i) => i.severity === 'medium').length;
  const p2Count = filtered.filter((i) => i.severity === 'low').length;

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

        {/* A.14o O3-V2 (recovered from V1 git-race wipe) — severity-grouped
            jump strip per mockup #24. P0 (rose) / P1 (orange) / P2 (iris)
            anchor-scroll into the grouped list below. Placed ABOVE the saved
            filter chips so the severity hierarchy is the first scannable cue
            after StatStrip. */}
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] font-medium">
          <span className="text-ink-500">JUMP TO:</span>
          <a
            href="#p0-issues"
            className="rounded-full bg-rose-100 px-3 py-1 text-rose-700 hover:bg-rose-200 transition-colors duration-150"
          >
            P0 ({p0Count})
          </a>
          <a
            href="#p1-issues"
            className="rounded-full bg-orange-100 px-3 py-1 text-orange-700 hover:bg-orange-200 transition-colors duration-150"
          >
            P1 ({p1Count})
          </a>
          <a
            href="#p2-issues"
            className="rounded-full bg-iris-100 px-3 py-1 text-iris-700 hover:bg-iris-200 transition-colors duration-150"
          >
            P2 ({p2Count})
          </a>
        </div>

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
            {/* A.14o O3-V2: anchor markers for the severity jump strip — first
                group containing each severity tier gets a corresponding id so
                #p0-issues / #p1-issues / #p2-issues smooth-scroll lands on a
                meaningful boundary. scroll-margin-top accounts for sticky
                header. */}
            {(() => {
              const firstWithSev = (sev: 'high' | 'medium' | 'low') =>
                grouped.findIndex((g) => g.items.some((i) => i.severity === sev));
              const p0Idx = firstWithSev('high');
              const p1Idx = firstWithSev('medium');
              const p2Idx = firstWithSev('low');
              return grouped.map((g, idx) => {
                const id =
                  idx === p0Idx ? 'p0-issues'
                  : idx === p1Idx ? 'p1-issues'
                  : idx === p2Idx ? 'p2-issues'
                  : undefined;
                return (
                  <div key={g.category} id={id} className="scroll-mt-24">
                    <IssueGroup category={g.category} items={g.items} />
                  </div>
                );
              });
            })()}
          </div>
        )}
      </main>
    </>
  );
}
