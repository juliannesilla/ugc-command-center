import Link from "next/link";
import { notFound } from "next/navigation";
import { CampaignHeader, CampaignTabs } from "@/components/campaigns/CampaignHeader";
import { getCampaign, scriptData, campaigns } from "@/lib/mock-data/campaigns";
import { FileText, Image as ImageIcon, Film, FileQuestion, ExternalLink } from "lucide-react";

export function generateStaticParams() {
  return Object.keys(campaigns).map((slug) => ({ slug }));
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  pdf:   <FileText className="h-4 w-4 text-rose-600" />,
  doc:   <FileText className="h-4 w-4 text-iris-500" />,
  image: <ImageIcon className="h-4 w-4 text-cloud-600" />,
  video: <Film className="h-4 w-4 text-amber-600" />,
};

export default async function AssetsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = getCampaign(slug);
  if (!campaign) notFound();
  const assets = (scriptData[campaign.slug] as any).assets ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <CampaignHeader campaign={campaign} />
      <CampaignTabs slug={campaign.slug} active="assets" />

      <section className="rise rise-1 mt-6">
        <header className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-ink-900">Campaign Assets</h2>
            <p className="text-[12.5px] text-ink-500">
              Files attached to this campaign. Full asset vault lives in{" "}
              <Link href="/assets" className="text-iris-500 underline-offset-2 hover:underline">
                Asset Vault
              </Link>{" "}
              (D-5).
            </p>
          </div>
          <Link
            href="/assets"
            className="inline-flex items-center gap-1 rounded-full bg-ink-900 px-3 py-1.5 text-[11.5px] font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-soft"
          >
            Open Asset Vault <ExternalLink className="h-3 w-3" />
          </Link>
        </header>

        <ul className="glass-card divide-y divide-cloud-100 overflow-hidden rounded-2xl shadow-card">
          {assets.length === 0 && (
            <li className="flex items-center gap-2 px-4 py-6 text-[12.5px] text-ink-500">
              <FileQuestion className="h-4 w-4" /> No assets attached yet.
            </li>
          )}
          {assets.map((a: any, i: number) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-cloud-50/60"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-cloud-100">
                  {TYPE_ICON[a.type] ?? <FileQuestion className="h-4 w-4 text-ink-500" />}
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-ink-900">{a.name}</p>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-500">
                    {a.type} · updated {a.updated}
                  </p>
                </div>
              </div>
              <button className="rounded-full border border-ink-300 px-3 py-1 text-[11px] font-semibold text-ink-700 transition hover:border-cloud-400 hover:text-cloud-700">
                Open
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
