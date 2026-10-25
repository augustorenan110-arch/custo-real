import { jsPDF } from 'jspdf';
import { brl, cnpjBR, dateBR } from '@/lib/format';
import { custoDemissao } from '@/lib/campanha';
import { monthsBetween } from '@/lib/rescisao';
import { calcularTotaisEmpresa, resumoFaltas } from '@/lib/payroll';
import { fmtMinutes } from '@/lib/timesheet';

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

export const mesReferencia = (month) => {
  const [ano, m] = String(month || '').split('-');
  const nome = MESES[Number(m) - 1];
  return nome ? `${nome[0].toUpperCase()}${nome.slice(1)}/${ano}` : String(month || '');
};

/**
 * Relatório contábil em PDF (jsPDF) com o custo real da folha, o passivo de
 * demissão, o ranking de risco e as irregularidades de ponto do mês.
 */
export function buildRelatorioContador({
  empresa,
  funcionarios = [],
  month,
  incluir = {},
  ponto = {},
  faltas = [],
  emitidoEm = new Date(),
}) {
  const doc = new jsPDF();
  const hoje = emitidoEm.toISOString().slice(0, 10);
  const totais = calcularTotaisEmpresa(funcionarios, hoje);
  const mes = mesReferencia(month);
  const faltasMes = resumoFaltas(faltas, 0);

  let y = 40;
  const quebra = (altura = 8) => {
    if (y + altura > 276) {
      doc.addPage();
      y = 24;
    }
  };
  const linha = (texto, { size = 10, style = 'normal', cor = [17, 17, 17], x = 12, gap = 6 } = {}) => {
    quebra(gap);
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(cor[0], cor[1], cor[2]);
    doc.text(String(texto), x, y);
    y += gap;
  };
  const paragrafo = (texto, { size = 10, style = 'normal', cor = [17, 17, 17], x = 12 } = {}) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(cor[0], cor[1], cor[2]);
    for (const l of doc.splitTextToSize(String(texto), 186)) {
      quebra(6);
      doc.text(l, x, y);
      y += 5;
    }
  };
  let nSecao = 0;
  const secao = (titulo) => {
    nSecao += 1;
    y += 4;
    linha(`${nSecao}. ${titulo}`, { size: 12, style: 'bold', gap: 8 });
  };

  const emitido = `${emitidoEm.toLocaleDateString('pt-BR')} ${emitidoEm.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  // Cabeçalho
  doc.setFillColor(8, 8, 10);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(34, 197, 94);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('CUSTO REAL', 12, 14);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('RH IA - Relatório Contábil', 12, 20);
  doc.setFontSize(8);
  doc.text(
    `Mês: ${mes} | Empresa: ${empresa?.name || '—'} | CNPJ ${cnpjBR(empresa?.cnpj)} | ${funcionarios.length} funcionários | Gerado ${emitido}`,
    12,
    25,
  );

  // 1. Resumo financeiro
  secao('RESUMO FINANCEIRO');
  linha(`Folha base: ${brl(totais.folha)}`);
  linha(`FGTS 8%: ${brl(totais.fgts)}`);
  linha(`INSS Patronal 20% + Terceiros 5,8% + RAT 2%: ${brl(totais.patronal)}`);
  linha(`Provisões 13º + Férias + 1/3 (1/12 por mês): ${brl(totais.provisoes)}`);
  linha(
    `Faltas: ${faltasMes.justificadas} Justificadas (R$0) / ${faltasMes.naoJustificadas} Não Justificadas (Desconto ${brl(faltasMes.desconto)})`,
  );
  linha(`CUSTO REAL TOTAL DO MÊS: ${brl(totais.custoReal)}`, { size: 11, style: 'bold', gap: 8 });

  const detalhes = funcionarios
    .map((f) => {
      const mesesCasa = monthsBetween(f.admission_date, hoje);
      const det = custoDemissao(f.salary, mesesCasa);
      return { f, mesesCasa, det, multa: det.fgtsAcumulado * 0.4 };
    })
    .sort((a, b) => b.det.total - a.det.total);

  // 2. Passivo oculto
  if (incluir.passivo !== false) {
    secao('PASSIVO OCULTO - CUSTO DE DEMISSÃO HOJE');
    linha(`${brl(totais.passivo)} - valor total se demitir todo o time hoje`, {
      size: 11,
      style: 'bold',
      cor: [200, 0, 0],
      gap: 9,
    });
    for (const { f, mesesCasa, det, multa } of detalhes) {
      paragrafo(
        `${f.full_name} - Admissão ${dateBR(f.admission_date)} (${mesesCasa} meses) - Salário ${brl(f.salary)} - Custo de demissão ${brl(det.total)}`,
      );
      paragrafo(
        `   FGTS acumulado ${brl(det.fgtsAcumulado)} + Multa 40% ${brl(multa)} + férias e 13º proporcionais + aviso prévio`,
        { size: 9, cor: [90, 90, 90] },
      );
      y += 2;
    }
  }

  // 3. Ranking de risco
  if (incluir.ranking !== false) {
    secao('RANKING DE RISCO POR FUNCIONÁRIO');
    if (!detalhes.length) linha('Nenhum funcionário cadastrado.');
    detalhes.forEach(({ f, det }, i) =>
      linha(`${i + 1}. ${f.full_name} - ${brl(det.total)} (salário ${brl(f.salary)})`),
    );
    y += 2;
  }

  // 4. Ponto
  if (incluir.ponto !== false) {
    secao(`RISCO TRABALHISTA - PONTO EM ${mes.toUpperCase()}`);
    if (!funcionarios.length) linha('Nenhum funcionário cadastrado.');
    for (const f of funcionarios) {
      const p = ponto[f.id] || { worked: 0, late: 0, extra: 0, dias: 0 };
      if (!p.dias) {
        paragrafo(
          `${f.full_name}: nenhum registro de ponto em ${mes} = risco trabalhista. Funcionário sem comprovação facial de jornada.`,
        );
      } else {
        paragrafo(
          `${f.full_name}: ${p.dias} dia(s) registrados - ${fmtMinutes(p.worked)} trabalhadas, ${fmtMinutes(p.late)} de atraso e ${fmtMinutes(p.extra)} extras.`,
        );
      }
    }
    paragrafo('Recomendação: exigir ponto facial com prova de vida (anti-fraude) de todo o time.', {
      size: 9,
      style: 'bold',
    });
  }

  // Rodapé
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Documento gerado por Custo Real RH IA - Validade contábil - Não substitui contabilidade oficial', 12, 285);
  doc.text('www.custo-real.com | Assinado digitalmente', 12, 288);

  return doc;
}

export const nomeArquivoRelatorio = (empresaNome, month) =>
  `Relatorio-Contador-${String(empresaNome || 'empresa').replace(/[^\w]+/g, '-')}-${month}.pdf`;