import { AlertTriangle, MapPin, Camera, CameraOff } from 'lucide-react';
import { dateBR } from '@/lib/format';
import { fmtMinutes } from '@/lib/timesheet';
import { mapsUrl } from '@/lib/geo';

const COLUMNS = [
  'Dia',
  'Semana',
  'Entrada',
 'Almoço',
  'Retorno',
  'Saída',
  'Trabalhado',
  'Atraso',
  'Extra',
  'Localização / Prova',
];

const STATUS_BADGE = {
  Folga: 'bg-slate-500/15 text-slate-300',
  Falta: 'bg-destructive/15 text-destructive',
  Incompleto: 'bg-warning/15 text-warning',
};

export default function EspelhoTable({ rows, workdayHours = 8 }) {
  return (
    <div className="glass overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[980px] text-sm">
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
            const semPonto = r.status === 'Folga' || r.status === 'Falta' || r.status === '—';
            const under = r.minutes > 0 && r.minutes < workdayHours * 60;
            return (
              <tr
                key={r.day}
                className={`border-t border-white/5 ${
                  r.status === 'Folga'
                    ? 'bg-slate-500/5 text-muted-foreground/70'
                    : r.status === 'Falta'
                      ? 'bg-destructive/5 text-muted-foreground'
                      : ''
                }`}
              >
                <td className="whitespace-nowrap px-3 py-2">{dateBR(r.day)}</td>
                <td className="whitespace-nowrap px-3 py-2">{r.weekdayShort}</td>
                {semPonto ? (
                  <td className="px-3 py-2" colSpan={6}>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE[r.status] || ''}`}>
                      {r.status}
                    </span>
                    {r.status === 'Falta' && <span className="ml-2 text-[11px] text-muted-foreground">dia não trabalhado</span>}
                  </td>
                ) : (
                  <>
                    <td className="whitespace-nowrap px-3 py-2">{r.entrada}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {r.saidaAlmoco}
                      {r.lunchMissing && (
                        <span className="ml-1 inline-flex items-center gap-1 text-[10px] text-warning">
                          <AlertTriangle className="h-3 w-3" /> sem intervalo
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">{r.voltaAlmoco}</td>
                    <td className="whitespace-nowrap px-3 py-2">{r.saida}</td>
                    <td className={`whitespace-nowrap px-3 py-2 font-medium ${under ? 'text-destructive' : ''}`}>
                      {r.minutes ? fmtMinutes(r.minutes) : '—'}
                      {r.status === 'Incompleto' && (
                        <span className="ml-1 inline-flex rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] text-warning">incompleto</span>
                      )}
                    </td>
                    <td className={`whitespace-nowrap px-3 py-2 ${r.lateMin > 0 ? 'text-warning' : ''}`}>
                      {r.lateMin > 0 ? fmtMinutes(r.lateMin) : '—'}
                    </td>
                    <td className={`whitespace-nowrap px-3 py-2 ${r.extraMin > 0 ? 'text-success' : ''}`}>
                      {r.extraMin > 0 ? fmtMinutes(r.extraMin) : '—'}
                    </td>
                  </>
                )}
                <td className="px-3 py-2 align-top">
                  {(r.endereco || r.unit) && (
                    <div className="flex flex-col gap-0.5">
                      <span className="break-words text-[12px]">{r.endereco || r.unit}</span>
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
                      <span className={`inline-flex w-fit items-center gap-1 text-[11px] ${r.hasSelfie ? 'text-success' : 'text-muted-foreground'}`}>
                        {r.hasSelfie ? <Camera className="h-3 w-3" /> : <CameraOff className="h-3 w-3" />}
                        {r.hasSelfie ? 'Foto ✓' : 'Sem foto'}
                      </span>
                    </div>
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