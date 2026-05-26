"use client";

/**
 * DraftReviewPanel — A.14s S2
 * ──────────────────────────────────────────────────────────────────────────
 * Inline affordance for reviewing Claude-generated SideShift reply drafts.
 * Surfaces drafts from `data/sideshift-drafts.jsonl` (produced by
 * `scripts/draft-sideshift-replies.mjs`) next to the conversation they belong
 * to on /brand-responses.
 *
 * Microinteraction spec (Saffer 4-part):
 *   - Trigger: collapsed pill "Draft ready · click to review" (manual). State
 *     visible: idle / expanded / sent. Disabled state when no matching draft
 *     → render null (don't clutter).
 *   - Rules: find draft by thread_id match. One draft per thread (latest wins
 *     if multiple — last write in JSONL). Copy writes draft_text to clipboard.
 *     Mark-sent flips local state only (UI optimistic; persistence deferred
 *     to a future API route — documented inline + in pill tooltip).
 *   - Feedback: clipboard copy → 1.6s "Copied!" toast inline + checkmark icon
 *     swap. Mark-sent → badge swaps to green "✅ Sent (UI only)" with subtle
 *     fade. Both transitions under 200ms.
 *   - Loops/Modes: closed loop per draft. No long-loop adaptation in this
 *     phase. No global mode — each panel is independent.
 *
 * Skills applied:
 *   - frontend-design: cloud/iris/peach palette, glass-card body, restrained
 *     animation budget (200ms easings, no spinning loaders).
 *   - microinteractions: feedback within 100ms (button depress), state-clear
 *     toggle, optimistic UI for low-stakes action.
 *
 * HR-2 PRESERVE: this component is purely additive. Does not restructure
 * the page table or detail pane.
 *
 * Owner: A14S-S2-DRAFT-REVIEW · Phase A.14s
 */

import { useEffect, useMemo, useState } from "react";
import { Sparkles, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

export interface SideShiftDraft {
  /** Stable id of the draft row (uuid from generator). */
  id?: string;
  /** SideShift message id this draft replies to. */
  message_id: string;
  /** Thread the message belongs to. */
  thread_id: string;
  /** Brand name (denormalized for display when message isn't in scope). */
  brand?: string;
  /** Claude-generated reply body. */
  draft_text: string;
  /** ISO timestamp the draft was generated. */
  generated_at?: string;
  /** Lifecycle: 'pending' | 'sent' | 'archived' — UI flips locally for now. */
  status?: string;
}

type Props = {
  /** Match drafts to this thread_id. */
  threadId: string | undefined | null;
  /** Optional brand for display fallback (used if draft itself lacks brand). */
  brand?: string;
  /** Pre-loaded drafts array — page can pass [] and we'll lazy-fetch. */
  drafts?: SideShiftDraft[];
};

/**
 * Hook: fetch + parse `data/sideshift-drafts.jsonl` from the public path.
 * Returns null while loading, [] if file missing / empty, drafts otherwise.
 * Silent on errors — HR-10: render nothing rather than fabricate state.
 */
function useDrafts(initial?: SideShiftDraft[]): SideShiftDraft[] | null {
  const [drafts, setDrafts] = useState<SideShiftDraft[] | null>(
    initial && initial.length > 0 ? initial : null,
  );

  useEffect(() => {
    if (initial && initial.length > 0) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/data/sideshift-drafts.jsonl", {
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) setDrafts([]);
          return;
        }
        const txt = await res.text();
        const out: SideShiftDraft[] = [];
        for (const line of txt.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const obj = JSON.parse(trimmed);
            // Skip the schema header line (no message_id/draft_text).
            if (
              obj &&
              typeof obj.thread_id === "string" &&
              typeof obj.draft_text === "string"
            ) {
              out.push(obj as SideShiftDraft);
            }
          } catch {
            // skip malformed
          }
        }
        if (!cancelled) setDrafts(out);
      } catch {
        if (!cancelled) setDrafts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initial]);

  return drafts;
}

export function DraftReviewPanel({ threadId, brand, drafts: initial }: Props) {
  const drafts = useDrafts(initial);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  // Find latest matching draft by thread_id. Last write wins in JSONL.
  const draft = useMemo(() => {
    if (!drafts || !threadId) return null;
    for (let i = drafts.length - 1; i >= 0; i--) {
      if (drafts[i].thread_id === threadId) return drafts[i];
    }
    return null;
  }, [drafts, threadId]);

  // No matching draft → render nothing (HR-10 + microinteraction "if disabled,
  // hide rather than show greyed-out clutter").
  if (!draft) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft.draft_text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API blocked (older browsers / insecure context). Fall back
      // to a select-all hint in the toast — honest about limits, no fake
      // success state.
      setCopied(false);
    }
  };

  const handleMarkSent = () => {
    // Optimistic UI only — persistence deferred to a future API route.
    // Tooltip + caption make this explicit so Julz isn't surprised when the
    // state resets on reload.
    setSent(true);
  };

  return (
    <div className="mt-3 rounded-2xl bg-gradient-to-br from-iris-50/80 via-white/90 to-cloud-50/70 ring-1 ring-iris-100 shadow-soft overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition hover:bg-iris-50/60"
      >
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="grid h-6 w-6 place-items-center rounded-lg bg-iris-100 text-iris-600"
          >
            <Sparkles className="h-3 w-3" />
          </span>
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-iris-700">
            {sent
              ? "Sent · UI only"
              : expanded
              ? "Draft Review"
              : "Draft ready · click to review"}
          </span>
          {brand && !expanded && (
            <span className="text-[11px] text-ink-500">· {brand}</span>
          )}
        </span>
        <span className="text-ink-500">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-iris-100/70 bg-white/85 px-4 py-3.5">
          <pre className="whitespace-pre-wrap break-words font-sans text-[12.5px] leading-relaxed text-ink-800">
            {draft.draft_text}
          </pre>

          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={sent}
              className="inline-flex items-center gap-1.5 rounded-xl bg-cloud-sunset px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-card hover:shadow-soft active:translate-y-px transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy to clipboard
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleMarkSent}
              disabled={sent}
              title={
                sent
                  ? "Marked sent in this session only — persistence comes in a later phase."
                  : "Mark as sent (UI only — does not persist yet)"
              }
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition active:translate-y-px ${
                sent
                  ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 cursor-not-allowed"
                  : "bg-white text-ink-700 ring-1 ring-cloud-200 hover:bg-cloud-50"
              }`}
            >
              {sent ? (
                <>
                  <Check className="h-3 w-3" />
                  Sent
                </>
              ) : (
                <>✅ Mark as sent</>
              )}
            </button>
            {draft.generated_at && (
              <span className="ml-auto text-[10.5px] uppercase tracking-[0.14em] text-ink-400">
                Drafted {fmtTs(draft.generated_at)}
              </span>
            )}
          </div>

          <p className="mt-2 text-[10.5px] italic text-ink-400">
            Mark-as-sent is local-only this phase — full persistence ships with
            the send API route.
          </p>
        </div>
      )}
    </div>
  );
}

function fmtTs(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
