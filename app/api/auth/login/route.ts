// POST /api/auth/login — verify password, set HttpOnly cookie.
//
// ⚠️ STATIC-EXPORT CONSTRAINT:
// next.config.js sets `output: 'export'`. API routes are NOT emitted in static
// export builds (Next.js drops them silently). This file is preserved for the
// future Vercel deployment (Phase D v2). On GitHub Pages, the login page falls
// back to a client-side hash check — see app/login/page.tsx.

import { NextResponse } from 'next/server';

const COOKIE_NAME = 'ugc-cc-auth';

async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function POST(req: Request) {
  let body: { password?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }

  const pw = body.password ?? '';
  const expected = process.env.UGC_PASSWORD_HASH;

  if (!expected) {
    return NextResponse.json(
      { ok: false, error: 'Server not configured' },
      { status: 500 },
    );
  }

  const hash = await sha256(pw);
  if (hash !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const resp = NextResponse.json({ ok: true });
  resp.cookies.set(COOKIE_NAME, hash, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7d
  });
  return resp;
}
