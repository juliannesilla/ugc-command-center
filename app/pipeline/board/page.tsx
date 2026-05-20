import { Plus } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { PipelineCard } from '@/components/ui/pipeline-card';
import { DonutChart } from '@/components/ui/donut-chart';
import { StatusChip } from '@/components/ui/status-chip';
import { cn, formatMoney } from '@/lib/utils';
import { MOCK_PIPELINE } from '@/lib/mock-data/pipeline';
import {
  BOARD_STAGES,
  BOARD_TOTAL_VALUE,
  BOARD_DONUT_SEGMENTS,
  BOARD_UPCOMING_DEADLINES,
  BOARD_TOP_BRANDS,
} from '@/lib/mock-data/board-stages';

const accentBar = {
  pink:   'bg-cloud-sunset',
  iris:   'bg-gradient-to-r from-iris-300 to-iris-500',
  peach:  'bg-gradient-to-r from-peach-300 to-peach-500',
  orange: 'bg-gradient-to-r from-orange-300 to-orange-500',
  green:  'bg-gradient-to-r from-emerald-300 to-emerald-500',
  yellow: 'bg-gradient-to-r from-amber-300 to-amber-500',
  ink:    'bg-gradient-to-r from-ink-500 to-ink-700',
} as const;

export default function PipelineBoardPage() {
  return (
    <>
      <Header
        pageEyebrow="Campaign Pipeline"
        pageTitle="Board view"
      />

      <div className="flex-1 flex flex-col lg:flex-row gap-0 min-h-0">
        {/* ============ KANBAN COLUMNS ============ */}
        <div className="flex-1 min-w-0 overflow-x-auto pb-6">
          <div className="px-6 md:px-10 pt-2 pb-2 flex items-center justify-between gap-3">
            <p className="text-[12px] text-ink-500">
              <span className="font-display text-lg text-ink-900 mr-2">{BOARD_STAGES.length}</span>
              stages · drag &amp; drop ready (D-4)
            </p>
            <div className="flex items-center gap-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-ink-500">
                Refreshed 4 min ago
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full bg-cloud-sunset px-4 py-2 text-[12px] font-semibold text-white shadow-soft hover:shadow-glow transition"
              >
                <Plus className="h-3.5 w-3.5" />
                Add new opportunity
              </button>
            </div>
          </div>

          <div className="px-6 md:px-10 flex gap-4 items-start min-w-max">
            {BOARD_STAGES.map(stageDef => {
              const cards = MOCK_PIPELINE
                .filter(c => c.stage === stageDef.stage)
                .slice(0, 5);

              return (
                <section
                  key={stageDef.stage}
                  className="w-[268px] shrink-0 rounded-3xl bg-white/75 backdrop-blur-sm shadow-card ring-1 ring-cloud-100 flex flex-col max-h-[78vh]"
                >
                  {/* column header */}
                  <header className="relative px-3.5 pt-4 pb-3 border-b border-cloud-50">
                    <span className={cn('absolute inset-x-3.5 top-0 h-1 rounded-b-full', accentBar[stageDef.accent])} />
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-700 leading-tight">
                        {stageDef.stage}
                      </h3>
                      <span className="text-[10px] uppercase tracking-[0.14em] text-ink-400">
                        {stageDef.count}
                      </span>
                    </div>
                    <p className="mt-1 font-display text-lg text-cloud-700 leading-none">
                      {stageDef.value > 0 ? formatMoney(stageDef.value) : '—'}
                    </p>
                  </header>

                  {/* cards */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                    {cards.length > 0 ? (
                      cards.map(card => <PipelineCard key={card.id} card={card} />)
                    ) : (
                      <div className="rounded-2xl border border-dashed border-cloud-200 p-4 text-center text-[11.5px] text-ink-400">
                        Empty — pull from upstream
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        {/* ============ RIGHT SIDEBAR — Pipeline Overview ============ */}
        <aside className="lg:w-[340px] shrink-0 border-l border-cloud-100 bg-white/85 backdrop-blur-xl px-5 py-6 space-y-6 overflow-y-auto max-h-[calc(100vh-160px)]">
          {/* total */}
          <div>
            <p className="text-[10.5px] uppercase tracking-[0.22em] text-ink-500 font-semibold">
              Pipeline overview
            </p>
            <p className="mt-1 font-display text-3xl text-ink-900 leading-tight">
              {formatMoney(BOARD_TOTAL_VALUE)}
            </p>
            <p className="text-[12px] text-ink-500">total potential value</p>
          </div>

          {/* donut */}
          <div className="rounded-3xl bg-cloud-soft p-5 ring-1 ring-cloud-100">
            <div className="flex items-center gap-4">
              <DonutChart
                data={BOARD_DONUT_SEGMENTS}
                size={140}
                innerRadius={42}
                outerRadius={62}
                centerValue={`${Math.round(BOARD_TOTAL_VALUE / 1000)}k`}
                centerLabel="potential"
              />
              <ul className="flex-1 space-y-1.5 text-[11.5px]">
                {BOARD_DONUT_SEGMENTS.map(s => (
                  <li key={s.name} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-ink-700 flex-1 leading-tight">{s.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* deadlines */}
          <div>
            <p className="text-[10.5px] uppercase tracking-[0.22em] text-ink-500 font-semibold">
              Upcoming deadlines
            </p>
            <ul className="mt-3 space-y-2.5">
              {BOARD_UPCOMING_DEADLINES.map(d => (
                <li key={`${d.brand}-${d.label}`} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-cloud-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-ink-900 truncate">{d.brand}</p>
                    <p className="text-[11.5px] text-ink-500 truncate">{d.label}</p>
                  </div>
                  <StatusChip tone={d.tone}>{d.due}</StatusChip>
                </li>
              ))}
            </ul>
          </div>

          {/* top brands */}
          <div>
            <p className="text-[10.5px] uppercase tracking-[0.22em] text-ink-500 font-semibold">
              Top brands by value
            </p>
            <ul className="mt-3 space-y-2.5">
              {BOARD_TOP_BRANDS.map((b, i) => {
                const max = BOARD_TOP_BRANDS[0].value;
                const pct = Math.max(8, Math.round((b.value / max) * 100));
                return (
                  <li key={b.brand}>
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="font-semibold text-ink-900">
                        <span className="text-ink-400 mr-2">{i + 1}.</span>
                        {b.brand}
                      </span>
                      <span className="font-display text-cloud-700">{formatMoney(b.value)}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-cloud-50">
                      <div
                        className="h-full rounded-full bg-cloud-sunset"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
