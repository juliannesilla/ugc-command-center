// Phase A.14e Wave 4 (E9) — Sort options for CRM view.
// Source spec: 02-campaign-pipeline-views-architecture.md L737–L742.

import type { Campaign } from '@/lib/types/campaign';

export type SortKey =
  | 'followup_date'
  | 'repeat_potential'
  | 'brand_fit_score'
  | 'last_message_date';

export const SORT_LABEL: Record<SortKey, string> = {
  followup_date:     'Follow-up date',
  repeat_potential:  'Repeat potential',
  brand_fit_score:   'Brand fit score',
  last_message_date: 'Last message date',
};

const REPEAT_RANK: Record<string, number> = { high: 3, medium: 2, low: 1 };

export function sortCampaigns(rows: Campaign[], key: SortKey): Campaign[] {
  const sorted = [...rows];
  switch (key) {
    case 'followup_date':
      // Earliest follow-up first; missing dates go to the bottom.
      sorted.sort((a, b) => {
        const av = a.follow_up_date ?? '9999-12-31';
        const bv = b.follow_up_date ?? '9999-12-31';
        return av.localeCompare(bv);
      });
      break;
    case 'repeat_potential':
      sorted.sort(
        (a, b) =>
          (REPEAT_RANK[b.repeat_potential ?? ''] ?? 0) -
          (REPEAT_RANK[a.repeat_potential ?? ''] ?? 0),
      );
      break;
    case 'brand_fit_score':
      sorted.sort((a, b) => (b.brand_fit_score ?? 0) - (a.brand_fit_score ?? 0));
      break;
    case 'last_message_date':
      // Most-recent first.
      sorted.sort((a, b) => {
        const av = a.last_message_date ?? '0000-01-01';
        const bv = b.last_message_date ?? '0000-01-01';
        return bv.localeCompare(av);
      });
      break;
  }
  return sorted;
}
