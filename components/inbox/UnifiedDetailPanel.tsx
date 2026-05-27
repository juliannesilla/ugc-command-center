"use client";

/**
 * UnifiedDetailPanel
 * ─────────────────────────────────────────────────────────────────────────
 * Slide-over modal that opens when a row is clicked in UnifiedBrandInbox.
 * Renders full message + source-specific "Reply" CTA pointing to the source
 * UI (SideShift chat, Gmail thread, or Linear issue).
 *
 * No actual reply happens here — the static gh-pages shell can't send mail
 * or POST to Linear. The CTA is the deep link to where Julz performs the
 * action in the source system.
 *
 * SKILLS APPLIED (HR-21)
 *   - emil-design-eng     → 220ms slide+fade, escape-key close
 *   - microinteractions   → close button hover, focus trap on open
 *   - ux-heuristics       → user control (close, ESC, click-outside)
 *
 * HR-26 problems ship with solutions: no API for reply → deep link to source.
 */

import { useEffect, useRef } from "react";
import { ExternalLink, X, Sparkles, Mail, MessageSquare } from "lucide-react";
import type { UnifiedEntry, UnifiedSource } from "./UnifiedBrandInbox";

type Props = {
  entry: UnifiedEntry | null;
  onClose: () => void;
};

const SOURCE_LABEL: Record<UnifiedSource, string> = {
  sideshift: "SideShift",
  gmail: "Gmail",
  linear: "Linear",
};

const SOURCE_ICON: Record<
  UnifiedSource,
  React.ComponentType<{ className?: string }>
> = {
  sideshift: Sparkles,
  gmail: Mail,
  linear: MessageSquare,
};

const SOURCE_BADGE: Record<UnifiedSource, string> = {
  sideshift: "bg-iris-100 text-iris-700",
  gmail: "bg-peach-100 text-peach-700",
  linear: "bg-cloud-100 text-cloud-700",
};

const REPLY_HINT: Record<UnifiedSource, string> = {
  sideshift:
    "Reply happens inside the SideShift chat UI — open the thread to draft, paste a saved reply, or send a fresh message.",
  gmail:
    "Reply opens the Gmail thread directly. Drafts you save there will appear in /brand-responses on the next poll.",
  linear:
    "Reply opens the Linear issue — comment threads from there sync back to this inbox on the next poll.",
};

export function UnifiedDetailPanel({ entry, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // Esc-to-close + focus the close button on open (a11y)
  useEffect(() => {
    if (!entry) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [entry, onClose]);

  if (!entry) return null;

  const Icon = SOURCE_ICON[entry.source];
  const tsLabel = (() => {
    const d = new Date(entry.ts);
    if (isNaN(d.getTime())) return entry.ts;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  })();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Message from ${entry.brand}`}
      className="fixed inset-0 z-50 flex items-stretch justify-end"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close detail"
        onClick={onClose}
        className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm animate-in fade-in duration-200"
      />

      {/* Panel */}
      <div
        className="relative ml-auto h-full w-full max-w-[560px] overflow-y-auto bg-white shadow-2xl ring-1 ring-cloud-100 animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-cloud-100 bg-white/95 backdrop-blur px-6 py-5">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-2xl ${SOURCE_BADGE[entry.source]}`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ink-700">
                {SOURCE_LABEL[entry.source]} · {tsLabel}
              </p>
              <h2 className="mt-1 font-display text-[22px] leading-tight text-ink-900">
                {entry.brand}
              </h2>
              <p className="mt-0.5 text-[13px] text-ink-600">
                {entry.subject}
              </p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl text-ink-700 hover:bg-cloud-50 hover:text-ink-900 transition focus:outline-none focus:ring-2 focus:ring-cloud-300"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          <section>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ink-700">
              Message
            </p>
            <div className="mt-2 rounded-2xl bg-cloud-50/50 p-4 ring-1 ring-cloud-100">
              <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink-800">
                {entry.preview || "(no body captured by poller)"}
              </p>
            </div>
          </section>

          {/* Source-specific metadata */}
          {Object.keys(entry.meta).length > 0 && (
            <section>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ink-700">
                Source metadata
              </p>
              <dl className="mt-2 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 text-[12.5px]">
                {Object.entries(entry.meta).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="font-mono text-ink-700">{k}</dt>
                    <dd className="truncate text-ink-800">
                      {Array.isArray(v)
                        ? v.join(", ") || "—"
                        : v === "" || v == null
                          ? "—"
                          : String(v)}
                    </dd>
                  </div>
                ))}
                <div className="contents">
                  <dt className="font-mono text-ink-700">direction</dt>
                  <dd className="text-ink-800">{entry.direction}</dd>
                </div>
              </dl>
            </section>
          )}

          {/* Reply CTA */}
          <section>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ink-700">
              Reply
            </p>
            <p className="mt-1.5 text-[12.5px] text-ink-600">
              {REPLY_HINT[entry.source]}
            </p>
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-cloud-sunset px-4 py-2.5 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-white shadow-card hover:shadow-soft transition"
            >
              Open in {SOURCE_LABEL[entry.source]}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
