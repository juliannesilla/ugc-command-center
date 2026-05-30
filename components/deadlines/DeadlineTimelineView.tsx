"use client";

// Timeline view — vertical date-grouped list with color-coded markers.
// Phase A.14e Wave 3 (E7) — spec section "4. Deadlines View · Timeline".
//
// Groups events by date · sort: overdue → today → tomorrow → this-week →
// future. Each row shows type icon, brand, title, meta, and tone chip.
// Empty state if zero events in next 30 days.

import { useMemo } from "react";
import {
  Bell, DollarSign, FileSignature, FileText, MessageSquare, Phone, Repeat,
  Scissors, Send, Sparkles, Upload, Video,
} from "lucide-react";
import { TODAY_ISO } from "@/lib/mock-data/deadlines";
import {
  DEADLINE_TYPE_META,
  TONE_TOKENS,
  type DeadlineEvent,
  type DeadlineType,
} from "@/lib/mock-data/deadline-events";
import { cn } from "@/lib/utils";

type Props = { events: DeadlineEvent[] };

const ICONS: Record<DeadlineType, React.ComponentType<{ className?: string }>> = {
  response: MessageSquare,
  call: Phone,
  sow_review: FileSignature,
  script: FileText,
  film: Video,
  edit: Scissors,
  submission: Upload,
  posting: Send,
  follow_up: Bell,
  payment: DollarSign,
  revision: Repeat,
};

export function DeadlineTimelineView({ events }: Props) {
  // Group by relative bucket label, preserving sorted order.
  const buckets = useMemo(() => {
    const groups = new Map<string, DeadlineEvent[]>();
    for (const e of events) {
      const key = bucketLabel(e.daysFromToday, e.dateISO);
      const list = groups.get(key) ?? [];
      list.push(e);
      groups.set(key, list);
    }
    return Array.from(groups.entries());
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="rounded-3xl border border-cloud-100 bg-white/85 backdrop-blur shadow-card p-10 text-center">
        <Sparkles className="mx-auto h-7 w-7 text-iris-400 mb-3" />
        <p className="font-display text-xl text-ink-900 mb-1">All clear.</p>
        <p className="text-[13px] text-ink-700">No upcoming deadlines in the next 30 days.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-cloud-100 bg-white/85 backdrop-blur shadow-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-cloud-100 px-5 py-3.5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-ink-600">Timeline</p>
          <h3 className="font-display text-xl text-ink-900 leading-tight">
            {events.length} {events.length === 1 ? "deadline" : "deadlines"} ahead
          </h3>
        </div>
        <p className="text-[11px] text-ink-700">
          Sorted: overdue → today → soon → future
        </p>
      </div>

      <ol className="relative">
        {/* Vertical guide rail */}
        <div className="absolute left-[34px] top-2 bottom-2 w-px bg-cloud-100" aria-hidden />

        {buckets.map(([label, group]) => (
          <li key={label} className="relative">
            {/* Bucket header */}
            <div className="flex items-center gap-3 px-5 pt-4 pb-2">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full ring-4 ring-white relative z-10",
                  label === "Overdue" ? "bg-red-500"
                  : label === "Today" ? "bg-iris-500"
                  : label.startsWith("Tomorrow") ? "bg-orange-500"
                  : "bg-iris-400",
                )}
              />
              <h4 className="font-display text-[15px] text-ink-900">{label}</h4>
              <span className="text-[10.5px] font-semibold text-ink-600 tabular-nums">
                ({group.length})
              </span>
            </div>

            <ul className="space-y-1.5 px-5 pb-3 pl-[58px]">
              {group.map((e) => {
                const Icon = ICONS[e.type];
                return (
                  <li
                    key={e.id}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl border border-cloud-100 bg-white/80 px-3 py-2.5 ring-1 ring-inset hover:bg-cloud-50 transition",
                      TONE_TOKENS[e.tone].ring,
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                        TONE_TOKENS[e.tone].chip,
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <p className="text-[12.5px] font-semibold text-ink-900 truncate">
                          {e.title}
                        </p>
                        <span className="text-[10.5px] text-ink-600 tabular-nums shrink-0">
                          {formatShortDate(e.dateISO)}
                        </span>
                      </div>
                      {e.meta && (
                        <p className="text-[11px] text-ink-700 truncate">{e.meta}</p>
                      )}
                    </div>

                    <span
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset shrink-0",
                        TONE_TOKENS[e.tone].chip,
                      )}
                    >
                      {DEADLINE_TYPE_META[e.type].label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

function bucketLabel(days: number, iso: string): string {
  if (days < 0) return "Overdue";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days <= 7) return "This week";
  if (days <= 14) return "Next week";
  return formatLongDate(iso);
}

function formatShortDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[m - 1]} ${d}`;
}

function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  if (y === 2026 && new Date(`${TODAY_ISO}T00:00:00`).getFullYear() === 2026) {
    return `${months[m - 1]} ${d}`;
  }
  return `${months[m - 1]} ${d}, ${y}`;
}
