// Phase A.14p P3 · A14P-P3-UNIFIED-INBOX — NEW unified brand inbox UI shell.
// Phase A.14s S3 · A14S-S3-STALE-FLAGGER — adds StaleBadge severity flags +
//   urgency filter pills (rendered inside UnifiedBrandInbox client component).
//   Page-level entry list is now passed through unchanged; client component
//   handles staleness scoring + urgency-aware sort.
//
// PURPOSE
//   ONE inbox surface that merges 3 brand-relevant data streams into a single
//   chronologically-sorted queue Julz can triage in one pass:
//     1. SideShift creator-chat conversations  (data/sideshift-messages.jsonl)
//     2. Gmail UGC-Brand-Outreach label        (data/gmail-brand-inbox.jsonl)
//     3. Linear UGC Pipeline project comments  (data/linear-pipeline-comments.jsonl)
//
//   This is a STATIC server component — it reads the 3 JSONL files from disk
//   at build time (gh-pages compat per HR-2: no API routes, no server actions).
//   Polling scripts at scripts/poll-gmail-brand.mjs + scripts/poll-linear-pipeline.mjs
//   (run locally via npm or Windows Task Scheduler — see _meta/dashboard-spec/
//   06-a14p-unified-inbox-cron.md) write the JSONLs. The JSONLs are committed
//   to the repo, and the next gh-pages deploy bakes them into the UI bundle.
//
// HONESTY (HR-10)
//   If a JSONL file is missing OR has no entries beyond its header line, the
//   page renders a calm "no data yet — run npm run poll-<source> locally"
//   badge per source rather than fabricating mock rows.
//
// SKILLS APPLIED (HR-21 audit trail)
//   - frontend-design          → editorial inbox layout, source-color badging
//   - vercel:nextjs            → server component + static export readiness
//   - refactoring-ui           → hierarchy: source-badge → brand → preview → ts
//   - ux-heuristics            → visibility of system status (source counts)
//   - microinteractions        → hover lift, source-badge tone-as-feedback
//   - superpowers:verification-before-completion (build PASS)
//
// HR-2 PRESERVE: existing /brand-responses route untouched. This is a NEW
// surface alongside it for the "all 3 streams in one view" use case.

import fs from "node:fs";
import path from "node:path";
import { Header } from "@/components/ui/header";
import { PageHeader } from "@/components/ui";
import { ReadOnlyMirrorBadge } from "@/components/ui/read-only-mirror-badge";
import { UnifiedBrandInbox } from "@/components/inbox/UnifiedBrandInbox";
import type { UnifiedEntry, UnifiedSource } from "@/components/inbox/UnifiedBrandInbox";

export const metadata = {
  title: "Unified Brand Inbox · UGC | Campaign HQ",
  description:
    "Every brand-relevant message across SideShift, Gmail, and Linear Pipeline — sorted by what arrived most recently.",
};

type SourceStatus = {
  source: UnifiedSource;
  fileName: string;
  fileExists: boolean;
  entriesFound: number;
  errorMsg: string | null;
};

// Try to parse a JSONL line into an entry. Tolerant — schema header lines
// (which carry a `schema_version` key but no `id`) are intentionally skipped
// rather than crashing the build.
function tryParseLine(
  line: string,
  source: UnifiedSource
): UnifiedEntry | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    return null;
  }
  // Header line — skip
  if (obj && (obj.schema_version || obj.note) && !obj.id) return null;

  // Source-specific normalizer → UnifiedEntry
  if (source === "sideshift") {
    const brand = String(obj.brand || obj.raw_brand || "").trim();
    const preview = String(obj.preview || obj.last_message_preview || "").trim();
    const ts = String(obj.ts || obj.last_message_ts || "").trim();
    if (!brand || !ts) return null;
    return {
      id: `sideshift:${String(obj.id || "")}`,
      source: "sideshift",
      brand,
      subject: String(obj.campaign_title || "SideShift conversation"),
      preview,
      ts,
      url: String(obj.thread_url || "https://app.sideshift.app/chat"),
      direction:
        (obj.direction as "inbound" | "outbound" | "unknown") || "unknown",
      meta: {
        status: String(obj.status || ""),
        draft_ready: Boolean(obj.draft_ready),
      },
    };
  }
  if (source === "gmail") {
    const sender = String(obj.sender || obj.from || "").trim();
    const subject = String(obj.subject || "(no subject)").trim();
    const snippet = String(obj.snippet || obj.body || "").trim();
    const ts = String(obj.ts || obj.timestamp || "").trim();
    if (!sender || !ts) return null;
    return {
      id: `gmail:${String(obj.id || "")}`,
      source: "gmail",
      brand: sender,
      subject,
      preview: snippet.slice(0, 220),
      ts,
      url: String(obj.thread_url || "https://mail.google.com/"),
      direction: "inbound",
      meta: {
        sender_email: String(obj.sender_email || ""),
        labels: Array.isArray(obj.labels) ? (obj.labels as string[]) : [],
      },
    };
  }
  if (source === "linear") {
    const commenter = String(obj.commenter || "").trim();
    const issueTitle = String(obj.issue_title || "Pipeline comment").trim();
    const body = String(obj.body || "").trim();
    const ts = String(obj.ts || "").trim();
    if (!commenter || !ts) return null;
    return {
      id: `linear:${String(obj.id || "")}`,
      source: "linear",
      brand: issueTitle,
      subject: `${commenter} commented`,
      preview: body.slice(0, 220),
      ts,
      url: String(obj.issue_url || "https://linear.app/"),
      direction: "inbound",
      meta: { commenter },
    };
  }
  return null;
}

function readSource(
  source: UnifiedSource,
  fileName: string
): { entries: UnifiedEntry[]; status: SourceStatus } {
  const filePath = path.join(process.cwd(), "data", fileName);
  const status: SourceStatus = {
    source,
    fileName,
    fileExists: false,
    entriesFound: 0,
    errorMsg: null,
  };
  let entries: UnifiedEntry[] = [];
  try {
    if (!fs.existsSync(filePath)) {
      return { entries, status };
    }
    status.fileExists = true;
    const raw = fs.readFileSync(filePath, "utf8");
    for (const line of raw.split("\n")) {
      const entry = tryParseLine(line, source);
      if (entry) entries.push(entry);
    }
    status.entriesFound = entries.length;
  } catch (err) {
    status.errorMsg = err instanceof Error ? err.message : String(err);
  }
  return { entries, status };
}

export default function UnifiedInboxPage() {
  const sideshift = readSource("sideshift", "sideshift-messages.jsonl");
  const gmail = readSource("gmail", "gmail-brand-inbox.jsonl");
  const linear = readSource("linear", "linear-pipeline-comments.jsonl");

  const allEntries = [...sideshift.entries, ...gmail.entries, ...linear.entries]
    // sorted DESC by ts (most recent first)
    .sort((a, b) => {
      const tA = Date.parse(a.ts) || 0;
      const tB = Date.parse(b.ts) || 0;
      return tB - tA;
    });

  const sourceStatuses: SourceStatus[] = [
    sideshift.status,
    gmail.status,
    linear.status,
  ];

  return (
    <>
      <Header />
      <PageHeader
        variant="hero"
        eyebrow="Inbox · Unified · Live"
        title="Unified Brand Inbox"
        subtitle="Every brand-relevant message across SideShift, Gmail label, and Linear Pipeline — sorted newest-first so one pass clears the day."
        actions={<ReadOnlyMirrorBadge />}
        className="pb-28 lg:pb-32"
      />

      <section className="-mt-20 px-7 md:px-12 pb-16">
        <UnifiedBrandInbox
          entries={allEntries}
          sourceStatuses={sourceStatuses}
        />
      </section>
    </>
  );
}
