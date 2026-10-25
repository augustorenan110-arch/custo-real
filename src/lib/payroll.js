import { custoDemissao } from '@/lib/campanha';
import { monthsBetween } from '@/lib/rescisao';
import { todayISO } from '@/lib/format';

// Tabelas simplificadas (INSS progressivo e IRRF) — valores de referência 2025.
const INSS_BANDS = [
  [1518.0, 0.075],
  [2793.88, 0.09],
  [4190.83, 0.12],
  [8157.41, 0.14],
];
const IRRF_BANDS = [
  [2428.8, 0, 0],
  [2826.65, 0.075, 182.16],
  [3751.05, 0.15, 394.16],
  [4664.68, 0.225, 675.49],
  [Infinity, 0.275, 908.73],
];
const IRRF_DEP = 189.59;

export function calcInss(gross) {
  let prev = 0;
  let total = 0;
  for (const [limit, rate] of INSS_BANDS) {
    if (gross > prev) total += (Math.min(gross, limit) - prev) * rate;
    prev = limit;
  }
  return round(total);
}

export function calcIrrf(gross, inss, dependents = 0) {
  const base = gross - inss - dependents * IRRF_DEP;
  for (const [limit, rate, ded] of IRRF_BANDS) {
    if (base <= limit) return round(Math.max(0, base * rate - ded));
  }
  return 0;
}

const round = (n) => Math.round(n * 100) / 100;

export function buildPayslip({
  gross,
  extraHours = 0,
  hourValue,
  transport = false,
  dependents = 0,
  faltaDiscount = 0,
}) {
  const faltas = round(Math.max(0, faltaDiscount));
  const extras = round(extraHours * (hourValue ?? gross / 220) * 1.5);
  const earnings = [{ label: 'Salário base', value: round(gross) }];
  if (extras > 0) earnings.push({ label: `Horas extras (${extraHours.toFixed(1)}h a 50%)`, value: extras });
  const total = round(earnings.reduce((s, e) => s + e.value, 0));
  const base = round(Math.max(0, total - faltas));
  const inss = calcInss(base);
  const irrf = calcIrrf(base, inss, dependents);
  const deductions = [
    { label: 'INSS', value: inss },
    { label: 'IRRF', value: irrf },
  ];
  if (faltas > 0) deductions.push({ label: 'Faltas não justificadas (dia + DSR)', value: faltas });
  if (transport) deductions.push({ label: 'Vale-transporte (6%)', value: round(Math.min(gross * 0.06, gross)) });
  const totalDed = round(deductions.reduce((s, d) => s + d.value, 0));
  return {
    earnings,
    deductions,
    total,
    base,
    totalDed,
    net: round(total - totalDed),
    fgts: round(base * 0.08),
  };
}

// ─── Faltas ──────────────────────────────────────────────────────────────────
export const DIAS_BASE_MES = 30;

/** Uma falta não justificada desconta o dia perdido + o DSR (domingo). */
export function calcularDescontoFalta(salario) {
  const dia = round((Number(salario) || 0) / DIAS_BASE_MES);
  return { dia, dsr: dia, total: round(dia * 2) };
}

/** Quantidades e desconto total das faltas lançadas no mês. */
export function resumoFaltas(faltas = [], salario = 0) {
  const naoJustificadas = faltas.filter((f) => f.tipo === 'nao_justificada');
  const unitario = calcularDescontoFalta(salario).total;
  const desconto = round(
    naoJustificadas.reduce((s, f) => s + (Number(f.desconto_total) || unitario), 0),
  );
  return {
    justificadas: faltas.length - naoJustificadas.length,
    naoJustificadas: naoJustificadas.length,
    desconto,
  };
}

// ─── Custo real do empregador ────────────────────────────────────────────────
// FGTS 8% + INSS patronal 20% + terceiros 5,8% + RAT 2% + provisões mensais de
// 13º e férias + 1/3. Para um salário de R$ 2.000: 160 + 556 + 277,77.
export const CUSTO_EMPRESA = {
  fgts: 0.08,
  patronal: 0.278,
  provisoes: 0.138885,
};

export function calcularCustoEmpresa(salario) {
  const s = round(Number(salario) || 0);
  const fgts = round(s * CUSTO_EMPRESA.fgts);
  const patronal = round(s * CUSTO_EMPRESA.patronal);
  const provisoes = round(s * CUSTO_EMPRESA.provisoes);
  return { salario: s, fgts, patronal, provisoes, total: round(s + fgts + patronal + provisoes) };
}

/** Folha base, custo real do mês e passivo de demissão de um colaborador. */
export function custoRealFuncionario(funcionario, hoje = todayISO()) {
  const salario = Number(funcionario?.salary) || 0;
  const custo = calcularCustoEmpresa(salario);
  const meses = monthsBetween(funcionario?.admission_date, hoje);
  return {
    folha: salario,
    custoReal: custo.total,
    passivo: custoDemissao(salario, meses).total,
    meses,
    custo,
  };
}

/** Totais da empresa: folha base, custo real do mês e passivo de demissão. */
export function calcularTotaisEmpresa(funcionarios = [], hoje = todayISO()) {
  return funcionarios.reduce(
    (acc, f) => {
      const { folha, custoReal, passivo, custo } = custoRealFuncionario(f, hoje);
      acc.folha = round(acc.folha + folha);
      acc.fgts = round(acc.fgts + custo.fgts);
      acc.patronal = round(acc.patronal + custo.patronal);
      acc.provisoes = round(acc.provisoes + custo.provisoes);
      acc.custoReal = round(acc.custoReal + custoReal);
      acc.passivo = round(acc.passivo + passivo);
      return acc;
    },
    { folha: 0, fgts: 0, patronal: 0, provisoes: 0, custoReal: 0, passivo: 0 },
  );
}