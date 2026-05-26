// A.14t T4 PILLARS: @geezjulz content-pillar performance route.
// SOURCE: julz-vault/01-WORK-CURRENT/social-media/tiktok_data_enhanced.csv
// (42 posts) — informs UGC concept selection by surfacing which pillars
// resonate hardest. Real data, not mocked (HR-10).

import { Header } from '@/components/ui/header';
import { PageHeader, ContentArea } from '@/components/ui';
import { PillarChart } from '@/components/analytics/PillarChart';
import { PILLAR_DATA, PILLAR_TOTALS } from '@/lib/mock-data/pillars';

export const metadata = {
  title: 'Content Pillars · UGC | Campaign HQ',
  description:
    '@geezjulz TikTok performance broken out by content pillar — informs UGC concept selection.',
};

export default function PillarsPage() {
  const topPillar = PILLAR_DATA[0];

  return (
    <main className="min-h-screen bg-cloud-soft">
      <Header />

      <PageHeader
        variant="hero"
        eyebrow="Performance across your @geezjulz pillars"
        title="Content Pillars"
        subtitle="Which pillars resonate hardest — informs which UGC concepts to pitch next."
      />

      <ContentArea className="-mt-20">
        {/* KPI strip — top-pillar + classification coverage */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rise rise-1">
          <div className="glass-card rounded-2xl p-5 shadow-card">
            <p className="text-xs uppercase tracking-wider text-ink-500">
              Top pillar
            </p>
            <p className="mt-2 font-display text-lg font-semibold text-ink-900">
              {topPillar.pillar}
            </p>
            <p className="mt-1 text-xs text-ink-500">
              {topPillar.avgEngagement.toFixed(1)} avg engagement per post
            </p>
          </div>
          <div className="glass-card rounded-2xl p-5 shadow-card">
            <p className="text-xs uppercase tracking-wider text-ink-500">
              Posts classified
            </p>
            <p className="mt-2 font-display text-2xl font-semibold text-ink-900">
              {PILLAR_TOTALS.classifiedPosts}
              <span className="ml-1 text-sm font-normal text-ink-500">
                / {PILLAR_TOTALS.totalPosts}
              </span>
            </p>
            <p className="mt-1 text-xs text-ink-500">
              {PILLAR_TOTALS.unclassifiedPosts} still unclassified
            </p>
          </div>
          <div className="glass-card rounded-2xl p-5 shadow-card">
            <p className="text-xs uppercase tracking-wider text-ink-500">
              Total engagement
            </p>
            <p className="mt-2 font-display text-2xl font-semibold text-ink-900">
              {(PILLAR_TOTALS.totalLikes + PILLAR_TOTALS.totalComments).toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-ink-500">
              {PILLAR_TOTALS.totalLikes.toLocaleString()} likes ·{' '}
              {PILLAR_TOTALS.totalComments.toLocaleString()} comments
            </p>
          </div>
        </div>

        {/* Pillar charts */}
        <div className="rise rise-2">
          <PillarChart />
        </div>

        {/* Source-of-truth note */}
        <div className="rise rise-3 text-xs text-ink-500">
          Source: <code>julz-vault/01-WORK-CURRENT/social-media/tiktok_data_enhanced.csv</code>{' '}
          · {PILLAR_TOTALS.totalPosts} @geezjulz posts · aggregated 2026-05-26.
        </div>
      </ContentArea>
    </main>
  );
}
