'use client';

// Phase A.14j Wave 1b · A14J-C3 /inbox ROUTE + COMMENT MODE OVERLAY
//
// Comment-inbox table. Reads from CommentModeProvider (local cache, hydrated
// from /api/comments + optimistic writes). Filters: status · route · priority.
// Bulk actions: mark resolved · trigger cron now (links out to a GH
// workflow_dispatch since we have no API key here).
//
// Skills: frontend-design, vercel:shadcn, apple-hig-expert,
// design:design-critique, anthropic-skills:mobile-responsiveness.

import { useMemo, useState } from 'react';
import { ExternalLink, GitPullRequest, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useCommentMode } from './CommentModeProvider.local';
import type { CommentPriority, CommentStatus } from './types';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | CommentStatus;
type PriorityFilter = 'all' | CommentPriority;

function statusChip(status: CommentStatus) {
  if (status === 'resolved') {
    return 'bg-chip-green/15 text-chip-green ring-chip-green/30';
  }
  if (status === 'in_progress') {
    return 'bg-chip-blue/15 text-chip-blue ring-chip-blue/30';
  }
  return 'bg-chip-yellow/20 text-chip-yellow ring-chip-yellow/40';
}

function priorityChip(p: CommentPriority) {
  if (p === 'P0') return 'bg-chip-red/15 text-chip-red ring-chip-red/30';
  if (p === 'P1') return 'bg-chip-orange/15 text-chip-orange ring-chip-orange/30';
  return 'bg-chip-blue/15 text-chip-blue ring-chip-blue/30';
}

export function InboxTable() {
  const { comments, refresh } = useCommentMode();
  const [status, setStatus] = useState<StatusFilter>('all');
  const [priority, setPriority] = useState<PriorityFilter>('all');
  const [routeFilter, setRouteFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const routes = useMemo(() => {
    const s = new Set<string>();
    comments.forEach(c => s.add(c.route));
    return Array.from(s).sort();
  }, [comments]);

  const filtered = useMemo(() => {
    return comments.filter(c => {
      if (status !== 'all' && c.status !== status) return false;
      if (priority !== 'all' && c.priority !== priority) return false;
      if (routeFilter !== 'all' && c.route !== routeFilter) return false;
      return true;
    });
  }, [comments, status, priority, routeFilter]);

  const toggleSelected = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  async function bulkResolve() {
    if (selected.size === 0) return;
    // TODO(C2): wire to PATCH /api/comments — for now optimistic + refresh.
    await Promise.all(
      Array.from(selected).map(id =>
        fetch(`/api/comments/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-Comment-Token': process.env.NEXT_PUBLIC_COMMENT_TOKEN ?? '',
          },
          body: JSON.stringify({ status: 'resolved' }),
        }).catch(() => null),
      ),
    );
    setSelected(new Set());
    void refresh();
  }

  // Trigger the comment-resolver workflow_dispatch in GitHub (link-out — no PAT
  // in browser). Replace owner/repo/workflow when C1 lands them.
  const cronUrl =
    'https://github.com/juliannesilla/ugc-command-center/actions/workflows/resolve-comments.yml';

  return (
    <section className="card-secondary space-y-5">
      {/* Filters + bulk row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Selector
            label="Status"
            value={status}
            onChange={v => setStatus(v as StatusFilter)}
            options={[
              ['all', 'All status'],
              ['open', 'Open'],
              ['in_progress', 'In progress'],
              ['resolved', 'Resolved'],
            ]}
          />
          <Selector
            label="Priority"
            value={priority}
            onChange={v => setPriority(v as PriorityFilter)}
            options={[
              ['all', 'All priority'],
              ['P0', 'P0'],
              ['P1', 'P1'],
              ['P2', 'P2'],
            ]}
          />
          <Selector
            label="Route"
            value={routeFilter}
            onChange={v => setRouteFilter(v)}
            options={[
              ['all', 'All routes'],
              ...routes.map(r => [r, r] as [string, string]),
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={bulkResolve}
            disabled={selected.size === 0}
            className="inline-flex items-center gap-1.5 rounded-xl bg-ink-900 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-ink-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark resolved {selected.size > 0 && `(${selected.size})`}
          </button>
          <a
            href={cronUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white ring-1 ring-cloud-200 px-3 py-1.5 text-[12px] font-medium text-ink-900 hover:bg-cloud-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Trigger cron now
            <ExternalLink className="h-3 w-3 text-ink-600" />
          </a>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-cloud-50/50 ring-1 ring-cloud-100">
          <p className="font-display text-display-sm text-ink-900">No comments yet.</p>
          <p className="mt-1 text-[13px] text-ink-600">
            Open Comment Mode to drop your first feedback anywhere.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl ring-1 ring-cloud-100">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-cloud-50/60 text-left text-[10.5px] uppercase tracking-[0.14em] text-ink-700">
                <th className="w-10 px-3 py-2">
                  <span className="sr-only">Select</span>
                </th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Route</th>
                <th className="px-3 py-2 font-medium">Text</th>
                <th className="px-3 py-2 font-medium">Priority</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">PR</th>
                <th className="px-3 py-2 font-medium">Commit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud-100">
              {filtered.map(c => {
                const date = new Date(c.ts);
                return (
                  <tr key={c.id} className="hover:bg-cloud-50/40 transition">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        aria-label={`Select comment ${c.id}`}
                        checked={selected.has(c.id)}
                        onChange={() => toggleSelected(c.id)}
                        className="h-3.5 w-3.5 rounded border-cloud-300 text-cloud-600 focus:ring-cloud-400"
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-ink-600 tabular-nums">
                      {date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-3 py-2 font-mono text-[11.5px] text-ink-700">{c.route}</td>
                    <td className="px-3 py-2 text-ink-900 max-w-[420px]">
                      <span className="line-clamp-2">{c.text}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-semibold ring-1',
                          priorityChip(c.priority),
                        )}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-medium ring-1 capitalize',
                          statusChip(c.status),
                        )}
                      >
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {c.pr_url ? (
                        <a
                          href={c.pr_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-cloud-700 hover:underline"
                        >
                          <GitPullRequest className="h-3 w-3" />
                          PR
                        </a>
                      ) : (
                        <span className="text-ink-600">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-ink-600">
                      {c.resolved_commit ? c.resolved_commit.slice(0, 7) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Selector({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="inline-flex items-center gap-2">
      <span className="text-[10.5px] uppercase tracking-[0.14em] text-ink-700 font-medium">
        {label}
      </span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="rounded-lg bg-white px-2 py-1.5 text-[12px] text-ink-900 ring-1 ring-cloud-200 focus:outline-none focus:ring-2 focus:ring-cloud-300"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
