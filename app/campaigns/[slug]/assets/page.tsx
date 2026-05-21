import Link from "next/link";
import { notFound } from "next/navigation";
import { CampaignHeader, CampaignTabs } from "@/components/campaigns/CampaignHeader";
import {
  getCampaign,
  scriptData,
  productionData,
  campaigns,
} from "@/lib/mock-data/campaigns";
import {
  FileText,
  Image as ImageIcon,
  Film,
  FileQuestion,
  ExternalLink,
  Upload,
  Sparkles,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  SlidersHorizontal,
  Paperclip,
} from "lucide-react";
import { StatusChip } from "@/components/ui/status-chip";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return Object.keys(campaigns).map((slug) => ({ slug }));
}

// ──────────────────────────────────────────────────────────────────────────
// Type → visual config (matches /assets vault palette per audit pattern)
// ──────────────────────────────────────────────────────────────────────────

type AssetFile = {
  name: string;
  type: string;     // "pdf" | "doc" | "image" | "video" | etc
  updated?: string;
};

const TYPE_CONFIG: Record<
  string,
  { icon: React.ReactNode; tag: string; thumb: string; label: string }
> = {
  pdf: {
    icon: <FileText className="h-5 w-5" />,
    tag: "bg-rose-100 text-rose-700 ring-rose-200",
    thumb: "bg-gradient-to-br from-rose-100 via-rose-50 to-white",
    label: "PDF",
  },
  doc: {
    icon: <FileText className="h-5 w-5" />,
    tag: "bg-sky-100 text-sky-700 ring-sky-200",
    thumb: "bg-gradient-to-br from-sky-100 via-sky-50 to-white",
    label: "DOC",
  },
  image: {
    icon: <ImageIcon className="h-5 w-5" />,
    tag: "bg-cloud-100 text-cloud-700 ring-cloud-200",
    thumb: "bg-gradient-to-br from-cloud-200 via-cloud-100 to-iris-100",
    label: "IMG",
  },
  video: {
    icon: <Film className="h-5 w-5" />,
    tag: "bg-iris-100 text-iris-600 ring-iris-200",
    thumb: "bg-gradient-to-br from-iris-200 via-iris-100 to-cloud-100",
    label: "VID",
  },
  zip: {
    icon: <Paperclip className="h-5 w-5" />,
    tag: "bg-peach-100 text-peach-500 ring-peach-200",
    thumb: "bg-gradient-to-br from-peach-100 via-peach-50 to-white",
    label: "ZIP",
  },
};

function typeOf(t: string) {
  return TYPE_CONFIG[t] ?? {
    icon: <FileQuestion className="h-5 w-5" />,
    tag: "bg-ink-100 text-ink-600 ring-ink-200",
    thumb: "bg-gradient-to-br from-ink-100 to-white",
    label: t?.toUpperCase().slice(0, 4) ?? "FILE",
  };
}

const FILTER_TABS = [
  "All",
  "Originals",
  "Edits",
  "Screenshots",
  "Scripts",
  "Submitted",
  "Briefs",
];

// ──────────────────────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────────────────────

export default async function AssetsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign = getCampaign(slug);
  if (!campaign) notFound();

  const script: any = scriptData[campaign.slug];
  const production: any = productionData[campaign.slug];
  const scriptAssets: AssetFile[] = script?.assets ?? [];

  // Derive shot-map "asset" entries so the grid feels alive
  const shotAssets: AssetFile[] = (production?.shotMap ?? []).map(
    (s: any, i: number) => ({
      name: `Scene ${s.scene} — ${s.visual.slice(0, 38)}${s.visual.length > 38 ? "…" : ""}`,
      type: "video",
      updated: campaign.dueDate,
    }),
  );

  const allAssets = [...scriptAssets, ...shotAssets];
  const ready = scriptAssets.filter((a) =>
    /pdf|doc|image/i.test(a.type),
  ).length;
  const needsAttention = Math.max(0, allAssets.length - ready - 2);

  return (
    <div className="mx-auto max-w-7xl px-7 py-12 md:px-12 lg:py-16">
      <CampaignHeader campaign={campaign} />
      <CampaignTabs slug={campaign.slug} active="assets" />

      {/* Header: page title + "Open Asset Vault" link */}
      <section className="rise rise-1 mt-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-ink-900">
            Campaign Assets
          </h2>
          <p className="mt-0.5 text-[12.5px] text-ink-500">
            Files attached to this campaign · scoped view of the full{" "}
            <Link
              href="/assets"
              className="text-iris-500 underline-offset-2 hover:underline"
            >
              Asset Vault
            </Link>
            .
          </p>
        </div>
        <Link
          href="/assets"
          className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3.5 py-2 text-[12px] font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-soft"
        >
          Open Asset Vault <ExternalLink className="h-3 w-3" />
        </Link>
      </section>

      {/* KPI strip — campaign-scoped */}
      <section className="rise rise-2 mt-5 grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-5">
        <KpiCard
          tone="cloud"
          icon={<FolderOpen className="h-3.5 w-3.5" />}
          label="Total files"
          value={allAssets.length}
          sub={`${scriptAssets.length} script + ${shotAssets.length} shot`}
        />
        <KpiCard
          tone="green"
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          label="Ready"
          value={ready}
          sub="Cleared for use"
        />
        <KpiCard
          tone="orange"
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          label="Needs attention"
          value={needsAttention}
          sub="Missing or pending"
        />
        <KpiCard
          tone="iris"
          icon={<HardDrive className="h-3.5 w-3.5" />}
          label="Folder size"
          value={`${(allAssets.length * 3.2).toFixed(1)} MB`}
          sub="Est. on disk"
        />
      </section>

      {/* Filter tabs */}
      <section className="rise rise-3 mt-5">
        <div className="flex flex-wrap gap-1.5 overflow-x-auto rounded-2xl border border-cloud-100 bg-white/70 p-1.5 shadow-card backdrop-blur">
          {FILTER_TABS.map((tab, i) => (
            <button
              key={tab}
              type="button"
              className={cn(
                "whitespace-nowrap rounded-xl px-3 py-1.5 text-[12px] font-semibold transition",
                i === 0
                  ? "bg-cloud-sunset text-white shadow-card"
                  : "text-ink-600 hover:bg-cloud-50 hover:text-ink-900",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* Search + sort + view toggle */}
      <section className="rise rise-3 mt-3 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            placeholder={`Search ${campaign.brand} assets…`}
            className="w-full rounded-2xl border border-cloud-200 bg-white/85 py-2.5 pl-9 pr-3 text-[13px] text-ink-900 placeholder:text-ink-400 transition focus:border-cloud-300 focus:outline-none focus:ring-2 focus:ring-cloud-300"
          />
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-2xl border border-cloud-200 bg-white/85 px-3 py-2.5 text-[12.5px] font-semibold text-ink-700 transition hover:bg-cloud-50"
        >
          Sort: Recently Added <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
        </button>
        <div className="flex rounded-2xl border border-cloud-200 bg-white/85 p-0.5">
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-xl bg-cloud-100 text-cloud-700"
            aria-label="Grid view"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-xl text-ink-400 hover:bg-cloud-50"
            aria-label="List view"
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-2xl bg-ink-900 px-3 py-2.5 text-[12.5px] font-semibold text-white transition hover:bg-ink-800"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
        </button>
      </section>

      {/* Two-column body — grid + sidebar */}
      <div className="mt-8 grid grid-cols-12 gap-6 lg:gap-8">
        <div className="col-span-12 space-y-8 xl:col-span-8">
          {/* Script + Brief Files */}
          {scriptAssets.length > 0 && (
            <section className="rise rise-4">
              <header className="mb-3 flex items-baseline justify-between">
                <h3 className="font-display text-[16px] font-semibold text-ink-900">
                  Script & Brief Files
                </h3>
                <StatusChip tone="iris">{scriptAssets.length} files</StatusChip>
              </header>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                {scriptAssets.map((a, i) => (
                  <AssetThumbCard
                    key={`script-${i}`}
                    asset={a}
                    campaignBrand={campaign.brand}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Shot Map / planned video assets */}
          {shotAssets.length > 0 && (
            <section className="rise rise-5">
              <header className="mb-3 flex items-baseline justify-between">
                <h3 className="font-display text-[16px] font-semibold text-ink-900">
                  Shot Map · Planned Captures
                </h3>
                <StatusChip tone="pink">{shotAssets.length} scenes</StatusChip>
              </header>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                {shotAssets.map((a, i) => (
                  <AssetThumbCard
                    key={`shot-${i}`}
                    asset={a}
                    campaignBrand={campaign.brand}
                  />
                ))}
              </div>
            </section>
          )}

          {allAssets.length === 0 && (
            <section className="glass-card rounded-2xl p-10 text-center shadow-card">
              <FileQuestion className="mx-auto h-8 w-8 text-ink-400" />
              <p className="mt-3 text-[13.5px] font-semibold text-ink-700">
                No assets attached yet
              </p>
              <p className="mt-1 text-[12px] text-ink-500">
                Files will appear here as the campaign progresses.
              </p>
            </section>
          )}
        </div>

        {/* Right sidebar — quick actions + status */}
        <aside className="col-span-12 space-y-5 rise rise-5 xl:col-span-4">
          <article className="glass-card rounded-2xl p-6 shadow-card">
            <header className="mb-3 flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cloud-100 text-cloud-700">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} />
              </span>
              <h4 className="font-display text-sm font-semibold text-ink-900">
                Quick Actions
              </h4>
            </header>
            <div className="space-y-1.5">
              <ActionBtn icon={<Upload className="h-3.5 w-3.5" />} label="Upload File" />
              <ActionBtn
                icon={<FolderOpen className="h-3.5 w-3.5" />}
                label="Create Folder"
              />
              <ActionBtn
                icon={<ExternalLink className="h-3.5 w-3.5" />}
                label="Request Missing Asset"
              />
            </div>
          </article>

          <article className="glass-card rounded-2xl p-6 shadow-card">
            <header className="mb-3 flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-iris-100 text-iris-600">
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.4} />
              </span>
              <h4 className="font-display text-sm font-semibold text-ink-900">
                Asset Readiness
              </h4>
            </header>
            <ul className="space-y-2 text-[12px]">
              <ReadinessRow label="Brief on file" done={scriptAssets.some((a) => /brief|guideline/i.test(a.name))} />
              <ReadinessRow label="Script attached" done={scriptAssets.some((a) => /script/i.test(a.name))} />
              <ReadinessRow label="Shot map planned" done={shotAssets.length > 0} />
              <ReadinessRow label="Reference imagery" done={scriptAssets.some((a) => a.type === "image")} />
              <ReadinessRow label="Final cut uploaded" done={false} />
            </ul>
          </article>

          <article className="glass-card rounded-2xl p-6 shadow-card">
            <header className="mb-2 flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-peach-100 text-peach-500">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} />
              </span>
              <h4 className="font-display text-sm font-semibold text-ink-900">
                Tip
              </h4>
            </header>
            <p className="text-[12px] leading-snug text-ink-700">
              Drop final exports into the{" "}
              <Link
                href="/assets"
                className="font-semibold text-iris-500 underline-offset-2 hover:underline"
              >
                Asset Vault
              </Link>{" "}
              with the <span className="font-mono">{campaign.slug}_</span> prefix so they auto-sort into this folder.
            </p>
          </article>
        </aside>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────

function AssetThumbCard({
  asset,
  campaignBrand,
}: {
  asset: AssetFile;
  campaignBrand: string;
}) {
  const cfg = typeOf(asset.type);
  return (
    <article className="group flex flex-col rounded-2xl border border-cloud-100 bg-white/85 p-3 shadow-card backdrop-blur transition hover:-translate-y-0.5 hover:shadow-soft">
      {/* Thumbnail block */}
      <div
        className={cn(
          "relative mb-3 grid h-24 w-full place-items-center overflow-hidden rounded-xl",
          cfg.thumb,
        )}
      >
        <div className="absolute inset-0 bg-grain opacity-30 mix-blend-overlay" />
        <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-ink-700 shadow-card backdrop-blur">
          {cfg.icon}
        </span>
        <span
          className={cn(
            "absolute right-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-[9.5px] font-bold tracking-wider ring-1",
            cfg.tag,
          )}
        >
          {cfg.label}
        </span>
      </div>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold leading-tight text-ink-900">
          {asset.name}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-ink-500">
          {campaignBrand}
          {asset.updated && (
            <span className="text-ink-400"> · updated {asset.updated}</span>
          )}
        </p>
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-[10.5px] uppercase tracking-[0.14em] text-ink-400">
          {asset.type}
        </span>
        <button
          type="button"
          className="rounded-full border border-ink-200 bg-white px-2.5 py-0.5 text-[10.5px] font-semibold text-ink-700 transition hover:border-cloud-400 hover:text-cloud-700"
        >
          Open
        </button>
      </div>
    </article>
  );
}

function KpiCard({
  tone,
  icon,
  label,
  value,
  sub,
}: {
  tone: "cloud" | "iris" | "orange" | "green" | "pink";
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
}) {
  const toneRing: Record<typeof tone, string> = {
    cloud: "from-white to-cloud-50 ring-cloud-200",
    iris: "from-white to-iris-50 ring-iris-200",
    orange: "from-white to-orange-50 ring-orange-200",
    green: "from-white to-emerald-50 ring-emerald-200",
    pink: "from-white to-cloud-50 ring-cloud-200",
  } as any;
  const toneIcon: Record<typeof tone, string> = {
    cloud: "bg-cloud-100 text-cloud-700",
    iris: "bg-iris-100 text-iris-600",
    orange: "bg-orange-100 text-orange-600",
    green: "bg-emerald-100 text-emerald-700",
    pink: "bg-cloud-200 text-cloud-700",
  } as any;
  return (
    <div
      className={cn(
        "rounded-2xl bg-gradient-to-br p-5 shadow-card ring-1",
        toneRing[tone],
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-500">
          {label}
        </p>
        <span
          className={cn(
            "grid h-7 w-7 place-items-center rounded-lg",
            toneIcon[tone],
          )}
        >
          {icon}
        </span>
      </div>
      <p className="mt-2 font-display text-[26px] leading-none tabular-nums text-ink-900">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-ink-500">{sub}</p>
    </div>
  );
}

function ActionBtn({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className="group flex w-full items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-left text-[12.5px] font-semibold text-ink-800 transition hover:border-cloud-400 hover:bg-cloud-50/60"
    >
      <span className="text-ink-500 transition group-hover:text-cloud-600">
        {icon}
      </span>
      {label}
    </button>
  );
}

function ReadinessRow({ label, done }: { label: string; done: boolean }) {
  return (
    <li className="flex items-center justify-between">
      <span className={cn("text-ink-800", done && "text-ink-500")}>{label}</span>
      {done ? (
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-3 w-3" strokeWidth={2.5} />
        </span>
      ) : (
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-ink-200/70 text-ink-500">
          <AlertTriangle className="h-2.5 w-2.5" strokeWidth={2.5} />
        </span>
      )}
    </li>
  );
}
