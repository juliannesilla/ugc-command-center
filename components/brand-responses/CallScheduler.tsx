"use client";

import { useState } from "react";
import { CalendarClock, Check, Plus, Globe2 } from "lucide-react";

type Props = {
  proposedSlots: string[];
  timezone?: string;
  onConfirm?: (slot: string) => void;
};

export function CallScheduler({
  proposedSlots,
  timezone = "PT (UTC-7)",
  onConfirm,
}: Props) {
  const [selected, setSelected] = useState<string | null>(
    proposedSlots.find((s) => s.includes("CONFIRMED")) ?? null,
  );

  return (
    <section className="rounded-3xl bg-white/85 backdrop-blur p-6 shadow-card ring-1 ring-cloud-100">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-xl bg-peach-100 text-peach-500">
            <CalendarClock className="h-3.5 w-3.5" />
          </span>
          <h3 className="text-[11px] uppercase tracking-[0.16em] font-semibold text-ink-700">
            Call Requested
          </h3>
        </div>
        <span className="flex items-center gap-1 text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
          <Globe2 className="h-3 w-3" />
          {timezone}
        </span>
      </header>

      <ul className="mt-4 space-y-2">
        {proposedSlots.map((slot) => {
          const confirmed = slot.includes("CONFIRMED");
          const isSelected = selected === slot;
          return (
            <li key={slot}>
              <button
                type="button"
                onClick={() => {
                  if (confirmed) return;
                  setSelected(slot);
                  onConfirm?.(slot);
                }}
                className={`group w-full flex items-center justify-between rounded-2xl px-3.5 py-3 text-left transition ${
                  confirmed
                    ? "bg-gradient-to-r from-cloud-100 to-iris-100 ring-1 ring-cloud-300"
                    : isSelected
                    ? "bg-cloud-100 ring-1 ring-cloud-300 shadow-card"
                    : "bg-cloud-50/60 hover:bg-cloud-100 ring-1 ring-transparent"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`grid h-5 w-5 place-items-center rounded-full ring-1 transition ${
                      isSelected || confirmed
                        ? "bg-cloud-500 text-white ring-cloud-500"
                        : "bg-white ring-cloud-200 text-transparent"
                    }`}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="font-mono text-[13px] font-semibold text-ink-900">
                    {slot.replace(" — CONFIRMED", "")}
                  </span>
                </span>
                {confirmed && (
                  <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-cloud-700">
                    Confirmed
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-cloud-300 bg-white/50 px-3 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-600 hover:bg-cloud-50 hover:text-cloud-700 transition"
      >
        <Plus className="h-3.5 w-3.5" />
        Suggest Different Time
      </button>

      <p className="mt-3 text-[10.5px] uppercase tracking-[0.14em] text-ink-400">
        Syncs with Google Calendar
      </p>
    </section>
  );
}
