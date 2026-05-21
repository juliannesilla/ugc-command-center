import { notFound } from "next/navigation";
import { CampaignHeader, CampaignTabs } from "@/components/campaigns/CampaignHeader";
import { SOWRequirementsGrid } from "@/components/campaigns/SOWRequirementsGrid";
import { MissingInfoCard } from "@/components/campaigns/MissingInfoCard";
import { ClarifyingQuestionsCard } from "@/components/campaigns/ClarifyingQuestionsCard";
import { WhatThisMeansSidebar } from "@/components/campaigns/WhatThisMeansSidebar";
import { getCampaign, sowData, campaigns } from "@/lib/mock-data/campaigns";

export function generateStaticParams() {
  return Object.keys(campaigns).map((slug) => ({ slug }));
}

export default async function SOWPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = getCampaign(slug);
  if (!campaign) notFound();
  const sow: any = sowData[campaign.slug];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <CampaignHeader campaign={campaign} />
      <CampaignTabs slug={campaign.slug} active="sow" />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-5">
          <header className="rise rise-1">
            <h2 className="font-display text-xl font-bold text-ink-900">SOW Breakdown</h2>
            <p className="mt-0.5 text-[12.5px] text-ink-500">
              Requirement → Detail → What It Means for My Deliverable. Aligned with{" "}
              <span className="font-mono">03-sow-breakdown.md</span> template.
            </p>
          </header>

          <SOWRequirementsGrid requirements={sow.requirements} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <MissingInfoCard items={sow.missingInfo} />
            <ClarifyingQuestionsCard questions={sow.missingInfo} />
          </div>
        </section>

        <div className="rise rise-2">
          <div className="lg:sticky lg:top-6">
            <WhatThisMeansSidebar summary={sow.meansSummary} />
          </div>
        </div>
      </div>
    </div>
  );
}
