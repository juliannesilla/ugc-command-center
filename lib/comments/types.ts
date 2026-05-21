/**
 * Canonical comment types for the UGC Command Center visual comment system.
 * Wave 1b · C4 deliverable.
 *
 * A `Comment` is one row in `data/comments.jsonl` after persistence.
 * A `CommentInput` is the raw payload posted to the Edge function by the overlay.
 */

export type CommentStatus = 'open' | 'in_progress' | 'resolved' | 'wontfix';
export type CommentPriority = 'P0' | 'P1' | 'P2';

export interface Comment {
  id: string;                          // uuid v4
  schema_version: 1;
  route: string;
  x_pct: number;
  y_pct: number;
  target_selector?: string;
  screenshot_url?: string;             // GitHub-hosted after upload
  text: string;
  priority: CommentPriority;
  status: CommentStatus;
  ts: string;                          // ISO timestamp
  resolved_at?: string;
  resolved_commit?: string;
  claude_session_id?: string;
  pr_url?: string;
  pr_number?: number;
}

export interface CommentInput {
  route: string;
  x_pct: number;
  y_pct: number;
  target_selector?: string;
  screenshot_data_url?: string;        // base64 data URL, uploaded by Edge fn
  text: string;
  priority: CommentPriority;
}

export interface CommentFilters {
  status?: CommentStatus | 'all';
  route?: string;
  priority?: CommentPriority;
}
