// Inline cell renderers for the Database view (Phase A.14e Wave 2 — E3).
// Spec: dashboard-spec/02-campaign-pipeline-views-architecture.md view #3.

import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusChip, type ChipTone } from '@/components/ui/status-chip';
import type {
  CampaignStatus,
  CampaignPriority,
  PaymentStatus,
  RiskLevel,
  WaitingOn,
  CampaignStage,
} from '@/lib/types/campaign';

// ── Status pill ──────────────────────────────────────────────────────────
// spec: active=green, waiting=yellow, blocked=red, submitted=blue, paid=gray,
// archived=stone. We map onto StatusChip tones (stone falls back to pink).
const STATUS_TONE: Record<CampaignStatus, ChipTone> = {
  active:    'green',
  waiting:   'yellow',
  blocked:   'red',
  submitted: 'blue',
  paid:      'pink',
  archived:  'pink',
};
export function StatusCell({ value }: { value: CampaignStatus }) {
  return <StatusChip tone={STATUS_TONE[value]}>{value}</StatusChip>;
}

// ── Priority dot ─────────────────────────────────────────────────────────
const PRIORITY_DOT: Record<CampaignPriority, string> = {
  high:   'bg-rose-500',
  medium: 'bg-orange-400',
  low:    'bg-ink-300',
};
export function PriorityCell({ value }: { value: CampaignPriority }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11.5px] capitalize text-ink-700">
      <span className={cn('h-2 w-2 rounded-full', PRIORITY_DOT[value])} aria-hidden />
      {value}
    </span>
  );
}

// ── Payment status pill ──────────────────────────────────────────────────
const PAYMENT_TONE: Record<PaymentStatus, ChipTone> = {
  unknown:  'pink',
  pending:  'yellow',
  invoiced: 'blue',
  paid:     'green',
  overdue:  'red',
};
export function PaymentCell({ value }: { value: PaymentStatus }) {
  return <StatusChip tone={PAYMENT_TONE[value]}>{value}</StatusChip>;
}

// ── Risk level pill ──────────────────────────────────────────────────────
const RISK_TONE: Record<RiskLevel, ChipTone> = {
  low:    'green',
  medium: 'yellow',
  high:   'red',
};
export function RiskCell({ value }: { value: RiskLevel }) {
  return <StatusChip tone={RISK_TONE[value]}>{value}</StatusChip>;
}

// ── Stage pill ───────────────────────────────────────────────────────────
const stageTone = (s: CampaignStage): ChipTone => {
  if (['NEW LEAD','APPLIED','BRAND REPLIED','RESPONDED','WAITING ON BRAND','CALL SCHEDULED'].includes(s)) return 'pink';
  if (['SOW RECEIVED','SOW REVIEWED','STRATEGY READY','SCRIPT READY'].includes(s)) return 'iris';
  if (['FILMING','EDITING','QA'].includes(s)) return 'orange';
  if (['SUBMITTED','INVOICED'].includes(s)) return 'yellow';
  if (['ACCEPTED','POSTED','PAID'].includes(s)) return 'green';
  return 'pink';
};
export function StageCell({ value }: { value: CampaignStage }) {
  return <StatusChip tone={stageTone(value)}>{value}</StatusChip>;
}

// ── Score progress bar (readiness, brand fit) ────────────────────────────
export function ScoreCell({ value }: { value?: number }) {
  if (value == null) return <span className="text-ink-300 text-[11.5px]">—</span>;
  const v = Math.max(0, Math.min(100, value));
  const tone =
    v >= 80 ? 'bg-emerald-500' :
    v >= 60 ? 'bg-cloud-sunset' :
    v >= 40 ? 'bg-amber-400' : 'bg-rose-400';
  return (
    <div className="flex items-center gap-2 min-w-[88px]">
      <div className="flex-1 h-1.5 rounded-full bg-cloud-100 overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', tone)} style={{ width: `${v}%` }} />
      </div>
      <span className="text-[11px] font-semibold text-ink-700 tabular-nums w-7 text-right">{v}</span>
    </div>
  );
}

// ── Link cell (sow_link, job_link, etc.) ─────────────────────────────────
export function LinkCell({ href, label }: { href?: string; label: string }) {
  if (!href) return <span className="text-ink-300 text-[11.5px]">—</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      className="inline-flex items-center gap-1 text-[11.5px] text-iris-600 hover:text-iris-700 hover:underline"
    >
      <ExternalLink className="h-3 w-3" />
      <span className="sr-only">{label}</span>
    </a>
  );
}

// ── Waiting-on badge ─────────────────────────────────────────────────────
const WAITING_TONE: Record<WaitingOn, string> = {
  me:       'bg-rose-50 text-rose-700 ring-rose-200',
  brand:    'bg-cloud-50 text-cloud-700 ring-cloud-200',
  platform: 'bg-iris-50 text-iris-700 ring-iris-200',
  payment:  'bg-amber-50 text-amber-800 ring-amber-200',
  none:     'bg-cloud-50 text-ink-600 ring-cloud-100',
};
export function WaitingOnCell({ value }: { value: WaitingOn }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide ring-1 capitalize',
      WAITING_TONE[value],
    )}>
      {value}
    </span>
  );
}

// ── Currency cell ────────────────────────────────────────────────────────
export function MoneyCell({ value }: { value?: number }) {
  if (value == null || value === 0) return <span className="text-ink-300 text-[11.5px]">—</span>;
  return <span className="font-medium tabular-nums text-ink-700">${value.toLocaleString()}</span>;
}

// ── Bonus cell (can be number OR text) ───────────────────────────────────
export function BonusCell({ value }: { value?: number | string }) {
  if (value == null || value === 0 || value === '') return <span className="text-ink-300 text-[11.5px]">—</span>;
  if (typeof value === 'number') return <span className="font-medium tabular-nums text-ink-700">${value.toLocaleString()}</span>;
  return <span className="text-[11.5px] text-ink-600 truncate max-w-[160px] inline-block" title={value}>{value}</span>;
}

// ── Date cell ────────────────────────────────────────────────────────────
export function DateCell({ value }: { value?: string }) {
  if (!value) return <span className="text-ink-300 text-[11.5px]">—</span>;
  try {
    const d = new Date(value);
    const today = new Date(); // A.14u F2: dynamic
    const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000);
    const label =
      diff < -1 ? `${Math.abs(diff)}d overdue` :
      diff === -1 ? 'Yesterday' :
      diff === 0 ? 'Today' :
      diff === 1 ? 'Tomorrow' :
      diff <= 7 ? `In ${diff}d` :
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const tone = diff < 0 ? 'text-rose-600 font-semibold' : diff <= 2 ? 'text-orange-600 font-medium' : 'text-ink-700';
    return <span className={cn('text-[11.5px] whitespace-nowrap', tone)}>{label}</span>;
  } catch {
    return <span className="text-[11.5px] text-ink-700">{value}</span>;
  }
}
