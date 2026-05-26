// A.14p P2 — /sow-breakdown/parse · standalone route hosting the SOW parser UI.
//
// HR-2 PRESERVE: chrome stays consistent with /sow-breakdown (PageHeader + main bg),
//                no new layout, no API routes.
// HR-21-revised: skills cited in SowParser component header.
// HR-30: TL;DR + Julz-action rendered inline before the parser drawer trigger.

import { PageHeader } from '@/components/ui';
import { SowParser } from '@/components/sow-breakdown/SowParser';
import { ConceptGenButton } from '@/components/sow-breakdown/ConceptGenButton';

export const metadata = {
  title: 'Parse SOW · UGC | Campaign HQ',
  description:
    'Paste raw SOW text, copy a local CLI command, and Claude writes the structured 03-sow-breakdown.md back to your campaign folder.',
};

export default function ParseSowPage() {
  return (
    <>
      <PageHeader
        eyebrow="Stage 3 · Extract SOW · Localhost CLI"
        title="Parse SOW into Structured Fields"
        subtitle="Brand sends raw SOW text → paste it here → copy command → script calls Claude locally and writes the canonical 3-column table to your campaign folder."
      />

      <section className="mx-auto w-full max-w-5xl px-6 pb-16 pt-8">
        {/* HR-30: TL;DR + what Julz needs to do right now, above the fold */}
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-emerald-500/20 bg-emerald-50/60 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Bottom line
            </p>
            <p className="mt-2 text-sm leading-6 text-ink-900">
              gh-pages can't call Anthropic server-side, so this page is a{' '}
              <strong className="font-semibold">UI shell</strong>: it builds the exact CLI command
              you need to run locally. The Node script does the API call, validates with Zod, and
              writes the rendered SOW breakdown back to{' '}
              <code className="font-mono text-xs">UGC/[slug]/03-sow-breakdown.md</code>.
            </p>
          </article>

          <article className="rounded-2xl border border-rose-500/20 bg-rose-50/50 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-700">
              What Julz needs to do right now
            </p>
            <ol className="mt-2 space-y-1.5 pl-4 text-sm leading-6 text-ink-900 [list-style:decimal]">
              <li>Click <em>Parse SOW</em> below.</li>
              <li>Enter slug + paste SOW text (or point at a file).</li>
              <li>
                Copy the command, run it in a terminal where{' '}
                <code className="font-mono text-xs">ANTHROPIC_API_KEY</code> is set.
              </li>
              <li>Structured 03-sow-breakdown.md lands in the campaign folder.</li>
            </ol>
          </article>
        </div>

        <div className="mt-10 flex flex-col items-start gap-6 rounded-3xl border border-ink-900/8 bg-white/70 p-8 backdrop-blur">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-iris-500">
              Launch the parser
            </p>
            <h2 className="mt-1 font-display text-2xl text-ink-900">
              Open the parser drawer
            </h2>
            <p className="mt-2 max-w-prose text-sm leading-6 text-ink-700">
              The drawer collects the campaign slug and SOW text, then generates a copy-pasteable
              command. No data leaves your browser until you run the command locally — the
              Anthropic API call happens on your machine, not the static site.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SowParser />
            <ConceptGenButton />
          </div>
          <p className="text-xs text-ink-700">
            <strong className="font-semibold text-ink-900">Sequence:</strong> Parse SOW first
            (writes <code className="font-mono text-[11px]">03-sow-breakdown.md</code>), then
            Generate concepts (reads that file + brand rules, writes{' '}
            <code className="font-mono text-[11px]">07-creative-concepts.md</code>).
          </p>
        </div>

        {/* Schema preview — meeting-analyzer style structured extraction */}
        <div className="mt-10 rounded-3xl border border-ink-900/8 bg-cloud-50 p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-700">
            Extraction schema
          </p>
          <h3 className="mt-1 font-display text-xl text-ink-900">
            What the script pulls out of every SOW
          </h3>
          <div className="mt-5 grid gap-4 text-sm md:grid-cols-2">
            <div className="rounded-2xl border border-ink-900/8 bg-white p-4">
              <p className="font-semibold text-ink-900">requirements[]</p>
              <p className="mt-1 text-xs leading-5 text-ink-700">
                key · detail · what_it_means · status — feeds the canonical 3-column table.
              </p>
            </div>
            <div className="rounded-2xl border border-ink-900/8 bg-white p-4">
              <p className="font-semibold text-ink-900">deliverables[]</p>
              <p className="mt-1 text-xs leading-5 text-ink-700">
                type · count · duration · dimensions · hooks_required
              </p>
            </div>
            <div className="rounded-2xl border border-ink-900/8 bg-white p-4">
              <p className="font-semibold text-ink-900">payment</p>
              <p className="mt-1 text-xs leading-5 text-ink-700">
                base · bonus_potential · terms_days · usage_rights
              </p>
            </div>
            <div className="rounded-2xl border border-ink-900/8 bg-white p-4">
              <p className="font-semibold text-ink-900">deadlines</p>
              <p className="mt-1 text-xs leading-5 text-ink-700">
                filming_by · submission_by · payment_by
              </p>
            </div>
            <div className="rounded-2xl border border-ink-900/8 bg-white p-4">
              <p className="font-semibold text-ink-900">do_not_say[]</p>
              <p className="mt-1 text-xs leading-5 text-ink-700">
                Restricted phrases / forbidden positioning (e.g., "cheating", "guaranteed").
              </p>
            </div>
            <div className="rounded-2xl border border-ink-900/8 bg-white p-4">
              <p className="font-semibold text-ink-900">ftc_required · brand_portal_url</p>
              <p className="mt-1 text-xs leading-5 text-ink-700">
                Disclosure obligations + brand-side intake link, if present.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
