'use client';

import { useState } from 'react';
import { Plus, Mic } from 'lucide-react';

export function QuickCapture({ onCapture }: { onCapture?: (text: string) => void }) {
  const [text, setText] = useState('');
  const submit = () => {
    if (!text.trim()) return;
    onCapture?.(text.trim());
    setText('');
  };
  return (
    <div className="glass-card rounded-2xl p-4 md:p-5 shadow-card flex items-center gap-3">
      <Mic className="h-4 w-4 text-iris-400 shrink-0" />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}
        placeholder="Drop an idea here or type it out…"
        className="flex-1 bg-transparent placeholder:text-ink-400 text-sm text-ink-900 outline-none"
      />
      <button
        type="button"
        onClick={submit}
        className="inline-flex items-center gap-1.5 rounded-full bg-cloud-500 text-white px-4 py-2 text-sm font-semibold shadow-soft hover:bg-cloud-600 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Capture Idea
      </button>
    </div>
  );
}
