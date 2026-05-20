// Linear data-sync (STUB). Returns mocks today.
//
// ── Live swap procedure (future Julz) ────────────────────────────────────────
// 1. Add LINEAR_API_TOKEN to .env.local + GitHub Actions secret.
// 2. Replace the `return MOCK_PIPELINE...` line below with a fetch to
//    https://api.linear.app/graphql against project id 8bcb55fa-5766-4c9f-80e3-a32604b23733
//    ("UGC Pipeline").
// 3. Map Linear issues → Campaign[] (preserve `id`, `brand`, `status`, etc.).
// 4. DO NOT read from any other Linear project. Workspace isolation is enforced.
//
// ── Forbidden paths (NEVER touch from this file) ─────────────────────────────
//   - julz-vault/, julz-command-center/, household/, identity-theft/, post-hdmz/, RJ-*
//
// ── Allowed sources ──────────────────────────────────────────────────────────
//   - Linear project id 8bcb55fa-5766-4c9f-80e3-a32604b23733 only

import type { Campaign } from './types';
import { MOCK_CAMPAIGN_FOLDERS } from '@/lib/mock-data/assets';

export const UGC_LINEAR_PROJECT_ID = '8bcb55fa-5766-4c9f-80e3-a32604b23733';

export async function fetchPipeline(): Promise<Campaign[]> {
  // TODO(LINEAR_API_TOKEN swap): hit Linear GraphQL, filter by project id.
  return Promise.resolve(MOCK_CAMPAIGN_FOLDERS);
}
