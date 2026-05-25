/**
 * Script & Production — cross-campaign route.
 *
 * Spec: `01-initial-dashboard-prompt.md` "NAVIGATION / VIEWS" → Script &
 * Production. Owned by Phase A.14i Wave 2a (A14I-2a SCRIPT-CARD).
 *
 * Surfaces every active campaign with script + production work in flight,
 * sorted by due date ascending so the deadline-closest cards rise to the
 * top. Mirrors the layout of `/creative-strategy` + `/qa` for consistency.
 *
 * Mockup: `UGC/_meta/mockups/17-script-production.png` — hero banner
 * "Plan it. Film it. Edit it. Ship it." sits above a 2-column grid of
 * ScriptProductionCards.
 *
 * Pure server component — static export friendly, no client hydration
 * beyond what the layout already requires.
 */

import { Film } from "lucide-react";
import { Header } from "@/components/ui/header";
import {
  MOCK_CAMPAIGNS,
  scriptData,
  productionData,
} from "@/lib/mock-data/campaigns";
import {
  ScriptProductionCard,
  type ScriptShape,
  type ProductionShape,
} from "@/components/script-production/ScriptProductionCard";

export const metadata = {
  title: "Script & Production · UGC | Campaign HQ",
  description:
    "Plan it. Film it. Edit it. Ship it. — script + production checklist across every active campaign.",
};

// Stages that gate "has script/production work in flight". Earlier stages
// (NEW LEAD, APPLIED, BRAND REPLIED, etc.) don't have script content yet.
const SCRIPT_PRODUCTION_STAGES = new Set([
  "SOW REVIEWED",
  "STRATEGY READY",
  "SCRIPT READY",
  "FILMING",
  "EDITING",
  "QA",
  "SUBMITTED",
]);

function findScriptForSlug(slug: string): ScriptShape | undefined {
  const data: Record<string, unknown> = scriptData as unknown as Record<
    string,
    unknown
  >;
  return data[slug] as ScriptShape | undefined;
}

function findProductionForSlug(slug: string): ProductionShape | undefined {
  const data: Record<string, unknown> = productionData as unknown as Record<
    string,
    unknown
  >;
  return data[slug] as ProductionShape | undefined;
}

function dueDateMs(due: string | undefined): number {
  if (!due) return Number.POSITIVE_INFINITY;
  const n = Date.parse(due);
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

export default function ScriptProductionPage() {
  // Cross-campaign filter: active + in (or past) the script/production
  // window. Cards still surface for SUBMITTED so Julz can spot-check the
  // delivered script copy without bouncing into the campaign detail page.
  const active = MOCK_CAMPAIGNS.filter(
    (c) =>
      c.status !== "archived" &&
      (SCRIPT_PRODUCTION_STAGES.has(c.current_stage) ||
        // Always show campaigns with script.json drafted, even if their
        // current stage hasn't formally advanced — useful during the
        // pre-FILMING dry run.
        Boolean(findScriptForSlug(c.campaign_id)?.hooks?.length)),
  );

  const sorted = [...active].sort(
    (a, b) => dueDateMs(a.due_date) - dueDateMs(b.due_date),
  );

  return (
    <>
      <Header
        pageEyebrow="Script & Production"
        pageTitle="Plan it. Film it. Edit it. Ship it."
      />

      <section className="px-7 md:px-12 -mt-8 pb-20">
        {/* A.14m T5: .section-subtitle utility on intro lede. */}
        <p className="section-subtitle mb-6 max-w-2xl">
          One card per campaign in script + production. Hook options, core
          beats, the working script, A-Roll / B-Roll capture, and the
          post-production gate live side-by-side so a single scroll covers
          every active shoot.
        </p>

        {sorted.length === 0 ? (
          /* A.14m T5: empty-state uses .card-hero (generous p-10 preserved). */
          <div className="card-hero !p-10 ring-cloud-200 text-center">
            <Film
              className="h-10 w-10 text-iris-300 mx-auto mb-3"
              aria-hidden="true"
            />
            <h3 className="section-title">
              No campaigns in script or production yet.
            </h3>
            <p className="section-subtitle mt-2 max-w-md mx-auto">
              When a campaign clears SOW review and moves into scripting,
              its script + production card will surface here.
            </p>
          </div>
        ) : (
          /* A.14m T5 fix-fold (mockup #17): tighten lane gutter on lg+
             (gap-5 → lg:gap-6) — premium spacing so cards breathe without
             feeling sparse. ScriptProductionCard owns its own padding. */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
            {sorted.map((campaign) => {
              const slug = campaign.campaign_id;
              return (
                <ScriptProductionCard
                  key={campaign.campaign_id}
                  campaign={campaign}
                  script={findScriptForSlug(slug)}
                  production={findProductionForSlug(slug)}
                />
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
