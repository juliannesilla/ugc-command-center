"use client";

import { StickyNote, Plus, Clock } from "lucide-react";
import type { BrandConversation } from "@/lib/mock-data/brand-responses";

interface Note {
  id: string;
  body: string;
  updatedAt: string;
  author: string;
}

function mockNotesFor(conv: BrandConversation): Note[] {
  // Pull conv.notes as the latest (if present), plus a second note derived
  // from brandFit + status so each conversation has 2 notes per mockup #7.
  const latest: Note = {
    id: `${conv.id}-n1`,
    body:
      conv.notes ??
      `Touched base re: ${conv.brand}. Awaiting full creative brief.`,
    updatedAt: "12 min ago",
    author: "Julz",
  };
  const earlier: Note = {
    id: `${conv.id}-n2`,
    body:
      conv.brandFit >= 4
        ? `Strong fit — ${conv.brandFit}/5 brand alignment. Prioritize.`
        : `Mid-tier fit — only ${conv.brandFit}/5 on alignment. Verify rate.`,
    updatedAt: "2 days ago",
    author: "Julz",
  };
  return [latest, earlier];
}

export function NotesCard({ conv }: { conv: BrandConversation }) {
  const notes = mockNotesFor(conv);
  const latest = notes[0];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white/85 backdrop-blur shadow-card ring-1 ring-cloud-100">
      {/* cloud-sunset gradient header */}
      <header className="relative bg-cloud-sunset px-5 py-3.5 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-40 bg-grain"
        />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-xl bg-white/25 backdrop-blur text-white ring-1 ring-white/30">
              <StickyNote className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-[11px] uppercase tracking-[0.18em] font-semibold">
              Notes
            </h3>
          </div>
          <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-cloud-700 shadow-card">
            {notes.length} notes
          </span>
        </div>
      </header>

      {/* Body */}
      <div className="px-5 pt-4 pb-5">
        <p className="text-[10.5px] uppercase tracking-[0.14em] text-ink-700 flex items-center gap-1">
          <Clock className="h-3 w-3 text-cloud-500" />
          Last updated {latest.updatedAt}
        </p>

        <blockquote className="mt-2.5 border-l-2 border-cloud-300 pl-3 font-display text-[14.5px] leading-snug text-ink-900 italic">
          &ldquo;{latest.body}&rdquo;
        </blockquote>
        <p className="mt-1.5 text-[10.5px] uppercase tracking-[0.14em] text-ink-700">
          — {latest.author}
        </p>

        {notes[1] && (
          <div className="mt-4 rounded-2xl bg-cloud-50/60 px-3 py-2.5">
            <p className="text-[12px] leading-relaxed text-ink-600 italic line-clamp-2">
              &ldquo;{notes[1].body}&rdquo;
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-ink-600">
              {notes[1].updatedAt} · {notes[1].author}
            </p>
          </div>
        )}

        <button
          type="button"
          className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-2xl bg-cloud-sunset px-3 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white shadow-card hover:shadow-soft transition"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Note
        </button>
      </div>
    </section>
  );
}
