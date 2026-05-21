import { StatCardWithDelta } from '@/components/analytics/StatCardWithDelta';
import { QuickCapture } from '@/components/brain-dump/QuickCapture';
import { SmartIdeaChips } from '@/components/brain-dump/SmartIdeaChips';
import { IdeaBankBoard } from '@/components/brain-dump/IdeaBankBoard';
import { BestNewIdeaCard } from '@/components/brain-dump/BestNewIdeaCard';
import { IdeasToScriptList } from '@/components/brain-dump/IdeasToScriptList';
import { PatternsWorthReusing } from '@/components/brain-dump/PatternsWorthReusing';
import { ContentPatternLibrary } from '@/components/brain-dump/ContentPatternLibrary';
import { ReusablePhrasesVault } from '@/components/brain-dump/ReusablePhrasesVault';
import { IdeaToScriptConverter } from '@/components/brain-dump/IdeaToScriptConverter';
import { BRAIN_STATS } from '@/lib/mock-data/brain-dump';
import { Dices, Lightbulb } from 'lucide-react';

export const metadata = {
  title: "Brain Dump · UGC | Campaign HQ",
  description: 'Capture hooks, angles, and reusable patterns before they slip away.',
};

export default function BrainDumpPage() {
  return (
    <main className="min-h-screen bg-cloud-soft">
      {/* Header */}
      <section className="header-cloud px-7 md:px-12 pt-10 pb-12 text-white">
        <div className="rise rise-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
            Brain Dump
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold mt-1">
            Hook Bank
          </h1>
          <p className="text-sm text-white/85 mt-1 max-w-xl">
            Catch ideas in 5 seconds — turn them into scripts later.
          </p>
        </div>
      </section>

      <section className="px-7 md:px-12 -mt-8 pb-20 flex flex-col gap-6 lg:gap-8">
        {/* Top stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 rise rise-1">
          {BRAIN_STATS.map((s) => (
            <StatCardWithDelta
              key={s.id}
              label={s.label}
              value={s.value}
              delta={s.delta}
              deltaTone="positive"
              sublabel="vs last week"
            />
          ))}
        </div>

        {/* Quick capture + smart chips */}
        <div className="flex flex-col gap-3 rise rise-2">
          <QuickCapture />
          <SmartIdeaChips />
        </div>

        {/* Board + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 rise rise-3">
          <div className="lg:col-span-3">
            <IdeaBankBoard />
          </div>
          <aside className="flex flex-col gap-4">
            <BestNewIdeaCard />
            <IdeasToScriptList />
            <PatternsWorthReusing />
          </aside>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 rise rise-4">
          <ContentPatternLibrary />
          <ReusablePhrasesVault />
          <IdeaToScriptConverter />
        </div>

        {/* Pro Tip footer */}
        <div className="rounded-2xl bg-gradient-to-r from-iris-100 via-cloud-100 to-peach-100 ring-1 ring-cloud-200 p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 rise rise-4">
          <div className="flex items-start gap-2.5">
            <Lightbulb className="h-5 w-5 text-iris-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-ink-900">Pro Tip</p>
              <p className="text-xs text-ink-700 mt-0.5 max-w-2xl">
                Drag & drop ideas across columns to organize. Star your favorites and they'll
                show up in your priority feed.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 text-white px-4 py-2 text-sm font-semibold hover:bg-ink-800 transition-colors shrink-0"
          >
            <Dices className="h-4 w-4" />
            Shuffle Chips
          </button>
        </div>
      </section>
    </main>
  );
}
