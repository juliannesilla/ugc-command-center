// A.AA Wave 7 — /initiatives — the TEAM INITIATIVE / APPROVAL tab (Julz ask #4).
//
// Surfaces every team recommendation with approve/deny status so Julz can see, in
// one place, what the team wants to do and what still needs her sign-off. Reads
// the repo-local data/initiatives.jsonl at build time (refreshes on next deploy).
//
// Skills: frontend-design, refactoring-ui (de-emphasize labels, emphasize the
//   recommendation; constrain width; lavender tokens), ux-heuristics (visibility
//   of system status via clear badges).

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { PageHeader } from '@/components/ui';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

type Initiative = {
  id: string;
  item: string;
  agent: string;
  recommendation: string;
  reason: string;
  status: 'approved' | 'pending-approval' | 'denied';
  decided_by?: string;
};

async function loadInitiatives(): Promise<Initiative[]> {
  try {
    const p = path.join(process.cwd(), 'data', 'initiatives.jsonl');
    const raw = await fs.readFile(p, 'utf8');
    return raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l) as Record<string, unknown>;
        } catch {
          return null;
        }
      })
      .filter((r): r is Initiative => !!r && typeof (r as Initiative).id === 'string')
      .map((r) => r as Initiative);
  } catch {
    return [];
  }
}

const STATUS_META: Record<
  Initiative['status'],
  { label: string; chip: string; Icon: typeof CheckCircle2; rank: number }
> = {
  'pending-approval': {
    label: 'Needs your approval',
    chip: 'bg-amber-100 text-amber-800 ring-amber-200',
    Icon: Clock,
    rank: 0,
  },
  approved: {
    label: 'Approved',
    chip: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    Icon: CheckCircle2,
    rank: 1,
  },
  denied: {
    label: 'Denied',
    chip: 'bg-rose-100 text-rose-800 ring-rose-200',
    Icon: XCircle,
    rank: 2,
  },
};

export const metadata = {
  title: 'Approvals · UGC | Campaign HQ',
  description: 'Team initiatives + recommendations awaiting your approve / deny.',
};

export default async function InitiativesPage() {
  const items = await loadInitiatives();
  const sorted = [...items].sort(
    (a, b) => STATUS_META[a.status].rank - STATUS_META[b.status].rank,
  );
  const pending = items.filter((i) => i.status === 'pending-approval').length;

  return (
    <>
      <PageHeader
        eyebrow="Team initiatives"
        title="Approvals"
        subtitle={
          pending > 0
            ? `${pending} recommendation${pending === 1 ? '' : 's'} waiting on your approve / deny.`
            : 'Everything the team wants to do — approve or deny in one place.'
        }
      />

      <section className="px-5 md:px-10 pb-16 max-w-5xl">
        <div className="overflow-x-auto rounded-3xl bg-white shadow-card ring-1 ring-cloud-200/70">
          <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-cloud-50/70 text-[10.5px] uppercase tracking-[0.14em] text-ink-600">
                <th className="px-4 py-3 font-semibold border-b border-cloud-100">Status</th>
                <th className="px-4 py-3 font-semibold border-b border-cloud-100">Recommendation</th>
                <th className="px-4 py-3 font-semibold border-b border-cloud-100">Agent</th>
                <th className="px-4 py-3 font-semibold border-b border-cloud-100">Why</th>
                <th className="px-4 py-3 font-semibold border-b border-cloud-100">Approve / Deny</th>
              </tr>
            </thead>
            <tbody className="text-[13.5px] text-ink-800">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-ink-600">
                    No team initiatives logged yet.
                  </td>
                </tr>
              ) : (
                sorted.map((it) => {
                  const meta = STATUS_META[it.status];
                  const { Icon } = meta;
                  return (
                    <tr key={it.id} className="align-top even:bg-cloud-50/40 hover:bg-cloud-50/70 transition-colors">
                      <td className="px-4 py-4 border-b border-cloud-100/70 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] ring-1 ${meta.chip}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 border-b border-cloud-100/70 max-w-[320px]">
                        <p className="font-semibold text-ink-900 leading-snug">{it.item}</p>
                        <p className="mt-0.5 text-[12.5px] text-ink-700 leading-relaxed">{it.recommendation}</p>
                      </td>
                      <td className="px-4 py-4 border-b border-cloud-100/70 whitespace-nowrap">
                        <span className="text-[12px] font-medium text-cloud-700">{it.agent}</span>
                      </td>
                      <td className="px-4 py-4 border-b border-cloud-100/70 max-w-[260px] text-[12px] text-ink-600 leading-relaxed">
                        {it.reason}
                      </td>
                      <td className="px-4 py-4 border-b border-cloud-100/70 whitespace-nowrap">
                        {it.status === 'pending-approval' ? (
                          <span className="text-[12px] text-ink-700">
                            Reply <span className="font-semibold text-ink-900">&ldquo;approve {it.id}&rdquo;</span> or{' '}
                            <span className="font-semibold text-ink-900">&ldquo;deny {it.id}&rdquo;</span>
                          </span>
                        ) : (
                          <span className="text-[12px] text-ink-500 italic">
                            {it.status === 'approved' ? `Approved${it.decided_by ? ` by ${it.decided_by}` : ''}` : 'Denied'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-[12px] text-ink-600 leading-relaxed max-w-2xl">
          This board mirrors <code className="text-[11px] text-cloud-700">data/initiatives.jsonl</code>. Approve or deny
          by ID in chat and ELON updates the ledger + acts on it. (Live approve/deny buttons land with the Vercel
          migration.)
        </p>
      </section>
    </>
  );
}
