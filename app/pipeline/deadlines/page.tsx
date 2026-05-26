import {
  Calendar,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  CalendarClock,
  CalendarRange,
  CheckCircle2,
} from 'lucide-react';
import { ReadOnlyMirrorBadge } from '@/components/ui/read-only-mirror-badge';
import { MantraQuote } from '@/components/ui/mantra-quote';
import { StatStrip, ContentArea, RightRail } from '@/components/ui';
import { WeekHeatmap } from '@/components/deadlines/WeekHeatmap';
import { DeadlineStatCard } from '@/components/deadlines/DeadlineStatCard';
import { PrioritizedToDo } from '@/components/deadlines/PrioritizedToDo';
import { PaymentsDue } from '@/components/deadlines/PaymentsDue';
import { WhatsNextTimeline } from '@/components/deadlines/WhatsNextTimeline';
import { DeadlinesViewSwitcher } from '@/components/deadlines/DeadlinesViewSwitcher';
import { DEADLINE_STATS } from '@/lib/mock-data/deadlines';

// A.14n Wave 2b N3-MOBILE+SECONDARY — adopt StatStrip primitive for secondary
// 3-stat row per mockup #19 (pipeline-deadlines-calendar.png shows the
// "Due This Week / Due Next Week / Completed This Week" tiles in a tight
// inline density). HR-2 PRESERVE: heatmap + DeadlineStatCard for overdue/today
// pair (different visual treatment, larger tone tiles) untouched.

export const metadata = { title: 'Deadlines · UGC | Campaign HQ' };

export default function DeadlinesPage() {
  return (
    <>
      {/* Header */}
      <header className="header-cloud px-7 md:px-12 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/80 mb-2">
              Deadlines
            </p>
            <h1 className="font-display text-white text-3xl md:text-4xl leading-tight drop-shadow-sm">
              What&rsquo;s due. What&rsquo;s late. <em className="not-italic text-white/90">What&rsquo;s next.</em>
            </h1>
            <p className="mt-2 text-[13px] text-white/85 max-w-xl">
              Every overdue, today, this-week, and next-week deliverable — plus filming dates,
              follow-ups, and payments — in one calm view.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <ReadOnlyMirrorBadge />
            <MantraQuote />
          </div>
        </div>
      </header>

      <main className="px-7 md:px-12 py-6 space-y-8">
        {/* Quick actions row */}
        <section className="flex flex-wrap items-center justify-end gap-2 rise rise-1">
          <button className="inline-flex items-center gap-1.5 rounded-2xl border border-cloud-200 bg-white/85 px-3 py-2 text-[12.5px] font-semibold text-ink-700 hover:bg-cloud-50">
            Today
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-2xl border border-cloud-200 bg-white/85 px-3 py-2 text-[12.5px] font-semibold text-ink-700 hover:bg-cloud-50">
            <Calendar className="h-3.5 w-3.5 text-ink-400" />
            May 19, 2026
            <ChevronDown className="h-3 w-3 text-ink-400" />
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-2xl border border-cloud-200 bg-white/85 px-3 py-2 text-[12.5px] font-semibold text-ink-700 hover:bg-cloud-50">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-2xl bg-cloud-sunset px-3 py-2 text-[12.5px] font-semibold text-white shadow-soft hover:shadow-glow transition">
            <Plus className="h-3.5 w-3.5" />
            Add Deadline
          </button>
        </section>

        {/* Heatmap + stat cards */}
        <section className="grid grid-cols-12 gap-5 rise rise-2">
          <div className="col-span-12 xl:col-span-7">
            <WeekHeatmap />
          </div>
          <div className="col-span-12 xl:col-span-5 grid grid-cols-2 md:grid-cols-5 xl:grid-cols-2 gap-2">
            <DeadlineStatCard label="Overdue"  value={DEADLINE_STATS.overdue}  tone="red"    sub="Address ASAP" />
            <DeadlineStatCard label="Due Today" value={DEADLINE_STATS.dueToday} tone="orange" sub="May 19" />
          </div>
        </section>

        {/* Secondary 3-stat row — adopts N3-PRIMITIVES StatStrip (mockup #19 inline density) */}
        <section className="rise rise-3">
          <StatStrip
            tiles={[
              {
                number: DEADLINE_STATS.dueThisWeek,
                label: 'Due This Week',
                sub: 'May 13 – 19',
                accent: 'iris',
                icon: <CalendarClock className="h-4 w-4" />,
              },
              {
                number: DEADLINE_STATS.dueNextWeek,
                label: 'Due Next Week',
                sub: 'May 20 – 26',
                accent: 'cloud',
                icon: <CalendarRange className="h-4 w-4" />,
              },
              {
                number: DEADLINE_STATS.completedThisWeek,
                label: 'Completed This Week',
                sub: 'Already shipped',
                accent: 'green',
                icon: <CheckCircle2 className="h-4 w-4" />,
              },
            ]}
          />
        </section>

        {/* Tabs + filters + active view (Calendar | Timeline | List) */}
        <DeadlinesViewSwitcher />

        {/* Persistent sidebar widgets */}
        <section className="grid grid-cols-12 gap-6 rise rise-4">
          <div className="col-span-12 xl:col-span-8">
            <WhatsNextTimeline />
          </div>
          <aside className="col-span-12 xl:col-span-4 space-y-4">
            <PrioritizedToDo />
            <PaymentsDue />
          </aside>
        </section>
      </main>
    </>
  );
}
