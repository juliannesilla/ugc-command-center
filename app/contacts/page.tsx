// Phase A.14e Wave 4 (E9) — Brand Relationships / CRM page.
// Source spec: UGC/_meta/dashboard-spec/02-campaign-pipeline-views-architecture.md
// section #9 (L678–L753).
//
// Route note: spec calls this "Brand Relationships / CRM". We kept the
// existing `/contacts` route (no rename) — the sidebar label updates to
// "Brand Relationships" (see components/ui/sidebar.tsx). This avoids
// breaking any cross-link or bookmark while still surfacing the right
// concept in the nav.

import { Header } from '@/components/ui/header';
import { CrmTable } from '@/components/brand-relationships/crm-table';
import { MOCK_CAMPAIGNS } from '@/lib/mock-data/campaigns';

export const metadata = {
  title: 'Brand Relationships · UGC | Campaign HQ',
};

export default function BrandRelationshipsPage() {
  // Spec L688: "CRM table or card view." Default to the table; mobile +
  // compact-list view is owned by E11 (Today Mode toggle on /).
  const rows = MOCK_CAMPAIGNS;

  return (
    <>
      <Header
        pageEyebrow="Brand Relationships"
        pageTitle="Build the warm bench."
      />
      <div className="px-7 md:px-12 -mt-8 pb-20">
        <CrmTable rows={rows} />
      </div>
    </>
  );
}
