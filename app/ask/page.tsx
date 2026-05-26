// A.14t T7 — /ask route. AI Q&A search engine over Julz's UGC data.
//
// Server component reads data/ask-history.jsonl at build/request time, passes
// recent Q&A pairs + example questions to the client ChatBox shell. The
// actual Claude call runs via `npm run ask -- "<query>"` (scripts/ask.mjs)
// to keep the API key off the browser. ChatBox builds the command string and
// auto-copies to clipboard so Julz can paste-and-run in one keystroke.
//
// HR-2 PRESERVE: matches sow-breakdown chrome (PageHeader only — no global
//   Header in this layout). Sidebar already mounted in root layout.tsx.
// HR-4 SMALLEST: no global Header wrap — existing routes don't use one here.
// HR-21 CITE = INVOKE: skills frontend-design, senior-backend, claude-api,
//   superpowers:verification-before-completion (cited at agent boot).
//
// Owner: A14T-T7-ASK.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { PageHeader } from '@/components/ui';
import ChatBox from '@/components/ask/ChatBox';

export const metadata = {
  title: 'Ask · UGC | Campaign HQ',
  description:
    'AI Q&A search engine over your UGC data — campaigns, SideShift, brand-fit, pillars.',
};

// Force dynamic so we re-read ask-history.jsonl on every visit (no stale answers).
export const dynamic = 'force-dynamic';

type AskHistoryEntry = {
  ts: string;
  run_id: string;
  query: string;
  answer: string;
  model: string;
  cost_estimate_usd: number;
};

async function loadHistory(): Promise<AskHistoryEntry[]> {
  try {
    const p = path.join(process.cwd(), 'data', 'ask-history.jsonl');
    const raw = await fs.readFile(p, 'utf8');
    const rows = raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        try { return JSON.parse(l); } catch { return null; }
      })
      .filter((r): r is Record<string, unknown> => r !== null);
    // Filter out schema header row (no run_id), keep only Q&A entries.
    return rows
      .filter((r) => typeof r.run_id === 'string' && typeof r.query === 'string')
      .map((r) => r as unknown as AskHistoryEntry)
      .sort((a, b) => b.ts.localeCompare(a.ts))
      .slice(0, 5);
  } catch {
    return [];
  }
}

const EXAMPLE_QUESTIONS = [
  "Which brands haven't replied in over a week?",
  "What's my highest-paying active campaign?",
  "Summarize ParakeetAI's SOW",
  "Which @geezjulz pillar performs best?",
  "Which SideShift threads need a reply today?",
  "What's my average payment-terms days across active campaigns?",
];

export default async function AskPage() {
  const history = await loadHistory();

  return (
    <>
      <PageHeader
        eyebrow="AI Q&A over your UGC data"
        title="Ask"
        subtitle="Type any question about your business — campaigns, SideShift, brand-fit, pillars. Claude answers from your own data, citing files."
      />
      <ChatBox
        history={history}
        exampleQuestions={EXAMPLE_QUESTIONS}
      />
    </>
  );
}
