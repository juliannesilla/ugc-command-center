'use client';

/**
 * SideShift Growth — creator visibility / platform growth dashboard.
 *
 * Source: `_meta/dashboard-spec/02-campaign-pipeline-views-architecture.md`
 *         Section 11 "SideShift Growth View" (L820–L867).
 *
 * Layout: progress dashboard + checklist, with filter chips, a Visibility
 * Next Move smart-feature panel, and an empty state when 100% complete.
 *
 * Sidebar nav: this route is NOT yet linked in the sidebar — E9 in this same
 * wave owns sidebar edits. Reachable by direct URL `/sideshift-growth` until
 * E9 (or a Wave 5/8 close-up) wires the nav link.
 *
 * Owned by E10 (Phase A.14e Wave 4).
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, Sparkles } from 'lucide-react';
import { Header } from '@/components/ui/header';
import {
  SIDESHIFT_PROFILE_FIELDS,
  applyBucket,
  profileCompletionPercent,
  visibilityNextMoves,
  FILTER_BUCKETS,
} from '@/lib/mock-data/sideshift-growth';
import { ProgressHero } from '@/components/sideshift-growth/ProgressHero';
import {
  FilterChips,
  type BucketKey,
} from '@/components/sideshift-growth/FilterChips';
import { FieldCard } from '@/components/sideshift-growth/FieldCard';
import { VisibilityNextMove } from '@/components/sideshift-growth/VisibilityNextMove';
import { ProfileCompleteEmptyState } from '@/components/sideshift-growth/EmptyState';

export default function SideShiftGrowthPage() {
  const [bucket, setBucket] = useState<BucketKey>('all');

  // Stable references — mock data is constant, but useMemo signals intent.
  const allFields = useMemo(() => SIDESHIFT_PROFILE_FIELDS, []);

  const percent = useMemo(
    () => profileCompletionPercent(allFields),
    [allFields],
  );

  const counts = useMemo(() => {
    const out = {} as Record<BucketKey, number>;
    for (const f of FILTER_BUCKETS) {
      out[f.key] = applyBucket(allFields, f.key).length;
    }
    return out;
  }, [allFields]);

  const filtered = useMemo(
    () => applyBucket(allFields, bucket),
    [allFields, bucket],
  );

  const completeCount = allFields.filter((f) => f.status === 'complete').length;
  const partialCount  = allFields.filter((f) => f.status === 'partial').length;
  const missingCount  = allFields.filter((f) => f.status === 'missing').length;

  const profileFullyComplete =
    completeCount === allFields.length && missingCount === 0;

  const nextMoves = useMemo(() => visibilityNextMoves(allFields), [allFields]);

  return (
    <>
      <Header
        pageEyebrow="Creator Growth"
        pageTitle="SideShift Growth"
      />

      <main className="flex-1 px-7 md:px-12 py-6 space-y-6 lg:space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 text-[12px] text-ink-500">
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-cloud-700 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Overview
          </Link>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1 text-iris-600">
            <Eye className="h-3.5 w-3.5" />
            Profile visibility &amp; platform growth
          </span>
        </div>

        {profileFullyComplete ? (
          <ProfileCompleteEmptyState />
        ) : (
          <>
            {/* Overall progress hero */}
            <ProgressHero
              percent={percent}
              completeCount={completeCount}
              partialCount={partialCount}
              missingCount={missingCount}
              totalCount={allFields.length}
            />

            {/* Visibility Next Move smart panel */}
            <VisibilityNextMove moves={nextMoves} />

            {/* Filter chips */}
            <section className="flex flex-wrap items-center justify-between gap-3">
              <FilterChips
                active={bucket}
                onChange={setBucket}
                counts={counts}
              />
              <p className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] text-ink-500">
                <Sparkles className="h-3 w-3 text-cloud-sunset" />
                13 fields tracked
              </p>
            </section>

            {/* Field checklist */}
            <section
              aria-label="Profile field checklist"
              className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
            >
              {filtered.length === 0 ? (
                <div className="md:col-span-2 xl:col-span-3 rounded-3xl bg-white/70 backdrop-blur ring-1 ring-cloud-100 px-6 py-10 text-center">
                  <p className="font-display text-lg text-ink-900">
                    Nothing in this filter.
                  </p>
                  <p className="mt-1 text-[13px] text-ink-500">
                    All fields in this bucket are already taken care of. Try
                    another filter.
                  </p>
                </div>
              ) : (
                filtered.map((field) => (
                  <FieldCard key={field.key} field={field} />
                ))
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}
