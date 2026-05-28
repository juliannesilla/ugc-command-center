// Deadlines — derived from data/brands-canonical.json at build time.
//
// Phase A.14v V8C (HAMILTON / Wave 2): rewrote to read REAL deadlines from
// canonical brand rows (filming_by / submission_by / payment_by + awaiting_julz
// follow-ups) instead of hardcoded Glossier/Skims/Yeti mocks. HR-1 CITE: every
// row below is sourced from a canonical brand_id — no fabricated brands.
//
// Downstream consumers (deadline-events.ts, calendar, pipeline/deadlines):
//   - MOCK_DELIVERABLES        → from canonical.deadlines.submission_by (non-null only)
//   - MOCK_FILMING_DATES       → from canonical.deadlines.filming_by (non-null, future only)
//   - MOCK_PAYMENTS_DUE        → from canonical.deadlines.payment_by + payment_amount_usd
//   - MOCK_BRAND_FOLLOWUPS     → from canonical.awaiting_julz + last_msg_at
//   - MOCK_TODOS               → from canonical.awaiting_julz_action (top 5 by urgency)
//   - DEADLINE_STATS / HEATMAP → derived counts from above pools
//
// Honest empty-state: canonical today has ONLY 2 brands with hard deadlines
// (bolt-new filming/submission 5/28, megprime-pay submission 5/29). That's the
// real state of the pipeline — HR-2 PRESERVE INTENT, do not pad with mocks.

import type {
  BrandFollowup,
  Deliverable,
  FilmingDate,
  PaymentDue,
  TodoItem,
} from '@/lib/data-sync/types';
import {
  daysFromNow,
  dayShort,
  dayNum,
  monthShort,
} from '@/lib/date-anchor';
import { loadAllCanonical } from '@/lib/mock-data/campaigns/from-canonical';

const _addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};
const _shortLabel = (n: number) => {
  const d = _addDays(n);
  return `${monthShort(d)} ${dayNum(d)}`;
};
const _dayShort = (n: number) => dayShort(_addDays(n));
const _dayNum = (n: number) => dayNum(_addDays(n));

export const TODAY_ISO = daysFromNow(0);

// ─── helpers ────────────────────────────────────────────────────────────
const _today = new Date(`${TODAY_ISO}T00:00:00`);

/** Days between an ISO yyyy-mm-dd date and today (positive = future). */
function _daysBetween(iso: string): number {
  const d = new Date(`${iso}T00:00:00`);
  return Math.round((d.getTime() - _today.getTime()) / 86_400_000);
}

/** Map urgency P0/P1/P2/P3 → display priority. */
function _urgencyToPriority(u: string): 'High' | 'Medium' | 'Low' {
  if (u === 'P0') return 'High';
  if (u === 'P1') return 'Medium';
  return 'Low';
}

/** Status bucket for a delivery date. */
function _deliveryStatus(iso: string): Deliverable['status'] {
  const d = _daysBetween(iso);
  if (d < 0) return 'overdue';
  if (d === 0) return 'due-today';
  if (d === 1) return 'due-tomorrow';
  if (d <= 7) return 'due-week';
  return 'due-next-week';
}

// ─── canonical rows ─────────────────────────────────────────────────────
const _canonical = loadAllCanonical();

// ─── derived: MOCK_DELIVERABLES (submission_by) ─────────────────────────
// One row per brand with a real submission_by. Spec: video unless deliverables
// list points elsewhere (sample_video → video, test_video → video, etc).
export const MOCK_DELIVERABLES: Deliverable[] = _canonical
  .filter((r) => r.deadlines.submission_by != null)
  .map((r): Deliverable => {
    const due = r.deadlines.submission_by as string;
    const firstDeliv = r.deliverables[0];
    const type = ((): Deliverable['type'] => {
      const t = (firstDeliv?.type ?? '').toLowerCase();
      if (t.includes('photo') || t.includes('image')) return 'photo';
      if (t.includes('script')) return 'script';
      if (t.includes('review')) return 'review';
      return 'video';
    })();
    return {
      id: `d-${r.brand_id}`,
      brand: r.brand_name_canonical,
      campaign: `${r.brand_name_canonical} — ${type === 'video' ? 'UGC video' : type}`,
      dueDate: due,
      status: _deliveryStatus(due),
      type,
      brandLogo: r.brand_name_canonical.charAt(0),
    };
  })
  .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

// ─── derived: MOCK_FILMING_DATES (filming_by, today + future) ───────────
export const MOCK_FILMING_DATES: FilmingDate[] = _canonical
  .filter(
    (r) =>
      r.deadlines.filming_by != null &&
      _daysBetween(r.deadlines.filming_by) >= 0,
  )
  .map((r): FilmingDate => {
    const date = r.deadlines.filming_by as string;
    return {
      id: `fd-${r.brand_id}`,
      brand: r.brand_name_canonical,
      campaign:
        r.deliverables[0]?.type === 'sample_video'
          ? 'Sample video'
          : `${r.brand_name_canonical} shoot`,
      date,
      daysUntil: _daysBetween(date),
      location: 'Home studio',
    };
  })
  .sort((a, b) => a.date.localeCompare(b.date));

// ─── derived: MOCK_PAYMENTS_DUE (payment_by + payment_amount_usd) ───────
// Includes any brand that has BOTH a payment_by date AND a payment_amount_usd.
// Also surfaces "paid" canonical rows as completed for visibility.
export const MOCK_PAYMENTS_DUE: PaymentDue[] = _canonical
  .filter(
    (r) =>
      (r.deadlines.payment_by != null && r.payment_amount_usd != null) ||
      r.status === 'paid',
  )
  .map((r, i): PaymentDue => {
    const isPaid = r.status === 'paid';
    const due =
      r.deadlines.payment_by ?? r.last_msg_at ?? daysFromNow(0);
    const status: PaymentDue['status'] = isPaid
      ? 'paid'
      : _daysBetween(due) < 0
        ? 'overdue'
        : 'pending';
    return {
      id: `p-${r.brand_id}`,
      brand: r.brand_name_canonical,
      amount: r.payment_amount_usd ?? 0,
      dueDate: due,
      invoiceId: `INV-${String(i + 1).padStart(3, '0')}-${r.brand_id.slice(0, 6)}`,
      status,
    };
  })
  .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

// ─── derived: MOCK_BRAND_FOLLOWUPS (awaiting_julz brands) ───────────────
// "Follow up" = brands awaiting Julz with awaiting_julz_since (or last_msg_at)
// in the past. Top 5 by urgency then recency.
export const MOCK_BRAND_FOLLOWUPS: BrandFollowup[] = _canonical
  .filter(
    (r) =>
      r.awaiting_julz === true &&
      r.dashboard_visible &&
      (r.awaiting_julz_since != null || r.last_msg_at != null),
  )
  .sort((a, b) => {
    // Urgency P0 first, then most-recently-touched first
    const ua = a.urgency === 'P0' ? 0 : a.urgency === 'P1' ? 1 : 2;
    const ub = b.urgency === 'P0' ? 0 : b.urgency === 'P1' ? 1 : 2;
    if (ua !== ub) return ua - ub;
    const da = a.awaiting_julz_since ?? a.last_msg_at ?? '';
    const db = b.awaiting_julz_since ?? b.last_msg_at ?? '';
    return db.localeCompare(da);
  })
  .slice(0, 5)
  .map(
    (r): BrandFollowup => ({
      id: `f-${r.brand_id}`,
      brand: r.brand_name_canonical,
      topic: r.awaiting_julz_action ?? 'Awaiting reply',
      lastContact: r.awaiting_julz_since ?? r.last_msg_at ?? TODAY_ISO,
      priority: _urgencyToPriority(r.urgency),
    }),
  );

// ─── derived: MOCK_TODOS (top awaiting_julz actions, urgency-ranked) ────
export const MOCK_TODOS: TodoItem[] = _canonical
  .filter(
    (r) =>
      r.awaiting_julz === true &&
      r.dashboard_visible &&
      r.awaiting_julz_action != null,
  )
  .sort((a, b) => {
    const ua = a.urgency === 'P0' ? 0 : a.urgency === 'P1' ? 1 : 2;
    const ub = b.urgency === 'P0' ? 0 : b.urgency === 'P1' ? 1 : 2;
    if (ua !== ub) return ua - ub;
    return (b.awaiting_julz_since ?? '').localeCompare(a.awaiting_julz_since ?? '');
  })
  .slice(0, 5)
  .map((r, i): TodoItem => {
    // Due label: deadline submission/filming first, else "ASAP" for P0, else today+i
    const deadline = r.deadlines.submission_by ?? r.deadlines.filming_by;
    let due = 'Today';
    if (deadline) {
      const d = _daysBetween(deadline);
      if (d < 0) due = 'Overdue';
      else if (d === 0) due = 'Today';
      else if (d === 1) due = 'Tomorrow';
      else due = `${_dayShort(d)} ${_shortLabel(d)}`;
    } else if (r.urgency === 'P0' && i > 0) {
      due = `${_dayShort(i)} ${_shortLabel(i)}`;
    }
    return {
      id: `t-${r.brand_id}`,
      label: `${r.brand_name_canonical}: ${r.awaiting_julz_action}`,
      due,
      priority: _urgencyToPriority(r.urgency),
    };
  });

// ─── derived: DEADLINE_STATS (counted from real pools) ──────────────────
const _overdueCount = MOCK_DELIVERABLES.filter((d) => d.status === 'overdue').length;
const _todayCount = MOCK_DELIVERABLES.filter((d) => d.status === 'due-today').length;
const _thisWeekCount = MOCK_DELIVERABLES.filter((d) => {
  const days = _daysBetween(d.dueDate);
  return days >= 0 && days <= 7;
}).length;
const _nextWeekCount = MOCK_DELIVERABLES.filter((d) => {
  const days = _daysBetween(d.dueDate);
  return days > 7 && days <= 14;
}).length;
// Completed = paid canonical rows touched in the last 7 days (best signal we have).
const _completedThisWeek = _canonical.filter(
  (r) =>
    r.status === 'paid' &&
    r.last_msg_at != null &&
    _daysBetween(r.last_msg_at) >= -7 &&
    _daysBetween(r.last_msg_at) <= 0,
).length;

export const DEADLINE_STATS = {
  overdue: _overdueCount,
  dueToday: _todayCount,
  dueThisWeek: _thisWeekCount,
  dueNextWeek: _nextWeekCount,
  completedThisWeek: _completedThisWeek,
};

// ─── HEATMAP_DAYS (last-10-days deliverable density from real pool) ─────
const _heatmapOffsets = [-9, -8, -7, -6, -5, -4, -3, -2, -1, 0];
export const HEATMAP_DAYS = _heatmapOffsets.map((n) => {
  const iso = daysFromNow(n);
  const count = MOCK_DELIVERABLES.filter((d) => d.dueDate === iso).length;
  return {
    dateISO: iso,
    dayLabel: _dayShort(n),
    dayNum: _dayNum(n),
    count,
    isToday: n === 0,
  };
});

// ─── WHATS_NEXT_TIMELINE (next-5-days deliverable count from real pool) ──
export const WHATS_NEXT_TIMELINE = [0, 1, 2, 3, 4].map((n) => {
  const iso = daysFromNow(n);
  const count = MOCK_DELIVERABLES.filter((d) => d.dueDate === iso).length;
  return {
    dateISO: iso,
    label: _dayShort(n),
    shortLabel: _shortLabel(n),
    count,
    isToday: n === 0,
  };
});

// ─── NEXT_7_DAYS_SUMMARY (totals from real pools) ───────────────────────
const _next7DeliverableCount = MOCK_DELIVERABLES.filter((d) => {
  const days = _daysBetween(d.dueDate);
  return days >= 0 && days <= 7;
}).length;
const _next7FollowupCount = MOCK_BRAND_FOLLOWUPS.length;
const _next7PaymentCount = MOCK_PAYMENTS_DUE.filter((p) => {
  const days = _daysBetween(p.dueDate);
  return p.status !== 'paid' && days >= 0 && days <= 7;
}).length;

export const NEXT_7_DAYS_SUMMARY = {
  total: _next7DeliverableCount + _next7FollowupCount + _next7PaymentCount,
  deliverables: _next7DeliverableCount,
  followUps: _next7FollowupCount,
  payments: _next7PaymentCount,
};
