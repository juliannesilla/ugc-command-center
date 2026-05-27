"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

type Props = {
  title: string;
  icon?: React.ReactNode;
  items: ChecklistItem[];
  tone?: "cloud" | "iris" | "peach" | "emerald";
};

const TONES = {
  cloud:   { tag: "bg-cloud-100 text-cloud-700",  check: "bg-cloud-sunset" },
  iris:    { tag: "bg-iris-100 text-iris-600",    check: "bg-iris-400" },
  peach:   { tag: "bg-peach-100 text-orange-700", check: "bg-peach-500" },
  emerald: { tag: "bg-emerald-100 text-emerald-700", check: "bg-emerald-500" },
};

export function ChecklistCard({ title, icon, items: initialItems, tone = "cloud" }: Props) {
  const [items, setItems] = useState(initialItems);
  const completed = useMemo(() => items.filter((i) => i.done).length, [items]);
  const pct = items.length ? Math.round((completed / items.length) * 100) : 0;
  const toneCls = TONES[tone];

  return (
    <section className="glass-card flex h-full flex-col rounded-3xl p-5 lg:p-6 shadow-card">
      <header className="mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon ? (
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${toneCls.tag}`}
              >
                {icon}
              </span>
            ) : null}
            <h3 className="font-display text-sm font-semibold text-ink-900">{title}</h3>
          </div>
          <span className="font-mono text-[11px] font-bold text-ink-600">
            {completed}/{items.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-300/30">
          <div
            className={cn("h-full rounded-full transition-all", toneCls.check)}
            style={{ width: `${pct}%` }}
          />
        </div>
      </header>
      <ul className="flex-1 space-y-1.5">
        {items.map((it) => (
          <li key={it.id}>
            <label className="group flex cursor-pointer items-start gap-2 rounded-lg px-1.5 py-1 transition hover:bg-cloud-50/70">
              <input
                type="checkbox"
                checked={it.done}
                onChange={() =>
                  setItems((prev) =>
                    prev.map((p) => (p.id === it.id ? { ...p, done: !p.done } : p)),
                  )
                }
                className="peer sr-only"
              />
              <span
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition",
                  it.done
                    ? `${toneCls.check} border-transparent text-white`
                    : "border-ink-300 bg-white",
                )}
              >
                {it.done && <Check className="h-3 w-3" strokeWidth={3.5} />}
              </span>
              <span
                className={cn(
                  "text-[12px] leading-snug",
                  it.done ? "text-ink-600 line-through" : "text-ink-800",
                )}
              >
                {it.label}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
