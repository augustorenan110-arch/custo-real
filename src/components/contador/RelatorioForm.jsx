import { Calendar, FileText, Loader2 } from 'lucide-react';

const OPCOES = [
  { key: 'passivo', label: 'Incluir custo real de demissão (passivo oculto)' },
  { key: 'ranking', label: 'Incluir ranking de risco por funcionário' },
  { key: 'ponto', label: 'Incluir irregularidades de ponto' },
];

export default function RelatorioForm({ month, onMonth, incluir, onToggle, onGenerate, gerando }) {
  return (
    <>
      <div className="space-y-3 rounded-xl border border-[#334155] bg-[#1E293B] p-4">
        <label htmlFor="mes" className="block text-xs font-bold text-white">Mês de referência</label>
        <div className="relative">
          <input
            id="mes"
            type="month"
            value={month}
            onChange={(e) => onMonth(e.target.value)}
            className="h-11 w-full rounded-xl border border-[#334155] bg-[#08080A] px-4 pr-12 text-sm font-medium text-white focus:border-[#22C55E] focus:outline-none"
          />
          <div className="pointer-events-none absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md bg-[#334155]">
            <Calendar size={14} color="#94A3B8" />
          </div>
        </div>

        {OPCOES.map((o) => (
          <label key={o.key} className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={!!incluir[o.key]}
              onChange={() => onToggle(o.key)}
              className="h-4 w-4 shrink-0 accent-[#22C55E]"
            />
            <span className="text-sm text-white">{o.label}</span>
          </label>
        ))}
      </div>

      <button
        type="button"
        disabled={gerando}
        onClick={onGenerate}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#22C55E] font-black text-black transition-all hover:bg-[#16a34a] disabled:opacity-60"
      >
        {gerando ? <Loader2 size={20} className="animate-spin" /> : <FileText size={20} />}
        GERAR PDF CONTÁBIL
      </button>
    </>
  );
}