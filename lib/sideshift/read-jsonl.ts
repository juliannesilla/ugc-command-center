/**
 * Server-side JSONL readers for SideShift data files.
 *
 * Format: line 1 is a schema-version header (`{schema_version, created, note}`)
 * and each subsequent line is a full record. Header is recognised by the
 * absence of an `id` field and skipped. Malformed lines are skipped silently
 * rather than crashing the whole read (append-only logs degrade gracefully).
 *
 * Both readers return `[]` (not an error) if the file does not yet exist —
 * this lets L2-S-UI render an empty inbox on first boot before L2-S-POLL has
 * run.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import type { SideShiftMessage, SideShiftDraft } from './types';

export const SIDESHIFT_MESSAGES_FILE_REL = path.join('data', 'sideshift-messages.jsonl');
export const SIDESHIFT_DRAFTS_FILE_REL = path.join('data', 'sideshift-drafts.jsonl');

/**
 * Generic JSONL reader. Skips header line (no `id` field) and any unparsable
 * lines. The `id`-field check is the same convention used by `lib/comments/`.
 */
async function readJsonlRows<T extends { id: string }>(absPath: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(absPath, 'utf8');
    const out: T[] = [];
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.length === 0) continue;
      try {
        const obj = JSON.parse(trimmed);
        if (obj && typeof obj.id === 'string') {
          out.push(obj as T);
        }
        // else: header banner or malformed row → skip silently.
      } catch {
        // Unparsable line → skip silently.
      }
    }
    return out;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }
}

export async function readSideShiftMessages(repoRoot?: string): Promise<SideShiftMessage[]> {
  const absPath = path.join(repoRoot ?? process.cwd(), SIDESHIFT_MESSAGES_FILE_REL);
  return readJsonlRows<SideShiftMessage>(absPath);
}

export async function readSideShiftDrafts(repoRoot?: string): Promise<SideShiftDraft[]> {
  const absPath = path.join(repoRoot ?? process.cwd(), SIDESHIFT_DRAFTS_FILE_REL);
  return readJsonlRows<SideShiftDraft>(absPath);
}

/** Return the latest draft for each `message_id`, keyed by `generated_at`. */
export function latestDraftByMessageId(
  drafts: SideShiftDraft[]
): Map<string, SideShiftDraft> {
  const map = new Map<string, SideShiftDraft>();
  for (const d of drafts) {
    const prev = map.get(d.message_id);
    if (!prev || d.generated_at > prev.generated_at) {
      map.set(d.message_id, d);
    }
  }
  return map;
}
