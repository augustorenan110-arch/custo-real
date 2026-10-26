import { CalendarDays, Download, Loader2 } from 'lucide-react';
import { brl } from '@/lib/format';

const mesLabel = (mes) => {
  const [ano, m] = String(mes).split('-').map(Number);
  return new Date(ano, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

export default function HoleriteRow({ mes, slip, extras, faltas, baixando, onBaixar }) {
  return (
    <div className="glass flex items-center gap-3 rounded-2xl p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
        <CalendarDays className="h-5 w-5" strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium capitalize">{mesLabel(mes)}</div>
        <div className="text-xs text-muted-foreground">
          Líquido {brl(slip.net)}
          {extras > 0 && ` · extras ${extras.toFixed(1)}h`}
          {faltas > 0 && ` · ${faltas} falta(s)`}
        </div>
      </div>
      <button
        type="button"
        disabled={baixando}
        onClick={onBaixar}
        className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-[#007bff] px-3 text-xs font-bold text-white transition hover:bg-[#0064d2] disabled:opacity-60"
      >
        {baixando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Baixar
      </button>
    </div>
  );
}