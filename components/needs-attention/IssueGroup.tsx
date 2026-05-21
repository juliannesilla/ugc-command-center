'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IssueCard } from './IssueCard';
import { ISSUE_CATEGORIES, type IssueCategory, type TriageIssue } from './triage';

const CATEGORY_ACCENT: Record<IssueCategory, string> = {
  missing_info:       'from-cloud-300 to-iris-400',
  needs_response:     'from-rose-300 to-rose-500',
  brand_followup:     'from-orange-300 to-orange-500',
  payment_issue:      'from-emerald-300 to-emerald-500',
  usage_rights:       'from-amber-300 to-amber-500',
  deadline_unclear:   'from-iris-300 to-iris-500',
  production_blocker: 'from-peach-300 to-peach-500',
  qa_blocker:         'from-rose-300 to-orange-400',
  access_issue:       'from-cloud-300 to-cloud-500',
  submission_issue:   'from-iris-300 to-cloud-500',
};

export function IssueGroup({
  category,
  items,
  defaultOpen = true,
}: {
  category: IssueCategory;
  items: TriageIssue[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const meta = ISSUE_CATEGORIES.find((c) => c.key === category);
  if (!meta) return null;

  const highCount = items.filter((i) => i.severity === 'high').length;

  return (
    <section className="rounded-3xl bg-white/85 backdrop-blur ring-1 ring-cloud-100 shadow-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-6 py-5 text-left hover:bg-cloud-50/60 transition"
      >
        <span
          aria-hidden
          className={cn(
            'h-9 w-1.5 rounded-full bg-gradient-to-b shrink-0',
            CATEGORY_ACCENT[category],
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h2 className="font-display text-[17px] text-ink-900 leading-tight">
              {meta.label}
            </h2>
            <span className="text-[11px] uppercase tracking-[0.14em] text-ink-400">
              {items.length} {items.length === 1 ? 'issue' : 'issues'}
              {highCount > 0 && (
                <>
                  {' · '}
                  <span className="text-rose-600 font-semibold">{highCount} high</span>
                </>
              )}
            </span>
          </div>
          <p className="text-[12px] text-ink-500 mt-0.5">{meta.tagline}</p>
        </div>
        {open
          ? <ChevronDown   className="h-4 w-4 text-ink-400 shrink-0" />
          : <ChevronRight className="h-4 w-4 text-ink-400 shrink-0" />}
      </button>

      {open && (
        <div className="px-6 pb-6 pt-1 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </section>
  );
}
