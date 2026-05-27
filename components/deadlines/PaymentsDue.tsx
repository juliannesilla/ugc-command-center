import { cn, formatMoney } from '@/lib/utils';
import { MOCK_PAYMENTS_DUE } from '@/lib/mock-data/deadlines';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function PaymentsDue() {
  const total = MOCK_PAYMENTS_DUE.reduce((s, p) => s + p.amount, 0);
  return (
    <section className="rounded-2xl border border-cloud-100 bg-white/85 backdrop-blur p-6 shadow-card">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-[15px] text-ink-900">Payments Due</h3>
        <span className="font-display text-[15px] text-cloud-700 tabular-nums">
          {formatMoney(total)}
        </span>
      </div>
      <ul className="mt-3 divide-y divide-cloud-100">
        {MOCK_PAYMENTS_DUE.map(p => (
          <li key={p.id} className="py-2 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold text-ink-900 leading-tight">{p.brand}</p>
              <p className="text-[10.5px] text-ink-600 uppercase tracking-[0.12em]">
                {p.invoiceId} · {fmtDate(p.dueDate)}
              </p>
            </div>
            <span
              className={cn(
                'text-[12px] font-semibold tabular-nums',
                p.status === 'overdue' ? 'text-rose-600' : 'text-ink-900',
              )}
            >
              {formatMoney(p.amount)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
