'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Kanban,
  FileText,
  Inbox,
  Sparkles,
  ClapperboardIcon as Clapperboard,
  Video,
  Wallet,
  CalendarDays,
  Folder,
  StickyNote,
  BarChart3,
  Brain,
  Settings,
  ChevronLeft,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Overview',           href: '/',                    icon: LayoutDashboard },
  { label: 'Campaign Pipeline',  href: '/pipeline/board',      icon: Kanban },
  { label: 'SOW Breakdown',      href: '/pipeline/database',   icon: FileText },
  { label: 'Brand Responses',    href: '/brand-responses',     icon: Inbox },
  { label: 'Creative Strategy',  href: '/campaigns',           icon: Sparkles },
  { label: 'Script + Shot Map',  href: '/campaigns/scripts',   icon: Clapperboard },
  { label: 'Production Tracker', href: '/campaigns/production',icon: Video },
  { label: 'Payments + Bonuses', href: '/campaigns/payments',  icon: Wallet },
  { label: 'Calendar',           href: '/scheduling',          icon: CalendarDays },
  { label: 'Assets',             href: '/assets',              icon: Folder },
  { label: 'Notes',              href: '/campaigns/notes',     icon: StickyNote },
  { label: 'Analytics',          href: '/analytics',           icon: BarChart3 },
  { label: 'Brain Dump',         href: '/brain-dump',          icon: Brain },
  { label: 'Settings',           href: '/settings',            icon: Settings },
];

export function Sidebar({ onCollapse }: { onCollapse?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-white/85 backdrop-blur-xl border-r border-cloud-100 h-[calc(100vh-0px)] sticky top-0">
      {/* Brand mark */}
      <div className="px-5 pt-5 pb-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-cloud-sunset shadow-soft text-white font-display text-lg leading-none">
            J
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-[15px] text-ink-900 tracking-tight">
              Julianne&rsquo;s UGC
            </span>
            <span className="text-[10.5px] uppercase tracking-[0.18em] text-ink-500">
              Campaign HQ
            </span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname?.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition',
                    active
                      ? 'bg-cloud-100 text-cloud-700 shadow-card'
                      : 'text-ink-600 hover:bg-cloud-50 hover:text-ink-900',
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-cloud-sunset" />
                  )}
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      active ? 'text-cloud-600' : 'text-ink-400 group-hover:text-cloud-500',
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User + collapse */}
      <div className="border-t border-cloud-100 px-3 py-3 space-y-2">
        <button
          type="button"
          className="w-full flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-cloud-50 transition text-left"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-cloud-soft text-cloud-700 font-display font-semibold">
            J
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[13px] font-semibold text-ink-900 truncate">
              Julianne Silla
            </span>
            <span className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-500 truncate">
              Solo Creator
            </span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
        </button>
        <button
          type="button"
          onClick={onCollapse}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl px-2 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-500 hover:text-ink-900 hover:bg-cloud-50 transition"
        >
          <ChevronLeft className="h-3 w-3" />
          Collapse
        </button>
      </div>
    </aside>
  );
}
