// /api/sideshift-send — A14L Wave 1 · L2-S-SEND
//
// POST: validate payload (zod) → auth (X-Comment-Token shared secret, re-used)
//       → rate-limit (10/5min/IP) → branch on NEXT_PUBLIC_DEPLOY_TARGET:
//         • gh-pages mode → return 501 with manual-copy instructions (UI degrades)
//         • vercel mode   → spawn scripts/send-sideshift-reply.mjs with payload,
//                          return {status:'sent', ts} on success
//
// Build-mode note (HR-15 / HR-19):
//   In gh-pages mode the GitHub Pages export (`next build && next export`) is
//   produced WITHOUT API routes — deploy.yml's A.14k step `mv app/api app/_api`
//   before build excludes this file from the static export. This route is
//   ONLY shipped under the vercel deploy target. The gh-pages branch in this
//   handler exists so a misconfigured Vercel deployment (env flag stuck at
//   gh-pages) still degrades cleanly instead of crashing the UI's Send button.
//
// Hard-rule provenance:
//   HR-1   (cite or it's creep): payload contract specified in L2-S-UI brief.
//   HR-15  (verify artifact): see /scripts/send-sideshift-reply.mjs --dry-run.
//   HR-19  (source ≠ artifact): vercel-mode artifact = SideShift chat message
//          sent; in dry-run we verify the script's intent log instead.
//   HR-21  (cite = invoke skills): see linked skills below.
//   HR-25  (full skill stack): vercel:vercel-functions, vercel:nextjs,
//          brightdata-plugin:brd-browser-debug, anthropic-skills:owasp-security,
//          karpathy-coder:karpathy-check, superpowers:verification-before-completion.
//   HR-26  (problems ship with solutions): findings inline; UI degrade documented.
//   HR-27  (decisions lock before build): env names locked → COMMENT_AUTH_TOKEN,
//          NEXT_PUBLIC_DEPLOY_TARGET ('gh-pages' | 'vercel'), AGENT_BROWSER_BIN
//          (optional override for the send script).
//   HR-30  (TL;DR at top): N/A for code files.

import { NextResponse } from 'next/server';
import { z } from 'zod';

// Edge runtime is preferred for low-latency auth + rate-limit, but the vercel
// branch shells out to a Node script (spawning a child process), which Edge
// cannot do. Use 'nodejs' so child_process is available in vercel mode while
// the gh-pages branch still returns 501 without any spawn attempt.
export const runtime = 'nodejs';
// Phase A.14m fix: Next.js 15's route-segment-config validator REJECTS any
// non-literal expression for `dynamic` (the A.14l-Wave3 ternary tripped it
// with "Unsupported node type 'ConditionalExpression' at 'dynamic'"). Use a
// static literal here. The compat story:
//   • Vercel deploys: 'force-dynamic' is correct (this handler spawns
//     child_process per request — must be per-request, not pre-rendered).
//   • CI gh-pages deploys: deploy.yml's `mv app/api app/_api_excluded_for_static_export`
//     step strips this entire route directory BEFORE build, so this directive
//     never runs in that path.
//   • Local DEPLOY_TARGET=gh-pages dev builds: use `npm run build:gh-pages-local`
//     (added in A.14m) which performs the same mv-then-restore as deploy.yml.
//     Running raw `DEPLOY_TARGET=gh-pages npm run build` will still fail
//     because `output: 'export'` is fundamentally incompatible with any
//     /api/* route — this is by Next.js design, not a bug we introduced.
export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

const SendInputSchema = z.object({
  thread_id: z
    .string()
    .min(1, 'thread_id required')
    .max(200, 'thread_id too long')
    .regex(/^[A-Za-z0-9_-]+$/, 'thread_id must be alphanumeric/_-'),
  brand: z.string().min(1, 'brand required').max(200, 'brand too long'),
  message_id: z
    .string()
    .min(1, 'message_id required')
    .max(200, 'message_id too long'),
  reply_text: z
    .string()
    .min(1, 'reply_text required')
    .max(8000, 'reply_text exceeds 8000 chars'),
});

type SendInput = z.infer<typeof SendInputSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Rate limiter — in-memory, per-IP, 10 requests / 5 minutes.
// Tighter than /api/comments (30/5min) because send-to-brand is higher-stakes.
// Best-effort on serverless worker memory (worker may cold-recycle). v1 fine.
// ─────────────────────────────────────────────────────────────────────────────

const RATE_WINDOW_MS = 5 * 60 * 1000;
const RATE_MAX = 10;
const rateBuckets = new Map<string, number[]>();

function rateLimitHit(ip: string): {
  allowed: boolean;
  remaining: number;
  reset: number;
} {
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
  return {
    allowed: true,
    remaining: RATE_MAX - arr.length,
    reset: now + RATE_WINDOW_MS,
  };
}

function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

// ─────────────────────────────────────────────────────────────────────────────
// POST
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // 1. Auth (re-use comment shared secret per A14L decision lock)
  const expectedToken = process.env.COMMENT_AUTH_TOKEN;
  if (!expectedToken) {
    return NextResponse.json(
      { ok: false, error: 'server_misconfigured', detail: 'COMMENT_AUTH_TOKEN missing' },
      { status: 500 },
    );
  }
  const presented = req.headers.get('x-comment-token');
  if (!presented || presented !== expectedToken) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  // 2. Rate limit
  const ip = clientIp(req);
  const rl = rateLimitHit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: 'rate_limited', reset: rl.reset },
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

  // 3. Parse + validate body
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'invalid_json' },
      { status: 400 },
    );
  }
  const parsed = SendInputSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'validation_failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input: SendInput = parsed.data;

  // 4. Deploy-target branch
  const deployTarget = process.env.NEXT_PUBLIC_DEPLOY_TARGET ?? 'gh-pages';
  if (deployTarget !== 'vercel') {
    // gh-pages or unset → degrade gracefully so UI can show copy/paste fallback
    return NextResponse.json(
      {
        ok: false,
        error: 'send_via_sideshift_requires_vercel',
        instructions: 'Copy reply text + paste into SideShift chat manually',
        thread_id: input.thread_id,
      },
      { status: 501 },
    );
  }

  // 5. Vercel mode → spawn send script
  // Note: `child_process` is imported lazily (only in vercel mode) so the
  // gh-pages branch above never references it. This keeps the file harmless
  // even if a Node-incompatible runtime is forced on this route by accident.
  try {
    const { spawn } = await import('node:child_process');
    const path = await import('node:path');
    const scriptPath = path.resolve(process.cwd(), 'scripts', 'send-sideshift-reply.mjs');
    const args = [
      scriptPath,
      '--thread-id',
      input.thread_id,
      '--brand',
      input.brand,
      '--message-id',
      input.message_id,
      '--reply-text',
      input.reply_text,
    ];

    const result = await new Promise<{ code: number; stdout: string; stderr: string }>((resolve) => {
      const child = spawn(process.execPath, args, {
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (d: Buffer) => (stdout += d.toString()));
      child.stderr.on('data', (d: Buffer) => (stderr += d.toString()));
      child.on('close', (code: number | null) =>
        resolve({ code: code ?? 1, stdout, stderr }),
      );
    });

    if (result.code !== 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'send_script_failed',
          code: result.code,
          stderr: result.stderr.slice(0, 2000),
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { ok: true, status: 'sent', ts: new Date().toISOString() },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': String(RATE_MAX),
          'X-RateLimit-Remaining': String(rl.remaining),
          'X-RateLimit-Reset': String(Math.ceil(rl.reset / 1000)),
        },
      },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: 'spawn_failed', detail: msg },
      { status: 500 },
    );
  }
}

// GET — health probe (no side effects). Useful for L2-S-UI sanity checks.
export async function GET() {
  const deployTarget = process.env.NEXT_PUBLIC_DEPLOY_TARGET ?? 'gh-pages';
  return NextResponse.json({
    ok: true,
    route: '/api/sideshift-send',
    deploy_target: deployTarget,
    accepts: 'POST',
    available: deployTarget === 'vercel',
  });
}
