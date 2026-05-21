import { Header } from '@/components/ui/header';
import { Settings } from 'lucide-react';

export const metadata = { title: 'Settings · UGC | Campaign HQ' };

export default function SettingsPage() {
  return (
    <>
      <Header pageEyebrow="Settings" pageTitle="Account + integrations." />
      <div className="px-7 md:px-12 -mt-8 pb-20">
        <div className="rise rise-2 rounded-3xl bg-white p-10 shadow-card ring-1 ring-cloud-100 max-w-3xl">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cloud-soft text-cloud-700 ring-1 ring-cloud-100">
            <Settings className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-display text-2xl text-ink-900">Coming soon</h2>
          <p className="mt-2 text-[14px] text-ink-600 max-w-xl">
            Connected tools, brand voice presets, default usage-rights terms, and notification preferences.
          </p>
        </div>
      </div>
    </>
  );
}
