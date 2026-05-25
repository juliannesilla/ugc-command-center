/**
 * Creative Strategy — cross-campaign positioning + concept + hook bank view.
 *
 * Spec: `01-initial-dashboard-prompt.md` "NAVIGATION / VIEWS" → "Creative Strategy".
 * Owned by E14 (Phase A.14e Wave 6).
 *
 * Server component (no useState) — sorts campaigns by brand fit score descending.
 */

import { Lightbulb } from "lucide-react";
import { Header } from "@/components/ui/header";
import { MOCK_CAMPAIGNS, scriptData } from "@/lib/mock-data/campaigns";
import { CreativeStrategyCard } from "@/components/creative-strategy/CreativeStrategyCard";
import { getBrandFitScore } from "@/lib/scoring";

export const metadata = {
  title: "Creative Strategy · UGC | Campaign HQ",
  description: "Positioning, concept, hooks, and brand fit across every active campaign.",
};

function findScriptForSlug(slug: string) {
  // scriptData is keyed by slug; types may not export the union, so soft access.
  const data: Record<string, unknown> = scriptData as unknown as Record<string, unknown>;
  return data[slug];
}

export default function CreativeStrategyPage() {
  const sorted = [...MOCK_CAMPAIGNS]
    .filter((c) => c.status !== "archived")
    .sort(
      (a, b) =>
        (b.brand_fit_score ?? getBrandFitScore(b)) -
        (a.brand_fit_score ?? getBrandFitScore(a)),
    );

  return (
    <>
      <Header
        pageEyebrow="Creative Strategy"
        pageTitle="Positioning · concept · hooks · brand fit"
      />

      <section className="px-7 md:px-12 -mt-8 pb-20">
        {sorted.length === 0 ? (
          /* A.14m T5: empty-state uses .card-hero (generous p-10 preserved). */
          <div className="card-hero !p-10 ring-cloud-200 text-center">
            <Lightbulb className="h-10 w-10 text-iris-300 mx-auto mb-3" aria-hidden="true" />
            <h3 className="section-title">
              No campaigns with strategy work yet.
            </h3>
            <p className="section-subtitle mt-2 max-w-md mx-auto">
              When a campaign moves past SOW Received, its creative strategy lands here.
            </p>
          </div>
        ) : (
          /* A.14m T5 fix-fold: gap-5 → lg:gap-6 to mirror /script-production. */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
            {sorted.map((campaign) => {
              const script = findScriptForSlug(
                (campaign.campaign_id || campaign.brand)
                  .toLowerCase()
                  .replace(/\s+/g, "-"),
              );
              return (
                <CreativeStrategyCard
                  key={campaign.campaign_id}
                  campaign={campaign}
                  script={script as never}
                />
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
