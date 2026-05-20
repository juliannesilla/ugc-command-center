import { StatCardWithDelta } from '@/components/analytics/StatCardWithDelta';
import { SmartPanel } from '@/components/analytics/SmartPanel';
import { TopCampaignsCard } from '@/components/analytics/TopCampaignsCard';
import { PortfolioWorthyGrid } from '@/components/analytics/PortfolioWorthyGrid';
import { BonusThresholdsCard, BonusTrackerByCampaign } from '@/components/analytics/BonusTracker';
import { ViewsOverTimeChart } from '@/components/analytics/ViewsOverTimeChart';
import { HookPerformanceBars } from '@/components/analytics/HookPerformanceBars';
import { PostedLinksTable } from '@/components/analytics/PostedLinksTable';
import { BestVideosCard } from '@/components/analytics/BestVideosCard';
import { PlatformPerformanceCard } from '@/components/analytics/PlatformPerformanceCard';
import { DateRangePicker } from '@/components/analytics/DateRangePicker';
import { TOP_STAT_CARDS } from '@/lib/mock-data/analytics';

export const metadata = {
  title: "Analytics · Julianne's UGC Campaign HQ",
  description: 'Performance, bonuses, and hook-pattern analytics across TikTok, Reels and Shorts.',
};

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-cloud-soft">
      {/* Header */}
      <section className="header-cloud px-6 md:px-10 pt-10 pb-12 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="rise rise-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
              Performance
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold mt-1">
              Analytics
            </h1>
            <p className="text-sm text-white/85 mt-1 max-w-xl">
              What's converting, what's plateauing, and where your next bonus is hiding.
            </p>
          </div>
          <div className="rise rise-2">
            <DateRangePicker />
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 -mt-6 pb-16 flex flex-col gap-6">
        {/* Top stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 rise rise-1">
          {TOP_STAT_CARDS.map((s) => (
            <StatCardWithDelta
              key={s.id}
              label={s.label}
              value={s.value}
              delta={s.delta}
              deltaTone={s.deltaTone}
              sublabel={s.sublabel}
            />
          ))}
        </div>

        {/* Smart panel + top campaigns + portfolio */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 rise rise-2">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <TopCampaignsCard />
            <PortfolioWorthyGrid />
            <BonusThresholdsCard />
          </div>
          <div>
            <SmartPanel />
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

        {/* Best videos + platform performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 rise rise-4">
          <div className="lg:col-span-2">
            <BestVideosCard />
          </div>
          <PlatformPerformanceCard />
        </div>
      </section>
    </main>
  );
}
