import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Botão voltar das telas internas (colaborador, espelho, painel, relatórios).
 * onBack: ação própria da tela (ex.: fechar a ficha). Sem ele, volta no histórico.
 */
export default function InternalBackBar({ label = 'Voltar', onBack }) {
  const navigate = useNavigate();

  const voltar = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (window.history.length > 1) window.history.back();
    else navigate('/p');
  };

  return (
    <div className="mb-4 flex items-center gap-3">
      <button
        type="button"
        onClick={voltar}
        aria-label={label}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#334155] bg-[#1E293B] transition hover:bg-[#334155]"
      >
        <ArrowLeft size={18} color="white" />
      </button>
      <span className="truncate text-sm text-[#94A3B8]">{label}</span>
    </div>
  );
}