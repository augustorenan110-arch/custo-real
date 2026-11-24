import { Camera, MapPin } from 'lucide-react';
import { espelhoDate, formatEspelhoMinutes } from '@/lib/espelhoMonthly';
import { mapsUrl } from '@/lib/geo';

export default function EspelhoDayRow({ row }) {
  const absent = row.status === 'Falta';
  const cell = 'whitespace-nowrap px-3 py-2.5';
  return (
    <tr className={`border-t border-border ${absent ? 'bg-destructive/5' : row.weekend ? 'bg-muted/40' : ''}`}>
      <td className={cell}>{espelhoDate(row.day)}</td>
      <td className={cell}>{row.weekday}</td>
      <td className={cell}>
        {row.hasEntries ? row.entrada : <span className={absent ? 'font-semibold text-destructive' : 'text-muted-foreground'}>{row.status}</span>}
      </td>
      <td className={cell}>{row.saidaAlmoco}</td>
      <td className={cell}>{row.voltaAlmoco}</td>
      <td className={cell}>{row.saida}</td>
      <td className={`${cell} font-medium`}>
        {formatEspelhoMinutes(row.minutes)}
        {row.status === 'Incompleto' && <span className="ml-2 text-xs text-warning">Incompleto</span>}
      </td>
      <td className={`${cell} ${row.lateMin ? 'text-warning' : ''}`}>{formatEspelhoMinutes(row.lateMin)}</td>
      <td className={`${cell} ${row.extraMin ? 'text-success' : ''}`}>{formatEspelhoMinutes(row.extraMin)}</td>
      <td className="min-w-40 px-3 py-2.5">
        <div className="flex items-center gap-2" title={row.endereco ? `Endereço original: ${row.endereco}` : undefined}>
          <span className="break-words">{row.local}</span>
          {row.hasSelfie && <Camera className="h-3.5 w-3.5 shrink-0 text-success" aria-label="Com foto registrada" />}
        </div>
        {row.lat != null && row.lng != null && (
          <a href={mapsUrl(row.lat, row.lng)} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline">
            <MapPin className="h-3 w-3" /> GPS original
          </a>
        )}
      </td>
    </tr>
  );
}