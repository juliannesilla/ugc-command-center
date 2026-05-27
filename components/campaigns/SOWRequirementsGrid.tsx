import { cn } from "@/lib/utils";
import { Check, Circle } from "lucide-react";

type Requirement = {
  key: string;
  label: string;
  detail: string;
  means: string;
  status: "complete" | "incomplete";
  source: string;
};

export function SOWRequirementsGrid({ requirements }: { requirements: Requirement[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
      {requirements.map((req, i) => (
        <article
          key={req.key}
          className={cn(
            "glass-card rise rounded-3xl p-5 lg:p-6 shadow-card transition hover:shadow-soft",
            `rise-${Math.min(4, Math.floor(i / 4) + 1)}`,
          )}
        >
          <header className="mb-2 flex items-start justify-between gap-2">
            <h3 className="font-display text-sm font-semibold leading-snug text-ink-900">
              {req.label}
            </h3>
            {req.status === "complete" ? (
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            ) : (
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-300/40 text-ink-700">
                <Circle className="h-2.5 w-2.5" strokeWidth={2.5} />
              </span>
            )}
          </header>
          <dl className="space-y-1.5 text-[12.5px]">
            <div>
              <dt className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-700">
                Detail
              </dt>
              <dd className="leading-snug text-ink-800">{req.detail}</dd>
            </div>
            <div>
              <dt className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-cloud-700">
                What it means
              </dt>
              <dd className="leading-snug text-ink-700">{req.means}</dd>
            </div>
          </dl>
          <footer className="mt-3 border-t border-cloud-100 pt-2">
            <span className="text-[10px] font-medium text-ink-600">{req.source}</span>
          </footer>
        </article>
      ))}
    </div>
  );
}
