// Implements: 01-initial-dashboard-prompt.md § "MAIN DASHBOARD OVERVIEW / 3. My Campaign Pipeline Snapshot" (L221-L236)
// 14 spec-named tiles computed from MOCK_CAMPAIGNS via lib/mock-data/overview.ts.
import { StatCard } from "@/components/ui/stat-card";
import { getSnapshotTiles } from "@/lib/mock-data/overview";
import { formatMoney } from "@/lib/utils";

export function PipelineSnapshot() {
  const tiles = getSnapshotTiles();
  // Total potential value lives in the section header per existing baseline design.
  const totalValueTile = tiles.find((t) => t.label === "Total Potential Value");
  const totalCount = tiles
    .filter((t) => t.label !== "Total Potential Value")
    .reduce((sum, t) => sum + t.count, 0);

  return (
    <section className="rise rise-3 space-y-4">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-display text-2xl text-ink-900">
            My campaign pipeline snapshot
          </h3>
          <p className="text-[12.5px] text-ink-500 mt-0.5">
            {totalCount} campaigns across 14 stages · refreshed 4 min ago
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.22em] text-ink-500 font-semibold">
            Total potential value
          </p>
          <p className="font-display text-3xl text-cloud-700 leading-none mt-1">
            {formatMoney(totalValueTile?.count ?? 0)}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-5">
        {tiles.map((t) => (
          <StatCard
            key={t.label}
            label={t.label}
            value={
              t.label === "Total Potential Value"
                ? formatMoney(t.count)
                : t.count
            }
            sub={t.sub}
            accent={t.accent}
          />
        ))}
      </div>
    </section>
  );
}
