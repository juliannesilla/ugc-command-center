"use client";

import { useState } from "react";
import { FileText, Copy, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CaseStudyButton — A.14t T6 (A.4 G31 deferred-gap)
 *
 * UI-shell-localhost-CLI pattern: button reveals the local CLI command Julz
 * runs from her terminal to draft `UGC/<slug>/CASE-STUDY.md` via the
 * Anthropic SDK (scripts/generate-case-study.mjs). Click → expands a
 * one-line command panel with a copy button. No API call from the browser.
 *
 * Why this pattern: static-export build (DEPLOY_TARGET=vercel + gh-pages)
 * has no server runtime. Spend-bearing AI calls live in the local script;
 * the UI surfaces the command so Julz never has to remember the flag.
 */
export function CaseStudyButton({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const command = `npm run generate-case-study -- --slug=${slug}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API can be blocked in some contexts — fall through silently
    }
  }

  return (
    <article className="glass-card rounded-2xl p-5 shadow-card">
      <header className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-iris-100 text-iris-600">
          <FileText className="h-3.5 w-3.5" strokeWidth={2.4} />
        </span>
        <h2 className="font-display text-base font-bold text-ink-900">
          Case Study
        </h2>
      </header>

      <p className="text-[12.5px] leading-snug text-ink-700">
        Auto-draft a <code className="rounded bg-cloud-100 px-1 py-0.5 text-[11px] font-medium text-cloud-700">CASE-STUDY.md</code>{" "}
        from this campaign&apos;s SOW, script, QA, and metrics. Output writes to{" "}
        <code className="rounded bg-cloud-100 px-1 py-0.5 text-[11px] font-medium text-cloud-700">
          UGC/{slug}/CASE-STUDY.md
        </code>{" "}
        — review, approve, then portfolio (W1-A) ingests.
      </p>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "mt-4 inline-flex items-center gap-2 rounded-xl bg-iris-500 px-4 py-2 text-[12.5px] font-semibold text-white shadow-card transition duration-200 ease-out",
          "hover:-translate-y-[1px] hover:bg-iris-600 hover:shadow-soft active:scale-[0.99] will-change-transform",
        )}
        aria-expanded={open}
      >
        <Sparkles className="h-3.5 w-3.5" />
        {open ? "Hide command" : "Generate case study"}
      </button>

      {open && (
        <div className="mt-4 rounded-xl border border-cloud-200 bg-white/80 p-3">
          <p className="mb-2 flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-700">
            <FileText className="h-3 w-3" /> Run locally
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-lg bg-ink-900 px-3 py-2 font-mono text-[11.5px] text-cloud-100">
              {command}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cloud-200 bg-white text-ink-700 transition",
                "hover:border-iris-400 hover:text-iris-600 active:scale-[0.95]",
                copied && "border-emerald-400 text-emerald-600",
              )}
              aria-label="Copy command"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-3 text-[11px] leading-snug text-ink-700">
            Requires <code className="text-ink-700">ANTHROPIC_API_KEY</code> in
            your shell. Daily spend cap: <strong>$5</strong>. Add{" "}
            <code className="text-ink-700">--dry-run</code> to preview without
            an API call.
          </p>
        </div>
      )}
    </article>
  );
}
