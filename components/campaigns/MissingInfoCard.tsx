import { AlertCircle } from "lucide-react";

type MissingInfoItem = {
  priority: "P0" | "P1" | "P2";
  question: string;
  askBefore: number;
};

const prioTone: Record<MissingInfoItem["priority"], string> = {
  P0: "bg-rose-100 text-rose-700 ring-rose-200",
  P1: "bg-orange-100 text-orange-700 ring-orange-200",
  P2: "bg-amber-100 text-amber-700 ring-amber-200",
};

export function MissingInfoCard({ items }: { items: MissingInfoItem[] }) {
  return (
    <section className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4 shadow-card">
      <header className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-200 text-orange-700">
          <AlertCircle className="h-4 w-4" strokeWidth={2.4} />
        </span>
        <div>
          <h3 className="font-display text-sm font-semibold text-orange-900">
            Missing Information
          </h3>
          <p className="text-[11px] text-orange-700/80">
            {items.length} open {items.length === 1 ? "question" : "questions"} to clarify before locking
          </p>
        </div>
      </header>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2 rounded-xl bg-white/70 p-2.5 ring-1 ring-orange-100"
          >
            <span
              className={`inline-flex shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ring-1 ${prioTone[item.priority]}`}
            >
              {item.priority}
            </span>
            <div className="text-[12.5px] text-ink-800">
              <p className="leading-snug">{item.question}</p>
              <p className="mt-0.5 text-[10.5px] text-ink-500">
                Ask before stage {item.askBefore}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
