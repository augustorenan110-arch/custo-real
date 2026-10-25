import { useState } from 'react';
import {
  BarChart3,
  Calendar,
  FileCheck,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AnimatedIcon from '@/components/ui/AnimatedIcon';
import InternalBackBar from '@/components/InternalBackBar';
import { brl } from '@/lib/format';
import { useExpenses } from '@/hooks/useExpenses';
import { useTimeEntries, useCompany, useEmployees } from '@/hooks/useHr';
import { useMe } from '@/hooks/useMe';
import { buildPayslip, calcularCustoEmpresa } from '@/lib/payroll';
import { buildTimesheet, fmtMinutes } from '@/lib/timesheet';
import { payslipPdf, timesheetPdf, expensesPdf } from '@/lib/pdf';
import { freeBloqueado, isFree, trialDaysLeft } from '@/lib/plan';
import FaceEnroll from '@/components/hr/FaceEnroll';
import EmployeePassivoAlert from '@/components/hr/EmployeePassivoAlert';
import TrialCountdown from '@/components/plan/TrialCountdown';
import PaywallModal from '@/components/PaywallModal';

const thisMonth = () => new Date().toISOString().slice(0, 7);
const labelMes = (m) => {
  const d = new Date(`${m}-01T12:00:00`);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase().replace(' DE ', '/');
};
const ROSTO_CTA =
  'h-12 w-full rounded-xl bg-[#22C55E] font-bold text-black hover:bg-[#16a34a]';

export default function EmployeeDetail({ employee, onClose }) {
  const [month, setMonth] = useState(thisMonth());
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
  });
  const custo = calcularCustoEmpresa(slip.total);
  const inss = slip.deductions.find((d) => d.label === 'INSS')?.value || 0;
  const vt = slip.deductions.find((d) => d.label.startsWith('Vale-transporte'))?.value || 0;

  return (
    <Dialog open={!!employee} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{employee.full_name}</DialogTitle>
        </DialogHeader>

        <InternalBackBar label="Voltar para colaboradores" onBack={onClose} />

        <TrialCountdown company={company} usados={usados} />

        <p className="text-xs text-muted-foreground">
          {employee.role_title || 'Colaborador'} · {employee.unit || 'Sem unidade'} · Salário {brl(employee.salary)}
        </p>

        <EmployeePassivoAlert employee={employee} />

        <FaceEnroll
          employee={employee}
          label={
            employee.face_ref_uri
              ? 'ATUALIZAR ROSTO COM PROVA DE VIDA - ANTI FRAUDE'
              : 'CADASTRAR ROSTO COM PROVA DE VIDA - ANTI FRAUDE'
          }
          buttonClassName={ROSTO_CTA}
        />

        <div className="mb-4 grid grid-cols-12 items-end gap-3">
          <div className="col-span-7">
            <label htmlFor="m" className="mb-1.5 block text-xs font-medium text-[#94A3B8]">Mês de referência</label>
            <div className="relative">
              <input
                id="m"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#334155] bg-[#1E293B] px-4 pr-12 text-sm font-medium text-white focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
              />
              <div className="pointer-events-none absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md bg-[#334155]">
                <Calendar size={14} color="#94A3B8" />
              </div>
            </div>
          </div>

          <div className="col-span-5">
            <label className="invisible mb-1.5 block text-xs font-medium text-[#94A3B8]">Transporte</label>
            <label className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#334155] bg-[#1E293B] transition-all hover:border-[#22C55E]">
              <input
                type="checkbox"
                checked={transport}
                onChange={(e) => setTransport(e.target.checked)}
                className="h-4 w-4 shrink-0 accent-[#22C55E]"
              />
              <span className="whitespace-nowrap text-xs font-medium text-white sm:text-sm">Vale-transporte</span>
            </label>
          </div>
        </div>

        <div className="mb-4 space-y-3 rounded-xl border border-[#334155] bg-[#1E293B] p-4">
          <div className="flex items-center justify-between border-b border-[#334155] pb-2">
            <span className="text-xs font-bold tracking-wider text-[#94A3B8]">
              FOLHA DO MÊS - {labelMes(month)}
            </span>
            <span className="rounded-full bg-[#22C55E] px-2 py-0.5 text-[10px] font-bold text-black">CALCULADO</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#cbd5e1]">Salário base</span>
              <span className="font-medium text-white">{brl(slip.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#94A3B8]">(-) INSS 7,5% - 9%</span>
              <span className="text-[#f87171]">{brl(inss)}</span>
            </div>
            <div className="-mx-1 flex justify-between rounded-lg bg-[#08080A] p-2 text-sm font-bold">
              <span className="text-[#22C55E]">Líquido pro funcionário</span>
              <span className="text-[#22C55E]">{brl(slip.net)}</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-dashed border-[#334155] pt-3">
            <p className="text-xs font-bold text-[#f59e0b]">CUSTO REAL PRA SUA EMPRESA:</p>
            <div className="flex justify-between text-xs">
              <span className="text-[#94A3B8]">Salário</span>
              <span className="text-white">{brl(custo.salario)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#94A3B8]">FGTS 8%</span>
              <span className="text-white">{brl(custo.fgts)}</span>
            </div>
            <div className="flex justify-between gap-3 text-xs">
              <span className="text-[#94A3B8]">INSS Patronal 20% + Terceiros 5,8% + RAT 2%</span>
              <span className="shrink-0 text-white">{brl(custo.patronal)}</span>
            </div>
            <div className="flex justify-between gap-3 text-xs">
              <span className="text-[#94A3B8]">Provisão 13º + Férias + 1/3 (1/12 por mês)</span>
              <span className="shrink-0 text-white">{brl(custo.provisoes)}</span>
            </div>
            <div className="-mx-1 mt-2 flex justify-between rounded-lg border border-[#f59e0b]/30 bg-[#f59e0b]/10 p-2.5 text-sm font-black">
              <span className="text-[#fbbf24]">TOTAL QUE VOCÊ PAGA</span>
              <span className="text-base text-[#fbbf24]">{brl(custo.total)}</span>
            </div>
          </div>

          <p className="text-center text-[10px] text-[#64748b]">
            {transport
              ? `*Com vale-transporte: ${brl(vt)} descontados (6%) do funcionário.`
              : '*Sem vale-transporte. Ao ativar, 6% do salário é descontado do funcionário.'}
          </p>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-[#f97316] bg-[#451a03] p-3 text-xs">
          <AnimatedIcon icon={ShieldAlert} size={20} color="#ef4444" className="mt-0.5" />
          <div className="min-w-0">
            <span className="text-[#fed7aa]">
              Ponto no mês: {fmtMinutes(sheet.worked)} trabalhadas = risco trabalhista. Peça para bater ponto facial.
            </span>
            {(sheet.late > 0 || sheet.extra > 0) && (
              <p className="mt-1 text-[11px] text-[#fdba74]">
                Atrasos {fmtMinutes(sheet.late)} · extras {fmtMinutes(sheet.extra)}
              </p>
            )}
          </div>
        </div>

        <div className="glass rounded-xl p-3 text-xs">
          <div className="mb-1 font-medium">Gastos ({mine.length})</div>
          <div className="text-muted-foreground">
            Aprovado: {brl(approved.reduce((s, e) => s + (e.amount || 0), 0))}
            {!employee.email && ' · cadastre o e-mail para vincular as despesas'}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => (expirado ? setPaywall(true) : payslipPdf({ company, employee, month, slip }))}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#22C55E] font-bold text-black transition-all hover:bg-[#16a34a]"
          >
            <AnimatedIcon icon={expirado ? Lock : FileCheck} size={18} color="#08080A" />
            Holerite PDF
          </button>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => (gratis ? setPaywall(true) : timesheetPdf({ company, employee, month, sheet }))}
              className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl border bg-[#1E293B] font-medium transition-colors ${
                gratis ? 'border-[#334155] text-[#94A3B8] hover:border-[#eab308]' : 'border-[#334155] text-white hover:border-[#22C55E]'
              }`}
            >
              <AnimatedIcon icon={gratis ? Lock : FileCheck} size={18} color={gratis ? '#94A3B8' : '#22C55E'} />
              <span className="text-sm">Espelho PDF</span>
              {gratis && <span className="rounded-full bg-[#334155] px-2 py-0.5 text-[10px]">bloqueado</span>}
            </button>

            <button
              type="button"
              disabled={!mine.length && !gratis}
              onClick={() => (gratis ? setPaywall(true) : expensesPdf({ company, employee, expenses: mine }))}
              className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl border bg-[#1E293B] font-medium transition-colors disabled:opacity-50 ${
                gratis ? 'border-[#334155] text-[#94A3B8] hover:border-[#eab308]' : 'border-[#334155] text-white hover:border-[#22C55E]'
              }`}
            >
              <AnimatedIcon icon={gratis ? Lock : BarChart3} size={18} color={gratis ? '#94A3B8' : '#ffffff'} />
              <span className="text-sm">Gastos PDF</span>
              {gratis && <span className="rounded-full bg-[#334155] px-2 py-0.5 text-[10px]">bloqueado</span>}
            </button>
          </div>

          {(gratis || expirado) && (
            <p className="mt-1 text-center text-[11px] text-[#64748b]">
              Desbloqueie por R$59,90/mês para liberar todos os PDFs com validade jurídica
            </p>
          )}
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