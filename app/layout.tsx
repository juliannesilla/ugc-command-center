// A14J-C3 atomic edit: wrap children with <CommentModeProvider> and mount
// the floating <CommentModeToggle> + <ExistingCommentDots> overlay so any
// route can use the comment system.
//
// TODO(C4): when C4's `@/lib/comments/provider` lands, swap the import below
// from the local stub to the canonical provider.

import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import { Sidebar } from '@/components/ui/sidebar';
import { MobileNav } from '@/components/ui/MobileNav';
import { AgentDock } from '@/components/agent/AgentDock';
import { CommentModeProvider } from '@/components/comments/CommentModeProvider.local';
import { CommentModeToggle } from '@/components/comments/CommentModeToggle';
import { ExistingCommentDots } from '@/components/comments/ExistingCommentDots';
import './globals.css';

const display = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "UGC | Campaign HQ",
  description:
    "Read-only mirror of Julianne Silla's UGC campaign operating system — pipeline, SOWs, scripts, production, payments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-body bg-cloud-soft min-h-screen text-ink-900">
        {/* A.AA Wave 8 a11y — skip-to-content (WCAG 2.4.1 Bypass Blocks) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-iris-500 focus:px-4 focus:py-2 focus:text-[13px] focus:font-semibold focus:text-white focus:shadow-card-lg"
        >
          Skip to content
        </a>
        <CommentModeProvider>
          {/* A.AA Wave 3 — mobile top bar + drawer (md:hidden). Desktop uses <Sidebar/>. */}
          <MobileNav />
          <div className="flex min-h-screen">
            <Sidebar />
            <main id="main-content" tabIndex={-1} className="flex-1 min-w-0 flex flex-col outline-none">
              {children}
            </main>
          </div>
          {/* Global comment-mode overlay — present on every route */}
          <div data-comment-ui="overlay">
            <ExistingCommentDots />
            <CommentModeToggle />
          </div>
          {/* A.AA Wave 1c — global context-aware "Ask ELON" dock, present on every route */}
          <AgentDock />
        </CommentModeProvider>
      </body>
    </html>
  );
}
