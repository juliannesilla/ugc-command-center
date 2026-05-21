// Mock per-payment rows for the Payments View (Phase A.14e Wave 3 — E8).
//
// Source: UGC/_meta/dashboard-spec/02-campaign-pipeline-views-architecture.md
// view #8 "Payments View" — key-fields table at L625-L644.
//
// One row per (deliverable × campaign). Most campaigns have a single deliverable
// (deliverable_count = 1), but multi-deliverable campaigns get split into one
// payment row per deliverable so the table reflects what was actually completed.
//
// Field provenance is the canonical `Campaign` row in lib/types/campaign.ts —
// brand, campaign, base_pay, bonus_potential, total_potential_value, payment_status.
// Per-deliverable fields (amount_earned, amount_received, payment_platform,
// submitted_date, payment_due_date, paid_date, invoice_sent) are mock-only
// because the canonical Campaign row stores them at campaign-level, not row-level.

import { MOCK_CAMPAIGNS } from "@/lib/mock-data/campaigns/index";
import type { Campaign, PaymentStatus } from "@/lib/types/campaign";

export type PaymentPlatform =
  | "PayPal"
  | "Stripe"
  | "SideShift"
  | "Bank Transfer"
  | "Unknown";

/**
 * One row per deliverable per campaign. Spec view #8 L625-L644.
 */
export interface PaymentRow {
  /** Stable id: `${campaign_id}-${deliverable_index}`. */
  id: string;
  campaign_id: string;
  brand: string;
  campaign_name: string;
  /** Deliverable label, e.g. "Video 1 of 2 — talking head". */
  deliverable: string;
  base_pay?: number;
  bonus_potential?: number | string;
  total_potential_value?: number;
  /** Amount Earned — confirmed-due regardless of receipt. */
  amount_earned?: number;
  /** Amount Received — money in hand. */
  amount_received?: number;
  payment_status: PaymentStatus;
  payment_platform: PaymentPlatform;
  submitted_date?: string;
  payment_due_date?: string;
  paid_date?: string;
  invoice_sent: boolean;
  /** Free-text notes per spec row 15. */
  notes?: string;
}

/** Map campaign_id → platform. Backfilled from outreach context. */
const PLATFORM_BY_CAMPAIGN: Record<string, PaymentPlatform> = {
  parakeetai: "SideShift",
  elf: "PayPal",
  lotusshop: "PayPal",
  "goodie-ai": "Unknown",
  "megprime-pay": "Stripe",
  vilo: "PayPal",
};

/** Map campaign_id → submitted date (when deliverable went to brand). */
const SUBMITTED_BY_CAMPAIGN: Record<string, string | undefined> = {
  parakeetai: undefined, // still SCRIPT READY
  elf: undefined,        // still FILMING
  lotusshop: undefined,  // SOW RECEIVED
  "goodie-ai": undefined,
  "megprime-pay": undefined,
  vilo: undefined,
};

/** Map campaign_id → invoice-sent flag. */
const INVOICE_SENT: Record<string, boolean> = {
  parakeetai: false,
  elf: false,
  lotusshop: false,
  "goodie-ai": false,
  "megprime-pay": false,
  vilo: false,
};

/** Per-deliverable label given a campaign + 1-indexed slot. */
function deliverableLabel(c: Campaign, idx: number): string {
  const total = c.deliverable_count ?? 1;
  const base =
    c.campaign_type === "talking_head" ? "Talking-head video" :
    c.campaign_type === "review" ? "Honest review video" :
    c.campaign_type === "demo" ? "Demo walkthrough" :
    c.campaign_type === "paid_ad" ? "Paid-ad cut" :
    c.campaign_type === "organic_post" ? "Organic post" :
    c.campaign_type === "affiliate" ? "Affiliate video" :
    c.campaign_type === "retainer" ? "Retainer deliverable" :
    "Deliverable";
  return total > 1 ? `${base} ${idx} of ${total}` : base;
}

/**
 * Payment-due date heuristic — submitted + 30d (net-30), or due_date if no submit.
 * Returns undefined when neither is known.
 */
function paymentDueDate(c: Campaign): string | undefined {
  const submitted = SUBMITTED_BY_CAMPAIGN[c.campaign_id];
  if (submitted) {
    const d = new Date(submitted);
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  }
  return c.due_date;
}

/**
 * Earned amount given payment status — pending earns base, paid earns total,
 * overdue earns base, unknown earns 0 (no firm contract).
 */
function amountEarned(c: Campaign): number | undefined {
  if (c.payment_status === "unknown") return undefined;
  if (c.payment_status === "paid") return c.total_potential_value ?? c.base_pay;
  return c.base_pay;
}

/** Received = full total only when paid. */
function amountReceived(c: Campaign): number | undefined {
  return c.payment_status === "paid" ? (c.total_potential_value ?? c.base_pay) : 0;
}

/** Build per-deliverable rows from MOCK_CAMPAIGNS. */
export const MOCK_PAYMENTS: PaymentRow[] = MOCK_CAMPAIGNS.flatMap((c) => {
  const count = Math.max(1, c.deliverable_count ?? 1);
  const earnedTotal = amountEarned(c);
  const receivedTotal = amountReceived(c);
  // Split totals evenly across deliverables for the table view.
  return Array.from({ length: count }, (_, i): PaymentRow => {
    const idx = i + 1;
    const per = (n?: number) => (n == null ? undefined : Math.round(n / count));
    return {
      id: `${c.campaign_id}-${idx}`,
      campaign_id: c.campaign_id,
      brand: c.brand,
      campaign_name: c.campaign_name,
      deliverable: deliverableLabel(c, idx),
      base_pay: per(c.base_pay),
      bonus_potential: c.bonus_potential,
      total_potential_value: per(c.total_potential_value),
      amount_earned: per(earnedTotal),
      amount_received: per(receivedTotal),
      payment_status: c.payment_status,
      payment_platform: PLATFORM_BY_CAMPAIGN[c.campaign_id] ?? "Unknown",
      submitted_date: SUBMITTED_BY_CAMPAIGN[c.campaign_id],
      payment_due_date: paymentDueDate(c),
      paid_date: c.payment_status === "paid" ? c.due_date : undefined,
      invoice_sent: INVOICE_SENT[c.campaign_id] ?? false,
      notes: c.notes,
    };
  });
});
