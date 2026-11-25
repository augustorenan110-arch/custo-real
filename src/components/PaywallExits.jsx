import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { LogIn, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Saídas obrigatórias de toda tela de bloqueio/paywall/fim do teste.
// Ambas fazem logout total + limpeza de cache + voltam pra tela de login limpa,
// sem pedir senha e sem voltar automaticamente pra conta anterior.
export default function PaywallExits() {
  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();

  const sair = () => {
    if (busy) return;
    setBusy(true);
    try {
      queryClient.clear();
    } catch {}
    try {
      base44.auth.logout('/entrar');
    } catch {
      window.location.href = '/entrar';
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <button
        type="button"
        onClick={sair}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-semibold text-white/90 transition hover:bg-white/10 disabled:opacity-60"
      >
        <LogIn className="h-4 w-4" /> Entrar com outra conta
      </button>
      <button
        type="button"
        onClick={sair}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[11px] text-white/55 transition hover:text-white disabled:opacity-60"
      >
        <LogOut className="h-3.5 w-3.5" /> Sair / Voltar para a página de login
      </button>
    </div>
  );
}