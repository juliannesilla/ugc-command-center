import { HelpCircle } from "lucide-react";

type Question = {
  priority: "P0" | "P1" | "P2";
  question: string;
  askBefore: number;
};

export function ClarifyingQuestionsCard({ questions }: { questions: Question[] }) {
  return (
    <section className="rounded-2xl border border-iris-200 bg-iris-50/50 p-4 shadow-card">
      <header className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-iris-200 text-iris-600">
          <HelpCircle className="h-4 w-4" strokeWidth={2.4} />
        </span>
        <div>
          <h3 className="font-display text-sm font-semibold text-iris-600">
            Clarifying Questions
          </h3>
          <p className="text-[11px] text-iris-600/80">
            Open questions tracked for the next brand sync
          </p>
        </div>
      </header>
      <ol className="space-y-1.5 text-[12.5px] text-ink-800">
        {questions.map((q, i) => (
          <li key={i} className="flex gap-2 leading-snug">
            <span className="shrink-0 font-mono text-[11px] font-semibold text-iris-500">
              Q{i + 1}.
            </span>
            <span>{q.question}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
