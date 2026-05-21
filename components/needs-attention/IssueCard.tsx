'use client';

import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Sparkles, Clock, User2 } from 'lucide-react';
import { StatusChip, type ChipTone } from '@/components/ui/status-chip';
import { cn, formatMoney } from '@/lib/utils';
import type { TriageIssue, Severity } from './triage';
import { ISSUE_CATEGORIES } from './triage';

const SEVERITY_BADGE: Record<Severity, { tone: ChipTone; label: string }> = {
  high:   { tone: 'red',    label: 'High' },
  medium: { tone: 'orange', label: 'Medium' },
  low:    { tone: 'pink',   label: 'Low' },
};

const SEVERITY_BAR: Record<Severity, string> = {
  high:   'bg-gradient-to-b from-rose-400 to-rose-500',
  medium: 'bg-gradient-to-b from-orange-300 to-orange-500',
  low:    'bg-gradient-to-b from-cloud-200 to-cloud-300',
};

function formatDue(iso?: string): { label: string; tone: 'rose' | 'amber' | 'ink' } {
  if (!iso) return { label: 'No date', tone: 'ink' };
  const d = new Date(iso);
  const days = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  const human = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (days < 0)  return { label: `${human} · overdue`,            tone: 'rose'  };
  if (days < 3)  return { label: `${human} · ${Math.ceil(days)}d`, tone: 'amber' };
  return { label: human, tone: 'ink' };
}

const dueColor = {
  rose:  'text-rose-600',
  amber: 'text-amber-600',
  ink:   'text-ink-500',
} as const;

function handleGenerateFix(brand: string, category: string) {
  // Placeholder for E13 Wave 5 — Response Draft Generator integration.
  alert(
    `Coming soon: Response Draft Generator\n\n` +
    `Brand: ${brand}\nIssue: ${category}\n\n` +
    `Wave 5 will wire this button to the response-draft engine.`,
  );
}

export function IssueCard({ issue }: { issue: TriageIssue }) {
  const [notesOpen, setNotesOpen] = useState(false);
  const c = issue.campaign;
  const due = formatDue(issue.dueDate);
  const sev = SEVERITY_BADGE[issue.severity];
  const categoryMeta = ISSUE_CATEGORIES.find((cat) => cat.key === issue.category);

  return (
    <article
      className={cn(
        'group relative flex gap-3 rounded-3xl bg-white/95 backdrop-blur-sm shadow-card ring-1 ring-cloud-100/70 overflow-hidden',
        'motion-safe:hover:-translate-y-0.5 hover:shadow-soft hover:ring-cloud-200 transition-[transform,box-shadow,border-color] duration-200 ease-out',
      )}
    >
      {/* Severity rail */}
      <span
        aria-hidden
        className={cn('absolute inset-y-0 left-0 w-1', SEVERITY_BAR[issue.severity])}
      />

      <div className="flex-1 min-w-0 pl-4 pr-4 py-4">
        {/* Top row: brand + severity + value */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-[15px] text-ink-900 leading-tight truncate">
              {c.brand}
            </h3>
            <p className="text-[11px] text-ink-500 truncate mt-0.5">{c.product}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <StatusChip tone={sev.tone}>{sev.label}</StatusChip>
            {issue.totalValue > 0 && (
              <span className="text-[11px] font-semibold text-ink-700">
                {formatMoney(issue.totalValue)}
              </span>
            )}
          </div>
        </div>

        {/* Issue pill + reason */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusChip tone="iris">
            <AlertTriangle className="h-3 w-3" />
            {categoryMeta?.label ?? issue.category}
          </StatusChip>
          <span className="text-[11.5px] text-ink-600 italic">{issue.reason}</span>
        </div>

        {/* Next action */}
        <p className="mt-3 text-[12.5px] text-ink-900 leading-snug">
          <span className="text-[10px] uppercase tracking-[0.16em] text-ink-400 font-semibold block mb-0.5">
            Next action
          </span>
          {issue.nextAction || categoryMeta?.tagline || '—'}
        </p>

        {/* Meta row: due + waiting on */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px]">
          <span className={cn('inline-flex items-center gap-1', dueColor[due.tone])}>
            <Clock className="h-3 w-3" />
            {due.label}
          </span>
          <span className="inline-flex items-center gap-1 text-ink-500">
            <User2 className="h-3 w-3" />
            Waiting on{' '}
            <span className={cn(
              'font-semibold',
              issue.isWaitingOnMe ? 'text-cloud-700' : 'text-ink-700',
            )}>
              {issue.isWaitingOnMe ? 'me' : c.waiting_on_who}
            </span>
          </span>
        </div>

        {/* Action row */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => handleGenerateFix(c.brand, categoryMeta?.label ?? issue.category)}
            className="inline-flex items-center gap-1.5 rounded-full bg-cloud-sunset px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-soft hover:shadow-glow transition-[box-shadow,transform] duration-200 ease-out motion-safe:hover:-translate-y-px active:scale-95"
          >
            <Sparkles className="h-3 w-3" />
            Generate Fix
          </button>
          {c.notes && (
            <button
              type="button"
              onClick={() => setNotesOpen((v) => !v)}
              aria-expanded={notesOpen}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-medium text-ink-500 hover:bg-cloud-50 hover:text-ink-900 transition"
            >
              {notesOpen ? 'Hide notes' : 'Show notes'}
              {notesOpen
                ? <ChevronUp   className="h-3 w-3" />
                : <ChevronDown className="h-3 w-3" />}
            </button>
          )}
        </div>

        {/* Collapsible notes */}
        {notesOpen && c.notes && (
          <p className="mt-3 rounded-xl bg-cloud-50/70 p-3 text-[12px] text-ink-700 leading-relaxed border border-cloud-100">
            {c.notes}
          </p>
        )}
      </div>
    </article>
  );
}
