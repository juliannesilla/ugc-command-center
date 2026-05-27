"use client";

/**
 * PerfMetricsWidget — A.14t T5 (A.4 G35 deferred-gap)
 *
 * Surfaces post-publish performance metrics per campaign:
 *   - 4 KPI tiles (Views · Saves · CTR · Engagement Rate, most recent values)
 *   - Recharts line chart of views/saves over time (when ≥2 entries)
 *   - "+ Log new metrics" button → inline form stub (full persistence
 *     deferred; static-export build has no server runtime, parity with T6's
 *     UI-shell pattern).
 *
 * Empty state guides Julz to log her first metric after a video ships.
 *
 * Skills cited (HR-21): frontend-design, data:create-viz, vercel:nextjs,
 * superpowers:verification-before-completion.
 */

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Eye,
  Bookmark,
  MousePointerClick,
  Heart,
  Plus,
  X,
} from "lucide-react";
import { getMetricsForCampaign } from "@/lib/mock-data/campaign-metrics";
import { cn } from "@/lib/utils";

function fmtCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}
function fmtPct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function PerfMetricsWidget({ campaignSlug }: { campaignSlug: string }) {
  const [showForm, setShowForm] = useState(false);
  const metrics = getMetricsForCampaign(campaignSlug);
  const latest = metrics[metrics.length - 1];
  const hasData = metrics.length > 0;
  const hasTrend = metrics.length >= 2;

  const chartData = metrics.map((m) => ({
    date: fmtDate(m.date),
    views: m.views,
    saves: m.saves,
  }));

  return (
    <article className="glass-card rounded-2xl p-5 shadow-card">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-peach-100 text-peach-500">
            <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.4} />
          </span>
          <h2 className="font-display text-base font-bold text-ink-900">
            Performance Metrics
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl border border-cloud-200 bg-white/85 px-3 py-1.5 text-[11.5px] font-semibold text-ink-700 shadow-card transition duration-200 ease-out",
            "hover:-translate-y-[1px] hover:border-peach-300 hover:text-peach-500 hover:shadow-soft active:scale-[0.99] will-change-transform",
          )}
          aria-expanded={showForm}
        >
          {showForm ? (
            <>
              <X className="h-3.5 w-3.5" />
              Close
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              Log new metrics
            </>
          )}
        </button>
      </header>

      {!hasData && !showForm && (
        <div className="rounded-xl border border-dashed border-cloud-200 bg-white/60 p-6 text-center">
          <p className="text-[12.5px] leading-snug text-ink-600">
            No metrics logged yet. After your first published video, log
            views/saves/CTR here to track performance over time.
          </p>
        </div>
      )}

      {hasData && (
        <>
          {/* KPI tiles — latest values */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiTile
              icon={<Eye className="h-3.5 w-3.5" />}
              label="Views"
              value={fmtCount(latest.views)}
              tone="cloud"
            />
            <KpiTile
              icon={<Bookmark className="h-3.5 w-3.5" />}
              label="Saves"
              value={fmtCount(latest.saves)}
              tone="iris"
            />
            <KpiTile
              icon={<MousePointerClick className="h-3.5 w-3.5" />}
              label="CTR"
              value={fmtPct(latest.ctr)}
              tone="peach"
            />
            <KpiTile
              icon={<Heart className="h-3.5 w-3.5" />}
              label="Engagement"
              value={fmtPct(latest.engagement_rate)}
              tone="emerald"
            />
          </div>

          <p className="mt-2 text-[10.5px] text-ink-700">
            Latest reading · {fmtDate(latest.date)} · {latest.platform} ·{" "}
            <span className="capitalize">
              {latest.source.replace("_", " ")}
            </span>
          </p>

          {/* Trend chart — only when ≥2 entries */}
          {hasTrend ? (
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 8, right: 12, bottom: 4, left: -8 }}
                >
                  <CartesianGrid
                    stroke="rgba(157,107,255,0.08)"
                    strokeDasharray="3 4"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#6B5E80" }}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickFormatter={fmtCount}
                    tick={{ fontSize: 11, fill: "#6B5E80" }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    tickMargin={6}
                  />
                  <Tooltip
                    cursor={{
                      stroke: "rgba(157,107,255,0.25)",
                      strokeWidth: 1,
                      strokeDasharray: "3 3",
                    }}
                    contentStyle={{
                      background: "rgba(255,255,255,0.98)",
                      border: "1px solid rgba(234,220,255,0.6)",
                      borderRadius: 14,
                      fontSize: 12,
                      padding: "8px 12px",
                      boxShadow:
                        "0 8px 24px -8px rgba(157,107,255,0.18), 0 2px 6px -2px rgba(255,107,157,0.10)",
                    }}
                    labelStyle={{
                      color: "#5A4A6E",
                      fontWeight: 600,
                      fontSize: 11,
                      marginBottom: 4,
                      letterSpacing: "0.02em",
                    }}
                    itemStyle={{ color: "#1A1224", padding: 0 }}
                    formatter={(v: number) => fmtCount(v)}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 6 }}
                    iconType="circle"
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    name="Views"
                    stroke="#FF6B9D"
                    strokeWidth={2.5}
                    dot={{ r: 3, strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="saves"
                    name="Saves"
                    stroke="#B58CFF"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-cloud-200 bg-white/60 p-3 text-center text-[11.5px] text-ink-700">
              Log a second reading to unlock the trend chart.
            </p>
          )}
        </>
      )}

      {/* Inline form stub — persistence deferred (no server runtime in static export) */}
      {showForm && (
        <div className="mt-4 rounded-xl border border-cloud-200 bg-white/85 p-4">
          <p className="mb-3 flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-700">
            <Plus className="h-3 w-3" /> Log a new reading
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <FormField label="Date" type="date" />
            <FormField label="Platform" type="select">
              <option>tiktok</option>
              <option>instagram</option>
              <option>youtube</option>
              <option>other</option>
            </FormField>
            <FormField label="Source" type="select">
              <option>brand report</option>
              <option>creator dashboard</option>
              <option>manual</option>
            </FormField>
            <FormField label="Views" type="number" placeholder="0" />
            <FormField label="Saves" type="number" placeholder="0" />
            <FormField label="Shares" type="number" placeholder="0" />
            <FormField label="Comments" type="number" placeholder="0" />
            <FormField label="CTR (%)" type="number" placeholder="0.0" />
            <FormField
              label="Engagement (%)"
              type="number"
              placeholder="0.0"
            />
          </div>
          <p className="mt-3 text-[11px] leading-snug text-ink-700">
            Form persistence ships in A.14u — for now, append the row directly
            to{" "}
            <code className="rounded bg-cloud-100 px-1 py-0.5 text-[10.5px] font-medium text-cloud-700">
              lib/mock-data/campaign-metrics.ts
            </code>
            .
          </p>
        </div>
      )}
    </article>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────

function KpiTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "cloud" | "iris" | "peach" | "emerald";
}) {
  const TONES: Record<typeof tone, string> = {
    cloud: "bg-cloud-100 text-cloud-700",
    iris: "bg-iris-100 text-iris-600",
    peach: "bg-peach-100 text-peach-500",
    emerald: "bg-emerald-100 text-emerald-700",
  } as any;
  return (
    <div className="rounded-xl border border-cloud-100 bg-white/70 p-3">
      <p className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-700">
        <span
          className={cn(
            "inline-flex h-5 w-5 items-center justify-center rounded-full",
            TONES[tone],
          )}
        >
          {icon}
        </span>
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-bold text-ink-900">
        {value}
      </p>
    </div>
  );
}

function FormField({
  label,
  type,
  placeholder,
  children,
}: {
  label: string;
  type: "date" | "number" | "select";
  placeholder?: string;
  children?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-700">
        {label}
      </span>
      {type === "select" ? (
        <select
          className="w-full rounded-lg border border-cloud-200 bg-white px-2.5 py-1.5 text-[12px] text-ink-800 focus:border-iris-400 focus:outline-none focus:ring-2 focus:ring-iris-200"
          disabled
        >
          {children}
        </select>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          className="w-full rounded-lg border border-cloud-200 bg-white px-2.5 py-1.5 text-[12px] text-ink-800 placeholder:text-ink-600 focus:border-iris-400 focus:outline-none focus:ring-2 focus:ring-iris-200"
          disabled
        />
      )}
    </label>
  );
}
