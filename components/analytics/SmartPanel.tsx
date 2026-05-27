import { CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { WHATS_WINNING, NEEDS_ATTENTION } from '@/lib/mock-data/analytics';

export function SmartPanel() {
  return (
    <aside className="glass-card rounded-2xl p-6 shadow-card flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-iris-400" />
        {/* A.14m Stream 3 a11y fix: h3 → h2 (heading-order). T5 ADDITIVE: section-title. */}
        <h2 className="section-title font-display text-lg font-bold text-ink-900">
          Smart Panel
        </h2>
      </div>

      <div>
        {/* A.14m Stream 3 a11y fix: h4 → h3 (descends from new h2 above). */}
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-700 mb-2">
          What's Winning
        </h3>
        <ul className="flex flex-col gap-2">
          {WHATS_WINNING.map((it) => (
            <li key={it.id} className="flex items-start gap-2 text-sm text-ink-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>{it.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        {/* A.14m Stream 3 a11y fix: h4 → h3. */}
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-orange-700 mb-2">
          What Needs Attention
        </h3>
        <ul className="flex flex-col gap-2">
          {NEEDS_ATTENTION.map((it) => (
            <li key={it.id} className="flex items-start gap-2 text-sm text-ink-700">
              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
              <span>{it.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-cloud-500 text-white px-4 py-2 text-sm font-semibold shadow-soft hover:bg-cloud-600 transition-colors"
      >
        View Recommendations
        <span aria-hidden>→</span>
      </button>
    </aside>
  );
}
