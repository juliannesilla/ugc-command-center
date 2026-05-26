/**
 * ProfileCompletenessCard — donut + summary for SideShift Growth hero row.
 *
 * Source: mockup #20 (top-left "Profile Completeness" panel with 92% donut
 *   and complete/partial/missing counts).
 * Wave 2b A.14n N3-SIDESHIFT-REBUILD.
 *
 * HR-2 PRESERVE: secondary widget that retains the profile-completion concept
 * as a small dashboard tile (replacing the old full-page checklist). The
 * complete legacy 13-field checklist is still available in RightRail variant.
 */

import { DonutChart } from '@/components/ui/donut-chart';
import {
  SIDESHIFT_PROFILE_FIELDS,
  SIDESHIFT_SNAPSHOT,
} from '@/lib/mock-data/sideshift-growth';

export function ProfileCompletenessCard() {
  const complete = SIDESHIFT_PROFILE_FIELDS.filter(f => f.status === 'complete').length;
  const partial  = SIDESHIFT_PROFILE_FIELDS.filter(f => f.status === 'partial').length;
  const missing  = SIDESHIFT_PROFILE_FIELDS.filter(f => f.status === 'missing').length;

  const segments = [
    { name: 'Complete', value: complete, color: '#10b981' },
    { name: 'Partial',  value: partial,  color: '#f59e0b' },
    { name: 'Missing',  value: missing,  color: '#fb7185' },
  ];

  return (
    <section
      aria-labelledby="profile-completeness-heading"
      className="relative overflow-hidden rounded-3xl bg-white/85 backdrop-blur ring-1 ring-cloud-100 shadow-card p-6 h-full flex flex-col"
    >
      <span
        aria-hidden
        className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-iris-200/30 blur-3xl"
      />

      <div className="relative z-10 flex-1 flex flex-col">
        <p className="text-[10.5px] uppercase tracking-[0.22em] text-cloud-700 font-semibold">
          Profile Completeness
        </p>
        <h2 id="profile-completeness-heading" className="sr-only">
          Profile Completeness {SIDESHIFT_SNAPSHOT.profileCompleteness}%
        </h2>

        <div className="mt-3 flex items-center gap-4">
          <DonutChart
            data={segments}
            centerValue={`${SIDESHIFT_SNAPSHOT.profileCompleteness}%`}
            centerLabel="complete"
            size={130}
            innerRadius={42}
            outerRadius={58}
          />

          <ul className="flex-1 min-w-0 space-y-2 text-[12px]">
            <Row color="#10b981" label="Complete" value={complete} />
            <Row color="#f59e0b" label="Partial"  value={partial} />
            <Row color="#fb7185" label="Missing"  value={missing} />
          </ul>
        </div>

        <p className="mt-auto pt-4 text-[11.5px] text-ink-600 leading-snug">
          {SIDESHIFT_PROFILE_FIELDS.length} profile fields tracked · finish{' '}
          <span className="font-semibold text-ink-900">3 more</span> to hit 100%.
        </p>
      </div>
    </section>
  );
}

function Row({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <li className="flex items-center justify-between gap-2">
      <span className="inline-flex items-center gap-2 min-w-0">
        <span
          aria-hidden
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-ink-700 truncate">{label}</span>
      </span>
      <span className="font-display tabular-nums text-ink-900 font-semibold">
        {value}
      </span>
    </li>
  );
}
