# `lib/comments` · Visual Comment System Core

Wave 1b · C4 deliverable. Canonical types, schemas, and helpers shared by:

- **C2** — Edge function `POST /api/comments` (validates + appends to JSONL via GitHub API)
- **C3** — Overlay + inbox UI (consumes via `useCommentMode` + `useComments`)
- **X2** — Cron resolver script (reads JSONL, runs Claude Code, marks resolved)

## File map

| File | Purpose | Runtime |
|---|---|---|
| `types.ts` | `Comment`, `CommentInput`, `CommentStatus`, `CommentPriority`, `CommentFilters` | iso |
| `schema.ts` | Zod schemas: `commentInputSchema`, `commentRowSchema` | iso |
| `read-jsonl.ts` | `readCommentsFile()`, `filterByStatus/Route`, `countOpen` | node |
| `write-jsonl.ts` | `buildComment()`, `formatCommentRow()`, `appendCommentRow()` | node (uses `node:crypto`) |
| `provider.tsx` | `<CommentModeProvider>` + `useCommentMode()` | client |
| `use-comments.ts` | `useComments(filters?)` SWR hook (30s poll) | client |

## Public API

### Types (`@/lib/comments/types`)

```ts
import type { Comment, CommentInput, CommentStatus, CommentPriority, CommentFilters } from '@/lib/comments/types';
```

### Validation (`@/lib/comments/schema`)

```ts
import { commentInputSchema } from '@/lib/comments/schema';

// In the Edge fn:
const parsed = commentInputSchema.safeParse(await req.json());
if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
```

### Read JSONL (`@/lib/comments/read-jsonl`) — server only

```ts
import { readCommentsFile, filterByStatus, countOpen } from '@/lib/comments/read-jsonl';

const all = await readCommentsFile();         // process.cwd() + data/comments.jsonl
const open = filterByStatus(all, 'open');
const badge = countOpen(all);
```

### Build a new row (`@/lib/comments/write-jsonl`) — server only

```ts
import { buildAndFormatComment } from '@/lib/comments/write-jsonl';

const { comment, row } = buildAndFormatComment({
  input: parsed.data,
  screenshot_url: githubRawUrl,
});
// `row` is one line ending in '\n' — concat onto existing file content,
// base64-encode the whole thing, PUT to GitHub Contents API.
```

### Mount the provider (`@/lib/comments/provider`) — client

```tsx
// app/layout.tsx
import { CommentModeProvider } from '@/lib/comments/provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CommentModeProvider>{children}</CommentModeProvider>
      </body>
    </html>
  );
}
```

```tsx
// Any client component:
import { useCommentMode } from '@/lib/comments/provider';

const { enabled, toggle, openCount, refresh } = useCommentMode();
```

### Fetch comments (`@/lib/comments/use-comments`) — client

```tsx
import { useComments } from '@/lib/comments/use-comments';

const { comments, isLoading, error, mutate } = useComments({ status: 'open' });
```

## JSONL file conventions

- Path: `data/comments.jsonl` at repo root
- One JSON object per line, no trailing comma, file ends with `\n`
- Field order in serialized rows is stable (see `buildComment`) so PR diffs are readable
- Lines without an `id` field are treated as headers / banners and skipped by the reader

## Schema versioning

Current `schema_version` is **1**. If the shape changes:

1. Bump the literal in `types.ts` AND `schema.ts`
2. Add a migration helper next to `read-jsonl.ts`
3. Document the breaking change at the top of this README

## localStorage keys used

| Key | Type | Purpose |
|---|---|---|
| `ugc-cc-comment-mode` | `'0'` / `'1'` | Persist comment-mode toggle across reloads |

## Hard rules honored

- HR-15 verify-artifact: tsc-clean + `import` resolves end-to-end
- HR-25 use-all-applicable-skills: karpathy-check → simplify → vercel:nextjs → engineering:documentation → engineering:debug → superpowers:verification-before-completion
- HR-26 problems-ship-with-solutions: README covers EVERY exported symbol with usage example
