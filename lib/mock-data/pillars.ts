// A.14t T4 PILLARS: @geezjulz TikTok content-pillar performance data.
// SOURCE: julz-vault/01-WORK-CURRENT/social-media/tiktok_data_enhanced.csv
// (42 posts, classified by PILLAR column). Aggregated via PowerShell on
// 2026-05-26. Real data, not mocked — HR-10 compliant.

export interface PillarRow {
  pillar: string;
  /** Short label for chart axis (chart-friendly truncation). */
  label: string;
  posts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  /** Avg likes per post (rounded 1dp). */
  avgLikes: number;
  /** Avg engagement (likes + comments + shares) per post. */
  avgEngagement: number;
}

export const PILLAR_DATA: PillarRow[] = [
  {
    pillar: 'WFH | corporate marketing girlie',
    label: 'WFH girlie',
    posts: 14,
    totalLikes: 5557,
    totalComments: 1379,
    totalShares: 0,
    avgLikes: 396.9,
    avgEngagement: 495.4,
  },
  {
    pillar: 'Unclassified',
    label: 'Unclassified',
    posts: 20,
    totalLikes: 2170,
    totalComments: 365,
    totalShares: 0,
    avgLikes: 108.5,
    avgEngagement: 126.8,
  },
  {
    pillar: 'home: organization | decor',
    label: 'Home: org/decor',
    posts: 3,
    totalLikes: 235,
    totalComments: 62,
    totalShares: 0,
    avgLikes: 78.3,
    avgEngagement: 99.0,
  },
  {
    pillar: 'eldest daughter series',
    label: 'Eldest daughter',
    posts: 3,
    totalLikes: 207,
    totalComments: 18,
    totalShares: 0,
    avgLikes: 69.0,
    avgEngagement: 75.0,
  },
  {
    pillar: 'motivational quotes | mindset',
    label: 'Motivation',
    posts: 1,
    totalLikes: 74,
    totalComments: 9,
    totalShares: 0,
    avgLikes: 74.0,
    avgEngagement: 83.0,
  },
  {
    pillar: 'home: cleaning | decluttering',
    label: 'Home: cleaning',
    posts: 1,
    totalLikes: 70,
    totalComments: 12,
    totalShares: 0,
    avgLikes: 70.0,
    avgEngagement: 82.0,
  },
];

export const PILLAR_TOTALS = {
  totalPosts: 42,
  totalLikes: 8313,
  totalComments: 1845,
  classifiedPosts: 22,
  unclassifiedPosts: 20,
  topPillar: 'WFH | corporate marketing girlie',
  topPillarAvgEngagement: 495.4,
};
