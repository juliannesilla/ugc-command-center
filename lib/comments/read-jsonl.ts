/**
 * Server-side JSONL reader for `data/comments.jsonl`.
 * Used by the GET /api/comments handler and the X2 cron resolver.
 *
 * Format: one JSON object per line. An optional header line that lacks
 * an `id` field is skipped (allows for a schema-version banner if desired).
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import type { Comment, CommentStatus } from './types';

export const COMMENTS_FILE_REL = path.join('data', 'comments.jsonl');

export async function readCommentsFile(repoRoot?: string): Promise<Comment[]> {
  const filePath = path.join(repoRoot ?? process.cwd(), COMMENTS_FILE_REL);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const out: Comment[] = [];
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.length === 0) continue;
      try {
        const obj = JSON.parse(trimmed);
        if (obj && typeof obj.id === 'string') {
          out.push(obj as Comment);
        }
        // Else: skip header line or malformed row silently.
      } catch {
        // Skip unparsable line; do not crash the whole read.
      }
    }
    return out;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }
}

export function filterByStatus(
  comments: Comment[],
  status: string | undefined
): Comment[] {
  if (!status || status === 'all') return comments;
  return comments.filter(c => c.status === (status as CommentStatus));
}

export function filterByRoute(comments: Comment[], route: string | undefined): Comment[] {
  if (!route) return comments;
  return comments.filter(c => c.route === route);
}

export function countOpen(comments: Comment[]): number {
  return comments.filter(c => c.status === 'open' || c.status === 'in_progress').length;
}
