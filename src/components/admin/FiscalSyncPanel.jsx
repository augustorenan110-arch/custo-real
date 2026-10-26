import { useEffect, useState } from 'react';
import { Bell, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { dateBR } from '@/lib/format';

/** Botão de verificação das tabelas oficiais + recados do sistema (alerta anual). */
export default function FiscalSyncPanel({ onAtualizado }) {
  const [verificando, setVerificando] = useState(false);
  const [recado, setRecado] = useState('');
  const [aviso, setAviso] = useState('');
  const [notificacoes, setNotificacoes] = useState([]);

  useEffect(() => {
    base44.entities.Notification.filter({ lida: false }, { sort: '-created_date', limit: 5 })
      .then((r) => setNotificacoes(Array.isArray(r) ? r : r?.items || []))
      .catch(() => {});
  }, []);

  const verificar = async () => {
    setVerificando(true);
    setRecado('');
    setAviso('');
    try {
      const resposta = await base44.functions.invoke('atualizarTabelas', {});
      const dados = resposta?.data || {};
      setAviso(dados.aviso || '');
      setRecado(
        `${dados.total || 0} tabelas oficiais conferidas${
          dados.atualizado_em ? ` · última atualização em ${dateBR(String(dados.atualizado_em).slice(0, 10))}` : ''
        }.`,
      );
      await onAtualizado?.();
    } catch (e) {
      setRecado(e?.response?.data?.error || e?.message || 'Não foi possível verificar agora.');
    } finally {
      setVerificando(false);
    }
  };

  return (
    <div className="space-y-3">
      {notificacoes.map((n) => (
        <div key={n.id} className="flex items-start gap-2 rounded-xl border border-[#f59e0b]/40 bg-[#f59e0b]/10 p-3">
          <Bell className="mt-0.5 h-4 w-4 shrink-0 text-[#fbbf24]" />
          <div className="min-w-0 text-xs">
            <div className="font-bold text-[#fbbf24]">{n.titulo}</div>
            <p className="text-[#fde68a]">{n.mensagem}</p>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={verificar}
        disabled={verificando}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f97316] font-bold text-black transition hover:bg-[#ea580c] disabled:opacity-60"
      >
        <RefreshCw className={`h-4 w-4 ${verificando ? 'animate-spin' : ''}`} />
        {verificando ? 'Verificando...' : 'Verificar Atualizações Oficiais Agora'}
      </button>

      {recado && <p className="text-xs text-[#94A3B8]">{recado}</p>}
      {aviso && <p className="text-xs text-[#fbbf24]">{aviso}</p>}
    </div>
  );
}