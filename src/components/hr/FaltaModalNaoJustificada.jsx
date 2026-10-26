import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { brl, localISO } from '@/lib/format';
import { calcularDescontoFalta } from '@/lib/payroll';
import { useToast } from '@/components/ui/use-toast';

export default function FaltaModalNaoJustificada({ employee, month, mesLabel, onClose, onSaved }) {
  const [data, setData] = useState(localISO());
  const [salvando, setSalvando] = useState(false);
  const { toast } = useToast();
  const { dia, dsr, total } = calcularDescontoFalta(employee.salary);

  const salvar = async () => {
    setSalvando(true);
    try {
      await base44.entities.Falta.create({
        employee_id: employee.id,
        employee_name: employee.full_name,
        employee_email: (employee.email || '').toLowerCase(),
        data,
        tipo: 'nao_justificada',
        motivo: 'Falta não justificada',
        desconto_salario: dia,
        desconto_dsr: dsr,
        desconto_total: total,
        mes_referencia: month,
      });

      toast({ title: `Falta lançada! Desconto de ${brl(total)} aplicado` });
      onSaved?.();
      onClose();
    } catch (e) {
      toast({
        title: 'Não foi possível lançar a falta',
        description: String(e?.message || e),
        variant: 'destructive',
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#334155] bg-[#1E293B] p-5">
        <h3 className="text-base font-bold text-white">Falta Não Justificada</h3>
        <p className="mt-1 text-xs text-[#94A3B8]">
          {employee.full_name} · {mesLabel}
        </p>

        <label className="mt-4 block text-xs font-medium text-[#94A3B8]">Data da falta</label>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="mt-1 h-11 w-full rounded-xl border border-[#334155] bg-[#08080A] px-3 text-sm text-white focus:border-[#22C55E] focus:outline-none"
        />

        <div className="mt-4 space-y-1 rounded-xl border border-[#ef4444]/40 bg-[#ef4444]/10 p-3 text-xs">
          <p className="text-white">Desconto salário: {brl(dia)}</p>
          <p className="text-white">Desconto DSR: {brl(dsr)}</p>
          <p className="mt-1 font-bold text-[#f87171]">
            Desconto: {brl(dia)} salário + {brl(dsr)} DSR = {brl(total)}
          </p>
          <p className="pt-1 text-[11px] text-[#fca5a5]">
            Saldo de salário e Custo Real recalculados · FGTS proporcional atualizado.
          </p>
        </div>

        <button
          type="button"
          disabled={salvando}
          onClick={salvar}
          className="mt-4 h-12 w-full rounded-xl bg-[#ef4444] font-bold text-white transition hover:bg-[#dc2626] disabled:opacity-60"
        >
          {salvando ? 'APLICANDO...' : 'Aplicar Desconto'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 h-10 w-full text-sm text-[#94A3B8] transition hover:text-white"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}