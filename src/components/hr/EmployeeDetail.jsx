import { useState } from 'react';
import {
  BarChart3,
  Calendar,
  FileCheck,
  FileText,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AnimatedIcon from '@/components/ui/AnimatedIcon';
import InternalBackBar from '@/components/InternalBackBar';
import { brl } from '@/lib/format';
import { useExpenses } from '@/hooks/useExpenses';
import { useTimeEntries, useCompany, useEmployees, useFaltas } from '@/hooks/useHr';
import { useMe } from '@/hooks/useMe';
import { buildPayslip, calcularCustoEmpresa, resumoFaltas } from '@/lib/payroll';
import { buildTimesheet, fmtMinutes } from '@/lib/timesheet';
import { timesheetPdf, expensesPdf } from '@/lib/pdf';
import { freeBloqueado, isFree, trialDaysLeft } from '@/lib/plan';
import FaceEnroll from '@/components/hr/FaceEnroll';
import FaltaSection from '@/components/hr/FaltaSection';
import BeneficiosCalculadora from '@/components/hr/BeneficiosCalculadora';
import EmployeePassivoAlert from '@/components/hr/EmployeePassivoAlert';
import TrialCountdown from '@/components/plan/TrialCountdown';
import PaywallModal from '@/components/PaywallModal';
import FiscalDisclaimer from '@/components/FiscalDisclaimer';
import { useFiscalVigente } from '@/hooks/useFiscal';
import { holeritePdf } from '@/lib/holerite';

const thisMonth = () => new Date().toISOString().slice(0, 7);
const labelMes = (m) => {
  const d = new Date(`${m}-01T12:00:00`);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase().replace(' DE ', '/');
};
const ROSTO_CTA =
  'h-12 w-full rounded-xl bg-[#007bff] font-bold text-white hover:bg-[#0064d2]';
const EXTRAS_ZERO = {
  vt: 0,
  va: 0,
  vr: 0,
  horaExtra: 0,
  vtAtivo: false,
  vtCustoTotal: 0,
  vtDescontoFuncionario: 0,
};

export default function EmployeeDetail({ employee, onClose }) {
  const [month, setMonth] = useState(thisMonth());
  const [beneficios, setBeneficios] = useState(EXTRAS_ZERO);
  const [paywall, setPaywall] = useState(false);
  const [gerando, setGerando] = useState(false);
  const fiscal = useFiscalVigente();
  const { data: me } = useMe();
  const { data: company } = useCompany();
  const { data: employees = [] } = useEmployees();
  const { data: entries = [] } = useTimeEntries(employee?.id, month);
  const { data: faltas = [], refetch: refetchFaltas } = useFaltas(employee?.id, month);
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
  const faltasMes = resumoFaltas(faltas, employee.salary);
  const slip = buildPayslip({
    gross: employee.salary,
    extraHours: sheet.extra / 60,
    transportDiscount: beneficios.vtDescontoFuncionario,
    faltaDiscount: faltasMes.desconto,
  });
  const custo = calcularCustoEmpresa(slip.base, beneficios);
  const inss = slip.deductions.find((d) => d.label === 'INSS')?.value || 0;

  const pct = (v) => String(Number(v) || 0).replace('.', ',');
  const aliquotasInss = fiscal.inss.map((f) => f.aliquota);
  const labelInss = `${pct(Math.min(...aliquotasInss))}% a ${pct(Math.max(...aliquotasInss))}%`;

  const gerarHolerite = async () => {
    if (expirado) {
      setPaywall(true);
      return;
    }
    setGerando(true);
    try {
      await holeritePdf({ company, employee, month, slip });
    } catch (e) {
      console.error('Não foi possível gerar o holerite', e);
    } finally {
      setGerando(false);
    }
  };

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

        <div className="mb-4 mt-6 flex w-full flex-col gap-4">
          <div className="w-full">
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

          <FaltaSection
            employee={employee}
            month={month}
            mesLabel={labelMes(month)}
            onSaved={refetchFaltas}
          />

          <BeneficiosCalculadora employee={employee} onExtras={setBeneficios} />
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
            {faltasMes.desconto > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#94A3B8]">
                  (-) Faltas não justificadas ({faltasMes.naoJustificadas})
                </span>
                <span className="text-[#f87171]">-{brl(faltasMes.desconto)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-[#94A3B8]">(-) INSS {labelInss}</span>
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
              <span className="text-[#94A3B8]">FGTS {pct(fiscal.fgts)}%</span>
              <span className="text-white">{brl(custo.fgts)}</span>
            </div>
            <div className="flex justify-between gap-3 text-xs">
              <span className="text-[#94A3B8]">INSS Patronal + Terceiros + RAT {pct(fiscal.patronal)}%</span>
              <span className="shrink-0 text-white">{brl(custo.patronal)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#94A3B8]">Provisão 13º salário (1/12)</span>
              <span className="text-white">{brl(custo.prov13)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#94A3B8]">Provisão férias (1/12)</span>
              <span className="text-white">{brl(custo.provFerias)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#94A3B8]">Provisão 1/3 férias</span>
              <span className="text-white">{brl(custo.provTerco)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#94A3B8]">FGTS sobre provisões {pct(fiscal.fgts)}%</span>
              <span className="text-white">{brl(custo.fgtsProvisoes)}</span>
            </div>
            {custo.vt > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8]">Vale-transporte (empresa)</span>
                <span className="text-white">{brl(custo.vt)}</span>
              </div>
            )}
            {custo.va > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8]">Vale-alimentação PAT (empresa)</span>
                <span className="text-white">{brl(custo.va)}</span>
              </div>
            )}
            {custo.vr > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8]">Vale-refeição PAT (empresa)</span>
                <span className="text-white">{brl(custo.vr)}</span>
              </div>
            )}
            {custo.horaExtra > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8]">Horas extras + FGTS</span>
                <span className="text-white">{brl(custo.horaExtra)}</span>
              </div>
            )}
            <div className="-mx-1 mt-2 flex justify-between rounded-lg border border-[#f59e0b]/30 bg-[#f59e0b]/10 p-2.5 text-sm font-black">
              <span className="text-[#fbbf24]">TOTAL QUE VOCÊ PAGA</span>
              <span className="text-base text-[#fbbf24]">{brl(custo.total)}</span>
            </div>
          </div>

          <p className="text-center text-[10px] text-[#64748b]">
            {beneficios.vtAtivo
              ? `*Vale-transporte: empresa paga ${brl(beneficios.vt)}/mês · funcionário desconta ${brl(
                  beneficios.vtDescontoFuncionario,
                )} (6%).`
              : '*Sem vale-transporte. Ative na calculadora acima para entrar no Custo Real.'}
          </p>

          <FiscalDisclaimer className="border-t border-dashed border-[#334155] pt-2 text-center" />
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
            disabled={gerando}
            onClick={gerarHolerite}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] font-bold text-white transition-all hover:bg-[#1d4ed8] disabled:opacity-60"
          >
            <AnimatedIcon icon={expirado ? Lock : FileText} size={18} color="#ffffff" />
            {gerando ? 'Gerando holerite...' : 'Holerite - PDF'}
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