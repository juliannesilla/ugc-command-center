import { CalendarClock, MapPin, RefreshCw } from "lucide-react";

type FilmingStatus = {
  status: string;
  scheduledAt: string;
  location?: string;
};

function fmt(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

const STATUS_TONE: Record<string, string> = {
  Scheduled:        "bg-cloud-100 text-cloud-700 ring-cloud-200",
  Filming:          "bg-amber-100 text-amber-700 ring-amber-200",
  Wrapped:          "bg-emerald-100 text-emerald-700 ring-emerald-200",
  "Pre-production": "bg-iris-100 text-iris-600 ring-iris-200",
  Delayed:          "bg-rose-100 text-rose-700 ring-rose-200",
};

export function FilmingStatusCard({ status }: { status: FilmingStatus }) {
  const tone = STATUS_TONE[status.status] ?? "bg-ink-100 text-ink-700 ring-ink-300";
  return (
    <section className="glass-card flex h-full flex-col rounded-3xl p-5 lg:p-6 shadow-card">
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink-900 text-cloud-200">
            <CalendarClock className="h-3.5 w-3.5" strokeWidth={2.2} />
          </span>
          <h3 className="font-display text-sm font-semibold text-ink-900">Filming Status</h3>
        </div>
        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${tone}`}>
          {status.status}
        </span>
      </header>
      <div className="space-y-2.5 text-[12.5px]">
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-700">
            Scheduled
          </p>
          <p className="leading-snug text-ink-800">{fmt(status.scheduledAt)}</p>
        </div>
        {status.location && (
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-700">
              Location
            </p>
            <p className="flex items-start gap-1.5 leading-snug text-ink-800">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cloud-600" />
              {status.location}
            </p>
          </div>
        )}
      </div>
      <button className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-ink-900 px-3 py-2 text-[12px] font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-soft">
        <RefreshCw className="h-3.5 w-3.5" /> Update Status
      </button>
    </section>
  );
}
