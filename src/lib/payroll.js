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

export function buildPayslip({ gross, extraHours = 0, hourValue, transport = false, dependents = 0 }) {
  const extras = round(extraHours * (hourValue ?? gross / 220) * 1.5);
  const earnings = [{ label: 'Salário base', value: round(gross) }];
  if (extras > 0) earnings.push({ label: `Horas extras (${extraHours.toFixed(1)}h a 50%)`, value: extras });
  const total = round(earnings.reduce((s, e) => s + e.value, 0));
  const inss = calcInss(total);
  const irrf = calcIrrf(total, inss, dependents);
  const deductions = [
    { label: 'INSS', value: inss },
    { label: 'IRRF', value: irrf },
  ];
  if (transport) deductions.push({ label: 'Vale-transporte (6%)', value: round(Math.min(gross * 0.06, gross)) });
  const totalDed = round(deductions.reduce((s, d) => s + d.value, 0));
  return { earnings, deductions, total, totalDed, net: round(total - totalDed), fgts: round(total * 0.08) };
}