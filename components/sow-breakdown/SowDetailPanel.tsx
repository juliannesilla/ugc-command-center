// Implements: 13-sow-breakdown-elf.png + 21-sow-breakdown-summer-glow.png — per-campaign right-rail panel (contract terms summary, risk badges, lavender-tinted card)
//
// Sources (deep-read):
// - 13-sow-breakdown-elf.png: header card showing "Selected Campaign" with campaign name,
//   due date, length, base pay and total potential ($650 in mockup).
// - 21-sow-breakdown-summer-glow.png: top-right panel showing brand contact, deliverable count,
//   campaign-health donut (82), and "Rate & Workload" / "Usage & Rights" / "Great Flags" lists.
//
// This component renders a single right-rail card that summarizes the contract terms for the
// currently-selected campaign on the SOW Breakdown page. It is a stateless server component.

import { cn, formatMoney } from '@/lib/utils';
import type { Campaign, RiskLevel } from '@/lib/types/campaign';

// ── Risk badge ────────────────────────────────────────────────────────────────
const riskStyles: Record<RiskLevel, { bg: string; text: string; ring: string; label: string }> = {
  low:    { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', label: 'Low risk' },
  medium: { bg: 'bg-amber-50',   text: 'text-amber-700',   ring: 'ring-amber-200',   label: 'Medium risk' },
  high:   { bg: 'bg-rose-50',    text: 'text-rose-700',    ring: 'ring-rose-200',    label: 'High risk' },
};

function RiskBadge({ level }: { level: RiskLevel }) {
  const s = riskStyles[level];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1',
        s.bg,
        s.text,
        s.ring,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', level === 'low' ? 'bg-emerald-500' : level === 'medium' ? 'bg-amber-500' : 'bg-rose-500')} />
      {s.label}
    </span>
  );
}

// ── Health donut (mini) ───────────────────────────────────────────────────────
function HealthDonut({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = 28;
  const stroke = 6;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (clamped / 100) * circ;
  const color = clamped >= 80 ? '#22C55E' : clamped >= 60 ? '#EAB308' : '#EF4444';
  return (
    <div className="relative h-[72px] w-[72px] shrink-0">
      <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#EADCFF" strokeWidth={stroke} />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-xl leading-none text-ink-900">{clamped}</span>
        <span className="text-[8.5px] uppercase tracking-[0.16em] text-ink-500 mt-0.5">Health</span>
      </div>
    </div>
  );
}

// ── Format helpers ────────────────────────────────────────────────────────────
function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatFormat(f?: string): string {
  if (!f) return '—';
  return f.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatBonus(b?: number | string): string {
  if (b == null) return '—';
  if (typeof b === 'number') return formatMoney(b);
  return b;
}

// ── Row primitive ─────────────────────────────────────────────────────────────
function Row({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-iris-100 last:border-b-0">
      <span className="text-[11px] uppercase tracking-[0.14em] text-ink-500 font-semibold pt-0.5">{label}</span>
      <span className={cn('text-right text-[13px] text-ink-900 font-medium', mono && 'font-mono tabular-nums')}>{value}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function SowDetailPanel({
  campaign,
  className,
}: {
  campaign: Campaign;
  className?: string;
}) {
  const health = campaign.readiness_score ?? 0;
  const total = campaign.total_potential_value ?? campaign.base_pay ?? 0;

  return (
    <aside
      className={cn(
        // Lavender-tinted card with subtle gradient + soft shadow per mockup
        'relative overflow-hidden rounded-3xl bg-gradient-to-br from-iris-50 via-white to-cloud-50',
        'ring-1 ring-iris-200/70 shadow-soft p-5',
        className,
      )}
      aria-label={`Contract terms for ${campaign.brand} ${campaign.campaign_name}`}
    >
      {/* Decorative grain overlay for texture (matches dashboard aesthetic) */}
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-grain opacity-[0.04] mix-blend-multiply" />

      {/* Header — brand + campaign + health donut */}
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[10.5px] uppercase tracking-[0.18em] text-iris-500 font-semibold">
            Selected Campaign
          </div>
          <div className="mt-1 font-display text-xl text-ink-900 leading-tight truncate">
            {campaign.brand}
          </div>
          <div className="text-[12px] text-ink-600 truncate">{campaign.campaign_name}</div>
        </div>
        <HealthDonut score={health} />
      </div>

      {/* Risk badges row */}
      <div className="relative mt-3 flex flex-wrap items-center gap-1.5">
        <RiskBadge level={campaign.risk_level} />
        {campaign.priority === 'high' && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cloud-50 px-2.5 py-1 text-[11px] font-semibold text-cloud-700 ring-1 ring-cloud-200">
            <span className="h-1.5 w-1.5 rounded-full bg-cloud-500" />
            High priority
          </span>
        )}
        {campaign.waiting_on_who === 'brand' && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-iris-50 px-2.5 py-1 text-[11px] font-semibold text-iris-500 ring-1 ring-iris-200">
            Waiting on brand
          </span>
        )}
      </div>

      {/* Contract terms — Deliverables block */}
      <div className="relative mt-5">
        <div className="text-[10.5px] uppercase tracking-[0.18em] text-iris-500 font-semibold mb-1">
          Deliverables
        </div>
        <div className="rounded-2xl bg-white/70 backdrop-blur-sm ring-1 ring-iris-100 px-4 py-2">
          <Row label="Count" value={campaign.deliverable_count} mono />
          <Row label="Format" value={formatFormat(campaign.required_format)} />
          <Row label="Length" value={campaign.required_length ?? '—'} />
        </div>
      </div>

      {/* Contract terms — Usage & timing */}
      <div className="relative mt-4">
        <div className="text-[10.5px] uppercase tracking-[0.18em] text-iris-500 font-semibold mb-1">
          Usage &amp; Timing
        </div>
        <div className="rounded-2xl bg-white/70 backdrop-blur-sm ring-1 ring-iris-100 px-4 py-2">
          <Row label="Due date" value={formatDate(campaign.due_date)} />
          <Row label="Follow-up" value={formatDate(campaign.follow_up_date)} />
          <Row label="Channel" value={formatFormat(campaign.contact_channel)} />
        </div>
      </div>

      {/* Contract terms — Payment */}
      <div className="relative mt-4">
        <div className="text-[10.5px] uppercase tracking-[0.18em] text-iris-500 font-semibold mb-1">
          Payment
        </div>
        <div className="rounded-2xl bg-white/70 backdrop-blur-sm ring-1 ring-iris-100 px-4 py-2">
          <Row label="Base pay" value={campaign.base_pay != null ? formatMoney(campaign.base_pay) : '—'} mono />
          <Row label="Bonus" value={formatBonus(campaign.bonus_potential)} mono />
          <Row label="Total potential" value={total ? formatMoney(total) : '—'} mono />
          <Row label="Status" value={formatFormat(campaign.payment_status)} />
        </div>
      </div>

      {/* Next action — emphasizes the "what now" per spec */}
      {campaign.next_action && (
        <div className="relative mt-4 rounded-2xl bg-cloud-sunset px-4 py-3 text-white shadow-glow">
          <div className="text-[10.5px] uppercase tracking-[0.18em] font-semibold opacity-90">
            Your Next Move
          </div>
          <div className="mt-1 text-[13px] font-medium leading-snug">
            {campaign.next_action}
          </div>
        </div>
      )}

      {/* Blockers (if any) */}
      {campaign.blockers && campaign.blockers.length > 0 && (
        <div className="relative mt-3">
          <div className="text-[10.5px] uppercase tracking-[0.18em] text-rose-600 font-semibold mb-1">
            Blockers
          </div>
          <ul className="rounded-2xl bg-rose-50/70 ring-1 ring-rose-200 px-4 py-2 space-y-1">
            {campaign.blockers.map((b, i) => (
              <li key={i} className="flex gap-2 text-[12px] text-rose-700">
                <span aria-hidden className="mt-1 h-1 w-1 shrink-0 rounded-full bg-rose-500" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}

export default SowDetailPanel;
