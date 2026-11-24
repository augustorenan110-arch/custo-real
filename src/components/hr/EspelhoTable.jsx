import { AlertTriangle, MapPin } from 'lucide-react';
import { dateBR } from '@/lib/format';
import { fmtMinutes } from '@/lib/timesheet';
import { mapsUrl } from '@/lib/geo';

const COLUMNS = ['Data', 'Dia', 'Entrada', 'Saída almoço', 'Volta almoço', 'Saída', 'Total dia', 'Atraso', 'Extra', 'Local'];

const min = (m) => (m > 0 ? fmtMinutes(m) : '—');

export default function EspelhoTable({ rows }) {
  return (
    <div className="glass overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {COLUMNS.map((c) => (
              <th key={c} className="whitespace-nowrap px-3 py-2.5 text-left font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const vazio = r.entrada === '—';
            return (
              <tr key={r.day} className={`border-t border-white/5 ${vazio ? 'text-muted-foreground/60' : ''}`}>
                <td className="whitespace-nowrap px-3 py-2">{dateBR(r.day)}</td>
                <td className="whitespace-nowrap px-3 py-2">{r.weekday}</td>
                <td className="whitespace-nowrap px-3 py-2">{r.entrada}</td>
                <td className="whitespace-nowrap px-3 py-2">{r.saidaAlmoco}</td>
                <td className="whitespace-nowrap px-3 py-2">{r.voltaAlmoco}</td>
                <td className="whitespace-nowrap px-3 py-2">{r.saida}</td>
                <td className="whitespace-nowrap px-3 py-2 font-medium">{r.minutes ? fmtMinutes(r.minutes) : '—'}</td>
                <td className={`whitespace-nowrap px-3 py-2 ${r.lateMin > 0 ? 'text-warning' : ''}`}>{min(r.lateMin)}</td>
                <td className={`whitespace-nowrap px-3 py-2 ${r.extraMin > 0 ? 'text-success' : ''}`}>{min(r.extraMin)}</td>
                <td className="px-3 py-2">
                  {r.endereco ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="break-words text-[12px]">{r.endereco}</span>
                      {r.lat != null && r.lng != null && (
                        <a
                          href={mapsUrl(r.lat, r.lng)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex w-fit items-center gap-1 text-[11px] text-primary hover:underline"
                        >
                          <MapPin className="h-3 w-3" /> Ver no mapa
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="whitespace-nowrap">{r.unit || '—'}</span>
                  )}
                  {r.outside && (
                    <span className="ml-1 inline-flex items-center gap-1 text-[11px] text-warning">
                      <AlertTriangle className="h-3 w-3" /> fora
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}