/**
 * Needs Attention triage logic.
 *
 * Source: `_meta/dashboard-spec/02-campaign-pipeline-views-architecture.md`
 * Section 5 "Needs Attention / Fix First View":
 *
 *   Include Campaigns Where (14 triggers):
 *     1.  Response needed
 *     2.  Follow-up overdue
 *     3.  Missing SOW
 *     4.  Missing payment details
 *     5.  Missing usage rights
 *     6.  Missing deadline
 *     7.  Missing revision policy
 *     8.  Missing submission link
 *     9.  Call requested but not scheduled
 *     10. Waiting on brand >3-5 days
 *     11. Deliverable due within 72 hours and not ready
 *     12. Payment overdue
 *     13. QA failed
 *     14. Status is blocked
 *
 *   Group by Issue Type (10 categories):
 *     missing_info · needs_response · brand_followup · payment_issue ·
 *     usage_rights · deadline_unclear · production_blocker · qa_blocker ·
 *     access_issue · submission_issue
 *
 * Pure functions only — no I/O, no mutation.
 */

import type { Campaign } from "@/lib/types/campaign";
import { getBlockers, getMissingInfo } from "@/lib/scoring";

export type IssueCategory =
  | "missing_info"
  | "needs_response"
  | "brand_followup"
  | "payment_issue"
  | "usage_rights"
  | "deadline_unclear"
  | "production_blocker"
  | "qa_blocker"
  | "access_issue"
  | "submission_issue";

export type Severity = "high" | "medium" | "low";

export const ISSUE_CATEGORIES: { key: IssueCategory; label: string; tagline: string }[] = [
  { key: "missing_info",       label: "Missing info",        tagline: "Critical fields not yet captured." },
  { key: "needs_response",     label: "Needs response",      tagline: "Brand sent a message — your turn." },
  { key: "brand_followup",     label: "Brand follow-up",     tagline: "Waiting on brand >3 days." },
  { key: "payment_issue",      label: "Payment issue",       tagline: "Money fields missing or overdue." },
  { key: "usage_rights",       label: "Usage rights unclear", tagline: "License scope not pinned." },
  { key: "deadline_unclear",   label: "Deadline unclear",    tagline: "Due date missing or ambiguous." },
  { key: "production_blocker", label: "Production blocker",  tagline: "Status blocked or filming stuck." },
  { key: "qa_blocker",         label: "QA blocker",          tagline: "QA failed or QA can't start." },
  { key: "access_issue",       label: "Access issue",        tagline: "Job/asset links missing." },
  { key: "submission_issue",   label: "Submission issue",    tagline: "Submission link or portal missing." },
];

export interface TriageIssue {
  id: string;                 // stable key: campaign_id + category
  campaign: Campaign;
  category: IssueCategory;
  severity: Severity;
  reason: string;             // human-readable WHY this triggered
  nextAction: string;
  dueDate?: string;
  waitingOn: string;
  isWaitingOnMe: boolean;
  totalValue: number;
}

// ──────────────────────────────────────────────────────────────────────────
// Triggers — return list of (category, reason) pairs per campaign
// ──────────────────────────────────────────────────────────────────────────

function daysBetween(iso: string, now = Date.now()): number {
  return (new Date(iso).getTime() - now) / (1000 * 60 * 60 * 24);
}

/** Given a campaign, return all triage matches it produces (0..n). */
export function detectIssues(c: Campaign): TriageIssue[] {
  const issues: { category: IssueCategory; reason: string; severity: Severity }[] = [];
  const blockers = c.blockers.length > 0 ? c.blockers : getBlockers(c);
  const missing  = c.missing_info.length > 0 ? c.missing_info : getMissingInfo(c);

  // 1. Response needed — brand replied, waiting on me
  if (c.waiting_on_who === "me" && c.current_stage === "BRAND REPLIED") {
    issues.push({ category: "needs_response", reason: "Brand replied — response needed", severity: "high" });
  }

  // 2. Follow-up overdue — follow_up_date in the past
  if (c.follow_up_date && daysBetween(c.follow_up_date) < 0) {
    issues.push({
      category: "brand_followup",
      reason: `Follow-up overdue (${c.follow_up_date})`,
      severity: "high",
    });
  }

  // 3. Missing SOW
  if (blockers.includes("Missing SOW")) {
    issues.push({ category: "missing_info", reason: "Missing SOW", severity: "high" });
  }

  // 4. Missing payment details
  if (blockers.includes("Missing payment info") || missing.includes("payment details")) {
    issues.push({ category: "payment_issue", reason: "Payment terms not set", severity: "high" });
  }

  // 5. Missing usage rights — surfaces via blocker prose or missing_info
  const usageRightsHit =
    blockers.some((b) => /usage rights/i.test(b)) ||
    missing.some((m) => /usage rights/i.test(m));
  if (usageRightsHit) {
    issues.push({ category: "usage_rights", reason: "Usage rights unclear", severity: "medium" });
  }

  // 6. Missing deadline
  if (blockers.includes("Deadline missing") || missing.includes("deadline")) {
    issues.push({ category: "deadline_unclear", reason: "Due date missing", severity: "medium" });
  }

  // 7. Missing revision policy
  if (missing.some((m) => /revision/i.test(m))) {
    issues.push({ category: "missing_info", reason: "Revision policy not pinned", severity: "low" });
  }

  // 8. Missing submission link
  if (missing.includes("submission link")) {
    issues.push({ category: "submission_issue", reason: "Submission link missing", severity: "medium" });
  }

  // 9. Call requested but not scheduled
  if (c.current_stage === "CALL SCHEDULED" && !c.call_date) {
    issues.push({ category: "access_issue", reason: "Call requested but not scheduled", severity: "medium" });
  }

  // 10. Waiting on brand >3 days
  if (c.waiting_on_who === "brand" && c.last_message_date) {
    const daysSince = -daysBetween(c.last_message_date);
    if (daysSince > 3) {
      issues.push({
        category: "brand_followup",
        reason: `Waiting on brand ${Math.floor(daysSince)} days`,
        severity: daysSince > 5 ? "high" : "medium",
      });
    }
  }

  // 11. Deliverable due ≤72h and readiness < 80
  if (c.due_date) {
    const dDays = daysBetween(c.due_date);
    if (dDays >= 0 && dDays <= 3 && (c.readiness_score ?? 0) < 80) {
      issues.push({
        category: "production_blocker",
        reason: `Due in ${Math.ceil(dDays)} days · readiness ${c.readiness_score ?? 0}%`,
        severity: "high",
      });
    }
  }

  // 12. Payment overdue — payment_status="overdue" OR blockers include Overdue
  if (c.payment_status === "overdue") {
    issues.push({ category: "payment_issue", reason: "Payment overdue", severity: "high" });
  }
  if (blockers.includes("Overdue") && c.payment_status !== "paid") {
    issues.push({ category: "deadline_unclear", reason: "Deliverable date past due", severity: "high" });
  }

  // 13. QA failed — stage=QA + risk=high
  if (c.current_stage === "QA" && c.risk_level === "high") {
    issues.push({ category: "qa_blocker", reason: "QA flagged high-risk", severity: "high" });
  }

  // 14. Status is blocked
  if (c.status === "blocked") {
    issues.push({ category: "production_blocker", reason: "Status: blocked", severity: "high" });
  }

  // De-dup: same category twice on one campaign collapses (keep highest severity).
  const merged = new Map<IssueCategory, { reason: string; severity: Severity }>();
  const sevRank: Record<Severity, number> = { high: 3, medium: 2, low: 1 };
  for (const i of issues) {
    const prev = merged.get(i.category);
    if (!prev || sevRank[i.severity] > sevRank[prev.severity]) {
      merged.set(i.category, { reason: i.reason, severity: i.severity });
    }
  }

  const out: TriageIssue[] = [];
  for (const [category, { reason, severity }] of merged) {
    out.push({
      id: `${c.campaign_id}__${category}`,
      campaign: c,
      category,
      severity,
      reason,
      nextAction: c.next_action,
      dueDate: c.due_date,
      waitingOn: c.waiting_on_who,
      isWaitingOnMe: c.waiting_on_who === "me",
      totalValue: c.total_potential_value ?? c.base_pay ?? 0,
    });
  }
  return out;
}

/** Filter campaigns to those that produce ≥1 triage issue. */
export function buildAllIssues(campaigns: Campaign[]): TriageIssue[] {
  return campaigns.flatMap(detectIssues);
}

// ──────────────────────────────────────────────────────────────────────────
// Filters
// ──────────────────────────────────────────────────────────────────────────

export type SavedFilter =
  | "all"
  | "high_only"
  | "waiting_on_me"
  | "waiting_on_brand"
  | "payment_only"
  | "sow_only";

export const SAVED_FILTERS: { key: SavedFilter; label: string }[] = [
  { key: "all",              label: "All issues" },
  { key: "high_only",        label: "High severity only" },
  { key: "waiting_on_me",    label: "Waiting on me" },
  { key: "waiting_on_brand", label: "Waiting on brand" },
  { key: "payment_only",     label: "Payment issues only" },
  { key: "sow_only",         label: "SOW issues only" },
];

export function applyFilter(issues: TriageIssue[], filter: SavedFilter): TriageIssue[] {
  switch (filter) {
    case "high_only":        return issues.filter((i) => i.severity === "high");
    case "waiting_on_me":    return issues.filter((i) => i.isWaitingOnMe);
    case "waiting_on_brand": return issues.filter((i) => i.campaign.waiting_on_who === "brand");
    case "payment_only":     return issues.filter((i) => i.category === "payment_issue");
    case "sow_only":
      return issues.filter(
        (i) => i.category === "missing_info" && /sow/i.test(i.reason),
      );
    default: return issues;
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Sort: severity high first → due soonest → waiting on me first → highest value
// ──────────────────────────────────────────────────────────────────────────

const SEV_RANK: Record<Severity, number> = { high: 0, medium: 1, low: 2 };

export function sortIssues(issues: TriageIssue[]): TriageIssue[] {
  return [...issues].sort((a, b) => {
    if (SEV_RANK[a.severity] !== SEV_RANK[b.severity]) {
      return SEV_RANK[a.severity] - SEV_RANK[b.severity];
    }
    const da = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
    const db = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
    if (da !== db) return da - db;
    if (a.isWaitingOnMe !== b.isWaitingOnMe) return a.isWaitingOnMe ? -1 : 1;
    return b.totalValue - a.totalValue;
  });
}

/** Group an already-sorted list by category, preserving order. */
export function groupByCategory(
  issues: TriageIssue[],
): { category: IssueCategory; items: TriageIssue[] }[] {
  const map = new Map<IssueCategory, TriageIssue[]>();
  for (const i of issues) {
    if (!map.has(i.category)) map.set(i.category, []);
    map.get(i.category)!.push(i);
  }
  // Return in canonical 10-category order, even empty ones omitted.
  return ISSUE_CATEGORIES
    .map((c) => ({ category: c.key, items: map.get(c.key) ?? [] }))
    .filter((g) => g.items.length > 0);
}
