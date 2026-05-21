import { Quote } from 'lucide-react';
import { REUSABLE_PHRASES } from '@/lib/mock-data/brain-dump';

export function ReusablePhrasesVault() {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-card">
      <div className="flex items-center gap-1.5 mb-3">
        <Quote className="h-4 w-4 text-iris-400" />
        <h4 className="text-sm font-semibold text-ink-900">Reusable Phrases Vault</h4>
      </div>
      <ul className="flex flex-col gap-2">
        {REUSABLE_PHRASES.map((phrase, i) => (
          <li
            key={i}
            className="rounded-xl bg-gradient-to-r from-cloud-50 to-iris-50 ring-1 ring-cloud-100 px-3 py-2 text-xs italic text-ink-800"
          >
            {phrase}
          </li>
        ))}
      </ul>
    </div>
  );
}
