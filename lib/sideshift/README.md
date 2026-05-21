# `lib/sideshift/` — Phase A.14l Wave 1 · L2-S-DATA

Canonical types, zod schemas, and JSONL utilities for the SideShift inbox sub-system inside the UGC Command Center.

This module is the **data foundation** consumed by every other L2-S agent:

| Consumer    | What it uses                                            |
| ----------- | ------------------------------------------------------- |
| `L2-S-UI`    | `readSideShiftMessages`, `readSideShiftDrafts`, types  |
| `L2-S-POLL`  | `appendSideShiftMessage`, `sideShiftMessageSchema`     |
| `L2-S-DRAFT` | `appendSideShiftDraft`, `sideShiftDraftSchema`         |
| `L2-S-SEND`  | `readSideShiftDrafts`, `appendSideShiftDraft` (status flip) |

## Public API

```ts
import {
  // Types
  type SideShiftMessage,
  type SideShiftDraft,
  type MsgDirection,    // 'inbound' | 'outbound'
  type MsgStatus,       // 'awaiting-you' | 'awaiting-brand' | 'no-action'
  type DraftStatus,     // 'draft' | 'approved' | 'sent'
} from '@/lib/sideshift/types';

import {
  // Zod schemas (validate before append / after read)
  sideShiftMessageSchema,
  sideShiftDraftSchema,
  msgDirectionSchema,
  msgStatusSchema,
  draftStatusSchema,
} from '@/lib/sideshift/schema';

import {
  // Reads — return [] if file missing (graceful first-boot)
  readSideShiftMessages,
  readSideShiftDrafts,
  latestDraftByMessageId,
  SIDESHIFT_MESSAGES_FILE_REL,
  SIDESHIFT_DRAFTS_FILE_REL,
} from '@/lib/sideshift/read-jsonl';

import {
  // Writes — validate via zod, then atomic appendFile
  appendSideShiftMessage,
  appendSideShiftDraft,
  formatRow,
} from '@/lib/sideshift/write-jsonl';
```

## JSONL format

Both files live in `data/`:

- `data/sideshift-messages.jsonl`
- `data/sideshift-drafts.jsonl`

Line 1 of each file is a schema-version header:

```json
{"schema_version":1,"created":"2026-05-21T00:00:00.000Z","note":"Append-only log. Schema: lib/sideshift/types.ts"}
```

Every subsequent line is one full record (one JSON object per line, no trailing comma, single `\n` terminator). Append-only — never overwrite.

Readers identify and skip the header by checking for `obj.id === 'string'`. Same convention as `lib/comments/`.

## How each consumer wires in

### `L2-S-UI`

```ts
const [messages, drafts] = await Promise.all([
  readSideShiftMessages(),
  readSideShiftDrafts(),
]);
const latest = latestDraftByMessageId(drafts);
// Render inbox: messages where status === 'awaiting-you', sorted by ts desc.
```

### `L2-S-POLL`

```ts
// For each new scraped row:
const msg: SideShiftMessage = { /* …populated from scrape… */ };
await appendSideShiftMessage(msg); // throws if zod rejects
```

### `L2-S-DRAFT`

```ts
// After Anthropic call returns:
const draft: SideShiftDraft = {
  id: randomUUID(),
  message_id: msg.id,
  schema_version: 1,
  brand: msg.brand,
  draft_text: completion.text,
  model: 'claude-opus-4-7',
  generated_at: new Date().toISOString(),
  token_usage: { input: u.input_tokens, output: u.output_tokens },
  status: 'draft',
};
await appendSideShiftDraft(draft);
```

### `L2-S-SEND`

```ts
// Flip status by appending a new row (append-only — never mutate).
const sent: SideShiftDraft = { ...prev, status: 'sent', sent_at: new Date().toISOString() };
await appendSideShiftDraft(sent);
```

> `latestDraftByMessageId` returns the most recent draft per `message_id`, so a `sent` row supersedes the earlier `draft` row in any UI lookup.

## Production note (Vercel)

`fs.appendFile` only works in local dev / scripts / tests. On Vercel's read-only filesystem the same record-format helpers (`formatRow`) feed into the GitHub Contents API write path used by L2-S-POLL and L2-S-SEND in production.

## File ownership

`L2-S-DATA` is the **exclusive owner** of:

- `lib/sideshift/types.ts`
- `lib/sideshift/schema.ts`
- `lib/sideshift/read-jsonl.ts`
- `lib/sideshift/write-jsonl.ts`
- `lib/sideshift/README.md`
- `data/sideshift-messages.jsonl`
- `data/sideshift-drafts.jsonl`

Any other agent (UI, POLL, DRAFT, SEND) **must not** edit these files. If a downstream consumer needs a new field, request it from L2-S-DATA — do not extend the schema locally.
