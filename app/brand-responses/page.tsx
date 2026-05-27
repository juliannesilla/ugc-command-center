"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  Mail,
  Inbox,
  PencilLine,
  Clock,
  PhoneCall,
  Sparkles,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import {
  STAT_CARDS,
  STATUS_TABS,
  type TabKey,
} from "@/lib/mock-data/brand-responses";
import { MessageQueue } from "@/components/brand-responses/MessageQueue";
import { BrandResponseDetailPanel } from "@/components/brand-responses/BrandResponseDetailPanel";
import {
  SideShiftMessageQueue,
  SideShiftDetailPanel,
} from "@/components/brand-responses/SideShiftMessageQueue";
import {
  DraftReviewPanel,
  type SideShiftDraft,
} from "@/components/brand-responses/DraftReviewPanel";
import { ReadOnlyMirrorBadge } from "@/components/ui/read-only-mirror-badge";
// A.14n N3-CROSS-DATA Wave 2b: PageHeader hero primitive replaces inline
// header-cloud markup (mockup #18 + #25 — consistent eyebrow + H1 + ReadOnlyMirror
// pill across all routes). HR-2 PRESERVE: STAT_CARDS grid + SideShift queue
// components UNTOUCHED — only the title-row markup swaps.
import { PageHeader } from "@/components/ui";

type SourceKey = "gmail" | "sideshift";

const STAT_ICON: Record<string, React.ReactNode> = {
  "NEW MESSAGES": <Mail className="h-3.5 w-3.5" />,
  "RESPONSE NEEDED": <Inbox className="h-3.5 w-3.5" />,
  "DRAFTS IN PROGRESS": <PencilLine className="h-3.5 w-3.5" />,
  "AWAITING REPLY": <Clock className="h-3.5 w-3.5" />,
  "CALL REQUESTED": <PhoneCall className="h-3.5 w-3.5" />,
  PARTNERSHIPS: <Sparkles className="h-3.5 w-3.5" />,
};

const ACCENT_BG: Record<string, string> = {
  cloud: "bg-cloud-100 text-cloud-700",
  iris: "bg-iris-100 text-iris-500",
  peach: "bg-peach-100 text-peach-500",
  ink: "bg-ink-300/40 text-ink-700",
};

/**
 * Inner client component that reads `?id=` from the URL. Wrapped in
 * <Suspense> by the parent so static export + Next 15 can prerender the
 * shell without bailing out of SSG.
 */
function BrandResponsesInner() {
  const [tab, setTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [compact, setCompact] = useState(false);
  // A.14s S2: fetch SideShift drafts once at page level so we can show an
  // empty-state banner AND pass to <DraftReviewPanel> without each panel
  // re-fetching. Loaded lazily; null = loading, [] = file missing/empty.
  const [drafts, setDrafts] = useState<SideShiftDraft[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/data/sideshift-drafts.jsonl", {
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) setDrafts([]);
          return;
        }
        const txt = await res.text();
        const out: SideShiftDraft[] = [];
        for (const line of txt.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const obj = JSON.parse(trimmed);
            if (
              obj &&
              typeof obj.thread_id === "string" &&
              typeof obj.draft_text === "string"
            ) {
              out.push(obj as SideShiftDraft);
            }
          } catch {
            // skip malformed / header lines
          }
        }
        if (!cancelled) setDrafts(out);
      } catch {
        if (!cancelled) setDrafts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
  // Source sub-tab: ?source=sideshift switches to the SideShift inbox.
  // Default (no param, or any other value) = Gmail, preserving the existing
  // /brand-responses?id=X deep-link behavior unchanged.
  const source: SourceKey =
    searchParams.get("source") === "sideshift" ? "sideshift" : "gmail";

  const setSource = (next: SourceKey) => {
    // Switching source clears any selected id — the id namespaces differ
    // between Gmail conv IDs and SideShift message IDs, and keeping one
    // selected while flipping context confuses the detail pane.
    if (next === "sideshift") {
      router.push(`/brand-responses?source=sideshift`, { scroll: false });
    } else {
      router.push(`/brand-responses`, { scroll: false });
    }
  };

  return (
    <>
      {/* A.14n N3-CROSS-DATA: hero header via shared PageHeader primitive.
          Mockup #18 + #25 cite uppercase eyebrow + display H1 + lede + Read-Only
          Mirror badge top-right. Stat cards stay below as a sibling grid that
          overlaps the hero band's bottom padding (header pb-36 → -mt-20 below). */}
      <PageHeader
        variant="hero"
        eyebrow="Inbox · Live"
        title="Brand Responses"
        subtitle="Every conversation, sorted by what needs you next. Drafts saved, templates ready, follow-ups already on the calendar."
        actions={<ReadOnlyMirrorBadge />}
        className="pb-28 lg:pb-32"
      />

      {/* Stat cards — pulled up over the hero band edge for the layered density
          mockup #18 shows. */}
      <section className="-mt-20 px-7 md:px-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {STAT_CARDS.map((s, idx) => {
            const up = s.delta >= 0;
            return (
              <button
                type="button"
                key={s.label}
                onClick={() => setTab(s.tabKey)}
                className={`rise rise-${Math.min(idx + 2, 4)} group glass-card rounded-3xl px-4 py-4 text-left text-ink-900 hover:shadow-soft transition`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-xl ${ACCENT_BG[s.accent]}`}
                  >
                    {STAT_ICON[s.label]}
                  </span>
                  <span
                    className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                      up
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {up ? (
                      <ArrowUp className="h-2.5 w-2.5" />
                    ) : (
                      <ArrowDown className="h-2.5 w-2.5" />
                    )}
                    {Math.abs(s.delta)}
                  </span>
                </div>
                <p className="mt-3 font-display text-[32px] leading-none text-ink-900">
                  {s.value}
                </p>
                <p className="mt-1.5 text-[10px] uppercase tracking-[0.16em] text-ink-700">
                  {s.label}
                </p>
                <p className="mt-0.5 text-[10px] text-ink-600">
                  vs yesterday
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Body */}
      <section className="-mt-6 px-7 md:px-12 pb-16">
        {/* Source sub-tab row: Gmail | SideShift */}
        <div
          className="rise rise-3 mb-3"
          role="tablist"
          aria-label="Inbox source"
        >
          <div className="inline-flex items-center gap-1 rounded-2xl bg-white/85 backdrop-blur p-1 shadow-card ring-1 ring-cloud-100">
            <button
              type="button"
              role="tab"
              aria-selected={source === "gmail"}
              onClick={() => setSource("gmail")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] transition ${
                source === "gmail"
                  ? "bg-cloud-sunset text-white shadow-card"
                  : "text-ink-600 hover:text-ink-900 hover:bg-cloud-50"
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              Gmail
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={source === "sideshift"}
              onClick={() => setSource("sideshift")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] transition ${
                source === "sideshift"
                  ? "bg-cloud-sunset text-white shadow-card"
                  : "text-ink-600 hover:text-ink-900 hover:bg-cloud-50"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              SideShift
            </button>
          </div>
        </div>

        {/* Tabs + search (Gmail only — SideShift has its own status semantics
            on each row, no global filter tabs needed in Wave 1) */}
        {source === "gmail" && (
        <div className="rise rise-3 mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <nav
            role="tablist"
            aria-label="Filter conversations"
            className="flex flex-wrap items-center gap-1 rounded-2xl bg-white/85 backdrop-blur p-1 shadow-card ring-1 ring-cloud-100"
          >
            {STATUS_TABS.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`relative flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] transition ${
                    active
                      ? "bg-cloud-sunset text-white shadow-card"
                      : "text-ink-600 hover:text-ink-900 hover:bg-cloud-50"
                  }`}
                >
                  {t.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                      active
                        ? "bg-white/25 text-white"
                        : "bg-cloud-100 text-cloud-700"
                    }`}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCompact((v) => !v)}
              aria-pressed={compact}
              title={compact ? "Show detail pane" : "Hide detail pane"}
              className="flex items-center gap-1.5 rounded-2xl bg-white/85 backdrop-blur px-3.5 py-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-ink-700 ring-1 ring-cloud-100 hover:bg-cloud-50 transition"
            >
              {compact ? (
                <PanelRightOpen className="h-3.5 w-3.5" />
              ) : (
                <PanelRightClose className="h-3.5 w-3.5" />
              )}
              {compact ? "Expand" : "Compact"}
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-2xl bg-white/85 backdrop-blur px-3.5 py-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-ink-700 ring-1 ring-cloud-100 hover:bg-cloud-50 transition"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter
            </button>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-600" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search brand, contact, message…"
                className="w-[280px] rounded-2xl bg-white/85 backdrop-blur pl-9 pr-3 py-2 text-[12.5px] text-ink-900 placeholder:text-ink-600 ring-1 ring-cloud-100 focus:outline-none focus:ring-2 focus:ring-cloud-300"
              />
            </div>
          </div>
        </div>
        )}

        {/* A.14s S2: empty-state banner when no drafts exist yet. Only shown
            on SideShift source so Gmail UX is untouched. */}
        {source === "sideshift" && drafts !== null && drafts.length === 0 && (
          <div className="rise rise-3 mb-3 rounded-2xl bg-iris-50/70 ring-1 ring-iris-100 px-4 py-2.5 text-[12px] text-iris-700">
            <span className="font-semibold">No drafts yet</span>{" "}
            <span className="text-ink-600">
              — run{" "}
              <code className="rounded bg-white/80 px-1 py-0.5 text-[11px]">
                npm run draft-sideshift
              </code>{" "}
              locally with{" "}
              <code className="rounded bg-white/80 px-1 py-0.5 text-[11px]">
                ANTHROPIC_API_KEY
              </code>{" "}
              set to populate{" "}
              <code className="rounded bg-white/80 px-1 py-0.5 text-[11px]">
                data/sideshift-drafts.jsonl
              </code>
              .
            </span>
          </div>
        )}

        {/* SideShift controls row — slimmer than Gmail's (no status tabs) */}
        {source === "sideshift" && (
          <div className="rise rise-3 mb-4 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCompact((v) => !v)}
              aria-pressed={compact}
              title={compact ? "Show detail pane" : "Hide detail pane"}
              className="flex items-center gap-1.5 rounded-2xl bg-white/85 backdrop-blur px-3.5 py-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-ink-700 ring-1 ring-cloud-100 hover:bg-cloud-50 transition"
            >
              {compact ? (
                <PanelRightOpen className="h-3.5 w-3.5" />
              ) : (
                <PanelRightClose className="h-3.5 w-3.5" />
              )}
              {compact ? "Expand" : "Compact"}
            </button>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-600" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search brand, campaign, message…"
                className="w-[280px] rounded-2xl bg-white/85 backdrop-blur pl-9 pr-3 py-2 text-[12.5px] text-ink-900 placeholder:text-ink-600 ring-1 ring-cloud-100 focus:outline-none focus:ring-2 focus:ring-cloud-300"
              />
            </div>
          </div>
        )}

        {/* Split pane: queue LEFT (60%) + detail RIGHT (40%) — branches on source */}
        <div
          className={`rise rise-4 grid gap-5 ${
            compact ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-[3fr_2fr]"
          }`}
        >
          <div className="min-w-0">
            {source === "gmail" ? (
              <MessageQueue tab={tab} search={search} selectedId={selectedId} />
            ) : (
              <SideShiftMessageQueue search={search} selectedId={selectedId} />
            )}
          </div>
          {!compact && (
            <div className="min-w-0 xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto">
              {source === "gmail" ? (
                <BrandResponseDetailPanel id={selectedId} variant="panel" />
              ) : (
                <>
                  <SideShiftDetailPanel id={selectedId} />
                  {/* A.14s S2: Draft Review panel — renders null when no
                      matching draft exists for the selected thread, so it's
                      invisible until a draft lands. HR-2 PRESERVE: purely
                      additive sibling of the detail panel. */}
                  <DraftReviewPanel
                    threadId={selectedId}
                    drafts={drafts ?? []}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function BrandResponsesPage() {
  return (
    <Suspense
      fallback={
        <div className="px-7 md:px-12 py-16 text-ink-700 text-sm">Loading inbox…</div>
      }
    >
      <BrandResponsesInner />
    </Suspense>
  );
}
