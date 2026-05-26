"use client";

/**
 * SideShiftMessageQueue
 * ──────────────────────────────────────────────────────────────────────────
 * SideShift-flavored sibling of `MessageQueue.tsx`. Renders the same row/card
 * pattern (so muscle memory transfers from the Gmail tab) but reads the
 * SideShift data shape (brand · campaign_title · last_message_preview ·
 * draft_ready · thread_url · status).
 *
 * Data source: `data/sideshift-messages.jsonl` (owned by L2-S-DATA, not yet
 * on disk). We try a static dynamic-import via the API route. If the file or
 * route is missing we render a calm stub state with a "data feed not wired
 * yet" hint — preserves the Gmail tab from any blast radius and gives Julz
 * a visible "draft ready" / "awaiting brand" cue once the feed lands.
 *
 * Skills applied:
 *  - refactoring-ui: row hierarchy mirrors MessageQueue.tsx (brand bold,
 *    campaign + preview de-emphasized, status chip right-aligned).
 *  - hooked-ux: "DRAFT READY" badge is the variable reward — pulls the eye
 *    to actionable rows so checking SideShift becomes a habit loop.
 *  - ux-heuristics: visibility of system status (status chip per row),
 *    match between system + real world (uses SideShift's own labels:
 *    "Awaiting You", "Awaiting Brand"), recognition not recall (brand
 *    avatar + campaign title together, no need to remember which brand goes
 *    with which campaign).
 *  - microinteractions: subtle row hover, ring on selected row, pulse on
 *    DRAFT READY badge (drives variable-reward engagement loop).
 *
 * Owner: A14L-L2-S-UI · Phase A.14l Wave 1
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Sparkles } from "lucide-react";
import { StatusChip } from "@/components/ui/status-chip";

/**
 * Local stub — mirrors the contract L2-S-DATA is building at
 * `lib/sideshift/types.ts`. When that file lands, swap this stub for
 * `import type { SideShiftMessage } from "@/lib/sideshift/types";`.
 */
export interface SideShiftMessage {
  id: string;
  brand: string;
  campaign_title: string;
  last_message_preview: string;
  last_message_ts: string;
  direction: "inbound" | "outbound";
  draft_ready: boolean;
  draft_text?: string;
  thread_url: string;
  status: "awaiting-you" | "awaiting-brand" | "no-action";
  thread_id?: string;
}

/**
 * A.14s S4: brand-fit score row written by scripts/score-brand-fit.mjs.
 * Loaded client-side from /data/brand-fit-scores.jsonl alongside the
 * messages feed. Keyed by thread_id (multiple messages share one thread).
 */
export interface BrandFitScore {
  thread_id: string;
  brand: string;
  score: number; // 1-10
  reasoning: string;
  niche_match: "strong" | "moderate" | "weak";
  brand_safety: "safe" | "review" | "avoid";
  scored_at: string;
}

/**
 * A.14s S4: Fit score badge. Color band reflects triage priority —
 * green=reply-first, amber=reply-soon, red=deprioritize. Tooltip surfaces
 * the one-line reasoning so Julz can decide without opening the row.
 */
function FitBadge({ score, reasoning }: { score: number; reasoning?: string }) {
  const tone =
    score >= 7
      ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
      : score >= 4
      ? "bg-amber-100 text-amber-700 ring-amber-200"
      : "bg-red-100 text-red-700 ring-red-200";
  return (
    <span
      className={`inline-flex h-7 w-9 items-center justify-center rounded-lg ring-1 font-mono text-[12.5px] font-semibold tabular-nums ${tone}`}
      title={reasoning ? `Fit ${score}/10 — ${reasoning}` : `Fit ${score}/10`}
      aria-label={`Brand fit score ${score} out of 10`}
    >
      {score}
    </span>
  );
}

type Props = {
  search: string;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
};

const STATUS_TONE: Record<
  SideShiftMessage["status"],
  React.ComponentProps<typeof StatusChip>["tone"]
> = {
  "awaiting-you": "pink",
  "awaiting-brand": "orange",
  "no-action": "green",
};

const STATUS_LABEL: Record<SideShiftMessage["status"], string> = {
  "awaiting-you": "Awaiting You",
  "awaiting-brand": "Awaiting Brand",
  "no-action": "No Action",
};

function avatarBg(seed: string) {
  const palettes = [
    "from-cloud-300 to-iris-300",
    "from-peach-300 to-cloud-300",
    "from-iris-200 to-cloud-400",
    "from-cloud-400 to-iris-400",
    "from-peach-100 to-iris-200",
  ];
  const ch = (seed || "x").toLowerCase().charCodeAt(0) || 120;
  return palettes[ch % palettes.length];
}

function fmtTs(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const now = Date.now();
  const diff = now - d.getTime();
  const hrs = Math.floor(diff / 3_600_000);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function SideShiftMessageQueue({ search, selectedId, onSelect }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<SideShiftMessage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // A.14s S4: brand-fit scores loaded once, indexed by thread_id.
  // Missing file or empty = scoresByThread stays empty (graceful — Fit
  // column renders "—" placeholder, table stays usable).
  const [scoresByThread, setScoresByThread] = useState<Record<string, BrandFitScore>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/data/brand-fit-scores.jsonl", { cache: "no-store" });
        if (!res.ok) return;
        const txt = await res.text();
        const out: Record<string, BrandFitScore> = {};
        for (const line of txt.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const obj = JSON.parse(trimmed);
            if (obj && typeof obj.thread_id === "string" && typeof obj.score === "number") {
              out[obj.thread_id] = obj as BrandFitScore;
            }
          } catch {
            // skip schema-header / malformed lines
          }
        }
        if (!cancelled) setScoresByThread(out);
      } catch {
        // silent — Fit column gracefully shows "—"
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Try API route first; fall back to static file if needed. Both can
    // legitimately 404 in dev until L2-S-DATA lands — that's not a bug, just
    // a "feed not wired yet" state.
    (async () => {
      try {
        const res = await fetch("/api/sideshift-messages", { cache: "no-store" });
        if (res.ok) {
          const txt = await res.text();
          const parsed = parseJsonl(txt);
          if (!cancelled) setMessages(parsed);
          return;
        }
        // Try the static jsonl file directly (works in static export too)
        const stat = await fetch("/data/sideshift-messages.jsonl", { cache: "no-store" });
        if (stat.ok) {
          const txt = await stat.text();
          const parsed = parseJsonl(txt);
          if (!cancelled) setMessages(parsed);
          return;
        }
        if (!cancelled) {
          setMessages([]);
          setError("SideShift feed not wired yet — L2-S-DATA in progress.");
        }
      } catch (e) {
        if (!cancelled) {
          setMessages([]);
          setError(
            e instanceof Error
              ? `Couldn't load SideShift feed: ${e.message}`
              : "Couldn't load SideShift feed.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = (id: string) => {
    if (onSelect) {
      onSelect(id);
    } else {
      router.push(`/brand-responses?source=sideshift&id=${id}`, { scroll: false });
    }
  };

  const rows = (messages ?? []).filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.brand.toLowerCase().includes(q) ||
      m.campaign_title.toLowerCase().includes(q) ||
      m.last_message_preview.toLowerCase().includes(q)
    );
  });

  return (
    <div className="overflow-hidden rounded-3xl bg-white/85 backdrop-blur shadow-card ring-1 ring-cloud-100">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="bg-cloud-50/60 text-[10px] uppercase tracking-[0.16em] text-ink-500">
              <Th>Brand / Campaign</Th>
              <Th>Fit</Th>
              <Th>Last Message</Th>
              <Th>When</Th>
              <Th>Status</Th>
              <Th className="text-right pr-5">Action</Th>
            </tr>
          </thead>
          <tbody>
            {messages === null && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-16 text-center text-ink-400 italic"
                >
                  Loading SideShift inbox…
                </td>
              </tr>
            )}
            {messages !== null && rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-16 text-center text-ink-500"
                >
                  <p className="italic">
                    {error ?? "No SideShift conversations yet."}
                  </p>
                  {error && (
                    <p className="mt-2 text-[11px] text-ink-400">
                      Drop a JSONL feed at <code>/data/sideshift-messages.jsonl</code> or
                      wire up <code>/api/sideshift-messages</code>.
                    </p>
                  )}
                </td>
              </tr>
            )}
            {rows.map((m) => {
              const isActive = selectedId === m.id;
              const needsYou = m.status === "awaiting-you";
              // A.14s S4: lookup score by thread_id (preferred) with fallback
              // to id since older feed rows may not carry a thread_id column.
              const fit =
                (m.thread_id && scoresByThread[m.thread_id]) ||
                scoresByThread[m.id] ||
                null;
              return (
                <tr
                  key={m.id}
                  onClick={() => handleSelect(m.id)}
                  aria-selected={isActive}
                  className={`group border-t border-cloud-100 transition cursor-pointer ${
                    isActive
                      ? "bg-cloud-50 ring-2 ring-inset ring-cloud-300"
                      : needsYou
                      ? "bg-white hover:bg-cloud-50/50"
                      : "bg-white/60 hover:bg-cloud-50/40"
                  }`}
                >
                  <td className="px-5 py-3.5 align-middle">
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${avatarBg(
                          m.brand,
                        )} text-white font-display text-[14px] shadow-card`}
                        aria-hidden
                      >
                        {(m.brand[0] ?? "?").toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          {needsYou && (
                            <span
                              aria-hidden
                              className="inline-block h-1.5 w-1.5 rounded-full bg-cloud-500"
                            />
                          )}
                          <p
                            className={`truncate ${
                              needsYou
                                ? "font-semibold text-ink-900"
                                : "text-ink-700"
                            }`}
                          >
                            {m.brand}
                          </p>
                        </div>
                        <p className="truncate text-[11.5px] text-ink-500">
                          {m.campaign_title}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 align-middle">
                    {fit ? (
                      <FitBadge score={fit.score} reasoning={fit.reasoning} />
                    ) : (
                      <span
                        className="inline-flex h-7 w-9 items-center justify-center rounded-lg bg-cloud-50 text-ink-400 font-mono text-[12.5px] ring-1 ring-cloud-100"
                        title="Brand-fit score not generated yet — run `npm run score-brand-fit` with ANTHROPIC_API_KEY set."
                        aria-label="Brand fit score not available"
                      >
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 align-middle">
                    <div className="max-w-[24rem]">
                      <p className="truncate text-ink-700">
                        {m.last_message_preview}
                      </p>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-ink-400">
                        {m.direction === "inbound" ? "Inbound" : "Sent"}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 align-middle text-ink-600 font-mono text-[12px]">
                    {fmtTs(m.last_message_ts)}
                  </td>
                  <td className="px-5 py-3.5 align-middle">
                    <div className="flex items-center gap-2">
                      <StatusChip tone={STATUS_TONE[m.status]}>
                        {STATUS_LABEL[m.status]}
                      </StatusChip>
                      {m.draft_ready && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-iris-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-iris-600 ring-1 ring-iris-200 animate-pulse-soft"
                          title="A draft reply is ready for you to review"
                        >
                          <Sparkles className="h-2.5 w-2.5" />
                          Draft Ready
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 align-middle text-right">
                    <a
                      href={m.thread_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 rounded-xl bg-cloud-100 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-cloud-700 opacity-0 group-hover:opacity-100 transition"
                    >
                      Open in SideShift
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-5 py-3 font-semibold text-left ${className ?? ""}`}
      scope="col"
    >
      {children}
    </th>
  );
}

/**
 * Parse JSONL into SideShiftMessage[]. Silent-drops malformed lines so a
 * single bad row doesn't blank the whole inbox — defensive UX over strict
 * validation, matching how Gmail handles malformed threads.
 */
function parseJsonl(text: string): SideShiftMessage[] {
  const out: SideShiftMessage[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const obj = JSON.parse(trimmed);
      if (obj && typeof obj.id === "string" && typeof obj.brand === "string") {
        out.push(obj as SideShiftMessage);
      }
    } catch {
      // skip malformed
    }
  }
  return out;
}

/**
 * Standalone SideShift detail block — used by /brand-responses when in
 * SideShift mode with an id selected. We can't pass SideShift data through
 * `BrandResponseDetailPanel` (it's tightly coupled to the Gmail mock data
 * shape AND owned by L3-G this phase), so this is the sister "detail" view.
 *
 * Pattern parity: same rounded-3xl glass card stack as the Gmail panel.
 */
export function SideShiftDetailPanel({ id }: { id: string | null }) {
  const [messages, setMessages] = useState<SideShiftMessage[] | null>(null);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [draft, setDraft] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let txt = "";
        const res = await fetch("/api/sideshift-messages", { cache: "no-store" });
        if (res.ok) {
          txt = await res.text();
        } else {
          const stat = await fetch("/data/sideshift-messages.jsonl", { cache: "no-store" });
          if (stat.ok) txt = await stat.text();
        }
        if (!cancelled) setMessages(parseJsonl(txt));
      } catch {
        if (!cancelled) setMessages([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const msg = id && messages ? messages.find((m) => m.id === id) ?? null : null;

  // Sync draft state when a different message is selected
  useEffect(() => {
    setDraft(msg?.draft_text ?? "");
    setSendResult(null);
  }, [msg?.id, msg?.draft_text]);

  if (!id) {
    return (
      <div className="flex h-full min-h-[480px] flex-col items-center justify-center rounded-3xl bg-white/85 backdrop-blur p-10 text-center shadow-card ring-1 ring-cloud-100">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cloud-100 text-cloud-700">
          <Sparkles className="h-5 w-5" />
        </span>
        <h2 className="mt-4 font-display text-[22px] leading-tight text-ink-900">
          Select a SideShift thread
        </h2>
        <p className="mt-2 max-w-xs text-[12.5px] leading-relaxed text-ink-500">
          Pick a brand from the queue on the left to review the thread and
          send via SideShift.
        </p>
      </div>
    );
  }

  if (!messages) {
    return (
      <div className="flex h-full min-h-[480px] items-center justify-center rounded-3xl bg-white/85 backdrop-blur p-10 text-center shadow-card ring-1 ring-cloud-100 text-ink-400 italic">
        Loading thread…
      </div>
    );
  }

  if (!msg) {
    return (
      <div className="flex h-full min-h-[480px] flex-col items-center justify-center rounded-3xl bg-white/85 backdrop-blur p-10 text-center shadow-card ring-1 ring-cloud-100">
        <h2 className="font-display text-[22px] text-ink-900">
          Thread not found
        </h2>
        <p className="mt-2 max-w-xs text-[12.5px] text-ink-500">
          That SideShift thread isn&apos;t in the current feed. Try picking
          another from the queue.
        </p>
      </div>
    );
  }

  const handleSend = async () => {
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/sideshift-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msg.id, body: draft }),
      });
      if (res.ok) {
        setSendResult("Sent via SideShift.");
      } else if (res.status === 501) {
        setSendResult("Send endpoint not ready yet (L2-S-SEND in progress).");
      } else {
        const t = await res.text();
        setSendResult(`Send failed (${res.status}): ${t || "unknown error"}`);
      }
    } catch (e) {
      setSendResult(
        e instanceof Error ? `Send failed: ${e.message}` : "Send failed.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3 rounded-3xl bg-white/85 backdrop-blur px-5 py-4 shadow-card ring-1 ring-cloud-100">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-ink-500">
            SideShift · {msg.campaign_title}
          </p>
          <h2 className="mt-0.5 truncate font-display text-[24px] leading-tight tracking-tight text-ink-900">
            {msg.brand}
          </h2>
        </div>
        <StatusChip tone={STATUS_TONE[msg.status]}>
          {STATUS_LABEL[msg.status]}
        </StatusChip>
      </header>

      <article className="rounded-3xl bg-white/85 backdrop-blur p-6 shadow-card ring-1 ring-cloud-100">
        <header className="flex items-center justify-between">
          <h3 className="text-[11px] uppercase tracking-[0.16em] font-semibold text-ink-700">
            Last Message
          </h3>
          <span className="text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
            {fmtTs(msg.last_message_ts)} · {msg.direction}
          </span>
        </header>
        <blockquote className="mt-4 border-l-2 border-cloud-300 pl-4 font-display text-[17px] leading-snug text-ink-900">
          &ldquo;{msg.last_message_preview}&rdquo;
        </blockquote>
        <a
          href={msg.thread_url}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-4 inline-flex items-center gap-1 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-cloud-700 hover:text-cloud-600 transition"
        >
          Open full thread in SideShift
          <ExternalLink className="h-3 w-3" />
        </a>
      </article>

      <article className="rounded-3xl bg-white/85 backdrop-blur p-6 shadow-card ring-1 ring-cloud-100">
        <header className="flex items-center justify-between">
          <h3 className="text-[11px] uppercase tracking-[0.16em] font-semibold text-ink-700">
            Draft Reply
          </h3>
          {msg.draft_ready && (
            <span className="inline-flex items-center gap-1 rounded-full bg-iris-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-iris-600 ring-1 ring-iris-200">
              <Sparkles className="h-2.5 w-2.5" />
              Draft Ready
            </span>
          )}
        </header>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={8}
          placeholder={
            msg.draft_ready
              ? "Edit the auto-generated draft before sending…"
              : "No auto-draft yet — write your reply here."
          }
          className="mt-3 w-full rounded-2xl bg-white p-4 text-[13px] text-ink-900 ring-1 ring-cloud-200 focus:outline-none focus:ring-2 focus:ring-cloud-300 leading-relaxed"
        />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !draft.trim()}
            className="flex items-center gap-1.5 rounded-2xl bg-cloud-sunset px-3.5 py-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white shadow-card hover:shadow-soft transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "Sending…" : "Send via SideShift"}
          </button>
          <a
            href={msg.thread_url}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-1.5 rounded-2xl bg-white px-3.5 py-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-ink-700 ring-1 ring-cloud-200 hover:bg-cloud-50 transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in SideShift
          </a>
        </div>
        {sendResult && (
          <p className="mt-3 text-[11.5px] text-ink-600">{sendResult}</p>
        )}
      </article>
    </div>
  );
}
