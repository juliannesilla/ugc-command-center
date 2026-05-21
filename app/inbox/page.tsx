// Phase A.14j Wave 1b · A14J-C3 /inbox ROUTE + COMMENT MODE OVERLAY
//
// Comment Inbox — central queue viewer for all dropped comments across the
// dashboard. Hydrates from CommentModeProvider's local cache (which mirrors
// /api/comments via SWR-style 30s polling). Until C2's /api/comments is on
// disk, this page still renders correctly from optimistic localStorage rows.
//
// Owner: A14J-C3. Sidebar entry added atomically in same wave (sidebar.tsx).
// HR-21 CITE = INVOKE: skills frontend-design, vercel:shadcn, vercel:nextjs,
// apple-hig-expert, design:design-critique, anthropic-skills:mobile-responsiveness,
// superpowers:verification-before-completion all invoked at agent boot.

import { Header } from '@/components/ui/header';
import { InboxTable } from '@/components/comments/InboxTable';

export const metadata = {
  title: 'Inbox · UGC | Campaign HQ',
  description:
    'Comment inbox — every piece of feedback Julz dropped on the dashboard, with status, PR, and resolved-commit tracking.',
};

export default function InboxPage() {
  return (
    <>
      <Header
        pageEyebrow="Dashboard · Self-feedback queue"
        pageTitle="Comment Inbox"
      />

      <main className="px-7 md:px-12 py-6 -mt-24 lg:-mt-32 relative z-10 space-y-6">
        {/* Hero card — uses the T5 `.section-title` utility per spec */}
        <section className="card-hero space-y-3 rise">
          <p className="text-[10.5px] uppercase tracking-[0.16em] text-ink-500 font-medium">
            Every comment, one queue
          </p>
          <h2 className="section-title">Comment Inbox</h2>
          <p className="section-subtitle max-w-2xl">
            Click any comment to triage. Use the floating button on any page to drop a new one.
            Filter by status, route, or priority. Bulk-resolve when a batch ships.
          </p>
        </section>

        <InboxTable />
      </main>
    </>
  );
}
