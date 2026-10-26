import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { localISO } from '@/lib/format';
import { useToast } from '@/components/ui/use-toast';

export default function FaltaModalJustificada({ employee, month, mesLabel, onClose, onSaved }) {
  const [data, setData] = useState(localISO());
  const [motivo, setMotivo] = useState('');
  const [atestado, setAtestado] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const { toast } = useToast();

  const salvar = async () => {
    setSalvando(true);
    try {
      let atestado_uri = '';
      if (atestado) {
        const up = await base44.integrations.Core.UploadPrivateFile({ file: atestado });
        atestado_uri = up?.file_uri || '';
      }

      await base44.entities.Falta.create({
        employee_id: employee.id,
        employee_name: employee.full_name,
        employee_email: (employee.email || '').toLowerCase(),
        data,
        tipo: 'justificada',
        motivo: motivo.trim() || 'Atestado médico',
        atestado_uri,
        desconto_salario: 0,
        desconto_dsr: 0,
        desconto_total: 0,
        mes_referencia: month,
      });

      toast({ title: 'Falta justificada lançada - sem desconto' });
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
        <h3 className="text-base font-bold text-white">Falta Justificada</h3>
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

        <label className="mt-3 block text-xs font-medium text-[#94A3B8]">Motivo</label>
        <input
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ex: Atestado médico"
          className="mt-1 h-11 w-full rounded-xl border border-[#334155] bg-[#08080A] px-3 text-sm text-white placeholder:text-[#64748b] focus:border-[#22C55E] focus:outline-none"
        />

        <label className="mt-3 block text-xs font-medium text-[#94A3B8]">Atestado (foto)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAtestado(e.target.files?.[0] ?? null)}
          className="mt-1 w-full text-xs text-[#94A3B8] file:mr-3 file:rounded-lg file:border-0 file:bg-[#334155] file:px-3 file:py-2 file:text-xs file:text-white"
        />

        <p className="mt-3 rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-3 text-xs text-[#4ade80]">
          Falta justificada não desconta salário. Mantém DSR.
        </p>

        <button
          type="button"
          disabled={salvando}
          onClick={salvar}
          className="mt-4 h-12 w-full rounded-xl bg-[#22C55E] font-bold text-black transition hover:bg-[#16a34a] disabled:opacity-60"
        >
          {salvando ? 'SALVANDO...' : 'Salvar Justificada'}
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