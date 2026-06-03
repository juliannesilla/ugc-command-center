'use client';

// A.AA Wave B7 — /drafts — review + copy your send-ready messages (Julz ask:
// "where are the drafts prewritten for messages that I just need to review").
// Reads the real JOAN-drafted replies (lib/drafts/message-drafts.ts), shows each
// with a one-tap Copy button + where to send it.
//
// Skills: frontend-design, refactoring-ui (hierarchy/spacing/contrast), design:ux-copy.

import { useState } from 'react';
import { PageHeader } from '@/components/ui';
import { MESSAGE_DRAFTS } from '@/lib/drafts/message-drafts';
import { Copy, Check, ExternalLink, Mail, MessageCircle } from 'lucide-react';

export default function DraftsPage() {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      window.setTimeout(() => setCopied((c) => (c === id ? null : c)), 2000);
    } catch {
      /* clipboard blocked — text is still selectable in the block */
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Send-ready · review + copy"
        title="Drafts"
        subtitle={`${MESSAGE_DRAFTS.length} messages drafted for you — review, copy, send. Tone-checked against your voice rules.`}
      />

      <section className="px-5 md:px-10 pb-16 max-w-3xl space-y-5">
        {MESSAGE_DRAFTS.map((d) => {
          const isEmail = d.channel === 'Email';
          return (
            <article key={d.id} className="card-secondary">
              {/* header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold ${isEmail ? 'bg-cloud-100 text-cloud-700' : 'bg-iris-100 text-iris-600'}`}
                  >
                    {isEmail ? <Mail className="h-3 w-3" /> : <MessageCircle className="h-3 w-3" />}
                    {d.channel}
                  </span>
                  <p className="font-display text-[16px] font-bold text-ink-900 truncate">{d.brand}</p>
                  <span className="text-[12px] text-ink-600 truncate">· {d.contact}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copy(d.id, d.text)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-ink-800 active:scale-95 transition"
                >
                  {copied === d.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied === d.id ? 'Copied' : 'Copy'}
                </button>
              </div>

              {/* where to send */}
              <p className="mt-2 text-[12.5px] text-ink-700">
                <span className="font-semibold text-ink-900">Send to:</span> {d.sendTo}
              </p>

              {/* the message */}
              <pre className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-cloud-50/60 ring-1 ring-cloud-200/60 p-4 font-body text-[13px] leading-relaxed text-ink-900">
                {d.text}
              </pre>

              {/* notes + link */}
              <div className="mt-3 flex flex-wrap items-start justify-between gap-2">
                <p className="text-[12px] text-ink-600 leading-relaxed max-w-xl">
                  <span className="font-semibold text-ink-700">Note:</span> {d.notes}
                </p>
                <a
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-cloud-700 hover:text-cloud-800 shrink-0"
                >
                  Open {isEmail ? 'booking link' : 'SideShift'} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </article>
          );
        })}

        <p className="text-[12px] text-ink-600 leading-relaxed pt-1">
          These are tone-checked against your canonical voice (≤1 exclamation, ≤1 em dash, gratitude line,
          standard sign-off). Edit any line before sending — they&rsquo;re drafts, not auto-sent.
        </p>
      </section>
    </>
  );
}
