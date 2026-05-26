"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { StickyNote, ArrowUpRight } from "lucide-react";
import {
  BRAND_CONVERSATIONS,
  filterByTab,
  type BrandConversation,
  type TabKey,
} from "@/lib/mock-data/brand-responses";
import { ResponseDeadlineTicker } from "./ResponseDeadlineTicker";
import { StatusChip } from "@/components/ui/status-chip";

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

  const handleSelect = (id: string) => {
    if (onSelect) {
      onSelect(id);
    } else {
      router.push(`/brand-responses?id=${id}`, { scroll: false });
    }
  };

  const rows = BRAND_CONVERSATIONS.filter((c) => filterByTab(c, tab)).filter(
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

  return (
    <div className="overflow-hidden rounded-3xl bg-white/85 backdrop-blur shadow-card ring-1 ring-cloud-100">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="bg-cloud-50/60 text-[10px] uppercase tracking-[0.16em] text-ink-500">
              <Th>Brand / Contact</Th>
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
                  colSpan={6}
                  className="px-5 py-16 text-center text-ink-500 italic"
                >
                  No conversations match this filter yet.
                </td>
              </tr>
            )}
            {rows.map((c) => {
              const isActive = selectedId === c.id;
              const followUp = new Date(c.receivedAt);
              followUp.setDate(followUp.getDate() + 3);
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
                        <p className="truncate text-[11.5px] text-ink-500">
                          {c.contactName} · {c.contactRole}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 align-middle">
                    <div className="max-w-[24rem]">
                      <p className="truncate text-ink-700">{c.lastMessage}</p>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-ink-400">
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
                        <span className="inline-flex items-center gap-1 text-ink-500">
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
