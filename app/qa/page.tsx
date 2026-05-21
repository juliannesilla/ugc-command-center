/**
 * QA — cross-campaign quality assurance dashboard.
 *
 * Spec: `01-initial-dashboard-prompt.md` "NAVIGATION / VIEWS" → "QA".
 * Owned by E15 (Phase A.14e Wave 6).
 */

import { ShieldCheck } from "lucide-react";
import { Header } from "@/components/ui/header";
import { MOCK_CAMPAIGNS } from "@/lib/mock-data/campaigns";
import { QAMatrix } from "@/components/qa/QAMatrix";

export const metadata = {
  title: "QA · UGC | Campaign HQ",
  description: "10-category QA across every active campaign.",
};

export default function QAPage() {
  const active = MOCK_CAMPAIGNS.filter((c) => c.status !== "archived");

  return (
    <>
      <Header
        pageEyebrow="Cross-Campaign QA"
        pageTitle="Quality checkpoints across every deliverable"
      />

      <section className="px-7 md:px-12 -mt-8 pb-20 max-w-7xl mx-auto">
        <div className="mb-4 flex items-center gap-2 text-xs text-ink-600">
          <ShieldCheck className="h-4 w-4 text-iris-500" />
          <span>
            <strong>{active.length}</strong> active campaign{active.length === 1 ? "" : "s"} ·
            mock QA derived from current stage + readiness score
          </span>
        </div>
        <QAMatrix campaigns={active} />
      </section>
    </>
  );
}
