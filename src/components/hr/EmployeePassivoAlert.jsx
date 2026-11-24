import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import AnimatedIcon from '@/components/ui/AnimatedIcon';
import { custoDemissao } from '@/lib/campanha';
import { monthsBetween } from '@/lib/rescisao';
import { brl } from '@/lib/format';

export default function EmployeePassivoAlert({ employee }) {
  const [aberto, setAberto] = useState(false);
  if (!employee) return null;

  const meses = monthsBetween(employee.admission_date, new Date().toISOString().slice(0, 10));
  const dados = custoDemissao(employee.salary, meses);
  const multa = dados.fgtsAcumulado * 0.4;

  return (
    <div className="mb-4 rounded-xl border border-[#ef4444] bg-[#450a0a] p-4">
      <p className="flex items-start gap-2 break-words font-bold leading-snug text-[#fecaca]">
        <AnimatedIcon icon={ShieldAlert} size={20} color="#ef4444" className="mt-0.5 shrink-0" />
        <span className="min-w-0 break-words">CUSTO PARA DEMITIR HOJE: {brl(dados.total)}</span>
      </p>
      <p className="mt-1 break-words text-sm leading-snug text-[#fca5a5]">
        FGTS acumulado {brl(dados.fgtsAcumulado)} + Multa 40% {brl(multa)} + Férias + 13º
      </p>
      <button type="button" onClick={() => setAberto((v) => !v)} className="mt-1 text-xs text-white underline">
        {aberto ? 'Ocultar detalhamento' : 'Ver detalhamento ->'}
      </button>

      {aberto && (
        <ul className="mt-3 space-y-1 border-t border-[#ef4444]/40 pt-3 text-[11px] text-[#fca5a5]">
          {dados.rows.map(([label, valor]) => (
            <li key={label} className="flex justify-between gap-3">
              <span>{label}</span>
              <span className="font-medium">{brl(valor)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}