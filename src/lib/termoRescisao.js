import { jsPDF } from 'jspdf';
import { brl, cnpjBR, dateBR } from '@/lib/format';
import { terminationTypeLabel } from '@/lib/rescisao';

/**
 * Termo de rescisão em PDF (jsPDF) com os dados do simulador, as verbas
 * rescisórias da CLT e o desembolso total do empregador.
 */
export function buildTermoRescisao({ empresa, form, r, card, emitidoEm = new Date() }) {
  const doc = new jsPDF();
  const emitido = `${emitidoEm.toLocaleDateString('pt-BR')} ${emitidoEm.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  let y = 38;
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
  let nSecao = 0;
  const secao = (titulo) => {
    nSecao += 1;
    y += 4;
    linha(`${nSecao}. ${titulo}`, { size: 12, style: 'bold', gap: 8 });
  };

  // Cabeçalho
  doc.setFillColor(8, 8, 10);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(34, 197, 94);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('CUSTO REAL', 12, 14);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('TERMO DE RESCISÃO DO CONTRATO DE TRABALHO', 12, 20);
  doc.setFontSize(8);
  doc.text(
    `Empresa: ${empresa?.name || '—'} | CNPJ ${cnpjBR(empresa?.cnpj)} | Gerado ${emitido}`,
    12,
    25,
  );

  // 1. Dados da rescisão
  secao('DADOS DA RESCISÃO');
  linha(`Motivo: ${terminationTypeLabel(form.tipo)}`);
  linha(`Admissão: ${dateBR(form.admissao)}    Demissão: ${dateBR(form.demissao)}`);
  linha(`Tempo de casa: ${r?.meses_trabalhados ?? 0} meses    Salário base: ${brl(form.salario)}`);
  linha(`Saldo de FGTS considerado: ${brl(card.fgts)}`, { gap: 8 });

  // 2. Verbas rescisórias
  secao('VERBAS RESCISÓRIAS (CLT)');
  for (const [label, value] of r?.rows || []) {
    linha(`${label}: ${brl(value)}`, { size: 10 });
  }
  linha(`TOTAL DAS VERBAS RESCISÓRIAS: ${brl(r?.total || 0)}`, { size: 11, style: 'bold', gap: 10 });

  // 3. Desembolso do empregador
  secao('DESEMBOLSO TOTAL DO EMPREGADOR');
  linha(`Saldo do FGTS a liberar: ${brl(card.fgts)}`);
  linha(`Multa de 40% sobre o FGTS: ${brl(card.multa40)}`);
  linha(`Aviso prévio indenizado: ${brl(card.avisoPrevio)}`);
  linha(`13º proporcional: ${brl(card.decimoTerceiro)}`);
  linha(`Férias proporcionais: ${brl(card.ferias)}`);
  linha(`1/3 constitucional sobre férias: ${brl(card.umTercoFerias)}`);
  linha(`TOTAL PARA DEMITIR HOJE: ${brl(card.total)}`, { size: 11, style: 'bold', cor: [180, 0, 0], gap: 14 });

  // 4. Assinaturas
  secao('DECLARAÇÃO E ASSINATURAS');
  linha('As partes declaram que os valores acima conferem com o cálculo rescisório apresentado.', {
    size: 9,
    cor: [60, 60, 60],
    gap: 12,
  });

  const base = Math.min(Math.max(y + 14, 240), 262);
  doc.setDrawColor(120, 120, 120);
  doc.line(14, base, 92, base);
  doc.line(118, base, 196, base);
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text('Empregador', 14, base + 5);
  doc.text('Colaborador', 118, base + 5);

  // Rodapé
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('Documento gerado por Custo Real RH IA - Validade contábil - Não substitui contabilidade oficial', 12, 285);
  doc.text('www.custo-real.com | Assinado digitalmente', 12, 288);

  return doc;
}