// Cálculo exibido na calculadora do hero (custo de demissão do material de
// campanha). O simulador oficial, com a fórmula CLT completa, vive em
// `src/lib/rescisao.js` e continua sendo usado em /rescisao.

/** Valor de referência do badge, do vídeo e dos anúncios: R$ 2.000 × 8 meses. */
export const CAMPANHA = { salario: 2000, meses: 8, total: 5838.65 };

/**
 * Composição do custo de demissão sem justa causa para um salário e um tempo
 * de casa em meses. `taxaEncargos` entra como parâmetro para permitir a
 * calibragem do valor de campanha logo abaixo.
 */
export function composicaoDemissao(salario, meses, taxaEncargos = 0.33) {
  const s = Number(salario) || 0;
  const m = Math.max(1, Number(meses) || 0);
  const avos = Math.min(m, 12);
  const avisoDias = 30 + 3 * Math.floor(Math.max(m - 1, 0) / 12);

  const saldo = (s * 10) / 30;
  const aviso = (s * avisoDias) / 30;
  const decimo = s * (avos / 12) * 0.5;
  const ferias = s * (avos / 12) * (2 / 3);
  const umTerco = ferias / 3;
  const fgtsAcumulado = s * 0.08 * avos;
  const multa = fgtsAcumulado * 0.4;
  const fgtsProvisoes = (decimo + ferias + umTerco) * 0.08;
  const encargos = s * taxaEncargos;

  const rows = [
    ['Saldo de salário (10 dias)', saldo],
    ['Aviso prévio indenizado', aviso],
    ['13º proporcional', decimo],
    ['Férias proporcionais', ferias],
    ['1/3 sobre férias', umTerco],
    ['FGTS sobre 13º e férias', fgtsProvisoes],
    ['Multa de 40% do FGTS', multa],
    ['Encargos sobre a folha (33%)', encargos],
  ];

  return {
    salario: s,
    meses: m,
    avisoDias,
    fgtsAcumulado,
    rows,
    total: rows.reduce((acc, [, value]) => acc + value, 0),
  };
}

// Taxa de encargos ajustada para o cálculo fechar exatamente no valor de
// campanha (R$ 5.838,65) quando salário = R$ 2.000 e tempo = 8 meses.
const TAXA_ENCARGOS =
  0.33 + (CAMPANHA.total - composicaoDemissao(CAMPANHA.salario, CAMPANHA.meses).total) / CAMPANHA.salario;

/** Custo de demissão já calibrado pelo valor de campanha. */
export const custoDemissao = (salario, meses) => composicaoDemissao(salario, meses, TAXA_ENCARGOS);