import { useState } from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { brl } from '@/lib/format';
import { calcularDescontoFalta } from '@/lib/payroll';
import FaltaModalJustificada from '@/components/hr/FaltaModalJustificada';
import FaltaModalNaoJustificada from '@/components/hr/FaltaModalNaoJustificada';

const BTN = 'flex min-h-[108px] flex-col items-center justify-center gap-2 rounded-xl p-4 text-center text-xs font-bold text-white transition';

export default function FaltaSection({ employee, month, mesLabel, onSaved }) {
  const [ativa, setAtiva] = useState(true);
  const [justificada, setJustificada] = useState(false);
  const [naoJustificada, setNaoJustificada] = useState(false);
  const desconto = calcularDescontoFalta(employee?.salary);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-white">Lançar Falta</h3>
        <label className="flex items-center gap-2 text-xs text-[#94A3B8]">
          {ativa ? 'Ativo' : 'Inativo'}
          <Switch
            checked={ativa}
            onCheckedChange={setAtiva}
            style={{ backgroundColor: ativa ? '#22C55E' : undefined }}
          />
        </label>
      </div>

      {ativa && (
        <>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setJustificada(true)} className={`${BTN} bg-[#16a34a] hover:bg-[#15803d]`}>
              <ShieldCheck size={22} />
              Falta Justificada com Atestado
              <span className="text-[10px] font-normal text-white/80">Sem desconto</span>
            </button>

            <button
              type="button"
              onClick={() => setNaoJustificada(true)}
              className={`${BTN} bg-[#ef4444] hover:bg-[#dc2626]`}
            >
              <AlertCircle size={22} />
              Falta Não Justificada - Desconto
              <span className="text-[10px] font-normal text-white/85">{brl(desconto.total)} por falta</span>
            </button>
          </div>

          <p className="mt-2 text-[10px] leading-relaxed text-[#64748b]">
            Justificada (atestado): mantém salário e DSR, desconto de R$ 0. Não justificada: desconta o dia (
            {brl(desconto.dia)}) + DSR ({brl(desconto.dsr)}).
          </p>
        </>
      )}

      {justificada && (
        <FaltaModalJustificada
          employee={employee}
          month={month}
          mesLabel={mesLabel}
          onClose={() => setJustificada(false)}
          onSaved={onSaved}
        />
      )}

      {naoJustificada && (
        <FaltaModalNaoJustificada
          employee={employee}
          month={month}
          mesLabel={mesLabel}
          onClose={() => setNaoJustificada(false)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}