// Implements: A.14p P1 — Campaign Creation Wizard UI shell.
// Source: A.14o O8 punted with REAL gh-pages blocker (no server-side filesystem).
// A.14p workaround pattern (per Julz approval): UI form on gh-pages renders fully
// + on submit shows copy-to-clipboard CLI command + Node localhost script does
// the actual folder copy + Linear issue creation + JSONL write.
//
// HR-2 PRESERVE: chrome consistent with other routes (Header + PageHeader hero
// variant per A.14n primitives). No server actions, no API routes — static-export
// compatible. All form state client-side; real work runs in scripts/new-campaign.mjs.
import { Header } from '@/components/ui/header';
import { PageHeader } from '@/components/ui';
import { CreateCampaignWizard } from '@/components/campaigns/CreateCampaignWizard';

export const metadata = {
  title: 'Create New Campaign · UGC | Campaign HQ',
  description:
    'Spin up a new brand campaign from the canonical 13-stage template — folder, Linear issue, and dashboard entry in one localhost command.',
};

export default function NewCampaignPage() {
  return (
    <main className="min-h-screen bg-cloud-soft">
      <Header />
      <PageHeader
        variant="standard"
        eyebrow="Campaigns · New"
        title="Create New Campaign"
        subtitle="Fill the form, copy the generated command, run it locally. Template folder + Linear issue + dashboard row drop in one shot."
      />
      <section className="px-7 md:px-12 pb-20 max-w-5xl">
        <CreateCampaignWizard />
      </section>
    </main>
  );
}
