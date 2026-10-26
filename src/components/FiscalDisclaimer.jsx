import { useFiscalVigente } from '@/hooks/useFiscal';
import { dateBR } from '@/lib/format';

/** Aviso legal do rodapé: de onde vêm as porcentagens e quando foram atualizadas. */
export default function FiscalDisclaimer({ className = '' }) {
  const fiscal = useFiscalVigente();
  const data = fiscal.atualizadoEm || fiscal.vigencia;
  const ano = String(fiscal.vigencia || '').slice(0, 4) || new Date().getFullYear();

  return (
    <div className={`space-y-1 text-[10px] leading-relaxed text-[#64748b] ${className}`}>
      <p>
        *Cálculos com base na Portaria Interministerial MPS/MF Nº 6 de 10/01/{ano} - INSS {ano}. FGTS{' '}
        {String(fiscal.fgts).replace('.', ',')}% - Lei 8.036/90. Valores atualizados automaticamente em{' '}
        {dateBR(String(data).slice(0, 10))}.
      </p>
      <p>Fonte oficial: {fiscal.fonte}</p>
    </div>
  );
}