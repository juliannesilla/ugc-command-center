// Payments adapter — derives money-flow aggregates from `data/brands-canonical.json`.
//
// Source: data/brands-canonical.jsonl (DARWIN A.14v Wave 2).
// Reuses the canonical loader in `lib/mock-data/campaigns/from-canonical.ts` so
// payment status, amounts, and dates stay in lock-step with the rest of the
// dashboard.
//
// Phase A.14v V9B (YELLEN / Wave 2): wires /payments donut + bar charts to
// real signed-contract data. Honest empty states per HR-10 — Monat $54.40 is
// the only confirmed paid amount in pipeline; we do not inflate.
//
// Build-time bake — `loadAllCanonical()` returns the parsed JSON snapshot,
// safe for client bundles (no `node:fs`).

import { loadAllCanonical } from "@/lib/mock-data/campaigns/from-canonical";

// ───────────────────────────────────────────────────────────────────────────
// Public types
// ───────────────────────────────────────────────────────────────────────────

export type PaymentBucket =
  | "paid"
  | "pending"
  | "overdue"
  | "awaiting_contract";

export interface PaymentStatusSlice {
  bucket: PaymentBucket;
  label: string;
  count: number;
  /** USD — sum of `payment_amount_usd + bonus_amount_usd` where known. */
  amount: number;
  /** Brand names included in this slice (sorted alpha). */
  brands: string[];
  /** Hex fill for chart cells — matched to status-chip palette. */
  color: string;
}

export interface PaymentBrandValue {
  brand_id: string;
  brand: string;
  /** USD — base + bonus where numeric, else 0. */
  total_potential: number;
  /** "paid" | "pending" | "awaiting_contract" — drives bar color. */
  bucket: PaymentBucket;
  /** Free-text payment terms (retainer language, "PDF pending", etc.). */
  terms_note: string | null;
}

export interface PaymentTimelinePoint {
  /** YYYY-MM, e.g. "2026-05". */
  month: string;
  /** Human-friendly month label, e.g. "May '26". */
  label: string;
  /** USD received in that month (paid-status, paid_date in window). */
  received: number;
  /** USD expected to be received in that month (signed but unpaid). */
  expected: number;
  /** Brand names that contributed to either bar. */
  brands: string[];
}

export interface HighestValueActive {
  brand: string;
  brand_id: string;
  total_potential: number;
  bucket: PaymentBucket;
  terms_note: string | null;
}

// ───────────────────────────────────────────────────────────────────────────
// Bucket categorization — honest mapping of canonical.status → payment bucket.
//
// "awaiting_contract" is the most common case in this pipeline (29 of 41 rows
// at A.14v Wave 2), so we keep it as its own bucket rather than rolling it
// into "pending" — it tells Julz the contract isn't even signed yet.
// ───────────────────────────────────────────────────────────────────────────

const BUCKET_COLOR: Record<PaymentBucket, string> = {
  paid: "#34D399",            // emerald-400 — green = money in hand
  pending: "#F59E0B",         // amber-500 — yellow = signed, waiting
  overdue: "#F87171",         // rose-400 — red = past due
  awaiting_contract: "#94A3B8", // slate-400 — gray = no contract yet
};

const BUCKET_LABEL: Record<PaymentBucket, string> = {
  paid: "Paid",
  pending: "Pending (signed)",
  overdue: "Overdue",
  awaiting_contract: "Awaiting contract",
};

function bucketFor(row: ReturnType<typeof loadAllCanonical>[number]): PaymentBucket {
  if (row.status === "paid") return "paid";
  if (row.contract_signed === true) {
    // Signed contract — could be pending or overdue depending on payment_by.
    const due = row.deadlines.payment_by;
    if (due) {
      const today = new Date();
      const dueDate = new Date(due);
      if (dueDate < today) return "overdue";
    }
    return "pending";
  }
  return "awaiting_contract";
}

function amountFor(row: ReturnType<typeof loadAllCanonical>[number]): number {
  const base = typeof row.payment_amount_usd === "number" ? row.payment_amount_usd : 0;
  const bonus = typeof row.bonus_amount_usd === "number" ? row.bonus_amount_usd : 0;
  return base + bonus;
}

// ───────────────────────────────────────────────────────────────────────────
// Public exports
// ───────────────────────────────────────────────────────────────────────────

/**
 * Aggregates ALL canonical brand rows (dashboard_visible or not) into the
 * four payment buckets used by the /payments donut.
 *
 * Returns slices in priority order: paid → pending → overdue → awaiting.
 * Slices with zero count are still returned (so legend/empty-state can render).
 */
export function getPaymentsByStatus(): PaymentStatusSlice[] {
  const rows = loadAllCanonical();
  const order: PaymentBucket[] = ["paid", "pending", "overdue", "awaiting_contract"];
  const grouped = new Map<PaymentBucket, { count: number; amount: number; brands: string[] }>();
  for (const b of order) grouped.set(b, { count: 0, amount: 0, brands: [] });

  for (const row of rows) {
    const bucket = bucketFor(row);
    const slot = grouped.get(bucket)!;
    slot.count += 1;
    slot.amount += amountFor(row);
    slot.brands.push(row.brand_name_canonical);
  }

  return order.map((bucket) => {
    const slot = grouped.get(bucket)!;
    return {
      bucket,
      label: BUCKET_LABEL[bucket],
      count: slot.count,
      amount: Math.round(slot.amount * 100) / 100,
      brands: slot.brands.slice().sort((a, b) => a.localeCompare(b)),
      color: BUCKET_COLOR[bucket],
    };
  });
}

/**
 * Top-N brands by total_potential value, sorted descending. Drives the
 * "Top brands by potential value" horizontal bar chart.
 *
 * Honest-empty behavior: returns ONLY rows with payment_amount_usd > 0 OR
 * bonus_amount_usd > 0. Rows with payment_terms_note (e.g. MWM "$50/5-posts"
 * retainer, Phobaxx "PDF pending") are surfaced separately via
 * `getBrandsWithUnclearTerms()` so the bar chart doesn't fake-fill them as $0.
 */
export function getTopBrandsByPotential(limit = 8): PaymentBrandValue[] {
  return loadAllCanonical()
    .map((row): PaymentBrandValue => ({
      brand_id: row.brand_id,
      brand: row.brand_name_canonical,
      total_potential: amountFor(row),
      bucket: bucketFor(row),
      terms_note: row.payment_terms_note,
    }))
    .filter((b) => b.total_potential > 0)
    .sort((a, b) => b.total_potential - a.total_potential)
    .slice(0, limit);
}

/**
 * Signed contracts whose payment is structured as a retainer / unclear-terms
 * note (no fixed dollar amount yet). These are real revenue commitments but
 * can't be charted as a fixed $ bar. /payments shows them as a small caption
 * row beneath the bar chart so the picture stays honest.
 */
export function getBrandsWithUnclearTerms(): PaymentBrandValue[] {
  return loadAllCanonical()
    .filter(
      (row) =>
        row.contract_signed === true &&
        amountFor(row) === 0 &&
        (row.payment_terms_note ?? "").length > 0,
    )
    .map((row) => ({
      brand_id: row.brand_id,
      brand: row.brand_name_canonical,
      total_potential: 0,
      bucket: bucketFor(row),
      terms_note: row.payment_terms_note,
    }));
}

/**
 * Highest-value ACTIVE (not paid, not closed) brand by total_potential.
 * Drives the "Highest-Value Active" KPI tile.
 *
 * Returns undefined when no active brand has a numeric amount yet (honest:
 * "—" + "None active" in the UI).
 */
export function getHighestValueActive(): HighestValueActive | undefined {
  const rows = loadAllCanonical()
    .filter((row) => row.status !== "paid" && row.status !== "closed")
    .map((row) => ({
      brand_id: row.brand_id,
      brand: row.brand_name_canonical,
      total_potential: amountFor(row),
      bucket: bucketFor(row),
      terms_note: row.payment_terms_note,
    }))
    .filter((b) => b.total_potential > 0)
    .sort((a, b) => b.total_potential - a.total_potential);
  return rows[0];
}

/**
 * Monthly payment timeline — sums `payment_amount_usd` into the month bucket
 * derived from `last_msg_at` (received) or `deadlines.payment_by` (expected).
 *
 * Honest-empty behavior: returns the last 6 months including the current one.
 * Most months will be $0 (Monat's 3 payments in Apr-May'26 are the only real
 * historical deposits). This is the truth; we don't smear or invent.
 */
export function getPaymentTimelineMonthly(monthsBack = 6): PaymentTimelinePoint[] {
  const rows = loadAllCanonical();
  const today = new Date();
  const points: PaymentTimelinePoint[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }).replace(" ", " '");
    points.push({ month, label, received: 0, expected: 0, brands: [] });
  }

  function indexFor(monthKey: string): number {
    return points.findIndex((p) => p.month === monthKey);
  }

  for (const row of rows) {
    const amt = amountFor(row);
    if (amt === 0) continue;

    if (row.status === "paid" && row.last_msg_at) {
      const key = row.last_msg_at.slice(0, 7);
      const idx = indexFor(key);
      if (idx >= 0) {
        points[idx].received += amt;
        if (!points[idx].brands.includes(row.brand_name_canonical)) {
          points[idx].brands.push(row.brand_name_canonical);
        }
      }
    } else if (row.contract_signed && row.deadlines.payment_by) {
      const key = row.deadlines.payment_by.slice(0, 7);
      const idx = indexFor(key);
      if (idx >= 0) {
        points[idx].expected += amt;
        if (!points[idx].brands.includes(row.brand_name_canonical)) {
          points[idx].brands.push(row.brand_name_canonical);
        }
      }
    }
  }

  // Round to 2dp.
  return points.map((p) => ({
    ...p,
    received: Math.round(p.received * 100) / 100,
    expected: Math.round(p.expected * 100) / 100,
  }));
}

/**
 * Headline stats for the cards row — single read of canonical, so callers
 * don't loop the JSON four times.
 */
export interface PaymentHeadlineStats {
  total_paid: number;
  total_pending: number;
  total_overdue: number;
  total_awaiting: number;
  brand_count_total: number;
  brand_count_signed: number;
  brand_count_paid: number;
}

export function getPaymentHeadlineStats(): PaymentHeadlineStats {
  const slices = getPaymentsByStatus();
  const get = (b: PaymentBucket) => slices.find((s) => s.bucket === b)!;
  const rows = loadAllCanonical();
  return {
    total_paid: get("paid").amount,
    total_pending: get("pending").amount,
    total_overdue: get("overdue").amount,
    total_awaiting: get("awaiting_contract").amount,
    brand_count_total: rows.length,
    brand_count_signed: rows.filter((r) => r.contract_signed).length,
    brand_count_paid: rows.filter((r) => r.status === "paid").length,
  };
}
