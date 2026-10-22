import { ShieldCheck, MapPin } from 'lucide-react';
import { useMe } from '@/hooks/useMe';
import { useAuditLogs } from '@/hooks/useHr';

const when = (iso) => new Date(iso).toLocaleString('pt-BR');

export default function Audit() {
  const { data: me, isLoading: loadingMe } = useMe();
  const { data: logs = [], isLoading } = useAuditLogs();

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
            <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
              {l.actor_email && <span>por {l.actor_email}</span>}
              {typeof l.lat === 'number' && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {l.lat.toFixed(5)}, {l.lng.toFixed(5)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}