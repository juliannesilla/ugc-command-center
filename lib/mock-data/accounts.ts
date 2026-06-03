// A.AA Wave 5 — Julz's social POSTING accounts + which campaigns post to each.
//
// "Accounts" per Julz ask #6 = her social channels where UGC gets posted/scheduled
// (NOT the agency marketplaces in _meta/15-platform-accounts.md). Cross-platform
// presence figures mirror the @geezjulz analytics (lib/mock-data/analytics.ts
// platform breakdown). Campaign↔account links are DERIVED from each canonical
// campaign's deliverable platform string (HR-49: canonical-derived, not new mock).

import summary from '@/data/tiktok-summary.json';
import { MOCK_CAMPAIGNS } from '@/lib/mock-data/campaigns';

export type PostingAccount = {
  id: string;
  platform: 'TikTok' | 'Instagram' | 'YouTube';
  handle: string;
  /** how the canonical deliverable string names this platform */
  match: string;
  posts: string;
  likes: string;
  comments: string;
  status: 'active' | 'paused';
};

/** Compact number -> "8.3K" / "1,845". Honest formatter, no rounding lies. */
function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

// REAL @geezjulz TikTok aggregates from data/tiktok-summary.json. TikTok is Julz's
// only connected channel with real data; Instagram/YouTube intentionally omitted
// (no real data -- HR-49, never fabricated).
export const POSTING_ACCOUNTS: PostingAccount[] = [
  {
    id: 'tiktok',
    platform: 'TikTok',
    handle: '@geezjulz',
    match: 'tiktok',
    posts: String(summary.total_posts ?? 0),
    likes: compact(Number(summary.likes ?? 0)),
    comments: compact(Number(summary.comments ?? 0)),
    status: 'active',
  },
];

type LinkedCampaign = { brand: string; status: string; stage?: string };

/** Campaigns whose deliverables (or platform field) target this account's platform.
 *  Fully defensive — tolerates any campaign/deliverable shape so it can't break the build. */
export function campaignsForAccount(acc: PostingAccount): LinkedCampaign[] {
  const out: LinkedCampaign[] = [];
  const needle = acc.match.toLowerCase();
  for (const c of (Array.isArray(MOCK_CAMPAIGNS) ? MOCK_CAMPAIGNS : []) as Record<string, unknown>[]) {
    const delivs = Array.isArray((c as { deliverables?: unknown }).deliverables)
      ? ((c as { deliverables: unknown[] }).deliverables)
      : [];
    const platformBlob = [
      ...delivs.map((d) => String((d as { platform?: unknown })?.platform ?? '')),
      String((c as { platform?: unknown }).platform ?? ''),
    ]
      .join(' ')
      .toLowerCase();
    if (platformBlob.includes(needle)) {
      out.push({
        brand: String((c as { brand?: unknown }).brand ?? (c as { brand_name?: unknown }).brand_name ?? 'Brand'),
        status: String((c as { status?: unknown }).status ?? ''),
        stage: (c as { current_stage?: unknown }).current_stage
          ? String((c as { current_stage: unknown }).current_stage)
          : undefined,
      });
    }
  }
  return out;
}
