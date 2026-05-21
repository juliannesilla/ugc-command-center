/**
 * Server-side JSONL writers for SideShift data files.
 *
 * `appendSideShiftMessage` and `appendSideShiftDraft` use `fs.appendFile`
 * (POSIX `O_APPEND`) for atomic single-line appends. Each record is validated
 * via zod before write so a corrupt row can never reach disk.
 *
 * On Vercel (read-only fs), these helpers will throw `EROFS` — production
 * polling writes through the GitHub Contents API instead. Use these helpers
 * for local dev, scripts, and tests.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import {
  sideShiftMessageSchema,
  sideShiftDraftSchema,
} from './schema';
import {
  SIDESHIFT_MESSAGES_FILE_REL,
  SIDESHIFT_DRAFTS_FILE_REL,
} from './read-jsonl';
import type { SideShiftMessage, SideShiftDraft } from './types';

/**
 * Serialize one row as a JSONL line (single `\n` terminator). Exported so
 * the GitHub-Contents-API write path can reuse the canonical line format.
 */
export function formatRow(row: SideShiftMessage | SideShiftDraft): string {
  return JSON.stringify(row) + '\n';
}

export async function appendSideShiftMessage(
  msg: SideShiftMessage,
  repoRoot?: string
): Promise<void> {
  sideShiftMessageSchema.parse(msg); // throws on invalid
  const absPath = path.join(repoRoot ?? process.cwd(), SIDESHIFT_MESSAGES_FILE_REL);
  await fs.appendFile(absPath, formatRow(msg), 'utf8');
}

export async function appendSideShiftDraft(
  draft: SideShiftDraft,
  repoRoot?: string
): Promise<void> {
  sideShiftDraftSchema.parse(draft); // throws on invalid
  const absPath = path.join(repoRoot ?? process.cwd(), SIDESHIFT_DRAFTS_FILE_REL);
  await fs.appendFile(absPath, formatRow(draft), 'utf8');
}
