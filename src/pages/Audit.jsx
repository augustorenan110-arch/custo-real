import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, MapPin, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMe } from '@/hooks/useMe';
import { useAuditLogs } from '@/hooks/useHr';
import { mapsUrl } from '@/lib/geo';

const when = (iso) => new Date(iso).toLocaleString('pt-BR');

export default function Audit() {
  const { data: me, isLoading: loadingMe } = useMe();
  const { data: logs = [], isLoading } = useAuditLogs();
  const queryClient = useQueryClient();

  // Resolve endereços pendentes (pontos sem internet na hora da batida) e atualiza a lista.
  useEffect(() => {
    if (me?.role !== 'admin') return;
    base44.functions
      .invoke('resolvePendingAddresses', {})
      .catch(() => {})
      .finally(() => queryClient.invalidateQueries({ queryKey: ['auditLogs'] }));
  }, [me?.role]);

  if (loadingMe) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  if (me?.role !== 'admin') {
    return <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">Apenas o RH acessa a auditoria.</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <ShieldCheck className="h-6 w-6 text-primary" /> Auditoria
        </h1>
        <p className="text-sm text-muted-foreground">Registro de cada tentativa de ponto, aceita ou recusada.</p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {!isLoading && logs.length === 0 && (
        <div className="glass rounded-2xl p-6 text-center text-sm text-muted-foreground">Nenhum registro ainda.</div>
      )}

      <div className="space-y-2">
        {logs.map((l) => (
          <div key={l.id} className="glass rounded-xl p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{l.employee_name || '—'}</span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${l.result === 'sucesso' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>
                {l.result}
              </span>
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {l.action.replaceAll('_', ' ')} · {when(l.created_date)}
              {typeof l.confidence === 'number' && ` · confiança ${l.confidence}%`}
            </div>
            {l.details && <p className="mt-1 text-xs text-foreground/70">{l.details}</p>}
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              {l.actor_email && <span>por {l.actor_email}</span>}
              {l.endereco && (
                <span className="flex items-center gap-1 break-words">
                  <MapPin className="h-3 w-3 text-primary" /> {l.endereco}
                </span>
              )}
              {typeof l.lat === 'number' && (
                <a href={mapsUrl(l.lat, l.lng)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                  <ExternalLink className="h-3 w-3" /> Ver no mapa
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}