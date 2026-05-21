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
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { StatCard } from '@/components/ui/stat-card';
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

      <main className="flex-1 px-6 md:px-10 py-6 space-y-6">
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

        {/* Stat strip */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Total issues"
            value={allIssues.length}
            sub={`${grouped.length} categories`}
            accent="pink"
          />
          <StatCard
            label="High severity"
            value={highCount}
            sub="Resolve first"
            accent="orange"
          />
          <StatCard
            label="Waiting on me"
            value={waitingOnMe}
            sub="Your turn"
            accent="iris"
          />
          <StatCard
            label="Affected brands"
            value={affectedBrands}
            sub={`of ${MOCK_CAMPAIGNS.length} campaigns`}
            accent="peach"
          />
        </section>

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
