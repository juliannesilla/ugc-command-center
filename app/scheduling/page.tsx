"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  Coffee,
  CalendarPlus,
  Globe2,
} from "lucide-react";
import { ReadOnlyMirrorBadge } from "@/components/ui/read-only-mirror-badge";
import { BRAND_CONVERSATIONS } from "@/lib/mock-data/brand-responses";

type CalEvent = {
  id: string;
  brand: string;
  contact: string;
  type: "discovery" | "kickoff" | "review" | "intro";
  day: number; // day of month
  start: string;
  end: string;
  color: "cloud" | "iris" | "peach";
};

// Derive a small calendar from conversations with confirmed call slots
function buildEvents(): CalEvent[] {
  const out: CalEvent[] = [];
  let dayCursor = 19; // current week start (May 19, 2026 = Tue per memory date)
  BRAND_CONVERSATIONS.filter((c) => c.callRequested).forEach((c, i) => {
    out.push({
      id: c.id,
      brand: c.brand,
      contact: c.contactName,
      type: i % 4 === 0 ? "discovery" : i % 3 === 0 ? "kickoff" : i % 2 === 0 ? "review" : "intro",
      day: dayCursor + (i % 5),
      start: ["9:00", "10:30", "11:00", "13:00", "14:30"][i % 5],
      end: ["9:30", "11:00", "11:30", "13:30", "15:00"][i % 5],
      color: (["cloud", "iris", "peach"] as const)[i % 3],
    });
  });
  return out;
}

const TIMES = [
  "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function SchedulingPage() {
  const events = useMemo(buildEvents, []);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Anchor week: May 18 (Mon) - 24 (Sun) 2026
  const weekStart = 18;

  const colorMap = {
    cloud: "bg-gradient-to-br from-cloud-200 to-cloud-400 text-white",
    iris: "bg-gradient-to-br from-iris-200 to-iris-400 text-white",
    peach: "bg-gradient-to-br from-peach-100 to-peach-500 text-ink-900",
  };

  const typeIcon = {
    discovery: <Coffee className="h-3 w-3" />,
    kickoff: <CalendarPlus className="h-3 w-3" />,
    review: <Video className="h-3 w-3" />,
    intro: <Coffee className="h-3 w-3" />,
  };

  return (
    <>
      {/* Header */}
      <section className="header-cloud px-8 pt-10 pb-12 text-white">
        <div className="flex items-start justify-between gap-6">
          <div className="rise rise-1">
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold opacity-90">
              Calendar · Week of May 18
            </p>
            <h1 className="mt-2 font-display text-[44px] leading-[1.05] tracking-tight">
              Call Scheduling
            </h1>
            <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-white/90">
              Discovery, kickoff and review calls — all in one view. Pick a slot
              to send to a brand, or block focus time for filming.
            </p>
          </div>
          <div className="rise rise-2">
            <ReadOnlyMirrorBadge />
          </div>
        </div>
      </section>

      <section className="-mt-6 px-8 pb-16">
        {/* Toolbar */}
        <div className="rise rise-2 mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-xl bg-white/85 ring-1 ring-cloud-100 hover:bg-cloud-50 transition"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4 text-ink-700" />
            </button>
            <button
              type="button"
              className="rounded-xl bg-white/85 px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-700 ring-1 ring-cloud-100 hover:bg-cloud-50 transition"
            >
              This Week
            </button>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-xl bg-white/85 ring-1 ring-cloud-100 hover:bg-cloud-50 transition"
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4 text-ink-700" />
            </button>
            <span className="ml-2 font-display text-[20px] text-ink-900">
              May 18 – 24, 2026
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
              <Globe2 className="h-3 w-3" />
              PT (UTC-7)
            </span>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-2xl bg-cloud-sunset px-3.5 py-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white shadow-card hover:shadow-soft transition"
            >
              <Plus className="h-3.5 w-3.5" />
              New Slot
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          {/* Calendar grid */}
          <div className="rise rise-3 overflow-hidden rounded-3xl bg-white/85 backdrop-blur shadow-card ring-1 ring-cloud-100">
            <div className="grid grid-cols-[60px_repeat(7,1fr)] bg-cloud-50/60 text-[10px] uppercase tracking-[0.14em] text-ink-500">
              <div className="px-3 py-3"></div>
              {WEEKDAYS.map((d, i) => {
                const date = weekStart + i;
                const isToday = date === 19; // today is May 19
                return (
                  <div
                    key={d}
                    className={`px-3 py-3 text-center ${
                      isToday ? "bg-cloud-100 text-cloud-700" : ""
                    }`}
                  >
                    <p className="font-semibold">{d}</p>
                    <p
                      className={`mt-0.5 font-display text-[18px] normal-case tracking-normal ${
                        isToday ? "text-cloud-700" : "text-ink-900"
                      }`}
                    >
                      {date}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="relative">
              {TIMES.map((t) => (
                <div
                  key={t}
                  className="grid grid-cols-[60px_repeat(7,1fr)] border-t border-cloud-100"
                >
                  <div className="px-3 py-3 text-right text-[10.5px] font-mono text-ink-400">
                    {t}
                  </div>
                  {WEEKDAYS.map((d, i) => {
                    const date = weekStart + i;
                    const slotEvents = events.filter(
                      (e) => e.day === date && e.start.startsWith(t.split(":")[0]),
                    );
                    const slotKey = `${date}-${t}`;
                    const isSelected = selectedSlot === slotKey;
                    return (
                      <button
                        type="button"
                        key={slotKey}
                        onClick={() => setSelectedSlot(slotKey)}
                        className={`relative h-16 border-l border-cloud-100 text-left transition ${
                          isSelected
                            ? "bg-cloud-50"
                            : "hover:bg-cloud-50/60"
                        }`}
                      >
                        {slotEvents.map((ev) => (
                          <span
                            key={ev.id}
                            className={`absolute inset-1 flex flex-col gap-0.5 rounded-xl px-2 py-1.5 shadow-card ${colorMap[ev.color]}`}
                          >
                            <span className="flex items-center gap-1 text-[9.5px] uppercase tracking-[0.12em] opacity-90">
                              {typeIcon[ev.type]}
                              {ev.type}
                            </span>
                            <span className="truncate text-[11.5px] font-semibold">
                              {ev.brand}
                            </span>
                            <span className="truncate text-[10px] opacity-80">
                              {ev.start}–{ev.end}
                            </span>
                          </span>
                        ))}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Time slot picker sidebar */}
          <aside className="rise rise-4 flex flex-col gap-5">
            <section className="rounded-3xl bg-white/85 backdrop-blur p-5 shadow-card ring-1 ring-cloud-100">
              <h3 className="text-[11px] uppercase tracking-[0.16em] font-semibold text-ink-700">
                Quick Slots
              </h3>
              <p className="mt-1 text-[12px] text-ink-500">
                Pick 3 to send to a brand
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Tue May 19 · 11:00 PT",
                  "Wed May 20 · 14:30 PT",
                  "Thu May 21 · 10:00 PT",
                  "Fri May 22 · 9:30 PT",
                  "Mon May 25 · 13:00 PT",
                ].map((slot) => (
                  <li key={slot}>
                    <button
                      type="button"
                      className="group w-full flex items-center justify-between rounded-2xl bg-cloud-50/60 px-3.5 py-2.5 text-[12.5px] hover:bg-cloud-100 transition"
                    >
                      <span className="font-mono text-ink-900">{slot}</span>
                      <Plus className="h-3.5 w-3.5 text-ink-400 group-hover:text-cloud-600" />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-4 w-full rounded-2xl bg-cloud-sunset px-3 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white shadow-card hover:shadow-soft transition"
              >
                Send Selected Slots
              </button>
            </section>

            <section className="rounded-3xl bg-iris-50 p-5 ring-1 ring-iris-100">
              <h3 className="text-[11px] uppercase tracking-[0.16em] font-semibold text-iris-500">
                Synced with
              </h3>
              <p className="mt-2 font-display text-[18px] text-ink-900">
                Google Calendar
              </p>
              <p className="mt-1 text-[12px] text-ink-600">
                Live two-way sync · MCP-connected
              </p>
            </section>
          </aside>
        </div>
      </section>
    </>
  );
}
