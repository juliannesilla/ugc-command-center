import Link from "next/link";
import { notFound } from "next/navigation";
import { CampaignHeader, CampaignTabs } from "@/components/campaigns/CampaignHeader";
import { getCampaign, sowData, scriptData, productionData, campaigns } from "@/lib/mock-data/campaigns";
import { ArrowRight, FileText, Clapperboard, Boxes } from "lucide-react";

export function generateStaticParams() {
  return Object.keys(campaigns).map((slug) => ({ slug }));
}

export default async function CampaignOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign = getCampaign(slug);
  if (!campaign) notFound();

  const sow = sowData[campaign.slug];
  const script = scriptData[campaign.slug];
  const production = productionData[campaign.slug];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <CampaignHeader campaign={campaign} />
      <CampaignTabs slug={campaign.slug} active="overview" />

      <section className="rise rise-2 mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <OverviewCard
          icon={<FileText className="h-4 w-4" />}
          title="SOW Snapshot"
          stat={`${campaign.sowProgress.complete}/${campaign.sowProgress.total}`}
          sub="requirements locked"
          href={`/campaigns/${campaign.slug}/sow`}
        >
          <p className="text-[12.5px] leading-snug text-ink-700">
            {(sow as any).meansSummary?.goal ?? "Goal pending."}
          </p>
        </OverviewCard>

        <OverviewCard
          icon={<Clapperboard className="h-4 w-4" />}
          title="Script & Production"
          stat={`Stage ${(production as any).productionStage}`}
          sub="of 5"
          href={`/campaigns/${campaign.slug}/production`}
        >
          <p className="text-[12.5px] italic leading-snug text-ink-700">
            "{(script as any).hooks?.[0] ?? "Hook drafting…"}"
          </p>
        </OverviewCard>

        <OverviewCard
          icon={<Boxes className="h-4 w-4" />}
          title="Assets"
          stat={`${(script as any).assets?.length ?? 0}`}
          sub="files attached"
          href={`/campaigns/${campaign.slug}/assets`}
        >
          <ul className="space-y-0.5 text-[11.5px] text-ink-600">
            {((script as any).assets ?? []).slice(0, 3).map((a: any, i: number) => (
              <li key={i} className="truncate">· {a.name}</li>
            ))}
          </ul>
        </OverviewCard>
      </section>

      <section className="rise rise-3 mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <article className="glass-card rounded-2xl p-5 shadow-card">
          <h2 className="font-display text-base font-semibold text-ink-900">Campaign Brief</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-700">
            {(sow as any).meansSummary?.goal ?? "Brief pending intake."}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] text-ink-700">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-500">
                Audience
              </p>
              <p className="leading-snug">{(sow as any).meansSummary?.audience ?? "—"}</p>
            </div>
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-500">
                Key Focus
              </p>
              <p className="leading-snug">{(sow as any).meansSummary?.keyFocus ?? "—"}</p>
            </div>
          </div>
        </article>
        <article className="glass-card rounded-2xl p-5 shadow-card">
          <h2 className="font-display text-base font-semibold text-ink-900">Payment Structure</h2>
          <p className="mt-2 text-[12.5px] leading-snug text-ink-700">
            {campaign.payment.structure}
          </p>
          <p className="mt-3 font-display text-3xl font-bold text-ink-900">
            ${campaign.payment.total.toLocaleString()}
          </p>
          <p className="text-[10.5px] uppercase tracking-[0.1em] text-ink-500">
            Total potential
          </p>
        </article>
      </section>
    </div>
  );
}

function OverviewCard({
  icon,
  title,
  stat,
  sub,
  href,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  stat: string;
  sub: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group glass-card flex flex-col gap-3 rounded-2xl p-5 shadow-card transition hover:-translate-y-[1px] hover:shadow-soft"
    >
      <header className="flex items-center justify-between">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cloud-100 text-cloud-700">
          {icon}
        </span>
        <ArrowRight className="h-4 w-4 text-ink-400 transition group-hover:translate-x-1 group-hover:text-cloud-600" />
      </header>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-500">{title}</p>
        <p className="font-display text-2xl font-bold text-ink-900">
          {stat} <span className="text-[12px] font-medium text-ink-500">{sub}</span>
        </p>
      </div>
      <div>{children}</div>
    </Link>
  );
}
