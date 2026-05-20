// n8n data-sync (STUB). Returns mocks today.
//
// ── Live swap procedure ──────────────────────────────────────────────────────
// 1. Add N8N_API_TOKEN to .env.local + GitHub Actions secret.
// 2. Replace stub with fetch to https://app.n8n.cloud/api/v1/workflows?tag=UGC.
// 3. Map n8n workflows → Workflow[].
// 4. Only workflows tagged "UGC" are allowed sources.
//
// ── Forbidden paths ──────────────────────────────────────────────────────────
//   - Any non-UGC tagged n8n workflows
//   - Personal automations (household, finance, identity-theft, etc.)

import type { Workflow } from './types';

const MOCK_WORKFLOWS: Workflow[] = [
  { id: 'wf1', name: 'Brand Email Intake → Linear',  status: 'Inactive', successRate7d: 0,    lastRun: '2026-05-12T09:00:00Z' },
  { id: 'wf2', name: 'SOW PDF Parser',                status: 'Inactive', successRate7d: 0,    lastRun: '2026-05-12T09:00:00Z' },
  { id: 'wf3', name: 'Deadline Heatmap Refresh',      status: 'Inactive', successRate7d: 0,    lastRun: '2026-05-12T09:00:00Z' },
  { id: 'wf4', name: 'Asset Storage → Markdown Mirror', status: 'Inactive', successRate7d: 0, lastRun: '2026-05-12T09:00:00Z' },
];

export async function fetchWorkflows(): Promise<Workflow[]> {
  // TODO(N8N_API_TOKEN swap): hit n8n REST API, filter to UGC tag.
  return Promise.resolve(MOCK_WORKFLOWS);
}
