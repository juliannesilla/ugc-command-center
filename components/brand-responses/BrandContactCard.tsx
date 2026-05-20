"use client";

import { Mail, Phone, Video, MessageSquare } from "lucide-react";
import type { BrandConversation } from "@/lib/mock-data/brand-responses";
import { BrandFitStars } from "./BrandFitStars";

function avatarBg(seed: string) {
  const palettes = [
    "from-cloud-300 to-iris-300",
    "from-peach-300 to-cloud-300",
    "from-iris-200 to-cloud-400",
    "from-cloud-400 to-iris-400",
    "from-peach-100 to-iris-200",
  ];
  const i = seed.toLowerCase().charCodeAt(0) % palettes.length;
  return palettes[i];
}

export function BrandContactCard({ conv }: { conv: BrandConversation }) {
  const initials = conv.contactName
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="glass-card rounded-3xl p-5 shadow-card">
      <div className="flex items-start gap-4">
        <div
          className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${avatarBg(
            conv.logoSeed,
          )} shadow-soft text-white font-display text-xl leading-none ring-2 ring-white`}
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-display text-[20px] leading-tight text-ink-900 truncate">
              {conv.brand}
            </h2>
            <BrandFitStars value={conv.brandFit} size="sm" />
          </div>
          <p className="mt-0.5 text-[13.5px] text-ink-700 font-medium">
            {conv.contactName}
          </p>
          <p className="text-[11.5px] uppercase tracking-[0.14em] text-ink-500">
            {conv.contactRole}
          </p>
        </div>
      </div>

      <dl className="mt-5 space-y-2 text-[13px]">
        <div className="flex items-center gap-2 text-ink-700">
          <Mail className="h-3.5 w-3.5 text-cloud-500" />
          <a
            href={`mailto:${conv.contactEmail}`}
            className="truncate hover:text-cloud-700 hover:underline underline-offset-2"
          >
            {conv.contactEmail}
          </a>
        </div>
        <div className="flex items-center gap-2 text-ink-700">
          <Phone className="h-3.5 w-3.5 text-cloud-500" />
          <span className="font-mono text-[12.5px] text-ink-600">
            +1 (415) 555-{(conv.id.charCodeAt(0) % 90 + 10).toString().padStart(2, "0")}-
            {(conv.id.length * 17 % 9000 + 1000)}
          </span>
        </div>
      </dl>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <ActionIcon icon={<Mail className="h-4 w-4" />} label="Email" />
        <ActionIcon icon={<Phone className="h-4 w-4" />} label="Call" />
        <ActionIcon icon={<Video className="h-4 w-4" />} label="Video" />
      </div>

      <button
        type="button"
        className="mt-3 w-full flex items-center justify-center gap-2 rounded-2xl border border-cloud-200 bg-white/70 px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-700 hover:bg-cloud-50 transition"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        Full Thread
      </button>
    </section>
  );
}

function ActionIcon({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="group flex flex-col items-center gap-1 rounded-2xl bg-cloud-50/60 px-2 py-2.5 hover:bg-cloud-100 transition"
    >
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-white shadow-card text-cloud-600 group-hover:text-cloud-700">
        {icon}
      </span>
      <span className="text-[9.5px] uppercase tracking-[0.14em] text-ink-500">
        {label}
      </span>
    </button>
  );
}
