import { CONTENT_HUB_STATS } from '@/lib/mock-data/content-hub';
import { StatCardWithDelta } from '@/components/analytics/StatCardWithDelta';

export function ContentHubStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CONTENT_HUB_STATS.map((s) => (
        <StatCardWithDelta
          key={s.id}
          label={s.label}
          value={s.value}
          delta={s.delta}
          deltaTone="positive"
          sublabel="vs last week"
        />
      ))}
    </div>
  );
}
