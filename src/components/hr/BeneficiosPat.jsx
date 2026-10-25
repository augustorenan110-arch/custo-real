import { CheckCircle2, ShoppingBasket, Utensils } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { brl } from '@/lib/format';
import CalcLine from '@/components/hr/CalcLine';

const FIELD =
  'mt-1 h-11 w-full rounded-xl border border-[#334155] bg-[#08080A] px-3 text-sm font-medium text-white focus:border-[#22C55E] focus:outline-none';

const numero = (set) => (e) => set(e.target.value === '' ? 0 : Number(e.target.value));

const CARTAO = 'flex min-h-[96px] flex-col items-center justify-center gap-1 rounded-2xl p-3 text-center text-xs font-bold transition';

export default function BeneficiosPat({
  tipo,
  selecionar,
  valorVA,
  setValorVA,
  valorVR,
  setValorVR,
  dias,
  setDias,
  descontoPAT,
  setDescontoPAT,
  calcVA,
  calcVR,
}) {
  const alimentacao = tipo === 'va';
  const calc = alimentacao ? calcVA : calcVR;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-white">Benefícios Alimentação - Calculadora PAT</h3>
        <span className="shrink-0 rounded-full bg-[#16a34a] px-2 py-1 text-[10px] font-bold text-white">PAT</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => selecionar('va')}
          className={`${CARTAO} ${alimentacao ? 'bg-[#f97316] text-white' : 'bg-[#1E293B] text-[#94A3B8] hover:text-white'}`}
        >
          <ShoppingBasket size={22} />
          Vale Alimentação
          <span className="text-[10px] font-normal opacity-80">Mercado</span>
        </button>
        <button
          type="button"
          onClick={() => selecionar('vr')}
          className={`${CARTAO} ${tipo === 'vr' ? 'bg-[#a855f7] text-white' : 'bg-[#1E293B] text-[#94A3B8] hover:text-white'}`}
        >
          <Utensils size={22} />
          Vale Refeição
          <span className="text-[10px] font-normal opacity-80">Restaurante</span>
        </button>
      </div>

      {tipo && (
        <div className="mt-3 rounded-2xl border border-[#334155] bg-[#1E293B] p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-white">
              Calculadora - {alimentacao ? 'Vale Alimentação' : 'Vale Refeição'}
            </span>
            <span className="shrink-0 rounded-full bg-[#22C55E] px-3 py-1 text-[10px] font-bold text-black">
              CALCULADO
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#94A3B8]">Valor diário</label>
              <input
                type="number"
                step="0.50"
                min="0"
                value={alimentacao ? valorVA : valorVR}
                onChange={numero(alimentacao ? setValorVA : setValorVR)}
                className={FIELD}
              />
            </div>
            <div>
              <label className="text-xs text-[#94A3B8]">Dias úteis</label>
              <input type="number" min="0" value={dias} onChange={numero(setDias)} className={FIELD} />
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <CalcLine label="Custo total" valor={brl(calc.custoTotal)} />
            <CalcLine
              label={`Desconto ${descontoPAT}% funcionário`}
              valor={brl(calc.descontoFuncionario)}
              cor="text-[#fbbf24]"
            />
            <div className="flex items-center justify-between gap-3 rounded-xl bg-[#08080A] p-3">
              <span className="text-sm font-bold text-[#22C55E]">Custo final empresa</span>
              <span className="shrink-0 rounded-full bg-[#22C55E] px-3 py-1 text-sm font-bold text-black">
                {brl(calc.custoEmpresa)}
              </span>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-3">
            <p className="flex items-center gap-1.5 text-xs font-bold text-[#4ade80]">
              <CheckCircle2 size={14} /> Calculado com sucesso
            </p>
            <p className="mt-1 text-xs text-white">
              Economia de {brl(calc.descontoFuncionario)} mensais com desconto PAT · entra no Custo Real.
            </p>
          </div>

          <div className="mt-4">
            <label className="text-xs text-[#94A3B8]">% Desconto funcionário (máx 20% PAT)</label>
            <div className="mt-3">
              <Slider
                value={[descontoPAT]}
                onValueChange={([valor]) => setDescontoPAT(valor)}
                min={0}
                max={20}
                step={1}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}