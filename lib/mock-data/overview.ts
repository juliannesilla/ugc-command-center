// Overview-specific derived mock data for the UGC | Campaign HQ dashboard hub.
//
// Implements:
// - 01-initial-dashboard-prompt.md § 3 "My Campaign Pipeline Snapshot" (14 tiles)
// - 01-initial-dashboard-prompt.md § 4 "My Creator Campaign Health Snapshot"
// - 01-initial-dashboard-prompt.md § 5 "Focus This Week"
// - 01-initial-dashboard-prompt.md § 6 "Tools / Assets Connected" (15 tools)
// - 01-initial-dashboard-prompt.md § "DESIGN THE LAYOUT" rows 9-13
//   (Recent Brand Messages · Upcoming Deadlines · Payments Snapshot · Portfolio-ready clips)
//
// Computes derived values from `MOCK_CAMPAIGNS` so each tile/panel stays in
// sync with the canonical campaign rows shipped by E-DATA in Wave 1.

import {
  Folder,
  Mail,
  Sparkles,
  PenTool,
  Scissors,
  Video,
  Instagram,
  Youtube,
  MessageSquare,
  StickyNote,
  Camera,
  Library,
  Star,
  ScrollText,
  Hash,
  type LucideIcon,
} from "lucide-react";
import { MOCK_CAMPAIGNS } from "@/lib/mock-data/campaigns";
import { getReadinessScore, getMissingInfo, getBlockers } from "@/lib/scoring";
import type { Campaign, CampaignStage } from "@/lib/types/campaign";

// ──────────────────────────────────────────────────────────────────────────
// SECTION 3: My Campaign Pipeline Snapshot — 14 tiles (spec L221-L236)
// ──────────────────────────────────────────────────────────────────────────

export type SnapshotAccent =
  | "pink"
  | "iris"
  | "peach"
  | "orange"
  | "green"
  | "yellow";

export interface SnapshotTile {
  /** Spec label, verbatim. */
  label: string;
  /** Computed count from MOCK_CAMPAIGNS. */
  count: number;
  /** Sub-text under the count ("vs last week", "in production", etc.). */
  sub: string;
  /** Color accent — maps to StatCard. */
  accent: SnapshotAccent;
}

const isStageOneOf = (c: Campaign, stages: CampaignStage[]) =>
  stages.includes(c.current_stage);

/** 14 tiles, ordered per spec L221-L236. */
export function getSnapshotTiles(
  campaigns: Campaign[] = MOCK_CAMPAIGNS,
): SnapshotTile[] {
  const newOpportunities = campaigns.filter((c) =>
    isStageOneOf(c, ["NEW LEAD", "APPLIED"]),
  ).length;

  const awaitingMyResponse = campaigns.filter(
    (c) => c.waiting_on_who === "me" && isStageOneOf(c, ["BRAND REPLIED", "RESPONDED"]),
  ).length;

  const waitingOnBrand = campaigns.filter(
    (c) => c.waiting_on_who === "brand",
  ).length;

  const needSowReview = campaigns.filter(
    (c) => c.current_stage === "SOW RECEIVED",
  ).length;

  const readyToScript = campaigns.filter((c) =>
    isStageOneOf(c, ["SOW REVIEWED", "STRATEGY READY"]),
  ).length;

  const readyToFilm = campaigns.filter(
    (c) => c.current_stage === "SCRIPT READY",
  ).length;

  const editing = campaigns.filter((c) =>
    isStageOneOf(c, ["EDITING", "FILMING"]),
  ).length;

  const submitted = campaigns.filter(
    (c) => c.current_stage === "SUBMITTED",
  ).length;

  const accepted = campaigns.filter(
    (c) => c.current_stage === "ACCEPTED",
  ).length;

  const posted = campaigns.filter((c) => c.current_stage === "POSTED").length;

  const paidOrPending = campaigns.filter((c) =>
    isStageOneOf(c, ["INVOICED", "PAID"]),
  ).length;

  // Sum of total_potential_value across active campaigns.
  const totalPotentialValue = campaigns
    .filter((c) => c.status !== "archived" && c.status !== "paid")
    .reduce((sum, c) => sum + (c.total_potential_value ?? 0), 0);

  // Deliverables due within next 7 days.
  const sevenDaysOut = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const thisWeekDeliverables = campaigns.filter((c) => {
    if (!c.due_date) return false;
    const due = new Date(c.due_date).getTime();
    return due >= Date.now() && due <= sevenDaysOut;
  }).length;

  // Overdue or has blockers.
  const overdueOrBlocked = campaigns.filter((c) => {
    if (c.status === "blocked") return true;
    if (getBlockers(c).includes("Overdue")) return true;
    return false;
  }).length;

  return [
    { label: "New Opportunities",      count: newOpportunities,      sub: "fresh leads",         accent: "pink"   },
    { label: "Awaiting My Response",   count: awaitingMyResponse,    sub: "reply needed",        accent: "pink"   },
    { label: "Waiting on Brand",       count: waitingOnBrand,        sub: "their court",         accent: "yellow" },
    { label: "Need SOW Review",        count: needSowReview,         sub: "redline first",       accent: "iris"   },
    { label: "Ready to Script",        count: readyToScript,         sub: "strategy locked",     accent: "iris"   },
    { label: "Ready to Film",          count: readyToFilm,           sub: "script approved",     accent: "peach"  },
    { label: "Editing",                count: editing,               sub: "in production",       accent: "orange" },
    { label: "Submitted",              count: submitted,             sub: "with the brand",      accent: "green"  },
    { label: "Accepted",               count: accepted,              sub: "approved cuts",       accent: "green"  },
    { label: "Posted",                 count: posted,                sub: "live on platform",    accent: "green"  },
    { label: "Paid / Pending Payment", count: paidOrPending,         sub: "money in motion",     accent: "green"  },
    { label: "Total Potential Value",  count: totalPotentialValue,   sub: "active pipeline USD", accent: "iris"   },
    { label: "This Week's Deliverables", count: thisWeekDeliverables, sub: "due ≤ 7 days",       accent: "peach"  },
    { label: "Overdue / Blocked",      count: overdueOrBlocked,      sub: "needs triage",        accent: "orange" },
  ];
}

// ──────────────────────────────────────────────────────────────────────────
// SECTION 4: My Creator Campaign Health Snapshot — strong/blocking lists
// ──────────────────────────────────────────────────────────────────────────

export interface HealthSnapshot {
  /** Overall readiness = average of getReadinessScore across active campaigns. */
  readiness: number;
  strengths: string[];
  blockers: string[];
  /** Health distribution segments for the donut. */
  segments: { name: string; value: number; color: string }[];
}

export function getHealthSnapshot(
  campaigns: Campaign[] = MOCK_CAMPAIGNS,
): HealthSnapshot {
  const active = campaigns.filter(
    (c) => c.status !== "archived" && c.status !== "paid",
  );

  const readiness =
    active.length === 0
      ? 0
      : Math.round(
          active.reduce((sum, c) => sum + getReadinessScore(c), 0) /
            active.length,
        );

  // What's strong — derived signals.
  const strengths: string[] = [];
  const onTrack = active.filter(
    (c) => getReadinessScore(c) >= 70 && getBlockers(c).length === 0,
  );
  if (onTrack.length > 0) {
    strengths.push(
      `${onTrack.length} campaign${onTrack.length === 1 ? "" : "s"} on track for on-time delivery`,
    );
  }
  const highFit = active.filter((c) => (c.brand_fit_score ?? 0) >= 90);
  if (highFit.length > 0) {
    strengths.push(
      `${highFit.length} high brand-fit (90+) — ${highFit
        .slice(0, 2)
        .map((c) => c.brand)
        .join(" · ")}`,
    );
  }
  const readyToShip = active.filter(
    (c) =>
      c.current_stage === "QA" ||
      c.current_stage === "SUBMITTED" ||
      getReadinessScore(c) >= 80,
  );
  if (readyToShip.length > 0) {
    strengths.push(
      `${readyToShip.length} ready to ship — ${readyToShip
        .slice(0, 2)
        .map((c) => c.brand)
        .join(" · ")}`,
    );
  }
  strengths.push("SideShift response rate at 64% (best month yet)");

  // What's blocking — pulled directly from per-campaign blockers + missing info.
  const blockerSet = new Map<string, number>();
  for (const c of active) {
    const bs = getBlockers(c);
    for (const b of bs) {
      blockerSet.set(b, (blockerSet.get(b) ?? 0) + 1);
    }
  }
  const blockers: string[] = [];
  const missingPayment = blockerSet.get("Missing payment info") ?? 0;
  if (missingPayment > 0) {
    blockers.push(
      `${missingPayment} campaign${missingPayment === 1 ? "" : "s"} missing payment info`,
    );
  }
  const missingSow = blockerSet.get("Missing SOW") ?? 0;
  if (missingSow > 0) {
    blockers.push(
      `${missingSow} campaign${missingSow === 1 ? "" : "s"} missing SOW or written brief`,
    );
  }
  const waitingBrand = blockerSet.get("Waiting on brand") ?? 0;
  if (waitingBrand > 0) {
    blockers.push(`${waitingBrand} brand${waitingBrand === 1 ? "" : "s"} owe response`);
  }
  const usageRights = active.filter((c) =>
    c.missing_info.some((m) => /usage rights/i.test(m)),
  ).length;
  if (usageRights > 0) {
    blockers.push(`${usageRights} flagged for missing usage rights`);
  }

  // Donut segments — readiness distribution.
  const onTrackCt = active.filter((c) => getReadinessScore(c) >= 70).length;
  const needsReviewCt = active.filter((c) => {
    const r = getReadinessScore(c);
    return r >= 40 && r < 70;
  }).length;
  const readyExecCt = active.filter(
    (c) =>
      getReadinessScore(c) >= 80 &&
      ["SCRIPT READY", "FILMING", "EDITING", "QA"].includes(c.current_stage),
  ).length;

  return {
    readiness,
    strengths,
    blockers,
    segments: [
      { name: "On Track",         value: onTrackCt,    color: "#22C55E" },
      { name: "Needs Review",     value: needsReviewCt, color: "#EAB308" },
      { name: "Ready to Execute", value: readyExecCt,  color: "#9D6BFF" },
    ],
  };
}

// ──────────────────────────────────────────────────────────────────────────
// SECTION 5: Focus This Week — 3 stacks per spec L273-L289
// ──────────────────────────────────────────────────────────────────────────

export interface FocusGroup {
  title: string;
  /** Lucide icon name string — resolved in the consumer to avoid bundling. */
  iconKey: "send" | "film" | "clock";
  items: { label: string; meta: string }[];
}

/**
 * Build from real campaigns where possible; fall back to curated mock items
 * for the "SideShift / portfolio growth" lane (per spec L280).
 */
export function getFocusGroups(
  campaigns: Campaign[] = MOCK_CAMPAIGNS,
): FocusGroup[] {
  const active = campaigns.filter((c) => c.status === "active");

  // Top 3 campaign actions — highest priority + earliest due_date.
  const sortedByDue = [...active].sort((a, b) => {
    const ad = a.due_date ? new Date(a.due_date).getTime() : Infinity;
    const bd = b.due_date ? new Date(b.due_date).getTime() : Infinity;
    return ad - bd;
  });
  const top3Actions = sortedByDue.slice(0, 3).map((c) => ({
    label: c.next_action,
    meta: c.due_date ? `${c.brand} · due ${c.due_date}` : c.brand,
  }));

  // Top 3 filming/editing tasks.
  const filmEditCampaigns = active.filter((c) =>
    ["SCRIPT READY", "FILMING", "EDITING", "QA"].includes(c.current_stage),
  );
  const top3Production = filmEditCampaigns.slice(0, 3).map((c) => ({
    label: `${c.current_stage === "SCRIPT READY" ? "Film" : c.current_stage === "FILMING" ? "Continue filming" : c.current_stage === "EDITING" ? "Edit" : "QA"} ${c.brand}`,
    meta: c.required_length ? `${c.required_length} · ${c.brand}` : c.brand,
  }));
  while (top3Production.length < 3) {
    top3Production.push({
      label: top3Production.length === 0 ? "Film Ouai hair-care 3-pack" : "Edit Rare Beauty hooks",
      meta: "this week",
    });
  }

  // Top 3 follow-ups / deadlines.
  const waitingOnBrand = active.filter((c) => c.waiting_on_who === "brand");
  const top3FollowUps = waitingOnBrand.slice(0, 3).map((c) => ({
    label: `Nudge ${c.brand}`,
    meta: c.follow_up_date ? `Follow-up ${c.follow_up_date}` : "Check in this week",
  }));
  // Always include profile-growth + payment reminders per spec L280.
  if (top3FollowUps.length < 3) {
    top3FollowUps.push({
      label: "Upload 1 featured post to SideShift profile",
      meta: "Visibility booster",
    });
  }
  if (top3FollowUps.length < 3) {
    top3FollowUps.push({
      label: "Confirm Whoop payment timeline",
      meta: "Fri · admin",
    });
  }

  return [
    { title: "Top Campaign Actions",  iconKey: "send",  items: top3Actions.slice(0, 3) },
    { title: "Filming / Editing",     iconKey: "film",  items: top3Production.slice(0, 3) },
    { title: "Follow-Ups · Deadlines", iconKey: "clock", items: top3FollowUps.slice(0, 3) },
  ];
}

// ──────────────────────────────────────────────────────────────────────────
// SECTION 6: Tools / Assets Connected — 15 tools per spec L294-L312
// ──────────────────────────────────────────────────────────────────────────

export type ToolStatus = "connected" | "needs setup" | "limited" | "manual";

export interface ToolItem {
  name: string;
  icon: LucideIcon;
  status: ToolStatus;
}

export const TOOLS_CONNECTED: ToolItem[] = [
  { name: "Google Drive",        icon: Folder,        status: "connected"   },
  { name: "Gmail",               icon: Mail,          status: "connected"   },
  { name: "SideShift",           icon: Sparkles,      status: "connected"   },
  { name: "Canva",               icon: PenTool,       status: "connected"   },
  { name: "CapCut",              icon: Scissors,      status: "connected"   },
  { name: "TikTok",              icon: Video,         status: "limited"     },
  { name: "Instagram",           icon: Instagram,     status: "limited"     },
  { name: "YouTube Shorts",      icon: Youtube,       status: "needs setup" },
  { name: "Claude / ChatGPT",    icon: MessageSquare, status: "connected"   },
  { name: "Notion / Docs",       icon: StickyNote,    status: "connected"   },
  { name: "Phone Video Library", icon: Camera,        status: "manual"      },
  { name: "B-roll Library",      icon: Library,       status: "manual"      },
  { name: "Portfolio Folder",    icon: Star,          status: "connected"   },
  { name: "Script Bank",         icon: ScrollText,    status: "manual"      },
  { name: "Hook Bank",           icon: Hash,          status: "manual"      },
];

/** Map tool status → StatusChip tone. */
export const TOOL_STATUS_TONE: Record<ToolStatus, "green" | "yellow" | "orange" | "pink"> = {
  connected:     "green",
  limited:       "yellow",
  "needs setup": "orange",
  manual:        "pink",
};

// ──────────────────────────────────────────────────────────────────────────
// LAYOUT ROW 9: Recent Brand Messages
// ──────────────────────────────────────────────────────────────────────────

export interface BrandMessage {
  brand: string;
  contact: string;
  summary: string;
  when: string;
  waitingOn: "me" | "brand";
}

export function getRecentBrandMessages(
  campaigns: Campaign[] = MOCK_CAMPAIGNS,
  limit = 5,
): BrandMessage[] {
  return campaigns
    .filter((c) => c.last_message_date && c.last_message_summary)
    .sort((a, b) => (a.last_message_date! < b.last_message_date! ? 1 : -1))
    .slice(0, limit)
    .map((c) => ({
      brand: c.brand,
      contact: c.contact_name,
      summary: c.last_message_summary!,
      when: c.last_message_date!,
      waitingOn: c.waiting_on_who === "brand" ? "brand" : "me",
    }));
}

// ──────────────────────────────────────────────────────────────────────────
// LAYOUT ROW 10: Upcoming Deadlines
// ──────────────────────────────────────────────────────────────────────────

export interface UpcomingDeadline {
  brand: string;
  campaign: string;
  date: string;
  stage: CampaignStage;
  nextAction: string;
  daysOut: number;
}

export function getUpcomingDeadlines(
  campaigns: Campaign[] = MOCK_CAMPAIGNS,
  limit = 5,
): UpcomingDeadline[] {
  return campaigns
    .filter((c) => c.due_date && c.status !== "archived" && c.status !== "paid")
    .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))
    .slice(0, limit)
    .map((c) => {
      const daysOut = Math.round(
        (new Date(c.due_date!).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      );
      return {
        brand: c.brand,
        campaign: c.campaign_name,
        date: c.due_date!,
        stage: c.current_stage,
        nextAction: c.next_action,
        daysOut,
      };
    });
}

// ──────────────────────────────────────────────────────────────────────────
// LAYOUT ROW 11: Payments Snapshot
// ──────────────────────────────────────────────────────────────────────────

export interface PaymentsSnapshotData {
  totalExpected: number;
  totalReceived: number;
  pending: number;
  overdue: number;
  bonusPotential: number;
}

export function getPaymentsSnapshot(
  campaigns: Campaign[] = MOCK_CAMPAIGNS,
): PaymentsSnapshotData {
  let totalExpected = 0;
  let totalReceived = 0;
  let pending = 0;
  let overdue = 0;
  let bonusPotential = 0;

  for (const c of campaigns) {
    const value = c.total_potential_value ?? 0;
    totalExpected += value;
    if (c.payment_status === "paid") totalReceived += value;
    if (c.payment_status === "pending" || c.payment_status === "invoiced") {
      pending += value;
    }
    if (c.payment_status === "overdue") overdue += value;
    if (typeof c.bonus_potential === "number") {
      bonusPotential += c.bonus_potential;
    }
  }

  return { totalExpected, totalReceived, pending, overdue, bonusPotential };
}

// ──────────────────────────────────────────────────────────────────────────
// LAYOUT ROW 13: Portfolio-Ready Clips
// ──────────────────────────────────────────────────────────────────────────

export interface PortfolioClip {
  brand: string;
  product: string;
  stage: CampaignStage;
  thumbnailAccent: string;
  status: "ready" | "draft";
}

export function getPortfolioReadyClips(
  campaigns: Campaign[] = MOCK_CAMPAIGNS,
  limit = 4,
): PortfolioClip[] {
  return campaigns
    .filter((c) =>
      ["EDITING", "QA", "SUBMITTED", "ACCEPTED", "POSTED"].includes(
        c.current_stage,
      ),
    )
    .slice(0, limit)
    .map((c) => ({
      brand: c.brand,
      product: c.product,
      stage: c.current_stage,
      thumbnailAccent: ["#FFB6D5", "#C8A4FF", "#FFC29A", "#9D6BFF"][
        Math.abs(c.brand.charCodeAt(0)) % 4
      ],
      status:
        c.current_stage === "POSTED" || c.current_stage === "ACCEPTED"
          ? "ready"
          : "draft",
    }));
}
