// Phase A.14j Wave 1b · A14J-C3 /inbox ROUTE + COMMENT MODE OVERLAY
// Phase A.14l Wave 1 · A14L-L3-F polish — ADDITIVE hero refinement only.
// PRESERVED: A.14k Leave-feedback flow (InboxTable + comments components untouched).
//
// Comment Inbox — central queue viewer for all dropped comments across the
// dashboard. Hydrates from CommentModeProvider's local cache (which mirrors
// /api/comments via SWR-style 30s polling). Until C2's /api/comments is on
// disk, this page still renders correctly from optimistic localStorage rows.
//
// Owner: A14J-C3. Sidebar entry added atomically in same wave (sidebar.tsx).
// HR-21 CITE = INVOKE: refactoring-ui, microinteractions, ios-hig-design,
// top-design, frontend-design, superpowers:verification-before-completion
// (A.14l). Plus prior A.14j: frontend-design, vercel:shadcn, vercel:nextjs,
// apple-hig-expert, design:design-critique, mobile-responsiveness.

import { Header } from '@/components/ui/header';
import { InboxTable } from '@/components/comments/InboxTable';
import { Inbox as InboxIcon, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Feedback Hub · UGC | Campaign HQ',
  description:
    'Feedback Hub — every piece of feedback Julz dropped on the dashboard, with status, PR, and resolved-commit tracking.',
};

export default function InboxPage() {
  return (
    <>
      <Header
        pageEyebrow="Dashboard · Self-feedback queue"
        pageTitle="Feedback Hub"
      />

      <main className="px-7 md:px-12 py-6 -mt-24 lg:-mt-32 relative z-10 space-y-6">
        {/* Hero card — A.14l polish: subtle gradient orb + icon affordance.
            Uses the T5 `.section-title` utility per spec. */}
        <section className="card-hero relative overflow-hidden space-y-3 rise group">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-peach-200/40 via-cloud-200/30 to-transparent blur-2xl opacity-60 transition-opacity duration-500 group-hover:opacity-80"
          />
          <div className="relative flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-xl bg-cloud-soft text-cloud-700 ring-1 ring-cloud-100">
              <InboxIcon className="h-3.5 w-3.5" />
            </span>
            <p className="stat-label inline-flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Every comment, one queue
            </p>
          </div>
          <h2 className="relative section-title">Feedback Hub</h2>
          <p className="relative section-subtitle max-w-2xl">
            Click any comment to triage. Use the floating button on any page to drop a new one.
            Filter by status, route, or priority. Bulk-resolve when a batch ships.
          </p>
        </section>

        <InboxTable />
      </main>
    </>
  );
}
