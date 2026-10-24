import { Lock } from 'lucide-react';

export default function LockedCard({ titulo, nota }) {
  return (
    <div className="glass flex items-center gap-3 rounded-2xl p-4">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5">
        <Lock className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground/80">{titulo}</p>
        <p className="text-[11px] text-muted-foreground">{nota}</p>
      </div>
    </div>
  );
}