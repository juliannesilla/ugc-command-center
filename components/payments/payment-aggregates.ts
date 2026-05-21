// Aggregation helpers for the Payments View top-metric cards.
// Spec: dashboard-spec/02-campaign-pipeline-views-architecture.md view #8 L614-L623.

import type { PaymentRow } from "@/lib/mock-data/payments";

/** Today is fixed at 2026-05-20 per project context. */
const TODAY = new Date("2026-05-20");

/** Bonus as a number — coerces structured-text bonuses to 0 in totals (still surfaced in highest-bonus filter). */
function bonusValue(b?: number | string): number {
  if (typeof b === "number") return b;
  return 0;
}

/** Numeric bonus AMOUNT (for "Bonus Potential" card) — pulls number out of either type when possible. */
function bonusAmount(b?: number | string): number {
  if (typeof b === "number") return b;
  if (typeof b === "string") {
    // Pull the first dollar number — e.g. "$100 per 100K views" → 100.
    const m = b.match(/\$?([\d,]+)/);
    return m ? Number(m[1].replace(/,/g, "")) : 0;
  }
  return 0;
}

export function sumExpected(rows: PaymentRow[]): number {
  // total expected = sum of total_potential_value (base + max bonus)
  return rows.reduce((s, r) => s + (r.total_potential_value ?? r.base_pay ?? 0), 0);
}

export function sumReceived(rows: PaymentRow[]): number {
  return rows.reduce((s, r) => s + (r.amount_received ?? 0), 0);
}

export function pendingTotal(rows: PaymentRow[]): { count: number; amount: number } {
  const pend = rows.filter((r) => r.payment_status === "pending" || r.payment_status === "invoiced");
  return {
    count: pend.length,
    amount: pend.reduce((s, r) => s + (r.amount_earned ?? r.base_pay ?? 0), 0),
  };
}

export function overdueTotal(rows: PaymentRow[]): { count: number; amount: number } {
  const od = rows.filter(isOverdue);
  return {
    count: od.length,
    amount: od.reduce((s, r) => s + (r.amount_earned ?? r.base_pay ?? 0), 0),
  };
}

export function bonusPotential(rows: PaymentRow[]): number {
  return rows.reduce((s, r) => s + bonusAmount(r.bonus_potential), 0);
}

export function highestValueActive(rows: PaymentRow[]): PaymentRow | undefined {
  const active = rows.filter(
    (r) => r.payment_status !== "paid" && r.payment_status !== "unknown",
  );
  if (active.length === 0) return undefined;
  return active.reduce((max, r) =>
    (r.total_potential_value ?? 0) > (max.total_potential_value ?? 0) ? r : max,
  );
}

export function averagePerDeliverable(rows: PaymentRow[]): number {
  const known = rows.filter((r) => (r.total_potential_value ?? 0) > 0);
  if (known.length === 0) return 0;
  return Math.round(
    known.reduce((s, r) => s + (r.total_potential_value ?? 0), 0) / known.length,
  );
}

export function thisMonthEarned(rows: PaymentRow[]): number {
  const m = TODAY.getMonth();
  const y = TODAY.getFullYear();
  return rows
    .filter((r) => {
      if (!r.paid_date) return false;
      const d = new Date(r.paid_date);
      return d.getMonth() === m && d.getFullYear() === y;
    })
    .reduce((s, r) => s + (r.amount_received ?? 0), 0);
}

/** Overdue = pending/invoiced with payment_due_date < today. */
export function isOverdue(r: PaymentRow): boolean {
  if (r.payment_status === "paid" || r.payment_status === "unknown") return false;
  if (!r.payment_due_date) return false;
  return new Date(r.payment_due_date) < TODAY;
}

/** Returns whether a row has high bonus potential ($150+ numeric or any structured bonus). */
export function hasHighBonus(r: PaymentRow): boolean {
  const v = r.bonus_potential;
  if (typeof v === "number") return v >= 150;
  return typeof v === "string" && v.length > 0;
}

/** Returns whether terms are unclear (status=unknown OR missing dates). */
export function hasUnclearTerms(r: PaymentRow): boolean {
  return r.payment_status === "unknown" || !r.payment_due_date;
}

/** Paid this calendar month. */
export function paidThisMonth(r: PaymentRow): boolean {
  if (!r.paid_date) return false;
  const d = new Date(r.paid_date);
  return d.getMonth() === TODAY.getMonth() && d.getFullYear() === TODAY.getFullYear();
}

/** Invoicing needed = submitted but invoice not sent and not yet paid. */
export function needsInvoicing(r: PaymentRow): boolean {
  return !!r.submitted_date && !r.invoice_sent && r.payment_status !== "paid";
}

// Silence unused warning if helper imported elsewhere.
export const _bonusValueExport = bonusValue;
