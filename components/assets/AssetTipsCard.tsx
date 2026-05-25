import { Lightbulb, ArrowUpRight } from 'lucide-react';

export function AssetTipsCard() {
  return (
    <section className="rounded-2xl bg-gradient-to-br from-cloud-100 via-peach-100 to-iris-100 p-[1px] shadow-card">
      <div className="card-secondary rounded-2xl bg-white/85 backdrop-blur p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cloud-sunset text-white shadow-glow">
            <Lightbulb className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h3 className="section-title font-display text-[15px] text-ink-900 leading-tight">
              Asset Tips
            </h3>
            <p className="mt-1 text-[12px] text-ink-600 leading-snug">
              Name files with brand prefix + version + date. Future you will thank
              present you when search-by-name actually works.
            </p>
          </div>
        </div>
        <a
          href="#"
          className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-semibold text-cloud-700 hover:text-cloud-600 transition"
        >
          View Organization Tips
          <ArrowUpRight className="h-3 w-3" />
        </a>
      </div>
    </section>
  );
}
