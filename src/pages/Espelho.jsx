import { useState } from 'react';
import { CalendarClock, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMe } from '@/hooks/useMe';
import { useCompany, useEmployees, useTimeEntries } from '@/hooks/useHr';
import { localISO } from '@/lib/format';
import { buildEspelho, espelhoPdf, monthLabel } from '@/lib/espelho';
import EspelhoTable from '@/components/hr/EspelhoTable';
import EspelhoSummary from '@/components/hr/EspelhoSummary';

export default function Espelho() {
  const { data: me } = useMe();
  const { data: company } = useCompany();
  const { data: employees = [], isLoading } = useEmployees();
  const [pickedId, setPickedId] = useState('');
  const [month, setMonth] = useState(() => localISO().slice(0, 7));

  const isAdmin = me?.role === 'admin';
  const active = employees.filter((e) => e.active !== false);
  const employee = isAdmin
    ? active.find((e) => e.id === pickedId)
    : active.find((e) => (e.email || '').toLowerCase() === (me?.email || '').toLowerCase());

  const { data: entries = [] } = useTimeEntries(employee?.id, month);
  const sheet = employee
    ? buildEspelho(entries, month, { workdayHours: company?.workday_hours || 8 })
    : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <CalendarClock className="h-6 w-6 text-primary" /> Espelho de Ponto
        </h1>
        <p className="text-sm text-muted-foreground">
          Escolha o colaborador e o mês para conferir os horários e emitir o PDF para assinatura.
        </p>
      </div>

      <div className="glass grid gap-3 rounded-2xl p-4 sm:grid-cols-2">
        {isAdmin && (
          <div className="space-y-1.5">
            <Label>Colaborador</Label>
            <Select value={pickedId} onValueChange={setPickedId}>
              <SelectTrigger className="field">
                <SelectValue placeholder="Escolha o colaborador" />
              </SelectTrigger>
              <SelectContent>
                {active.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="mes">Mês</Label>
          <Input id="mes" type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="field" />
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      {!isLoading && !employee && (
        <div className="glass rounded-2xl p-5 text-sm text-muted-foreground">
          {isAdmin
            ? 'Escolha um colaborador para montar o espelho.'
            : `Nenhuma ficha está vinculada ao seu e-mail (${me?.email}). Peça ao RH para cadastrar você.`}
        </div>
      )}

      {employee && sheet && (
        <>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{employee.full_name}</span> · {employee.role_title || 'Colaborador'} ·{' '}
            {monthLabel(month)}
          </p>
          <EspelhoSummary totals={sheet.totals} />
          <EspelhoTable rows={sheet.rows} />
          <Button
            className="w-full"
            disabled={!sheet.rows.some((r) => r.entrada !== '—')}
            onClick={() => espelhoPdf({ company, employee, month, sheet })}
          >
            <FileDown className="h-4 w-4" /> Gerar PDF para Assinatura
          </Button>
        </>
      )}
    </div>
  );
}