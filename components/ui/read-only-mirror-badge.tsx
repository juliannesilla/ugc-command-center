import { Eye } from 'lucide-react';

export function ReadOnlyMirrorBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/85 backdrop-blur px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-cloud-700 shadow-card ring-1 ring-cloud-200">
      <Eye className="h-3 w-3" />
      Read-only mirror
    </div>
  );
}
