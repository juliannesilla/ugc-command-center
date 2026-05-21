// Implements: Phase A.14j §1+§2 typography pass — mockups 02+05+12
// HR-27 lock: brand string "UGC | Campaign HQ" + lavender→iris hero gradient unchanged.
// HR-19 a11y: mantra color stays white-on-lavender for contrast (token text-ink-700/80
// would fail WCAG on the gradient); structural tokens (font-display italic text-sm,
// absolute top-6 right-8) applied per plan.
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
    <header className="header-cloud relative overflow-hidden pt-24 pb-36 lg:pb-44">
      {/* Top row — brand string locked HR-27 */}
      <div className="absolute top-6 left-7 md:left-12 right-7 md:right-8 z-10 flex items-start justify-between gap-6">
        <div className="flex items-center gap-3">
          <ReadOnlyMirrorBadge />
          <span className="hidden sm:inline-flex font-display italic text-white/90 text-sm tracking-tight drop-shadow-sm">
            UGC | Campaign HQ
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Mantra positioned absolute top-6 right-8 per plan §1 */}
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

      {/* Title row — typography tokens per plan §1 */}
      {(pageTitle || pageEyebrow) && (
        <div className="relative z-10 px-7 md:px-12">
          {pageEyebrow && (
            <p className="rise text-[11px] tracking-[0.14em] uppercase font-medium text-white/85">
              {pageEyebrow}
            </p>
          )}
          {pageTitle && (
            <h1 className="rise rise-1 mt-3 font-display text-4xl lg:text-[44px] font-medium tracking-tight text-white leading-[1.05] drop-shadow-[0_2px_8px_rgba(60,30,90,0.18)]">
              {pageTitle}
            </h1>
          )}
        </div>
      )}
    </header>
  );
}
