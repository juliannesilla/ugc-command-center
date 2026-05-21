/**
 * Server-side JSONL row formatter for `data/comments.jsonl`.
 *
 * The Edge function (C2) does NOT write to the local filesystem on Vercel —
 * it appends to the file via the GitHub Contents API. This helper produces
 * the canonical line string (with trailing newline) that gets concatenated
 * onto the existing file content before being PUT back.
 *
 * Keep field order stable so JSONL diffs stay readable in PRs.
 */

import { randomUUID } from 'node:crypto';
import type { Comment, CommentInput } from './types';

export interface BuildCommentArgs {
  input: CommentInput;
  screenshot_url?: string;             // Resolved GitHub URL after image upload
  id?: string;                         // Override (default: uuid v4)
  ts?: string;                         // Override (default: now ISO)
}

export function buildComment({
  input,
  screenshot_url,
  id,
  ts,
}: BuildCommentArgs): Comment {
  return {
    id: id ?? randomUUID(),
    schema_version: 1,
    route: input.route,
    x_pct: input.x_pct,
    y_pct: input.y_pct,
    target_selector: input.target_selector,
    screenshot_url,
    text: input.text,
    priority: input.priority,
    status: 'open',
    ts: ts ?? new Date().toISOString(),
  };
}

/**
 * Serialize a Comment as a single JSONL line. Trailing newline included so
 * the result can be appended directly to existing file content.
 */
export function formatCommentRow(comment: Comment): string {
  return JSON.stringify(comment) + '\n';
}

/**
 * Append a new comment row onto existing file content.
 * Ensures the prior content ends in a newline before appending.
 */
export function appendCommentRow(existing: string, comment: Comment): string {
  const base = existing.length === 0 || existing.endsWith('\n') ? existing : existing + '\n';
  return base + formatCommentRow(comment);
}

/**
 * Convenience: produce a `Comment` plus its file-row string in one call.
 */
export function buildAndFormatComment(args: BuildCommentArgs): {
  comment: Comment;
  row: string;
} {
  const comment = buildComment(args);
  return { comment, row: formatCommentRow(comment) };
}
