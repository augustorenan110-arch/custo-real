// Espelho de ponto: monta as linhas do mês a partir dos registros (TimeEntry)
// e gera o PDF para assinatura.
import { jsPDF } from 'jspdf';
import { cnpjBR, cpfBR, dateBR, localISO } from '@/lib/format';
import { fmtMinutes } from '@/lib/timesheet';

const WEEKDAYS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

const hhmm = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const slug = (s) => String(s || 'colaborador').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_');

export const monthLabel = (month) => {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

function daysOfMonth(month) {
  const [y, m] = month.split('-').map(Number);
  const total = new Date(y, m, 0).getDate();
  return Array.from({ length: total }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`);
}

// entries: TimeEntry[] · month: 'YYYY-MM'
export function buildEspelho(entries, month, { workdayHours = 8, startTime = '08:00', today = new Date() } = {}) {
  const startMin = toMin(startTime);
  const todayISO = localISO(today);
  const byDay = {};
  for (const e of entries) {
    if (!e.day?.startsWith(month)) continue;
    (byDay[e.day] ||= []).push(e);
  }

  const rows = [];
  const totals = { days: 0, worked: 0, late: 0, extra50: 0, extra100: 0, absences: 0 };

  for (const day of daysOfMonth(month)) {
    const list = (byDay[day] || []).slice().sort((a, b) => a.punched_at.localeCompare(b.punched_at));
    const times = list.map((x) => hhmm(x.punched_at));
    const worked = list.length > 0;

    // 1º toque = entrada, último = saída, os do meio = intervalo de almoço.
    const slots = ['—', '—', '—', '—'];
    if (worked) {
      slots[0] = times[0];
      if (times.length === 2) slots[3] = times[1];
      if (times.length === 3) slots[1] = times[1];
      if (times.length > 3) {
        slots[1] = times[1];
        slots[2] = times[2];
        slots[3] = times[times.length - 1];
      }
    }

    let minutes = 0;
    for (let i = 0; i + 1 < list.length; i += 2) {
      minutes += (new Date(list[i + 1].punched_at) - new Date(list[i].punched_at)) / 60000;
    }

    const lateMin = worked ? Math.max(0, toMin(times[0]) - startMin) : 0;
    const extraMin = Math.max(0, minutes - workdayHours * 60);
    const weekday = new Date(`${day}T12:00:00`).getDay();
    const weekend = weekday === 0 || weekday === 6;

    if (worked) totals.days += 1;
    else if (!weekend && day < todayISO) totals.absences += 1;
    totals.worked += minutes;
    totals.late += lateMin;
    if (weekend) totals.extra100 += extraMin;
    else totals.extra50 += extraMin;

    const units = [...new Set(list.map((x) => x.unit).filter(Boolean))];
    rows.push({
      day,
      weekday: WEEKDAYS[weekday],
      entrada: slots[0],
      saidaAlmoco: slots[1],
      voltaAlmoco: slots[2],
      saida: slots[3],
      minutes,
      lateMin,
      extraMin,
      unit: units.join(', '),
      outside: list.some((x) => x.inside_unit === false),
    });
  }

  return { rows, totals };
}

const COLS = [
  ['Data', 12],
  ['Dia', 34],
  ['Entrada', 72],
  ['Saída almoço', 92],
  ['Volta almoço', 116],
  ['Saída', 140],
  ['Total dia', 156],
  ['Atraso', 178],
  ['Extra', 196],
  ['Local', 216],
];

function head(doc, company, employee, month) {
  doc.setFillColor(59, 130, 246);
  doc.roundedRect(12, 11, 9, 9, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('CR', 16.5, 17.4, { align: 'center' });
  doc.setTextColor(24, 32, 46);
  doc.setFontSize(13);
  doc.text('CUSTO REAL', 24, 18.4);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Empresa: ${company?.name || '—'}   ·   CNPJ: ${cnpjBR(company?.cnpj)}`, 12, 26);
  doc.text(
    `Colaborador: ${employee.full_name}   ·   CPF: ${cpfBR(employee.cpf)}   ·   Competência: ${monthLabel(month)}`,
    12,
    31.5,
  );
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ESPELHO DE PONTO', 12, 40);

  doc.setFontSize(7.5);
  let x = 12;
  for (const [label, cx] of COLS) {
    doc.text(label, Math.max(cx, x), 45);
    x = cx + doc.getTextWidth(label) + 2;
  }
  doc.setFont('helvetica', 'normal');
  doc.setDrawColor(190, 200, 215);
  doc.line(12, 47, 285, 47);
}

export function espelhoPdf({ company, employee, month, sheet }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  head(doc, company, employee, month);

  let y = 52;
  for (const r of sheet.rows) {
    if (y > 182) {
      doc.addPage();
      head(doc, company, employee, month);
      y = 52;
    }
    const cells = [
      dateBR(r.day),
      r.weekday,
      r.entrada,
      r.saidaAlmoco,
      r.voltaAlmoco,
      r.saida,
      r.minutes ? fmtMinutes(r.minutes) : '—',
      rr(r.lateMin) || '—',
      r.extraMin ? fmtMinutes(r.extraMin) : '—',
      (r.unit || '—') + (r.outside ? ' (fora)' : ''),
    ];
    doc.setTextColor(r.entrada === '—' ? 130 : 24, r.entrada === '—' ? 138 : 32, r.entrada === '—' ? 150 : 46);
    cells.forEach((c, i) => doc.text(String(c), COLS[i][1], y));
    doc.setDrawColor(228, 233, 240);
    doc.line(12, y + 1.6, 285, y + 1.6);
    y += 5.4;
  }

  const t = sheet.totals;
  doc.setTextColor(24, 32, 46);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(
    `Dias trabalhados: ${t.days}   ·   Horas totais: ${fmtMinutes(t.worked)}   ·   Atrasos totais: ${fmtMinutes(t.late)}   ·   Extras 50%: ${fmtMinutes(t.extra50)}   ·   Extras 100%: ${fmtMinutes(t.extra100)}   ·   Faltas: ${t.absences}`,
    12,
    Math.min(y + 5, 190),
  );

  const fy = Math.min(y + 16, 200);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(
    'Espelho de ponto emitido conforme CLT, Art. 74 — registro de horários e jornada de trabalho. Documento gerado pelo Custo Real.',
    12,
    fy,
  );
  doc.setDrawColor(120, 130, 145);
  doc.line(30, fy + 18, 110, fy + 18);
  doc.line(185, fy + 18, 265, fy + 18);
  doc.text('Assinatura do funcionário', 70, fy + 22.5, { align: 'center' });
  doc.text('Assinatura da empresa', 225, fy + 22.5, { align: 'center' });
  doc.text(`Data: ${dateBR(localISO())}`, 12, fy + 26);

  doc.save(`espelho-ponto-${slug(employee.full_name)}-${month}.pdf`);
}

function rr(min) {
  return min > 0 ? fmtMinutes(min) : '';
}