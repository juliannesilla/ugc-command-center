import { Compass } from "lucide-react";

type CoreAngle =
  | string
  | {
      angle?: string;
      audienceBenefit?: string;
      audience_benefit?: string;
      emotionalDriver?: string;
      emotional_driver?: string;
    };

export function CoreAngleCard({ coreAngle }: { coreAngle: CoreAngle }) {
  // Normalize: string OR object shape
  const isString = typeof coreAngle === "string";
  const angle = isString ? coreAngle : coreAngle.angle ?? "";
  const audience = isString
    ? null
    : coreAngle.audienceBenefit ?? coreAngle.audience_benefit ?? null;
  const driver = isString
    ? null
    : coreAngle.emotionalDriver ?? coreAngle.emotional_driver ?? null;

  return (
    <section className="glass-card flex h-full flex-col rounded-2xl p-5 shadow-card">
      <header className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-iris-100 text-iris-600">
          <Compass className="h-3.5 w-3.5" strokeWidth={2.4} />
        </span>
        <h3 className="font-display text-sm font-semibold text-ink-900">Core Angle</h3>
      </header>
      <div className="space-y-3 text-[12.5px] text-ink-800">
        <div>
          <p className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-iris-600">
            Angle
          </p>
          <p className="leading-snug">{angle}</p>
        </div>
        {audience && (
          <div>
            <p className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-cloud-700">
              Audience Benefit
            </p>
            <p className="leading-snug">{audience}</p>
          </div>
        )}
        {driver && (
          <div>
            <p className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-orange-600">
              Emotional Driver
            </p>
            <p className="leading-snug">{driver}</p>
          </div>
        )}
        {!audience && !driver && isString && (
          <p className="text-[11px] italic text-ink-500">
            Single-line angle — audience benefit / emotional driver not yet split out.
          </p>
        )}
      </div>
    </section>
  );
}
