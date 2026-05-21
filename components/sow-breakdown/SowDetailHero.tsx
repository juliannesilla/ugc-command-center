// Implements: mockup #26 sow-breakdown-elf-glow-reviver (verbatim from spawn prompt) —
//   "Campaign card: brand logo (e.l.f.) + brand + campaign name + Beauty tag +
//    Active status + dates 'May 10 – May 24, 2026' + posting window +
//    Payment $650 (Base: $450, Bonus: $200) + SOW progress
//    '6 of 14 complete · 43%' with pink progress bar"
//
// Owner: A14L-L1 SOW DETAIL. Wave-1 NEW file — does not collide with the
// existing A.14i SOW list view (preserved per Julz "don't remove what we
// already have"). Server component, stateless.
//
// HR-21 skills invoked at agent boot: refactoring-ui (whitespace + visual
// hierarchy), top-design (premium taste), emil-design-eng (animation),
// microinteractions (hover transitions), frontend-design, apple-hig-expert,
// superpowers:verification-before-completion.

import { Calendar, DollarSign, Clock } from 'lucide-react';
import { cn, formatMoney } from '@/lib/utils';
import type { CampaignMeta } from '@/lib/mock-data/campaigns';

function formatDateRange(startIso: string, endIso: string): string {
  const s = new Date(startIso + 'T00:00:00');
  const e = new Date(endIso + 'T00:00:00');
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
    return `${startIso} – ${endIso}`;
  }
  const sameYear = s.getFullYear() === e.getFullYear();
  const sFmt = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const eFmt = e.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return sameYear ? `${sFmt} – ${eFmt}` : `${sFmt}, ${s.getFullYear()} – ${eFmt}`;
}

const STATUS_STYLES: Record<CampaignMeta['status'], { bg: string; text: string; ring: string }> = {
  Active:     { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' },
  Drafting:   { bg: 'bg-amber-50',   text: 'text-amber-700',   ring: 'ring-amber-200' },
  'In Review':{ bg: 'bg-iris-50',    text: 'text-iris-600',    ring: 'ring-iris-200' },
  Submitted:  { bg: 'bg-cloud-50',   text: 'text-cloud-700',   ring: 'ring-cloud-200' },
  Paid:       { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' },
};

export function SowDetailHero({ campaign }: { campaign: CampaignMeta }) {
  const { brand, product, category, status, logoMark, accent, startDate, dueDate, payment, sowProgress } = campaign;
  const pct = sowProgress.total > 0 ? Math.round((sowProgress.complete / sowProgress.total) * 100) : 0;
  const statusStyle = STATUS_STYLES[status];
  const dateRange = formatDateRange(startDate, dueDate);

  // Posting window = a couple of days after due date (mockup intent: "post by X")
  const postingWindow = (() => {
    const d = new Date(dueDate + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return undefined;
    const post = new Date(d);
    post.setDate(post.getDate() + 3);
    return `Post by ${post.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  })();

  return (
    <section
      aria-label={`Campaign overview · ${brand} ${product}`}
      className={cn(
        'relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-xl',
        'ring-1 ring-iris-100 shadow-card px-6 md:px-8 py-6 md:py-7',
      )}
    >
      {/* Soft brand-tinted corner wash for premium polish */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{ backgroundColor: accent }}
      />

      <div className="relative grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-5 md:gap-6 items-start">
        {/* Brand logo mark — circular, accent-tinted */}
        <div
          aria-hidden
          className="grid h-14 w-14 md:h-16 md:w-16 place-items-center rounded-2xl text-white font-display text-2xl shadow-soft shrink-0"
          style={{ backgroundColor: accent }}
        >
          {logoMark}
        </div>

        {/* Brand + product + tags */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-display text-2xl md:text-[26px] text-ink-900 leading-tight">{brand}</span>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1',
                'bg-iris-50 text-iris-600 ring-iris-200',
              )}
            >
              {category}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1',
                statusStyle.bg,
                statusStyle.text,
                statusStyle.ring,
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  status === 'Active' ? 'bg-emerald-500' :
                  status === 'Drafting' ? 'bg-amber-500' :
                  status === 'In Review' ? 'bg-iris-500' :
                  status === 'Submitted' ? 'bg-cloud-500' : 'bg-emerald-500',
                )}
              />
              {status}
            </span>
          </div>
          <p className="text-[14.5px] text-ink-700 leading-snug">{product} Campaign SOW Breakdown</p>

          {/* Inline meta row — dates + posting window */}
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12.5px] text-ink-600">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-iris-500" aria-hidden />
              <span className="font-medium text-ink-800">{dateRange}</span>
            </span>
            {postingWindow && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-cloud-500" aria-hidden />
                <span>{postingWindow}</span>
              </span>
            )}
          </div>
        </div>

        {/* Payment summary — right-aligned on md+, stacked on mobile */}
        <div className="md:text-right md:min-w-[160px]">
          <div className="inline-flex md:flex md:flex-col items-center md:items-end gap-2 md:gap-0.5 rounded-2xl bg-cloud-50/60 ring-1 ring-cloud-100 px-4 py-2.5">
            <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.16em] text-cloud-700 font-semibold">
              <DollarSign className="h-3 w-3" aria-hidden />
              Payment
            </div>
            <div className="font-display text-2xl text-ink-900 leading-none tabular-nums">
              {formatMoney(payment.total)}
            </div>
            <div className="text-[11px] text-ink-600 tabular-nums">
              Base: {formatMoney(payment.base)} · Bonus: {formatMoney(payment.bonus)}
            </div>
          </div>
        </div>
      </div>

      {/* SOW progress bar */}
      <div className="relative mt-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10.5px] uppercase tracking-[0.18em] text-ink-500 font-semibold">
            SOW Progress
          </p>
          <p className="text-[12px] text-ink-700 font-medium tabular-nums">
            {sowProgress.complete} of {sowProgress.total} complete
            <span className="text-ink-500"> · </span>
            <span className="text-cloud-600 font-semibold">{pct}%</span>
          </p>
        </div>
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`SOW progress: ${pct}% complete`}
          className="h-2.5 w-full overflow-hidden rounded-full bg-cloud-50 ring-1 ring-cloud-100"
        >
          <div
            className="h-full rounded-full bg-cloud-sunset shadow-[0_0_12px_rgba(255,107,157,0.45)] transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </section>
  );
}

export default SowDetailHero;
