import { SmartPanel } from '@/components/analytics/SmartPanel';
import { TopCampaignsCard } from '@/components/analytics/TopCampaignsCard';
import { PortfolioWorthyGrid } from '@/components/analytics/PortfolioWorthyGrid';
import { BonusTrackerByCampaign } from '@/components/analytics/BonusTracker';
import { UpcomingBonusThresholds } from '@/components/analytics/UpcomingBonusThresholds';
import { ViewsOverTimeChart } from '@/components/analytics/ViewsOverTimeChart';
import { HookPerformanceBars } from '@/components/analytics/HookPerformanceBars';
import { PostedLinksTable } from '@/components/analytics/PostedLinksTable';
import { BestVideosCard } from '@/components/analytics/BestVideosCard';
import { PlatformPerformanceCard } from '@/components/analytics/PlatformPerformanceCard';
import { DateRangePicker } from '@/components/analytics/DateRangePicker';
import { TOP_STAT_CARDS } from '@/lib/mock-data/analytics';
// A.14n N3-CROSS-DATA Wave 2b: adopt PageHeader hero + ContentArea + RightRail
// + StatStrip primitives (mockup #04 — Smart Panel right rail, KPI tile row).
// HR-2 PRESERVE: ALL existing analytics components (charts, tables, SmartPanel)
// untouched at the body level — only the header markup + outer layout composition
// swap.
import { PageHeader, ContentArea, RightRail, StatStrip } from '@/components/ui';

export const metadata = {
  title: "Analytics · UGC | Campaign HQ",
  description: 'Performance, bonuses, and hook-pattern analytics across TikTok, Reels and Shorts.',
};

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-cloud-soft">
      {/* A.14n N3-CROSS-DATA: shared PageHeader hero (mockup #04 — uppercase
          eyebrow "Performance" + display H1 + lede + DateRangePicker top-right). */}
      <PageHeader
        variant="hero"
        eyebrow="Performance"
        title="Analytics"
        subtitle="What's converting, what's plateauing, and where your next bonus is hiding."
        actions={<DateRangePicker />}
      />

      {/* A.14n N3-CROSS-DATA: ContentArea with persistent right rail (mockup #04
          gap #2 — Smart Panel lives in the ~320px sidebar, not inline). Body
          components flow in the main column unchanged. */}
      <ContentArea
        className="-mt-20"
        rightRail={
          <RightRail>
            <SmartPanel />
            <PlatformPerformanceCard />
          </RightRail>
        }
      >
        {/* Top stat cards — StatStrip primitive replaces inline grid for
            consistent KPI density (mockup #04 — tight 4-tile inline row, not
            stacked cards). */}
        <StatStrip
          className="rise rise-1"
          tiles={TOP_STAT_CARDS.map((s) => ({
            number: s.value,
            label: s.label,
            sub: s.sublabel,
            accent: 'iris',
          }))}
        />

        {/* Top campaigns + portfolio (Smart Panel moved to right rail) */}
        <div className="grid grid-cols-1 gap-6 rise rise-2">
          <TopCampaignsCard />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PortfolioWorthyGrid />
            <UpcomingBonusThresholds />
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 rise rise-3">
          <ViewsOverTimeChart />
          <HookPerformanceBars />
        </div>

        {/* Posted links + bonus by campaign */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 rise rise-3">
          <PostedLinksTable />
          <BonusTrackerByCampaign />
        </div>

        {/* Best videos full-width (PlatformPerformanceCard moved to rail) */}
        <div className="rise rise-4">
          <BestVideosCard />
        </div>
      </ContentArea>
    </main>
  );
}
