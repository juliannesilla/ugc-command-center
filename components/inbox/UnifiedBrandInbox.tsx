"use client";

/**
 * UnifiedBrandInbox
 * ─────────────────────────────────────────────────────────────────────────
 * Client component that renders the merged list of brand-relevant messages
 * from 3 sources (SideShift / Gmail / Linear) into a single chronologically-
 * sorted queue, with source filtering and a click-to-open detail panel.
 *
 * DATA CONTRACT
 *   Pre-merged, pre-sorted UnifiedEntry[] handed down from the server
 *   component (`app/inbox/unified/page.tsx`). This component is presentation
 *   only — no fetch, no fs.
 *
 * INTERACTION MODEL
 *   - Filter chips: All · SideShift · Gmail · Linear (counts shown)
 *   - Click a row → opens UnifiedDetailPanel (slide-over modal)
 *   - Empty state per source if file missing / no entries
 *
 * SKILLS APPLIED (HR-21)
 *   - frontend-design     → editorial 2-column row, source-color left rule
 *   - refactoring-ui      → vertical rhythm 16px, type ramp 11/13/15
 *   - microinteractions   → 120ms hover lift, focus ring, badge tone-feedback
 *   - ux-heuristics       → filter chips show counts (visibility of status)
 *   - hooked-ux           → unread/recent rows get accent left-rail
 *
 * HR-2: zero coupling to /brand-responses components (intentionally
 * standalone — different aggregate semantics).
 */

import { useMemo, useState, useEffect } from "react";
import { Inbox, Mail, Sparkles, MessageSquare, Filter } from "lucide-react";
import { UnifiedDetailPanel } from "./UnifiedDetailPanel";
import { StaleBadge, computeStaleness } from "./StaleBadge";

export type UnifiedSource = "sideshift" | "gmail" | "linear";

export type UnifiedEntry = {
  id: string; // namespaced: "sideshift:abc123" / "gmail:..." / "linear:..."
  source: UnifiedSource;
  brand: string; // primary line — brand name OR issue title OR sender
  subject: string; // secondary line
  preview: string; // body snippet
  ts: string; // ISO8601
  url: string; // open-in-source URL
  direction: "inbound" | "outbound" | "unknown";
  meta: Record<string, unknown>;
};

export type SourceStatus = {
  source: UnifiedSource;
  fileName: string;
  fileExists: boolean;
  entriesFound: number;
  errorMsg: string | null;
};

type Props = {
  entries: UnifiedEntry[];
  sourceStatuses: SourceStatus[];
};

type FilterKey = "all" | UnifiedSource;

// A.14s S3 — urgency filter pills (orthogonal to source filter chips above).
// Lets Julz triage by who owes whom rather than which channel.
type UrgencyKey = "all" | "owed" | "silent" | "urgent";

const URGENCY_PILLS: { key: UrgencyKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "owed", label: "Owed by you" },
  { key: "silent", label: "Brand silent" },
  { key: "urgent", label: "Urgent" },
];

const SOURCE_META: Record<
  UnifiedSource,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge: string; // tailwind classes for badge bg+text
    accent: string; // tailwind class for row left-rail
    pollCmd: string;
  }
> = {
  sideshift: {
    label: "SideShift",
    icon: Sparkles,
    badge: "bg-iris-100 text-iris-700",
    accent: "before:bg-iris-400",
    pollCmd: "npm run poll-sideshift",
  },
  gmail: {
    label: "Gmail",
    icon: Mail,
    badge: "bg-peach-100 text-peach-700",
    accent: "before:bg-peach-400",
    pollCmd: "npm run poll-gmail-brand",
  },
  linear: {
    label: "Linear",
    icon: MessageSquare,
    badge: "bg-cloud-100 text-cloud-700",
    accent: "before:bg-cloud-400",
    pollCmd: "npm run poll-linear-pipeline",
  },
};

function fmtTs(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const now = Date.now();
  const diff = now - d.getTime();
  const hrs = Math.floor(diff / 3_600_000);
  if (hrs < 1) {
    const mins = Math.max(1, Math.floor(diff / 60_000));
    return `${mins}m ago`;
  }
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function UnifiedBrandInbox({ entries, sourceStatuses }: Props) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [urgency, setUrgency] = useState<UrgencyKey>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // A.14s S3 — pin "now" to mount so SSR/client renders agree (Next.js static
  // export). Without this useEffect, staleness ages would diverge between
  // initial HTML and hydration, causing a hydration mismatch.
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
  }, []);

  // Pre-compute staleness once per entry per render (cheap — O(n)).
  const annotated = useMemo(
    () =>
      entries.map((e) => ({
        entry: e,
        stale: computeStaleness(e.direction, e.ts, now),
      })),
    [entries, now]
  );

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = {
      all: entries.length,
      sideshift: 0,
      gmail: 0,
      linear: 0,
    };
    for (const e of entries) c[e.source] += 1;
    return c;
  }, [entries]);

  // Urgency counts drive the pill row + "default to Urgent" auto-select.
  const urgencyCounts = useMemo(() => {
    const c: Record<UrgencyKey, number> = {
      all: annotated.length,
      owed: 0,
      silent: 0,
      urgent: 0,
    };
    for (const a of annotated) {
      if (a.stale.level === "owed") c.owed += 1;
      else if (a.stale.level === "silent") c.silent += 1;
      else if (a.stale.level === "urgent") c.urgent += 1;
    }
    return c;
  }, [annotated]);

  // Default filter per spec: "Urgent" if urgent rows exist, else "All".
  // Only auto-set ONCE on first mount so user choice is sticky.
  const [didAutoSelect, setDidAutoSelect] = useState(false);
  useEffect(() => {
    if (didAutoSelect) return;
    if (urgencyCounts.urgent > 0) setUrgency("urgent");
    setDidAutoSelect(true);
  }, [urgencyCounts.urgent, didAutoSelect]);

  const visible = useMemo(() => {
    // First filter by source.
    const bySource =
      filter === "all"
        ? annotated
        : annotated.filter((a) => a.entry.source === filter);

    // Then filter by urgency.
    const byUrgency =
      urgency === "all"
        ? bySource
        : bySource.filter((a) => a.stale.level === urgency);

    // Sort: "All" urgency → urgency desc then ts desc (urgent floats up).
    //       specific urgency → ts desc only (urgency is constant inside group).
    const sorted = [...byUrgency].sort((a, b) => {
      const tA = Date.parse(a.entry.ts) || 0;
      const tB = Date.parse(b.entry.ts) || 0;
      if (urgency === "all") {
        if (b.stale.rank !== a.stale.rank) return b.stale.rank - a.stale.rank;
      }
      return tB - tA;
    });

    return sorted.map((a) => a.entry);
  }, [annotated, filter, urgency]);

  const selected = useMemo(
    () => entries.find((e) => e.id === selectedId) || null,
    [entries, selectedId]
  );

  const emptySources = sourceStatuses.filter(
    (s) => !s.fileExists || s.entriesFound === 0
  );

  return (
    <div className="rise rise-2">
      {/* Filter chip row */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div
          role="tablist"
          aria-label="Filter by source"
          className="inline-flex items-center gap-1 rounded-2xl bg-white/85 backdrop-blur p-1 shadow-card ring-1 ring-cloud-100"
        >
          {(["all", "sideshift", "gmail", "linear"] as const).map((key) => {
            const active = filter === key;
            const label =
              key === "all" ? "All" : SOURCE_META[key].label;
            const count = counts[key];
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] transition ${
                  active
                    ? "bg-cloud-sunset text-white shadow-card"
                    : "text-ink-600 hover:text-ink-900 hover:bg-cloud-50"
                }`}
              >
                {label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                    active ? "bg-white/25 text-white" : "bg-cloud-100 text-cloud-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-ink-700">
          <Filter className="h-3 w-3" />
          {visible.length} {visible.length === 1 ? "message" : "messages"}
        </span>
      </div>

      {/* A.14s S3 — urgency filter pill row (orthogonal to source filter above) */}
      <div
        role="tablist"
        aria-label="Filter by urgency"
        className="mb-4 inline-flex flex-wrap items-center gap-1 rounded-2xl bg-white/85 backdrop-blur p-1 shadow-card ring-1 ring-cloud-100"
      >
        {URGENCY_PILLS.map(({ key, label }) => {
          const active = urgency === key;
          const count = urgencyCounts[key];
          const isUrgent = key === "urgent";
          const isOwed = key === "owed";
          const isSilent = key === "silent";
          const activeBg = isUrgent
            ? "bg-ink-900 text-white shadow-card"
            : isOwed
              ? "bg-peach-500 text-white shadow-card"
              : isSilent
                ? "bg-amber-500 text-white shadow-card"
                : "bg-cloud-sunset text-white shadow-card";
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setUrgency(key)}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] transition ${
                active
                  ? activeBg
                  : "text-ink-600 hover:text-ink-900 hover:bg-cloud-50"
              }`}
            >
              {label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                  active ? "bg-white/25 text-white" : "bg-cloud-100 text-cloud-700"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Honesty banner — surfaces any source that has 0 rows */}
      {emptySources.length > 0 && (
        <div className="mb-4 rounded-2xl bg-white/85 backdrop-blur p-4 ring-1 ring-cloud-100 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-700">
            No data yet for
          </p>
          <ul className="mt-2 space-y-1">
            {emptySources.map((s) => {
              const meta = SOURCE_META[s.source];
              const Icon = meta.icon;
              return (
                <li
                  key={s.source}
                  className="flex items-center gap-2 text-[13px] text-ink-700"
                >
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-lg ${meta.badge}`}
                  >
                    <Icon className="h-3 w-3" />
                  </span>
                  <span className="font-semibold">{meta.label}</span>
                  <span className="text-ink-700">
                    — run{" "}
                    <code className="rounded bg-ink-50 px-1.5 py-0.5 text-[11.5px] text-ink-800">
                      {meta.pollCmd}
                    </code>{" "}
                    locally to populate{" "}
                    <code className="rounded bg-ink-50 px-1.5 py-0.5 text-[11.5px] text-ink-800">
                      data/{s.fileName}
                    </code>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* List */}
      {visible.length === 0 ? (
        <div className="rounded-3xl bg-white/85 backdrop-blur p-12 text-center ring-1 ring-cloud-100 shadow-card">
          <span className="grid h-12 w-12 mx-auto place-items-center rounded-2xl bg-cloud-100 text-cloud-700">
            <Inbox className="h-5 w-5" />
          </span>
          <h3 className="mt-4 font-display text-[22px] text-ink-900">
            No conversations yet
          </h3>
          <p className="mt-1.5 text-[13px] text-ink-700">
            Once the polling scripts run locally and you commit + deploy the
            updated JSONLs, brand messages from all 3 sources will collect
            here in one stream.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((e) => {
            const meta = SOURCE_META[e.source];
            const Icon = meta.icon;
            const active = selectedId === e.id;
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(e.id)}
                  className={`relative w-full rounded-2xl bg-white/90 backdrop-blur px-4 py-3.5 text-left ring-1 transition shadow-card hover:shadow-soft hover:-translate-y-[1px] before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:rounded-full ${meta.accent} ${
                    active
                      ? "ring-cloud-400 bg-white"
                      : "ring-cloud-100 hover:ring-cloud-200"
                  }`}
                >
                  <div className="flex items-center gap-3 pl-3">
                    <span
                      className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-xl ${meta.badge}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-[14px] text-ink-900">
                          {e.brand}
                        </p>
                        <span
                          className={`flex-shrink-0 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.12em] ${meta.badge}`}
                        >
                          {meta.label}
                        </span>
                        {/* A.14s S3 — staleness severity badge (null when row not stale) */}
                        <StaleBadge
                          direction={e.direction}
                          ts={e.ts}
                          now={now}
                          className="flex-shrink-0"
                        />
                      </div>
                      <p className="mt-0.5 truncate text-[12.5px] text-ink-600">
                        <span className="font-medium text-ink-700">
                          {e.subject}
                        </span>
                        {e.preview && (
                          <>
                            <span className="mx-1.5 text-ink-300">·</span>
                            <span>{e.preview}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-[11px] tabular-nums text-ink-700">
                      {fmtTs(e.ts)}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Detail panel */}
      <UnifiedDetailPanel
        entry={selected}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
