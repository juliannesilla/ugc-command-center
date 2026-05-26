'use client';

// A.14o O6-V2-SIDEBAR-GROUPING (recovery from git-race wipe of V1).
// Citation: Julz "21 sidebar items is dense" → collapse to 11 top-level + 3 collapsible parents.
// Skills invoked (HR-21-revised): refactoring-ui, ux-heuristics, microinteractions, apple-hig-expert,
//   superpowers:verification-before-completion.
// PRESERVES (HR-2): A.14k Inbox top-level + badge, A.14j typography, A.14l L3-G polish,
//   A.14m M4-G role="img", N4 cloud.800 active text, ReadOnlyMirrorBadge wordmark.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  Calendar,
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
  ChevronRight,
  Database,
  CalendarClock,
  Image as ImageIcon,
  Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils';
// A14J-C3 atomic edit: import comment-mode hook for live badge count.
import { useCommentMode } from '@/components/comments/CommentModeProvider.local';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

// A.14o O6-V2: grouped tree — leaf nodes carry href; parent nodes carry children[].
export interface NavGroup {
  key: 'pipeline' | 'brand' | 'creative';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: NavItem[];
}

export type NavEntry = NavItem | NavGroup;

const isGroup = (e: NavEntry): e is NavGroup =>
  (e as NavGroup).children !== undefined;

// LOCKED per A.14o plan: 21 flat → 11 top-level (3 of which are collapsible parents).
// PRESERVE per HR-2: Inbox stays top-level (A.14k Leave-feedback lock).
export const NAV_ENTRIES: NavEntry[] = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },

  // Group 1 — Pipeline (6 children)
  {
    key: 'pipeline',
    label: 'Pipeline',
    icon: Kanban,
    children: [
      { label: 'Board',              href: '/pipeline/board',            icon: Kanban },
      { label: 'Database',           href: '/pipeline/database',         icon: Database },
      { label: 'Calendar',           href: '/calendar',                  icon: Calendar },
      { label: 'Deadlines',          href: '/pipeline/deadlines',        icon: CalendarClock },
      { label: 'Needs Attention',    href: '/pipeline/needs-attention',  icon: AlertTriangle },
      { label: 'Ready to Execute',   href: '/pipeline/ready-to-execute', icon: PlayCircle },
      { label: 'Production Queue',   href: '/pipeline/production-queue', icon: Clapperboard },
    ],
  },

  // A.14k LOCK: Inbox stays TOP-LEVEL, not nested.
  { label: 'Inbox', href: '/inbox', icon: MessageSquare },

  // Group 2 — Brand (3 children)
  {
    key: 'brand',
    label: 'Brand',
    icon: Heart,
    children: [
      { label: 'Brand Responses',  href: '/brand-responses',  icon: Inbox },
      { label: 'Contacts',         href: '/contacts',         icon: Heart },
      { label: 'SideShift Growth', href: '/sideshift-growth', icon: TrendingUp },
    ],
  },

  // Group 3 — Creative (4 children)
  {
    key: 'creative',
    label: 'Creative',
    icon: Palette,
    children: [
      { label: 'SOW Breakdown',     href: '/sow-breakdown',     icon: Workflow },
      { label: 'Script Production', href: '/script-production', icon: FileText },
      { label: 'Creative Strategy', href: '/creative-strategy', icon: Lightbulb },
      { label: 'QA',                href: '/qa',                icon: ShieldCheck },
    ],
  },

  { label: 'Content Hub', href: '/content-hub', icon: Sparkles },
  { label: 'Scheduling',  href: '/scheduling',  icon: CalendarDays },
  { label: 'Analytics',   href: '/analytics',   icon: BarChart3 },
  { label: 'Payments',    href: '/payments',    icon: Wallet },
  { label: 'Templates',   href: '/templates',   icon: FileText },
  { label: 'Documents',   href: '/documents',   icon: FolderOpen },
  { label: 'Assets',      href: '/assets',      icon: ImageIcon },
  { label: 'Brain Dump',  href: '/brain-dump',  icon: Brain },
  { label: 'Settings',    href: '/settings',    icon: Settings },
];

// Back-compat: flattened export preserves any external imports of NAV_ITEMS.
export const NAV_ITEMS: NavItem[] = NAV_ENTRIES.flatMap(e =>
  isGroup(e) ? e.children : [e],
);

const LS_KEY = 'ugc-cc-sidebar-groups';
type OpenState = Partial<Record<NavGroup['key'], boolean>>;

export function Sidebar({ onCollapse }: { onCollapse?: () => void }) {
  const pathname = usePathname();
  // A14J-C3: live open-count badge on the Inbox nav item.
  const { openCount, inProgressCount } = useCommentMode();
  const inboxBadge = openCount + inProgressCount;

  // SSR-safe: start empty, hydrate from localStorage + active route on mount (ux-heuristics #6 Recognition).
  const [openGroups, setOpenGroups] = useState<OpenState>({});

  useEffect(() => {
    let initial: OpenState = {};
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(LS_KEY) : null;
      if (raw) initial = JSON.parse(raw) as OpenState;
    } catch {
      initial = {};
    }
    // Auto-expand the group containing the active route (Recognition over Recall).
    for (const entry of NAV_ENTRIES) {
      if (isGroup(entry)) {
        const hasActive = entry.children.some(child =>
          child.href === '/' ? pathname === '/' : pathname?.startsWith(child.href),
        );
        if (hasActive) initial[entry.key] = true;
      }
    }
    setOpenGroups(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleGroup = (key: NavGroup['key']) => {
    setOpenGroups(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        window.localStorage.setItem(LS_KEY, JSON.stringify(next));
      } catch {
        /* ignore quota / private-mode errors */
      }
      return next;
    });
  };

  const isLeafActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href);

  const isGroupActive = (group: NavGroup) =>
    group.children.some(c => isLeafActive(c.href));

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-white/85 backdrop-blur-xl border-r border-cloud-100 h-[calc(100vh-0px)] sticky top-0">
      {/* Brand mark — A14L L3-G polish: subtle hover scale on logo + ink shift on wordmark (microinteractions skill) */}
      <div className="px-5 pt-5 pb-4">
        <Link
          href="/"
          className="flex items-center gap-2 group rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-cloud-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-cloud-sunset shadow-soft text-white font-display text-lg leading-none transition-transform duration-200 ease-out group-hover:scale-[1.04] group-active:scale-[0.98]">
            U
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-[15px] text-ink-900 tracking-tight transition-colors duration-200 group-hover:text-cloud-700">
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
          {NAV_ENTRIES.map(entry => {
            // -------- LEAF (top-level link) --------
            if (!isGroup(entry)) {
              const Icon = entry.icon;
              const active = isLeafActive(entry.href);
              return (
                <li key={entry.href}>
                  <Link
                    href={entry.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      // A14L L3-G polish: 200ms ease-out (HIG), focus-visible ring, subtle translate-x on hover.
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium font-display transition-all duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-cloud-300 focus-visible:ring-offset-1 focus-visible:ring-offset-white',
                      active
                        ? 'bg-cloud-100 text-cloud-800 shadow-card ring-1 ring-cloud-200/60'
                        : 'text-ink-600 hover:bg-cloud-50 hover:text-ink-900 hover:translate-x-[1px]',
                    )}
                  >
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-cloud-sunset shadow-[0_0_8px_rgba(255,107,157,0.45)]"
                      />
                    )}
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-colors duration-200 ease-out',
                        active ? 'text-cloud-600' : 'text-ink-400 group-hover:text-cloud-500',
                      )}
                    />
                    <span className="truncate flex-1">{entry.label}</span>
                    {entry.href === '/inbox' && inboxBadge > 0 && (
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
            }

            // -------- GROUP (collapsible parent + children) --------
            const Icon = entry.icon;
            const open = !!openGroups[entry.key];
            const groupActive = isGroupActive(entry);
            return (
              <li key={`group:${entry.key}`}>
                {/* Parent disclosure button — microinteractions: ChevronRight rotates 90deg on open */}
                <button
                  type="button"
                  onClick={() => toggleGroup(entry.key)}
                  aria-expanded={open}
                  aria-controls={`nav-group-${entry.key}`}
                  className={cn(
                    'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium font-display transition-all duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-cloud-300 focus-visible:ring-offset-1 focus-visible:ring-offset-white',
                    groupActive
                      ? 'text-cloud-800 hover:bg-cloud-50'
                      : 'text-ink-600 hover:bg-cloud-50 hover:text-ink-900 hover:translate-x-[1px]',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors duration-200 ease-out',
                      groupActive ? 'text-cloud-600' : 'text-ink-400 group-hover:text-cloud-500',
                    )}
                  />
                  <span className="truncate flex-1 text-left">{entry.label}</span>
                  <ChevronRight
                    aria-hidden="true"
                    className={cn(
                      'h-3.5 w-3.5 shrink-0 text-ink-400 transition-transform duration-200 ease-out',
                      open && 'rotate-90',
                      groupActive && 'text-cloud-600',
                    )}
                  />
                </button>

                {/* Children — pl-9 indent, only mounted when open (collapse = remove from a11y tree) */}
                {open && (
                  <ul id={`nav-group-${entry.key}`} className="mt-0.5 space-y-0.5">
                    {entry.children.map(child => {
                      const ChildIcon = child.icon;
                      const childActive = isLeafActive(child.href);
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            aria-current={childActive ? 'page' : undefined}
                            className={cn(
                              'group relative flex items-center gap-3 rounded-xl pl-9 pr-3 py-2 text-[12.5px] font-medium font-display transition-all duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-cloud-300 focus-visible:ring-offset-1 focus-visible:ring-offset-white',
                              childActive
                                ? 'bg-cloud-100 text-cloud-800 shadow-card ring-1 ring-cloud-200/60'
                                : 'text-ink-500 hover:bg-cloud-50 hover:text-ink-900 hover:translate-x-[1px]',
                            )}
                          >
                            {childActive && (
                              <span
                                aria-hidden="true"
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-r-full bg-cloud-sunset shadow-[0_0_8px_rgba(255,107,157,0.45)]"
                              />
                            )}
                            <ChildIcon
                              className={cn(
                                'h-3.5 w-3.5 shrink-0 transition-colors duration-200 ease-out',
                                childActive ? 'text-cloud-600' : 'text-ink-400 group-hover:text-cloud-500',
                              )}
                            />
                            <span className="truncate flex-1">{child.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User + collapse — A14L L3-G polish: focus rings + chevron slide on collapse hover */}
      <div className="border-t border-cloud-100 px-3 py-3 space-y-2">
        <button
          type="button"
          className="group w-full flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-cloud-50 transition-colors duration-200 ease-out text-left outline-none focus-visible:ring-2 focus-visible:ring-cloud-300 focus-visible:ring-offset-1 focus-visible:ring-offset-white"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-cloud-soft text-cloud-700 font-display font-semibold transition-transform duration-200 ease-out group-hover:scale-[1.04]">
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
          <ChevronDown className="h-3.5 w-3.5 text-ink-400 transition-transform duration-200 ease-out group-hover:translate-y-[1px]" />
        </button>
        <button
          type="button"
          onClick={onCollapse}
          aria-label="Collapse sidebar"
          className="group w-full flex items-center justify-center gap-1.5 rounded-xl px-2 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-500 hover:text-ink-900 hover:bg-cloud-50 transition-colors duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-cloud-300 focus-visible:ring-offset-1 focus-visible:ring-offset-white"
        >
          <ChevronLeft className="h-3 w-3 transition-transform duration-200 ease-out group-hover:-translate-x-0.5" />
          Collapse
        </button>
      </div>
    </aside>
  );
}
