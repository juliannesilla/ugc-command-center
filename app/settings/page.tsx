// Phase A.14l Wave 1 · A14L-L3-F /settings polish (additive — coming-soon stub)
// HR-21 CITE = INVOKE: refactoring-ui, microinteractions, ios-hig-design,
// top-design, frontend-design, superpowers:verification-before-completion.

import { Header } from '@/components/ui/header';
import { Settings, Sparkles } from 'lucide-react';

export const metadata = { title: 'Settings · UGC | Campaign HQ' };

export default function SettingsPage() {
  return (
    <>
      <Header pageEyebrow="Settings" pageTitle="Account + integrations." />
      <div className="px-7 md:px-12 -mt-8 pb-20">
        <div className="rise rise-2 group relative overflow-hidden rounded-3xl bg-white p-10 shadow-card ring-1 ring-cloud-100 max-w-3xl transition-all duration-300 hover:shadow-glow hover:ring-cloud-200 hover:-translate-y-0.5">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br from-cloud-200/40 via-peach-200/30 to-transparent blur-2xl transition-opacity duration-500 group-hover:opacity-80 opacity-60"
          />
          <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-cloud-soft text-cloud-700 ring-1 ring-cloud-100 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6">
            <Settings className="h-5 w-5" />
          </span>
          <p className="stat-label relative mt-4 inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            In the works
          </p>
          <h2 className="section-title relative mt-1">
            Coming soon
          </h2>
          <p className="section-subtitle relative mt-2 max-w-xl">
            Connected tools, brand voice presets, default usage-rights terms, and notification preferences.
          </p>
        </div>
      </div>
    </>
  );
}
