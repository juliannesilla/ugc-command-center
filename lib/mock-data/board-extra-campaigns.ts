// Phase A.14u F5-STRIP-MOCKS (2026-05-27, Julz directive): emptied.
//
// Was: ~40 synthetic kanban cards (Caraway, Olipop, Drunk Elephant, Glossier,
// Liquid Death, Rare Beauty, etc.) added in A.14n Wave 2b to hit mockup
// density. Per Julz: "if it is not a real campaign, then take it off the
// dashboard." Empty array = honest single-card board (just ParakeetAI from
// MOCK_CAMPAIGNS). Density returns when real campaigns get added via chat.

import type { Campaign } from '@/lib/types/campaign';

export const BOARD_EXTRA_CAMPAIGNS: Campaign[] = [];
