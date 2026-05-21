/**
 * Canonical SideShift types — Phase A.14l Wave 1 · L2-S-DATA deliverable.
 *
 * `SideShiftMessage` = one inbound or outbound chat message scraped from
 * app.sideshift.app and persisted to `data/sideshift-messages.jsonl`.
 *
 * `SideShiftDraft` = one AI-generated reply draft persisted to
 * `data/sideshift-drafts.jsonl`. Drafts FK back to a message via `message_id`.
 *
 * Consumed by: L2-S-UI · L2-S-POLL · L2-S-DRAFT · L2-S-SEND.
 */

export type MsgDirection = 'inbound' | 'outbound';

export type MsgStatus = 'awaiting-you' | 'awaiting-brand' | 'no-action';

export interface SideShiftMessage {
  /** Stable hash of `thread_id + ts` (computed by L2-S-POLL). */
  id: string;
  schema_version: 1;
  thread_id: string;
  brand: string;
  campaign_title: string;
  message_text: string;
  /** Truncated preview shown in inbox row (≤140 chars by convention). */
  last_message_preview: string;
  /** ISO 8601 UTC timestamp of when the message was sent. */
  ts: string;
  direction: MsgDirection;
  status: MsgStatus;
  /** Deep-link back to the SideShift thread, e.g. https://app.sideshift.app/chat/... */
  thread_url: string;
}

export type DraftStatus = 'draft' | 'approved' | 'sent';

export interface SideShiftDraft {
  /** Stable ID for the draft (uuid v4 by convention). */
  id: string;
  /** FK → `SideShiftMessage.id`. */
  message_id: string;
  schema_version: 1;
  brand: string;
  draft_text: string;
  /** Model identifier used to generate the draft, e.g. `claude-opus-4-7`. */
  model: string;
  /** ISO 8601 UTC timestamp of generation. */
  generated_at: string;
  token_usage?: { input: number; output: number };
  status: DraftStatus;
  /** ISO 8601 UTC timestamp set by L2-S-SEND when status flips to `sent`. */
  sent_at?: string;
}

/**
 * Schema-version header line written as line 1 of each JSONL file at init.
 * Readers MUST skip rows lacking an `id` field (per `read-jsonl.ts`).
 */
export interface JsonlHeader {
  schema_version: 1;
  created: string;
  note: string;
}
