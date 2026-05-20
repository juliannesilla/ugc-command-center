// Auth middleware — cookie-based password gate.
//
// ⚠️ STATIC-EXPORT CONSTRAINT (PS-1 locked):
// next.config.js sets `output: 'export'`. In that mode Next.js Middleware does
// NOT run on GitHub Pages — there's no Node server to execute it. This file
// exists so that when Julz upgrades hosting to Vercel (Phase D v2) the gate is
// already wired. On GitHub Pages today, gating is enforced by the client-side
// check in app/login/page.tsx + a localStorage token verified against
// NEXT_PUBLIC_UGC_PASSWORD_HASH (see README → "Auth modes").
//
// ── How this middleware works (when deployed on a Node host) ─────────────────
// 1. Reads cookie `ugc-cc-auth`.
// 2. Validates it equals sha256(UGC_PASSWORD).
// 3. If invalid → redirects to /login.
// 4. Whitelist: /login, /api/auth/login, /_next/*, /favicon.ico, static.

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const COOKIE_NAME = 'ugc-cc-auth';

const PUBLIC_PATHS = [
  '/login',
  '/api/auth/login',
  '/favicon.ico',
];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith('/_next')) return true;
  if (pathname.startsWith('/static')) return true;
  if (/\.(svg|png|jpg|jpeg|webp|ico|css|js|woff2?)$/i.test(pathname)) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const expectedHash = process.env.UGC_PASSWORD_HASH;

  if (!cookie || !expectedHash || cookie !== expectedHash) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
