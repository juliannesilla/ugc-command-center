// Implements: mockup `26-sow-breakdown-elf-glow-reviver.png` (per spawn prompt
// verbatim description — file not on disk, working from description):
//   Hero "SOW Breakdown" + breadcrumb "Docs > SOW Breakdown" + mantra UR;
//   Campaign card (logo + brand + product + Beauty tag + Active + dates +
//     posting window + Payment $650 / Base $450 / Bonus $200 + SOW progress);
//   4-col × 4-row requirements grid (14 cards: Deliverables · Required Length ·
//     Format · Theme · Tone · Required Messaging · Product Mention/Demo ·
//     Posting Requirements · Usage Rights · Payment · Bonus · Deadline ·
//     Revision Policy · Missing Info · Clarifying Questions);
//   Right rail "WHAT THIS MEANS FOR MY DELIVERABLE" panel + Quick Actions card;
//   Footer "This is a read-only mirror of your live command center."
//
// Owner: A14L-L1 SOW DETAIL. NEW route — drill-down from existing
// `/sow-breakdown` list view (preserved). Static export via
// `generateStaticParams()` over all MOCK_CAMPAIGNS slugs.
//
// HR-21 CITE = INVOKE skills (agent boot): refactoring-ui, top-design,
// emil-design-eng, microinteractions, frontend-design, apple-hig-expert,
// superpowers:verification-before-completion.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Film, Clock, Monitor, Sparkles, MessageCircle, Megaphone,
  PackageSearch, Send, ShieldCheck, DollarSign, Trophy,
  CalendarClock, RefreshCcw, HelpCircle, AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { Header } from '@/components/ui/header';
import { SowDetailHero } from '@/components/sow-breakdown/SowDetailHero';
import { RequirementCard } from '@/components/sow-breakdown/RequirementCard';
import type { RequirementStatus, PillTone } from '@/components/sow-breakdown/RequirementCard';
import { WhatThisMeansPanel } from '@/components/sow-breakdown/WhatThisMeansPanel';
import { QuickActionsCard } from '@/components/sow-breakdown/QuickActionsCard';
import {
  MOCK_CAMPAIGNS,
  campaigns as campaignMetaMap,
  sowData,
} from '@/lib/mock-data/campaigns';
import type { CampaignSlug } from '@/lib/mock-data/campaigns';
import { formatMoney } from '@/lib/utils';

export const dynamicParams = false;

export function generateStaticParams() {
  return MOCK_CAMPAIGNS.map((c) => ({ slug: c.campaign_id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = campaignMetaMap[slug as CampaignSlug];
  if (!meta) return { title: 'SOW Breakdown · UGC | Campaign HQ' };
  return {
    title: `${meta.brand} — SOW Breakdown · UGC | Campaign HQ`,
    description: `Full SOW field-by-field breakdown for ${meta.brand} ${meta.product}.`,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

type SowReq = {
  key: string;
  label: string;
  detail: string;
  means: string;
  status: 'complete' | 'incomplete';
  source: string;
};

function findReq(reqs: SowReq[], key: string): SowReq | undefined {
  return reqs.find((r) => r.key === key);
}

function daysUntil(iso: string): number | null {
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return null;
  // A.14u F2: dynamic anchor (static export rebuilds daily via cron).
  const today = new Date();
  const ms = d.getTime() - today.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function statusFromReq(req: SowReq | undefined): RequirementStatus {
  if (!req) return 'missing';
  return req.status === 'complete' ? 'complete' : 'incomplete';
}

function pillForStatus(req: SowReq | undefined, fallbackLabel: string): { label: string; tone: PillTone } {
  if (!req) return { label: 'Missing', tone: 'danger' };
  if (req.status === 'complete') return { label: 'Complete', tone: 'success' };
  return { label: fallbackLabel, tone: 'warning' };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function SowBreakdownDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = campaignMetaMap[slug as CampaignSlug];
  const sow = sowData[slug as CampaignSlug];
  if (!meta || !sow) notFound();

  const reqs = sow.requirements as SowReq[];

  // Field lookups
  const deliverables = findReq(reqs, 'deliverables');
  const length       = findReq(reqs, 'length');
  const format       = findReq(reqs, 'format');
  const theme        = findReq(reqs, 'theme');
  const tone         = findReq(reqs, 'tone');
  const messaging    = findReq(reqs, 'messaging');
  const demo         = findReq(reqs, 'demo');
  const posting      = findReq(reqs, 'posting');
  const usage        = findReq(reqs, 'usage');
  const payment      = findReq(reqs, 'payment');
  const deadline     = findReq(reqs, 'deadline');
  const restrictions = findReq(reqs, 'restrictions');

  // Derived
  const dueDays = daysUntil(meta.dueDate);
  const deadlinePill =
    dueDays == null ? { label: 'TBD', tone: 'neutral' as PillTone }
    : dueDays < 0   ? { label: `${Math.abs(dueDays)} days overdue`, tone: 'danger' as PillTone }
    : dueDays === 0 ? { label: 'Due today',           tone: 'danger'  as PillTone }
    : dueDays <= 3  ? { label: `${dueDays} days left`,tone: 'warning' as PillTone }
    :                 { label: `${dueDays} days left`,tone: 'cloud'   as PillTone };

  const missingInfoCount = (sow.missingInfo ?? []).length;
  const p0Count = (sow.missingInfo ?? []).filter((m: { priority: string }) => m.priority === 'P0').length;

  // ── 14 cards in mockup order ──────────────────────────────────────────────
  const cards = [
    {
      icon: Film,
      title: 'Deliverables',
      items: [
        deliverables?.detail ?? 'TBD',
        deliverables?.means ?? '',
      ].filter(Boolean),
      pill: deliverables
        ? { label: `${meta.sowProgress.total > 0 ? `${meta.payment.total > 0 ? '1' : '—'} Deliverable` : 'TBD'}`, tone: 'iris' as PillTone }
        : { label: 'Missing', tone: 'danger' as PillTone },
      status: statusFromReq(deliverables),
      source: deliverables?.source,
    },
    {
      icon: Clock,
      title: 'Required Length',
      items: [length?.detail, length?.means].filter(Boolean) as string[],
      pill: length ? { label: length.detail.split(',')[0]?.trim() || 'Defined', tone: 'iris' as PillTone } : { label: 'Missing', tone: 'danger' as PillTone },
      status: statusFromReq(length),
      source: length?.source,
    },
    {
      icon: Monitor,
      title: 'Format',
      items: [format?.detail, format?.means].filter(Boolean) as string[],
      pill: pillForStatus(format, 'Defined'),
      status: statusFromReq(format),
      source: format?.source,
    },
    {
      icon: Sparkles,
      title: 'Theme',
      items: [theme?.detail, theme?.means].filter(Boolean) as string[],
      pill: pillForStatus(theme, 'Defined'),
      status: statusFromReq(theme),
      source: theme?.source,
    },
    {
      icon: MessageCircle,
      title: 'Tone',
      items: [tone?.detail, tone?.means].filter(Boolean) as string[],
      pill: tone ? { label: 'Conversational', tone: 'iris' as PillTone } : { label: 'Missing', tone: 'danger' as PillTone },
      status: statusFromReq(tone),
      source: tone?.source,
    },
    {
      icon: Megaphone,
      title: 'Required Messaging',
      items: [messaging?.detail, messaging?.means].filter(Boolean) as string[],
      pill: messaging ? { label: 'Required', tone: 'cloud' as PillTone } : { label: 'None specified', tone: 'neutral' as PillTone },
      status: statusFromReq(messaging),
      source: messaging?.source,
    },
    {
      icon: PackageSearch,
      title: 'Product Mention / Demo',
      items: [demo?.detail, demo?.means].filter(Boolean) as string[],
      pill: pillForStatus(demo, 'On-camera demo'),
      status: statusFromReq(demo),
      source: demo?.source,
    },
    {
      icon: Send,
      title: 'Posting Requirements',
      items: [posting?.detail, posting?.means].filter(Boolean) as string[],
      pill: pillForStatus(posting, 'Scheduled'),
      status: statusFromReq(posting),
      source: posting?.source,
    },
    {
      icon: ShieldCheck,
      title: 'Usage Rights',
      items: [usage?.detail, usage?.means].filter(Boolean) as string[],
      pill: pillForStatus(usage, 'Capped'),
      status: statusFromReq(usage),
      source: usage?.source,
    },
    {
      icon: DollarSign,
      title: 'Payment',
      items: [
        `Base: ${formatMoney(meta.payment.base)}`,
        payment?.means ?? meta.payment.structure,
      ],
      pill: { label: formatMoney(meta.payment.base), tone: 'success' as PillTone },
      status: statusFromReq(payment),
      source: payment?.source,
    },
    {
      icon: Trophy,
      title: 'Bonus',
      items: meta.payment.bonus > 0
        ? [
            `Bonus: ${formatMoney(meta.payment.bonus)} potential`,
            payment?.means ?? meta.payment.structure,
          ]
        : ['No bonus tier defined'],
      pill: meta.payment.bonus > 0
        ? { label: 'Performance Based', tone: 'iris' as PillTone }
        : { label: 'No bonus', tone: 'neutral' as PillTone },
      status: meta.payment.bonus > 0 ? statusFromReq(payment) : ('incomplete' as RequirementStatus),
      source: payment?.source,
    },
    {
      icon: CalendarClock,
      title: 'Deadline',
      items: [
        deadline?.detail ?? `Due ${meta.dueDate}`,
        deadline?.means ?? '',
      ].filter(Boolean),
      pill: deadlinePill,
      status: statusFromReq(deadline),
      source: deadline?.source,
    },
    {
      icon: RefreshCcw,
      title: 'Revision Policy',
      items: restrictions
        ? [restrictions.detail, restrictions.means]
        : ['Default: 1 revision round on draft', 'Final approval required before posting'],
      pill: { label: '1 Revision Round', tone: 'cloud' as PillTone },
      status: 'attention' as RequirementStatus,
      source: restrictions?.source,
    },
    {
      icon: AlertTriangle,
      title: 'Missing Info',
      items: missingInfoCount > 0
        ? sow.missingInfo!.slice(0, 3).map((m: { question: string; priority: string }) =>
            `${m.priority}: ${m.question}`,
          )
        : ['All required fields confirmed'],
      pill: missingInfoCount > 0
        ? { label: `${missingInfoCount} item${missingInfoCount === 1 ? '' : 's'} missing`, tone: 'danger' as PillTone }
        : { label: 'None', tone: 'success' as PillTone },
      status: (missingInfoCount > 0 ? 'missing' : 'complete') as RequirementStatus,
    },
    {
      icon: HelpCircle,
      title: 'Clarifying Questions',
      items: missingInfoCount > 0
        ? sow.missingInfo!.map((m: { question: string }) => m.question).slice(0, 3)
        : ['No open questions for the brand'],
      pill: missingInfoCount > 0
        ? { label: `${missingInfoCount} open question${missingInfoCount === 1 ? '' : 's'}`, tone: 'warning' as PillTone }
        : { label: 'Closed', tone: 'success' as PillTone },
      status: (missingInfoCount > 0 ? 'attention' : 'complete') as RequirementStatus,
    },
  ];

  return (
    <>
      <Header pageEyebrow="Per-Campaign · SOW Detail" pageTitle="SOW Breakdown" />

      <main className="px-7 md:px-12 py-6 space-y-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-[12px] text-ink-700">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-ink-700 transition-colors">Docs</Link>
            </li>
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li>
              <Link href="/sow-breakdown" className="hover:text-ink-700 transition-colors">SOW Breakdown</Link>
            </li>
            <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
            <li className="text-ink-800 font-medium">{meta.brand}</li>
          </ol>
        </nav>

        {/* Two-column layout: requirements grid (main) + right rail.
            A.14m T5 fix-fold (mockup #13): tighten primary column gap on lg+
            (gap-6 → lg:gap-8) so the rail anchors against the requirements grid. */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 lg:gap-8 items-start">
          {/* Main column */}
          <div className="min-w-0 space-y-6">
            <SowDetailHero campaign={meta} />

            {/* P0 banner if any */}
            {p0Count > 0 && (
              <div className="rounded-2xl bg-rose-50 ring-1 ring-rose-200 px-4 py-3 flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" aria-hidden />
                <div className="text-[12.5px] text-rose-700 leading-snug">
                  <span className="font-semibold">{p0Count} P0 question{p0Count === 1 ? '' : 's'} blocking filming.</span>{' '}
                  Ask the brand before you book a shoot day.
                </div>
              </div>
            )}

            {/* 14-card requirements grid.
                A.14m T5 fix-fold (mockup #13): tighten card grid gap on lg+
                (gap-4 → lg:gap-5). RequirementCard internal padding preserved
                per HR-2. .section-title applied to H2. */}
            <section aria-label="SOW requirements">
              <h2 className="section-title mb-4">Requirements</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-5">
                {cards.map((c, i) => (
                  <RequirementCard
                    key={i}
                    icon={c.icon}
                    title={c.title}
                    items={c.items as string[]}
                    pill={c.pill}
                    status={c.status}
                    source={c.source}
                  />
                ))}
              </div>
            </section>

            {/* Footer */}
            <footer className="pt-4 pb-2 text-center text-[11px] text-ink-600">
              This is a read-only mirror of your live command center.
            </footer>
          </div>

          {/* Right rail */}
          <aside className="space-y-4 xl:sticky xl:top-6">
            <WhatThisMeansPanel summary={sow.meansSummary} />
            <QuickActionsCard />
          </aside>
        </div>
      </main>
    </>
  );
}
