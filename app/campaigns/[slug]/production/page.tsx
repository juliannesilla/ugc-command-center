import { notFound } from "next/navigation";
import { CampaignHeader, CampaignTabs } from "@/components/campaigns/CampaignHeader";
import { ProductionTracker } from "@/components/campaigns/ProductionTracker";
import { HookOptionsCard } from "@/components/campaigns/HookOptionsCard";
import { CoreAngleCard } from "@/components/campaigns/CoreAngleCard";
import { ScriptDraftEditor } from "@/components/campaigns/ScriptDraftEditor";
import { CTACard } from "@/components/campaigns/CTACard";
import { ShotMapTable } from "@/components/campaigns/ShotMapTable";
import { ChecklistCard } from "@/components/campaigns/ChecklistCard";
import { FilmingStatusCard } from "@/components/campaigns/FilmingStatusCard";
import { getCampaign, scriptData, productionData, CampaignSlug } from "@/lib/mock-data/campaigns";
import { Video, Mic, Scissors, FileText, Paperclip } from "lucide-react";

export function generateStaticParams() {
  return (["elf", "parakeetai", "lotusshop"] as CampaignSlug[]).map((slug) => ({ slug }));
}

export default async function ProductionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = getCampaign(slug);
  if (!campaign) notFound();
  const script: any = scriptData[campaign.slug];
  const prod: any = productionData[campaign.slug];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <CampaignHeader campaign={campaign} />
      <CampaignTabs slug={campaign.slug} active="production" />

      <div className="mt-6 space-y-5">
        <ProductionTracker currentStep={prod.productionStage ?? 3} />

        {/* Row 1: Hook / Core Angle / Script / CTA */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <HookOptionsCard hooks={script.hooks} />
          <CoreAngleCard coreAngle={script.coreAngle} />
          <div className="lg:col-span-1">
            <ScriptDraftEditor lines={script.scriptDraft} />
          </div>
          <CTACard ctas={script.ctas} />
        </section>

        {/* Row 2: Shot Map · 3 Checklists */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <ShotMapTable shots={prod.shotMap} />
          </div>
          <ChecklistCard
            title="B-Roll Checklist"
            icon={<Video className="h-3.5 w-3.5" />}
            items={prod.brollChecklist}
            tone="cloud"
          />
          <ChecklistCard
            title="Talking Head"
            icon={<Mic className="h-3.5 w-3.5" />}
            items={prod.talkingHeadChecklist}
            tone="iris"
          />
          <ChecklistCard
            title="Edit Checklist"
            icon={<Scissors className="h-3.5 w-3.5" />}
            items={prod.editChecklist}
            tone="peach"
          />
        </section>

        {/* Row 3: Notes / Assets / Filming Status */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <article className="glass-card rounded-2xl p-4 shadow-card">
            <header className="mb-3 flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <FileText className="h-3.5 w-3.5" strokeWidth={2.4} />
              </span>
              <h3 className="font-display text-sm font-semibold text-ink-900">
                Notes & Reminders
              </h3>
            </header>
            <ul className="space-y-1.5 text-[12.5px] text-ink-800">
              {(script.notes ?? []).map((n: string, i: number) => (
                <li key={i} className="flex gap-1.5 leading-snug">
                  <span className="select-none text-amber-600">▸</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="glass-card rounded-2xl p-4 shadow-card">
            <header className="mb-3 flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-iris-100 text-iris-600">
                <Paperclip className="h-3.5 w-3.5" strokeWidth={2.4} />
              </span>
              <h3 className="font-display text-sm font-semibold text-ink-900">
                Assets & References
              </h3>
            </header>
            <ul className="divide-y divide-cloud-100 text-[12px]">
              {(script.assets ?? []).map((a: any, i: number) => (
                <li key={i} className="flex items-center justify-between py-1.5">
                  <span className="truncate text-ink-800">{a.name}</span>
                  <span className="font-mono text-[10.5px] text-ink-400">{a.type}</span>
                </li>
              ))}
            </ul>
          </article>

          <FilmingStatusCard status={prod.filmingStatus} />
        </section>
      </div>
    </div>
  );
}
