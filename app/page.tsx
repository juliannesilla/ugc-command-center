import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileSignature,
  Sparkles,
  Video,
  Scissors,
  Send,
  Wallet,
  Folder,
  Mail,
  PenTool,
  Film,
  Instagram,
  Youtube,
  MessageSquare,
  StickyNote,
  Camera,
  Library,
  TrendingUp,
  Inbox,
  PlayCircle,
  Check,
  Target,
  Phone,
  Zap,
} from 'lucide-react';
import { Header } from '@/components/ui/header';
import { StatCard } from '@/components/ui/stat-card';
import { DonutChart } from '@/components/ui/donut-chart';
import { StatusChip } from '@/components/ui/status-chip';
import { formatMoney, cn } from '@/lib/utils';
import { MOCK_PIPELINE, totalPipelineValue } from '@/lib/mock-data/pipeline';
import { FOCUS_THIS_WEEK, RECENT_ACTIVITY } from '@/lib/mock-data/campaigns';

// Snapshot tiles spec'd by D-1 brief (12 tiles + total potential value).
const SNAPSHOT_TILES = [
  { label: 'New Opportunities',  count: 12, accent: 'pink'   as const },
  { label: 'Awaiting Response',  count: 7,  accent: 'pink'   as const },
  { label: 'Need SOW Review',    count: 3,  accent: 'iris'   as const },
  { label: 'Ready to Script',    count: 6,  accent: 'iris'   as const },
  { label: 'Ready to Film',      count: 6,  accent: 'peach'  as const },
  { label: 'Editing',            count: 4,  accent: 'orange' as const },
  { label: 'Submitted',          count: 5,  accent: 'green'  as const },
  { label: 'Paid / Pending Pay', count: 3,  accent: 'green'  as const },
];

const HEALTH_SEGMENTS = [
  { name: 'On Track',         value: 6, color: '#22C55E' },
  { name: 'Needs Review',     value: 3, color: '#EAB308' },
  { name: 'Ready to Execute', value: 4, color: '#9D6BFF' },
];

const TOOLS = [
  { name: 'Google Drive',         icon: Folder,        status: 'connected' as const },
  { name: 'Gmail',                icon: Mail,          status: 'connected' as const },
  { name: 'SideShift',            icon: Sparkles,      status: 'connected' as const },
  { name: 'Canva',                icon: PenTool,       status: 'connected' as const },
  { name: 'CapCut',               icon: Scissors,      status: 'connected' as const },
  { name: 'TikTok',               icon: Video,         status: 'partial'   as const },
  { name: 'Instagram',            icon: Instagram,     status: 'partial'   as const },
  { name: 'YouTube Shorts',       icon: Youtube,       status: 'partial'   as const },
  { name: 'Claude / ChatGPT',     icon: MessageSquare, status: 'connected' as const },
  { name: 'Notion / Docs',        icon: StickyNote,    status: 'connected' as const },
  { name: 'Phone Video Library',  icon: Camera,        status: 'connected' as const },
  { name: 'B-roll Library',       icon: Library,       status: 'connected' as const },
];

const toolToneMap = {
  connected: 'green',
  partial:   'yellow',
  planned:   'pink',
} as const;

const STRENGTHS = [
  'Pipeline value up 28% week-over-week',
  '6 campaigns on track for on-time delivery',
  'SideShift response rate at 64% (best month yet)',
  'Glossier submission ready for review',
];

const BLOCKERS = [
  'ParakeetAI SOW pending Julz approval',
  '3 brand briefs flagged for missing usage rights',
  'Caraway revisions waiting on b-roll',
];

const FOCUS_GROUPS = [
  {
    title: 'Top Campaign Actions',
    icon: Send,
    items: [
      { label: 'Submit Glossier IG cut v3', meta: 'Today · 5pm PT' },
      { label: 'Reply to Caraway brief Qs', meta: 'Tue' },
      { label: 'Script Liquid Death 30s',   meta: 'Thu' },
    ],
  },
  {
    title: 'Filming / Editing',
    icon: Film,
    items: [
      { label: 'Film Ouai hair-care 3-pack', meta: 'Today · golden hour' },
      { label: 'Edit Rare Beauty hooks',     meta: 'Wed' },
      { label: 'QA Olipop final delivery',   meta: 'Tue' },
    ],
  },
  {
    title: 'Follow Ups · Deadlines',
    icon: Clock,
    items: [
      { label: 'Drunk Elephant — 4 days no reply',  meta: 'Nudge today' },
      { label: 'Whoop payment confirmation',         meta: 'Fri' },
      { label: 'Magic Spoon SOW review window',      meta: 'Mon' },
    ],
  },
];

const stageToTone = (s: string) => {
  if (s.startsWith('NEW') || s.startsWith('RESPOND')) return 'pink';
  if (s.startsWith('SOW')) return 'iris';
  if (s.startsWith('SCRIPT') || s.startsWith('STRATEGY')) return 'iris';
  if (s.startsWith('FILM') || s.startsWith('EDIT') || s.startsWith('QA')) return 'orange';
  if (s.startsWith('SUBMIT')) return 'yellow';
  if (s.startsWith('POSTED') || s.startsWith('PAID') || s.startsWith('ACCEPTED')) return 'green';
  return 'pink';
};

export default function OverviewPage() {
  const totalValue = totalPipelineValue();
  const totalCount = SNAPSHOT_TILES.reduce((sum, t) => sum + t.count, 0);

  return (
    <>
      <Header
        pageEyebrow="Wednesday · May 19"
        pageTitle="Good morning, Julianne."
      />

      <div className="px-6 md:px-10 -mt-6 pb-16 space-y-8">
        {/* ============ HERO STAT STRIP (5-card) ============ */}
        <section className="rise rise-1 grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Total Active',       value: 18,        sub: 'campaigns',     accent: 'iris',   Icon: TrendingUp },
            { label: 'Pipeline Value',     value: '$15,420', sub: 'potential',     accent: 'pink',   Icon: Wallet },
            { label: 'Awaiting Response',  value: 7,         sub: 'inbound',       accent: 'orange', Icon: Inbox },
            { label: 'In Production',      value: 5,         sub: 'filming/edit',  accent: 'peach',  Icon: PlayCircle },
            { label: 'Completed',          value: 5,         sub: 'this month',    accent: 'green',  Icon: Check },
          ].map(t => {
            const Icon = t.Icon;
            const accentBg: Record<string, string> = {
              iris:   'bg-iris-50 text-iris-600 ring-iris-100',
              pink:   'bg-pink-50 text-pink-600 ring-pink-100',
              orange: 'bg-orange-50 text-orange-600 ring-orange-100',
              peach:  'bg-amber-50 text-amber-600 ring-amber-100',
              green:  'bg-emerald-50 text-emerald-600 ring-emerald-100',
            };
            return (
              <div
                key={t.label}
                className="group rounded-2xl bg-white p-4 shadow-card ring-1 ring-cloud-100 hover:-translate-y-0.5 hover:ring-cloud-300 transition"
              >
                <div className="flex items-start justify-between">
                  <p className="text-[10.5px] uppercase tracking-[0.18em] text-ink-500 font-semibold leading-tight">
                    {t.label}
                  </p>
                  <span className={cn('grid h-7 w-7 place-items-center rounded-lg ring-1', accentBg[t.accent] ?? accentBg.iris)}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <p className="mt-2 font-display text-3xl text-ink-900 leading-none">{t.value}</p>
                <p className="text-[11px] text-ink-500 mt-1">{t.sub}</p>
              </div>
            );
          })}
        </section>

        {/* ============ MAIN + RIGHT RAIL ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-8 min-w-0">
        {/* ============ YOUR NEXT MOVE ============ */}
        <section className="rise rise-2 relative overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-iris-100">
          <div className="absolute inset-0 bg-iris-soft opacity-80" aria-hidden />
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-cloud-sunset opacity-25 blur-3xl" aria-hidden />
          <div className="relative p-7 md:p-9 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <p className="text-[11px] uppercase tracking-[0.28em] text-cloud-700 font-semibold">
                Your next move
              </p>
              <h2 className="mt-2 font-display text-3xl md:text-4xl text-ink-900 leading-tight">
                Review ParakeetAI SOW <span className="text-cloud-600">+</span> finalize script.
              </h2>
              <p className="mt-2 text-[14px] text-ink-600 max-w-xl">
                One sitting unlocks the next $4,200 in pipeline value. SOW landed 3 days ago — usage rights need a redline before Friday.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 rounded-full bg-cloud-sunset px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:shadow-glow transition">
                  Open ParakeetAI SOW
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink-700 ring-1 ring-cloud-200 hover:ring-cloud-300 transition">
                  Open script draft
                </button>
              </div>
            </div>
            <div className="md:w-56 shrink-0 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-2xl bg-white/80 backdrop-blur p-3 ring-1 ring-cloud-100">
                <div className="font-display text-2xl text-cloud-700">3</div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-ink-500 mt-0.5">days waiting</div>
              </div>
              <div className="rounded-2xl bg-white/80 backdrop-blur p-3 ring-1 ring-cloud-100">
                <div className="font-display text-2xl text-iris-500">$4.2k</div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-ink-500 mt-0.5">unlocked</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CAMPAIGN PIPELINE SNAPSHOT ============ */}
        <section className="rise rise-3 space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="font-display text-2xl text-ink-900">Campaign pipeline snapshot</h3>
              <p className="text-[12.5px] text-ink-500 mt-0.5">
                {totalCount} active campaigns · refreshed 4 min ago
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.22em] text-ink-500 font-semibold">Total potential value</p>
              <p className="font-display text-3xl text-cloud-700 leading-none mt-1">$24,850</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
            {SNAPSHOT_TILES.map((t, i) => (
              <StatCard
                key={t.label}
                label={t.label}
                value={t.count}
                sub={i < 4 ? 'in motion' : i < 6 ? 'in production' : 'closed/closing'}
                accent={t.accent}
              />
            ))}
          </div>
        </section>

        {/* ============ HEALTH + STRONG/BLOCKING ============ */}
        <section className="rise rise-3 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Health donut */}
          <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-cloud-100">
            <p className="text-[10.5px] uppercase tracking-[0.22em] text-ink-500 font-semibold">
              Campaign health
            </p>
            <h4 className="mt-1 font-display text-xl text-ink-900">82 / 100 readiness</h4>
            <div className="mt-4 flex items-center gap-5">
              <DonutChart
                data={HEALTH_SEGMENTS}
                centerValue={82}
                centerLabel="Readiness"
                size={156}
                innerRadius={50}
                outerRadius={70}
              />
              <ul className="flex-1 space-y-2 text-[13px]">
                {HEALTH_SEGMENTS.map(s => (
                  <li key={s.name} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-ink-700">{s.name}</span>
                    </span>
                    <span className="font-display text-ink-900 text-lg">{s.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* What's strong */}
          <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-emerald-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <p className="text-[10.5px] uppercase tracking-[0.22em] text-emerald-700 font-semibold">
                What&rsquo;s strong
              </p>
            </div>
            <ul className="mt-3 space-y-2.5 text-[13.5px] text-ink-700">
              {STRENGTHS.map(s => (
                <li key={s} className="flex gap-2 leading-snug">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What's blocking */}
          <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-orange-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <p className="text-[10.5px] uppercase tracking-[0.22em] text-orange-700 font-semibold">
                What&rsquo;s blocking
              </p>
            </div>
            <ul className="mt-3 space-y-2.5 text-[13.5px] text-ink-700">
              {BLOCKERS.map(s => (
                <li key={s} className="flex gap-2 leading-snug">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============ FOCUS THIS WEEK ============ */}
        <section className="rise rise-4 space-y-3">
          <div className="flex items-end justify-between">
            <h3 className="font-display text-2xl text-ink-900">Focus this week</h3>
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink-500">May 19 – May 25</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FOCUS_GROUPS.map(group => {
              const Icon = group.icon;
              return (
                <div key={group.title} className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-cloud-100">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-cloud-50 text-cloud-600 ring-1 ring-cloud-100">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-ink-500 font-semibold">
                      {group.title}
                    </p>
                  </div>
                  <ul className="mt-4 divide-y divide-cloud-50">
                    {group.items.map(it => (
                      <li key={it.label} className="py-2.5 first:pt-0 last:pb-0">
                        <p className="text-[13.5px] text-ink-900 font-medium leading-snug">{it.label}</p>
                        <p className="text-[11px] text-ink-500 mt-0.5">{it.meta}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============ TOOLS / ASSETS CONNECTED ============ */}
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <h3 className="font-display text-2xl text-ink-900">Tools &amp; assets connected</h3>
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink-500">12 sources</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {TOOLS.map(tool => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.name}
                  className="group rounded-2xl bg-white px-4 py-3.5 shadow-card ring-1 ring-cloud-100 hover:ring-cloud-300 hover:-translate-y-0.5 transition flex items-center gap-3"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-cloud-soft text-cloud-700 ring-1 ring-cloud-100">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-semibold text-ink-900 truncate">{tool.name}</span>
                    <span className="block">
                      <StatusChip tone={toolToneMap[tool.status]} className="!text-[9.5px] !px-1.5 !py-0.5">
                        {tool.status}
                      </StatusChip>
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============ RECENT ACTIVITY ============ */}
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <h3 className="font-display text-2xl text-ink-900">Recent campaign activity</h3>
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink-500">Last 72 hours</p>
          </div>
          <div className="rounded-3xl bg-white shadow-card ring-1 ring-cloud-100 overflow-hidden">
            <table className="w-full text-[13px]">
              <thead className="bg-cloud-soft text-left">
                <tr className="text-[10.5px] uppercase tracking-[0.16em] text-ink-500">
                  <th className="px-5 py-3 font-semibold">When</th>
                  <th className="px-5 py-3 font-semibold">Brand</th>
                  <th className="px-5 py-3 font-semibold">Event</th>
                  <th className="px-5 py-3 font-semibold">Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud-50">
                {RECENT_ACTIVITY.slice(0, 5).map(row => (
                  <tr key={row.id} className="hover:bg-cloud-50/60 transition">
                    <td className="px-5 py-3 text-ink-500 whitespace-nowrap">{row.when}</td>
                    <td className="px-5 py-3 font-semibold text-ink-900 whitespace-nowrap">{row.brand}</td>
                    <td className="px-5 py-3 text-ink-700">{row.event}</td>
                    <td className="px-5 py-3">
                      <StatusChip tone={stageToTone(row.stage) as any}>{row.stage}</StatusChip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
          </div>

          {/* ============ RIGHT RAIL ============ */}
          <aside className="space-y-5">
            {/* Quick Synth — daily intelligence */}
            <div className="rise rise-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-iris-50 via-white to-pink-50 p-5 shadow-card ring-1 ring-iris-100">
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-cloud-sunset opacity-20 blur-3xl" aria-hidden />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-iris-600 ring-1 ring-iris-100 shadow-soft">
                    <Zap className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-[10.5px] uppercase tracking-[0.22em] text-iris-700 font-semibold">
                    Quick Synth
                  </p>
                </div>
                <p className="mt-3 text-[13px] text-ink-700 leading-relaxed">
                  Today the pipeline is heavy on <span className="font-semibold text-ink-900">SOW reviews</span> — 3 brands waiting, $4.2k unlocked by clearing ParakeetAI. Glossier IG cut v3 ships at 5pm. <span className="font-semibold text-ink-900">7 inbound</span> need a yes/no by EOD or they cool off.
                </p>
                <p className="mt-3 text-[10.5px] uppercase tracking-[0.16em] text-ink-500">
                  Synced 4 min ago · Wed 9:02am
                </p>
              </div>
            </div>

            {/* Today's Focus */}
            <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-cloud-100">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-cloud-600" />
                <p className="text-[10.5px] uppercase tracking-[0.22em] text-ink-500 font-semibold">
                  Today&rsquo;s focus
                </p>
              </div>
              <ul className="mt-3 space-y-2.5 text-[13px] text-ink-700">
                <li className="flex gap-2 leading-snug">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cloud-sunset shrink-0" />
                  <span>Redline ParakeetAI SOW usage clause</span>
                </li>
                <li className="flex gap-2 leading-snug">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-iris-400 shrink-0" />
                  <span>Submit Glossier IG cut v3 by 5pm PT</span>
                </li>
                <li className="flex gap-2 leading-snug">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>Film Ouai hair-care 3-pack — golden hour</span>
                </li>
              </ul>
            </div>

            {/* Quick Stats */}
            <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-cloud-100">
              <p className="text-[10.5px] uppercase tracking-[0.22em] text-ink-500 font-semibold">
                Quick stats
              </p>
              <dl className="mt-3 space-y-2.5 text-[13px]">
                <div className="flex items-baseline justify-between">
                  <dt className="text-ink-600">Response rate</dt>
                  <dd className="font-display text-lg text-ink-900">64%</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-ink-600">Avg. deal size</dt>
                  <dd className="font-display text-lg text-ink-900">$1.4k</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-ink-600">On-time delivery</dt>
                  <dd className="font-display text-lg text-ink-900">94%</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-ink-600">Net-30 outstanding</dt>
                  <dd className="font-display text-lg text-cloud-700">$6,250</dd>
                </div>
              </dl>
            </div>

            {/* Upcoming Calls */}
            <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-cloud-100">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-cloud-600" />
                <p className="text-[10.5px] uppercase tracking-[0.22em] text-ink-500 font-semibold">
                  Upcoming calls
                </p>
              </div>
              <ul className="mt-3 divide-y divide-cloud-50">
                <li className="py-2.5 first:pt-0">
                  <p className="text-[13.5px] font-medium text-ink-900 leading-snug">Hunch — discovery call</p>
                  <p className="text-[11px] text-ink-500 mt-0.5">Wed · 2:00pm PT · Zoom</p>
                </li>
                <li className="py-2.5">
                  <p className="text-[13.5px] font-medium text-ink-900 leading-snug">Caraway — brief review</p>
                  <p className="text-[11px] text-ink-500 mt-0.5">Thu · 11:30am PT</p>
                </li>
                <li className="py-2.5 last:pb-0">
                  <p className="text-[13.5px] font-medium text-ink-900 leading-snug">Liquid Death — kickoff</p>
                  <p className="text-[11px] text-ink-500 mt-0.5">Fri · 10:00am PT</p>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
