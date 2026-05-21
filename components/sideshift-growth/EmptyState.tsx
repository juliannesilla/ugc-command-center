import { Sparkles, Trophy } from 'lucide-react';

/**
 * Empty state for when the profile is 100% complete.
 * Source: task brief item 9 — "Profile 100% — you're maximizing visibility".
 */
export function ProfileCompleteEmptyState() {
  return (
    <section
      role="status"
      aria-live="polite"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-iris-50 to-peach-50 ring-1 ring-emerald-200 shadow-card px-8 py-16 text-center"
    >
      <span
        aria-hidden
        className="absolute -top-10 -left-8 h-32 w-32 rounded-full bg-emerald-200/60 blur-3xl"
      />
      <span
        aria-hidden
        className="absolute -bottom-12 -right-4 h-40 w-40 rounded-full bg-iris-200/60 blur-3xl"
      />
      <span
        aria-hidden
        className="absolute top-1/4 right-1/3 h-20 w-20 rounded-full bg-peach-200/40 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-md">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-white/90 shadow-soft ring-1 ring-emerald-200">
          <Trophy className="h-7 w-7 text-emerald-600" />
        </div>
        <h2 className="mt-5 font-display text-2xl text-ink-900 leading-tight">
          Profile 100% complete.
        </h2>
        <p className="mt-2 text-[14px] text-ink-600 leading-relaxed">
          You&rsquo;re maximizing visibility on SideShift. Brands can see every
          signal that matters — trust, proof, niches, content quality, and
          consistency. Keep posting, keep responding fast.
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-emerald-700 font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          You&rsquo;re maximizing visibility
        </p>
      </div>
    </section>
  );
}
