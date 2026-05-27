import { Sparkles } from 'lucide-react';

export function EmptyState() {
  return (
    <section
      role="status"
      aria-live="polite"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cloud-50 via-iris-50 to-peach-50 ring-1 ring-cloud-100 shadow-card px-8 py-16 text-center"
    >
      {/* Pastel orbs */}
      <span
        aria-hidden
        className="absolute -top-10 -left-8 h-32 w-32 rounded-full bg-iris-200/60 blur-3xl"
      />
      <span
        aria-hidden
        className="absolute -bottom-12 -right-4 h-40 w-40 rounded-full bg-peach-200/60 blur-3xl"
      />
      <span
        aria-hidden
        className="absolute top-1/4 right-1/3 h-20 w-20 rounded-full bg-emerald-200/40 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-md">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-white/90 shadow-soft ring-1 ring-cloud-200">
          <Sparkles className="h-7 w-7 text-cloud-sunset" />
        </div>
        <h2 className="mt-5 font-display text-[22px] font-bold tracking-tight text-ink-900 leading-tight">
          All clear.
        </h2>
        <p className="mt-2 text-[14px] text-ink-600 leading-relaxed">
          Nothing needs your attention right now. Every campaign has
          everything it needs to move forward.
        </p>
        <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-cloud-700 font-semibold">
          Go shoot something pretty.
        </p>
      </div>
    </section>
  );
}
