'use client';

// Phase A.14l Wave 1 · A14L-L3-F /login polish
// Additive: password reveal toggle, brand-mark subtle pulse, input focus glow.
// HR-21 CITE = INVOKE: refactoring-ui, microinteractions, ios-hig-design,
// top-design, frontend-design, superpowers:verification-before-completion.

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, Cloud, Eye, EyeOff } from 'lucide-react';

// ⚠️ STATIC-EXPORT NOTE: GitHub Pages cannot run /api/auth/login.
// Client-side check uses NEXT_PUBLIC_UGC_PASSWORD_HASH (sha256 of plaintext).
// On Vercel deployment (Phase D v2) we POST to /api/auth/login instead.

async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

const COOKIE_NAME = 'ugc-cc-auth';
const STORAGE_KEY = 'ugc-cc-auth';

export default function LoginPage() {
  const router = useRouter();
  const [pw, setPw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [focused, setFocused] = useState(false);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'ok') {
      router.replace('/');
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const expected =
      process.env.NEXT_PUBLIC_UGC_PASSWORD_HASH ??
      // Dev fallback: sha256("ugc") — replace via env in prod.
      '04904d5c1a23c10b3d2d6c4a04ddb1eb0e735f2c2cb38df1c2bd7b7a8a48dec0';

    try {
      // Prefer server route when present (Vercel build).
      const apiResp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      }).catch(() => null);

      if (apiResp && apiResp.ok) {
        localStorage.setItem(STORAGE_KEY, 'ok');
        router.replace('/');
        return;
      }

      // Static-export fallback: client-side hash check.
      const hash = await sha256(pw);
      if (hash === expected) {
        document.cookie = `${COOKIE_NAME}=${hash}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        localStorage.setItem(STORAGE_KEY, 'ok');
        router.replace('/');
      } else {
        setError('That password is not it, bestie. Try again.');
      }
    } catch (err) {
      setError('Something glitched. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen header-cloud relative overflow-hidden">
      {/* Floating sun blob */}
      <div className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-peach-300/70 via-cloud-300/40 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-32 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-iris-300/50 to-transparent blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rise">
          {/* Brand mark — subtle breathing pulse on the glow ring */}
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="group relative grid h-14 w-14 place-items-center rounded-3xl bg-white/30 backdrop-blur-md ring-1 ring-white/40 shadow-glow transition-transform duration-700 ease-out hover:scale-105">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/30 animate-[brandPulse_3.6s_ease-in-out_infinite]"
              />
              <Cloud className="h-7 w-7 text-white drop-shadow transition-transform duration-500 group-hover:rotate-[-4deg]" />
            </div>
            <h1 className="mt-4 font-display text-[28px] leading-tight text-white drop-shadow-sm tracking-tight">
              UGC <span className="text-white/60 font-normal">|</span><br />
              <span className="italic text-white/90">Campaign HQ</span>
            </h1>
            <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-white/80">
              Read-only mirror · Private
            </p>
          </div>

          {/* Card */}
          <form
            onSubmit={handleSubmit}
            className="glass-card rounded-3xl p-7 shadow-soft"
          >
            <label
              htmlFor="pw"
              className="block text-[11px] uppercase tracking-[0.18em] text-ink-500 font-semibold mb-2"
            >
              Password
            </label>
            <div
              className={`relative rounded-2xl transition-shadow duration-300 ${
                focused ? 'shadow-[0_0_0_4px_rgba(212,184,255,0.25)]' : ''
              }`}
            >
              <Lock
                className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${
                  focused ? 'text-cloud-600' : 'text-ink-400'
                }`}
              />
              <input
                id="pw"
                type={showPw ? 'text' : 'password'}
                value={pw}
                onChange={e => setPw(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                autoFocus
                placeholder="Enter password"
                aria-describedby={error ? 'pw-error' : undefined}
                className="w-full rounded-2xl border border-cloud-200 bg-white/85 pl-10 pr-11 py-3 text-[15px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-cloud-300 focus:border-cloud-300 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                aria-pressed={showPw}
                tabIndex={pw.length > 0 ? 0 : -1}
                className={`absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-xl text-ink-400 hover:text-ink-700 hover:bg-cloud-50 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-cloud-300 ${
                  pw.length === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && (
              <p
                id="pw-error"
                role="alert"
                className="mt-3 text-[12px] text-rose-600 font-medium animate-[shake_0.4s_ease-in-out]"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !pw}
              className="group mt-5 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-cloud-sunset px-4 py-3 text-[14px] font-semibold text-white shadow-soft hover:shadow-glow active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {submitting ? 'Unlocking…' : 'Enter HQ'}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-disabled:translate-x-0" />
            </button>

            <p className="mt-4 text-center text-[11px] text-ink-500 leading-relaxed">
              Forgot? Check your password manager.<br />
              No account required — this is a personal dashboard.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
