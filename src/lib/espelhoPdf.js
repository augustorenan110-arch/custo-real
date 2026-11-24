import { jsPDF } from 'jspdf';
import { cnpjBR, cpfBR } from '@/lib/format';
import { mapsUrl } from '@/lib/geo';
import { buildEspelho, ESPELHO_COLUMNS, MONTHLY_HOURS, espelhoDate, espelhoPeriod, formatEspelhoMinutes, monthLabel } from '@/lib/espelhoMonthly';

const WIDTHS = [20, 19, 15, 20, 22, 15, 20, 15, 15, 25];
const LEFT = 12;
const WIDTH = 186;
const ROW_HEIGHT = 5.3;
const INK = [25, 35, 50];
const BLUE = [37, 99, 235];
const RED = [200, 35, 45];

function drawHeader(doc, company, employee, month) {
  const period = espelhoPeriod(month, company?.workday_hours || 8);
  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('ESPELHO DE PONTO', LEFT, 14);
  doc.setFontSize(8);
  doc.text(doc.splitTextToSize(String(company?.name || 'Empresa').toUpperCase(), 85)[0], 198, 14, { align: 'right' });
  doc.setDrawColor(...BLUE);
  doc.line(LEFT, 19, 198, 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Nome: ${String(employee.full_name).toUpperCase()}`, LEFT, 27);
  doc.text(`CPF: ${cpfBR(employee.cpf)}`, 118, 27);
  doc.text(`Cargo: ${employee.role_title || '--'}`, LEFT, 33);
  doc.text(`Jornada: ${period.journey}`, 118, 33);
  doc.text(`Carga Mensal: ${MONTHLY_HOURS}h`, LEFT, 39);
  doc.text(`CNPJ: ${cnpjBR(company?.cnpj)}`, 118, 39);
  doc.setFontSize(8);
  doc.text(`Período: ${period.first} a ${period.last}`, LEFT, 46);
  doc.text(monthLabel(month), 198, 46, { align: 'right' });
  doc.setFillColor(...BLUE);
  doc.rect(LEFT, 50, WIDTH, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(255, 255, 255);
  let x = LEFT;
  ESPELHO_COLUMNS.forEach((label, index) => {
    doc.text(doc.splitTextToSize(label, WIDTHS[index] - 3), x + 1.5, 54, { lineHeightFactor: 1.1 });
    x += WIDTHS[index];
  });
}

function drawRows(doc, rows) {
  let y = 60;
  rows.forEach((row, index) => {
    doc.setFillColor(...(row.status === 'Falta' ? [255, 242, 242] : row.weekend || index % 2 ? [245, 247, 250] : [255, 255, 255]));
    doc.rect(LEFT, y, WIDTH, ROW_HEIGHT, 'F');
    const cells = [espelhoDate(row.day), row.weekday, row.hasEntries ? row.entrada : row.status, row.saidaAlmoco, row.voltaAlmoco, row.saida, formatEspelhoMinutes(row.minutes), formatEspelhoMinutes(row.lateMin), formatEspelhoMinutes(row.extraMin), row.local];
    let x = LEFT;
    cells.forEach((value, column) => {
      doc.setTextColor(...(column === 2 && row.status === 'Falta' ? RED : INK));
      doc.setFont('helvetica', column === 2 && !row.hasEntries ? 'bold' : 'normal');
      doc.setFontSize(column === 9 ? 6.2 : 6.9);
      const text = doc.splitTextToSize(String(value), WIDTHS[column] - 3).slice(0, 2);
      if (column === 9 && row.lat != null && row.lng != null) {
        doc.setTextColor(...BLUE);
        text.forEach((line, lineIndex) => doc.textWithLink(line, x + 1.5, y + 3.4 + lineIndex * 2.1, { url: mapsUrl(row.lat, row.lng) }));
      } else doc.text(text, x + 1.5, y + (text.length > 1 ? 2.4 : 3.4), { lineHeightFactor: 1 });
      x += WIDTHS[column];
    });
    doc.setDrawColor(218, 224, 232);
    doc.line(LEFT, y + ROW_HEIGHT, 198, y + ROW_HEIGHT);
    y += ROW_HEIGHT;
  });
  return y;
}

function drawFooter(doc, company, employee, sheet, y) {
  const top = y + 4;
  const total = sheet.totals;
  const summary = [['Total Trabalhado', formatEspelhoMinutes(total.worked)], ['Horas Esperadas', `${MONTHLY_HOURS}h`], ['Faltas', String(total.absences)], ['Atrasos', formatEspelhoMinutes(total.late)], ['Horas Extras', formatEspelhoMinutes(total.extra)]];
  doc.setFillColor(235, 242, 255);
  doc.rect(LEFT, top, WIDTH, 15, 'F');
  doc.setTextColor(...INK);
  summary.forEach(([label, value], index) => {
    const x = LEFT + 3 + index * WIDTH / summary.length;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(label, x, top + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(value, x, top + 11);
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  if (company?.cidade_uf) doc.text('Local: cidade/UF de referência da empresa. Os links abrem as coordenadas originais das marcações.', LEFT, top + 20);
  if (sheet.inferred) doc.text('Saída inferida pela última batida em dias com entradas repetidas. Registros originais preservados.', LEFT, top + 24);
  const signatureY = top + 40;
  const date = espelhoPeriod(sheet.month).last;
  const signatures = [
    { x: 18, center: 58, name: String(employee.full_name).toUpperCase(), document: `CPF: ${cpfBR(employee.cpf)}`, label: 'Assinatura do funcionário' },
    { x: 112, center: 152, name: String(company?.name || 'Empresa').toUpperCase(), document: `CNPJ: ${cnpjBR(company?.cnpj)}`, label: 'Assinatura do empregador' },
  ];
  signatures.forEach((signature) => {
    doc.setDrawColor(90, 100, 115);
    doc.line(signature.x, signatureY, signature.x + 80, signatureY);
    doc.setFontSize(7.5);
    doc.text(signature.label, signature.center, signatureY + 4, { align: 'center' });
    doc.text(signature.name, signature.center, signatureY + 8, { align: 'center' });
    doc.setFontSize(6.5);
    doc.text(signature.document, signature.center, signatureY + 12, { align: 'center' });
    doc.text(`Data: ${date}`, signature.center, signatureY + 16, { align: 'center' });
  });
  doc.setFontSize(6);
  doc.text('Custo Real RH IA', 105, 291, { align: 'center' });
}

export function createEspelhoPdf({ company, employee, month, entries }) {
  const sheet = buildEspelho(entries, month, { workdayHours: company?.workday_hours || 8, city: company?.cidade_uf || '' });
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  doc.setProperties({ title: `Espelho de Ponto - ${employee.full_name} - ${month}`, subject: 'Espelho mensal completo', creator: 'Custo Real RH IA' });
  drawHeader(doc, company, employee, month);
  drawFooter(doc, company, employee, sheet, drawRows(doc, sheet.rows));
  return doc;
}

export function espelhoPdf(options) {
  const doc = createEspelhoPdf(options);
  const name = String(options.employee.full_name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '_');
  doc.save(`espelho-ponto-${name}-${options.month}.pdf`);
}