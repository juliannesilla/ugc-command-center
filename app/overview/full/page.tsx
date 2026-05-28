// A.14y Wave 0.5 — /overview/full mounts the 16 components JONY orphaned in A.14v.
//
// Julz directive 2026-05-28: "what happened to my overview with smart insights
// on the dashboard??? ... 3 [hybrid] + why tf did he orphan it?"
//
// JONY's A.14v rebuild stripped Overview to 3 cards per Julz's "single viewport"
// brief and added an HR-2 PRESERVE comment promising components "can be remounted
// via /overview/full or a future Expand dashboard route." That route never shipped.
// REGRESSION-AUDIT (A.14y Wave 0.5) caught the orphan-promise violation.
//
// Per Julz answer "3 + why tf did he orphan it?" — hybrid Option:
//   - Key 6 feed sections remount BELOW the cinematic hero on / (Overview)
//   - This route (/overview/full) mounts ALL 16 + a per-campaign smart-insights surface
//
// HR-48 NEW (banked this turn): NO ORPHAN PROMISES — every rebuild ships the new home
// for stripped functionality in same phase OR ELON gate FAILS.
// HR-49 NEW (banked this turn): NO MOCK DATA EVER — every render reads from canonical
// (`data/brands-canonical.jsonl`, NORMA's merge). MOCK_CAMPAIGNS export is the legacy
// name for `loadDashboardCampaigns()` per LINUS V8A canonical wire-up.
//
// Skills invoked (HR-21 + HR-25 + HR-31):
//   - frontend-design (composition, hierarchy, spacing rhythm)
//   - refactoring-ui (one focal point per section)
//   - apple-hig-expert (grouping discipline)
//   - vercel:nextjs (server-component default for build-time canonical reads)
//   - superpowers:verification-before-completion (build + visual verify post-edit)
//   - microinteractions (campaign cards hover + collapse)
//
// HR-37: page route — NO `export const dynamic = "force-dynamic"`. Build-time JSONL
// reads via server component (default).

import { Header } from "@/components/ui/header";
import { ContentArea } from "@/components/ui";

// 8 overview feed sections (JONY orphans #1-8)
import { PipelineSnapshot } from "@/components/overview/PipelineSnapshot";
import { CampaignHealthSnapshot } from "@/components/overview/CampaignHealthSnapshot";
import { FocusThisWeek } from "@/components/overview/FocusThisWeek";
import { RecentBrandMessages } from "@/components/overview/RecentBrandMessages";
import { UpcomingDeadlines } from "@/components/overview/UpcomingDeadlines";
import { PaymentsSnapshot } from "@/components/overview/PaymentsSnapshot";
import { ToolsConnected } from "@/components/overview/ToolsConnected";
import { PortfolioReadyClips } from "@/components/overview/PortfolioReadyClips";

// 8 smart engines (JONY orphans #9-16, A.14e Wave 5 E12+E13 deliverables)
import { SmartNextMove } from "@/components/smart/SmartNextMove";
import { MissingInfoBanner } from "@/components/smart/MissingInfoBanner";
import { ReadinessScoreBadge } from "@/components/smart/ReadinessScoreBadge";
import { BriefToDeliverableProgressBar } from "@/components/smart/BriefToDeliverableProgressBar";
import { RedGreenFlagScan } from "@/components/smart/RedGreenFlagScan";
import { RepurposingTracker } from "@/components/smart/RepurposingTracker";
import { BrandFitScoreComponent } from "@/components/smart/BrandFitScoreComponent";
import { ResponseDraftGenerator } from "@/components/smart/ResponseDraftGenerator";

// Canonical-derived (per LINUS V8A `loadDashboardCampaigns()` wiring).
import { MOCK_CAMPAIGNS } from "@/lib/mock-data/campaigns";

export default function OverviewFullPage() {
  // Top 3 active campaigns for per-campaign smart-insights surface.
  // Reads canonical data via LINUS's loadDashboardCampaigns() wire-up.
  const topActive = MOCK_CAMPAIGNS.filter(
    (c) => c.status === "active" || c.status === "waiting",
  ).slice(0, 3);

  // For the draft generator section, pick the top campaign awaiting Julz.
  const topAwaitingJulz =
    MOCK_CAMPAIGNS.find((c) => c.waiting_on_who === "me") ?? topActive[0];

  return (
    <>
      <Header
        pageTitle="Expanded dashboard"
        pageEyebrow="Full smart-insights surface · 8 feed sections + 8 smart engines"
      />

      <ContentArea>
        {/* ─────────────── Section 1 — Smart Next Move (global) ─────────────── */}
        {/* Per A.14e Wave 5 E12 — algorithmic Smart Next Move Engine (different
            from the static YourNextMove on /). Picks the highest-priority active
            campaign + recommends the one action via getNextMove() scoring. */}
        {topActive[0] && (
          <section className="space-y-3">
            <h2 className="section-title text-[22px]">Smart next move</h2>
            <p className="section-subtitle">
              Algorithmic — readiness × waiting-on-me × payment value.
            </p>
            <SmartNextMove campaign={topActive[0]} />
          </section>
        )}

        {/* ─────────────── Section 2 — Pipeline Snapshot (14 tiles) ─────────────── */}
        <PipelineSnapshot />

        {/* ─────────────── Section 3 — Campaign Health Snapshot ─────────────── */}
        <CampaignHealthSnapshot />

        {/* ─────────────── Section 4 — Focus This Week ─────────────── */}
        <FocusThisWeek />

        {/* ─────────────── Section 5 — Upcoming Deadlines ─────────────── */}
        <UpcomingDeadlines />

        {/* ─────────────── Section 6 — Recent Brand Messages ─────────────── */}
        <RecentBrandMessages />

        {/* ─────────────── Section 7 — Payments Snapshot ─────────────── */}
        <PaymentsSnapshot />

        {/* ─────────────── Section 8 — Portfolio-Ready Clips ─────────────── */}
        <PortfolioReadyClips />

        {/* ─────────────── Section 9 — Tools Connected ─────────────── */}
        <ToolsConnected />

        {/* ─────────────── Section 10 — Smart insights per top 3 active campaigns ─────────────── */}
        {/* Per A.14e Wave 5 E12+E13 — per-campaign engines surfaced together.
            Each campaign card shows: MissingInfo · ReadinessScore · BriefProgress
            · RedGreen flags · Repurposing · BrandFit. */}
        <section className="space-y-6 mt-4">
          <div>
            <h2 className="section-title text-[22px]">
              Smart insights — top {topActive.length} active campaigns
            </h2>
            <p className="section-subtitle">
              Per-campaign engines: missing info · readiness 0-100 · 13-stage
              progress · risk flags · repurposing potential · brand fit.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {topActive.map((c) => (
              <div
                key={c.id}
                className="card-secondary space-y-4 p-6 rounded-3xl"
              >
                <div className="space-y-1">
                  <h3 className="font-display text-lg ink-900">{c.brand}</h3>
                  <p className="text-xs ink-500 uppercase tracking-wide">
                    {c.name} · {c.current_stage}
                  </p>
                </div>

                <ReadinessScoreBadge campaign={c} />
                <MissingInfoBanner campaign={c} />
                <BriefToDeliverableProgressBar campaign={c} />
                <RedGreenFlagScan campaign={c} />
                <BrandFitScoreComponent campaign={c} />
                <RepurposingTracker campaign={c} />
              </div>
            ))}
          </div>
        </section>

        {/* ─────────────── Section 11 — Response Draft Generator ─────────────── */}
        {/* Per A.14e Wave 5 E13 — 7 message-type templates with Julz sign-off.
            Mounted as the closing card so Julz can draft a brand reply directly
            from the expanded dashboard. */}
        {topAwaitingJulz && (
          <section className="space-y-3 mt-4">
            <h2 className="section-title text-[22px]">Draft a brand reply</h2>
            <p className="section-subtitle">
              For: <span className="font-medium">{topAwaitingJulz.brand}</span>{" "}
              — {topAwaitingJulz.name}
            </p>
            <ResponseDraftGenerator campaign={topAwaitingJulz} />
          </section>
        )}
      </ContentArea>
    </>
  );
}
