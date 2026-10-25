import { useEffect } from 'react';
import { useBeneficios } from '@/hooks/useBeneficios';
import VtCalculadora from '@/components/hr/VtCalculadora';
import BeneficiosPat from '@/components/hr/BeneficiosPat';
import HoraExtraCalculadora from '@/components/hr/HoraExtraCalculadora';

/** Calculadoras de VT, VA/VR (PAT) e horas extras da ficha do colaborador. */
export default function BeneficiosCalculadora({ employee, onExtras }) {
  const { vt, pat, horaExtra, extras } = useBeneficios(employee);

  useEffect(() => {
    onExtras(extras);
  }, [
    extras.vt,
    extras.va,
    extras.vr,
    extras.horaExtra,
    extras.vtAtivo,
    extras.vtCustoTotal,
    extras.vtDescontoFuncionario,
  ]);

  return (
    <div className="w-full space-y-6">
      <VtCalculadora {...vt} />
      <BeneficiosPat {...pat} />
      <HoraExtraCalculadora {...horaExtra} />
    </div>
  );
}