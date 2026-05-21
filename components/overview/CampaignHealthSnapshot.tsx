// Implements: 01-initial-dashboard-prompt.md § "MAIN DASHBOARD OVERVIEW / 4. My Creator Campaign Health Snapshot" (L242-L268)
// Donut + What's Strong + What's Blocking. All computed from MOCK_CAMPAIGNS via getHealthSnapshot().
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { DonutChart } from "@/components/ui/donut-chart";
import { getHealthSnapshot } from "@/lib/mock-data/overview";

export function CampaignHealthSnapshot() {
  const { readiness, strengths, blockers, segments } = getHealthSnapshot();

  return (
    <section className="rise rise-3 grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
      {/* Health donut */}
      <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-cloud-100">
        <p className="text-[10.5px] uppercase tracking-[0.22em] text-ink-500 font-semibold">
          Campaign health
        </p>
        <h4 className="mt-1 font-display text-xl text-ink-900">
          {readiness} / 100 readiness
        </h4>
        <div className="mt-4 flex items-center gap-5">
          <DonutChart
            data={segments}
            centerValue={readiness}
            centerLabel="Readiness"
            size={156}
            innerRadius={50}
            outerRadius={70}
          />
          <ul className="flex-1 space-y-2 text-[13px]">
            {segments.map((s) => (
              <li
                key={s.name}
                className="flex items-center justify-between gap-3"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-ink-700">{s.name}</span>
                </span>
                <span className="font-display text-ink-900 text-lg">
                  {s.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* What's strong */}
      <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-emerald-100">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <p className="text-[10.5px] uppercase tracking-[0.22em] text-emerald-700 font-semibold">
            What&rsquo;s strong
          </p>
        </div>
        {strengths.length === 0 ? (
          <p className="mt-3 text-[13px] text-ink-500 italic">
            No strong signals yet — keep building momentum.
          </p>
        ) : (
          <ul className="mt-3 space-y-2.5 text-[13.5px] text-ink-700">
            {strengths.map((s) => (
              <li key={s} className="flex gap-2 leading-snug">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* What's blocking */}
      <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-orange-100">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <p className="text-[10.5px] uppercase tracking-[0.22em] text-orange-700 font-semibold">
            What&rsquo;s blocking
          </p>
        </div>
        {blockers.length === 0 ? (
          <p className="mt-3 text-[13px] text-ink-500 italic">
            Nothing blocking — clear runway.
          </p>
        ) : (
          <ul className="mt-3 space-y-2.5 text-[13.5px] text-ink-700">
            {blockers.map((b) => (
              <li key={b} className="flex gap-2 leading-snug">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
