import { base44 } from '@/api/base44Client';

/**
 * Tabelas oficiais do app (INSS, FGTS, IRRF, INSS patronal e salário mínimo).
 *
 * Os cálculos NÃO usam valores chapados: eles leem a entidade ConfigFiscal.
 * Enquanto a base não carrega (ou se ela estiver vazia), os valores de
 * referência abaixo — Portaria Interministerial MPS/MF nº 13/2026 — são usados,
 * e são exatamente os que ficaram gravados em ConfigFiscal.
 */
const TETO = 99999999;

export const PADRAO = {
  inss: [
    { de: 0, ate: 1621.0, aliquota: 7.5 },
    { de: 1621.01, ate: 2902.84, aliquota: 9 },
    { de: 2902.85, ate: 4354.27, aliquota: 12 },
    { de: 4354.28, ate: 8475.55, aliquota: 14 },
  ],
  irrf: [
    { de: 0, ate: 2259.2, aliquota: 0, deducao: 0 },
    { de: 2259.21, ate: 2826.65, aliquota: 7.5, deducao: 182.16 },
    { de: 2826.66, ate: 3751.05, aliquota: 15, deducao: 394.16 },
    { de: 3751.06, ate: 4664.68, aliquota: 22.5, deducao: 675.49 },
    { de: 4664.69, ate: Infinity, aliquota: 27.5, deducao: 908.73 },
  ],
  fgts: 8,
  patronal: 27.8,
  salarioMinimo: 1621,
  vigencia: '2026-01-01',
  atualizadoEm: null,
  fonte: 'Portaria Interministerial MPS/MF nº 13/2026',
  vazio: true,
};

let cache = null;

const chave = (v) =>
  String(v ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();

const numero = (v) => (v === null || v === undefined || v === '' ? null : Number(v));

const ate = (v) => {
  const n = numero(v);
  return n === null || n <= 0 || n >= TETO ? Infinity : n;
};

const porFaixa = (a, b) => (numero(a.faixa_de) || 0) - (numero(b.faixa_de) || 0);

function normalizar(linhas) {
  const rows = (Array.isArray(linhas) ? linhas : linhas?.items) || [];
  const achar = (nome) => rows.filter((r) => chave(r.nome_tabela).includes(nome));
  const inss = achar('INSS').filter((r) => !chave(r.nome_tabela).includes('PATRONAL')).sort(porFaixa);
  const irrf = achar('IRRF').sort(porFaixa);
  const fgts = achar('FGTS')[0];
  const patronal = achar('PATRONAL')[0];
  const minimo = achar('SALARIO')[0];

  return {
    inss: inss.length
      ? inss.map((r) => ({ de: numero(r.faixa_de) || 0, ate: ate(r.faixa_ate), aliquota: numero(r.porcentagem) ?? 0 }))
      : PADRAO.inss,
    irrf: irrf.length
      ? irrf.map((r) => ({
          de: numero(r.faixa_de) || 0,
          ate: ate(r.faixa_ate),
          aliquota: numero(r.porcentagem) ?? 0,
          deducao: numero(r.valor_fixo) || 0,
        }))
      : PADRAO.irrf,
    fgts: numero(fgts?.porcentagem) || PADRAO.fgts,
    patronal: numero(patronal?.porcentagem) || PADRAO.patronal,
    salarioMinimo: numero(minimo?.valor_fixo) || numero(minimo?.faixa_de) || PADRAO.salarioMinimo,
    vigencia: rows.map((r) => r.data_vigencia).filter(Boolean).sort().pop() || PADRAO.vigencia,
    atualizadoEm: rows.map((r) => r.atualizado_em).filter(Boolean).sort().pop() || null,
    fonte: inss[0]?.fonte_oficial || PADRAO.fonte,
    vazio: rows.length === 0,
  };
}

/** Tabelas oficiais em vigor (síncrono, usa o cache carregado ou o padrão). */
export function getFiscal() {
  return cache || PADRAO;
}

/** Carrega as tabelas oficiais de ConfigFiscal (uma vez por sessão). */
export async function carregarFiscal(forcar = false) {
  if (cache && !forcar) return cache;
  const page = await base44.entities.ConfigFiscal.list({ sort: 'nome_tabela', limit: 200 });
  cache = normalizar(page);
  return cache;
}

/** Atualiza uma linha da tabela oficial e recarrega o motor de cálculo. */
export async function salvarTabelaFiscal(id, patch) {
  const campo = 'valor_fixo' in patch ? 'valor_fixo' : 'porcentagem';
  const valor = Number(patch[campo]);
  if (!Number.isFinite(valor) || valor < 0) throw new Error('Informe um número válido.');
  if (campo === 'porcentagem' && valor > 100) throw new Error('A porcentagem deve ficar entre 0 e 100.');
  await base44.entities.ConfigFiscal.update(id, {
    [campo]: valor,
    atualizado_em: new Date().toISOString(),
  });
  return carregarFiscal(true);
}

/** Data (ISO) da última atualização das tabelas oficiais. */
export function dataAtualizacaoFiscal() {
  const f = getFiscal();
  return f.atualizadoEm || f.vigencia;
}

/** Faixa do INSS em que o salário se encaixa. */
export function faixaInss(salario) {
  const s = Number(salario) || 0;
  const faixas = getFiscal().inss;
  return faixas.find((f) => s >= f.de && s <= f.ate) || faixas[faixas.length - 1];
}