import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  FolderOpen,
  PlusCircle,
} from 'lucide-react';
import { StatusChip } from '@/components/ui/status-chip';
import { ReadOnlyMirrorBadge } from '@/components/ui/read-only-mirror-badge';
import { MantraQuote } from '@/components/ui/mantra-quote';
import {
  CampaignFolderCard,
  NewCampaignFolderCard,
} from '@/components/assets/CampaignFolderCard';
import { AssetCard } from '@/components/assets/AssetRow';
import { AssetHealthDonut } from '@/components/assets/AssetHealthDonut';
import { AssetTipsCard } from '@/components/assets/AssetTipsCard';
import { RecentActivityList } from '@/components/assets/RecentActivityList';
import { QuickActionsCard } from '@/components/assets/QuickActionsCard';
import {
  MOCK_CAMPAIGN_FOLDERS,
  MOCK_RECENT_ASSETS,
  MOCK_ASSET_NEXT_MOVES,
  AGGREGATE,
  ASSET_FILTER_TABS,
} from '@/lib/mock-data/assets';
import { cn } from '@/lib/utils';

export const metadata = { title: 'Asset Vault · UGC | Campaign HQ' };

const STAT_CARDS = [
  {
    label: 'Total Assets',
    value: AGGREGATE.total.toLocaleString(),
    sub: 'In the vault',
    tone: 'cloud',
    Icon: FolderOpen,
  },
  {
    label: 'Brand Folders',
    value: AGGREGATE.brandFolders,
    sub: 'Active campaigns',
    tone: 'iris',
    Icon: FolderOpen,
  },
  {
    label: 'Priority — Needs Attention',
    value: AGGREGATE.missing,
    sub: 'Require attention',
    tone: 'orange',
    Icon: AlertTriangle,
  },
  {
    label: 'Ready to Send',
    value: AGGREGATE.readyToSend,
    sub: 'Cleared for brands',
    tone: 'green',
    Icon: CheckCircle2,
  },
  {
    label: 'Storage Used',
    value: `${AGGREGATE.storageUsedGB} GB`,
    sub: `of ${AGGREGATE.storageCapGB} GB · ${AGGREGATE.storagePct}%`,
    tone: 'pink',
    Icon: HardDrive,
  },
] as const;

const statTones: Record<string, string> = {
  cloud:  'from-white to-cloud-50 ring-cloud-200',
  iris:   'from-white to-iris-50  ring-iris-200',
  orange: 'from-white to-orange-50 ring-orange-200',
  green:  'from-white to-emerald-50 ring-emerald-200',
  pink:   'from-white to-cloud-50 ring-cloud-200',
};

const statIconTones: Record<string, string> = {
  cloud:  'bg-cloud-100  text-cloud-700',
  iris:   'bg-iris-100   text-iris-600',
  orange: 'bg-orange-100 text-orange-600',
  green:  'bg-emerald-100 text-emerald-700',
  pink:   'bg-cloud-200  text-cloud-700',
};

export default function AssetsPage() {
  return (
    <>
      {/* Header */}
      <header className="header-cloud px-6 md:px-8 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/80 mb-2">
                Asset Vault
              </p>
              <h1 className="font-display text-white text-3xl md:text-4xl leading-tight drop-shadow-sm">
                Asset Vault
              </h1>
              <p className="mt-2 text-[13px] text-white/85 max-w-xl">
                Store and organize every file for your UGC campaigns.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <ReadOnlyMirrorBadge />
              <MantraQuote />
            </div>
          </div>
        </header>

        <main className="px-6 md:px-8 py-6 space-y-6">
          {/* Stat cards */}
          <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 rise rise-1">
            {STAT_CARDS.map(({ label, value, sub, tone, Icon }) => (
              <div
                key={label}
                className={cn(
                  'rounded-2xl bg-gradient-to-br p-4 shadow-card ring-1',
                  statTones[tone],
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10.5px] uppercase tracking-[0.16em] text-ink-500 font-semibold">
                    {label}
                  </p>
                  <span className={cn('grid h-7 w-7 place-items-center rounded-lg', statIconTones[tone])}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <p className="mt-2 font-display text-[30px] text-ink-900 leading-none tabular-nums">
                  {value}
                </p>
                <p className="mt-1 text-[11px] text-ink-500">{sub}</p>
              </div>
            ))}
          </section>

          {/* Your Next Move */}
          <section className="rounded-3xl bg-gradient-to-br from-white via-cloud-50 to-iris-50 p-5 ring-1 ring-cloud-200 shadow-card rise rise-2">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-cloud-700 font-bold">
                  Your Next Move
                </p>
                <p className="mt-0.5 font-display text-[18px] text-ink-900">
                  Two priority asset tasks today
                </p>
              </div>
              <a href="#" className="inline-flex items-center gap-1 text-[12px] font-semibold text-cloud-700 hover:text-cloud-600">
                View All Next Moves (5)
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-3">
              {MOCK_ASSET_NEXT_MOVES.map(t => {
                const accent = t.accent === 'pink'
                  ? 'from-cloud-100 to-white'
                  : t.accent === 'iris'
                    ? 'from-iris-100 to-white'
                    : 'from-peach-100 to-white';
                return (
                  <article
                    key={t.id}
                    className={cn(
                      'flex items-start gap-4 rounded-2xl bg-gradient-to-br p-4 ring-1 ring-white/60 shadow-card',
                      accent,
                    )}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cloud-sunset text-white shadow-glow">
                      <PlusCircle className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-[15px] text-ink-900 leading-tight">
                        {t.title}
                      </p>
                      <p className="mt-1 text-[12px] text-ink-600">{t.context}</p>
                      <a
                        href={t.ctaHref}
                        className="mt-2 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11.5px] font-semibold text-cloud-700 ring-1 ring-cloud-200 hover:bg-cloud-50 transition shadow-card"
                      >
                        {t.ctaLabel}
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Filter tabs */}
          <section className="rise rise-3">
            <div className="flex flex-wrap gap-1.5 rounded-2xl bg-white/70 backdrop-blur p-1.5 border border-cloud-100 shadow-card overflow-x-auto">
              {ASSET_FILTER_TABS.map((tab, i) => (
                <button
                  key={tab.id}
                  type="button"
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-[12px] font-semibold whitespace-nowrap transition',
                    i === 0
                      ? 'bg-cloud-sunset text-white shadow-card'
                      : 'text-ink-600 hover:bg-cloud-50 hover:text-ink-900',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </section>

          {/* Search + filters row */}
          <section className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input
                type="search"
                placeholder="Search assets, briefs, scripts…"
                className="w-full rounded-2xl border border-cloud-200 bg-white/85 pl-9 pr-3 py-2.5 text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-cloud-300 focus:border-cloud-300 transition"
              />
            </div>
            {['All Campaigns', 'All File Types', 'All Statuses'].map(label => (
              <button
                key={label}
                type="button"
                className="inline-flex items-center gap-1.5 rounded-2xl border border-cloud-200 bg-white/85 px-3 py-2.5 text-[12.5px] font-semibold text-ink-700 hover:bg-cloud-50 transition"
              >
                {label}
                <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
              </button>
            ))}
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-ink-900 px-3 py-2.5 text-[12.5px] font-semibold text-white hover:bg-ink-800 transition"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </button>
          </section>

          {/* Main + sidebar grid */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 xl:col-span-8 space-y-6 rise rise-4">
              {/* Count + sort row */}
              <div className="flex items-center justify-between">
                <p className="text-[13px] text-ink-600">
                  <span className="font-display text-[18px] text-ink-900 mr-1">{AGGREGATE.total.toLocaleString()}</span>
                  assets
                </p>
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-1.5 rounded-xl border border-cloud-200 bg-white px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-700">
                    Sort: Recently Added
                    <ChevronDown className="h-3 w-3 text-ink-400" />
                  </button>
                  <div className="flex rounded-xl border border-cloud-200 bg-white p-0.5">
                    <button className="grid h-7 w-7 place-items-center rounded-lg bg-cloud-100 text-cloud-700">
                      <LayoutGrid className="h-3.5 w-3.5" />
                    </button>
                    <button className="grid h-7 w-7 place-items-center rounded-lg text-ink-400 hover:bg-cloud-50">
                      <List className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Campaign Folders */}
              <section>
                <h2 className="font-display text-[18px] text-ink-900 mb-3">Campaign Folders</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-5 gap-3">
                  {MOCK_CAMPAIGN_FOLDERS.map(f => (
                    <CampaignFolderCard key={f.id} folder={f} />
                  ))}
                  <NewCampaignFolderCard />
                </div>
              </section>

              {/* Recently Added Assets */}
              <section>
                <div className="flex items-baseline justify-between mb-3">
                  <h2 className="font-display text-[18px] text-ink-900">Recently Added Assets</h2>
                  <StatusChip tone="iris">{MOCK_RECENT_ASSETS.length} files</StatusChip>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {MOCK_RECENT_ASSETS.map(a => (
                    <AssetCard key={a.id} asset={a} />
                  ))}
                </div>
              </section>
            </div>

            {/* Right sidebar */}
            <aside className="col-span-12 xl:col-span-4 space-y-4 rise rise-4">
              <AssetHealthDonut />
              <RecentActivityList />
              <AssetTipsCard />
              <QuickActionsCard />
            </aside>
          </div>
        </main>
    </>
  );
}
