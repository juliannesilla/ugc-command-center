// Implements: 01-initial-dashboard-prompt.md § "MAIN DASHBOARD OVERVIEW" (all 6 sub-sections)
//   + § "DESIGN THE LAYOUT" rows 1-13
//   + § "SMART FEATURES" Smart Next Move Engine (wired via lib/scoring)
//   + Phase A.14j §1+§2 typography pass — mockups 02+05+12
//   + Phase A.14n Wave 2b — N3-OVERVIEW-HERO adoption of Wave 2a primitives
//     (HeroBand + StatStrip + ContentArea + RightRail) per _meta/dashboard-spec/
//     06-a14n-primitives-spec.md + 06-a14n-hero-kpi-spec.md + 06-a14n-visual-baseline.md
//     Top-10 gaps #1 (hero font scale), #2 (no persistent right rail), #3 (KPI density),
//     #10 (header chrome inconsistent).
// Brand string per HR-27: "UGC | Campaign HQ" (in components/ui/header.tsx).
// Hero gradient (lavender/iris) locked HR-27 — preserved via HeroBand `lavender` variant default.
import {
  TrendingUp,
  Wallet,
  Inbox,
  PlayCircle,
  Check,
  Zap,
  Target,
  Phone,
} from "lucide-react";
import { Header } from "@/components/ui/header";
import { StatusChip } from "@/components/ui/status-chip";
import { TodayModeToggle } from "@/components/ui/today-mode-toggle";
import {
  HeroBand,
  StatStrip,
  ContentArea,
  RightRail,
  type StatTile,
} from "@/components/ui";
import { MOCK_CAMPAIGNS } from "@/lib/mock-data/campaigns";
import { RECENT_ACTIVITY } from "@/lib/mock-data/campaigns";
import { pageEyebrow as makePageEyebrow, pulseEyebrow as makePulseEyebrow } from "@/lib/date-anchor";

// Modular overview sections (E1 Wave 2 — components/overview/).
// A.14s S1 — SmartDailyBrief: top-of-Overview triage cockpit reading
//   data/sideshift-messages.jsonl + drafts + deadlines at build time.
import { SmartDailyBrief } from "@/components/overview/SmartDailyBrief";
import { YourNextMove } from "@/components/overview/YourNextMove";
import { PipelineSnapshot } from "@/components/overview/PipelineSnapshot";
import { CampaignHealthSnapshot } from "@/components/overview/CampaignHealthSnapshot";
import { FocusThisWeek } from "@/components/overview/FocusThisWeek";
import { ToolsConnected } from "@/components/overview/ToolsConnected";
import { RecentBrandMessages } from "@/components/overview/RecentBrandMessages";
import { UpcomingDeadlines } from "@/components/overview/UpcomingDeadlines";
import { PaymentsSnapshot } from "@/components/overview/PaymentsSnapshot";
import { PortfolioReadyClips } from "@/components/overview/PortfolioReadyClips";

// Map stage prefixes → status-chip tone (kept inline so the recent-activity
// table doesn't pull a hard dep from any of the modular sections above).
const stageToTone = (s: string) => {
  if (s.startsWith("NEW") || s.startsWith("RESPOND")) return "pink" as const;
  if (s.startsWith("SOW")) return "iris" as const;
  if (s.startsWith("SCRIPT") || s.startsWith("STRATEGY")) return "iris" as const;
  if (s.startsWith("FILM") || s.startsWith("EDIT") || s.startsWith("QA")) return "orange" as const;
  if (s.startsWith("SUBMIT")) return "yellow" as const;
  if (s.startsWith("POSTED") || s.startsWith("PAID") || s.startsWith("ACCEPTED")) return "green" as const;
  return "pink" as const;
};

export default function OverviewPage() {
  // ── Hero stat strip aggregates (preserve A.14c lock) ────────────────────
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

  // Wave 2b: StatStrip consumes the same hero tile data, now as StatTile[].
  // Mockup #05 cite — 5 tiles inline below hero (Total Active / Pipeline Value /
  // Awaiting Response / In Production / Completed) — exact density match.
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

  // A.14u F2: single source of truth at lib/date-anchor (refreshes at build time).
  const pageEyebrow = makePageEyebrow();
  const pulseEyebrow = makePulseEyebrow();

  return (
    <>
      {/* Chrome strip — brand mark + mantra + notifs + avatar.
          Per Wave 2a N3-B spec L132: chrome <Header /> keeps its deep-lavender
          hero (HR-27 brand lock). HeroBand below is the content-area secondary
          hero with scale-bumped title + KPI strip per mockup #05. */}
      <Header
        pageEyebrow={pageEyebrow}
        pageTitle="Good morning, Julianne."
      />

      <ContentArea
        className="-mt-8"
        rightRail={
          <RightRail>
            {/* Quick Synth panel — moved from inline aside L223 (preserves A.14c lock). */}
            <div
              className="rise rise-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-iris-50 via-white to-pink-50 p-6 shadow-card ring-1 ring-iris-100"
              data-today-hide
            >
              <div
                className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-cloud-sunset opacity-20 blur-3xl"
                aria-hidden
              />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-iris-600 ring-1 ring-iris-100 shadow-soft">
                    <Zap className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-[10.5px] uppercase tracking-[0.22em] text-iris-700 font-semibold">
                    Quick Synth
                  </p>
                </div>
                <p className="mt-3 text-[13px] text-ink-700 leading-relaxed">
                  The brief wins. Build from the SOW, not vibes. Heavy on{" "}
                  <span className="font-semibold text-ink-900">SOW reviews</span>{" "}
                  today —{" "}
                  <span className="font-semibold text-ink-900">
                    {awaitingResponse} inbound
                  </span>{" "}
                  need a yes/no by EOD or they cool off.
                </p>
                <p className="mt-3 text-[10.5px] uppercase tracking-[0.16em] text-ink-700">
                  Synced 4 min ago · Wed 9:02am
                </p>
              </div>
            </div>

            {/* Today's Focus — mockup #05 right-rail card. */}
            <div className="card-secondary">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-cloud-600" />
                <p className="text-[10.5px] uppercase tracking-[0.22em] text-ink-700 font-semibold">
                  Today&rsquo;s focus
                </p>
              </div>
              <ul className="mt-3 space-y-2.5 text-[13px] text-ink-700">
                <li className="flex gap-2 leading-snug">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cloud-sunset shrink-0" />
                  <span>Redline ParakeetAI SOW usage clause</span>
                </li>
                <li className="flex gap-2 leading-snug">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-iris-400 shrink-0" />
                  <span>Film ParakeetAI hook variations + Parakeet panel screen-rec</span>
                </li>
                <li className="flex gap-2 leading-snug text-ink-700">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-ink-300 shrink-0" />
                  <span>Drop signed brand names in chat to add more campaigns</span>
                </li>
              </ul>
            </div>

            {/* Quick Stats — mockup #05 right-rail card. */}
            <div className="card-secondary" data-today-hide>
              <p className="text-[10.5px] uppercase tracking-[0.22em] text-ink-700 font-semibold">
                Quick stats
              </p>
              <dl className="mt-3 space-y-2.5 text-[13px]">
                <div className="flex items-baseline justify-between">
                  <dt className="text-ink-600">Response rate</dt>
                  <dd className="font-display text-lg text-ink-900">64%</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-ink-600">Avg. deal size</dt>
                  <dd className="font-display text-lg text-ink-900">$1.4k</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-ink-600">On-time delivery</dt>
                  <dd className="font-display text-lg text-ink-900">94%</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-ink-600">Net-30 outstanding</dt>
                  <dd className="font-display text-lg text-cloud-700">$6,250</dd>
                </div>
              </dl>
            </div>

            {/* Upcoming Calls — mockup #05 right-rail card. */}
            <div className="card-secondary" data-today-hide>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-cloud-600" />
                <p className="text-[10.5px] uppercase tracking-[0.22em] text-ink-700 font-semibold">
                  Upcoming calls
                </p>
              </div>
              <ul className="mt-3 divide-y divide-cloud-50">
                <li className="py-2.5 first:pt-0 last:pb-0">
                  <p className="text-[13px] text-ink-700 leading-snug">
                    No calls on the books yet. Drop a brand name + meeting time in chat to add one.
                  </p>
                </li>
              </ul>
            </div>
          </RightRail>
        }
      >
        {/* Today Mode toggle bar — spec § 9 L806-L813. Client island; state in localStorage. */}
        <div className="rise rise-1 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[12px] text-ink-700 leading-snug max-w-md">
            <span data-today-only-label className="font-semibold text-iris-600">
              Today Mode is ON ·
            </span>{" "}
            Filter Overview to today-only urgency — what to reply to, film,
            submit, follow up on, or get paid for.
          </p>
          <TodayModeToggle />
        </div>

        {/* A.14s S1 — Smart Daily Brief triage cockpit. Top-of-Overview glanceable
            decision card reading data/sideshift-messages.jsonl + drafts + deadlines.
            Sits ABOVE HeroBand so the single most-important action lands first. */}
        <SmartDailyBrief />

        {/* HERO BAND — Wave 2b adoption: replaces inline KPI section L105-L133.
            mockup #05 cite — light lavender hero band with mantra + 5-tile strip.
            Gap #1 fix: title now 44px via HeroBand spec lock (was inline text-2xl/3xl).
            Gap #3 fix: StatStrip lg:grid-cols-5 inline-tight (was full-width stacked). */}
        <HeroBand
          eyebrow={pulseEyebrow}
          title="Let's make today count."
          mantra={'"The goal isn\'t to be perfect. It\'s to be better than yesterday."'}
        >
          <StatStrip tiles={heroTiles} />
        </HeroBand>

        {/* Implements: spec § 2 "Your Next Move" — wired to getNextMove(). */}
        <YourNextMove />

        {/* Implements: spec § 3 "My Campaign Pipeline Snapshot" — 14 tiles. */}
        <div data-today-hide>
          <PipelineSnapshot />
        </div>

        {/* Implements: spec § 4 "My Creator Campaign Health Snapshot". */}
        <div data-today-hide>
          <CampaignHealthSnapshot />
        </div>

        {/* Implements: spec § 5 "Focus This Week". */}
        <FocusThisWeek />

        {/* Implements: spec layout row 9 "Recent Brand Messages". */}
        <RecentBrandMessages />

        {/* Implements: spec layout row 10 "Upcoming Deadlines". */}
        <UpcomingDeadlines />

        {/* Implements: spec layout row 11 "Payments Snapshot". */}
        <PaymentsSnapshot />

        {/* Implements: spec § 6 "Tools / Assets Connected" — 15 tools. */}
        <div data-today-hide>
          <ToolsConnected />
        </div>

        {/* Implements: spec layout row 13 "Portfolio-Ready Clips". */}
        <div data-today-hide>
          <PortfolioReadyClips />
        </div>

        {/* Recent activity table — kept from A.14d baseline (HR-2 preserve).
            A.14m T5: section-title for H3. */}
        <section className="space-y-3" data-today-hide>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h3 className="section-title text-[22px]">
              Recent campaign activity
            </h3>
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink-700">
              Last 72 hours
            </p>
          </div>
          <div className="rounded-3xl bg-white shadow-card ring-1 ring-cloud-100 overflow-x-auto">
            <table className="w-full text-[13px] min-w-[480px]">
              <thead className="bg-cloud-soft text-left">
                <tr className="text-[10.5px] uppercase tracking-[0.16em] text-ink-700">
                  <th className="px-5 py-3 font-semibold">When</th>
                  <th className="px-5 py-3 font-semibold">Brand</th>
                  <th className="px-5 py-3 font-semibold">Event</th>
                  <th className="px-5 py-3 font-semibold">Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud-50">
                {RECENT_ACTIVITY.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-[13px] text-ink-700"
                    >
                      No recent activity. Drop signed brand names in chat to
                      start the log — ParakeetAI is the only active campaign
                      right now.
                    </td>
                  </tr>
                ) : (
                  RECENT_ACTIVITY.slice(0, 5).map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-cloud-50/60 transition"
                    >
                      <td className="px-5 py-3 text-ink-700 whitespace-nowrap">
                        {row.when}
                      </td>
                      <td className="px-5 py-3 font-semibold text-ink-900 whitespace-nowrap">
                        {row.brand}
                      </td>
                      <td className="px-5 py-3 text-ink-700">{row.event}</td>
                      <td className="px-5 py-3">
                        <StatusChip tone={stageToTone(row.stage)}>
                          {row.stage}
                        </StatusChip>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </ContentArea>
    </>
  );
}
