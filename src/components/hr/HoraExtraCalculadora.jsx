import { useState } from 'react';
import { ClipboardList, Clock } from 'lucide-react';
import { brl } from '@/lib/format';
import { useToast } from '@/components/ui/use-toast';

const numero = (set) => (e) => set(e.target.value === '' ? 0 : Number(e.target.value));
const HORAS_INPUT = 'w-20 rounded-xl bg-[#08080A] p-2 text-center font-bold text-[#f97316] focus:outline-none';
const BLOCO = 'rounded-2xl border border-[#334155] bg-[#1E293B] p-4';

export default function HoraExtraCalculadora({ horas50, setHoras50, horas100, setHoras100, salario, calc, salvar }) {
  const [salvando, setSalvando] = useState(false);
  const { toast } = useToast();

  const onSalvar = async () => {
    setSalvando(true);
    try {
      await salvar();
      toast({ title: 'Hora extra salva no Custo Real' });
    } catch (e) {
      toast({
        title: 'Não foi possível salvar a hora extra',
        description: String(e?.message || e),
        variant: 'destructive',
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock size={20} className="shrink-0 text-[#f97316]" />
          <h3 className="text-sm font-bold text-white">HORA EXTRA - CALCULADORA</h3>
        </div>
        <span className="shrink-0 rounded-full bg-[#22C55E] px-2 py-1 text-[10px] font-bold text-black">
          CALCULADORA
        </span>
      </div>

      <div className={BLOCO}>
        <p className="text-center text-[10px] font-bold tracking-wider text-[#64748b]">PARÂMETROS</p>
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between border-b border-[#334155] pb-2">
            <span className="text-sm text-white">Salário base</span>
            <span className="text-sm font-bold text-[#94A3B8]">{brl(salario)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-[#334155] pb-2">
            <span className="text-sm text-white">Horas extras 50%</span>
            <div className="flex items-center gap-1.5">
              <input type="number" min="0" value={horas50} onChange={numero(setHoras50)} className={HORAS_INPUT} />
              <span className="text-sm text-[#f97316]">h</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white">Horas extras 100%</span>
            <div className="flex items-center gap-1.5">
              <input type="number" min="0" value={horas100} onChange={numero(setHoras100)} className={HORAS_INPUT} />
              <span className="text-sm text-[#f97316]">h</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`${BLOCO} mt-3`}>
        <p className="text-center text-[10px] font-bold tracking-wider text-[#64748b]">CÁLCULOS</p>
        <div className="mt-3 space-y-3 text-sm">
          <div className="flex justify-between border-b border-[#334155] pb-2">
            <span className="text-white">Valor hora normal</span>
            <span className="font-bold text-[#94A3B8]">{brl(calc.horaNormal)}</span>
          </div>
          <div className="flex justify-between border-b border-[#334155] pb-2">
            <span className="text-white">Valor hora 50%</span>
            <span className="font-bold text-[#f97316]">{brl(calc.valor50)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white">Valor hora 100%</span>
            <span className="font-bold text-[#f97316]">{brl(calc.valor100)}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-[#16a34a] p-4">
        <div className="flex items-center gap-2">
          <ClipboardList size={18} className="shrink-0 text-white" />
          <span className="text-sm font-bold text-white">Custo total hora extra</span>
        </div>
        <span className="shrink-0 text-lg font-bold text-white">{brl(calc.custoTotalExtra)}</span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-[#f97316] bg-[#1E293B] p-4">
        <div>
          <p className="text-sm font-bold text-white">Custo empresa com FGTS</p>
          <p className="text-[10px] text-[#94A3B8]">+ FGTS 8% sobre hora extra ({brl(calc.fgts)})</p>
        </div>
        <span className="shrink-0 text-lg font-bold text-[#f97316]">{brl(calc.custoComFgts)}</span>
      </div>

      <div className="mt-3 rounded-2xl border border-[#f97316] p-3">
        <p className="text-[10px] font-bold tracking-wider text-[#f97316]">RESUMO</p>
        <p className="mt-1 text-[11px] leading-relaxed text-white">
          • {horas50}h a 50% = {brl(calc.total50)} • {horas100}h a 100% = {brl(calc.total100)} • Total extra ={' '}
          {brl(calc.custoTotalExtra)} • Reflexo DSR/férias/13º ≈ {brl(calc.reflexoDSR)}
        </p>
      </div>

      <button
        type="button"
        disabled={salvando}
        onClick={onSalvar}
        className="mt-4 h-12 w-full rounded-2xl bg-[#f97316] font-bold text-white transition hover:bg-[#ea580c] disabled:opacity-60"
      >
        {salvando ? 'SALVANDO...' : 'Salvar no Custo Real'}
      </button>
    </div>
  );
}