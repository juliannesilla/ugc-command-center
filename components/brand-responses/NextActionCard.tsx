"use client";

import { CheckCircle2, Sun, Sparkles } from "lucide-react";
import type { BrandConversation } from "@/lib/mock-data/brand-responses";

export function NextActionCard({ conv }: { conv: BrandConversation }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-cloud-sunset p-6 text-white shadow-soft">
      {/* grain overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-50 bg-grain"
      />
      <header className="relative flex items-center gap-2">
        <Sparkles className="h-4 w-4" />
        <h3 className="text-[11px] uppercase tracking-[0.18em] font-semibold">
          Next Action
        </h3>
      </header>
      <p className="relative mt-3 font-display text-[19px] leading-snug">
        {conv.nextAction}
      </p>

      <div className="relative mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-white/95 px-3 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-cloud-700 hover:bg-white transition shadow-card"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Complete
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-ink-900/30 backdrop-blur px-3 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-ink-900/50 transition ring-1 ring-white/30"
        >
          <Sun className="h-3.5 w-3.5" />
          My Day
        </button>
      </div>
    </section>
  );
}
