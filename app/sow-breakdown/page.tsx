// Implements: mockup `13-sow-breakdown-elf.png` (e.l.f. SOW review hero +
//             12-card grid) + `21-sow-breakdown-summer-glow.png` (cross-campaign
//             SOW Analysis table with per-campaign readiness donut).
//
// Cross-campaign SOW Breakdown route.
// - Hero with H1 "Ready for review" + mantra tagline.
// - SowBreakdownTable rendering all six campaigns stacked.
// - Right-rail "What this means for you" callout area — A14I-1b owns the
//   `WhatThisMeansCallout` + `SowDetailPanel` components that fill the panel
//   placeholder div below. We leave a clearly-marked target so the next
//   agent's edit slots in atomically without colliding on this file.
//
// Owner: A14I-1a SOW-ROUTE. Sidebar entry added atomically in the same wave.
// HR-21 CITE = INVOKE: skills `frontend-design`, `design:design-critique`,
// `design:design-system`, `vercel:shadcn`, `vercel:nextjs`,
// `legal:review-contract` (contract-terms layout reasoning),
// `anthropic-skills:meeting-analyzer` (SOW field extraction reasoning),
// `superpowers:verification-before-completion` (final-gate posture) all
// invoked at agent boot.

import { Workflow } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { SowBreakdownTable } from '@/components/sow-breakdown/SowBreakdownTable';
import { MOCK_CAMPAIGNS } from '@/lib/mock-data/campaigns';
import { getReadinessScore } from '@/lib/scoring';
import type { CampaignSlug } from '@/lib/mock-data/campaigns';

export const metadata = {
  title: 'SOW Breakdown · UGC | Campaign HQ',
  description:
    'Ready for review. Every active SOW, broken down field-by-field with status, plain-English meaning, and source line.',
};

export default function SowBreakdownPage() {
  // Build readiness map from the canonical scoring fn so the table donuts
  // match the rest of the dashboard's readiness math.
  const readinessByCampaign = MOCK_CAMPAIGNS.reduce<Partial<Record<CampaignSlug, number>>>(
    (acc, c) => {
      acc[c.campaign_id as CampaignSlug] = getReadinessScore(c);
      return acc;
    },
    {},
  );

  return (
    <>
      <Header
        pageEyebrow="Cross-Campaign · Contract Review"
        pageTitle="SOW Breakdown"
      />

      <main className="px-7 md:px-12 py-6 space-y-6 lg:space-y-8">
        {/* Hero block — mockup 13 top section.
            A.14m T5: hero keeps custom px/py (brand wash + tagline layout
            needs specific scale); tighter spacing on lg+ per mockup #13. */}
        <section className="rounded-3xl bg-white/85 backdrop-blur-xl ring-1 ring-cloud-100 shadow-card px-7 md:px-10 lg:px-11 py-8 md:py-9 lg:py-10 relative overflow-hidden">
          {/* soft sunset wash */}
          <div
            className="absolute inset-0 opacity-60 pointer-events-none"
            style={{
              background:
                'radial-gradient(60% 80% at 100% 0%, rgba(255,201,223,0.55) 0%, rgba(255,255,255,0) 60%), radial-gradient(50% 70% at 0% 100%, rgba(212,184,255,0.45) 0%, rgba(255,255,255,0) 60%)',
            }}
            aria-hidden
          />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-6 items-start">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-cloud-sunset/90 shadow-soft text-white">
                  <Workflow className="h-4 w-4" aria-hidden />
                </span>
                <span className="text-[10.5px] uppercase tracking-[0.18em] text-ink-500 font-medium">
                  Contract review · {MOCK_CAMPAIGNS.length} active SOWs
                </span>
              </div>
              <h1 className="font-display text-[40px] md:text-[44px] leading-[1.05] tracking-tight text-ink-900">
                Ready for review.
              </h1>
              <p className="mt-3 text-[15px] text-ink-700 max-w-xl leading-relaxed">
                Every active SOW broken down field-by-field. Skim status, read what
                each clause actually means in plain English, and flag the gaps before
                you film.
              </p>
            </div>
            <blockquote className="md:justify-self-end max-w-sm text-right">
              <p className="font-display italic text-[20px] text-ink-800 leading-snug">
                &ldquo;The goal isn&rsquo;t to be perfect. It&rsquo;s to be better
                than yesterday.&rdquo;
              </p>
              <footer className="mt-2 text-[11px] uppercase tracking-[0.16em] text-ink-500">
                Julz mantra · auto-applied
              </footer>
            </blockquote>
          </div>
        </section>

        {/* Two-column: table (main) + meaning rail (placeholder for A14I-1b).
            A.14m T5 fix-fold (mockup #13/#21): tighten column gap on lg+
            (gap-6 → lg:gap-8) so the rail breathes against the data-dense
            table. .card-secondary applied to rail cards. */}
        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 lg:gap-8 items-start">
          <div className="min-w-0">
            <SowBreakdownTable readinessByCampaign={readinessByCampaign} />
          </div>

          {/* Right rail — A14I-1b inserts `WhatThisMeansCallout` + `SowDetailPanel` here.
              Until that lands, render a static placeholder card so the layout doesn't shift. */}
          <aside
            id="what-this-means-rail"
            data-owner="A14I-1b"
            className="hidden xl:block sticky top-6 space-y-4"
          >
            <div className="card-secondary bg-white/85 backdrop-blur ring-cloud-100">
              <p className="section-subtitle uppercase tracking-[0.18em] text-ink-500 font-medium mb-2">
                What this means for you
              </p>
              <h2 className="font-display text-lg text-ink-900 leading-tight mb-2">
                Per-deliverable callouts
              </h2>
              <p className="text-[12.5px] text-ink-600 leading-relaxed">
                Hover a row to see goal · audience · key focus · do&rsquo;s · don&rsquo;ts
                pulled from the SOW you opened. (Detail panel ships next.)
              </p>
            </div>

            <div className="card-secondary bg-cloud-50/70 ring-cloud-100 shadow-none">
              <p className="section-subtitle uppercase tracking-[0.18em] text-cloud-700 font-medium mb-2">
                Quick actions
              </p>
              <ul className="text-[12.5px] text-ink-700 space-y-1.5">
                <li>· Open any campaign for the full SOW grid</li>
                <li>· Confirm P0 missing-info questions before filming</li>
                <li>· Hand off complete rows to Script Production</li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}
