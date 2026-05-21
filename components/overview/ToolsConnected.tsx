// Implements: 01-initial-dashboard-prompt.md § "MAIN DASHBOARD OVERVIEW / 6. Tools / Assets Connected" (L292-L312)
// 15 spec-named tools with connected / needs setup / limited / manual pills.
import { StatusChip } from "@/components/ui/status-chip";
import { TOOLS_CONNECTED, TOOL_STATUS_TONE } from "@/lib/mock-data/overview";

export function ToolsConnected() {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <h3 className="font-display text-2xl text-ink-900">
          Tools &amp; assets connected
        </h3>
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink-500">
          {TOOLS_CONNECTED.length} sources
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {TOOLS_CONNECTED.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.name}
              className="group rounded-2xl bg-white px-4 py-3.5 shadow-card ring-1 ring-cloud-100 hover:ring-cloud-300 hover:-translate-y-0.5 transition flex items-center gap-3"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-cloud-soft text-cloud-700 ring-1 ring-cloud-100">
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[13px] font-semibold text-ink-900 truncate">
                  {tool.name}
                </span>
                <span className="block">
                  <StatusChip
                    tone={TOOL_STATUS_TONE[tool.status]}
                    className="!text-[9.5px] !px-1.5 !py-0.5"
                  >
                    {tool.status}
                  </StatusChip>
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
