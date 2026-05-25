// Implements: 01-initial-dashboard-prompt.md § "DESIGN THE LAYOUT" row 13 "Portfolio-ready clips panel"
// Surfaces campaigns in EDITING+ stages with "Add to portfolio" CTA per spec L478.
import { PlayCircle, Plus } from "lucide-react";
import { StatusChip } from "@/components/ui/status-chip";
import { getPortfolioReadyClips } from "@/lib/mock-data/overview";

export function PortfolioReadyClips() {
  const clips = getPortfolioReadyClips();

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        {/* A.14m T5: section-title */}
        <h3 className="section-title text-[22px]">
          Portfolio-ready clips
        </h3>
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Tag your best work
        </p>
      </div>
      {clips.length === 0 ? (
        <div className="rounded-3xl bg-white shadow-card ring-1 ring-cloud-100 px-5 py-8 text-center">
          <PlayCircle className="h-5 w-5 text-ink-400 mx-auto" />
          <p className="mt-2 text-[13px] text-ink-500">
            No clips ready yet — finish a delivery to tag for portfolio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {clips.map((c) => (
            <div
              key={`${c.brand}-${c.stage}`}
              className="rounded-2xl bg-white shadow-card ring-1 ring-cloud-100 overflow-hidden group hover:-translate-y-0.5 hover:shadow-soft transition"
            >
              {/* Thumbnail placeholder — gradient block in brand accent. */}
              <div
                className="aspect-video relative grid place-items-center"
                style={{
                  background: `linear-gradient(135deg, ${c.thumbnailAccent} 0%, #FFF5FA 100%)`,
                }}
              >
                <PlayCircle className="h-8 w-8 text-white drop-shadow-md" />
                <div className="absolute top-2 right-2">
                  <StatusChip
                    tone={c.status === "ready" ? "green" : "iris"}
                    className="!text-[9.5px]"
                  >
                    {c.status === "ready" ? "ready" : "draft"}
                  </StatusChip>
                </div>
              </div>
              <div className="p-3">
                <p className="text-[13px] font-semibold text-ink-900 truncate">
                  {c.brand}
                </p>
                <p className="text-[11px] text-ink-500 truncate mt-0.5">
                  {c.product}
                </p>
                <button
                  type="button"
                  className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-semibold text-cloud-700 hover:text-cloud-600 transition"
                >
                  <Plus className="h-3 w-3" />
                  Add to portfolio
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
