// Pipeline · Brand Renewals — warm-pitch opportunities view.
//
// Source: A.4 G29 deferred-gap from `_meta/dashboard-spec/02-campaign-pipeline-views-architecture.md`.
// Brands paid >30 days ago = highest-conversion re-pitch surface. The closer
// you re-engage to the original deliverable's payout, the more likely the
// brand remembers ROI + has remaining budget for the quarter.
//
// Phase A.14v V8C (HAMILTON / Wave 2): rewrote to read REAL paid brands from
// `data/brands-canonical.json` instead of computing from MOCK_PAYMENTS rows
// (which derive paid_date = due_date, and most paid brands have null deadlines).
//
// Filter logic:
//   - source = loadAllCanonical() (DARWIN canonical brand list)
//   - WHERE status === 'paid' AND last_msg_at provides best paid-date proxy
//     (canonical doesn't store a discrete paid_at column; last_msg_at on a
//      paid row reflects the most recent payment receipt notification)
//   - AND days_since_last_msg > 30 (warm-renewal window per spec)
//   - SORT by last_msg_at DESC (freshest memory first)
//
// Honest empty-state today: Monat (only canonical paid row, last_msg_at
// 2026-05-08) is just 19 days past as of 2026-05-27 — NOT yet renewal-eligible.
// Empty state is correct, surfaces the moment Monat tips past 30d (~ Jun 7).

import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { PageHeader } from '@/components/ui/PageHeader';
import { loadAllCanonical } from '@/lib/mock-data/campaigns/from-canonical';
import { RenewalRow, type RenewalRowData } from '@/components/renewals/RenewalRow';
import type { PaymentPlatform } from '@/lib/mock-data/payments';

export const metadata = {
  title: 'Brand Renewals · UGC | Campaign HQ',
  description:
    'Warm pitch opportunities — brands you have worked with before, paid more than 30 days ago.',
};

/** Today, normalized to 00:00 for stable date math. */
function todayMidnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Days since an ISO yyyy-mm-dd date. */
function daysSince(iso: string): number {
  const past = new Date(iso);
  past.setHours(0, 0, 0, 0);
  const ms = todayMidnight().getTime() - past.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/**
 * Heuristic — map canonical channel/source to PaymentPlatform display token.
 * Monat is paid via MyPayQuicker (commission processor — closest existing
 * token is "Bank Transfer" since none of our enum values match exactly).
 */
function inferPlatform(channel: string | null, sources: string[]): PaymentPlatform {
  if (sources.includes('mypayquicker')) return 'Bank Transfer';
  if (channel?.includes('sideshift') || sources.includes('sideshift')) return 'SideShift';
  if (channel?.includes('email')) return 'PayPal';
  return 'Unknown';
}

/**
 * Build renewal rows from canonical paid brands. One row per brand_id.
 */
function buildRenewals(): RenewalRowData[] {
  return loadAllCanonical()
    .filter((r) => r.status === 'paid' && r.last_msg_at != null)
    .map((r): RenewalRowData | null => {
      const paid_date = r.last_msg_at as string;
      const days_since_paid = daysSince(paid_date);
      if (days_since_paid <= 30) return null; // not yet warm
      return {
        campaign_id: r.brand_id,
        brand: r.brand_name_canonical,
        campaign_name:
          r.deliverables[0]?.type ?? (r.notes.slice(0, 60) || 'Prior campaign'),
        paid_date,
        days_since_paid,
        amount_received: r.payment_amount_usd ?? 0,
        payment_platform: inferPlatform(
          r.key_contact.channel,
          r.pipeline_source,
        ),
      };
    })
    .filter((row): row is RenewalRowData => row !== null)
    .sort((a, b) =>
      a.paid_date < b.paid_date ? 1 : a.paid_date > b.paid_date ? -1 : 0,
    );
}

export default function RenewalsPage() {
  const renewals = buildRenewals();
  const totalLifetimeValue = renewals.reduce(
    (sum, r) => sum + r.amount_received,
    0,
  );

  return (
    <>
      <Header
        pageEyebrow="Campaign Pipeline"
        pageTitle="Brand Renewals"
      />

      <main className="flex-1 px-7 md:px-12 py-6 space-y-8">
        {/* Breadcrumb back */}
        <div className="flex items-center gap-3 text-[12px] text-ink-700">
          <Link
            href="/pipeline/board"
            className="inline-flex items-center gap-1 hover:text-cloud-700 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Board
          </Link>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1 text-iris-600">
            <Sparkles className="h-3.5 w-3.5" />
            Warm pitch opportunities
          </span>
        </div>

        <PageHeader
          eyebrow="Brands You've Already Won"
          title="Renewal-ready brands"
          subtitle="Brands you delivered for more than 30 days ago. Highest-conversion pitch window — they remember the ROI, you remember the contact. Re-engage before they shop alternatives."
        />

        {/* Body */}
        {renewals.length === 0 ? (
          <section className="rounded-3xl border border-cloud-200 bg-white/70 p-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-iris-100 text-iris-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="font-display text-xl text-ink-900">
              No brands ready for renewal yet
            </h2>
            <p className="mt-2 max-w-md mx-auto text-[13px] text-ink-600 leading-relaxed">
              Come back here after a paid campaign ages past 30 days. Today,
              canonical shows Monat as the only paid brand and it's still
              inside the fresh-payment window — they'll surface here once their
              last payment tips past 30 days (early June).
            </p>
            <Link
              href="/pipeline/board"
              className="mt-5 inline-flex items-center gap-1.5 rounded-2xl bg-cloud-sunset px-4 py-2 text-[12.5px] font-semibold text-white shadow-soft hover:shadow-glow transition"
            >
              See active campaigns
            </Link>
          </section>
        ) : (
          <>
            {/* Summary strip */}
            <section className="flex flex-wrap items-center gap-6 rounded-3xl border border-cloud-200 bg-white/70 px-6 py-4">
              <div>
                <p className="text-[10.5px] uppercase tracking-[0.14em] text-ink-700 font-medium">
                  Renewal-ready
                </p>
                <p className="mt-1 font-display text-2xl text-ink-900">
                  {renewals.length}
                  <span className="ml-1 text-[13px] font-sans text-ink-700">
                    {renewals.length === 1 ? 'brand' : 'brands'}
                  </span>
                </p>
              </div>
              <div className="h-10 w-px bg-cloud-200" aria-hidden />
              <div>
                <p className="text-[10.5px] uppercase tracking-[0.14em] text-ink-700 font-medium">
                  Lifetime value · prior payouts
                </p>
                <p className="mt-1 font-display text-2xl text-ink-900">
                  ${totalLifetimeValue.toLocaleString()}
                </p>
              </div>
              <div className="ml-auto text-[10.5px] uppercase tracking-[0.18em] text-ink-700">
                Sort: most recently paid first
              </div>
            </section>

            {/* Row list */}
            <section className="space-y-3">
              {renewals.map((r) => (
                <RenewalRow key={r.campaign_id} data={r} />
              ))}
            </section>
          </>
        )}
      </main>
    </>
  );
}
