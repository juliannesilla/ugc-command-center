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
        <CommentModeProvider>
          {/* A.AA Wave 3 — mobile top bar + drawer (md:hidden). Desktop uses <Sidebar/>. */}
          <MobileNav />
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 min-w-0 flex flex-col">
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
