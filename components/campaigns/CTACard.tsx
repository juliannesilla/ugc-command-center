import { Megaphone } from "lucide-react";

type CTAs = {
  primary?: string;
  secondary?: string;
  tertiary?: string;
};

export function CTACard({ ctas }: { ctas: CTAs }) {
  const items = [
    { tier: "Primary", value: ctas.primary, tone: "bg-cloud-sunset text-white" },
    { tier: "Secondary", value: ctas.secondary, tone: "bg-iris-100 text-iris-600 ring-1 ring-iris-200" },
    { tier: "Tertiary", value: ctas.tertiary, tone: "bg-peach-100 text-orange-700 ring-1 ring-orange-200" },
  ].filter((c) => Boolean(c.value));

  return (
    <section className="glass-card flex h-full flex-col rounded-2xl p-4 shadow-card">
      <header className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Megaphone className="h-3.5 w-3.5" strokeWidth={2.4} />
        </span>
        <h3 className="font-display text-sm font-semibold text-ink-900">CTA</h3>
      </header>
      <ul className="flex-1 space-y-2.5">
        {items.map((c) => (
          <li key={c.tier}>
            <p className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-500">
              {c.tier}
            </p>
            <p
              className={`rounded-xl px-3 py-2 text-[12.5px] font-medium leading-snug ${c.tone}`}
            >
              {c.value}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
