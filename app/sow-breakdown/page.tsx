// Implements: mockup `13-sow-breakdown-elf.png` (ONE campaign per viewport,
//             hero + 12-card grid) + `21-sow-breakdown-summer-glow.png`
//             (per-campaign SOW Analysis table). N1-V2 P0 gap #4 fix:
//             campaign chip selector replaces ~8000px stacked render.
//
// Cross-campaign SOW Breakdown route — server entry.
// - PageHeader (A.14n Wave 2a primitive) for consistent eyebrow + H1 + subtitle.
// - SowBreakdownClient (client island) owns the chip-selector useState + renders
//   the hero block, chip selector, and single-campaign SowBreakdownTable.
// - metadata stays exported from this server component.
//
// Owner: A.14n Wave 2b N3-SOW+SCRIPT.
// HR-2 PRESERVE: A.14l L1 detail-view (./[slug]/page.tsx) + components
//   untouched. SowBreakdownTable component-body untouched (M4-F + N4 fixes
//   intact). Only composition layer changed (single-slug filter).
// HR-21 CITE = INVOKE: skills top-design, emil-design-eng, design:design-handoff,
//   refactoring-ui, superpowers:verification-before-completion invoked at
//   agent boot at 2026-05-25T00:00:00Z.

import { PageHeader } from '@/components/ui';
import type { CampaignSelectorChip } from '@/components/ui';
import { MOCK_CAMPAIGNS, getCampaignDisplayMeta } from '@/lib/mock-data/campaigns';
import { getReadinessScore } from '@/lib/scoring';
import SowBreakdownClient from './SowBreakdownClient';
// A.14y Wave 0.6.B: use canonical-derived meta helper (covers all brands,
// not just ParakeetAI). Source: Julz 2026-05-28 "none of my signed contracts
// are processed into SOW breakdown".

export const metadata = {
  title: 'SOW Breakdown · UGC | Campaign HQ',
  description:
    'Ready for review. Pick a campaign — every SOW field, status, and plain-English meaning.',
};

export default function SowBreakdownPage() {
  // Build chip list + readiness map server-side. MOCK_CAMPAIGNS drives the
  // chip ordering so archived campaigns auto-drop out (HR-4 SMALLEST).
  const active = MOCK_CAMPAIGNS.filter((c) => c.status !== 'archived');

  const chips: CampaignSelectorChip[] = active.map((c) => {
    const meta = getCampaignDisplayMeta(c.campaign_id);
    return {
      slug: c.campaign_id,
      brand: meta?.brand ?? c.brand,
      logoMark: meta?.logoMark ?? (c.brand?.[0]?.toUpperCase() ?? '?'),
      accent: meta?.accent ?? '#9D6BFF',
    };
  });

  const readinessByCampaign = MOCK_CAMPAIGNS.reduce<Record<string, number>>(
    (acc, c) => {
      acc[c.campaign_id] = getReadinessScore(c);
      return acc;
    },
    {},
  );

  const brandBySlug = active.reduce<Record<string, string>>((acc, c) => {
    acc[c.campaign_id] = getCampaignDisplayMeta(c.campaign_id)?.brand ?? c.brand;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        eyebrow={`Cross-Campaign · Contract Review · ${chips.length} active SOWs`}
        title="SOW Breakdown"
        subtitle="Ready for review — every active SOW, field-by-field, in plain English."
      />
      <SowBreakdownClient
        chips={chips}
        readinessByCampaign={readinessByCampaign}
        brandBySlug={brandBySlug}
      />
    </>
  );
}
