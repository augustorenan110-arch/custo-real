import { jsPDF } from 'jspdf';
import { brl, dateBR } from '@/lib/format';
import { fmtMinutes } from '@/lib/timesheet';

function header(doc, title, company, subtitle) {
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(company?.name || 'Empresa', 14, 18);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`CNPJ: ${company?.cnpj || '—'}${company?.activity ? '  ·  ' + company.activity : ''}`, 14, 24);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 36);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (subtitle) doc.text(subtitle, 14, 42);
}

function table(doc, y, rows, cols) {
  doc.setFontSize(9);
  for (const r of rows) {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
    cols.forEach(([key, x, align]) => doc.text(String(r[key] ?? ''), x, y, { align: align || 'left' }));
    y += 6;
  }
  return y;
}

export function payslipPdf({ company, employee, month, slip }) {
  const doc = new jsPDF();
  header(doc, `Holerite — ${month}`, company, `${employee.full_name}  ·  ${employee.role_title || 'Colaborador'}  ·  Admissão: ${dateBR(employee.admission_date)}`);
  let y = 54;
  doc.setFont('helvetica', 'bold');
  doc.text('Proventos', 14, y);
  doc.setFont('helvetica', 'normal');
  y = table(doc, y + 7, slip.earnings.map((e) => ({ l: e.label, v: brl(e.value) })), [['l', 14], ['v', 196, 'right']]);
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('Descontos', 14, y);
  doc.setFont('helvetica', 'normal');
  y = table(doc, y + 7, slip.deductions.map((e) => ({ l: e.label, v: brl(e.value) })), [['l', 14], ['v', 196, 'right']]);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(`Total de proventos: ${brl(slip.total)}`, 14, y);
  doc.text(`Total de descontos: ${brl(slip.totalDed)}`, 14, y + 6);
  doc.setFontSize(12);
  doc.text(`Líquido a receber: ${brl(slip.net)}`, 14, y + 16);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`FGTS do mês (depósito do empregador): ${brl(slip.fgts)}`, 14, y + 24);
  doc.text('Documento gerado pelo Custo Real. Valores de INSS/IRRF calculados por tabela de referência.', 14, 288);
  doc.save(`holerite-${employee.full_name.replace(/\s+/g, '_')}-${month}.pdf`);
}

export function timesheetPdf({ company, employee, month, sheet }) {
  const doc = new jsPDF();
  header(doc, `Espelho de ponto — ${month}`, company, `${employee.full_name}  ·  ${employee.role_title || 'Colaborador'}`);
  let y = 52;
  doc.setFont('helvetica', 'bold');
  doc.text('Dia', 14, y);
  doc.text('Entrada', 60, y);
  doc.text('Saída', 90, y);
  doc.text('Trabalhado', 125, y);
  doc.text('Atraso', 160, y);
  doc.text('Extra', 190, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  y = table(
    doc,
    y + 7,
    sheet.rows.map((r) => ({
      d: dateBR(r.day), e: r.entrada, s: r.saida, w: fmtMinutes(r.minutes), l: fmtMinutes(r.lateMin), x: fmtMinutes(r.extraMin),
    })),
    [['d', 14], ['e', 60], ['s', 90], ['w', 125], ['l', 160], ['x', 190, 'right']],
  );
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(`Total trabalhado: ${fmtMinutes(sheet.worked)}   Atrasos: ${fmtMinutes(sheet.late)}   Horas extras: ${fmtMinutes(sheet.extra)}`, 14, y);
  doc.setFont('helvetica', 'normal');
  doc.text('_______________________________            _______________________________', 14, y + 24);
  doc.text('Assinatura do colaborador                              Assinatura da empresa', 14, y + 30);
  doc.save(`espelho-${employee.full_name.replace(/\s+/g, '_')}-${month}.pdf`);
}

export function expensesPdf({ company, employee, expenses }) {
  const doc = new jsPDF();
  const total = expenses.filter((e) => e.status === 'approved').reduce((s, e) => s + (e.amount || 0), 0);
  header(doc, 'Relatório de gastos', company, `${employee.full_name}  ·  Aprovado: ${brl(total)}`);
  let y = 52;
  doc.setFont('helvetica', 'bold');
  doc.text('Data', 14, y);
  doc.text('Estabelecimento', 40, y);
  doc.text('Categoria', 110, y);
  doc.text('Situação', 150, y);
  doc.text('Valor', 196, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  const labels = { pending: 'Pendente', approved: 'Aprovada', rejected: 'Rejeitada' };
  table(
    doc,
    y + 7,
    expenses.map((e) => ({
      d: dateBR(e.expense_date), m: String(e.merchant || '—').slice(0, 34), c: e.category, s: labels[e.status] || e.status, v: brl(e.amount),
    })),
    [['d', 14], ['m', 40], ['c', 110], ['s', 150], ['v', 196, 'right']],
  );
  doc.save(`gastos-${employee.full_name.replace(/\s+/g, '_')}.pdf`);
}