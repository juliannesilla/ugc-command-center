// A.AA Wave 5 — /accounts — ACCOUNTS & DEAL SOURCES (Julz ask #6, grounded half).
//
// Tracks every platform account your deals come THROUGH (SideShift, Gmail-direct,
// Brkfst, Aspire, GRIN, BrandConnect, #paid) — which campaigns are connected to
// each, total value, and status. Data-driven: groups data/brands-canonical.jsonl
// by `pipeline_source`, enriched with your platform SOP (15-platform-accounts.md).
//
// NOTE (honest scope, HR-10): the *posting-account* side of #6 — where content is
// SCHEDULED per social account + per-post status — has no data in the repo yet, so
// it's intentionally not faked here. Drop a posting-accounts list and ELON wires it.
//
// Skills: frontend-design, refactoring-ui (card hierarchy, de-emphasized meta,
//   constrained width, lavender tokens), data:build-dashboard.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { PageHeader } from '@/components/ui';
import { StatusChip } from '@/components/ui/status-chip';
import { formatMoney } from '@/lib/utils';
import { Globe, Mail, ShoppingBag, Youtube, Users, Heart, MessageCircle, Clapperboard } from 'lucide-react';
import { POSTING_ACCOUNTS, campaignsForAccount } from '@/lib/mock-data/accounts';

type Brand = {
  brand_name_canonical?: string;
  status?: string;
  contract_signed?: boolean;
  payment_amount_usd?: number;
  pipeline_source?: unknown;
  dashboard_visible?: boolean;
};

// Platform metadata from UGC/_meta/15-platform-accounts.md (source-of-truth SOP).
const PLATFORMS: Record<
  string,
  { name: string; kind: string; login: string; url?: string; icon: typeof Globe }
> = {
  sideshift: { name: 'SideShift', kind: 'Creator marketplace', login: 'Google SSO · julianne.mktg@gmail.com', url: 'https://app.sideshift.app', icon: Globe },
  'gmail-direct': { name: 'Gmail — direct outreach', kind: 'Direct email', login: 'julianne.mktg@gmail.com', icon: Mail },
  brkfst: { name: 'Brkfst.io', kind: 'Marketplace', login: 'Email + password', url: 'https://brkfst.io', icon: ShoppingBag },
  aspire: { name: 'Aspire', kind: 'Influencer platform', login: 'Email + password', url: 'https://app.aspireiq.com', icon: Users },
  grin: { name: 'GRIN', kind: 'Creator-management SaaS', login: 'Per-brand portal', url: 'https://app.grin.co', icon: Users },
  brandconnect: { name: 'YouTube BrandConnect', kind: 'YouTube sponsorship', login: 'Google SSO', url: 'https://www.youtube.com/brandconnect', icon: Youtube },
  hashtagpaid: { name: '#paid', kind: 'Influencer marketplace', login: 'Email + password', url: 'https://www.hashtagpaid.com/creator', icon: Users },
};

function normalizeSource(src: unknown): string {
  if (Array.isArray(src)) return normalizeSource(src[0]);
  if (typeof src === 'string' && src.trim()) {
    const s = src.trim().toLowerCase();
    if (s.includes('paid')) return 'hashtagpaid';
    return s;
  }
  return 'other';
}

function statusTone(status?: string): 'green' | 'iris' | 'yellow' | 'cloud' {
  const s = (status ?? '').toLowerCase();
  if (s === 'paid' || s === 'signed') return 'green';
  if (s === 'submitted' || s === 'in_negotiation' || s === 'negotiating') return 'iris';
  if (s === 'intake' || s === 'in_progress') return 'yellow';
  return 'cloud';
}

async function loadBrands(): Promise<Brand[]> {
  try {
    const p = path.join(process.cwd(), 'data', 'brands-canonical.jsonl');
    const raw = await fs.readFile(p, 'utf8');
    return raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l) as Brand;
        } catch {
          return null;
        }
      })
      .filter((b): b is Brand => !!b && typeof b.brand_name_canonical === 'string');
  } catch {
    return [];
  }
}

export const metadata = {
  title: 'Accounts · UGC | Campaign HQ',
  description: 'Platform accounts + deal sources — which campaigns come through each, value, and status.',
};

export default async function AccountsPage() {
  const brands = (await loadBrands()).filter((b) => b.dashboard_visible !== false);

  const groups = new Map<string, Brand[]>();
  for (const b of brands) {
    const key = normalizeSource(b.pipeline_source);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(b);
  }

  const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);

  return (
    <>
      <PageHeader
        eyebrow="Accounts & deal sources"
        title="Accounts"
        subtitle="Every platform your deals come through — connected campaigns, value, and status."
      />

      {/* Posting channels — where your content goes */}
      <section className="px-5 md:px-10 pt-2 pb-6 max-w-5xl">
        <h2 className="stat-label text-ink-700 mb-3">Posting channels</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {POSTING_ACCOUNTS.map((acc) => {
            const linked = campaignsForAccount(acc);
            return (
              <div key={acc.id} className="card-flat">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-[15px] font-bold text-ink-900">{acc.platform}</p>
                  <span className="text-[11px] text-ink-600">{acc.handle}</span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-[12px] text-ink-700">
                  <span className="inline-flex items-center gap-1"><Clapperboard className="h-3.5 w-3.5 text-ink-500" />{acc.posts} posts</span>
                  <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-ink-500" />{acc.likes}</span>
                  <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5 text-ink-500" />{acc.comments}</span>
                </div>
                <p className="mt-2 text-[12px] text-ink-600">{linked.length} campaign{linked.length === 1 ? '' : 's'} posting here</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Deal sources — where opportunities come through */}
      <section className="px-5 md:px-10 pb-16 max-w-5xl space-y-5">
        <h2 className="stat-label text-ink-700">Deal sources</h2>
        {sorted.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 shadow-card ring-1 ring-cloud-100 text-ink-600">
            No accounts to show yet.
          </div>
        ) : (
          sorted.map(([key, list]) => {
            const meta = PLATFORMS[key] ?? { name: key === 'other' ? 'Other / direct' : key, kind: 'Source', login: '—', icon: Globe };
            const Icon = meta.icon;
            const value = list.reduce((sum, b) => sum + (Number(b.payment_amount_usd) || 0), 0);
            const signed = list.filter((b) => b.contract_signed === true).length;
            return (
              <article key={key} className="rounded-3xl bg-white shadow-card ring-1 ring-cloud-200/70 overflow-hidden">
                {/* Account header */}
                <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-cloud-soft/60 border-b border-cloud-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-cloud-600 ring-1 ring-cloud-200 shadow-card">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-display text-[17px] font-bold text-ink-900 truncate">{meta.name}</h2>
                      <p className="text-[11.5px] text-ink-600 truncate">
                        {meta.kind} · {meta.login}
                        {meta.url ? (
                          <>
                            {' · '}
                            <a href={meta.url} target="_blank" rel="noreferrer" className="text-cloud-700 hover:underline">open</a>
                          </>
                        ) : null}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 text-right">
                    <div>
                      <p className="font-display text-[20px] font-bold text-ink-900 leading-none tabular-nums">{list.length}</p>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-ink-600 mt-1">campaigns</p>
                    </div>
                    <div>
                      <p className="font-display text-[20px] font-bold text-cloud-700 leading-none tabular-nums">{value > 0 ? formatMoney(value) : '—'}</p>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-ink-600 mt-1">value</p>
                    </div>
                    <div>
                      <p className="font-display text-[20px] font-bold text-emerald-600 leading-none tabular-nums">{signed}</p>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-ink-600 mt-1">signed</p>
                    </div>
                  </div>
                </header>

                {/* Connected campaigns */}
                <ul className="divide-y divide-cloud-50">
                  {list.slice(0, 12).map((b, i) => (
                    <li key={`${b.brand_name_canonical}-${i}`} className="flex items-center justify-between gap-3 px-5 py-2.5">
                      <span className="text-[13.5px] font-medium text-ink-900 truncate">{b.brand_name_canonical}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        {b.payment_amount_usd ? (
                          <span className="text-[12px] text-ink-600 tabular-nums">{formatMoney(Number(b.payment_amount_usd))}</span>
                        ) : null}
                        <StatusChip tone={statusTone(b.status)}>{b.status ?? 'lead'}</StatusChip>
                      </div>
                    </li>
                  ))}
                  {list.length > 12 ? (
                    <li className="px-5 py-2 text-[12px] text-ink-600 italic">+ {list.length - 12} more</li>
                  ) : null}
                </ul>
              </article>
            );
          })
        )}

        <p className="text-[12px] text-ink-600 leading-relaxed max-w-2xl pt-1">
          <strong>Posting channels</strong> (top) = where your content goes (@geezjulz reach + campaigns per channel).{' '}
          <strong>Deal sources</strong> = where opportunities come through. Per-post scheduling lives on the{' '}
          <span className="font-medium text-cloud-700">Scheduling</span> tab.
        </p>
      </section>
    </>
  );
}
