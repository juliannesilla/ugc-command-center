import { Sparkles, Star } from "lucide-react";

export function HookOptionsCard({ hooks }: { hooks: string[] }) {
  return (
    <section className="glass-card flex h-full flex-col rounded-3xl p-5 lg:p-6 shadow-card">
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cloud-sunset text-white shadow-glow">
            <Star className="h-3.5 w-3.5" strokeWidth={2.4} />
          </span>
          <h3 className="font-display text-sm font-semibold text-ink-900">Hook Options</h3>
        </div>
        <span className="text-[10.5px] font-medium text-ink-700">{hooks.length} drafted</span>
      </header>
      <ol className="flex-1 space-y-2">
        {hooks.map((hook, i) => (
          <li
            key={i}
            className="group flex items-start gap-2 rounded-xl bg-white/80 p-2.5 ring-1 ring-cloud-100 transition hover:ring-cloud-300"
          >
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cloud-100 font-mono text-[10px] font-bold text-cloud-700">
              {i + 1}
            </span>
            <p className="text-[12.5px] leading-snug text-ink-800">{hook}</p>
          </li>
        ))}
      </ol>
      <button className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-iris-300 bg-iris-50/60 px-3 py-2 text-[12px] font-semibold text-iris-600 transition hover:bg-iris-100">
        <Sparkles className="h-3.5 w-3.5" /> Generate More
      </button>
    </section>
  );
}
