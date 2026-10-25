import { useState } from 'react';
import { AlertTriangle, Check, Loader2, X } from 'lucide-react';
import { startPlanCheckout } from '@/lib/checkout';

const BLOQUEADOS = [
  'Espelho de Ponto com prova facial e GPS - sem isso você perde na justiça',
  'Relatório de gastos aprovado pra mandar pro contador',
  'Cadastro de mais funcionários - seu limite grátis de 3 acabou',
  'Cálculo de custo real para demitir hoje',
];

const LIBERADOS = [
  'Funcionários ilimitados',
  'Ponto facial ilimitado com prova de vida',
  'Todos os PDFs com validade jurídica',
  'Proteção contra processo trabalhista',
];

export default function PaywallModal({
  open,
  onClose,
  onCheckout,
  onVerificar,
  companyId,
  email,
  daysLeft = 5,
  blocking = false,
  passivo = 'R$ 5.838,65',
}) {
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState('');

  if (!open) return null;

  const assinar = async () => {
    setErro('');
    setBusy(true);
    try {
      if (onCheckout) await onCheckout();
      else await startPlanCheckout({ companyId, email });
      if (!blocking) onClose?.();
    } catch (err) {
      setErro(err?.response?.data?.error || err?.message || 'Não foi possível abrir o checkout agora.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#08080A]/90 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-[480px] overflow-y-auto rounded-2xl border border-[#ef4444] bg-[#111827] p-6 shadow-2xl">
        {!blocking && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-4 top-4 rounded-lg p-1.5 text-[#94A3B8] transition hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <AlertTriangle className="h-9 w-9 text-[#ef4444]" strokeWidth={2.2} />
        <h2 className="mt-3 text-xl font-bold text-[#ef4444]">🚨 SEU NEGÓCIO ESTÁ DESPROTEGIDO</h2>
        <p className="mt-2 text-sm leading-relaxed text-white">
          Você tem {passivo} de passivo oculto com o Matheus Santos e mais 2 funcionários sem ponto facial registrado.
        </p>

        <div className="my-4 h-px bg-[#334155]" />

        <div className="space-y-2 rounded-xl bg-[#1E293B] p-4">
          {BLOQUEADOS.map((item) => (
            <p key={item} className="text-sm text-[#94A3B8]">
              🔒 {item}
            </p>
          ))}
        </div>

        <div className="mt-3 space-y-2 rounded-xl border border-[#22C55E] bg-[#052e16] p-4">
          {LIBERADOS.map((item) => (
            <p key={item} className="flex items-start gap-2 text-sm text-[#bbf7d0]">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#22C55E]" /> {item}
            </p>
          ))}
        </div>

        {erro && <p className="mt-3 rounded-lg bg-[#ef4444]/15 p-3 text-xs text-[#fecaca]">{erro}</p>}

        <button
          type="button"
          onClick={assinar}
          disabled={busy}
          className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#22C55E] text-[16px] font-bold text-black transition animate-pulse hover:bg-[#16a34a] disabled:opacity-70"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          DESBLOQUEAR MINHA PROTEÇÃO POR R$59,90/MÊS →
        </button>

        <p className="mt-3 text-center text-[11px] leading-relaxed text-[#94A3B8]">
          Menos de R$2 por dia para não pagar {passivo} de uma vez. Cancela quando quiser. Sem fidelidade.
        </p>
        <p className="mt-2 text-center text-[11px] font-semibold text-[#facc15]">
          ⏳ Seu teste grátis vence em {daysLeft} dia(s). Depois disso, seus holerites ficam bloqueados.
        </p>

        {blocking && onVerificar && (
          <button
            type="button"
            onClick={onVerificar}
            className="mt-3 w-full text-center text-[11px] text-[#94A3B8] underline transition hover:text-white"
          >
            Já assinei - verificar meu plano
          </button>
        )}
      </div>
    </div>
  );
}