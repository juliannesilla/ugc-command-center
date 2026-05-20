import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  ExternalLink,
  MessageSquare,
  Clock,
  PencilLine,
  CheckCircle2,
} from "lucide-react";
import { BRAND_CONVERSATIONS } from "@/lib/mock-data/brand-responses";
import { BrandContactCard } from "@/components/brand-responses/BrandContactCard";
import { NextActionCard } from "@/components/brand-responses/NextActionCard";
import { CallScheduler } from "@/components/brand-responses/CallScheduler";
import { FollowUpReminderCard } from "@/components/brand-responses/FollowUpReminderCard";
import { ReplyComposer } from "@/components/brand-responses/ReplyComposer";
import { ResponseDeadlineTicker } from "@/components/brand-responses/ResponseDeadlineTicker";

export function generateStaticParams() {
  return BRAND_CONVERSATIONS.map((c) => ({ id: c.id }));
}

export default function BrandResponseDetail({
  params,
}: {
  params: { id: string };
}) {
  const conv = BRAND_CONVERSATIONS.find((c) => c.id === params.id);
  if (!conv) return notFound();

  const progressPct = conv.status === "archived"
    ? 100
    : conv.status === "in-progress"
    ? 70
    : conv.status === "call-scheduled"
    ? 55
    : conv.status === "brief-requested"
    ? 35
    : conv.status === "awaiting-reply"
    ? 25
    : 15;

  const latestBrandMsg =
    [...conv.thread].reverse().find((m) => m.from === "brand") ?? conv.thread[0];

  return (
    <>
      {/* Header strip */}
      <section className="header-cloud px-8 pt-8 pb-10 text-white">
        <Link
          href="/brand-responses"
          className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-white/90 hover:text-white transition"
        >
          <ChevronLeft className="h-3 w-3" />
          Back to inbox
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold opacity-90">
              Conversation · {conv.contactRole}
            </p>
            <h1 className="mt-1 font-display text-[40px] leading-[1.05] tracking-tight">
              {conv.brand}
            </h1>
          </div>
          <ResponseDeadlineTicker
            label={conv.responseDeadline}
            hoursLeft={conv.deadlineHoursLeft}
          />
        </div>
      </section>

      {/* Body grid */}
      <section className="-mt-6 px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
          {/* LEFT main column */}
          <div className="flex flex-col gap-5">
            {/* Message received card */}
            <article className="rounded-3xl bg-white/85 backdrop-blur p-6 shadow-card ring-1 ring-cloud-100">
              <header className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-xl bg-cloud-100 text-cloud-700">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </span>
                  <h2 className="text-[11px] uppercase tracking-[0.16em] font-semibold text-ink-700">
                    Message Received
                  </h2>
                </div>
                <span className="text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
                  {latestBrandMsg.at}
                </span>
              </header>
              <blockquote className="mt-4 border-l-2 border-cloud-300 pl-4 font-display text-[18px] leading-snug text-ink-900">
                &ldquo;{latestBrandMsg.body}&rdquo;
              </blockquote>
              <button
                type="button"
                className="mt-4 inline-flex items-center gap-1 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-cloud-700 hover:text-cloud-600 transition"
              >
                View Full Message
                <ExternalLink className="h-3 w-3" />
              </button>
            </article>

            {/* Response Status card */}
            <article className="rounded-3xl bg-white/85 backdrop-blur p-6 shadow-card ring-1 ring-cloud-100">
              <header className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-xl bg-peach-100 text-peach-500">
                    <Clock className="h-3.5 w-3.5" />
                  </span>
                  <h2 className="text-[11px] uppercase tracking-[0.16em] font-semibold text-ink-700">
                    Response Status
                  </h2>
                </div>
                <span className="text-[12px] font-semibold text-ink-700">
                  {conv.responseDeadline}
                </span>
              </header>
              <div className="mt-4">
                <div className="h-2 w-full overflow-hidden rounded-full bg-cloud-100">
                  <div
                    className="h-full rounded-full bg-cloud-sunset transition-all"
                    style={{ width: `${progressPct}%` }}
                    aria-valuenow={progressPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    role="progressbar"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
                  <span>Received</span>
                  <span>Drafting</span>
                  <span>Sent</span>
                </div>
              </div>
            </article>

            {/* Draft Response card */}
            <article className="rounded-3xl bg-white/85 backdrop-blur p-6 shadow-card ring-1 ring-cloud-100">
              <header className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-xl bg-iris-100 text-iris-500">
                    <PencilLine className="h-3.5 w-3.5" />
                  </span>
                  <h2 className="text-[11px] uppercase tracking-[0.16em] font-semibold text-ink-700">
                    Draft Response
                  </h2>
                </div>
                <span className="text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
                  Last edited 12 min ago
                </span>
              </header>
              <p className="mt-3 text-[13px] text-ink-600 leading-relaxed">
                Hi {conv.contactName.split(" ")[0]} — thanks for reaching out about a
                possible partnership with {conv.brand}. To put together the right
                scope, could you share creative brief, deliverables, usage, timeline,
                and payment structure?…
              </p>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-2xl bg-cloud-sunset px-3.5 py-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white shadow-card hover:shadow-soft transition"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Send Response
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-2xl bg-white px-3.5 py-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-ink-700 ring-1 ring-cloud-200 hover:bg-cloud-50 transition"
                >
                  <PencilLine className="h-3.5 w-3.5" />
                  Edit Draft
                </button>
              </div>
            </article>

            {/* Full reply composer */}
            <ReplyComposer conv={conv} />
          </div>

          {/* RIGHT sidebar */}
          <aside className="flex flex-col gap-5">
            <BrandContactCard conv={conv} />
            <NextActionCard conv={conv} />
            {conv.callRequested && conv.callSlots && (
              <CallScheduler proposedSlots={conv.callSlots} />
            )}
            <FollowUpReminderCard conv={conv} />
          </aside>
        </div>
      </section>
    </>
  );
}
