'use client';

// A.AA Wave 3 — MOBILE NAVIGATION.
// The desktop <Sidebar> is `hidden md:flex`, so on phones/tablets there was NO
// navigation at all (a big part of "mobile sucks"). This adds a md:hidden sticky
// top bar + a slide-in drawer that REUSES the same NAV_ENTRIES as the desktop
// sidebar — single source of truth, no nav drift.
//
// Skills: refactoring-ui, ios-hig-design, apple-hig-expert, ux-heuristics,
//   microinteractions, web-accessibility (focus trap-lite + Escape + scroll-lock).

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ENTRIES, type NavEntry, type NavGroup } from '@/components/ui/sidebar';

const isGroup = (e: NavEntry): e is NavGroup =>
  (e as NavGroup).children !== undefined;

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Scroll-lock + Escape-to-close while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href);

  return (
    <>
      {/* Sticky top bar — visible below md only */}
      <header className="md:hidden sticky top-0 z-40 flex h-14 items-center justify-between gap-3 px-4 bg-white/85 backdrop-blur-xl border-b border-cloud-100">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-cloud-sunset shadow-soft text-white font-display text-base leading-none">
            U
          </span>
          <span className="font-display text-[14px] text-ink-900 tracking-tight truncate">
            UGC <span className="text-ink-400 font-normal">|</span> Campaign HQ
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={open}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-ink-700 hover:bg-cloud-50 active:scale-95 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-cloud-300"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Drawer + backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm motion-backdrop-in"
            onClick={() => setOpen(false)}
          />
          <nav className="absolute left-0 top-0 h-full w-[82%] max-w-[320px] bg-white shadow-card-lg flex flex-col motion-popover-in">
            <div className="flex items-center justify-between px-4 h-14 border-b border-cloud-100">
              <span className="font-display text-[14px] font-semibold text-ink-900">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
                className="grid h-10 w-10 place-items-center rounded-xl text-ink-700 hover:bg-cloud-50 active:scale-95 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-cloud-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ul className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
              {NAV_ENTRIES.map((entry) => {
                if (!isGroup(entry)) {
                  const Icon = entry.icon;
                  const active = isActive(entry.href);
                  return (
                    <li key={entry.href}>
                      <Link
                        href={entry.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-semibold font-display tracking-tight transition-colors duration-150',
                          active
                            ? 'bg-cloud-100 text-cloud-800'
                            : 'text-ink-700 hover:bg-cloud-50 hover:text-ink-900',
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-5 w-5 shrink-0',
                            active ? 'text-cloud-600' : 'text-ink-400',
                          )}
                        />
                        <span className="truncate">{entry.label}</span>
                      </Link>
                    </li>
                  );
                }

                // Group — render the header label + all children (expanded on mobile).
                const Icon = entry.icon;
                return (
                  <li key={`group:${entry.key}`} className="pt-3">
                    <div className="flex items-center gap-2 px-3 pb-1 text-[11px] uppercase tracking-wider font-bold text-ink-500">
                      <Icon className="h-3.5 w-3.5" />
                      {entry.label}
                    </div>
                    <ul className="space-y-0.5">
                      {entry.children.map((child) => {
                        const ChildIcon = child.icon;
                        const active = isActive(child.href);
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              aria-current={active ? 'page' : undefined}
                              className={cn(
                                'flex items-center gap-3 rounded-xl pl-7 pr-3 py-2.5 text-[13.5px] font-semibold font-display tracking-tight transition-colors duration-150',
                                active
                                  ? 'bg-cloud-100 text-cloud-800'
                                  : 'text-ink-700 hover:bg-cloud-50 hover:text-ink-900',
                              )}
                            >
                              <ChildIcon
                                className={cn(
                                  'h-4 w-4 shrink-0',
                                  active ? 'text-cloud-600' : 'text-ink-400',
                                )}
                              />
                              <span className="truncate">{child.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
