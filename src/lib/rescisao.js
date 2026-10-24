// Gasto com demissão (rescisão) — fórmula CLT usada no simulador /rescisao
// e no modal "Demitir" da lista de colaboradores.

export const TERMINATION_TYPES = [
  { value: 'sem_justa_causa', label: 'Sem Justa Causa' },
  { value: 'justa_causa', label: 'Justa Causa' },
  { value: 'pedido', label: 'Pedido de demissão' },
];

export const terminationTypeLabel = (v) =>
  TERMINATION_TYPES.find((t) => t.value === v)?.label || '—';

const round = (n) => Math.round((Number(n) || 0) * 100) / 100;
const day = (v) => {
  const d = new Date(`${String(v).slice(0, 10)}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Meses completos entre admissão e demissão. */
export function monthsBetween(admissao, demissao) {
  const a = day(admissao);
  const b = day(demissao);
  if (!a || !b || b < a) return 0;
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) months -= 1;
  return Math.max(0, months);
}

/** Avos contados do início do período até a demissão (mês só conta com 15+ dias). */
function avos(from, demissao) {
  const a = day(from);
  const b = day(demissao);
  if (!a || !b || b < a) return 0;
  let count = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (a.getDate() > 15) count -= 1;
  if (b.getDate() >= 15) count += 1;
  return Math.max(0, Math.min(12, count));
}

export function calcRescisao({
  salario_base,
  data_admissao,
  data_demissao,
  tipo_demissao = 'sem_justa_causa',
  saldo_fgts_total,
  tem_aviso_trabalhado = false,
  periodos_ferias_vencidas = 0,
}) {
  const salario = Number(salario_base) || 0;
  const admissao = day(data_admissao);
  const demissao = day(data_demissao);
  if (!salario || !admissao || !demissao || demissao < admissao) return null;

  const meses_trabalhados = monthsBetween(data_admissao, data_demissao);
  const anos_completos = Math.floor(meses_trabalhados / 12);
  const dias_trabalhados_mes = demissao.getDate();
  const fgts = Number(saldo_fgts_total) || 0;

  // Avos de 13º: meses do ano corrente (a partir da admissão, se foi neste ano).
  const inicioAno = new Date(demissao.getFullYear(), 0, 1, 12);
  const avos_13 = avos(admissao > inicioAno ? admissao : inicioAno, data_demissao);

  // Avos de férias: período aquisitivo atual (último aniversário de admissão).
  const inicioPeriodo = new Date(admissao);
  inicioPeriodo.setFullYear(inicioPeriodo.getFullYear() + anos_completos);
  const avos_ferias = avos(inicioPeriodo, data_demissao);

  // A) Saldo de salário
  const saldo = round((salario / 30) * dias_trabalhados_mes);

  // B) Aviso prévio indenizado (30 dias + 3 por ano completo, máx. 90)
  const avisoDias = Math.min(90, 30 + 3 * anos_completos);
  const aviso =
    tipo_demissao === 'sem_justa_causa' && !tem_aviso_trabalhado ? round((salario / 30) * avisoDias) : 0;

  // C) 13º proporcional
  const decimo = round((salario / 12) * avos_13);

  // D) Férias proporcionais
  const feriasProp = round((salario / 12) * avos_ferias);

  // E) 1/3 sobre férias proporcionais
  const tercoProp = round(feriasProp / 3);

  // F) Férias vencidas + 1/3 (por período completo não gozado)
  const periodosVencidos = Math.max(0, Number(periodos_ferias_vencidas) || 0);
  const feriasVencidas = round((salario + salario / 3) * periodosVencidos);

  // G) FGTS do mês da rescisão
  const fgtsMes = round(0.08 * (saldo + decimo));

  // H) Multa de 40% do FGTS
  const multa = tipo_demissao === 'sem_justa_causa' ? round(fgts * 0.4) : 0;

  const total = round(
    saldo + aviso + decimo + feriasProp + tercoProp + feriasVencidas + fgtsMes + multa,
  );

  return {
    salario,
    meses_trabalhados,
    anos_completos,
    dias_trabalhados_mes,
    avos_13,
    avos_ferias,
    avisoDias: aviso > 0 ? avisoDias : 0,
    saldo,
    aviso,
    decimo,
    feriasProp,
    tercoProp,
    feriasVencidas,
    fgtsMes,
    multa,
    saldoFgts: fgts,
    total,
    rows: [
      ['Saldo de Salário', saldo],
      [`Aviso Prévio (${aviso > 0 ? `${avisoDias} dias` : 'não devido'})`, aviso],
      [`13º Proporcional (${avos_13}/12 avos)`, decimo],
      [`Férias Proporcionais (${avos_ferias}/12 avos)`, feriasProp],
      ['1/3 sobre Férias Prop', tercoProp],
      ['Férias Vencidas + 1/3', feriasVencidas],
      ['FGTS do Mês', fgtsMes],
      [`Multa 40% FGTS (sobre ${fgts.toFixed(2)})`, multa],
    ],
  };
}

export const suggestedFgts = (salario, meses) =>
  round((Number(salario) || 0) * 0.08 * (Number(meses) || 0));