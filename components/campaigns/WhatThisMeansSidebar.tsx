"use client";

import { useState } from "react";
import {
  Target,
  Users,
  Compass,
  Check,
  X,
  Lightbulb,
  BookmarkCheck,
  PenLine,
  Download,
  Share2,
  CheckCircle2,
  Zap,
} from "lucide-react";

type MeansSummary = {
  goal: string;
  audience: string;
  keyFocus: string;
  dos: string[];
  donts: string[];
};

export function WhatThisMeansSidebar({ summary }: { summary: MeansSummary }) {
  const [completed, setCompleted] = useState(false);

  return (
    <aside className="space-y-3">
      <header className="rounded-2xl bg-cloud-sunset p-[1px] shadow-soft">
        <div className="rounded-[15px] bg-white/95 p-4">
          <h2 className="font-display text-lg font-bold leading-tight text-ink-900">
            What This Means
            <span className="block bg-cloud-sunset bg-clip-text text-transparent">
              For My Deliverable
            </span>
          </h2>
          <p className="mt-1 text-[11.5px] text-ink-500">
            Translated from SOW into shoot-ready intent.
          </p>
        </div>
      </header>

      <Block icon={<Target className="h-3.5 w-3.5" />} label="Your Goal" tone="cloud">
        {summary.goal}
      </Block>
      <Block icon={<Users className="h-3.5 w-3.5" />} label="Audience" tone="iris">
        {summary.audience}
      </Block>
      <Block icon={<Compass className="h-3.5 w-3.5" />} label="Key Focus" tone="peach">
        {summary.keyFocus}
      </Block>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
        <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-emerald-700">
          <Check className="h-3.5 w-3.5" strokeWidth={3} /> Do's
        </h3>
        <ul className="space-y-1.5 text-[12.5px] text-ink-800">
          {summary.dos.map((d, i) => (
            <li key={i} className="flex gap-1.5 leading-snug">
              <span className="select-none text-emerald-600">▸</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
        <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-rose-700">
          <X className="h-3.5 w-3.5" strokeWidth={3} /> Don'ts
        </h3>
        <ul className="space-y-1.5 text-[12.5px] text-ink-800">
          {summary.donts.map((d, i) => (
            <li key={i} className="flex gap-1.5 leading-snug">
              <span className="select-none text-rose-600">▸</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-iris-50 p-4 ring-1 ring-iris-200">
        <h3 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-iris-600">
          <Lightbulb className="h-3.5 w-3.5" strokeWidth={2.5} /> Tip
        </h3>
        <p className="text-[12.5px] leading-snug text-ink-800">
          Cite paragraph numbers from the SOW in every requirement card — that's how this stays
          definitive instead of "likely."
        </p>
      </section>

      <section className="space-y-2">
        <button className="group flex w-full items-center justify-between rounded-2xl bg-ink-900 px-4 py-3 text-left text-white shadow-card transition hover:-translate-y-[1px] hover:shadow-soft">
          <span className="flex items-center gap-2 text-[13px] font-semibold">
            <BookmarkCheck className="h-4 w-4" /> Mark as Reviewed
          </span>
          <span className="text-cloud-300 transition group-hover:translate-x-0.5">→</span>
        </button>
        <button className="group flex w-full items-center justify-between rounded-2xl border border-ink-300 bg-white px-4 py-3 text-left text-ink-800 shadow-card transition hover:border-cloud-400">
          <span className="flex items-center gap-2 text-[13px] font-semibold">
            <PenLine className="h-4 w-4" /> Add a Note
          </span>
          <span className="text-ink-400 transition group-hover:translate-x-0.5">→</span>
        </button>
      </section>

      <section className="rounded-2xl border border-ink-200/70 bg-white/95 p-4 shadow-card">
        <h3 className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-700">
          <Zap className="h-3.5 w-3.5 text-cloud-600" strokeWidth={2.5} /> Quick Actions
        </h3>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => console.log("Download SOW")}
            className="group flex w-full items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-left text-[12.5px] font-semibold text-ink-800 transition hover:border-cloud-400 hover:bg-cloud-50/60"
          >
            <Download className="h-3.5 w-3.5 text-ink-500 transition group-hover:text-cloud-600" />
            Download SOW
          </button>
          <button
            type="button"
            onClick={() => console.log("Share Campaign")}
            className="group flex w-full items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-left text-[12.5px] font-semibold text-ink-800 transition hover:border-iris-300 hover:bg-iris-50/60"
          >
            <Share2 className="h-3.5 w-3.5 text-ink-500 transition group-hover:text-iris-600" />
            Share Campaign
          </button>
          <button
            type="button"
            onClick={() => setCompleted((v) => !v)}
            aria-pressed={completed}
            className={`group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[12.5px] font-semibold transition ${
              completed
                ? "border border-emerald-300 bg-emerald-50 text-emerald-800 shadow-glow"
                : "border border-ink-200 bg-white text-ink-800 hover:border-emerald-300 hover:bg-emerald-50/60"
            }`}
          >
            <CheckCircle2
              className={`h-3.5 w-3.5 transition ${
                completed ? "text-emerald-600" : "text-ink-500 group-hover:text-emerald-600"
              }`}
              strokeWidth={completed ? 3 : 2}
            />
            {completed ? "Completed" : "Mark Complete"}
          </button>
        </div>
      </section>
    </aside>
  );
}

function Block({
  icon,
  label,
  tone,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "cloud" | "iris" | "peach";
  children: React.ReactNode;
}) {
  const ring =
    tone === "cloud"
      ? "ring-cloud-200 bg-cloud-50/70"
      : tone === "iris"
      ? "ring-iris-200 bg-iris-50/70"
      : "ring-orange-200 bg-orange-50/70";
  const chip =
    tone === "cloud"
      ? "bg-cloud-200 text-cloud-700"
      : tone === "iris"
      ? "bg-iris-200 text-iris-600"
      : "bg-orange-200 text-orange-700";
  return (
    <section className={`rounded-2xl p-4 ring-1 ${ring}`}>
      <h3 className="mb-1.5 flex items-center gap-1.5">
        <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${chip}`}>
          {icon}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-700">
          {label}
        </span>
      </h3>
      <p className="text-[12.5px] leading-snug text-ink-800">{children}</p>
    </section>
  );
}
