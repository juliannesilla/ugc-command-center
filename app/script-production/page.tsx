/**
 * Script & Production — cross-campaign route (server entry).
 *
 * Phase A.14n Wave 2b N3-SOW+SCRIPT. N1-V2 P0 gap #5 fix: single-campaign
 * focus with chip selector replaces the 2-col grid that diverged from
 * mockup #17's single-campaign 6-card lane.
 *
 * Mockup: `_meta/mockups/17-script-production.png` — one campaign fills the
 * content area with the 6-panel lane (Hooks · Beats · Script · A-Roll ·
 * B-Roll · Edit Checklist). The card itself encodes those 6 panels.
 *
 * - PageHeader (A.14n Wave 2a primitive) for consistent eyebrow + H1 + subtitle.
 * - Server resolves campaigns + script/production data, hands to client island.
 * - ScriptProductionClient owns the selector useState + single-card render.
 *
 * HR-2 PRESERVE: <ScriptProductionCard /> body untouched (A14I-2a/2b owners).
 *   Only composition layer changed (one-at-a-time vs all-stacked).
 * HR-21 CITE = INVOKE: skills top-design, emil-design-eng, design:design-handoff,
 *   refactoring-ui, superpowers:verification-before-completion invoked at
 *   agent boot at 2026-05-25T00:00:00Z.
 */

import { PageHeader } from '@/components/ui';
import type { CampaignSelectorChip } from '@/components/ui';
import {
  MOCK_CAMPAIGNS,
  scriptData,
  productionData,
  campaigns as campaignMeta,
} from '@/lib/mock-data/campaigns';
import type { CampaignSlug } from '@/lib/mock-data/campaigns';
import type {
  ScriptShape,
  ProductionShape,
} from '@/components/script-production/ScriptProductionCard';
import ScriptProductionClient from './ScriptProductionClient';

export const metadata = {
  title: 'Script & Production · UGC | Campaign HQ',
  description:
    'Plan it. Film it. Edit it. Ship it. — one campaign in focus, all six panels at hand.',
};

// Stages that gate "has script/production work in flight". Earlier stages
// (NEW LEAD, APPLIED, BRAND REPLIED, etc.) don't have script content yet.
const SCRIPT_PRODUCTION_STAGES = new Set([
  'SOW REVIEWED',
  'STRATEGY READY',
  'SCRIPT READY',
  'FILMING',
  'EDITING',
  'QA',
  'SUBMITTED',
]);

function findScriptForSlug(slug: string): ScriptShape | undefined {
  const data: Record<string, unknown> = scriptData as unknown as Record<string, unknown>;
  return data[slug] as ScriptShape | undefined;
}

function findProductionForSlug(slug: string): ProductionShape | undefined {
  const data: Record<string, unknown> = productionData as unknown as Record<string, unknown>;
  return data[slug] as ProductionShape | undefined;
}

function dueDateMs(due: string | undefined): number {
  if (!due) return Number.POSITIVE_INFINITY;
  const n = Date.parse(due);
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

export default function ScriptProductionPage() {
  // Active = not archived AND in script/production window (or has script.json
  // drafted ahead of the stage advance). Sort by due date asc so the chip
  // ordering surfaces the most-urgent campaign first.
  const active = MOCK_CAMPAIGNS.filter(
    (c) =>
      c.status !== 'archived' &&
      (SCRIPT_PRODUCTION_STAGES.has(c.current_stage) ||
        Boolean(findScriptForSlug(c.campaign_id)?.hooks?.length)),
  );

  const sorted = [...active].sort(
    (a, b) => dueDateMs(a.due_date) - dueDateMs(b.due_date),
  );

  const chips: CampaignSelectorChip[] = sorted.map((c) => {
    const meta = campaignMeta[c.campaign_id as CampaignSlug];
    return {
      slug: c.campaign_id,
      brand: meta?.brand ?? c.brand,
      logoMark: meta?.logoMark ?? (c.brand?.[0]?.toUpperCase() ?? '?'),
      accent: meta?.accent ?? '#9D6BFF',
    };
  });

  const scriptBySlug: Record<string, ScriptShape | undefined> = sorted.reduce(
    (acc, c) => {
      acc[c.campaign_id] = findScriptForSlug(c.campaign_id);
      return acc;
    },
    {} as Record<string, ScriptShape | undefined>,
  );

  const productionBySlug: Record<string, ProductionShape | undefined> = sorted.reduce(
    (acc, c) => {
      acc[c.campaign_id] = findProductionForSlug(c.campaign_id);
      return acc;
    },
    {} as Record<string, ProductionShape | undefined>,
  );

  return (
    <>
      <PageHeader
        eyebrow={`Script & Production · ${sorted.length} active`}
        title="Plan it. Film it. Edit it. Ship it."
        subtitle="One campaign in focus. Switch brands without losing your scroll."
      />
      <ScriptProductionClient
        campaigns={sorted}
        chips={chips}
        scriptBySlug={scriptBySlug}
        productionBySlug={productionBySlug}
      />
    </>
  );
}
