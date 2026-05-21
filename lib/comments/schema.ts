/**
 * Zod validation schemas for the comment system.
 * Used by the Edge function (C2) to validate incoming POST payloads
 * and by the cron resolver (X2) to validate read rows.
 */

import { z } from 'zod';

export const commentPrioritySchema = z.enum(['P0', 'P1', 'P2']);
export const commentStatusSchema = z.enum(['open', 'in_progress', 'resolved', 'wontfix']);

export const commentInputSchema = z.object({
  route: z.string().min(1).max(200),
  x_pct: z.number().min(0).max(100),
  y_pct: z.number().min(0).max(100),
  target_selector: z.string().max(500).optional(),
  screenshot_data_url: z.string().max(700_000).optional(), // ~500KB base64
  text: z.string().min(1).max(2000),
  priority: commentPrioritySchema,
});

export type CommentInputParsed = z.infer<typeof commentInputSchema>;

export const commentRowSchema = z.object({
  id: z.string().uuid(),
  schema_version: z.literal(1),
  route: z.string().min(1).max(200),
  x_pct: z.number().min(0).max(100),
  y_pct: z.number().min(0).max(100),
  target_selector: z.string().max(500).optional(),
  screenshot_url: z.string().url().optional(),
  text: z.string().min(1).max(2000),
  priority: commentPrioritySchema,
  status: commentStatusSchema,
  ts: z.string().datetime(),
  resolved_at: z.string().datetime().optional(),
  resolved_commit: z.string().optional(),
  claude_session_id: z.string().optional(),
  pr_url: z.string().url().optional(),
  pr_number: z.number().int().positive().optional(),
});

export type CommentRowParsed = z.infer<typeof commentRowSchema>;
