import { Sparkles, AlertTriangle } from 'lucide-react';
import { statusLabel } from '@/lib/format';

const statusClass = {
  pending: 'bg-warning/15 text-warning',
  approved: 'bg-success/15 text-success',
  rejected: 'bg-destructive/15 text-destructive',
};

export function StatusPill({ status }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass[status] || statusClass.pending}`}>
      {statusLabel[status] || statusLabel.pending}
    </span>
  );
}

export function AiVerdict({ compliant, notes }) {
  if (compliant === null || compliant === undefined) return null;
  return (
    <div
      className={`flex gap-2 rounded-xl p-2.5 text-xs leading-relaxed ${
        compliant ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
      }`}
    >
      {compliant ? (
        <Sparkles className="h-4 w-4 shrink-0" />
      ) : (
        <AlertTriangle className="h-4 w-4 shrink-0" />
      )}
      <span>
        <b>{compliant ? 'Dentro da política' : 'Fora da política'}</b>
        {notes ? ` — ${notes}` : ''}
      </span>
    </div>
  );
}