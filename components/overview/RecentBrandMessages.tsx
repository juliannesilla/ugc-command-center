// Implements: 01-initial-dashboard-prompt.md § "DESIGN THE LAYOUT" row 9 "Recent brand messages panel"
// Pulls from MOCK_CAMPAIGNS last_message_summary via getRecentBrandMessages().
import { Mail, ArrowRight } from "lucide-react";
import { StatusChip } from "@/components/ui/status-chip";
import { getRecentBrandMessages } from "@/lib/mock-data/overview";

export function RecentBrandMessages() {
  const messages = getRecentBrandMessages();

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        {/* A.14m T5: section-title */}
        <h3 className="section-title text-[22px]">
          Recent brand messages
        </h3>
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Last 7 days
        </p>
      </div>
      <div className="rounded-3xl bg-white shadow-card ring-1 ring-cloud-100 overflow-hidden">
        {messages.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <Mail className="h-5 w-5 text-ink-400 mx-auto" />
            <p className="mt-2 text-[13px] text-ink-500">
              No recent brand messages — inbox is clear.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-cloud-50">
            {messages.map((m) => (
              <li
                key={`${m.brand}-${m.when}`}
                className="px-5 py-4 flex items-start gap-4 hover:bg-cloud-50/60 transition"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-iris-50 text-iris-600 ring-1 ring-iris-100 shrink-0">
                  <Mail className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="text-[13.5px] font-semibold text-ink-900">
                      {m.brand}
                    </p>
                    <span className="text-[11px] text-ink-500">
                      · {m.contact}
                    </span>
                    <span className="text-[11px] text-ink-400 ml-auto">
                      {m.when}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] text-ink-700 leading-snug line-clamp-2">
                    {m.summary}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusChip
                      tone={m.waitingOn === "me" ? "pink" : "yellow"}
                      className="!text-[9.5px]"
                    >
                      {m.waitingOn === "me" ? "your move" : "waiting on brand"}
                    </StatusChip>
                    <button
                      type="button"
                      className="ml-auto inline-flex items-center gap-1 text-[11.5px] font-semibold text-cloud-700 hover:text-cloud-600 transition"
                    >
                      Open thread
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
