// Brand Responses — REAL canonical-derived conversations.
//
// Phase 2026-06-02 (data-layer repoint): replaced the 38 fabricated brand
// conversations (Hunch/Wand/NorthGrid/Fernweh/CoastFM/… — none were Julz's
// real brands) with rows derived from REAL data at build time:
//   - data/brands-canonical.jsonl (DARWIN merge) — brand, contact, status,
//     awaiting_julz_action, last_msg_at, fit_score, notes. PRIMARY.
//   - data/sideshift-messages.jsonl (31 real SideShift threads) — real
//     message_text / last_message_preview / direction for thread + preview.
//
// HR-49 NO MOCK DATA · HR-10 ACCESS HONESTY: every conversation traces to a
// canonical brand_id. Where a field has no real source (e.g. call slots, exact
// contact email) we emit honest-empty (undefined / []) rather than fabricate.
//
// Exported names + TypeScript shapes are UNCHANGED so all importing routes +
// components (app/brand-responses/**, components/brand-responses/**,
// app/scheduling) keep compiling.

import canonicalRaw from "@/data/brands-canonical.json";
import sideshiftRaw from "@/data/sideshift-messages.json";

export type BrandStatus =
  | "new"
  | "brief-requested"
  | "call-scheduled"
  | "in-progress"
  | "awaiting-reply"
  | "archived";

export type BrandConversation = {
  id: string;
  brand: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  logoSeed: string; // for generated avatar bg
  lastMessage: string;
  lastMessageAt: string; // human readable
  receivedAt: string; // ISO
  responseDeadline: string; // human readable like "Today 4h left"
  deadlineHoursLeft: number;
  status: BrandStatus;
  brandFit: 1 | 2 | 3 | 4 | 5;
  unread: boolean;
  callRequested: boolean;
  callSlots?: string[];
  notes?: string;
  nextAction: string;
  thread: {
    from: "brand" | "julianne";
    at: string;
    body: string;
  }[];
};

// ───────────────────────────────────────────────────────────────────────────
// Canonical row subset (fields we map). Full schema: brands-canonical-summary.md
// ───────────────────────────────────────────────────────────────────────────

interface CanonicalContact {
  name: string | null;
  email: string | null;
  role: string | null;
  channel: string | null;
}

interface CanonicalRow {
  brand_id: string;
  brand_name_canonical: string;
  status: string;
  dashboard_visible: boolean;
  key_contact: CanonicalContact;
  last_msg_at: string | null;
  last_msg_direction: string | null;
  awaiting_julz: boolean;
  awaiting_julz_action: string | null;
  awaiting_julz_since: string | null;
  urgency: "P0" | "P1" | "P2" | "P3";
  fit_score?: number | null;
  notes: string;
}

interface SideshiftMsg {
  id: string;
  thread_id: string;
  brand: string;
  message_text?: string;
  last_message_preview?: string;
  ts: string;
  direction: string; // "inbound" | "outbound"
  status?: string;
  thread_url?: string;
}

function loadCanonical(): CanonicalRow[] {
  return (canonicalRaw as unknown[]).filter(
    (o): o is CanonicalRow =>
      typeof o === "object" &&
      o !== null &&
      typeof (o as { brand_id?: unknown }).brand_id === "string",
  );
}

function loadSideshift(): SideshiftMsg[] {
  return (sideshiftRaw as unknown[]).filter(
    (o): o is SideshiftMsg =>
      typeof o === "object" &&
      o !== null &&
      typeof (o as { thread_id?: unknown }).thread_id === "string" &&
      typeof (o as { brand?: unknown }).brand === "string",
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Field mappers
// ───────────────────────────────────────────────────────────────────────────

/** canonical.status → BrandConversation.status (Brand Responses tab buckets). */
function mapStatus(row: CanonicalRow): BrandStatus {
  switch (row.status) {
    case "intake":
      return "new";
    case "in_negotiation":
      // Negotiation w/ a booked call surfaces as call-scheduled when the
      // action mentions a call; otherwise it's an active (in-progress) thread.
      return /call|discovery|meet|zoom|schedule/i.test(row.awaiting_julz_action ?? "")
        ? "call-scheduled"
        : "in-progress";
    case "contract_pending_julz":
      return "brief-requested";
    case "awaiting_julz":
      return "new";
    case "signed":
      return "in-progress";
    case "submitted":
    case "paid":
      return "in-progress";
    case "closed":
      return "archived";
    default:
      return "new";
  }
}

/** canonical.fit_score (0-100 or 1-5) → 1..5 star bucket. */
function mapBrandFit(row: CanonicalRow): 1 | 2 | 3 | 4 | 5 {
  const raw = typeof row.fit_score === "number" ? row.fit_score : null;
  if (raw == null) return 3; // honest neutral — no score yet
  // Some sources store 0-100, some 1-10, some 1-5. Normalize to 1-5.
  let n: number;
  if (raw > 10) n = Math.round(raw / 20); // 0-100 → 1-5
  else if (raw > 5) n = Math.round(raw / 2); // 1-10 → 1-5
  else n = Math.round(raw); // already 1-5
  return Math.min(5, Math.max(1, n)) as 1 | 2 | 3 | 4 | 5;
}

/** Hours until a response is "due": P0 = today, P1 = ~2 days, else ~5 days. */
function deadlineHours(row: CanonicalRow): number {
  if (!row.awaiting_julz) return 0;
  if (row.urgency === "P0") return 4;
  if (row.urgency === "P1") return 48;
  return 120;
}

function deadlineLabel(row: CanonicalRow): string {
  if (!row.awaiting_julz) return "No response needed";
  const h = deadlineHours(row);
  if (h <= 24) return `Today ${h}h left`;
  const days = Math.round(h / 24);
  return `${days}d left`;
}

/** ISO datetime from canonical date-only string (anchor to midnight UTC). */
function toIso(date: string | null): string {
  if (!date) return new Date().toISOString();
  return date.length > 10 ? date : `${date}T12:00:00`;
}

function relLabel(date: string | null): string {
  if (!date) return "—";
  const then = new Date(toIso(date));
  const days = Math.floor((Date.now() - then.getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.slice(0, 10);
}

/** Normalize a brand name for fuzzy join (lowercase, strip non-alphanum). */
function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Build a brand-name → latest SideShift message index once.
const _sideshiftByBrand: Map<string, SideshiftMsg> = (() => {
  const m = new Map<string, SideshiftMsg>();
  for (const msg of loadSideshift()) {
    const key = norm(msg.brand);
    const existing = m.get(key);
    if (!existing || msg.ts > existing.ts) m.set(key, msg);
  }
  return m;
})();

/** Pull the real SideShift preview/body for a brand, if we have one. */
function sideshiftFor(row: CanonicalRow): SideshiftMsg | undefined {
  return (
    _sideshiftByBrand.get(norm(row.brand_name_canonical)) ??
    _sideshiftByBrand.get(norm(row.brand_id))
  );
}

/** Clean a SideShift preview ("You: …" prefix denotes outbound). */
function cleanPreview(text: string | undefined): string {
  if (!text) return "";
  return text.replace(/^You:\s*/i, "").replace(/\s+/g, " ").trim();
}

// ───────────────────────────────────────────────────────────────────────────
// Top-level mapper — canonical row → BrandConversation
// ───────────────────────────────────────────────────────────────────────────

function rowToConversation(row: CanonicalRow): BrandConversation {
  const ss = sideshiftFor(row);
  const contactName = row.key_contact.name ?? "Brand team";
  const lastInbound = row.last_msg_direction === "brand";

  // Real message body: prefer SideShift message_text, else the canonical
  // awaiting action / notes. Honest — no invented dialogue.
  const ssBody = cleanPreview(ss?.message_text ?? ss?.last_message_preview);
  const lastMessage =
    ssBody ||
    row.awaiting_julz_action ||
    (row.notes ? row.notes.split(".")[0] : "") ||
    "Conversation in progress";

  // Thread: reconstruct from the single real last message we have. We do NOT
  // fabricate multi-turn dialogue (HR-10) — one real entry beats five fake ones.
  const thread: BrandConversation["thread"] = [];
  if (ssBody) {
    thread.push({
      from: ss?.direction === "outbound" ? "julianne" : "brand",
      at: relLabel(ss?.ts ?? row.last_msg_at),
      body: ssBody,
    });
  } else if (lastMessage) {
    thread.push({
      from: lastInbound ? "brand" : "julianne",
      at: relLabel(row.last_msg_at),
      body: lastMessage,
    });
  }

  const callRequested = /call|discovery|meet|zoom|schedule/i.test(
    row.awaiting_julz_action ?? "",
  );

  return {
    id: row.brand_id,
    brand: row.brand_name_canonical,
    contactName,
    contactRole: row.key_contact.role ?? "Brand contact",
    contactEmail: row.key_contact.email ?? "",
    logoSeed: row.brand_name_canonical.charAt(0).toLowerCase(),
    lastMessage,
    lastMessageAt: relLabel(row.last_msg_at),
    receivedAt: toIso(row.last_msg_at),
    responseDeadline: deadlineLabel(row),
    deadlineHoursLeft: deadlineHours(row),
    status: mapStatus(row),
    brandFit: mapBrandFit(row),
    // Unread = brand sent the last message and Julz still owes a reply.
    unread: lastInbound && row.awaiting_julz,
    callRequested,
    // No real call-slot source — honest-empty, not fabricated times.
    callSlots: callRequested ? [] : undefined,
    notes: row.notes || undefined,
    nextAction: row.awaiting_julz_action ?? "Awaiting brand reply",
    thread,
  };
}

/**
 * REAL brand conversations, derived from canonical at build time.
 * dashboard_visible rows only — sorted most-recent first.
 */
export const BRAND_CONVERSATIONS: BrandConversation[] = loadCanonical()
  .filter((r) => r.dashboard_visible === true)
  .sort((a, b) => (b.last_msg_at ?? "").localeCompare(a.last_msg_at ?? ""))
  .map(rowToConversation);

// Spec tabs (mockup #2): counts now derive from REAL conversations.
export type TabKey =
  | "all"
  | "unread"
  | "response-needed"
  | "drafts"
  | "awaiting-reply"
  | "call-requested"
  | "archived";

// Filter predicate per tab — keeps table behavior consistent w/ tab counts
export function filterByTab(conv: BrandConversation, tab: TabKey): boolean {
  switch (tab) {
    case "all":
      return true;
    case "unread":
      return conv.unread;
    case "response-needed":
      return (
        conv.status !== "archived" &&
        conv.status !== "in-progress" &&
        conv.status !== "awaiting-reply"
      );
    case "drafts":
      return conv.status === "in-progress";
    case "awaiting-reply":
      return conv.status === "awaiting-reply";
    case "call-requested":
      return conv.callRequested;
    case "archived":
      return conv.status === "archived";
  }
}

/** Count helper — keeps STATUS_TABS + STAT_CARDS honest against real rows. */
function _countTab(tab: TabKey): number {
  return BRAND_CONVERSATIONS.filter((c) => filterByTab(c, tab)).length;
}

export const STATUS_TABS: { key: TabKey; label: string; count: number }[] = [
  { key: "all", label: "All", count: _countTab("all") },
  { key: "unread", label: "Unread", count: _countTab("unread") },
  { key: "response-needed", label: "Response Needed", count: _countTab("response-needed") },
  { key: "drafts", label: "Drafts", count: _countTab("drafts") },
  { key: "awaiting-reply", label: "Awaiting Reply", count: _countTab("awaiting-reply") },
  { key: "call-requested", label: "Call Requested", count: _countTab("call-requested") },
  { key: "archived", label: "Archived", count: _countTab("archived") },
];

export const STAT_CARDS: {
  label: string;
  value: number;
  delta: number; // vs yesterday — no historical snapshot source, honest 0
  accent: "cloud" | "iris" | "peach" | "ink";
  tabKey: TabKey;
}[] = [
  { label: "NEW MESSAGES", value: _countTab("unread"), delta: 0, accent: "cloud", tabKey: "unread" },
  { label: "RESPONSE NEEDED", value: _countTab("response-needed"), delta: 0, accent: "peach", tabKey: "response-needed" },
  { label: "DRAFTS IN PROGRESS", value: _countTab("drafts"), delta: 0, accent: "iris", tabKey: "drafts" },
  { label: "AWAITING REPLY", value: _countTab("awaiting-reply"), delta: 0, accent: "cloud", tabKey: "awaiting-reply" },
  { label: "CALL REQUESTED", value: _countTab("call-requested"), delta: 0, accent: "peach", tabKey: "call-requested" },
  { label: "PARTNERSHIPS", value: _countTab("all"), delta: 0, accent: "iris", tabKey: "all" },
];

// Variables auto-substituted in reply composer
export const COMPOSER_VARIABLES = [
  { key: "brand_name", label: "Brand name" },
  { key: "contact_first_name", label: "Contact first name" },
  { key: "campaign", label: "Campaign" },
  { key: "deliverable", label: "Deliverable" },
  { key: "rate", label: "Rate" },
  { key: "timeline", label: "Timeline" },
] as const;

// Link to canonical templates at OneDrive/Desktop/UGC/_meta/09-outreach-templates.md (12 templates post W-2-A)
export const REPLY_TEMPLATES = [
  {
    id: "intake",
    label: "Intake — Brand made first contact, no details",
    body:
      "Hi {{contactName}} — thanks for reaching out about a possible partnership! To put together the right scope and pricing for you, could you share:\n\n• Creative brief\n• Required messaging\n• Deliverables (formats + counts)\n• Usage / posting expectations\n• Timeline\n• Payment structure\n\nOnce I have that, I'll send a tailored proposal within 24h.\n\nRespectfully,\nJulianne Silla\n📧: julianne.mktg@gmail.com\n🔗: www.juliannesilla.com",
  },
  {
    id: "call-propose",
    label: "Propose call slots",
    body:
      "Happy to hop on a quick call! Here are 3 times that work on my end:\n\n• {{slot1}}\n• {{slot2}}\n• {{slot3}}\n\nLet me know what works and I'll send a calendar invite.\n\nRespectfully,\nJulianne Silla",
  },
  {
    id: "rate-quote",
    label: "Rate quote (Tier 2)",
    body:
      "Based on the brief, here's where I land for {{brand}}:\n\n• 2 x 30s UGC (organic usage, 30 days): {{rate}}\n• Add: paid usage 60 days: +30%\n• Add: exclusivity in category: +20%\n\nHappy to adjust scope if needed. Let me know what works.\n\nRespectfully,\nJulianne Silla",
  },
  {
    id: "polite-decline",
    label: "Polite decline (no equity / low budget)",
    body:
      "Thanks so much for thinking of me, {{contactName}} — really appreciate the offer. Unfortunately I'm not currently taking on equity-only or barter partnerships. If your team revisits paid budget later this year, I'd be glad to chat then.\n\nWishing you the best with the launch.\n\nRespectfully,\nJulianne Silla",
  },
  {
    id: "follow-up",
    label: "Follow-up — recover after delay",
    body:
      "Hi {{contact_first_name}} — apologies for the slow reply, your last message got buried on my end. Still very interested in exploring this with {{brand_name}}. Are you still looking to move forward this week? If yes, I can have a proposal in your inbox tomorrow.\n\nRespectfully,\nJulianne Silla",
  },
  {
    id: "contract-confirm",
    label: "Contract confirm — signed + next steps",
    body:
      "Hi {{contact_first_name}} — contract signed and returned. Locking in {{deliverable}} for {{campaign}}. I'll send a rough cut by {{timeline}}. Excited to make this one with {{brand_name}}.\n\nRespectfully,\nJulianne Silla",
  },
  {
    id: "usage-extension",
    label: "Usage extension quote",
    body:
      "Hi {{contact_first_name}} — happy to extend usage on the {{campaign}} assets. Standard extension is +30% of original rate for an additional 60 days. Let me know if you want to lock that in.\n\nRespectfully,\nJulianne Silla",
  },
  {
    id: "rev-revisions",
    label: "Revision rounds — within scope",
    body:
      "Hi {{contact_first_name}} — got the notes. This round is within the included 2 revisions, so no add'l cost. Turnaround 48h. Will resend by {{timeline}}.\n\nRespectfully,\nJulianne Silla",
  },
  {
    id: "rev-out-of-scope",
    label: "Revision rounds — out of scope quote",
    body:
      "Hi {{contact_first_name}} — happy to take these on, though they push us past the 2 included revisions. Out-of-scope revision blocks are $250/round. Want me to proceed?\n\nRespectfully,\nJulianne Silla",
  },
  {
    id: "invoice-send",
    label: "Invoice send + payment terms",
    body:
      "Hi {{contact_first_name}} — invoice attached for the {{campaign}} project. Total: {{rate}}, net-30 from today. Thanks again for the partnership with {{brand_name}}.\n\nRespectfully,\nJulianne Silla",
  },
  {
    id: "wrap-up-recap",
    label: "Wrap-up recap with analytics",
    body:
      "Hi {{contact_first_name}} — closing out the {{campaign}} campaign. Final analytics + asset links attached. Loved working on this one with {{brand_name}} — would love to chat about Q3 if it makes sense.\n\nRespectfully,\nJulianne Silla",
  },
];
