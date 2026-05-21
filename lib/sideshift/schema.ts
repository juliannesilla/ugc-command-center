/**
 * Zod validation schemas for SideShift messages + drafts.
 * Used by L2-S-POLL to validate scraped rows before append,
 * by L2-S-DRAFT to validate generated drafts before append,
 * and by L2-S-UI / L2-S-SEND to validate read rows on load.
 */

import { z } from 'zod';
import type { SideShiftMessage, SideShiftDraft } from './types';

export const msgDirectionSchema = z.enum(['inbound', 'outbound']);
export const msgStatusSchema = z.enum(['awaiting-you', 'awaiting-brand', 'no-action']);
export const draftStatusSchema = z.enum(['draft', 'approved', 'sent']);

export const sideShiftMessageSchema = z.object({
  id: z.string().min(1).max(200),
  schema_version: z.literal(1),
  thread_id: z.string().min(1).max(200),
  brand: z.string().min(1).max(200),
  campaign_title: z.string().max(500),
  message_text: z.string().max(20_000),
  last_message_preview: z.string().max(500),
  ts: z.string().datetime(),
  direction: msgDirectionSchema,
  status: msgStatusSchema,
  thread_url: z.string().url(),
}) satisfies z.ZodType<SideShiftMessage>;

export type SideShiftMessageParsed = z.infer<typeof sideShiftMessageSchema>;

export const sideShiftDraftSchema = z.object({
  id: z.string().min(1).max(200),
  message_id: z.string().min(1).max(200),
  schema_version: z.literal(1),
  brand: z.string().min(1).max(200),
  draft_text: z.string().min(1).max(20_000),
  model: z.string().min(1).max(200),
  generated_at: z.string().datetime(),
  token_usage: z
    .object({
      input: z.number().int().nonnegative(),
      output: z.number().int().nonnegative(),
    })
    .optional(),
  status: draftStatusSchema,
  sent_at: z.string().datetime().optional(),
}) satisfies z.ZodType<SideShiftDraft>;

export type SideShiftDraftParsed = z.infer<typeof sideShiftDraftSchema>;

/**
 * Header line written as line 1 of each JSONL file at init.
 * Used by `read-jsonl.ts` to recognise (and skip) the header.
 */
export const jsonlHeaderSchema = z.object({
  schema_version: z.literal(1),
  created: z.string().datetime(),
  note: z.string(),
});
