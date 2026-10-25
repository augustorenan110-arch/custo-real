import { useState } from 'react';
import { CalendarClock, CalendarDays, FileText, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { brl } from '@/lib/format';
import { useExpenses } from '@/hooks/useExpenses';
import { useTimeEntries, useCompany, useEmployees } from '@/hooks/useHr';
import { useMe } from '@/hooks/useMe';
import { buildPayslip } from '@/lib/payroll';
import { buildTimesheet, fmtMinutes } from '@/lib/timesheet';
import { payslipPdf, timesheetPdf, expensesPdf } from '@/lib/pdf';
import { freeBloqueado, isFree, trialDaysLeft } from '@/lib/plan';
import FaceEnroll from '@/components/hr/FaceEnroll';
import EmployeePassivoAlert from '@/components/hr/EmployeePassivoAlert';
import TrialCountdown from '@/components/plan/TrialCountdown';
import PaywallModal from '@/components/PaywallModal';

const thisMonth = () => new Date().toISOString().slice(0, 7);
const ROSTO_CTA =
  'h-12 w-full rounded-xl bg-[#22C55E] font-bold text-black hover:bg-[#16a34a]';

export default function EmployeeDetail({ employee, onClose }) {
  const [month, setMonth] = useState(thisMonth());
  const [dependents, setDependents] = useState(0);
  const [transport, setTransport] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const { data: me } = useMe();
  const { data: company } = useCompany();
  const { data: employees = [] } = useEmployees();
  const { data: entries = [] } = useTimeEntries(employee?.id, month);
  const { data: allExpenses = [] } = useExpenses();

  if (!employee) return null;

  const contador = !!me?.is_accountant || me?.tipo_conta === 'escritorio';
  // Teste grátis: espelho e gastos em PDF são do plano completo.
  const gratis = !!company && isFree(company) && !contador;
  // Teste grátis vencido: holerite também fica bloqueado.
  const expirado = !!company && freeBloqueado(company) && !contador;
  const usados = employees.filter((e) => e.active !== false).length;

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

        <TrialCountdown company={company} usados={usados} />

        <p className="text-xs text-muted-foreground">
          {employee.role_title || 'Colaborador'} · {employee.unit || 'Sem unidade'} · Salário {brl(employee.salary)}
        </p>

        <EmployeePassivoAlert employee={employee} />

        <FaceEnroll
          employee={employee}
          label={
            employee.face_ref_uri
              ? '📸 ATUALIZAR ROSTO COM PROVA DE VIDA - ANTI FRAUDE'
              : '📸 CADASTRAR ROSTO COM PROVA DE VIDA - ANTI FRAUDE'
          }
          buttonClassName={ROSTO_CTA}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="min-w-0 space-y-1">
            <Label htmlFor="m">Mês</Label>
            <div className="relative min-w-0">
              <Input
                id="m"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="field min-w-0 truncate pr-8 text-sm"
              />
              <CalendarDays className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
          <div className="min-w-0 space-y-1">
            <Label htmlFor="d">Dependentes</Label>
            <Input
              id="d"
              type="number"
              min="0"
              value={dependents}
              onChange={(e) => setDependents(e.target.value)}
              className="field min-w-0"
            />
          </div>
          <label className="col-span-2 flex items-end gap-2 pb-2 text-xs sm:col-span-1">
            <input type="checkbox" checked={transport} onChange={(e) => setTransport(e.target.checked)} /> Vale-transporte
          </label>
        </div>

        <div className="glass space-y-1 rounded-xl p-3 text-sm">
          <div className="flex justify-between"><span>Proventos</span><b>{brl(slip.total)}</b></div>
          <div className="flex justify-between"><span>Descontos</span><b>{brl(slip.totalDed)}</b></div>
          <div className="flex justify-between text-primary"><span>Líquido</span><b>{brl(slip.net)}</b></div>
          <div className="flex justify-between text-xs text-muted-foreground"><span>FGTS</span><span>{brl(slip.fgts)}</span></div>
        </div>

        <div className="rounded-xl border-l-4 border-red-500 bg-[#1E293B] p-3 text-xs">
          <span className="text-red-400">
            ⚠️ Ponto no mês: {fmtMinutes(sheet.worked)} trabalhadas = risco trabalhista. Peça para bater ponto facial.
          </span>
          {(sheet.late > 0 || sheet.extra > 0) && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Atrasos {fmtMinutes(sheet.late)} · extras {fmtMinutes(sheet.extra)}
            </p>
          )}
        </div>

        <div className="glass rounded-xl p-3 text-xs">
          <div className="mb-1 font-medium">Gastos ({mine.length})</div>
          <div className="text-muted-foreground">
            Aprovado: {brl(approved.reduce((s, e) => s + (e.amount || 0), 0))}
            {!employee.email && ' · cadastre o e-mail para vincular as despesas'}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button
            className="w-full bg-[#22C55E] font-bold text-black hover:bg-[#16a34a]"
            onClick={() => (expirado ? setPaywall(true) : payslipPdf({ company, employee, month, slip }))}
          >
            <FileText className="h-4 w-4" /> {expirado ? '🔒 Holerite PDF' : 'Holerite PDF'}
          </Button>
          <Button
            variant="outline"
            className="w-full bg-[#1E293B]"
            onClick={() => (gratis ? setPaywall(true) : timesheetPdf({ company, employee, month, sheet }))}
          >
            <CalendarClock className="h-4 w-4" /> {gratis ? '🔒 Espelho PDF' : 'Espelho PDF'}
          </Button>
          <Button
            variant="outline"
            className="w-full bg-[#1E293B]"
            disabled={!mine.length}
            onClick={() => (gratis ? setPaywall(true) : expensesPdf({ company, employee, expenses: mine }))}
          >
            <Receipt className="h-4 w-4" /> {gratis ? '🔒 Gastos PDF' : 'Gastos PDF'}
          </Button>
        </div>

        <PaywallModal
          open={paywall}
          onClose={() => setPaywall(false)}
          companyId={company?.id}
          email={me?.email}
          daysLeft={trialDaysLeft(company)}
        />
      </DialogContent>
    </Dialog>
  );
}