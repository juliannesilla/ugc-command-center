"use client";

import { useMemo, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link as LinkIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Sparkles,
  Save,
  Send,
  CheckCircle2,
} from "lucide-react";
import {
  REPLY_TEMPLATES,
  COMPOSER_VARIABLES,
  type BrandConversation,
} from "@/lib/mock-data/brand-responses";

type Props = {
  conv: BrandConversation;
};

export function ReplyComposer({ conv }: Props) {
  const [body, setBody] = useState(
    `Hi ${conv.contactName.split(" ")[0]} —\n\n`,
  );
  const [templateOpen, setTemplateOpen] = useState(false);
  const [variableOpen, setVariableOpen] = useState(false);

  const substitutions = useMemo<Record<string, string>>(
    () => ({
      brand_name: conv.brand,
      contact_first_name: conv.contactName.split(" ")[0],
      campaign: "your campaign",
      deliverable: "the deliverables",
      rate: "$X,XXX",
      timeline: "next Friday",
      // legacy support
      contactName: conv.contactName.split(" ")[0],
      brand: conv.brand,
      slot1: conv.callSlots?.[0] ?? "Tue 11:00 PT",
      slot2: conv.callSlots?.[1] ?? "Wed 2:00 PT",
      slot3: conv.callSlots?.[2] ?? "Thu 10:00 PT",
    }),
    [conv],
  );

  function applyTemplate(id: string) {
    const t = REPLY_TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    let next = t.body;
    Object.entries(substitutions).forEach(([k, v]) => {
      next = next.split(`{{${k}}}`).join(v);
    });
    setBody(next);
    setTemplateOpen(false);
  }

  function insertVariable(key: string) {
    setBody((prev) => `${prev}{{${key}}}`);
    setVariableOpen(false);
  }

  // Lightweight validator chip
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  const hasSignoff = /respectfully|julianne/i.test(body);
  const looksGood = wordCount > 25 && hasSignoff;

  return (
    <section className="rounded-3xl bg-white/90 backdrop-blur shadow-card ring-1 ring-cloud-100 overflow-hidden">
      {/* Header strip */}
      <header className="flex items-center justify-between gap-3 border-b border-cloud-100 bg-cloud-50/40 px-5 py-3">
        <h3 className="font-display text-[16px] text-ink-900">Draft Reply</h3>
        <div className="flex items-center gap-2">
          {/* Use Template dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setTemplateOpen((o) => !o);
                setVariableOpen(false);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-ink-700 ring-1 ring-cloud-200 hover:bg-cloud-50 transition"
            >
              <Sparkles className="h-3 w-3 text-cloud-500" />
              Use Template
              <ChevronDown className="h-3 w-3" />
            </button>
            {templateOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-1.5 w-80 max-h-80 overflow-y-auto rounded-2xl bg-white shadow-soft ring-1 ring-cloud-200 z-10 p-1.5"
              >
                <p className="px-3 pt-2 pb-1.5 text-[10px] uppercase tracking-[0.16em] text-ink-400">
                  12 templates · 09-outreach-templates.md
                </p>
                {REPLY_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => applyTemplate(t.id)}
                    className="block w-full text-left rounded-xl px-3 py-2 text-[12.5px] text-ink-700 hover:bg-cloud-50 transition"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Variables */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setVariableOpen((o) => !o);
                setTemplateOpen(false);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-ink-700 ring-1 ring-cloud-200 hover:bg-cloud-50 transition"
            >
              {"{{ }}"}
              <ChevronDown className="h-3 w-3" />
            </button>
            {variableOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-1.5 w-60 rounded-2xl bg-white shadow-soft ring-1 ring-cloud-200 z-10 p-1.5"
              >
                {COMPOSER_VARIABLES.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => insertVariable(v.key)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[12.5px] hover:bg-cloud-50 transition"
                  >
                    <span className="text-ink-700">{v.label}</span>
                    <span className="font-mono text-[10.5px] text-ink-400">
                      {`{{${v.key}}}`}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-cloud-100 px-3 py-1.5 bg-white">
        <ToolBtn icon={<Bold className="h-3.5 w-3.5" />} label="Bold" />
        <ToolBtn icon={<Italic className="h-3.5 w-3.5" />} label="Italic" />
        <ToolBtn icon={<Underline className="h-3.5 w-3.5" />} label="Underline" />
        <ToolBtn icon={<Strikethrough className="h-3.5 w-3.5" />} label="Strike" />
        <Divider />
        <ToolBtn icon={<LinkIcon className="h-3.5 w-3.5" />} label="Link" />
        <ToolBtn icon={<List className="h-3.5 w-3.5" />} label="Bullets" />
        <ToolBtn icon={<ListOrdered className="h-3.5 w-3.5" />} label="Numbered" />
        <Divider />
        <ToolBtn icon={<AlignLeft className="h-3.5 w-3.5" />} label="Left" />
        <ToolBtn icon={<AlignCenter className="h-3.5 w-3.5" />} label="Center" />
        <ToolBtn icon={<AlignRight className="h-3.5 w-3.5" />} label="Right" />
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={12}
        className="w-full resize-y bg-white px-5 py-4 font-body text-[14px] leading-relaxed text-ink-900 placeholder:text-ink-400 outline-none focus:bg-cloud-50/30 transition"
        placeholder="Write your reply…"
        spellCheck
      />

      {/* Footer */}
      <footer className="flex items-center justify-between gap-3 border-t border-cloud-100 bg-cloud-50/40 px-5 py-3">
        <div className="flex items-center gap-3">
          {/* Validator chip */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10.5px] uppercase tracking-[0.14em] font-semibold ring-1 ${
              looksGood
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : "bg-amber-50 text-amber-800 ring-amber-200"
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            {looksGood ? "Looks good!" : "Add sign-off"}
          </span>
          <span className="text-[10.5px] uppercase tracking-[0.14em] text-ink-400">
            {wordCount} words
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-2xl bg-white px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-700 ring-1 ring-cloud-200 hover:bg-cloud-50 transition"
          >
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-2xl bg-cloud-sunset px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white shadow-soft hover:shadow-glow transition"
          >
            <Send className="h-3.5 w-3.5" />
            Send Reply
          </button>
        </div>
      </footer>
    </section>
  );
}

function ToolBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="grid h-7 w-7 place-items-center rounded-lg text-ink-500 hover:bg-cloud-100 hover:text-ink-900 transition"
    >
      {icon}
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-4 w-px bg-cloud-200" />;
}
