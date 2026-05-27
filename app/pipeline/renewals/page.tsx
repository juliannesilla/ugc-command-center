// Pipeline · Brand Renewals — warm-pitch opportunities view.
//
// Source: A.4 G29 deferred-gap from `_meta/dashboard-spec/02-campaign-pipeline-views-architecture.md`.
// Brands paid >30 days ago = highest-conversion re-pitch surface. The closer
// you re-engage to the original deliverable's payout, the more likely the
// brand remembers ROI + has remaining budget for the quarter.
//
// Filter logic:
//   - source = MOCK_PAYMENTS (canonical paid_date provenance — see
//     lib/mock-data/payments.ts L152: paid_date = c.due_date when paid)
//   - WHERE payment_status === 'paid' AND paid_date < today - 30 days
//   - GROUP by campaign_id (dedupe multi-deliverable campaigns to one row)
//   - SORT by paid_date DESC (most-recently-paid first — freshest memory)
//
// Empty state today: NO campaigns in MOCK_CAMPAIGNS have payment_status='paid'
// (all are pending/unknown — see lib/mock-data/campaigns/index.ts). That's
// expected per HR-J PRESERVE INTENT: the route is the *infrastructure* — it
// surfaces brands the second they tip into the >30d-paid window.
//
// Phase A.14t T3 — NEW route. T1 owns the sidebar nav entry in this wave;
// this page is reachable via direct URL (/pipeline/renewals) until then.

import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { PageHeader } from '@/components/ui/PageHeader';
import { MOCK_PAYMENTS } from '@/lib/mock-data/payments';
import { RenewalRow, type RenewalRowData } from '@/components/renewals/RenewalRow';

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
 * Build one renewal row per paid campaign (deduped from per-deliverable
 * MOCK_PAYMENTS). Sum amount_received across deliverables. Pick the latest
 * paid_date as the "campaign paid_at."
 */
function buildRenewals(): RenewalRowData[] {
  const byCampaign = new Map<string, RenewalRowData>();

  for (const p of MOCK_PAYMENTS) {
    if (p.payment_status !== 'paid' || !p.paid_date) continue;
    const days = daysSince(p.paid_date);
    if (days <= 30) continue; // Not yet warm-renewal eligible.

    const existing = byCampaign.get(p.campaign_id);
    if (!existing) {
      byCampaign.set(p.campaign_id, {
        campaign_id: p.campaign_id,
        brand: p.brand,
        campaign_name: p.campaign_name,
        paid_date: p.paid_date,
        days_since_paid: days,
        amount_received: p.amount_received ?? 0,
        payment_platform: p.payment_platform,
      });
    } else {
      existing.amount_received += p.amount_received ?? 0;
      // Keep the latest paid_date if multi-deliverable.
      if (p.paid_date > existing.paid_date) {
        existing.paid_date = p.paid_date;
        existing.days_since_paid = days;
      }
    }
  }

  return Array.from(byCampaign.values()).sort((a, b) =>
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
              Come back here after your first paid campaign closes. Once a
              brand's payout date is more than 30 days behind you, they'll
              surface here as a warm re-pitch lead.
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
