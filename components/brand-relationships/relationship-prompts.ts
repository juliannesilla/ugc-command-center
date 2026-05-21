// Phase A.14e Wave 4 (E9) — Relationship-prompt presets (Smart Feature).
// Source spec: 02-campaign-pipeline-views-architecture.md L744–L753.
// In Wave 4 these are placeholders; Wave 5 E13 wires them to the Response
// Draft Generator (cited in modal copy + skill stack).
//
// Each preset is paired with the outreach-template ID it maps onto from
// UGC/_meta/09-outreach-templates.md (Julz's 9 canonical templates).

export interface RelationshipPrompt {
  key: string;
  label: string;
  blurb: string;
  /** Which template from 09-outreach-templates.md this maps to (Wave 5 wiring). */
  templateRef: string;
}

export const RELATIONSHIP_PROMPTS: RelationshipPrompt[] = [
  {
    key: 'warm_followup',
    label: 'Warm follow-up',
    blurb: 'Brand has gone quiet — nudge without pressure.',
    templateRef: 'Template 2 — Follow-Up',
  },
  {
    key: 'thank_you_call',
    label: 'Thank-you after call',
    blurb: 'Lock in the next step right after a discovery call.',
    templateRef: 'Template 3 — Call Recap',
  },
  {
    key: 'brief_request',
    label: 'Brief request',
    blurb: 'Ask for a written brief before scoping work.',
    templateRef: 'Template 5 — Review Intro + Request Brief',
  },
  {
    key: 'revision_response',
    label: 'Revision response',
    blurb: 'Reply to revision notes without losing creative control.',
    templateRef: 'Template 6 — Submit Video / Revisions',
  },
  {
    key: 'pitch_concept',
    label: 'Pitch another concept',
    blurb: 'Surface a second creative idea while you have momentum.',
    templateRef: 'Template 7 — Interested + Request Brief',
  },
  {
    key: 'ask_repeat',
    label: 'Ask for repeat work',
    blurb: 'Move from one-off to retainer once the first piece lands.',
    templateRef: 'Template 8 — Repeat / Retainer Pitch',
  },
  {
    key: 'ask_testimonial',
    label: 'Ask for testimonial',
    blurb: 'Request a quote + permission to add the work to portfolio.',
    templateRef: 'Template 9 — Testimonial + Portfolio Permission',
  },
];
