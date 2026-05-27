"use client";

import { useState } from "react";
import { ScrollText, Pencil } from "lucide-react";

type ScriptLine = {
  ts: string;
  section: string;
  line?: string;
  body?: string;
  label?: string;
};

const SECTION_TONE: Record<string, string> = {
  HOOK: "bg-cloud-100 text-cloud-700 ring-cloud-200",
  INTRO: "bg-iris-100 text-iris-600 ring-iris-200",
  BODY: "bg-peach-100 text-orange-700 ring-orange-200",
  CTA: "bg-emerald-100 text-emerald-700 ring-emerald-200",
};

export function ScriptDraftEditor({ lines }: { lines: ScriptLine[] }) {
  const [editing, setEditing] = useState<number | null>(null);
  const [text, setText] = useState<Record<number, string>>(() =>
    Object.fromEntries(lines.map((l, i) => [i, l.line ?? l.body ?? ""])),
  );

  return (
    <section className="glass-card flex h-full flex-col rounded-3xl p-5 lg:p-6 shadow-card">
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink-900 text-cloud-200">
            <ScrollText className="h-3.5 w-3.5" strokeWidth={2.2} />
          </span>
          <h3 className="font-display text-sm font-semibold text-ink-900">Script Draft</h3>
        </div>
        <span className="text-[10.5px] font-medium text-ink-700">{lines.length} sections</span>
      </header>
      <ol className="flex-1 space-y-2.5">
        {lines.map((l, i) => {
          const section = (l.section ?? l.label ?? "BODY").toUpperCase();
          const tone = SECTION_TONE[section] ?? "bg-ink-100 text-ink-700 ring-ink-300";
          const isEditing = editing === i;
          return (
            <li
              key={i}
              className="rounded-xl bg-white/80 p-2.5 ring-1 ring-cloud-100 transition hover:ring-cloud-300"
            >
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] ring-1 ${tone}`}
                  >
                    {section}
                  </span>
                  <span className="font-mono text-[10.5px] font-semibold text-ink-700">
                    {l.ts}
                  </span>
                </div>
                <button
                  onClick={() => setEditing(isEditing ? null : i)}
                  className="text-ink-600 transition hover:text-ink-700"
                  aria-label={isEditing ? "Save line" : "Edit line"}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
              {isEditing ? (
                <textarea
                  value={text[i]}
                  onChange={(e) => setText({ ...text, [i]: e.target.value })}
                  onBlur={() => setEditing(null)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-cloud-300 bg-white p-1.5 text-[12.5px] leading-snug text-ink-800 outline-none focus:border-cloud-500"
                  autoFocus
                />
              ) : (
                <p className="text-[12.5px] leading-snug text-ink-800">{text[i]}</p>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
