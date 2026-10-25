import { Bus } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { brl } from '@/lib/format';
import CalcLine from '@/components/hr/CalcLine';

const FIELD =
  'mt-1 h-11 w-full rounded-xl border border-[#334155] bg-[#08080A] px-3 text-sm font-medium text-white focus:border-[#22C55E] focus:outline-none';

const numero = (set) => (e) => set(e.target.value === '' ? 0 : Number(e.target.value));

const Toggle = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 text-xs text-white">
    <Switch checked={checked} onCheckedChange={onChange} style={{ backgroundColor: checked ? '#22C55E' : undefined }} />
    {label}
  </label>
);

export default function VtCalculadora({
  ativo,
  setAtivo,
  doisVales,
  setDoisVales,
  valorPassagem,
  setValorPassagem,
  diasUteis,
  setDiasUteis,
  calc,
}) {
  return (
    <div className="w-full rounded-2xl border border-[#334155] bg-[#1E293B] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bus size={20} className="shrink-0 text-[#22C55E]" />
          <h3 className="text-sm font-bold text-white">Vale-transporte — Calculadora</h3>
        </div>
        <span className="shrink-0 rounded-full bg-[#22C55E] px-3 py-1 text-[10px] font-bold text-black">
          CALCULADO
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Toggle label="Ativar VT" checked={ativo} onChange={setAtivo} />
        <Toggle label="Ida e volta" checked={doisVales} onChange={setDoisVales} />
      </div>

      {ativo && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#94A3B8]">Valor da passagem</label>
              <input
                type="number"
                step="0.10"
                min="0"
                value={valorPassagem}
                onChange={numero(setValorPassagem)}
                className={FIELD}
              />
            </div>
            <div>
              <label className="text-xs text-[#94A3B8]">Dias úteis no mês</label>
              <input
                type="number"
                min="0"
                value={diasUteis}
                onChange={numero(setDiasUteis)}
                className={FIELD}
              />
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <CalcLine label="Custo total" valor={brl(calc.custoTotal)} />
            <CalcLine label="Desconto 6% funcionário" valor={brl(calc.descontoFuncionario)} cor="text-[#fbbf24]" />
            <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-[#08080A] p-3">
              <span className="text-sm font-bold text-[#22C55E]">Custo final empresa</span>
              <span className="shrink-0 rounded-full bg-[#22C55E] px-3 py-1 text-sm font-bold text-black">
                {brl(calc.custoEmpresa)}
              </span>
            </div>
          </div>

          <p className="mt-3 text-[10px] leading-relaxed text-[#64748b]">
            Funcionário: 6% do salário-base ({brl(calc.desconto6)}) · Empresa paga {brl(calc.custoEmpresa)}/mês · Esse
            valor entra no Custo Real.
          </p>
        </>
      )}
    </div>
  );
}