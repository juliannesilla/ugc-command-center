// Implements: 01-initial-dashboard-prompt.md § "MAIN DASHBOARD OVERVIEW" (all 6 sub-sections)
//   + § "DESIGN THE LAYOUT" rows 1-13
//   + § "SMART FEATURES" Smart Next Move Engine (wired via lib/scoring)
// Brand string per HR-27: "UGC | Campaign HQ" (in components/ui/header.tsx).
// Hero gradient strip locked A.14c (HR-2 preserve intent) — unchanged below.
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
import { cn } from "@/lib/utils";
import { MOCK_CAMPAIGNS } from "@/lib/mock-data/campaigns";
import { RECENT_ACTIVITY } from "@/lib/mock-data/campaigns";

// Modular overview sections (E1 Wave 2 — components/overview/).
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

  const heroTiles = [
    { label: "Total Active",      value: totalActive,                                        sub: "campaigns",     accent: "iris",   Icon: TrendingUp },
    { label: "Pipeline Value",    value: `$${pipelineValue >= 1000 ? `${(pipelineValue / 1000).toFixed(1)}k` : pipelineValue}`, sub: "potential",     accent: "pink",   Icon: Wallet },
    { label: "Awaiting Response", value: awaitingResponse,                                   sub: "your move",     accent: "orange", Icon: Inbox },
    { label: "In Production",     value: inProduction,                                       sub: "filming/edit",  accent: "peach",  Icon: PlayCircle },
    { label: "Completed",         value: completedThisMonth,                                 sub: "this month",    accent: "green",  Icon: Check },
  ];

  const accentBg: Record<string, string> = {
    iris:   "bg-iris-50 text-iris-600 ring-iris-100",
    pink:   "bg-pink-50 text-pink-600 ring-pink-100",
    orange: "bg-orange-50 text-orange-600 ring-orange-100",
    peach:  "bg-amber-50 text-amber-600 ring-amber-100",
    green:  "bg-emerald-50 text-emerald-600 ring-emerald-100",
  };

  return (
    <>
      {/* Implements: spec § 1 "Header / Hero Area" — title, subtitle, mantra, date. */}
      <Header
        pageEyebrow="Wednesday · May 19 · Creator Campaign HQ"
        pageTitle="Good morning, Julianne."
      />

      <div className="px-7 md:px-12 -mt-8 pb-20 space-y-10 lg:space-y-12">
        {/* Today Mode toggle bar — spec § 9 L806-L813. Client island; state in localStorage. */}
        <div className="rise rise-1 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[12px] text-ink-500 leading-snug max-w-md">
            <span data-today-only-label className="font-semibold text-iris-600">
              Today Mode is ON ·
            </span>{" "}
            Filter Overview to today-only urgency — what to reply to, film, submit, follow up on, or get paid for.
          </p>
          <TodayModeToggle />
        </div>

        {/* HERO STAT STRIP — A.14c lock, preserved per HR-2. */}
        <section className="rise rise-1 grid grid-cols-2 md:grid-cols-5 gap-5">
          {heroTiles.map((t) => {
            const Icon = t.Icon;
            return (
              <div
                key={t.label}
                className="group rounded-2xl bg-white p-4 shadow-card ring-1 ring-cloud-100 hover:-translate-y-0.5 hover:ring-cloud-300 transition"
              >
                <div className="flex items-start justify-between">
                  <p className="text-[10.5px] uppercase tracking-[0.18em] text-ink-500 font-semibold leading-tight">
                    {t.label}
                  </p>
                  <span
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-lg ring-1",
                      accentBg[t.accent] ?? accentBg.iris,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <p className="mt-2 font-display text-3xl text-ink-900 leading-none">
                  {t.value}
                </p>
                <p className="text-[11px] text-ink-500 mt-1">{t.sub}</p>
              </div>
            );
          })}
        </section>

        {/* MAIN COLUMN + RIGHT RAIL (A.14c lock preserved). */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8">
          {/* MAIN COLUMN — sections 2-6 + layout rows 9-13. */}
          <div className="space-y-10 lg:space-y-12 min-w-0">
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

            {/* Implements: spec § 5 "Focus This Week". (kept in Today Mode — "what to film today") */}
            <FocusThisWeek />

            {/* Implements: spec layout row 10 "Upcoming Deadlines". */}
            <UpcomingDeadlines />

            {/* Implements: spec layout row 11 "Payments Snapshot". */}
            <PaymentsSnapshot />

            {/* Implements: spec § 6 "Tools / Assets Connected" — 15 tools. */}
            <div data-today-hide>
              <ToolsConnected />
            </div>

            {/* Implements: spec layout row 9 "Recent Brand Messages". (kept in Today Mode — "what to reply to today") */}
            <RecentBrandMessages />

            {/* Implements: spec layout row 13 "Portfolio-Ready Clips". */}
            <div data-today-hide>
              <PortfolioReadyClips />
            </div>

            {/* Recent activity table — kept from A.14d baseline (HR-2 preserve). */}
            <section className="space-y-3" data-today-hide>
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <h3 className="font-display text-2xl text-ink-900">
                  Recent campaign activity
                </h3>
                <p className="text-[11px] uppercase tracking-[0.18em] text-ink-500">
                  Last 72 hours
                </p>
              </div>
              <div className="rounded-3xl bg-white shadow-card ring-1 ring-cloud-100 overflow-x-auto">
                <table className="w-full text-[13px] min-w-[480px]">
                  <thead className="bg-cloud-soft text-left">
                    <tr className="text-[10.5px] uppercase tracking-[0.16em] text-ink-500">
                      <th className="px-5 py-3 font-semibold">When</th>
                      <th className="px-5 py-3 font-semibold">Brand</th>
                      <th className="px-5 py-3 font-semibold">Event</th>
                      <th className="px-5 py-3 font-semibold">Stage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cloud-50">
                    {RECENT_ACTIVITY.slice(0, 5).map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-cloud-50/60 transition"
                      >
                        <td className="px-5 py-3 text-ink-500 whitespace-nowrap">
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
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* RIGHT RAIL — Quick Synth, Today's Focus, Quick Stats, Upcoming Calls
              (preserved from A.14c lock per HR-2; minor wording updates only). */}
          <aside className="space-y-6">
            <div className="rise rise-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-iris-50 via-white to-pink-50 p-6 shadow-card ring-1 ring-iris-100" data-today-hide>
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
                <p className="mt-3 text-[10.5px] uppercase tracking-[0.16em] text-ink-500">
                  Synced 4 min ago · Wed 9:02am
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-cloud-100">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-cloud-600" />
                <p className="text-[10.5px] uppercase tracking-[0.22em] text-ink-500 font-semibold">
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
                  <span>Push Goodie AI for written brief pre-call</span>
                </li>
                <li className="flex gap-2 leading-snug">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>Film e.l.f. Glow mirror-test sequence</span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-cloud-100" data-today-hide>
              <p className="text-[10.5px] uppercase tracking-[0.22em] text-ink-500 font-semibold">
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

            <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-cloud-100" data-today-hide>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-cloud-600" />
                <p className="text-[10.5px] uppercase tracking-[0.22em] text-ink-500 font-semibold">
                  Upcoming calls
                </p>
              </div>
              <ul className="mt-3 divide-y divide-cloud-50">
                <li className="py-2.5 first:pt-0">
                  <p className="text-[13.5px] font-medium text-ink-900 leading-snug">
                    Goodie AI — pre-brief call
                  </p>
                  <p className="text-[11px] text-ink-500 mt-0.5">
                    Fri · 2:00pm PT · Zoom
                  </p>
                </li>
                <li className="py-2.5">
                  <p className="text-[13.5px] font-medium text-ink-900 leading-snug">
                    MegPrime Pay — contract review
                  </p>
                  <p className="text-[11px] text-ink-500 mt-0.5">
                    Mon · 11:30am PT
                  </p>
                </li>
                <li className="py-2.5 last:pb-0">
                  <p className="text-[13.5px] font-medium text-ink-900 leading-snug">
                    VILO — kickoff
                  </p>
                  <p className="text-[11px] text-ink-500 mt-0.5">
                    Tue · 10:00am PT
                  </p>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
