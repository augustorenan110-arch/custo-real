import { useState } from 'react';
import { FileText, CalendarClock, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { brl } from '@/lib/format';
import { useExpenses } from '@/hooks/useExpenses';
import { useTimeEntries, useCompany } from '@/hooks/useHr';
import { buildPayslip } from '@/lib/payroll';
import { buildTimesheet, fmtMinutes } from '@/lib/timesheet';
import { payslipPdf, timesheetPdf, expensesPdf } from '@/lib/pdf';
import FaceEnroll from '@/components/hr/FaceEnroll';

const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function EmployeeDetail({ employee, onClose }) {
  const [month, setMonth] = useState(thisMonth());
  const [dependents, setDependents] = useState(0);
  const [transport, setTransport] = useState(false);
  const { data: company } = useCompany();
  const { data: entries = [] } = useTimeEntries(employee?.id, month);
  const { data: allExpenses = [] } = useExpenses();

  if (!employee) return null;

  const mine = allExpenses.filter(
    (e) => (e.employee_email || '').toLowerCase() === (employee.email || '').toLowerCase() && employee.email,
  );
  const approved = mine.filter((e) => e.status === 'approved');
  const sheet = buildTimesheet(entries, month, company?.workday_hours || 8);
  const slip = buildPayslip({
    gross: employee.salary,
    extraHours: sheet.extra / 60,
    transport,
    dependents: Number(dependents) || 0,
  });

  return (
    <Dialog open={!!employee} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{employee.full_name}</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          {employee.role_title || 'Colaborador'} · {employee.unit || 'Sem unidade'} · Salário {brl(employee.salary)}
        </p>
        <FaceEnroll employee={employee} />

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label htmlFor="m">Mês</Label>
            <Input id="m" type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="field" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="d">Dependentes</Label>
            <Input id="d" type="number" min="0" value={dependents} onChange={(e) => setDependents(e.target.value)} className="field" />
          </div>
          <label className="flex items-end gap-2 pb-2 text-xs">
            <input type="checkbox" checked={transport} onChange={(e) => setTransport(e.target.checked)} /> Vale-transporte
          </label>
        </div>

        <div className="glass space-y-1 rounded-xl p-3 text-sm">
          <div className="flex justify-between"><span>Proventos</span><b>{brl(slip.total)}</b></div>
          <div className="flex justify-between"><span>Descontos</span><b>{brl(slip.totalDed)}</b></div>
          <div className="flex justify-between text-primary"><span>Líquido</span><b>{brl(slip.net)}</b></div>
          <div className="flex justify-between text-xs text-muted-foreground"><span>FGTS</span><span>{brl(slip.fgts)}</span></div>
        </div>

        <div className="glass rounded-xl p-3 text-xs text-muted-foreground">
          Ponto no mês: {fmtMinutes(sheet.worked)} trabalhadas · atrasos {fmtMinutes(sheet.late)} · extras {fmtMinutes(sheet.extra)}
        </div>

        <div className="glass rounded-xl p-3 text-xs">
          <div className="mb-1 font-medium">Gastos ({mine.length})</div>
          <div className="text-muted-foreground">
            Aprovado: {brl(approved.reduce((s, e) => s + (e.amount || 0), 0))}
            {!employee.email && ' · cadastre o e-mail para vincular as despesas'}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button onClick={() => payslipPdf({ company, employee, month, slip })}>
            <FileText className="h-4 w-4" /> Holerite PDF
          </Button>
          <Button variant="outline" onClick={() => timesheetPdf({ company, employee, month, sheet })}>
            <CalendarClock className="h-4 w-4" /> Espelho PDF
          </Button>
          <Button variant="outline" onClick={() => expensesPdf({ company, employee, expenses: mine })} disabled={!mine.length}>
            <Receipt className="h-4 w-4" /> Gastos PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}