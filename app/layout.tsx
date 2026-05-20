import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import { Sidebar } from '@/components/ui/sidebar';
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
  title: "Julianne's UGC Campaign HQ",
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
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-w-0 flex flex-col">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
