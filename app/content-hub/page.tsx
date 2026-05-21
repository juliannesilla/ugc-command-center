// Phase A.14l Wave 1 · A14L-L3-F /content-hub polish (additive — coming-soon stub)
// Card grid hover transitions per brief. HR-21 CITE = INVOKE: refactoring-ui,
// microinteractions, ios-hig-design, top-design, frontend-design,
// superpowers:verification-before-completion.

import { Header } from '@/components/ui/header';
import { Sparkles, Film, FileVideo, Layers } from 'lucide-react';

export const metadata = { title: 'Content Hub · UGC | Campaign HQ' };

const previewCards = [
  {
    icon: Film,
    label: 'Scripts',
    desc: 'Hook · body · CTA frameworks',
  },
  {
    icon: FileVideo,
    label: 'B-roll',
    desc: 'Tagged + searchable clip vault',
  },
  {
    icon: Layers,
    label: 'Final cuts',
    desc: 'Approved deliverables by campaign',
  },
];

export default function ContentHubPage() {
  return (
    <>
      <Header pageEyebrow="Content Hub" pageTitle="Every script, every cut." />
      <div className="px-7 md:px-12 -mt-8 pb-20 space-y-6">
        <div className="rise rise-2 group relative overflow-hidden rounded-3xl bg-white p-10 shadow-card ring-1 ring-cloud-100 max-w-3xl transition-all duration-300 hover:shadow-glow hover:ring-cloud-200 hover:-translate-y-0.5">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br from-iris-200/50 via-peach-200/30 to-transparent blur-2xl transition-opacity duration-500 group-hover:opacity-80 opacity-60"
          />
          <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-cloud-soft text-cloud-700 ring-1 ring-cloud-100 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
            <Sparkles className="h-5 w-5" />
          </span>
          <p className="relative mt-4 text-[10.5px] uppercase tracking-[0.18em] text-ink-500 font-medium inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            In the works
          </p>
          <h2 className="relative mt-1 font-display text-[22px] font-medium tracking-tight text-ink-900">
            Coming soon
          </h2>
          <p className="relative mt-2 text-[14px] text-ink-600 max-w-xl leading-relaxed">
            Scripts, hooks, b-roll, and final cuts — organized by campaign with cross-referenced reusable assets.
          </p>
        </div>

        {/* Preview grid — refactoring-ui §7 varied composition, hover transitions per brief */}
        <div
          aria-hidden
          className="rise rise-3 grid gap-4 sm:grid-cols-3 max-w-3xl opacity-90"
        >
          {previewCards.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="group relative rounded-2xl bg-white/80 backdrop-blur-sm p-5 shadow-card ring-1 ring-cloud-100/70 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-glow hover:ring-cloud-200 hover:bg-white cursor-default"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-cloud-soft text-cloud-700 ring-1 ring-cloud-100 transition-transform duration-300 group-hover:scale-110">
                <Icon className="h-4 w-4" />
              </span>
              <p className="mt-3 font-display text-[15px] font-medium text-ink-900">
                {label}
              </p>
              <p className="mt-1 text-[12px] text-ink-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
