"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { StickyNote, ArrowUpRight } from "lucide-react";
import {
  BRAND_CONVERSATIONS,
  filterByTab,
  type BrandConversation,
  type TabKey,
} from "@/lib/mock-data/brand-responses";
import { ResponseDeadlineTicker } from "./ResponseDeadlineTicker";
import { StatusChip } from "@/components/ui/status-chip";

// A.14u F6: brand-fit score row (mirrors SideShiftMessageQueue.BrandFitScore).
// Sourced from data/brand-fit-scores.jsonl — joined by normalized brand name
// since Gmail mock conversations don't carry thread_id.
interface BrandFitScore {
  thread_id: string;
  brand: string;
  score: number;
  reasoning: string;
  niche_match: "strong" | "moderate" | "weak";
  brand_safety: "safe" | "review" | "avoid";
}

/** A.14u F6: Fit badge. Color band matches /brand-fit ranking page. */
function FitBadge({
  score,
  reasoning,
  niche,
  safety,
}: {
  score: number;
  reasoning?: string;
  niche?: string;
  safety?: string;
}) {
  const tone =
    score >= 8
      ? "bg-green-100 text-green-800 ring-green-200"
      : score >= 5
      ? "bg-yellow-100 text-yellow-800 ring-yellow-200"
      : "bg-red-100 text-red-800 ring-red-200";
  const tip = [
    `Fit ${score}/10`,
    niche && safety ? `${niche} / ${safety}` : null,
    reasoning,
  ]
    .filter(Boolean)
    .join(" — ");
  return (
    <span
      className={`inline-flex h-7 w-9 items-center justify-center rounded-lg ring-1 font-mono text-[12.5px] font-semibold tabular-nums transition-transform duration-150 ease-out hover:scale-110 cursor-help ${tone}`}
      title={tip}
      aria-label={`Brand fit score ${score} out of 10`}
    >
      {score}
    </span>
  );
}

function FitPlaceholder() {
  return (
    <span
      className="inline-flex h-7 w-9 items-center justify-center rounded-lg bg-cloud-50 text-ink-600 font-mono text-[12.5px] ring-1 ring-cloud-100"
      title="No brand-fit score for this brand yet"
      aria-label="Brand fit score not available"
    >
      —
    </span>
  );
}

/** Normalize brand name for lookup: lowercase, strip punctuation/whitespace. */
function normBrand(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

type Props = {
  tab: TabKey;
  search: string;
  /** Currently selected conversation id (from `?id=` search param). */
  selectedId?: string | null;
  /** Optional override for row-click: when provided, replaces the default
   * "push ?id=X to current URL" behavior — used by callers that want to
   * react to selection without route changes. */
  onSelect?: (id: string) => void;
};

const STATUS_TONE: Record<
  BrandConversation["status"],
  React.ComponentProps<typeof StatusChip>["tone"]
> = {
  new: "pink",
  "brief-requested": "yellow",
  "call-scheduled": "iris",
  "in-progress": "blue",
  "awaiting-reply": "orange",
  archived: "green",
};

const STATUS_LABEL: Record<BrandConversation["status"], string> = {
  new: "New",
  "brief-requested": "Brief Req'd",
  "call-scheduled": "Call Sched",
  "in-progress": "Drafting",
  "awaiting-reply": "Awaiting",
  archived: "Archived",
};

function avatarBg(seed: string) {
  const palettes = [
    "from-cloud-300 to-iris-300",
    "from-peach-300 to-cloud-300",
    "from-iris-200 to-cloud-400",
    "from-cloud-400 to-iris-400",
    "from-peach-100 to-iris-200",
  ];
  return palettes[seed.toLowerCase().charCodeAt(0) % palettes.length];
}

export function MessageQueue({ tab, search, selectedId, onSelect }: Props) {
  const router = useRouter();

  // A.14u F6: load brand-fit scores once and index by normalized brand name.
  // Gracefully empty if fetch fails — Fit column renders "—" placeholder.
  const [scoresByBrand, setScoresByBrand] = useState<Record<string, BrandFitScore>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/data/brand-fit-scores.jsonl", { cache: "no-store" });
        if (!res.ok) return;
        const txt = await res.text();
        const out: Record<string, BrandFitScore> = {};
        for (const line of txt.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const obj = JSON.parse(trimmed);
            if (
              obj &&
              typeof obj.brand === "string" &&
              typeof obj.score === "number"
            ) {
              const key = normBrand(obj.brand);
              // Keep highest score if duplicate brand names (e.g. MWM.ai x2)
              if (!out[key] || obj.score > out[key].score) {
                out[key] = obj as BrandFitScore;
              }
            }
          } catch {
            // skip schema-header / malformed lines
          }
        }
        if (!cancelled) setScoresByBrand(out);
      } catch {
        // silent — placeholder renders
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = (id: string) => {
    if (onSelect) {
      onSelect(id);
    } else {
      router.push(`/brand-responses?id=${id}`, { scroll: false });
    }
  };

  const filtered = BRAND_CONVERSATIONS.filter((c) => filterByTab(c, tab)).filter(
    (c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        c.brand.toLowerCase().includes(q) ||
        c.contactName.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
      );
    },
  );

  // A.14u F6: default sort by Fit DESC (best fits at top). Brands without a
  // score sink to the bottom but preserve their relative order.
  const rows = [...filtered].sort((a, b) => {
    const sa = scoresByBrand[normBrand(a.brand)]?.score ?? -1;
    const sb = scoresByBrand[normBrand(b.brand)]?.score ?? -1;
    return sb - sa;
  });

  return (
    <div className="overflow-hidden rounded-3xl bg-white/85 backdrop-blur shadow-card ring-1 ring-cloud-100">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="bg-cloud-50/60 text-[10px] uppercase tracking-[0.16em] text-ink-700">
              <Th>Brand / Contact</Th>
              <Th>Fit</Th>
              <Th>Message Received</Th>
              <Th>Response Needed</Th>
              <Th>Draft Status</Th>
              <Th>Follow-Up</Th>
              <Th className="text-right pr-5">Notes</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-16 text-center text-ink-700 italic"
                >
                  No conversations match this filter yet.
                </td>
              </tr>
            )}
            {rows.map((c) => {
              const isActive = selectedId === c.id;
              const followUp = new Date(c.receivedAt);
              followUp.setDate(followUp.getDate() + 3);
              const fit = scoresByBrand[normBrand(c.brand)] ?? null;
              return (
                <tr
                  key={c.id}
                  onClick={() => handleSelect(c.id)}
                  aria-selected={isActive}
                  // A.14o W2-S4 microinteractions: Saffer §3 Feedback — explicit
                  // transition properties for row hover state-shift (Kowalski:
                  // avoid `transition: all`, prefer named properties + 150ms).
                  className={`group border-t border-cloud-100 transition-colors duration-150 ease-out cursor-pointer ${
                    isActive
                      ? "bg-cloud-50 ring-2 ring-inset ring-cloud-300"
                      : c.unread
                      ? "bg-white hover:bg-cloud-50/50"
                      : "bg-white/60 hover:bg-cloud-50/40"
                  }`}
                >
                  <td className="px-5 py-3.5 align-middle">
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${avatarBg(
                          c.logoSeed,
                        )} text-white font-display text-[14px] shadow-card`}
                        aria-hidden
                      >
                        {c.logoSeed.toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          {c.unread && (
                            <span
                              aria-hidden
                              className="inline-block h-1.5 w-1.5 rounded-full bg-cloud-500"
                            />
                          )}
                          <p
                            className={`truncate ${
                              c.unread
                                ? "font-semibold text-ink-900"
                                : "text-ink-700"
                            }`}
                          >
                            {c.brand}
                          </p>
                        </div>
                        <p className="truncate text-[11.5px] text-ink-700">
                          {c.contactName} · {c.contactRole}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 align-middle">
                    {fit ? (
                      <FitBadge
                        score={fit.score}
                        reasoning={fit.reasoning}
                        niche={fit.niche_match}
                        safety={fit.brand_safety}
                      />
                    ) : (
                      <FitPlaceholder />
                    )}
                  </td>
                  <td className="px-5 py-3.5 align-middle">
                    <div className="max-w-[24rem]">
                      <p className="truncate text-ink-700">{c.lastMessage}</p>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-ink-600">
                        {c.lastMessageAt}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 align-middle">
                    <ResponseDeadlineTicker
                      label={c.responseDeadline}
                      hoursLeft={c.deadlineHoursLeft}
                    />
                  </td>
                  <td className="px-5 py-3.5 align-middle">
                    <StatusChip tone={STATUS_TONE[c.status]}>
                      {STATUS_LABEL[c.status]}
                    </StatusChip>
                  </td>
                  <td className="px-5 py-3.5 align-middle text-ink-600 font-mono text-[12px]">
                    {c.status === "archived"
                      ? "—"
                      : followUp.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                  </td>
                  <td className="px-5 py-3.5 align-middle text-right">
                    <div className="inline-flex items-center gap-2">
                      {c.notes && (
                        <span className="inline-flex items-center gap-1 text-ink-700">
                          <StickyNote className="h-3.5 w-3.5" />
                          <span className="text-[11.5px]">1</span>
                        </span>
                      )}
                      <Link
                        href={`/brand-responses/${c.id}`}
                        onClick={(e) => e.stopPropagation()}
                        // A.14o W2-S4: Saffer §3 Feedback — button-press affordance
                        // (active:scale) + reveal on row hover with named transition.
                        className="inline-flex items-center gap-1 rounded-xl bg-cloud-100 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-cloud-700 opacity-0 group-hover:opacity-100 transition-[opacity,transform] duration-150 ease-out active:scale-[0.97] hover:bg-cloud-200"
                      >
                        Open
                        <ArrowUpRight className="h-3 w-3 transition-transform duration-150 ease-out group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-5 py-3 font-semibold text-left ${className ?? ""}`}
      scope="col"
    >
      {children}
    </th>
  );
}
