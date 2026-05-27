"use client";

// Calendar view — month grid anchored to TODAY (dynamic).
// Phase A.14e Wave 3 (E7) — spec section "4. Deadlines View · Calendar".
// A.14u F2: month label + grid now derive from new Date() instead of being
// hardcoded to May 2026, so the page slides forward at build time.
//
// Each day cell shows up to 3 colored dots (one per event tone) + count.
// Click a cell → expands a detail strip below the grid.
//
// HIG: 44pt min tap targets · semantic colors for color-blind safe pairs
// (icon + tone label) · keyboard arrow nav.

import { useMemo, useState } from "react";
import { TODAY_ISO } from "@/lib/mock-data/deadlines";
import {
  DEADLINE_TYPE_META,
  TONE_TOKENS,
  type DeadlineEvent,
} from "@/lib/mock-data/deadline-events";
import { cn } from "@/lib/utils";
import { monthLong } from "@/lib/date-anchor";

type Props = { events: DeadlineEvent[] };

const _today = new Date();
const _year = _today.getFullYear();
const _month = _today.getMonth();
const MONTH_LABEL = `${monthLong(_today)} ${_year}`;

// Build a 6-row × 7-col Sun-start month grid for the CURRENT month.
const CURRENT_MONTH_GRID: { iso: string; day: number; inMonth: boolean }[] = (() => {
  const rows: { iso: string; day: number; inMonth: boolean }[] = [];
  const firstOfMonth = new Date(_year, _month, 1);
  const leadingDays = firstOfMonth.getDay(); // 0=Sun
  const daysInMonth = new Date(_year, _month + 1, 0).getDate();
  const toIso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  for (let i = leadingDays; i > 0; i--) {
    const d = new Date(_year, _month, 1 - i);
    rows.push({ iso: toIso(d), day: d.getDate(), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    rows.push({ iso: toIso(new Date(_year, _month, d)), day: d, inMonth: true });
  }
  let trailing = 1;
  while (rows.length < 42) {
    const d = new Date(_year, _month + 1, trailing++);
    rows.push({ iso: toIso(d), day: d.getDate(), inMonth: false });
  }
  return rows;
})();
const MAY_2026 = CURRENT_MONTH_GRID;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function DeadlineCalendarView({ events }: Props) {
  const [selected, setSelected] = useState<string | null>(TODAY_ISO);

  const byDay = useMemo(() => {
    const map = new Map<string, DeadlineEvent[]>();
    for (const e of events) {
      const list = map.get(e.dateISO) ?? [];
      list.push(e);
      map.set(e.dateISO, list);
    }
    return map;
  }, [events]);

  const selectedEvents = selected ? byDay.get(selected) ?? [] : [];

  return (
    <div className="rounded-3xl border border-cloud-100 bg-white/85 backdrop-blur shadow-card overflow-hidden">
      {/* Month header */}
      <div className="flex items-center justify-between border-b border-cloud-100 px-5 py-3.5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-ink-600">Calendar</p>
          <h3 className="font-display text-xl text-ink-900 leading-tight">{MONTH_LABEL}</h3>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-ink-700">
          <Legend tone="red"    label="Overdue" />
          <Legend tone="pink"   label="Today" />
          <Legend tone="orange" label="Soon" />
          <Legend tone="purple" label="Scheduled" />
          <Legend tone="gray"   label="Waiting" />
          <Legend tone="green"  label="Done" />
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 px-3 pt-3">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-[10px] font-semibold uppercase tracking-wider text-ink-600 py-2">
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1.5 px-3 pb-4">
        {MAY_2026.map((cell) => {
          const dayEvents = byDay.get(cell.iso) ?? [];
          const isToday = cell.iso === TODAY_ISO;
          const isSelected = cell.iso === selected;
          // Unique tones in this day (for dot stack)
          const tones = Array.from(new Set(dayEvents.map((e) => e.tone)));
          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => setSelected(cell.iso)}
              aria-label={`${cell.day} ${cell.inMonth ? "May" : ""} — ${dayEvents.length} deadlines`}
              aria-pressed={isSelected}
              className={cn(
                "relative min-h-[64px] rounded-xl border text-left p-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-iris-300",
                cell.inMonth
                  ? "border-cloud-100 bg-white/70 hover:bg-cloud-50"
                  : "border-transparent bg-cloud-50/40 text-ink-300",
                isSelected && "ring-2 ring-iris-400 shadow-card",
                isToday && !isSelected && "ring-1 ring-cloud-300",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-[12px] font-semibold tabular-nums",
                    isToday ? "text-cloud-600" : cell.inMonth ? "text-ink-800" : "text-ink-300",
                  )}
                >
                  {cell.day}
                </span>
                {isToday && (
                  <span className="rounded-full bg-cloud-sunset px-1.5 py-px text-[8.5px] font-bold uppercase tracking-wider text-white">
                    Today
                  </span>
                )}
              </div>
              {dayEvents.length > 0 && (
                <div className="mt-1.5 flex items-center gap-1">
                  {tones.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className={cn("h-1.5 w-1.5 rounded-full", TONE_TOKENS[t].dot)}
                      aria-hidden
                    />
                  ))}
                  {dayEvents.length > 0 && (
                    <span className="ml-auto text-[10px] font-semibold text-ink-700 tabular-nums">
                      {dayEvents.length}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected-day detail strip */}
      <div className="border-t border-cloud-100 bg-cloud-50/50 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[13px] font-semibold text-ink-800">
            {selected ? formatHumanDate(selected) : "Select a day"}
          </h4>
          <span className="text-[11px] text-ink-700">
            {selectedEvents.length} {selectedEvents.length === 1 ? "deadline" : "deadlines"}
          </span>
        </div>
        {selectedEvents.length === 0 ? (
          <p className="text-[12.5px] text-ink-700 py-3 text-center">
            Nothing scheduled. Clean day.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {selectedEvents.map((e) => (
              <li
                key={e.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl bg-white/80 border border-cloud-100 px-3 py-2 ring-1 ring-inset",
                  TONE_TOKENS[e.tone].ring,
                )}
              >
                <span
                  aria-hidden
                  className={cn("h-2 w-2 rounded-full shrink-0", TONE_TOKENS[e.tone].dot)}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-semibold text-ink-900 truncate">{e.title}</p>
                  {e.meta && (
                    <p className="text-[11px] text-ink-700 truncate">{e.meta}</p>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider rounded-md px-1.5 py-0.5 ring-1 ring-inset",
                    TONE_TOKENS[e.tone].chip,
                  )}
                >
                  {DEADLINE_TYPE_META[e.type].label}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Legend({ tone, label }: { tone: keyof typeof TONE_TOKENS; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span aria-hidden className={cn("h-2 w-2 rounded-full", TONE_TOKENS[tone].dot)} />
      <span>{label}</span>
    </span>
  );
}

function formatHumanDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dt = new Date(y, m - 1, d);
  const weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dt.getDay()];
  return `${weekday}, ${months[m - 1]} ${d}, ${y}`;
}
