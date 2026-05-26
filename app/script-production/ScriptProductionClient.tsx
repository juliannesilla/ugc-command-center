/**
 * ScriptProductionClient — client island for /script-production.
 *
 * Phase A.14n Wave 2b N3-SOW+SCRIPT. Owns the campaign-selector useState
 * and renders ONE <ScriptProductionCard /> at a time per N1-V2 P0 gap #5
 * ("2-col card grid vs mockup's single-campaign 6-card lane").
 *
 * Mockup cite: `_meta/mockups/17-script-production.png` shows ONE campaign
 * filling the content area with the 6-panel lane (Hooks · Beats · Script ·
 * A-Roll · B-Roll · Edit Checklist). The card itself already encodes those
 * 6 panels — this client only switches which campaign's card renders.
 *
 * HR-2 PRESERVE: <ScriptProductionCard /> component-body untouched (it
 *   already renders the 6-panel composition). Only changing how many render
 *   at a time at the page-composition layer.
 * HR-4 SMALLEST: one useState + chip click handler. No router/query-param.
 * HR-26: gap #5 (2-col grid) → solution (single-campaign focus + chip switch).
 *
 * Pure client component. Receives pre-resolved campaign + script + production
 * data slices from the server page, indexed by slug.
 */
'use client';

import { useState } from 'react';
import { Film } from 'lucide-react';
import { CampaignSelector } from '@/components/ui';
import type { CampaignSelectorChip } from '@/components/ui';
import {
  ScriptProductionCard,
  type ScriptShape,
  type ProductionShape,
} from '@/components/script-production/ScriptProductionCard';
import type { Campaign } from '@/lib/types/campaign';

export interface ScriptProductionClientProps {
  /** Pre-sorted (by due date asc) campaigns that have script/production work. */
  campaigns: Campaign[];
  /** Selector chips parallel to campaigns (same ordering). */
  chips: CampaignSelectorChip[];
  /** Script data keyed by campaign slug. */
  scriptBySlug: Record<string, ScriptShape | undefined>;
  /** Production data keyed by campaign slug. */
  productionBySlug: Record<string, ProductionShape | undefined>;
}

export default function ScriptProductionClient({
  campaigns,
  chips,
  scriptBySlug,
  productionBySlug,
}: ScriptProductionClientProps) {
  const defaultSlug = chips[0]?.slug ?? '';
  const [selectedSlug, setSelectedSlug] = useState<string>(defaultSlug);

  if (campaigns.length === 0) {
    return (
      <section className="px-7 md:px-12 -mt-4 pb-20">
        <div className="card-hero !p-10 ring-cloud-200 text-center">
          <Film className="h-10 w-10 text-iris-300 mx-auto mb-3" aria-hidden="true" />
          <h3 className="section-title">No campaigns in script or production yet.</h3>
          <p className="section-subtitle mt-2 max-w-md mx-auto">
            When a campaign clears SOW review and moves into scripting, its
            script + production card will surface here.
          </p>
        </div>
      </section>
    );
  }

  const selected = campaigns.find((c) => c.campaign_id === selectedSlug) ?? campaigns[0];

  return (
    <section className="px-7 md:px-12 pb-20">
      <p className="section-subtitle mb-5 max-w-2xl">
        One campaign in focus. Hook options, core beats, the working script,
        A-Roll / B-Roll capture, and post-production gates — every panel for
        the brand you&rsquo;re filming next, no scroll-through-everything tax.
      </p>

      {/* N1-V2 #5 PRIMARY FIX: sticky chip selector — switch campaigns without
          losing scroll position. Emil: spatial consistency on selection. */}
      <div className="sticky top-2 z-20 -mx-2 mb-6 px-2 py-2 rounded-2xl bg-white/70 backdrop-blur-md ring-1 ring-cloud-100 shadow-soft">
        <CampaignSelector
          label="Choose a campaign"
          chips={chips}
          activeSlug={selectedSlug}
          onChange={setSelectedSlug}
        />
      </div>

      {/* N1-V2 #5 PRIMARY FIX: single-card focus (was: lg:grid-cols-2 stacked
          across all active campaigns). max-w-5xl keeps the 6-panel lane from
          spreading beyond comfortable read width on ultrawides. */}
      <div className="max-w-5xl">
        <ScriptProductionCard
          key={selected.campaign_id}
          campaign={selected}
          script={scriptBySlug[selected.campaign_id]}
          production={productionBySlug[selected.campaign_id]}
        />
      </div>
    </section>
  );
}
