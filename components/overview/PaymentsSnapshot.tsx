// Implements: 01-initial-dashboard-prompt.md § "DESIGN THE LAYOUT" row 11 "Payments snapshot"
// Total Expected · Total Received · Pending · Overdue per spec L789.
import { Wallet, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { getPaymentsSnapshot } from "@/lib/mock-data/overview";
import { formatMoney } from "@/lib/utils";

export function PaymentsSnapshot() {
  const { totalExpected, totalReceived, pending, overdue, bonusPotential } =
    getPaymentsSnapshot();

  const tiles = [
    {
      label: "Total Expected",
      value: totalExpected,
      Icon: Wallet,
      tone: "iris" as const,
    },
    {
      label: "Total Received",
      value: totalReceived,
      Icon: TrendingUp,
      tone: "green" as const,
    },
    {
      label: "Pending",
      value: pending,
      Icon: Clock,
      tone: "yellow" as const,
    },
    {
      label: "Overdue",
      value: overdue,
      Icon: AlertCircle,
      tone: "pink" as const,
    },
  ];

  const toneStyles: Record<
    "iris" | "green" | "yellow" | "pink",
    { ring: string; iconBg: string; valueColor: string }
  > = {
    iris: {
      ring: "ring-iris-100",
      iconBg: "bg-iris-50 text-iris-600 ring-iris-100",
      valueColor: "text-ink-900",
    },
    green: {
      ring: "ring-emerald-100",
      iconBg: "bg-emerald-50 text-emerald-600 ring-emerald-100",
      valueColor: "text-emerald-700",
    },
    yellow: {
      ring: "ring-amber-100",
      iconBg: "bg-amber-50 text-amber-600 ring-amber-100",
      valueColor: "text-amber-700",
    },
    pink: {
      ring: "ring-cloud-100",
      iconBg: "bg-cloud-50 text-cloud-700 ring-cloud-100",
      valueColor: "text-cloud-700",
    },
  };

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          {/* A.14m T5: section-title + section-subtitle */}
          <h3 className="section-title text-[22px]">
            Payments snapshot
          </h3>
          <p className="section-subtitle mt-0.5">
            Bonus potential layered on base: +{formatMoney(bonusPotential)}
          </p>
        </div>
      </div>
      {/* A.14m Stream-1 P1 mobile-stack: 1-col at 375px, 2-col sm, 4-col lg. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {tiles.map((t) => {
          const styles = toneStyles[t.tone];
          const Icon = t.Icon;
          return (
            <div
              key={t.label}
              className={`rounded-3xl bg-white p-5 lg:p-6 shadow-card ring-1 ${styles.ring}`}
            >
              <div className="flex items-start justify-between">
                <p className="text-[10.5px] uppercase tracking-[0.18em] text-ink-500 font-semibold leading-tight">
                  {t.label}
                </p>
                <span
                  className={`grid h-7 w-7 place-items-center rounded-lg ring-1 ${styles.iconBg}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
              </div>
              <p
                className={`mt-2 font-display text-2xl leading-none ${styles.valueColor}`}
              >
                {formatMoney(t.value)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
