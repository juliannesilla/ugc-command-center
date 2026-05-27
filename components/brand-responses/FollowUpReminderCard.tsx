"use client";

import { Bell, RotateCcw, Calendar } from "lucide-react";
import type { BrandConversation } from "@/lib/mock-data/brand-responses";

export function FollowUpReminderCard({ conv }: { conv: BrandConversation }) {
  // Derive a follow-up date from receivedAt + 3 days for mock purposes
  const d = new Date(conv.receivedAt);
  d.setDate(d.getDate() + 3);
  const followUpStr = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <section className="rounded-3xl bg-white/85 backdrop-blur p-6 shadow-card ring-1 ring-cloud-100">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-xl bg-iris-100 text-iris-500">
            <Bell className="h-3.5 w-3.5" />
          </span>
          <h3 className="text-[11px] uppercase tracking-[0.16em] font-semibold text-ink-700">
            Follow-Up Reminder
          </h3>
        </div>
      </header>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-iris-50 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-iris-500" />
          <div>
            <p className="text-[13.5px] font-semibold text-ink-900">{followUpStr}</p>
            <p className="text-[10.5px] uppercase tracking-[0.14em] text-ink-700">
              if no reply by then
            </p>
          </div>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 rounded-xl bg-white px-2.5 py-1.5 text-[11px] font-semibold text-iris-500 hover:text-iris-600 shadow-card transition"
        >
          <RotateCcw className="h-3 w-3" />
          Reschedule
        </button>
      </div>

      {conv.notes && (
        <p className="mt-3 text-[12.5px] leading-relaxed text-ink-600 italic">
          &ldquo;{conv.notes}&rdquo;
        </p>
      )}
    </section>
  );
}
