import { Header } from '@/components/ui/header';
import { Wallet } from 'lucide-react';

export const metadata = { title: 'Payments + Bonuses · UGC | Campaign HQ' };

export default function PaymentsPage() {
  return (
    <>
      <Header pageEyebrow="Payments + Bonuses" pageTitle="Cash in motion." />
      <div className="px-6 md:px-10 -mt-6 pb-16">
        <div className="rise rise-2 rounded-3xl bg-white p-10 shadow-card ring-1 ring-cloud-100 max-w-3xl">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cloud-soft text-cloud-700 ring-1 ring-cloud-100">
            <Wallet className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-display text-2xl text-ink-900">Coming soon</h2>
          <p className="mt-2 text-[14px] text-ink-600 max-w-xl">
            Invoice tracker, net-30 aging, bonus-threshold ladders, and Stripe payout reconciliation will live here.
          </p>
        </div>
      </div>
    </>
  );
}
