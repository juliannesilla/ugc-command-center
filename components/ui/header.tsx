import { Bell } from 'lucide-react';
import { ReadOnlyMirrorBadge } from './read-only-mirror-badge';
import { MantraQuote } from './mantra-quote';

export function Header({
  pageTitle,
  pageEyebrow,
}: {
  pageTitle?: string;
  pageEyebrow?: string;
}) {
  return (
    <header className="header-cloud relative overflow-hidden">
      {/* Top row */}
      <div className="relative z-10 flex items-start justify-between gap-6 px-7 md:px-12 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <ReadOnlyMirrorBadge />
          <span className="hidden sm:inline-flex font-display italic text-white/90 text-sm tracking-tight drop-shadow-sm">
            UGC | Campaign HQ
          </span>
        </div>
        <div className="flex items-center gap-4">
          <MantraQuote />
          <button
            type="button"
            aria-label="Notifications"
            className="relative grid h-9 w-9 place-items-center rounded-full bg-white/85 backdrop-blur ring-1 ring-cloud-200 shadow-card hover:bg-white transition"
          >
            <Bell className="h-4 w-4 text-cloud-700" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-cloud-sunset ring-2 ring-white" />
          </button>
          <div
            className="hidden sm:grid h-9 w-9 place-items-center rounded-full bg-white/85 backdrop-blur ring-1 ring-cloud-200 text-cloud-700 font-display font-semibold shadow-card"
            aria-label="Julianne"
          >
            J
          </div>
        </div>
      </div>

      {/* Title row */}
      {(pageTitle || pageEyebrow) && (
        <div className="relative z-10 px-7 md:px-12 pb-8 pt-2">
          {pageEyebrow && (
            <p className="rise text-[11px] uppercase tracking-[0.28em] text-white/80 font-semibold">
              {pageEyebrow}
            </p>
          )}
          {pageTitle && (
            <h1 className="rise rise-1 mt-2 font-display text-4xl md:text-5xl text-white leading-[1.05] tracking-tight drop-shadow-[0_2px_8px_rgba(60,30,90,0.18)]">
              {pageTitle}
            </h1>
          )}
        </div>
      )}
    </header>
  );
}
