import Link from "next/link";
import { notFound } from "next/navigation";
import { CampaignHeader, CampaignTabs } from "@/components/campaigns/CampaignHeader";
import {
  getCampaign,
  sowData,
  scriptData,
  productionData,
  campaigns,
} from "@/lib/mock-data/campaigns";
import {
  ArrowRight,
  FileText,
  Clapperboard,
  Boxes,
  Target,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STAGE_LABELS = [
  "Ideation",
  "Script",
  "Production",
  "Editing",
  "Ready to Publish",
];

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

  const sow: any = sowData[campaign.slug];
  const script: any = scriptData[campaign.slug];
  const production: any = productionData[campaign.slug];

  const sowPct = Math.round(
    (campaign.sowProgress.complete / campaign.sowProgress.total) * 100,
  );
  const stageIdx = Math.max(1, production?.productionStage ?? 1);
  const stageLabel = STAGE_LABELS[stageIdx - 1] ?? "Planning";

  const brollDone = (production?.brollChecklist ?? []).filter(
    (i: any) => i.done,
  ).length;
  const brollTotal = (production?.brollChecklist ?? []).length;
  const editDone = (production?.editChecklist ?? []).filter(
    (i: any) => i.done,
  ).length;
  const editTotal = (production?.editChecklist ?? []).length;

  return (
    <div className="px-7 py-12 md:px-12 lg:py-16">
      <CampaignHeader campaign={campaign} />
      <CampaignTabs slug={campaign.slug} active="overview" />

      {/* Row 1 — three focal cards: SOW, Script & Production, Assets */}
      <section className="rise rise-2 mt-8 grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
        <OverviewCard
          icon={<FileText className="h-4 w-4" />}
          tone="cloud"
          title="SOW Snapshot"
          stat={`${campaign.sowProgress.complete}/${campaign.sowProgress.total}`}
          sub={`requirements · ${sowPct}% locked`}
          href={`/campaigns/${campaign.slug}/sow`}
          progress={sowPct}
        >
          <p className="text-[12px] leading-snug text-ink-700">
            {sow?.meansSummary?.goal ?? "Goal pending intake."}
          </p>
        </OverviewCard>

        <OverviewCard
          icon={<Clapperboard className="h-4 w-4" />}
          tone="iris"
          title="Script & Production"
          stat={`Stage ${stageIdx}`}
          sub={`of 5 · ${stageLabel}`}
          href={`/campaigns/${campaign.slug}/production`}
          progress={Math.round((stageIdx / 5) * 100)}
        >
          <p className="text-[12px] italic leading-snug text-ink-700">
            &ldquo;{script?.hooks?.[0] ?? "Hook drafting…"}&rdquo;
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[10.5px] font-semibold">
            {brollTotal > 0 && (
              <span className="rounded-full bg-cloud-100 px-2 py-0.5 text-cloud-700">
                B-roll {brollDone}/{brollTotal}
              </span>
            )}
            {editTotal > 0 && (
              <span className="rounded-full bg-peach-100 px-2 py-0.5 text-peach-500">
                Edit {editDone}/{editTotal}
              </span>
            )}
          </div>
        </OverviewCard>

        <OverviewCard
          icon={<Boxes className="h-4 w-4" />}
          tone="peach"
          title="Assets"
          stat={`${script?.assets?.length ?? 0}`}
          sub="files attached"
          href={`/campaigns/${campaign.slug}/assets`}
        >
          <ul className="space-y-0.5 text-[11.5px] text-ink-600">
            {(script?.assets ?? []).slice(0, 3).map((a: any, i: number) => (
              <li key={i} className="truncate">
                · {a.name}
              </li>
            ))}
            {(script?.assets ?? []).length === 0 && (
              <li className="text-ink-400">No assets attached yet</li>
            )}
          </ul>
        </OverviewCard>
      </section>

      {/* Row 2 — Brief + Means + Payment */}
      <section className="rise rise-3 mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr] lg:gap-6">
        <article className="glass-card rounded-2xl p-5 shadow-card">
          <header className="mb-3 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cloud-100 text-cloud-700">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} />
            </span>
            <h2 className="font-display text-base font-semibold text-ink-900">
              Campaign Brief
            </h2>
          </header>
          <p className="text-[13px] leading-relaxed text-ink-700">
            {sow?.meansSummary?.goal ?? "Brief pending intake."}
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <BriefBlock
              icon={<Target className="h-3.5 w-3.5" />}
              label="Audience"
            >
              {sow?.meansSummary?.audience ?? "—"}
            </BriefBlock>
            <BriefBlock
              icon={<Users className="h-3.5 w-3.5" />}
              label="Key Focus"
            >
              {sow?.meansSummary?.keyFocus ?? "—"}
            </BriefBlock>
            <BriefBlock
              icon={<Calendar className="h-3.5 w-3.5" />}
              label="Due"
            >
              {new Date(campaign.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </BriefBlock>
          </div>
        </article>

        <article className="glass-card rounded-2xl p-5 shadow-card">
          <header className="mb-3 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <DollarSign className="h-3.5 w-3.5" strokeWidth={2.4} />
            </span>
            <h2 className="font-display text-base font-semibold text-ink-900">
              Payment Structure
            </h2>
          </header>
          <p className="text-[12.5px] leading-snug text-ink-700">
            {campaign.payment.structure}
          </p>
          <p className="mt-3 font-display text-3xl font-bold text-ink-900">
            ${campaign.payment.total.toLocaleString()}
          </p>
          <p className="text-[10.5px] uppercase tracking-[0.1em] text-ink-500">
            Total potential
          </p>
          {campaign.payment.bonus > 0 && (
            <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 ring-1 ring-emerald-200">
              <p className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-emerald-700">
                <TrendingUp className="h-3 w-3" /> Bonus tier
              </p>
              <p className="mt-0.5 text-[12px] text-ink-700">
                ${campaign.payment.bonus.toLocaleString()} unlocked on performance
              </p>
            </div>
          )}
        </article>
      </section>

      {/* Row 3 — Quick-jump tab links */}
      <section className="rise rise-4 mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <QuickJump
          href={`/campaigns/${campaign.slug}/sow`}
          icon={<FileText className="h-3.5 w-3.5" />}
          label="Open SOW Breakdown"
          sub={`${campaign.sowProgress.complete}/${campaign.sowProgress.total} requirements`}
        />
        <QuickJump
          href={`/campaigns/${campaign.slug}/production`}
          icon={<Clapperboard className="h-3.5 w-3.5" />}
          label="Open Production"
          sub={`Stage ${stageIdx} of 5 · ${stageLabel}`}
        />
        <QuickJump
          href={`/campaigns/${campaign.slug}/assets`}
          icon={<Boxes className="h-3.5 w-3.5" />}
          label="Open Assets"
          sub={`${script?.assets?.length ?? 0} files attached`}
        />
      </section>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────

function OverviewCard({
  icon,
  tone,
  title,
  stat,
  sub,
  href,
  progress,
  children,
}: {
  icon: React.ReactNode;
  tone: "cloud" | "iris" | "peach";
  title: string;
  stat: string;
  sub: string;
  href: string;
  progress?: number;
  children: React.ReactNode;
}) {
  const TONES: Record<typeof tone, { iconBg: string; bar: string }> = {
    cloud: { iconBg: "bg-cloud-100 text-cloud-700", bar: "bg-cloud-sunset" },
    iris: { iconBg: "bg-iris-100 text-iris-600", bar: "bg-iris-400" },
    peach: { iconBg: "bg-peach-100 text-peach-500", bar: "bg-peach-500" },
  } as any;
  const t = TONES[tone];
  return (
    <Link
      href={href}
      className="group glass-card flex flex-col gap-3 rounded-2xl p-6 shadow-card transition hover:-translate-y-[1px] hover:shadow-soft"
    >
      <header className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-full",
            t.iconBg,
          )}
        >
          {icon}
        </span>
        <ArrowRight className="h-4 w-4 text-ink-400 transition group-hover:translate-x-1 group-hover:text-cloud-600" />
      </header>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-500">
          {title}
        </p>
        <p className="font-display text-2xl font-bold text-ink-900">
          {stat}{" "}
          <span className="text-[12px] font-medium text-ink-500">{sub}</span>
        </p>
      </div>
      {progress !== undefined && (
        <div className="h-1.5 overflow-hidden rounded-full bg-ink-300/30">
          <div
            className={cn("h-full rounded-full transition-all", t.bar)}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <div className="min-h-[36px]">{children}</div>
    </Link>
  );
}

function BriefBlock({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-cloud-100 bg-white/60 p-3">
      <p className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-500">
        {icon} {label}
      </p>
      <p className="mt-1 text-[12px] leading-snug text-ink-800">{children}</p>
    </div>
  );
}

function QuickJump({
  href,
  icon,
  label,
  sub,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-2xl border border-cloud-100 bg-white/85 p-3.5 shadow-card transition hover:-translate-y-[1px] hover:border-cloud-300 hover:shadow-soft"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cloud-100 text-cloud-700">
          {icon}
        </span>
        <div>
          <p className="text-[13px] font-semibold text-ink-900">{label}</p>
          <p className="text-[11px] text-ink-500">{sub}</p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-ink-400 transition group-hover:translate-x-1 group-hover:text-cloud-600" />
    </Link>
  );
}
