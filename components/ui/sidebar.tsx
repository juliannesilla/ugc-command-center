'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Kanban,
  AlertTriangle,
  PlayCircle,
  Clapperboard,
  Sparkles,
  Inbox,
  MessageSquare,
  CalendarDays,
  BarChart3,
  Wallet,
  FileText,
  Heart,
  FolderOpen,
  Brain,
  Settings,
  Lightbulb,
  ShieldCheck,
  TrendingUp,
  Workflow,
  ChevronLeft,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
// A14J-C3 atomic edit: import comment-mode hook for live badge count.
import { useCommentMode } from '@/components/comments/CommentModeProvider.local';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Overview',           href: '/',                          icon: LayoutDashboard },
  { label: 'Campaign Pipeline',  href: '/pipeline/board',            icon: Kanban },
  { label: 'Needs Attention',    href: '/pipeline/needs-attention',  icon: AlertTriangle },
  { label: 'Ready to Execute',   href: '/pipeline/ready-to-execute', icon: PlayCircle },
  { label: 'Production Queue',   href: '/pipeline/production-queue', icon: Clapperboard },
  // A14J-C3: /inbox sits right above SOW Breakdown per Wave 1b spec.
  { label: 'Inbox',              href: '/inbox',                     icon: MessageSquare },
  { label: 'SOW Breakdown',      href: '/sow-breakdown',             icon: Workflow },
  { label: 'Script Production',  href: '/script-production',         icon: FileText },
  { label: 'Content Hub',        href: '/content-hub',               icon: Sparkles },
  { label: 'Brand Responses',   href: '/brand-responses',  icon: Inbox },
  { label: 'Scheduling',        href: '/scheduling',       icon: CalendarDays },
  { label: 'Analytics',         href: '/analytics',        icon: BarChart3 },
  { label: 'Payments',          href: '/payments',         icon: Wallet },
  { label: 'Templates',         href: '/templates',        icon: FileText },
  { label: 'Brand Relationships', href: '/contacts',       icon: Heart },
  { label: 'Creative Strategy', href: '/creative-strategy', icon: Lightbulb },
  { label: 'QA',                href: '/qa',              icon: ShieldCheck },
  { label: 'SideShift Growth',  href: '/sideshift-growth', icon: TrendingUp },
  { label: 'Documents',         href: '/documents',        icon: FolderOpen },
  { label: 'Brain Dump',        href: '/brain-dump',       icon: Brain },
  { label: 'Settings',          href: '/settings',         icon: Settings },
];

export function Sidebar({ onCollapse }: { onCollapse?: () => void }) {
  const pathname = usePathname();
  // A14J-C3: live open-count badge on the Inbox nav item.
  const { openCount, inProgressCount } = useCommentMode();
  const inboxBadge = openCount + inProgressCount;

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-white/85 backdrop-blur-xl border-r border-cloud-100 h-[calc(100vh-0px)] sticky top-0">
      {/* Brand mark */}
      <div className="px-5 pt-5 pb-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-cloud-sunset shadow-soft text-white font-display text-lg leading-none">
            U
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-[15px] text-ink-900 tracking-tight">
              UGC <span className="text-ink-400 font-normal">|</span> Campaign HQ
            </span>
            <span className="text-[10.5px] uppercase tracking-[0.18em] text-ink-500">
              Read-only mirror
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
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition',
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
                  <span className="truncate flex-1">{item.label}</span>
                  {item.href === '/inbox' && inboxBadge > 0 && (
                    <span
                      aria-label={`${inboxBadge} unresolved`}
                      className="ml-auto inline-flex min-w-[20px] h-[18px] px-1.5 items-center justify-center rounded-full bg-cloud-sunset text-white text-[10px] font-semibold tabular-nums"
                    >
                      {inboxBadge > 99 ? '99+' : inboxBadge}
                    </span>
                  )}
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
