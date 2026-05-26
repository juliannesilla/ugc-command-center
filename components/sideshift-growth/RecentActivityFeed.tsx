/**
 * RecentActivityFeed — chronological event list for SideShift Growth dashboard.
 *
 * Source: mockup #20 (bottom-middle "Recent Activity" card).
 * Wave 2b A.14n N3-SIDESHIFT-REBUILD.
 *
 * hooked-ux skill: this is the VARIABLE-REWARD surface for the page.
 *   - Tribe: brand accepted/reviewed/invited
 *   - Hunt:  payout cleared / new invite
 *   - Loads next trigger: "View all activity" CTA seeds another visit.
 */

import {
  Mail,
  CheckCircle2,
  Star,
  Wallet,
  ShieldCheck,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RECENT_ACTIVITY, type ActivityEvent } from '@/lib/mock-data/sideshift-growth';

const ICONS: Record<ActivityEvent['kind'], LucideIcon> = {
  invite: Mail,
  accepted: CheckCircle2,
  verified: ShieldCheck,
  payout: Wallet,
  review: Star,
};

const KIND_TONE: Record<ActivityEvent['kind'], string> = {
  invite:   'bg-iris-50 text-iris-600 ring-iris-100',
  accepted: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  verified: 'bg-cloud-50 text-cloud-700 ring-cloud-100',
  payout:   'bg-pink-50 text-pink-600 ring-pink-100',
  review:   'bg-amber-50 text-amber-600 ring-amber-100',
};

export function RecentActivityFeed() {
  return (
    <section
      aria-labelledby="recent-activity-heading"
      className="glass-card rounded-2xl p-6 shadow-card"
    >
      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <h2
            id="recent-activity-heading"
            className="section-title font-display text-lg font-semibold text-ink-900"
          >
            Recent Activity
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">
            Last 72 hours · {RECENT_ACTIVITY.length} events
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] font-semibold text-cloud-700 hover:text-cloud-sunset transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cloud-sunset focus-visible:ring-offset-1 rounded"
        >
          View all
          <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>

      <ul className="space-y-3">
        {RECENT_ACTIVITY.map((event) => {
          const Icon = ICONS[event.kind];
          return (
            <li
              key={event.id}
              className="flex items-start gap-3 group"
            >
              <span
                aria-hidden
                className={cn(
                  'grid h-8 w-8 shrink-0 place-items-center rounded-xl ring-1 transition group-hover:scale-105',
                  KIND_TONE[event.kind],
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-ink-900 leading-snug">
                  <span className="font-semibold">{event.brand}</span>{' '}
                  <span className="text-ink-700">{event.message}</span>
                </p>
                <p className="mt-0.5 text-[11px] text-ink-400 font-medium tabular-nums">
                  {event.timeAgo}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
