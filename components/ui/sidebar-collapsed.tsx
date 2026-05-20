'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { NAV_ITEMS } from './sidebar';
import { cn } from '@/lib/utils';

export function SidebarCollapsed({ onExpand }: { onExpand?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-16 shrink-0 flex-col items-center bg-white/85 backdrop-blur-xl border-r border-cloud-100 h-[calc(100vh-0px)] sticky top-0 py-4">
      <Link href="/" className="grid h-10 w-10 place-items-center rounded-2xl bg-cloud-sunset shadow-soft text-white font-display text-lg">
        J
      </Link>
      <nav className="mt-6 flex-1 w-full overflow-y-auto">
        <ul className="space-y-1 px-2">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active =
              item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={item.label}
                  className={cn(
                    'grid h-10 w-10 place-items-center rounded-xl transition relative',
                    active ? 'bg-cloud-100 text-cloud-700' : 'text-ink-500 hover:bg-cloud-50 hover:text-ink-900',
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-cloud-sunset" />
                  )}
                  <Icon className="h-4 w-4" />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <button
        type="button"
        onClick={onExpand}
        className="grid h-10 w-10 place-items-center rounded-xl text-ink-500 hover:bg-cloud-50 hover:text-ink-900 transition"
        aria-label="Expand sidebar"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </aside>
  );
}
