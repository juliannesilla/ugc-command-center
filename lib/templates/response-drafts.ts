/**
 * Response-draft templates for the Response Draft Generator panel.
 *
 * Sources:
 * - `UGC/_meta/dashboard-spec/01-initial-dashboard-prompt.md` L571-L587
 *   (7 template types + Julz sign-off block)
 * - `UGC/_meta/09-outreach-templates.md` (9 verbatim Julz brand-response
 *   templates that informed the bestie+direct tone of the 7 starters)
 * - `JULZ-RULES.md` Tier 1 voice: clear · structured · strategic · practical ·
 *   polished · bold · semi-casual · punchy · high-standard
 * - HR-tone bans: no "Hey guys", no overpromise language, no hardship reveals
 *
 * All templates END with the canonical sign-off block (spec L580-L587 +
 * outreach-templates.md L9-L14). Substitutable tokens are:
 *   {{brand}} · {{contact_name}} · {{product}} · {{deliverable_count}} ·
 *   {{call_date}} · {{base_pay}}
 *
 * `fillTokens(template, campaign)` substitutes the tokens using values from
 * the Campaign row. Missing values render as a sentinel ("[brand name]")
 * so Julz spots gaps before sending.
 */

import type { Campaign } from "@/lib/types/campaign";

/** The 7 template types per spec L572-L578. */
export type TemplateType =
  | "initial_interest"
  | "call_scheduling"
  | "request_sow"
  | "review_before_submit"
  | "payment_clarification"
  | "follow_up"
  | "submission_note";

/** Display metadata for the dropdown. */
export const TEMPLATE_TYPES: { id: TemplateType; label: string; useWhen: string }[] = [
  {
    id: "initial_interest",
    label: "Initial interest response",
    useWhen: "Brand reached out warm — confirm interest + request brief details.",
  },
  {
    id: "call_scheduling",
    label: "Call scheduling response",
    useWhen: "Brand wants a call — politely insist on written context first.",
  },
  {
    id: "request_sow",
    label: "Request for written SOW",
    useWhen: "Engagement is unclear — request the formal scope before committing.",
  },
  {
    id: "review_before_submit",
    label: "Review-before-submit response",
    useWhen: "Acknowledge intake materials before submitting an example video.",
  },
  {
    id: "payment_clarification",
    label: "Payment clarification response",
    useWhen: "Payment terms, bonus structure, or invoicing flow are vague.",
  },
  {
    id: "follow_up",
    label: "Follow-up response",
    useWhen: "Brand has gone quiet — warm nudge without sounding needy.",
  },
  {
    id: "submission_note",
    label: "Submission note",
    useWhen: "Final video is ready — paired with the deliverable in the message.",
  },
];

/** The Julz sign-off block — appended to every template (spec L580-L587). */
export const JULZ_SIGN_OFF = `Respectfully,
Julianne Silla
📧: julianne.mktg@gmail.com
🔗: www.juliannesilla.com`;

/**
 * Template body strings. Each one ends with a blank line + JULZ_SIGN_OFF
 * (handled by `getTemplate` so we never forget the sign-off).
 *
 * Voice notes per template are kept short — Julz wants the draft, not the
 * lecture. Tier 1 descriptors enforced: clear, polished, semi-casual, punchy.
 */
const TEMPLATE_BODIES: Record<TemplateType, string> = {
  // Spec L572 — initial interest response
  initial_interest: `Hi {{contact_name}}! Thank you so much — I'm definitely interested in the {{brand}} {{product}} campaign and would love to get started once everything is aligned.

I'd love to review the creative brief, required messaging, deliverables, usage/posting expectations, timeline, and payment structure so I can make sure everything is set up for a strong submission.

Excited to dig in once the details are confirmed!`,

  // Spec L573 — call scheduling response
  call_scheduling: `Hi {{contact_name}}! Sounds good — happy to schedule a call to discuss the {{brand}} campaign.

Before we chat, would you be able to send over a brief written overview of the campaign, deliverables, posting expectations, timeline, and payment structure? I'd love to review everything ahead of time so I can come to the call prepared with questions and concepts.

Looking forward to it — let me know what times work on your end{{call_date}}.`,

  // Spec L574 — request for written SOW
  request_sow: `Hi {{contact_name}}! Excited to keep this moving on the {{brand}} {{product}} side.

Before locking in the next step, could you send over a written SOW covering the deliverables ({{deliverable_count}} confirmed), required messaging, usage rights, posting expectations, timeline, and payment structure? Want to make sure we're fully aligned on scope before I start building concepts.

Once the SOW is in, I can turn around a strong direction quickly.`,

  // Spec L575 — review-before-submit response
  review_before_submit: `Hi {{contact_name}}! Thank you so much — really appreciate it and definitely interested.

I'm going to review the full creator intro, guidelines, and video requirements for the {{brand}} campaign carefully so my example video is fully aligned before I submit through the intro page.

I'll circle back as soon as I've worked through everything — excited to put together a strong submission.`,

  // Spec L576 — payment clarification response
  payment_clarification: `Hi {{contact_name}}! Quick check before I lock in concepts for the {{brand}} {{product}} campaign.

Could you confirm the payment structure in writing — base pay ({{base_pay}}), any bonus or performance triggers, invoicing flow, and expected timeline from submission to payment? Want to make sure everything's clear on both sides before we move into production.

Happy to keep momentum going as soon as that's confirmed.`,

  // Spec L577 — follow-up response
  follow_up: `Hi {{contact_name}}! Following up on the {{brand}} {{product}} campaign — wanted to check in on next steps.

Let me know if anything else is needed on my end to keep this moving, or if there's a better time on your side. Happy to jump back in as soon as the brief / SOW / next step is ready.

Thanks again — looking forward to keeping this rolling.`,

  // Spec L578 — submission note
  submission_note: `Hi {{contact_name}}! Excited to submit my video for the {{brand}} {{product}} campaign.

I focused on a casual, platform-native story that ties naturally into {{product}} while keeping the tone conversational and aligned with the campaign direction. I made sure the product value comes through without sounding scripted.

Happy to iterate or tweak anything — let me know if you'd like any adjustments.`,
};

/**
 * Substitute campaign-specific tokens into the template body.
 * Missing values render as a clear sentinel ("[brand name]") so Julz can
 * eyeball gaps before sending.
 */
function fillTokens(body: string, campaign: Campaign): string {
  const tokens: Record<string, string> = {
    brand: campaign.brand || "[brand name]",
    contact_name: campaign.contact_name || "there",
    product: campaign.product || "[product]",
    deliverable_count:
      campaign.deliverable_count > 0
        ? `${campaign.deliverable_count} ${campaign.deliverable_count === 1 ? "video" : "videos"}`
        : "[deliverable count]",
    call_date: campaign.call_date ? ` — I have ${campaign.call_date} blocked` : "",
    base_pay:
      campaign.base_pay !== undefined ? `$${campaign.base_pay.toLocaleString()}` : "[base pay]",
  };

  return body.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    tokens[key as keyof typeof tokens] !== undefined ? tokens[key as keyof typeof tokens] : `[${key}]`,
  );
}

/**
 * Return a fully-formed draft (filled tokens + appended sign-off) for the
 * given template type + campaign. This is the one entry point components
 * should call.
 */
export function getTemplate(type: TemplateType, campaign: Campaign): string {
  const body = TEMPLATE_BODIES[type];
  return `${fillTokens(body, campaign)}\n\n${JULZ_SIGN_OFF}`;
}
