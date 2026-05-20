import { Clapperboard } from "lucide-react";

type Shot = {
  scene: number;
  visual: string;
  duration: string;
  status: string;
};

const STATUS_TONE: Record<string, string> = {
  Planned: "bg-iris-100 text-iris-600 ring-iris-200",
  Filming: "bg-amber-100 text-amber-700 ring-amber-200",
  Captured: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  Skipped: "bg-rose-100 text-rose-700 ring-rose-200",
};

export function ShotMapTable({ shots }: { shots: Shot[] }) {
  return (
    <section className="glass-card overflow-hidden rounded-2xl shadow-card">
      <header className="flex items-center gap-2 border-b border-cloud-100 bg-white/60 px-4 py-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink-900 text-cloud-200">
          <Clapperboard className="h-3.5 w-3.5" strokeWidth={2.2} />
        </span>
        <h3 className="font-display text-sm font-semibold text-ink-900">Shot Map · Scene Outline</h3>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-cloud-50/60 text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-500">
            <tr>
              <th className="w-12 px-4 py-2.5">Scene</th>
              <th className="px-4 py-2.5">Visual / Shot</th>
              <th className="w-28 px-4 py-2.5">Duration</th>
              <th className="w-28 px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cloud-100">
            {shots.map((s) => {
              const tone = STATUS_TONE[s.status] ?? "bg-ink-100 text-ink-700 ring-ink-300";
              return (
                <tr key={s.scene} className="transition hover:bg-cloud-50/50">
                  <td className="px-4 py-3 font-mono text-[11px] font-bold text-cloud-700">
                    #{s.scene}
                  </td>
                  <td className="px-4 py-3 leading-snug text-ink-800">{s.visual}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-ink-600">{s.duration}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${tone}`}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
