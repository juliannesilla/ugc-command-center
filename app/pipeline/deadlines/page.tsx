import {
  Calendar,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  List as ListIcon,
  CalendarDays,
  GanttChart,
} from 'lucide-react';
import { Sidebar } from '@/components/ui/sidebar';
import { ReadOnlyMirrorBadge } from '@/components/ui/read-only-mirror-badge';
import { MantraQuote } from '@/components/ui/mantra-quote';
import { WeekHeatmap } from '@/components/deadlines/WeekHeatmap';
import { DeadlineStatCard } from '@/components/deadlines/DeadlineStatCard';
import { UpcomingDeliverablesList } from '@/components/deadlines/UpcomingDeliverablesList';
import { BrandFollowupsList } from '@/components/deadlines/BrandFollowupsList';
import { UpcomingFilmingDates } from '@/components/deadlines/UpcomingFilmingDates';
import { PrioritizedToDo } from '@/components/deadlines/PrioritizedToDo';
import { PaymentsDue } from '@/components/deadlines/PaymentsDue';
import { WhatsNextTimeline } from '@/components/deadlines/WhatsNextTimeline';
import { DEADLINE_STATS } from '@/lib/mock-data/deadlines';
import { cn } from '@/lib/utils';

export const metadata = { title: 'Deadlines · Julianne UGC' };

const TABS = [
  { label: 'Deadlines', icon: ListIcon, active: true },
  { label: 'Calendar', icon: CalendarDays, active: false },
  { label: 'Timeline', icon: GanttChart, active: false },
];

export default function DeadlinesPage() {
  return (
    <div className="flex min-h-screen bg-cloud-soft">
      <Sidebar />

      <div className="flex-1 min-w-0">
        {/* Header */}
        <header className="header-cloud px-6 md:px-8 py-6">
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

        <main className="px-6 md:px-8 py-6 space-y-6">
          {/* Tabs + actions row */}
          <section className="flex flex-wrap items-center justify-between gap-3 rise rise-1">
            <div className="flex gap-1 rounded-2xl bg-white/70 backdrop-blur p-1.5 border border-cloud-100 shadow-card">
              {TABS.map(t => (
                <button
                  key={t.label}
                  type="button"
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition',
                    t.active
                      ? 'bg-cloud-sunset text-white shadow-card'
                      : 'text-ink-600 hover:bg-cloud-50 hover:text-ink-900',
                  )}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
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
            </div>
          </section>

          {/* Heatmap + stat cards */}
          <section className="grid grid-cols-12 gap-4 rise rise-2">
            <div className="col-span-12 xl:col-span-7">
              <WeekHeatmap />
            </div>
            <div className="col-span-12 xl:col-span-5 grid grid-cols-2 md:grid-cols-5 xl:grid-cols-2 gap-2">
              <DeadlineStatCard label="Overdue"  value={DEADLINE_STATS.overdue}  tone="red"    sub="Address ASAP" />
              <DeadlineStatCard label="Due Today" value={DEADLINE_STATS.dueToday} tone="orange" sub="May 19" />
            </div>
          </section>

          <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 rise rise-3">
            <DeadlineStatCard label="Due This Week"     value={DEADLINE_STATS.dueThisWeek}      tone="iris"  sub="May 13 – 19" />
            <DeadlineStatCard label="Due Next Week"     value={DEADLINE_STATS.dueNextWeek}      tone="cloud" sub="May 20 – 26" />
            <DeadlineStatCard label="Completed This Week" value={DEADLINE_STATS.completedThisWeek} tone="green" sub="Already shipped" />
          </section>

          {/* Main + sidebar */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 xl:col-span-8 space-y-6 rise rise-4">
              <UpcomingDeliverablesList />
              <BrandFollowupsList />
              <UpcomingFilmingDates />
            </div>

            <aside className="col-span-12 xl:col-span-4 space-y-4 rise rise-4">
              <PrioritizedToDo />
              <PaymentsDue />
              <WhatsNextTimeline />
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
