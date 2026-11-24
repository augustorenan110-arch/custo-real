import { cnpjBR, cpfBR } from '@/lib/format';
import { MONTHLY_HOURS, espelhoPeriod, monthLabel } from '@/lib/espelhoMonthly';

export default function EspelhoHeader({ company, employee, month }) {
  const period = espelhoPeriod(month, company?.workday_hours || 8);
  const fields = [['Nome', String(employee.full_name).toUpperCase()], ['CPF', cpfBR(employee.cpf)], ['Cargo', employee.role_title || '--'], ['Jornada', period.journey], ['Carga Mensal', `${MONTHLY_HOURS}h`], ['CNPJ', cnpjBR(company?.cnpj)]];
  return (
    <header className="glass space-y-3 rounded-2xl p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div><h2 className="text-base font-semibold">ESPELHO DE PONTO</h2><p className="break-words text-sm text-muted-foreground">{company?.name || 'Empresa'}</p></div>
        <span className="text-sm capitalize text-muted-foreground">{monthLabel(month)}</span>
      </div>
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {fields.map(([label, value]) => <div key={label} className="flex flex-wrap gap-1"><dt className="font-semibold">{label}:</dt><dd className="break-words">{value}</dd></div>)}
      </dl>
      <p className="text-sm text-muted-foreground">Período: {period.first} a {period.last}</p>
    </header>
  );
}