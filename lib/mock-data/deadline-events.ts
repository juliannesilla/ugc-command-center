// Deadline events — unified pool feeding Calendar + Timeline views.
//
// Phase A.14e Wave 3 (E7): the Deadlines view spec calls out 11 distinct
// deadline TYPES (Response · Call · SOW review · Script · Film day · Edit
// · Submission · Posting · Follow-up · Payment · Revision) sourced from
// MOCK_CAMPAIGNS (due_date / follow_up_date / call_date + current_stage
// derivation) and MOCK_PAYMENTS_DUE / MOCK_FILMING_DATES.
//
// Each event maps to one of 6 color codes (pink today · orange soon · red
// overdue · green complete · purple scheduled · gray waiting) computed
// against TODAY_ISO. Single source of truth — both views derive sort,
// filters, and color from this list.

import { MOCK_CAMPAIGNS } from "@/lib/mock-data/campaigns";
import {
  MOCK_DELIVERABLES,
  MOCK_BRAND_FOLLOWUPS,
  MOCK_FILMING_DATES,
  MOCK_PAYMENTS_DUE,
  TODAY_ISO,
} from "@/lib/mock-data/deadlines";

export type DeadlineType =
  | "response"
  | "call"
  | "sow_review"
  | "script"
  | "film"
  | "edit"
  | "submission"
  | "posting"
  | "follow_up"
  | "payment"
  | "revision";

export type DeadlineTone =
  | "pink"     // due today
  | "orange"  // due soon (within 3 days)
  | "red"     // overdue
  | "green"   // complete
  | "purple"  // scheduled
  | "gray";   // waiting on brand

export type DeadlineEvent = {
  id: string;
  type: DeadlineType;
  title: string;
  brand: string;
  brandLogo?: string;
  dateISO: string;     // YYYY-MM-DD
  tone: DeadlineTone;
  daysFromToday: number;
  meta?: string;       // optional sub-line e.g. amount, location
};

// ─── helpers ────────────────────────────────────────────────────────────
const today = new Date(`${TODAY_ISO}T00:00:00`);

function diffDays(iso: string): number {
  const d = new Date(`${iso}T00:00:00`);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

function toneFor(
  iso: string,
  opts?: { scheduled?: boolean; waiting?: boolean; complete?: boolean }
): DeadlineTone {
  if (opts?.complete) return "green";
  if (opts?.waiting) return "gray";
  if (opts?.scheduled) return "purple";
  const d = diffDays(iso);
  if (d < 0) return "red";
  if (d === 0) return "pink";
  if (d <= 3) return "orange";
  return "purple";
}

// ─── derive events from MOCK_CAMPAIGNS ──────────────────────────────────
// Per stage → derived deadline type. Single campaign can produce multiple
// events (e.g. follow_up + submission + payment).
function eventsFromCampaigns(): DeadlineEvent[] {
  const out: DeadlineEvent[] = [];
  for (const c of MOCK_CAMPAIGNS) {
    const logo = c.brand.charAt(0);

    // 1. follow-up
    if (c.follow_up_date) {
      out.push({
        id: `c-${c.campaign_id}-follow`,
        type: "follow_up",
        title: `Follow up with ${c.brand}`,
        brand: c.brand,
        brandLogo: logo,
        dateISO: c.follow_up_date,
        tone: toneFor(c.follow_up_date, { waiting: c.waiting_on_who === "brand" }),
        daysFromToday: diffDays(c.follow_up_date),
        meta: c.next_action,
      });
    }

    // 2. scheduled call
    if (c.call_date) {
      out.push({
        id: `c-${c.campaign_id}-call`,
        type: "call",
        title: `Call — ${c.brand}`,
        brand: c.brand,
        brandLogo: logo,
        dateISO: c.call_date,
        tone: toneFor(c.call_date, { scheduled: true }),
        daysFromToday: diffDays(c.call_date),
        meta: c.contact_name,
      });
    }

    // 3. due_date — type derived from current_stage
    if (c.due_date) {
      const stage = c.current_stage;
      let type: DeadlineType = "submission";
      let label = "Submit final to";
      if (stage === "SOW RECEIVED") {
        type = "sow_review";
        label = "SOW review for";
      } else if (stage === "STRATEGY READY" || stage === "SOW REVIEWED") {
        type = "script";
        label = "Script due for";
      } else if (stage === "SCRIPT READY") {
        type = "script";
        label = "Script lock for";
      } else if (stage === "FILMING") {
        type = "film";
        label = "Film day for";
      } else if (stage === "EDITING" || stage === "QA") {
        type = "edit";
        label = "Edit due for";
      } else if (stage === "SUBMITTED") {
        type = "posting";
        label = "Posting date for";
      } else if (stage === "BRAND REPLIED" || stage === "APPLIED") {
        type = "response";
        label = "Respond to";
      }
      out.push({
        id: `c-${c.campaign_id}-due`,
        type,
        title: `${label} ${c.brand}`,
        brand: c.brand,
        brandLogo: logo,
        dateISO: c.due_date,
        tone: toneFor(c.due_date),
        daysFromToday: diffDays(c.due_date),
        meta: c.next_action,
      });
    }
  }
  return out;
}

// ─── deliverables (overdue/today/tomorrow) ──────────────────────────────
function eventsFromDeliverables(): DeadlineEvent[] {
  return MOCK_DELIVERABLES.map((d) => {
    // Revision flag: video due-today after FILMING stage maps to revision
    const isRevision = d.campaign.toLowerCase().includes("revision");
    return {
      id: `d-${d.id}`,
      type: (isRevision ? "revision" : "submission") as DeadlineType,
      title: d.campaign,
      brand: d.brand,
      brandLogo: d.brandLogo,
      dateISO: d.dueDate,
      tone: toneFor(d.dueDate),
      daysFromToday: diffDays(d.dueDate),
      meta: d.type,
    };
  });
}

// ─── brand follow-ups ───────────────────────────────────────────────────
function eventsFromFollowups(): DeadlineEvent[] {
  return MOCK_BRAND_FOLLOWUPS.map((f) => {
    // Map lastContact → next follow-up window (3 days later, capped at today)
    const last = new Date(`${f.lastContact}T00:00:00`);
    const next = new Date(last);
    next.setDate(next.getDate() + 3);
    const nextISO = next.toISOString().slice(0, 10);
    return {
      id: `f-${f.id}`,
      type: "follow_up" as DeadlineType,
      title: `${f.brand} — ${f.topic}`,
      brand: f.brand,
      brandLogo: f.brand.charAt(0),
      dateISO: nextISO,
      tone: toneFor(nextISO),
      daysFromToday: diffDays(nextISO),
      meta: `${f.priority} priority`,
    };
  });
}

// ─── filming days ───────────────────────────────────────────────────────
function eventsFromFilming(): DeadlineEvent[] {
  return MOCK_FILMING_DATES.map((fd) => ({
    id: `film-${fd.id}`,
    type: "film" as DeadlineType,
    title: `${fd.campaign} — film day`,
    brand: fd.brand,
    brandLogo: fd.brand.charAt(0),
    dateISO: fd.date,
    tone: toneFor(fd.date, { scheduled: true }),
    daysFromToday: diffDays(fd.date),
    meta: fd.location,
  }));
}

// ─── payments ───────────────────────────────────────────────────────────
function eventsFromPayments(): DeadlineEvent[] {
  return MOCK_PAYMENTS_DUE.map((p) => ({
    id: `pay-${p.id}`,
    type: "payment" as DeadlineType,
    title: `Payment check-in — ${p.brand}`,
    brand: p.brand,
    brandLogo: p.brand.charAt(0),
    dateISO: p.dueDate,
    tone: toneFor(p.dueDate, { complete: p.status === "paid" }),
    daysFromToday: diffDays(p.dueDate),
    meta: `$${p.amount.toLocaleString()} · ${p.invoiceId}`,
  }));
}

// ─── master pool ────────────────────────────────────────────────────────
export const DEADLINE_EVENTS: DeadlineEvent[] = [
  ...eventsFromCampaigns(),
  ...eventsFromDeliverables(),
  ...eventsFromFollowups(),
  ...eventsFromFilming(),
  ...eventsFromPayments(),
];

// ─── sort: overdue → today → tomorrow → this week → future ──────────────
export function sortEvents(list: DeadlineEvent[]): DeadlineEvent[] {
  return [...list].sort((a, b) => {
    // overdue (negative) first by absolute distance (most overdue first)
    const aOver = a.daysFromToday < 0;
    const bOver = b.daysFromToday < 0;
    if (aOver && !bOver) return -1;
    if (!aOver && bOver) return 1;
    if (aOver && bOver) return a.daysFromToday - b.daysFromToday;
    return a.daysFromToday - b.daysFromToday;
  });
}

// ─── saved filter chips ─────────────────────────────────────────────────
export type SavedFilterKey =
  | "all"
  | "today"
  | "this_week"
  | "overdue"
  | "calls"
  | "submissions"
  | "payments"
  | "filming";

export const SAVED_FILTERS: { key: SavedFilterKey; label: string; sub?: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "this_week", label: "This week" },
  { key: "overdue", label: "Overdue" },
  { key: "calls", label: "Calls" },
  { key: "submissions", label: "Submissions" },
  { key: "payments", label: "Payment follow-ups" },
  { key: "filming", label: "Filming days" },
];

export function applyFilter(list: DeadlineEvent[], key: SavedFilterKey): DeadlineEvent[] {
  switch (key) {
    case "today":       return list.filter((e) => e.daysFromToday === 0);
    case "this_week":   return list.filter((e) => e.daysFromToday >= 0 && e.daysFromToday <= 7);
    case "overdue":     return list.filter((e) => e.daysFromToday < 0);
    case "calls":       return list.filter((e) => e.type === "call");
    case "submissions": return list.filter((e) => e.type === "submission" || e.type === "posting");
    case "payments":    return list.filter((e) => e.type === "payment");
    case "filming":     return list.filter((e) => e.type === "film");
    default:            return list;
  }
}

// ─── type-token map (label + color slug) ────────────────────────────────
export const DEADLINE_TYPE_META: Record<DeadlineType, { label: string; icon: string }> = {
  response:    { label: "Response due",    icon: "MessageSquare" },
  call:        { label: "Call scheduled",  icon: "Phone" },
  sow_review:  { label: "SOW review",      icon: "FileSignature" },
  script:      { label: "Script due",      icon: "FileText" },
  film:        { label: "Film day",        icon: "Video" },
  edit:        { label: "Edit due",        icon: "Scissors" },
  submission:  { label: "Submission",      icon: "Upload" },
  posting:     { label: "Posting date",    icon: "Send" },
  follow_up:   { label: "Follow-up",       icon: "Bell" },
  payment:     { label: "Payment",         icon: "DollarSign" },
  revision:    { label: "Revision",        icon: "Repeat" },
};

// ─── tone token map (Tailwind classes) ──────────────────────────────────
export const TONE_TOKENS: Record<DeadlineTone, { dot: string; chip: string; ring: string; label: string }> = {
  pink:   { dot: "bg-pink-500",   chip: "bg-pink-50 text-pink-700 ring-pink-200",         ring: "ring-pink-300",     label: "Due today" },
  orange: { dot: "bg-orange-500", chip: "bg-orange-50 text-orange-700 ring-orange-200",   ring: "ring-orange-300",   label: "Due soon" },
  red:    { dot: "bg-red-500",    chip: "bg-red-50 text-red-700 ring-red-200",            ring: "ring-red-300",      label: "Overdue" },
  green:  { dot: "bg-emerald-500",chip: "bg-emerald-50 text-emerald-700 ring-emerald-200",ring: "ring-emerald-300",  label: "Complete" },
  purple: { dot: "bg-iris-500",   chip: "bg-iris-50 text-iris-600 ring-iris-200",         ring: "ring-iris-300",     label: "Scheduled" },
  gray:   { dot: "bg-ink-400",    chip: "bg-cloud-50 text-ink-600 ring-cloud-200",        ring: "ring-cloud-300",    label: "Waiting on brand" },
};
