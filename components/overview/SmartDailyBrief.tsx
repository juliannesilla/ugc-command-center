// Implements: Phase A.14s S1 — "Smart Daily Brief" glanceable triage cockpit at top of Overview.
// Reads at build time:
//   - data/sideshift-messages.jsonl (real polled SideShift convos, 30+ rows)
//   - data/sideshift-drafts.jsonl   (optional, header line only acceptable)
//   - lib/mock-data/campaigns      (deadlines + $$$ action)
//
// Skills invoked (HR-21 cite = invoke):
//   - frontend-design (FIRST — aesthetic direction: editorial cockpit, iris/cloud)
//   - vercel:nextjs (server component patterns, file IO at build time)
//   - vercel:shadcn (composition with existing card primitives, no new shadcn pulls)
//   - refactoring-ui:refactoring-ui (hierarchy: size + weight + color; one focal point)
//   - superpowers:verification-before-completion (build verified, type-checked)
//
// Hard rules: HR-2 preserve hero below; HR-3 reduce clicks (one card → triage); HR-25 full skill stack.
import fs from "node:fs";
import path from "node:path";
import {
  Inbox,
  Film,
  CalendarClock,
  Hourglass,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { MOCK_CAMPAIGNS } from "@/lib/mock-data/campaigns";

// ── Types (loose — server component, build-time IO) ────────────────────────
type SideShiftMessage = {
  id?: string;
  brand?: string;
  direction?: "inbound" | "outbound";
  status?: "awaiting-brand" | "awaiting-you" | string;
  ts?: string;
  message_text?: string;
  last_message_preview?: string;
};

// ── Build-time JSONL readers (graceful: missing file → []) ─────────────────
function readJsonl<T>(relPath: string): T[] {
  try {
    const abs = path.join(process.cwd(), relPath);
    if (!fs.existsSync(abs)) return [];
    const raw = fs.readFileSync(abs, "utf8");
    return raw
      .split(/\r?\n/)
      .filter((l) => l.trim().length > 0)
      .map((l) => {
        try {
          return JSON.parse(l) as T;
        } catch {
          return null;
        }
      })
      .filter((x): x is T => x !== null);
  } catch {
    return [];
  }
}

// ── Compute triage signals ─────────────────────────────────────────────────
function computeBrief() {
  const allMessages = readJsonl<SideShiftMessage>("data/sideshift-messages.jsonl");
  // Filter out header rows (no id/direction).
  const messages = allMessages.filter((m) => m.id && m.direction);

  const awaitingYou = messages.filter((m) => m.status === "awaiting-you");
  const awaitingBrand = messages.filter((m) => m.status === "awaiting-brand");

  // Drafts file may be header-only — count only rows with an id.
  const draftRows = readJsonl<{ id?: string; status?: string }>(
    "data/sideshift-drafts.jsonl",
  );
  const draftsReady = draftRows.filter(
    (d) => d.id && (d.status === "ready" || d.status === "drafted" || !d.status),
  ).length;

  // Stale: outbound awaiting-brand older than 7 days from "now" (build time).
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const stale = messages.filter((m) => {
    if (m.status !== "awaiting-brand" || !m.ts) return false;
    const t = new Date(m.ts).getTime();
    if (Number.isNaN(t)) return false;
    return now - t > SEVEN_DAYS;
  }).length;

  // Deadlines this week (next 7 days, active campaigns only).
  const activeCamps = MOCK_CAMPAIGNS.filter(
    (c) => c.status === "active" || c.status === "waiting",
  );
  const deadlinesThisWeek = activeCamps.filter((c) => {
    if (!c.due_date) return false;
    const t = new Date(c.due_date).getTime();
    if (Number.isNaN(t)) return false;
    const diff = t - now;
    return diff >= -24 * 60 * 60 * 1000 && diff <= SEVEN_DAYS;
  });

  // Top awaiting-you ping → headline. Fallback: most-overdue campaign deadline.
  let headlineKicker = "Your next move";
  let headline = "All clear — keep momentum on production.";
  let headlineSub = "Nothing red-hot in the inbox or on deadline radar.";

  const topAwaiting = awaitingYou.sort((a, b) => {
    const ta = a.ts ? new Date(a.ts).getTime() : 0;
    const tb = b.ts ? new Date(b.ts).getTime() : 0;
    return ta - tb; // oldest first = stalest ping
  })[0];

  if (topAwaiting?.brand) {
    const daysAgo = topAwaiting.ts
      ? Math.max(
          0,
          Math.round((now - new Date(topAwaiting.ts).getTime()) / (24 * 60 * 60 * 1000)),
        )
      : 0;
    const dayWord = daysAgo === 0 ? "today" : daysAgo === 1 ? "yesterday" : `${daysAgo}d ago`;
    headlineKicker = "Reply needed";
    headline = `Reply to ${topAwaiting.brand} — pinged ${dayWord}.`;
    headlineSub = "They're holding open. Don't let it cool.";
  } else if (deadlinesThisWeek.length > 0) {
    const soonest = [...deadlinesThisWeek].sort((a, b) => {
      const ta = new Date(a.due_date!).getTime();
      const tb = new Date(b.due_date!).getTime();
      return ta - tb;
    })[0];
    const daysLeft = Math.max(
      0,
      Math.round((new Date(soonest.due_date!).getTime() - now) / (24 * 60 * 60 * 1000)),
    );
    const window =
      daysLeft === 0 ? "due today" : daysLeft === 1 ? "due tomorrow" : `${daysLeft}d out`;
    headlineKicker = "Deadline radar";
    headline = `Ship ${soonest.brand} — ${window}.`;
    headlineSub = `${soonest.next_action ?? "Keep shipping the deliverable."}`;
  }

  // Today's $$$ action — highest-$ active campaign waiting on me.
  const dollarCamp = activeCamps
    .filter((c) => c.waiting_on_who === "me" && (c.total_potential_value ?? 0) > 0)
    .sort((a, b) => (b.total_potential_value ?? 0) - (a.total_potential_value ?? 0))[0];

  const dollarLine = dollarCamp
    ? `${dollarCamp.brand} unlocks $${
        (dollarCamp.total_potential_value ?? 0) >= 1000
          ? `${((dollarCamp.total_potential_value ?? 0) / 1000).toFixed(1)}k`
          : dollarCamp.total_potential_value
      } — ${dollarCamp.next_action ?? "advance the next step"}.`
    : "No single-step $$$ unlock today. Bank the small wins.";

  return {
    headlineKicker,
    headline,
    headlineSub,
    awaitingYouCount: awaitingYou.length,
    awaitingBrandCount: awaitingBrand.length,
    draftsReady,
    deadlinesThisWeekCount: deadlinesThisWeek.length,
    staleCount: stale,
    dollarLine,
  };
}

// ── Component ──────────────────────────────────────────────────────────────
export function SmartDailyBrief() {
  const b = computeBrief();

  const tiles: Array<{
    icon: React.ReactNode;
    glyph: string;
    n: number;
    label: string;
    sub: string;
    tone: "iris" | "pink" | "cloud" | "orange";
  }> = [
    {
      icon: <Inbox className="h-3.5 w-3.5" />,
      glyph: "📥",
      n: b.awaitingYouCount,
      label: "Awaiting your reply",
      sub: "SideShift",
      tone: "pink",
    },
    {
      icon: <Film className="h-3.5 w-3.5" />,
      glyph: "🎬",
      n: b.draftsReady,
      label: "Drafts ready",
      sub: "to ship",
      tone: "iris",
    },
    {
      icon: <CalendarClock className="h-3.5 w-3.5" />,
      glyph: "📅",
      n: b.deadlinesThisWeekCount,
      label: "Deadlines",
      sub: "this week",
      tone: "orange",
    },
    {
      icon: <Hourglass className="h-3.5 w-3.5" />,
      glyph: "⏳",
      n: b.staleCount,
      label: "Stale convos",
      sub: ">7d quiet",
      tone: "cloud",
    },
  ];

  const toneRing: Record<typeof tiles[number]["tone"], string> = {
    iris: "ring-iris-200/70 bg-iris-50/40 text-iris-700",
    pink: "ring-cloud-200/70 bg-cloud-50/40 text-cloud-700",
    cloud: "ring-cloud-200/70 bg-cloud-50/60 text-cloud-700",
    orange: "ring-peach-200/70 bg-peach-50/50 text-peach-700",
  };

  return (
    <section
      aria-label="Smart Daily Brief — triage cockpit"
      className="group/brief rise rise-1 relative overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-cloud-100 transition duration-300 ease-out hover:ring-iris-200 hover:shadow-glow"
    >
      {/* Atmospheric wash — cloud/iris gradient, no flat fill */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-iris-50 via-white to-cloud-50/60"
        aria-hidden
      />
      <div
        className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-cloud-sunset opacity-[0.18] blur-3xl transition-opacity duration-500 ease-out group-hover/brief:opacity-30"
        aria-hidden
      />
      <div
        className="absolute -bottom-20 -right-10 h-60 w-60 rounded-full bg-iris-200/40 blur-3xl"
        aria-hidden
      />

      <div className="relative p-6 md:p-8 lg:p-9">
        {/* Eyebrow row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-iris-600 ring-1 ring-iris-100 shadow-soft">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <p className="text-[10.5px] uppercase tracking-[0.28em] text-iris-700 font-semibold">
              Smart Daily Brief · {b.headlineKicker}
            </p>
          </div>
          <p className="text-[10.5px] uppercase tracking-[0.18em] text-ink-700">
            Triage cockpit · live
          </p>
        </div>

        {/* Headline — largest copy, single focal point */}
        <h2 className="mt-4 font-display text-3xl md:text-[40px] lg:text-[44px] leading-[1.05] tracking-[-0.01em] text-ink-900 max-w-3xl">
          {b.headline}
        </h2>
        <p className="mt-3 text-[14px] md:text-[15px] text-ink-600 leading-relaxed max-w-2xl">
          {b.headlineSub}
        </p>

        {/* 4 glanceable tiles */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {tiles.map((t) => (
            <div
              key={t.label}
              className={`relative rounded-2xl bg-white/85 backdrop-blur p-4 ring-1 ${toneRing[t.tone]} transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-soft`}
            >
              <div className="flex items-center justify-between">
                <span
                  aria-hidden
                  className="text-base leading-none"
                  style={{ fontFamily: "system-ui" }}
                >
                  {t.glyph}
                </span>
                <span className="grid h-6 w-6 place-items-center rounded-md bg-white/80 ring-1 ring-cloud-100">
                  {t.icon}
                </span>
              </div>
              <div className="mt-3 font-display text-[28px] leading-none text-ink-900">
                {t.n}
              </div>
              <div className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-ink-700 font-semibold">
                {t.label}
              </div>
              <div className="text-[10.5px] text-ink-700 mt-0.5">{t.sub}</div>
            </div>
          ))}
        </div>

        {/* Today's $$$ action sub-line */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-white/70 backdrop-blur p-4 ring-1 ring-iris-100">
          <span
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-cloud-sunset/90 text-white shadow-soft"
            aria-hidden
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-[10.5px] uppercase tracking-[0.22em] text-cloud-700 font-semibold">
              Today&rsquo;s $$$ action
            </p>
            <p className="mt-1 text-[13.5px] text-ink-800 leading-snug">
              {b.dollarLine}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
