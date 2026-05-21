import { Header } from '@/components/ui/header';
import { FileText } from 'lucide-react';

export const metadata = { title: 'Templates · UGC | Campaign HQ' };

export default function TemplatesPage() {
  return (
    <>
      <Header pageEyebrow="Templates" pageTitle="Reusable scripts + replies." />
      <div className="px-7 md:px-12 -mt-8 pb-20">
        <div className="rise rise-2 rounded-3xl bg-white p-10 shadow-card ring-1 ring-cloud-100 max-w-3xl">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cloud-soft text-cloud-700 ring-1 ring-cloud-100">
            <FileText className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-display text-[22px] font-medium tracking-tight text-ink-900">Coming soon</h2>
          <p className="mt-2 text-[14px] text-ink-600 max-w-xl">
            Outreach replies, SOW pricing tables, script frameworks, and hook patterns — all in one place.
          </p>
        </div>
      </div>
    </>
  );
}
