import { fmtMinutes } from '@/lib/timesheet';

export default function EspelhoSummary({ totals }) {
  const cards = [
    ['Dias trabalhados', String(totals.days)],
    ['Horas totais', fmtMinutes(totals.worked)],
    ['Atrasos totais', totals.late > 0 ? fmtMinutes(totals.late) : '—'],
    ['Extras 50%', totals.extra50 > 0 ? fmtMinutes(totals.extra50) : '—'],
    ['Extras 100%', totals.extra100 > 0 ? fmtMinutes(totals.extra100) : '—'],
    ['Faltas', String(totals.absences)],
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map(([label, value]) => (
        <div key={label} className="glass rounded-2xl p-3">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-1 font-display text-lg font-semibold">{value}</div>
        </div>
      ))}
    </div>
  );
}