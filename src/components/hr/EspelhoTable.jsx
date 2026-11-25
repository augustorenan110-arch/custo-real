import { ESPELHO_COLUMNS } from '@/lib/espelhoMonthly';
import EspelhoDayRow from '@/components/hr/EspelhoDayRow';

export default function EspelhoTable({ rows }) {
  return (
    <div className="glass overflow-x-auto rounded-2xl" data-espelho-days={rows.length}>
      <table className="w-full min-w-[1320px] text-sm">
        <caption className="sr-only">Espelho mensal completo, incluindo todos os dias sem marcação</caption>
        <thead>
          <tr className="text-xs text-muted-foreground">
            {ESPELHO_COLUMNS.map((column) => <th key={column} scope="col" className="whitespace-nowrap px-3 py-3 text-left font-semibold">{column}</th>)}
          </tr>
        </thead>
        <tbody>{rows.map((row) => <EspelhoDayRow key={row.day} row={row} />)}</tbody>
      </table>
    </div>
  );
}