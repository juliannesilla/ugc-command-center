'use client';

// A.14t T1-CALENDAR — CalendarGrid: monthly grid view with deadline pins.
//
// Skills cited (HR-21):
//   - frontend-design       (PRIMARY: composition + chrome + visual rhythm)
//   - vercel:nextjs         (client component contract, Link usage)
//   - data:create-viz       (calendar = data-viz; cells = bins, pins = encoded type)
//   - refactoring-ui:refactoring-ui  (grayscale-first, restrained palette, spacing scale)
//   - microinteractions     (hover state, day-cell selection feedback, < > nav)
//   - superpowers:verification-before-completion (runtime sanity on date math)
//
// HR-30 layout note: this component is a sub-block; the route's PageHeader
// carries the TL;DR / action context. CalendarGrid stays focused on the grid.
//
// Behavior:
//   - Default month is derived from TODAY_ISO (lib/date-anchor — dynamic) so
//     the current month renders on first paint.
//   - < / > arrows step ±1 month; a "Today" pill jumps back to TODAY_ISO month.
//   - Each cell shows date number, plus up to 3 type-colored dots when
//     deadlines exist on that date. >3 deadlines render "+N" overflow.
//   - Selecting a cell expands a right-side mini-list of that day's events.
//   - Each event row is a Next <Link> to /campaigns/[slug] (slug = brand
//     lowercase mapping). When the event's brand doesn't match a known
//     campaign slug, the row degrades gracefully to a non-link (cursor:default).

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type DeadlineEvent,
  type DeadlineType,
  DEADLINE_TYPE_META,
  TONE_TOKENS,
} from '@/lib/mock-data/deadline-events';
import { DeadlinePin } from './DeadlinePin';

// --- date helpers (pure, no Date locale gotchas — we treat YYYY-MM-DD as wall time) ---

function ymd(y: number, m: number, d: number): string {
  const mm = String(m + 1).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}

function parseISO(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m: m - 1, d };
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Build a 6-row × 7-col grid for a given month, including leading/trailing
// days from adjacent months to fill the boundary cells (gray text).
function buildMonthGrid(year: number, monthIdx: number) {
  const firstOfMonth = new Date(year, monthIdx, 1);
  const startWeekday = firstOfMonth.getDay(); // 0 = Sun
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const prevMonthDays = new Date(year, monthIdx, 0).getDate();

  const cells: { iso: string; y: number; m: number; d: number; outside: boolean }[] = [];

  // leading (from prev month)
  for (let i = startWeekday - 1; i >= 0; i -= 1) {
    const d = prevMonthDays - i;
    const prevM = monthIdx === 0 ? 11 : monthIdx - 1;
    const prevY = monthIdx === 0 ? year - 1 : year;
    cells.push({ iso: ymd(prevY, prevM, d), y: prevY, m: prevM, d, outside: true });
  }
  // current month
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push({ iso: ymd(year, monthIdx, d), y: year, m: monthIdx, d, outside: false });
  }
  // trailing — fill to 42 cells (6 rows)
  let nextD = 1;
  while (cells.length < 42) {
    const nextM = monthIdx === 11 ? 0 : monthIdx + 1;
    const nextY = monthIdx === 11 ? year + 1 : year;
    cells.push({ iso: ymd(nextY, nextM, nextD), y: nextY, m: nextM, d: nextD, outside: true });
    nextD += 1;
  }
  return cells;
}

// Map brand strings to known campaign slugs. Brands not in the registry
// won't be clickable — falls back to non-link rendering.
const BRAND_TO_SLUG: Record<string, string> = {
  'elf cosmetics': 'elf',
  'e.l.f. cosmetics': 'elf',
  parakeetai: 'parakeetai',
  'lotus shop': 'lotusshop',
  lotusshop: 'lotusshop',
  'goodie ai': 'goodie-ai',
  'goodie-ai': 'goodie-ai',
  goodieai: 'goodie-ai',
  megprime: 'megprime-pay',
  'megprime pay': 'megprime-pay',
  'megprime-pay': 'megprime-pay',
  vilo: 'vilo',
};

function brandToSlug(brand: string): string | null {
  return BRAND_TO_SLUG[brand.toLowerCase().trim()] ?? null;
}

// Ordering for the legend / pin priority inside a cell. Most-urgent types first.
const TYPE_PRIORITY: DeadlineType[] = [
  'submission',
  'posting',
  'revision',
  'film',
  'payment',
  'response',
  'call',
  'sow_review',
  'script',
  'edit',
  'follow_up',
];

function sortByPriority(events: DeadlineEvent[]): DeadlineEvent[] {
  return [...events].sort((a, b) => {
    const ai = TYPE_PRIORITY.indexOf(a.type);
    const bi = TYPE_PRIORITY.indexOf(b.type);
    return ai - bi;
  });
}

export interface CalendarGridProps {
  events: DeadlineEvent[];
  /** TODAY_ISO from the mock data layer — drives "today" highlight + default month. */
  todayISO: string;
}

export function CalendarGrid({ events, todayISO }: CalendarGridProps) {
  const today = parseISO(todayISO);
  const [cursor, setCursor] = useState<{ year: number; monthIdx: number }>({
    year: today.y,
    monthIdx: today.m,
  });
  const [selectedISO, setSelectedISO] = useState<string>(todayISO);

  // Bucket events by ISO date — single pass, O(N).
  const eventsByDate = useMemo(() => {
    const map = new Map<string, DeadlineEvent[]>();
    for (const e of events) {
      const list = map.get(e.dateISO);
      if (list) list.push(e);
      else map.set(e.dateISO, [e]);
    }
    return map;
  }, [events]);

  const cells = useMemo(
    () => buildMonthGrid(cursor.year, cursor.monthIdx),
    [cursor.year, cursor.monthIdx],
  );

  const monthLabel = `${MONTH_NAMES[cursor.monthIdx]} ${cursor.year}`;

  const selectedEvents = sortByPriority(eventsByDate.get(selectedISO) ?? []);

  const prevMonth = () =>
    setCursor(c => (c.monthIdx === 0
      ? { year: c.year - 1, monthIdx: 11 }
      : { year: c.year, monthIdx: c.monthIdx - 1 }));

  const nextMonth = () =>
    setCursor(c => (c.monthIdx === 11
      ? { year: c.year + 1, monthIdx: 0 }
      : { year: c.year, monthIdx: c.monthIdx + 1 }));

  const jumpToday = () => {
    setCursor({ year: today.y, monthIdx: today.m });
    setSelectedISO(todayISO);
  };

  return (
    <section className="grid grid-cols-12 gap-6">
      {/* ─── Grid (8 cols on xl) ───────────────────────────────────────── */}
      <div className="col-span-12 xl:col-span-8 rounded-3xl border border-cloud-100 bg-white/85 backdrop-blur-xl shadow-soft p-5">
        {/* Toolbar — month label + nav + today */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-3">
            <h2 className="font-display text-[22px] tracking-tight text-ink-900">
              {monthLabel}
            </h2>
            <span className="text-[11px] uppercase tracking-[0.18em] text-ink-700">
              {events.length} deadlines tracked
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={jumpToday}
              className="rounded-full border border-cloud-200 bg-white/85 px-3 py-1.5 text-[11.5px] font-semibold text-ink-700 hover:bg-cloud-50 transition-colors"
              aria-label="Jump to today"
            >
              Today
            </button>
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Previous month"
              className="grid place-items-center h-8 w-8 rounded-full border border-cloud-200 bg-white/85 text-ink-600 hover:bg-cloud-50 hover:text-ink-900 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
              className="grid place-items-center h-8 w-8 rounded-full border border-cloud-200 bg-white/85 text-ink-600 hover:bg-cloud-50 hover:text-ink-900 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Day-of-week header */}
        <div className="grid grid-cols-7 gap-1 mb-1.5">
          {DAY_LABELS.map(d => (
            <div
              key={d}
              className="text-center text-[10.5px] uppercase tracking-[0.18em] text-ink-700 font-semibold"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grid cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map(cell => {
            const cellEvents = eventsByDate.get(cell.iso) ?? [];
            const sortedEvents = sortByPriority(cellEvents);
            const isToday = cell.iso === todayISO;
            const isSelected = cell.iso === selectedISO;
            const visiblePins = sortedEvents.slice(0, 3);
            const overflow = sortedEvents.length - visiblePins.length;

            return (
              <button
                key={cell.iso}
                type="button"
                onClick={() => setSelectedISO(cell.iso)}
                aria-pressed={isSelected}
                aria-label={`${cell.iso}${cellEvents.length > 0 ? `, ${cellEvents.length} deadline${cellEvents.length === 1 ? '' : 's'}` : ''}${isToday ? ', today' : ''}`}
                className={cn(
                  'group relative aspect-square min-h-[68px] rounded-xl border text-left p-1.5 transition-all duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-cloud-300 focus-visible:ring-offset-1',
                  cell.outside
                    ? 'border-transparent bg-transparent text-ink-300'
                    : 'border-cloud-100 bg-white/60 hover:bg-cloud-50 hover:border-cloud-200 text-ink-700',
                  isSelected && !cell.outside && 'ring-2 ring-cloud-400 bg-cloud-50 shadow-card',
                  isToday && !cell.outside && 'border-cloud-sunset/40',
                )}
              >
                {/* Day number — today gets the sunset pill */}
                <div className="flex items-start justify-between">
                  <span
                    className={cn(
                      'text-[12.5px] font-semibold leading-none',
                      isToday && !cell.outside
                        ? 'inline-grid place-items-center h-5 w-5 rounded-full bg-cloud-sunset text-white text-[11px] shadow-soft'
                        : '',
                    )}
                  >
                    {cell.d}
                  </span>
                  {sortedEvents.length > 0 && !cell.outside && (
                    <span className="text-[9.5px] uppercase tracking-[0.14em] text-ink-600 font-semibold">
                      {sortedEvents.length}
                    </span>
                  )}
                </div>

                {/* Pin row */}
                {visiblePins.length > 0 && !cell.outside && (
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 flex flex-wrap items-center gap-1">
                    {visiblePins.map(ev => (
                      <DeadlinePin key={ev.id} type={ev.type} size="sm" />
                    ))}
                    {overflow > 0 && (
                      <span className="text-[9.5px] font-semibold text-ink-700 leading-none">
                        +{overflow}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-5 pt-4 border-t border-cloud-100 flex flex-wrap items-center gap-3 text-[10.5px] text-ink-700">
          <span className="uppercase tracking-[0.14em] font-semibold">Legend</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-orange-500" /> Filming
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" /> Submission · Posting · Revision
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Payment
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-iris-500" /> Call · SOW · Script · Edit
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-pink-500" /> Response
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-ink-400" /> Follow-up
          </span>
        </div>
      </div>

      {/* ─── Right rail: selected day's mini-list ─────────────────────── */}
      <aside className="col-span-12 xl:col-span-4">
        <div className="rounded-3xl border border-cloud-100 bg-white/85 backdrop-blur-xl shadow-soft p-5 sticky top-4">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="font-display text-[15px] text-ink-900 tracking-tight">
              {formatLongDate(selectedISO)}
            </h3>
            <span className="text-[10.5px] uppercase tracking-[0.16em] text-ink-700 font-semibold">
              {selectedEvents.length === 0
                ? 'Open day'
                : `${selectedEvents.length} ${selectedEvents.length === 1 ? 'item' : 'items'}`}
            </span>
          </div>

          {selectedEvents.length === 0 ? (
            <div className="rounded-2xl bg-cloud-50/70 border border-dashed border-cloud-200 p-4 text-[12.5px] text-ink-700 flex items-start gap-2">
              <Circle className="h-3.5 w-3.5 mt-0.5 text-ink-600 shrink-0" />
              <span>No deadlines on this day. Breathing room — use it.</span>
            </div>
          ) : (
            <ul className="space-y-2">
              {selectedEvents.map(ev => {
                const slug = brandToSlug(ev.brand);
                const meta = DEADLINE_TYPE_META[ev.type];
                const tone = TONE_TOKENS[ev.tone];
                const inner = (
                  <div
                    className={cn(
                      'group rounded-2xl border border-cloud-100 bg-white/85 p-3 transition-all duration-200 ease-out',
                      slug && 'hover:bg-cloud-50 hover:border-cloud-200 hover:translate-x-[1px]',
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <DeadlinePin type={ev.type} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={cn(
                            'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] ring-1',
                            tone.chip,
                          )}>
                            {meta.label}
                          </span>
                        </div>
                        <div className="text-[12.5px] font-medium text-ink-900 truncate">
                          {ev.title}
                        </div>
                        {ev.meta && (
                          <div className="text-[11px] text-ink-700 truncate mt-0.5">
                            {ev.meta}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
                return (
                  <li key={ev.id}>
                    {slug ? (
                      <Link
                        href={`/campaigns/${slug}`}
                        className="block outline-none focus-visible:ring-2 focus-visible:ring-cloud-300 focus-visible:ring-offset-1 rounded-2xl"
                      >
                        {inner}
                      </Link>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <p className="mt-4 text-[10.5px] uppercase tracking-[0.16em] text-ink-700 font-semibold">
            Tap a day to expand · Click a row to open the campaign
          </p>
        </div>
      </aside>
    </section>
  );
}

function formatLongDate(iso: string): string {
  const { y, m, d } = parseISO(iso);
  return `${MONTH_NAMES[m]} ${d}, ${y}`;
}
