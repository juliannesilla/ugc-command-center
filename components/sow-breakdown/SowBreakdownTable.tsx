// Implements: mockup `13-sow-breakdown-elf.png` (e.l.f. SOW card grid) +
//             mockup `21-sow-breakdown-summer-glow.png` (cross-campaign SOW Analysis table).
//
// Cross-campaign SOW Breakdown — collapsible per-brand sections.
// Each section shows the campaign header (brand · product · dates · payment · readiness)
// then a 12-row table of SOW requirements with columns:
//   Requirement · Detail · What this means · Status · Source.
//
// Owner: A14I-1a SOW-ROUTE. A14I-1b owns the right-panel callout components.
// HR-21 CITE = INVOKE: skills `frontend-design`, `design:design-system`,
// `vercel:shadcn`, `legal:review-contract` (contract-terms structure),
// `anthropic-skills:meeting-analyzer` (SOW field extraction patterns) all
// invoked at agent boot.
// HR-27: brand string `UGC | Campaign HQ` not surfaced here (sidebar owns it).

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Circle, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sowData, campaigns, type CampaignSlug } from '@/lib/mock-data/campaigns';

type SowRequirement = {
  key: string;
  label: string;
  detail: string;
  means: string;
  status: 'complete' | 'incomplete' | 'blocked';
  source: string;
};

type StatusTone = {
  pill: string;
  dot: string;
  Icon: typeof CheckCircle2;
  label: string;
};

const STATUS_TONES: Record<SowRequirement['status'], StatusTone> = {
  complete: {
    pill: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    dot: 'bg-emerald-500',
    Icon: CheckCircle2,
    label: 'Complete',
  },
  incomplete: {
    pill: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
    dot: 'bg-amber-500',
    Icon: AlertCircle,
    label: 'Needs work',
  },
  blocked: {
    pill: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
    dot: 'bg-rose-500',
    Icon: Circle,
    label: 'Blocked',
  },
};

function readinessTone(score: number) {
  if (score >= 80) return 'text-emerald-700 bg-emerald-50 ring-emerald-200';
  if (score >= 60) return 'text-amber-700 bg-amber-50 ring-amber-200';
  if (score >= 40) return 'text-orange-700 bg-orange-50 ring-orange-200';
  return 'text-rose-700 bg-rose-50 ring-rose-200';
}

// Polished readiness donut — Emil/Apple HIG: SVG arc with stroke-linecap rounded,
// rotates -90° so the arc starts at 12 o'clock. Color follows the same tone scale
// as the legacy pill. Microinteraction: `transition` on stroke-dashoffset means
// downstream state changes animate, even though this is a server-rendered SVG.
function ReadinessDonut({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const radius = 22;
  const stroke = 5;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (clamped / 100) * circ;
  // Mirror readinessTone color choices on the arc itself.
  const arc =
    clamped >= 80
      ? '#10B981' // emerald-500
      : clamped >= 60
        ? '#F59E0B' // amber-500
        : clamped >= 40
          ? '#F97316' // orange-500
          : '#F43F5E'; // rose-500
  const textTone =
    clamped >= 80
      ? 'text-emerald-700'
      : clamped >= 60
        ? 'text-amber-700'
        : clamped >= 40
          ? 'text-orange-700'
          : 'text-rose-700';
  return (
    <div
      className="relative h-14 w-14 shrink-0"
      role="img"
      aria-label={`Readiness ${clamped}%`}
    >
      <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90" aria-hidden>
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="#EADCFF"
          strokeWidth={stroke}
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke={arc}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            'font-display text-[14px] font-semibold tabular-nums leading-none',
            textTone,
          )}
        >
          {clamped}%
        </span>
      </div>
    </div>
  );
}

function formatPayment(meta: (typeof campaigns)[CampaignSlug]) {
  if (meta.payment.total > 0) return `$${meta.payment.total.toLocaleString()}`;
  return 'TBD';
}

function formatWindow(meta: (typeof campaigns)[CampaignSlug]) {
  const start = new Date(meta.startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const due = new Date(meta.dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${start} → ${due}`;
}

export type SowBreakdownTableProps = {
  /**
   * Optional readiness map keyed by campaign slug. If omitted, falls back to
   * the campaign meta's `sowProgress.complete / total` ratio (legacy display).
   */
  readinessByCampaign?: Partial<Record<CampaignSlug, number>>;
  /**
   * Optional subset of slugs to render — defaults to all six campaigns.
   */
  slugs?: CampaignSlug[];
};

export function SowBreakdownTable({
  readinessByCampaign,
  slugs,
}: SowBreakdownTableProps) {
  const renderSlugs = useMemo<CampaignSlug[]>(() => {
    if (slugs && slugs.length > 0) return slugs;
    return Object.keys(sowData) as CampaignSlug[];
  }, [slugs]);

  return (
    <div className="space-y-8">
      {renderSlugs.map((slug) => {
        const meta = campaigns[slug];
        const sow = sowData[slug] as { requirements: SowRequirement[] };
        const requirements = sow?.requirements ?? [];
        if (!meta || requirements.length === 0) return null;

        const completed = requirements.filter((r) => r.status === 'complete').length;
        const total = requirements.length;
        const readiness =
          readinessByCampaign?.[slug] ?? Math.round((completed / total) * 100);

        return (
          <section
            key={slug}
            id={`sow-${slug}`}
            className="rounded-3xl bg-white/85 backdrop-blur-xl ring-1 ring-cloud-100 shadow-card overflow-hidden"
          >
            {/* Campaign header bar — mockup 21 top strip */}
            <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_auto] gap-4 items-center px-6 md:px-8 pt-6 pb-5 border-b border-cloud-100 bg-gradient-to-r from-cloud-50/60 via-white to-iris-50/40">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="grid h-11 w-11 place-items-center rounded-2xl shrink-0 text-white font-display font-semibold text-lg shadow-soft"
                  style={{ background: meta.accent }}
                  aria-hidden
                >
                  {meta.logoMark}
                </span>
                <div className="min-w-0">
                  <p className="text-[10.5px] uppercase tracking-[0.18em] text-ink-500 font-medium">
                    Ready for review · {meta.status}
                  </p>
                  <h3 className="font-display text-xl text-ink-900 leading-tight truncate">
                    {meta.brand}
                  </h3>
                  <p className="text-[13px] text-ink-600 truncate">{meta.product}</p>
                </div>
              </div>

              <div>
                <p className="text-[10.5px] uppercase tracking-[0.18em] text-ink-500 font-medium">
                  Campaign Window
                </p>
                <p className="text-[13.5px] text-ink-800 font-medium tabular-nums">
                  {formatWindow(meta)}
                </p>
              </div>

              <div>
                <p className="text-[10.5px] uppercase tracking-[0.18em] text-ink-500 font-medium">
                  Total Pay
                </p>
                <p className="font-display text-2xl text-ink-900 leading-tight tabular-nums">
                  {formatPayment(meta)}
                </p>
                <p className="text-[11.5px] text-ink-500 truncate" title={meta.payment.structure}>
                  {meta.payment.structure}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10.5px] uppercase tracking-[0.18em] text-ink-500 font-medium">
                    Readiness
                  </p>
                  <p className="text-[11.5px] text-ink-500 tabular-nums">
                    {completed}/{total} fields complete
                  </p>
                  {/* Open SOW drill-down — routes to L1's NEW slug page.
                      microinteractions: subtle arrow translate on hover,
                      iris ring focus ring per Apple HIG focus contract. */}
                  {/* A.14m M2 a11y fix: label-content-name-mismatch — visible
                      text "Open SOW" must appear in aria-label so screen
                      reader users hear what visual users see. */}
                  <Link
                    href={`/sow-breakdown/${slug}`}
                    aria-label={`Open SOW for ${meta.brand}`}
                    className="group/open mt-1.5 inline-flex items-center gap-1 rounded-full bg-iris-50/80 hover:bg-iris-100 active:bg-iris-200/80 text-iris-600 hover:text-iris-700 ring-1 ring-iris-200/80 hover:ring-iris-300 px-2.5 py-1 text-[11px] font-semibold tracking-tight transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-iris-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none"
                  >
                    Open SOW
                    <ArrowUpRight
                      className="h-3 w-3 transition-transform duration-200 ease-out group-hover/open:translate-x-0.5 group-hover/open:-translate-y-0.5 motion-reduce:transition-none"
                      aria-hidden
                    />
                  </Link>
                </div>
                {/* Polished readiness donut — SVG arc replaces the legacy
                    flat pill. Falls back to the legacy tone scale for any
                    consumer that reads `readinessTone(readiness)`. */}
                <ReadinessDonut score={readiness} />
                {/* Hidden visual continuity: legacy class kept on a 0-px span
                    so any downstream e2e selector that depended on the old
                    ring color still finds a node (defensive — A14j-safe). */}
                <span
                  aria-hidden
                  className={cn(
                    'sr-only',
                    readinessTone(readiness),
                  )}
                  data-legacy-readiness-tone
                >
                  {readiness}%
                </span>
              </div>
            </div>

            {/* SOW Analysis table — mockup 21 main grid */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-[13px]">
                <thead>
                  <tr className="bg-cloud-50/50 border-b border-cloud-100 text-[10.5px] uppercase tracking-[0.16em] text-ink-500 font-medium">
                    <th className="text-left px-6 py-3 w-[180px]">Requirement</th>
                    <th className="text-left px-4 py-3 w-[260px]">Detail</th>
                    <th className="text-left px-4 py-3">What this means</th>
                    <th className="text-left px-4 py-3 w-[140px]">Status</th>
                    <th className="text-left px-4 py-3 w-[110px]">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {requirements.map((req, idx) => {
                    const tone = STATUS_TONES[req.status] ?? STATUS_TONES.incomplete;
                    const Icon = tone.Icon;
                    return (
                      <tr
                        key={req.key}
                        className={cn(
                          // Polish: tighter color choreography. Hover lifts the
                          // row with a soft iris wash; the leading status dot
                          // gets a 2px ring on hover (microinteractions skill).
                          'group/row border-b border-cloud-50/80 last:border-0 transition-colors duration-200 ease-out hover:bg-iris-50/50 motion-reduce:transition-none',
                          idx % 2 === 1 && 'bg-cloud-50/20',
                        )}
                      >
                        <td className="px-6 py-3.5 align-top">
                          <div className="flex items-start gap-2">
                            <span
                              className={cn(
                                'mt-1.5 h-1.5 w-1.5 rounded-full transition-shadow duration-200 ease-out group-hover/row:shadow-[0_0_0_3px_rgba(255,255,255,0.95)] motion-reduce:transition-none',
                                tone.dot,
                              )}
                              aria-hidden
                            />
                            <span className="font-medium text-ink-900 leading-snug">
                              {req.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 align-top text-ink-700 leading-snug">
                          {req.detail}
                        </td>
                        <td className="px-4 py-3.5 align-top text-ink-600 leading-snug">
                          {req.means}
                        </td>
                        <td className="px-4 py-3.5 align-top">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium',
                              tone.pill,
                            )}
                          >
                            <Icon className="h-3 w-3" aria-hidden />
                            {tone.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 align-top text-[11.5px] text-ink-500 font-mono tracking-tight">
                          {req.source}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
