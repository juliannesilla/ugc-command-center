import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Ideation" },
  { id: 2, label: "Script" },
  { id: 3, label: "Production" },
  { id: 4, label: "Editing" },
  { id: 5, label: "Ready to Publish" },
];

export function ProductionTracker({ currentStep }: { currentStep: number }) {
  return (
    <div className="glass-card rounded-2xl p-5 shadow-card">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-base font-semibold text-ink-900">Production Progress</h2>
        <span className="text-[11px] font-medium text-ink-500">
          Step {currentStep} of {STEPS.length}
        </span>
      </div>
      <ol className="relative flex items-center justify-between gap-2">
        <div className="absolute left-4 right-4 top-4 h-[2px] bg-ink-300/40" aria-hidden />
        <div
          className="absolute left-4 top-4 h-[2px] bg-cloud-sunset transition-all"
          style={{ width: `calc((${Math.max(0, currentStep - 1)} / ${STEPS.length - 1}) * (100% - 2rem))` }}
          aria-hidden
        />
        {STEPS.map((step) => {
          const isDone = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          return (
            <li key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold transition",
                  isDone
                    ? "bg-cloud-sunset text-white shadow-glow"
                    : isCurrent
                    ? "ring-4 ring-cloud-300/50 bg-white text-cloud-600 ring-offset-2 ring-offset-white"
                    : "bg-ink-300/30 text-ink-500",
                )}
              >
                {isDone ? <Check className="h-4 w-4" strokeWidth={3} /> : step.id}
              </span>
              <span
                className={cn(
                  "max-w-[88px] text-center text-[10.5px] font-semibold leading-tight",
                  isCurrent ? "text-ink-900" : isDone ? "text-ink-700" : "text-ink-500",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
