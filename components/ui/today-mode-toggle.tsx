// Implements: 02-campaign-pipeline-views-architecture.md § 9 "Smart Feature — Today Mode toggle" (L806-L813)
// Filters Overview to today-only urgency:
//   ON  → show only: "what to reply to today" · "what to film today" · "what to submit today"
//          · "what to follow up on today" · "what to get paid for today"
//   OFF → full Overview as E1 built it.
//
// Approach (HR-2 preserve intent · HR-4 smallest interpretation):
//   • Server-rendered page.tsx stays untouched in structure.
//   • Toggle is a client island that sets `data-today-mode="on"` on <html>.
//   • Page sections opt-in by adding `data-today-hide` (full-mode-only) or
//     `data-today-keep` (today-mode visible). CSS rule in globals.css does the hiding.
//   • State persists across refresh via localStorage key `ugc.todayMode`.
"use client";

import { useEffect, useState } from "react";
import { Sun, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ugc.todayMode";

export function TodayModeToggle() {
  const [on, setOn] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage once mounted (avoid SSR mismatch).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "1") {
        setOn(true);
        document.documentElement.setAttribute("data-today-mode", "on");
      }
    } catch {
      // localStorage may be unavailable (private mode, SSR) — silent fail.
    }
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      /* noop */
    }
    if (next) {
      document.documentElement.setAttribute("data-today-mode", "on");
    } else {
      document.documentElement.removeAttribute("data-today-mode");
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={
        on
          ? "Today Mode is on. Click to show full Overview."
          : "Today Mode is off. Click to filter Overview to today-only urgency."
      }
      onClick={toggle}
      // Render the same neutral pill on SSR — avoids flicker before hydration.
      suppressHydrationWarning
      className={cn(
        "group inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold transition",
        "min-h-[44px] min-w-[44px]", // WCAG 2.5.5 / HIG 44pt touch target
        "ring-1 shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-400 focus-visible:ring-offset-2",
        on
          ? "bg-iris-500 text-white ring-iris-500 hover:bg-iris-600"
          : "bg-white text-ink-700 ring-cloud-200 hover:ring-cloud-300",
      )}
    >
      <span
        className={cn(
          "grid h-6 w-6 place-items-center rounded-full transition",
          on ? "bg-white/20 text-white" : "bg-iris-50 text-iris-600",
        )}
        aria-hidden
      >
        {on ? <Sun className="h-3.5 w-3.5" /> : <CalendarDays className="h-3.5 w-3.5" />}
      </span>
      <span className="uppercase tracking-[0.16em]">
        {mounted && on ? "Today Mode · on" : "Today Mode"}
      </span>
      <span
        className={cn(
          "ml-1 h-4 w-7 rounded-full p-0.5 transition",
          on ? "bg-white/30" : "bg-cloud-100",
        )}
        aria-hidden
      >
        <span
          className={cn(
            "block h-3 w-3 rounded-full bg-white shadow-sm transition-transform",
            on ? "translate-x-3" : "translate-x-0",
          )}
        />
      </span>
    </button>
  );
}
