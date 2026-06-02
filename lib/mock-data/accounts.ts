// A.AA Wave 5 — Julz's social POSTING accounts + which campaigns post to each.
//
// "Accounts" per Julz ask #6 = her social channels where UGC gets posted/scheduled
// (NOT the agency marketplaces in _meta/15-platform-accounts.md). Cross-platform
// presence figures mirror the @geezjulz analytics (lib/mock-data/analytics.ts
// platform breakdown). Campaign↔account links are DERIVED from each canonical
// campaign's deliverable platform string (HR-49: canonical-derived, not new mock).

import { MOCK_CAMPAIGNS } from '@/lib/mock-data/campaigns';

export type PostingAccount = {
  id: string;
  platform: 'TikTok' | 'Instagram' | 'YouTube';
  handle: string;
  /** how the canonical deliverable string names this platform */
  match: string;
  followersDelta: string;
  views30d: string;
  engagement: string;
  status: 'active' | 'paused';
};

// Source: analytics.ts platform breakdown (@geezjulz). Single handle across channels.
export const POSTING_ACCOUNTS: PostingAccount[] = [
  { id: 'tiktok',    platform: 'TikTok',    handle: '@geezjulz', match: 'tiktok', followersDelta: '+1,842', views30d: '748K', engagement: '5.6%', status: 'active' },
  { id: 'instagram', platform: 'Instagram', handle: '@geezjulz', match: 'reels',  followersDelta: '+912',   views30d: '312K', engagement: '4.2%', status: 'active' },
  { id: 'youtube',   platform: 'YouTube',   handle: '@geezjulz', match: 'shorts', followersDelta: '+436',   views30d: '182K', engagement: '3.8%', status: 'active' },
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
