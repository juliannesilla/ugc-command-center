// Implements: A.14v Wave 2 — JONY × mockup #05 cinematic single-viewport hero.
//
// JULZ'S EXACT WORDS (A.14v JONY brief, HR-1 cite):
//   "For the hero, I wanted it to honestly be the exact same design and
//    layout as the inspo."
//   "Rebuild the Overview hero (app/page.tsx) to match mockup #05 EXACTLY:
//    cinematic photo-banner, single-viewport, trim the existing 20-section scroll."
//   "trim trailing 15+ scroll sections — replace with a SINGLE 'Today's pulse'
//    card + a SINGLE 'Next move' card. That's it. Single viewport."
//   Mockup: _meta/mockups/05-overview-good-morning-julianne.png
//
// WHAT CHANGED FROM PRIOR REVISION (A.14n Wave 2b):
//   - HeroBand → HeroCinematic (photo-banner per mockup #05, lavender fallback)
//   - 6 modular feed sections (PipelineSnapshot · CampaignHealthSnapshot ·
//     FocusThisWeek · RecentBrandMessages · UpcomingDeadlines · PaymentsSnapshot ·
//     ToolsConnected · PortfolioReadyClips · Recent Activity table) REMOVED
//     from the Overview composition per "single viewport · only 3 cards."
//   - Right-rail (Quick Synth / Today's Focus / Quick Stats / Upcoming Calls)
//     REMOVED so the hero owns the viewport without competing rail content.
//   - 3-card composition retained: HeroCinematic → SmartDailyBrief →
//     YourNextMove. Below-the-fold = empty by design (single-viewport mandate).
//
// HR-2 PRESERVE: deleted components STILL EXIST under components/overview/ and
//   keep their A.14c/d/e logic — they can be remounted via /overview/full or a
//   future "Expand dashboard" route. NONE of the underlying business logic is
//   lost. This file scope = layout shell only.
// HR-3 FEWER DECISIONS: drops Julz's scroll count from ~20 sections to 3.
// HR-15 VERIFY ARTIFACT: build + screenshot the actual page, not just the source.
// HR-37 NO force-dynamic on page routes for GH Pages static export.

import { TrendingUp, Wallet, Inbox, PlayCircle, Check } from "lucide-react";
import { Header } from "@/components/ui/header";
import { ContentArea, StatStrip, type StatTile } from "@/components/ui";
import { HeroCinematic } from "@/components/overview/HeroCinematic";
import { SmartDailyBrief } from "@/components/overview/SmartDailyBrief";
import { YourNextMove } from "@/components/overview/YourNextMove";
import { MOCK_CAMPAIGNS } from "@/lib/mock-data/campaigns";
import {
  pageEyebrow as makePageEyebrow,
} from "@/lib/date-anchor";

export default function OverviewPage() {
  // ── Hero KPI aggregates (preserve A.14c lock — same math, new presentation) ──
  const active = MOCK_CAMPAIGNS.filter(
    (c) => c.status !== "archived" && c.status !== "paid",
  );
  const totalActive = active.length;
  const pipelineValue = active.reduce(
    (sum, c) => sum + (c.total_potential_value ?? 0),
    0,
  );
  const awaitingResponse = active.filter(
    (c) => c.waiting_on_who === "me",
  ).length;
  const inProduction = active.filter((c) =>
    ["SCRIPT READY", "FILMING", "EDITING", "QA"].includes(c.current_stage),
  ).length;
  const completedThisMonth = MOCK_CAMPAIGNS.filter(
    (c) => c.current_stage === "POSTED" || c.current_stage === "PAID",
  ).length;

  // Mockup #05 cite — 5-tile inline strip below the hero photo.
  // Translucent glass tiles render via StatStrip on top of the cinematic
  // banner per HeroCinematic's bottom slot.
  const heroTiles: StatTile[] = [
    {
      number: totalActive,
      label: "Total Active",
      sub: "campaigns",
      accent: "iris",
      icon: <TrendingUp className="h-3.5 w-3.5" />,
    },
    {
      number: `$${
        pipelineValue >= 1000
          ? `${(pipelineValue / 1000).toFixed(1)}k`
          : pipelineValue
      }`,
      label: "Pipeline Value",
      sub: "potential",
      accent: "pink",
      icon: <Wallet className="h-3.5 w-3.5" />,
    },
    {
      number: awaitingResponse,
      label: "Awaiting Response",
      sub: "your move",
      accent: "orange",
      icon: <Inbox className="h-3.5 w-3.5" />,
    },
    {
      number: inProduction,
      label: "In Production",
      sub: "filming/edit",
      accent: "peach",
      icon: <PlayCircle className="h-3.5 w-3.5" />,
    },
    {
      number: completedThisMonth,
      label: "Completed",
      sub: "this month",
      accent: "green",
      icon: <Check className="h-3.5 w-3.5" />,
    },
  ];

  // A.14u F2 — single source of truth at lib/date-anchor (build-time cron).
  const pageEyebrow = makePageEyebrow();

  return (
    <>
      {/* Chrome strip preserved per HR-2 — brand mark + page eyebrow + avatar.
          Header continues to render the deep-lavender hero (HR-27 brand lock);
          HeroCinematic below is the content-area cinematic banner per #05. */}
      <Header
        pageEyebrow={pageEyebrow}
        pageTitle="Good morning, Julianne."
      />

      {/* Negative -mt-8 pulls HeroCinematic up into the chrome bottom so the
          composition reads as one continuous hero per mockup #05 (no gap
          between chrome and content hero). */}
      <ContentArea className="-mt-8">
        {/* ─────────────── HERO BAND #1 — Cinematic photo-banner ─────────────── */}
        {/* Mockup #05 §1 hero photo + headline + mantra + KPI strip seamless. */}
        <HeroCinematic
          eyebrow={pageEyebrow}
          title="Good morning, Julianne."
          mantra={'"The goal isn\'t to be perfect. It\'s to be better than yesterday."'}
        >
          <StatStrip tiles={heroTiles} />
        </HeroCinematic>

        {/* ─────────────── CARD #2 — Today's pulse (Smart Daily Brief) ─────────────── */}
        {/* Julz brief A.14v: "a SINGLE 'Today's pulse' card."
            SmartDailyBrief reads data/sideshift-messages.jsonl + drafts +
            deadlines at build time and renders the glanceable triage cockpit. */}
        <SmartDailyBrief />

        {/* ─────────────── CARD #3 — Next move ─────────────── */}
        {/* Julz brief A.14v: "a SINGLE 'Next move' card. That's it."
            YourNextMove picks the highest-priority active campaign via
            getNextMove() scoring and surfaces the one action that moves the
            most pipeline value. */}
        <YourNextMove />

        {/* SINGLE-VIEWPORT MANDATE — nothing below the fold by design.
            Prior modular feed sections (PipelineSnapshot, CampaignHealthSnapshot,
            FocusThisWeek, RecentBrandMessages, UpcomingDeadlines, PaymentsSnapshot,
            ToolsConnected, PortfolioReadyClips, RecentActivity) still exist as
            components under components/overview/ — they're mounted on dedicated
            sub-routes or a future /overview/full expansion, NOT on this hero. */}
      </ContentArea>
    </>
  );
}
