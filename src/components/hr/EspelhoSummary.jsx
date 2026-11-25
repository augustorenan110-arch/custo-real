import { brl, cnpjBR, cpfBR } from '@/lib/format';
import { MONTHLY_HOURS, espelhoPeriod, formatEspelhoMinutes } from '@/lib/espelhoMonthly';

export default function EspelhoSummary({ totals, employee, company, month, inferred }) {
  const expectedHours = company?.monthly_hours || MONTHLY_HOURS;
  const cards = [['Total Trabalhado', formatEspelhoMinutes(totals.worked)], ['Horas Esperadas', `${expectedHours}h`], ['Faltas', String(totals.absences)], ['Atrasos', formatEspelhoMinutes(totals.late)], ['Desconto Atrasos', brl(totals.desconto)], ['Horas Extras', formatEspelhoMinutes(totals.extra)]];
  const signatures = [[String(employee.full_name).toUpperCase(), `CPF: ${cpfBR(employee.cpf)}`, 'Assinatura do funcionário'], [company?.name || 'Empresa', `CNPJ: ${cnpjBR(company?.cnpj)}`, 'Assinatura do empregador']];
  return (
    <footer className="glass space-y-4 rounded-2xl p-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map(([label, value]) => <div key={label}><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-lg font-semibold">{value}</div></div>)}
      </div>
      {company?.cidade_uf && <p className="text-xs text-muted-foreground">Local: cidade/UF de referência da empresa. O GPS e o endereço originais permanecem disponíveis em cada marcação.</p>}
      {inferred && <p className="text-xs text-warning">Em dias com entradas repetidas, a saída foi inferida pela última batida, sem descontar almoço não registrado e sem alterar os registros originais.</p>}
      <div className="grid gap-8 pt-10 sm:grid-cols-2">
        {signatures.map(([name, document, label]) => (
          <div key={label} className="space-y-1 border-t border-border pt-2 text-center text-xs">
            <p>{label}</p><p className="break-words font-semibold">{name}</p><p className="text-muted-foreground">{document}</p><p>Data: {espelhoPeriod(month).last}</p>
          </div>
        ))}
      </div>
    </footer>
  );
}