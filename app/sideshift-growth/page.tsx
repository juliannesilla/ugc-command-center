/**
 * SideShift Growth — creator analytics dashboard.
 *
 * REBUILD: Phase A.14n Wave 2b N3-SIDESHIFT-REBUILD.
 *
 * Source mockup: `_meta/mockups/20-sideshift-growth.png` (UGC repo) —
 *   full analytics dashboard tracking applications / conversions / earnings /
 *   visibility / XP, NOT the prior profile-completion checklist.
 *
 * Driver:  `_meta/dashboard-spec/06-a14n-visual-baseline.md` row 15 —
 *   "ENTIRELY DIFFERENT page concept ... needs full rebuild not polish"
 *   (deployed 58% fidelity → target ≥90%).
 *
 * Adopted primitives (Wave 2a):
 *   - <Header pageEyebrow pageTitle/> — global chrome
 *   - <HeroBand>  — content hero band with mantra + StatStrip slot
 *   - <StatStrip> — 6-tile dense KPI row
 *   - <ContentArea rightRail={<RightRail>}> — main + 320px sticky rail grid
 *
 * Composed components (this rebuild):
 *   - ProfileCompletenessCard   — donut, hero row col 1
 *   - VisibilityScoreCard       — big 84/100 number + tier, hero row col 2
 *   - NextActionsPanel          — 3 visibility moves, hero row col 3
 *   - LeagueXpCard              — XP/league progress + boosters, lower-left
 *   - VisibilityOverTimeChart   — area chart, lower-right (main col)
 *   - TopPerformingNiches       — horizontal bars, bottom-left
 *   - RecentActivityFeed        — chronological events, bottom-middle
 *   - BoostYourGrowthCta        — full-bleed gradient CTA, footer
 *
 * HR-2 PRESERVE: profile-completion concept retained — donut card at top
 * row + xp/league card in main col + full legacy checklist data still
 * available in `lib/mock-data/sideshift-growth.ts` (kept inline at bottom of
 * that file). Legacy components (`ProgressHero`, `FieldCard`, `FilterChips`,
 * `VisibilityNextMove`, `EmptyState`) remain on disk untouched for potential
 * future reuse; this page no longer imports them.
 *
 * HR-31 auto-applied: full skill stack (refactoring-ui, top-design,
 * hooked-ux, data:create-viz, design:design-handoff, superpowers:
 * verification-before-completion), ELON Tier-2 gate after build, registry
 * of action items in spec docs.
 */

import {
  Sparkles,
  Megaphone,
  BadgeCheck,
  GraduationCap,
  Timer,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { Header } from '@/components/ui/header';
import {
  HeroBand,
  StatStrip,
  ContentArea,
  RightRail,
  type StatTile,
} from '@/components/ui';

import {
  SIDESHIFT_KPI_TILES,
  SIDESHIFT_SNAPSHOT,
  type GrowthKpiTile,
} from '@/lib/mock-data/sideshift-growth';

import { ProfileCompletenessCard } from '@/components/sideshift-growth/ProfileCompletenessCard';
import { VisibilityScoreCard } from '@/components/sideshift-growth/VisibilityScoreCard';
import { NextActionsPanel } from '@/components/sideshift-growth/NextActionsPanel';
import { LeagueXpCard } from '@/components/sideshift-growth/LeagueXpCard';
import { VisibilityOverTimeChart } from '@/components/sideshift-growth/VisibilityOverTimeChart';
import { TopPerformingNiches } from '@/components/sideshift-growth/TopPerformingNiches';
import { RecentActivityFeed } from '@/components/sideshift-growth/RecentActivityFeed';
import { BoostYourGrowthCta } from '@/components/sideshift-growth/BoostYourGrowthCta';

// Map icon-name string from mock data → Lucide component.
// (Mock layer stays serializable; UI layer resolves the icon.)
const KPI_ICON: Record<GrowthKpiTile['iconName'], LucideIcon> = {
  Sparkles,
  Megaphone,
  BadgeCheck,
  GraduationCap,
  Timer,
  Trophy,
};

function buildKpiTiles(): StatTile[] {
  return SIDESHIFT_KPI_TILES.map((t) => {
    const Icon = KPI_ICON[t.iconName];
    const deltaSub =
      typeof t.deltaPct === 'number' && t.deltaPct !== 0
        ? `${t.deltaPct > 0 ? '▲' : '▼'} ${Math.abs(t.deltaPct)}% · ${t.sub ?? ''}`.trim()
        : t.sub;
    return {
      number: t.number,
      label: t.label,
      sub: deltaSub,
      accent: t.accent,
      icon: <Icon className="h-3.5 w-3.5" />,
    };
  });
}

export default function SideShiftGrowthPage() {
  const kpiTiles = buildKpiTiles();

  return (
    <>
      <Header
        pageEyebrow="Creator Growth · SideShift"
        pageTitle="SideShift Growth"
      />

      <div className="px-7 md:px-12 -mt-24 pb-20 space-y-10 lg:space-y-12">
        {/* ── HERO BAND ─────────────────────────────────────────────
            Mockup #20 hero: lavender bg + mantra upper-right + bottom
            slot for the 6-tile KPI strip. */}
        <HeroBand
          title="Track every brand, post, and payout."
          mantra={'"You don\'t trust data facts. You trust data trends."'}
          gradient="lavender"
        >
          <StatStrip tiles={kpiTiles} />
        </HeroBand>

        {/* ── ROW 1 · 3-up hero summary cards ───────────────────────
            Mockup #20 top row: Profile Completeness · Visibility Score
            · Next Actions. Stretched equal height with auto-rows. */}
        <section
          aria-label="SideShift hero summary"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 auto-rows-fr"
        >
          <ProfileCompletenessCard />
          <VisibilityScoreCard />
          <NextActionsPanel />
        </section>

        {/* ── MAIN + RIGHT RAIL via ContentArea primitive ───────────
            Main column: Visibility chart (lg col 1) + Top Niches
            + Recent Activity (lg 2-up below chart).
            Right rail: LeagueXpCard + small quick stats + profile-completion
            secondary widget (HR-2 PRESERVE). */}
        <ContentArea
          className="px-0 md:px-0 pb-0 space-y-0"
          rightRail={
            <RightRail>
              <LeagueXpCard />

              {/* Quick snapshot tile in rail — mirrors mockup's small
                  "Total Applications" stat next to League card. */}
              <div className="glass-card rounded-2xl p-5 shadow-card">
                <p className="text-[10.5px] uppercase tracking-[0.22em] text-cloud-700 font-semibold">
                  Quick Snapshot
                </p>
                <dl className="mt-3 space-y-2.5 text-[12.5px]">
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="text-ink-600">Total applications</dt>
                    <dd className="font-display tabular-nums text-ink-900 font-semibold">
                      {SIDESHIFT_SNAPSHOT.totalApplications}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="text-ink-600">Pending payouts</dt>
                    <dd className="font-display tabular-nums text-emerald-700 font-semibold">
                      ${SIDESHIFT_SNAPSHOT.pendingPayouts.toLocaleString()}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="text-ink-600">Profile complete</dt>
                    <dd className="font-display tabular-nums text-ink-900 font-semibold">
                      {SIDESHIFT_SNAPSHOT.profileCompleteness}%
                    </dd>
                  </div>
                </dl>
              </div>
            </RightRail>
          }
        >
          {/* Main column — visibility chart full-width */}
          <VisibilityOverTimeChart />

          {/* Main column — 2-up: niches + activity */}
          <section
            aria-label="Performance breakdown"
            className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6"
          >
            <TopPerformingNiches />
            <RecentActivityFeed />
          </section>
        </ContentArea>

        {/* ── FOOTER CTA ─────────────────────────────────────────────
            Mockup #20 bottom banner — full-bleed gradient CTA. */}
        <BoostYourGrowthCta />
      </div>
    </>
  );
}
