import Link from "next/link";
import { StatusChip } from "@/components/ui/status-chip";
import { CampaignMeta } from "@/lib/mock-data/campaigns";
import { formatMoney } from "@/lib/utils";
import { Calendar, DollarSign, TrendingUp } from "lucide-react";

function statusTone(s: CampaignMeta["status"]) {
  switch (s) {
    case "Active":     return "green" as const;
    case "Drafting":   return "iris"  as const;
    case "In Review":  return "yellow" as const;
    case "Submitted":  return "blue"  as const;
    case "Paid":       return "pink"  as const;
  }
}

function fmtDateRange(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const s = new Date(start).toLocaleDateString("en-US", opts);
  const e = new Date(end).toLocaleDateString("en-US", { ...opts, year: "numeric" });
  return `${s} – ${e}`;
}

export function CampaignHeader({ campaign }: { campaign: CampaignMeta }) {
  const pct = Math.round(
    (campaign.sowProgress.complete / campaign.sowProgress.total) * 100,
  );

  return (
    <header className="rise overflow-hidden rounded-3xl bg-cloud-soft p-[1px] shadow-soft">
      <div className="grid grid-cols-1 gap-4 rounded-[23px] bg-white/90 p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-center gap-4">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-display text-2xl font-bold text-white shadow-glow"
            style={{ backgroundColor: campaign.accent }}
            aria-hidden
          >
            {campaign.logoMark}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusChip tone={statusTone(campaign.status)}>{campaign.status}</StatusChip>
              <StatusChip tone="pink">{campaign.category}</StatusChip>
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold leading-tight text-ink-900">
              {campaign.brand}
            </h1>
            <p className="text-[13px] text-ink-600">{campaign.product}</p>
          </div>
        </div>

        <dl className="flex flex-wrap items-start gap-x-6 gap-y-3 md:justify-end">
          <Stat icon={<Calendar className="h-3.5 w-3.5" />} label="Campaign Dates">
            {fmtDateRange(campaign.startDate, campaign.dueDate)}
          </Stat>
          <Stat icon={<DollarSign className="h-3.5 w-3.5" />} label="Payment">
            <span className="font-mono">
              {formatMoney(campaign.payment.base)}
              {campaign.payment.bonus > 0 && (
                <>
                  <span className="text-ink-400"> + </span>
                  {formatMoney(campaign.payment.bonus)}
                  <span className="text-[10.5px] text-ink-500"> bonus</span>
                </>
              )}
            </span>
          </Stat>
          <div className="min-w-[180px]">
            <p className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-500">
              <TrendingUp className="h-3.5 w-3.5" /> SOW Progress
            </p>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-300/30">
                <div className="h-full rounded-full bg-cloud-sunset" style={{ width: `${pct}%` }} />
              </div>
              <span className="font-mono text-[11px] font-bold text-ink-700">
                {campaign.sowProgress.complete}/{campaign.sowProgress.total}
              </span>
            </div>
            <p className="mt-0.5 text-[10.5px] text-ink-500">{pct}% complete</p>
          </div>
        </dl>
      </div>
    </header>
  );
}

function Stat({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-500">
        {icon} {label}
      </dt>
      <dd className="mt-0.5 text-[13px] font-semibold text-ink-900">{children}</dd>
    </div>
  );
}

export function CampaignTabs({ slug, active }: { slug: string; active: "overview" | "sow" | "production" | "assets" }) {
  const tabs = [
    { id: "overview" as const,   label: "Overview",    href: `/campaigns/${slug}` },
    { id: "sow" as const,        label: "SOW",         href: `/campaigns/${slug}/sow` },
    { id: "production" as const, label: "Production",  href: `/campaigns/${slug}/production` },
    { id: "assets" as const,     label: "Assets",      href: `/campaigns/${slug}/assets` },
  ];
  return (
    <nav className="rise rise-1 mt-4 flex gap-1 rounded-full border border-cloud-200 bg-white/70 p-1 shadow-card backdrop-blur">
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <Link
            key={t.id}
            href={t.href}
            className={`flex-1 rounded-full px-4 py-2 text-center text-[12.5px] font-semibold transition ${
              isActive
                ? "bg-cloud-sunset text-white shadow-card"
                : "text-ink-600 hover:bg-cloud-50 hover:text-ink-900"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
