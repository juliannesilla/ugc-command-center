// Phase A.14n Wave 2b N3-SOW+SCRIPT — client island for /sow-breakdown.
//
// Owns the campaign-selector useState. Server page (page.tsx) keeps `export
// const metadata` and renders this client island with pre-computed props.
//
// HR-4 SMALLEST: one useState, no router/query-param dance.
// HR-2 PRESERVE: SowBreakdownTable + WhatThisMeansCallout-rail placeholder
//   layout untouched at component-body level — only composition layer here.
// HR-26: gap #4 (~8000px stacked scroll) → solution (single-campaign chip
//   filter reduces table render to one slug at a time).
//
// Mockup cites: #13 (sow-breakdown-elf.png) single-campaign viewport,
//   #21 (sow-breakdown-summer-glow.png) per-campaign header bar, #17 unused here.
'use client';

import { useState } from 'react';
import { Workflow } from 'lucide-react';
import { CampaignSelector } from '@/components/ui';
import type { CampaignSelectorChip } from '@/components/ui';
import { SowBreakdownTable } from '@/components/sow-breakdown/SowBreakdownTable';
import type { CampaignSlug } from '@/lib/mock-data/campaigns';

export interface SowBreakdownClientProps {
  chips: CampaignSelectorChip[];
  readinessByCampaign: Partial<Record<CampaignSlug, number>>;
  /** Optional brand-name map for hero eyebrow ("Now reviewing · {brand}"). */
  brandBySlug: Record<string, string>;
}

export default function SowBreakdownClient({
  chips,
  readinessByCampaign,
  brandBySlug,
}: SowBreakdownClientProps) {
  const defaultSlug = chips[0]?.slug ?? '';
  const [selectedSlug, setSelectedSlug] = useState<string>(defaultSlug);

  const selectedBrand = brandBySlug[selectedSlug];

  return (
    <main className="px-7 md:px-12 pb-20 space-y-6 lg:space-y-8">
      {/* Hero block — mockup #13 top section. Sunset wash + mantra preserved. */}
      <section className="rounded-3xl bg-white/85 backdrop-blur-xl ring-1 ring-cloud-100 shadow-card px-7 md:px-10 lg:px-11 py-7 md:py-8 lg:py-9 relative overflow-hidden">
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
              <span className="text-[10.5px] uppercase tracking-[0.18em] text-ink-700 font-medium">
                {selectedBrand
                  ? `Now reviewing · ${selectedBrand}`
                  : `Contract review · ${chips.length} active SOWs`}
              </span>
            </div>
            <h2 className="font-display text-[32px] md:text-[36px] leading-[1.05] tracking-tight text-ink-900">
              One campaign at a time.
            </h2>
            <p className="mt-3 text-[15px] text-ink-700 max-w-xl leading-relaxed">
              Pick a campaign below. Skim status, read what each clause
              actually means in plain English, and flag the gaps before you
              film. Switch brands without losing your place.
            </p>
          </div>
          <blockquote className="md:justify-self-end max-w-sm text-right">
            <p className="font-display italic text-[20px] text-ink-800 leading-snug">
              &ldquo;The goal isn&rsquo;t to be perfect. It&rsquo;s to be better
              than yesterday.&rdquo;
            </p>
            <footer className="mt-2 text-[11px] uppercase tracking-[0.16em] text-ink-700">
              Julz mantra · auto-applied
            </footer>
          </blockquote>
        </div>
      </section>

      {/* N1-V2 #4 PRIMARY FIX: sticky chip selector — one chip per campaign.
          Sticky on lg+ so the selector stays in view while scrolling the SOW
          grid (Emil: spatial consistency, selection anchored). */}
      <div className="sticky top-2 z-20 -mx-2 px-2 py-2 rounded-2xl bg-white/70 backdrop-blur-md ring-1 ring-cloud-100 shadow-soft">
        <CampaignSelector
          label="Choose a campaign"
          chips={chips}
          activeSlug={selectedSlug}
          onChange={setSelectedSlug}
        />
      </div>

      {/* Two-column: table (filtered to single campaign) + meaning rail. */}
      <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 lg:gap-8 items-start">
        <div className="min-w-0">
          <SowBreakdownTable
            readinessByCampaign={readinessByCampaign}
            slugs={selectedSlug ? [selectedSlug as CampaignSlug] : undefined}
          />
        </div>

        {/* Right rail — A14I-1b PRESERVE. */}
        <aside
          id="what-this-means-rail"
          data-owner="A14I-1b"
          className="hidden xl:block sticky top-24 space-y-4"
        >
          <div className="card-secondary bg-white/85 backdrop-blur ring-cloud-100">
            <p className="section-subtitle uppercase tracking-[0.18em] text-ink-700 font-medium mb-2">
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
              <li>· Switch campaigns via the chips above</li>
              <li>· Confirm P0 missing-info questions before filming</li>
              <li>· Hand off complete rows to Script Production</li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}
