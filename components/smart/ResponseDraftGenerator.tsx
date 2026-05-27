"use client";

/**
 * ResponseDraftGenerator
 *
 * Spec: `01-initial-dashboard-prompt.md` L570-L587 — Response Draft Generator.
 *   "A panel that generates: initial interest · call scheduling · request for
 *    written SOW · review-before-submit · payment clarification · follow-up ·
 *    submission note. Include my sign-off."
 *
 * What this is: a slide-out drawer that, given a `Campaign` row, lets Julz
 *   1. pick one of 7 template types (dropdown)
 *   2. see a token-filled draft with her sign-off auto-appended
 *   3. edit the draft in place (textarea)
 *   4. copy to clipboard OR "Insert into Gmail" (v2 placeholder)
 *
 * Templates live in `lib/templates/response-drafts.ts` — kept out of this
 * component so the strings are reviewable in isolation and so the same
 * templates can power the W8 n8n post-campaign autodrafter later.
 *
 * Voice: bestie + direct (per JULZ-RULES Tier 1). Templates ship with no
 * "Hey guys", no overpromise language, no hardship reveals — verified once
 * here, never re-checked at runtime.
 */

import { useMemo, useState } from "react";
import { Check, Copy, Mail, X } from "lucide-react";
import {
  getTemplate,
  TEMPLATE_TYPES,
  type TemplateType,
} from "@/lib/templates/response-drafts";
import type { Campaign } from "@/lib/types/campaign";

type Props = {
  campaign: Campaign;
  defaultType?: TemplateType;
  /** Render trigger inline (default) or controlled externally via `open`. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ResponseDraftGenerator({
  campaign,
  defaultType = "initial_interest",
  open: controlledOpen,
  onOpenChange,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    else setInternalOpen(v);
  };

  const [type, setType] = useState<TemplateType>(defaultType);
  const [copied, setCopied] = useState(false);

  // Regenerate fresh draft whenever campaign or type changes; keep edits
  // sticky inside the textarea (`uncontrolled defaultValue`-style via key).
  const generated = useMemo(() => getTemplate(type, campaign), [type, campaign]);
  const [draft, setDraft] = useState(generated);

  // When user picks a new type, reset the draft. Use the type+campaign id as
  // a reset key so manual edits aren't blown away by re-renders unrelated to
  // the selection.
  const resetKey = `${campaign.campaign_id}-${type}`;
  const [lastKey, setLastKey] = useState(resetKey);
  if (lastKey !== resetKey) {
    setLastKey(resetKey);
    setDraft(generated);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Older browsers — fallback: select the textarea
      const el = document.getElementById("rdg-draft-textarea") as HTMLTextAreaElement | null;
      el?.select();
      document.execCommand?.("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  function handleInsertGmail() {
    // v2 will wire Gmail compose via the Google Workspace MCP. For now keep
    // the affordance discoverable but honest about scope.
    alert("Opens Gmail with draft (coming in v2)");
  }

  return (
    <>
      {/* Trigger — only render when uncontrolled */}
      {controlledOpen === undefined && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-cloud-sunset px-4 py-2 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition"
        >
          <Mail className="h-4 w-4" />
          Draft response
        </button>
      )}

      {/* Drawer */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-stretch justify-end bg-ink-900/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rdg-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full md:max-w-2xl bg-white shadow-soft rounded-t-3xl md:rounded-none md:rounded-l-3xl ring-1 ring-iris-100 flex flex-col max-h-[92vh] md:max-h-screen">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-5 md:p-7 border-b border-cloud-100">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.28em] text-cloud-700 font-semibold">
                  Response draft
                </p>
                <h2
                  id="rdg-title"
                  className="mt-1 font-display text-2xl md:text-3xl text-ink-900 leading-tight"
                >
                  {campaign.brand} · {campaign.campaign_name}
                </h2>
                <p className="mt-1 text-[13px] text-ink-700">
                  Token-filled draft with sign-off auto-appended. Edit before sending.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-ink-700 hover:bg-cloud-50 transition"
                aria-label="Close draft generator"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 md:p-7 space-y-5">
              {/* Template type picker */}
              <div>
                <label
                  htmlFor="rdg-template-type"
                  className="block text-[11px] uppercase tracking-[0.2em] text-ink-600 font-semibold mb-2"
                >
                  Template
                </label>
                <select
                  id="rdg-template-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as TemplateType)}
                  className="w-full rounded-2xl border border-cloud-200 bg-white px-4 py-3 text-sm text-ink-900 ring-1 ring-transparent focus:ring-cloud-sunset focus:border-cloud-sunset transition"
                >
                  {TEMPLATE_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-[12px] text-ink-700 italic">
                  {TEMPLATE_TYPES.find((t) => t.id === type)?.useWhen}
                </p>
              </div>

              {/* Editable draft */}
              <div>
                <label
                  htmlFor="rdg-draft-textarea"
                  className="block text-[11px] uppercase tracking-[0.2em] text-ink-600 font-semibold mb-2"
                >
                  Draft
                </label>
                <textarea
                  id="rdg-draft-textarea"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={18}
                  className="w-full rounded-2xl border border-cloud-200 bg-cloud-50/30 px-4 py-3 text-[14px] leading-relaxed text-ink-900 font-mono focus:ring-cloud-sunset focus:border-cloud-sunset transition resize-y"
                  spellCheck
                />
                <p className="mt-2 text-[11px] text-ink-700">
                  Sign-off auto-appended. Edits stay until you switch templates.
                </p>
              </div>
            </div>

            {/* Footer actions */}
            <div className="border-t border-cloud-100 p-5 md:p-7 flex flex-wrap gap-3 justify-end">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink-700 ring-1 ring-cloud-200 hover:ring-cloud-300 transition"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-iris-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy to clipboard
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleInsertGmail}
                className="inline-flex items-center gap-2 rounded-full bg-cloud-sunset px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition"
              >
                <Mail className="h-4 w-4" />
                Insert into Gmail
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
