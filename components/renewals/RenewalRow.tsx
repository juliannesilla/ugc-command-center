'use client';

// Renewals · single row card with "Send renewal pitch" CTA.
//
// Source: A.14t T3 — pairs with app/pipeline/renewals/page.tsx.
// Renders one brand-level row (deduped across deliverables by the page).
//
// Interaction: clicking "Send renewal pitch" routes to the compose-message
// surface with a renewal template pre-loaded. Until the compose route lands,
// CTA links to /inbox?compose=renewal&brand=<slug> as a graceful fallback.

import Link from 'next/link';
import { Send, Calendar, DollarSign, CreditCard } from 'lucide-react';
import { StatusChip } from '@/components/ui/status-chip';
import type { PaymentPlatform } from '@/lib/mock-data/payments';

export interface RenewalRowData {
  campaign_id: string;
  brand: string;
  campaign_name: string;
  /** ISO yyyy-mm-dd. */
  paid_date: string;
  days_since_paid: number;
  amount_received: number;
  payment_platform: PaymentPlatform;
}

/** Format a yyyy-mm-dd as "May 19, 2026". */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Relative recency label (e.g. "32 days ago", "3 months ago", "1 year ago"). */
function relativeDays(days: number): string {
  if (days < 60) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

/**
 * Renewal heat: how compelling is the warm-pitch right now?
 *   - 30-90d  → "Hot" (iris) — top of mind, freshest ROI memory
 *   - 90-180d → "Warm" (pink) — still recent enough to re-anchor
 *   - 180d+   → "Cooling" (yellow) — needs a stronger hook to re-engage
 */
function renewalHeat(days: number): {
  label: string;
  tone: 'iris' | 'pink' | 'yellow';
} {
  if (days < 90) return { label: 'Hot lead', tone: 'iris' };
  if (days < 180) return { label: 'Warm', tone: 'pink' };
  return { label: 'Cooling', tone: 'yellow' };
}

export function RenewalRow({ data }: { data: RenewalRowData }) {
  const heat = renewalHeat(data.days_since_paid);
  const composeHref = `/inbox?compose=renewal&brand=${encodeURIComponent(
    data.campaign_id,
  )}`;

  return (
    <article className="group rounded-3xl border border-cloud-200 bg-white/85 p-5 transition hover:border-iris-200 hover:shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Left: identity + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg text-ink-900 leading-tight">
              {data.brand}
            </h3>
            <StatusChip tone={heat.tone}>{heat.label}</StatusChip>
          </div>
          <p className="mt-1 text-[13px] text-ink-600 leading-snug truncate">
            {data.campaign_name}
          </p>

          {/* Meta row */}
          <dl className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-ink-600">
            <div className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-ink-400" aria-hidden />
              <dt className="sr-only">Paid</dt>
              <dd>
                <span className="text-ink-700 font-medium">
                  {relativeDays(data.days_since_paid)}
                </span>
                <span className="text-ink-400"> · {formatDate(data.paid_date)}</span>
              </dd>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-ink-400" aria-hidden />
              <dt className="sr-only">Amount received</dt>
              <dd className="text-ink-700 font-medium">
                ${data.amount_received.toLocaleString()}
              </dd>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-ink-400" aria-hidden />
              <dt className="sr-only">Platform</dt>
              <dd>{data.payment_platform}</dd>
            </div>
          </dl>
        </div>

        {/* Right: CTA stack */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Link
            href={composeHref}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-cloud-sunset px-4 py-2 text-[12.5px] font-semibold text-white shadow-soft transition hover:shadow-glow"
          >
            <Send className="h-3.5 w-3.5" />
            Send renewal pitch
          </Link>
          <Link
            href={`/campaigns/${data.campaign_id}`}
            className="text-[11.5px] text-ink-500 underline-offset-2 hover:text-iris-600 hover:underline"
          >
            View prior campaign
          </Link>
        </div>
      </div>
    </article>
  );
}

export default RenewalRow;
