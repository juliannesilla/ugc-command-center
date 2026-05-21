// /api/comments — A14J-C2 Vercel Edge Function
//
// POST: validate payload (zod) → auth (X-Comment-Token shared secret) →
//       rate-limit (30/5min/IP, in-memory best-effort) → append one JSON line
//       to data/comments.jsonl via GitHub Contents API → return {id, commit_sha, url}.
// GET:  return current comments.jsonl parsed as JSON array (read-only mirror
//       used by /inbox).
//
// Runtime: edge. The in-memory rate-limit map is best-effort per worker
// (acceptable for v1 — A14j wave 1b). Worker may be cold-recycled; this is
// documented and accepted.
//
// Hard-rule provenance:
//   HR-25 (full skill stack): vercel:nextjs, vercel:vercel-functions,
//         engineering:debug, karpathy-coder:karpathy-check,
//         anthropic-skills:owasp-security, superpowers:verification-before-completion
//   HR-26 (problems ship with solutions): findings inline; no orphaned TODOs.
//   HR-27 (decisions lock before build): env names locked → COMMENT_AUTH_TOKEN,
//         GITHUB_TOKEN, GITHUB_REPO ("owner/name"), GITHUB_BRANCH (default "main").

import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { z } from 'zod';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────────────────────────────────────
// Schema
//
// Spec: C4 owns @/lib/comments/schema. If absent at build time, fall back to
// the inline schema below (verified absent at file creation; will switch to
// shared import once C4 lands the file).
// ─────────────────────────────────────────────────────────────────────────────

const PRIORITIES = ['P0', 'P1', 'P2'] as const;

const CommentInputSchema = z.object({
  route: z
    .string()
    .min(1, 'route required')
    .max(500, 'route too long')
    .regex(/^\//, 'route must start with /'),
  x_pct: z.number().min(0).max(100),
  y_pct: z.number().min(0).max(100),
  target_selector: z.string().max(500).optional(),
  text: z.string().min(1, 'text required').max(2000, 'text exceeds 2000 chars'),
  priority: z.enum(PRIORITIES),
  // base64 data URL, capped ~500KB raw bytes → ~683KB base64 string
  screenshot_data_url: z
    .string()
    .max(700_000, 'screenshot exceeds 500KB cap')
    .regex(/^data:image\/(png|jpeg|webp);base64,/, 'invalid data url')
    .optional(),
});

type CommentInput = z.infer<typeof CommentInputSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Rate limiter — in-memory, per-IP, 30 requests / 5 minutes.
// Best-effort on edge (per-worker memory). v1 is fine; revisit with KV in v2.
// ─────────────────────────────────────────────────────────────────────────────

const RATE_WINDOW_MS = 5 * 60 * 1000;
const RATE_MAX = 30;
const rateBuckets = new Map<string, number[]>();

function rateLimitHit(ip: string): { allowed: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const cutoff = now - RATE_WINDOW_MS;
  const arr = (rateBuckets.get(ip) ?? []).filter((t) => t > cutoff);
  if (arr.length >= RATE_MAX) {
    const reset = arr[0] + RATE_WINDOW_MS;
    rateBuckets.set(ip, arr);
    return { allowed: false, remaining: 0, reset };
  }
  arr.push(now);
  rateBuckets.set(ip, arr);
  return { allowed: true, remaining: RATE_MAX - arr.length, reset: now + RATE_WINDOW_MS };
}

function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

// ─────────────────────────────────────────────────────────────────────────────
// GitHub plumbing
// ─────────────────────────────────────────────────────────────────────────────

const COMMENTS_PATH = 'data/comments.jsonl';

function repoEnv(): { owner: string; repo: string; branch: string; token: string } | null {
  const token = process.env.GITHUB_TOKEN;
  const repoSpec = process.env.GITHUB_REPO; // "owner/name"
  const branch = process.env.GITHUB_BRANCH ?? 'main';
  if (!token || !repoSpec) return null;
  const [owner, repo] = repoSpec.split('/');
  if (!owner || !repo) return null;
  return { owner, repo, branch, token };
}

// Edge-safe base64 helpers
function b64Encode(s: string): string {
  // btoa requires latin-1; we need utf-8 → base64.
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function b64Decode(s: string): string {
  const bin = atob(s.replace(/\s+/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

// ─────────────────────────────────────────────────────────────────────────────
// POST — append comment
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // Auth
  const expectedToken = process.env.COMMENT_AUTH_TOKEN;
  if (!expectedToken) {
    return NextResponse.json(
      { ok: false, error: 'Server not configured (COMMENT_AUTH_TOKEN missing)' },
      { status: 500 },
    );
  }
  const presented = req.headers.get('x-comment-token');
  if (!presented || presented !== expectedToken) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit
  const ip = clientIp(req);
  const rl = rateLimitHit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Rate limit exceeded', reset: rl.reset },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.max(1, Math.ceil((rl.reset - Date.now()) / 1000))),
          'X-RateLimit-Limit': String(RATE_MAX),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(rl.reset / 1000)),
        },
      },
    );
  }

  // Parse + validate body
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = CommentInputSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input: CommentInput = parsed.data;

  // GitHub config
  const env = repoEnv();
  if (!env) {
    return NextResponse.json(
      { ok: false, error: 'Server not configured (GITHUB_TOKEN/GITHUB_REPO missing)' },
      { status: 500 },
    );
  }
  const { owner, repo, branch, token } = env;
  const octokit = new Octokit({ auth: token });

  // Read current file
  let currentSha: string | undefined;
  let currentText = '';
  try {
    const res = await octokit.repos.getContent({
      owner,
      repo,
      path: COMMENTS_PATH,
      ref: branch,
    });
    // `getContent` overloads — when targeting a file, returns object with content+sha.
    const data = res.data as { type?: string; sha?: string; content?: string; encoding?: string };
    if (data && data.type === 'file' && typeof data.content === 'string') {
      currentSha = data.sha;
      currentText = b64Decode(data.content);
    }
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    if (status !== 404) {
      return NextResponse.json(
        { ok: false, error: 'Failed to read comments.jsonl', status },
        { status: 502 },
      );
    }
    // 404 → file does not exist yet; create it.
  }

  // Build new line — conforms to C4's `Comment` shape in lib/comments/types.ts.
  // `screenshot_data_url` (input) becomes `screenshot_url` after upload; v1 keeps
  // the raw data URL inline (upload-to-repo step is a v2 enhancement).
  const id = crypto.randomUUID();
  const ts = new Date().toISOString();
  const ipHash = await hashIp(ip);
  const { screenshot_data_url, ...rest } = input;
  const record = {
    id,
    schema_version: 1 as const,
    ...rest,
    screenshot_url: screenshot_data_url, // v1: inline data URL; v2: upload + replace
    status: 'open' as const,
    ts,
    ip_hash: ipHash, // additive metadata; not in C4's canonical type but harmless
  };
  const line = JSON.stringify(record);
  const nextText = currentText.endsWith('\n') || currentText === ''
    ? currentText + line + '\n'
    : currentText + '\n' + line + '\n';

  // Commit
  const truncated = input.text.replace(/\s+/g, ' ').slice(0, 60);
  const message = `comment: ${input.route} · ${truncated}`;

  let putRes;
  try {
    putRes = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: COMMENTS_PATH,
      message,
      content: b64Encode(nextText),
      sha: currentSha,
      branch,
    });
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    return NextResponse.json(
      { ok: false, error: 'Failed to commit comment', status },
      { status: 502 },
    );
  }

  const commitSha = putRes.data.commit?.sha ?? '';
  const htmlUrl = putRes.data.content?.html_url ?? '';

  return NextResponse.json(
    { ok: true, id, commit_sha: commitSha, url: htmlUrl },
    {
      status: 201,
      headers: {
        'X-RateLimit-Limit': String(RATE_MAX),
        'X-RateLimit-Remaining': String(rl.remaining),
        'X-RateLimit-Reset': String(Math.ceil(rl.reset / 1000)),
      },
    },
  );
}

// SHA-256 hex of IP (so we don't store raw IPs in the repo log).
async function hashIp(ip: string): Promise<string> {
  const buf = new TextEncoder().encode(ip);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─────────────────────────────────────────────────────────────────────────────
// GET — read-only mirror of comments.jsonl as a JSON array (for /inbox).
// Skips the schema header line and any malformed/blank lines.
// ─────────────────────────────────────────────────────────────────────────────

export async function GET() {
  const env = repoEnv();
  if (!env) {
    return NextResponse.json(
      { ok: false, error: 'Server not configured (GITHUB_TOKEN/GITHUB_REPO missing)' },
      { status: 500 },
    );
  }
  const { owner, repo, branch, token } = env;
  const octokit = new Octokit({ auth: token });

  let text = '';
  try {
    const res = await octokit.repos.getContent({
      owner,
      repo,
      path: COMMENTS_PATH,
      ref: branch,
    });
    const data = res.data as { type?: string; content?: string };
    if (data && data.type === 'file' && typeof data.content === 'string') {
      text = b64Decode(data.content);
    }
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    if (status === 404) {
      return NextResponse.json({ ok: true, comments: [] });
    }
    return NextResponse.json(
      { ok: false, error: 'Failed to read comments.jsonl', status },
      { status: 502 },
    );
  }

  const comments: unknown[] = [];
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    try {
      const obj = JSON.parse(line) as { schema_version?: number; note?: string };
      // Skip the header line (has schema_version + note, no id).
      if (obj && typeof obj === 'object' && 'schema_version' in obj && !('id' in obj)) continue;
      comments.push(obj);
    } catch {
      // skip malformed lines silently — log only in dev
    }
  }

  return NextResponse.json({ ok: true, comments });
}
