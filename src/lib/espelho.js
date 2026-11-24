// Espelho de ponto: monta as linhas do mês a partir dos registros (TimeEntry)
// e gera o PDF oficial para assinatura.
import { jsPDF } from 'jspdf';
import { cnpjBR, cpfBR, dateBR, localISO } from '@/lib/format';
import { fmtMinutes } from '@/lib/timesheet';
import { mapsUrl } from '@/lib/geo';

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const ALMOCO_PADRAO = 60; // minutos de intervalo quando não registrado
const CARGA_MENSAL = 220; // horas de referência mensal (padrão CLT)

const hhmm = (iso) => (iso ? new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—');
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

/** Extrai entrada/intervalo/saída pelo campo kind. Sem kind (legado), usa posição. */
function slots(list) {
  if (list.some((e) => e.kind)) {
    const byKind = {};
    list.forEach((e) => {
      if (e.kind && !byKind[e.kind]) byKind[e.kind] = e;
    });
    return {
      e: byKind.entrada || null,
      ii: byKind.intervalo_inicio || null,
      ifr: byKind.intervalo_fim || null,
      s: byKind.saida || null,
    };
  }
  const e = list[0];
  const s = list.length > 1 ? list[list.length - 1] : null;
  const middle = list.length > 2 ? list.slice(1, -1) : [];
  return { e, ii: middle[0] || null, ifr: middle[middle.length - 1] || null, s };
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
  const totals = { days: 0, worked: 0, late: 0, extra50: 0, extra100: 0, absences: 0, expected: CARGA_MENSAL * 60, bank: 0 };

  for (const day of daysOfMonth(month)) {
    const list = (byDay[day] || []).slice().sort((a, b) => a.punched_at.localeCompare(b.punched_at));
    const weekday = new Date(`${day}T12:00:00`).getDay();
    const weekend = weekday === 0 || weekday === 6;
    const hasEntries = list.length > 0;

    const { e, ii, ifr, s } = hasEntries ? slots(list) : {};
    const entrada = e ? hhmm(e.punched_at) : '—';
    const saida = s ? hhmm(s.punched_at) : '—';
    const saidaAlmoco = ii ? hhmm(ii.punched_at) : '--:--';
    const voltaAlmoco = ifr ? hhmm(ifr.punched_at) : '--:--';
    const lunchMissing = hasEntries && (!ii || !ifr);

    let minutes = 0;
    let incomplete = false;
    if (e && s && ii && ifr) {
      minutes = (new Date(ii.punched_at) - new Date(e.punched_at)) / 60000 + (new Date(s.punched_at) - new Date(ifr.punched_at)) / 60000;
    } else if (e && s) {
      minutes = (new Date(s.punched_at) - new Date(e.punched_at)) / 60000 - ALMOCO_PADRAO;
    } else if (e) {
      minutes = 0;
      incomplete = true;
    }
    if (minutes < 0) minutes = 0;

    const lateMin = e ? Math.max(0, toMin(entrada) - startMin) : 0;
    const extraMin = Math.max(0, minutes - workdayHours * 60);

    let status = '';
    if (!hasEntries) {
      status = weekend ? 'Folga' : day < todayISO ? 'Falta' : '—';
    } else if (incomplete) {
      status = 'Incompleto';
    }

    if (hasEntries) totals.days += 1;
    else if (!weekend && day < todayISO) totals.absences += 1;
    totals.worked += minutes;
    totals.late += lateMin;
    if (weekend) totals.extra100 += extraMin;
    else totals.extra50 += extraMin;

    const ref = e || list[0] || {};
    rows.push({
      day,
      weekday: WEEKDAYS[weekday],
      weekdayShort: WEEKDAYS_SHORT[weekday],
      entrada,
      saidaAlmoco,
      voltaAlmoco,
      saida,
      minutes,
      lateMin,
      extraMin,
      status,
      lunchMissing,
      endereco: ref.endereco || '',
      lat: ref.lat ?? null,
      lng: ref.lng ?? null,
      hasSelfie: !!ref.selfie_uri,
      unit: ref.unit || '',
      outside: list.some((x) => x.inside_unit === false),
    });
  }

  totals.bank = totals.worked - totals.expected;
  return { rows, totals };
}

const COLS = [
  ['Dia', 12, 16],
  ['Semana', 28, 22],
  ['Entrada', 50, 16],
  ['Almoço', 66, 16],
  ['Retorno', 82, 16],
  ['Saída', 98, 16],
  ['Trab.', 114, 16],
  ['Atraso', 130, 14],
  ['Extra', 144, 14],
  ['Localização / Prova', 158, 40],
];

function jornadaText(workdayHours) {
  const [sh, sm] = [8, 0];
  const end = sh + workdayHours;
  return `Segunda a Sexta ${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')} às ${String(end).padStart(2, '0')}:00 · Intervalo 12:00 às 13:00 · Carga mensal: ${CARGA_MENSAL}h`;
}

function head(doc, company, employee, month, workdayHours) {
  doc.setFillColor(59, 130, 246);
  doc.roundedRect(12, 10, 9, 9, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('CR', 16.5, 16.5, { align: 'center' });

  doc.setTextColor(20, 28, 46);
  doc.setFontSize(14);
  doc.text(String(company?.name || 'Empresa').toUpperCase(), 24, 17);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`CNPJ: ${cnpjBR(company?.cnpj)}`, 24, 23);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('ESPELHO DE PONTO', 198, 16, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(monthLabel(month), 198, 22, { align: 'right' });

  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.4);
  doc.line(12, 27, 198, 27);

  doc.setTextColor(20, 28, 46);
  doc.setFontSize(9);
  doc.text(`Funcionário: ${employee.full_name}`, 12, 33);
  doc.text(`CPF: ${cpfBR(employee.cpf)}`, 120, 33);
  doc.text(`Cargo: ${employee.role_title || '—'}`, 12, 38);
  doc.text(`Admissão: ${employee.admission_date ? dateBR(employee.admission_date) : '—'}`, 120, 38);
  doc.setFontSize(8);
  doc.text(`Jornada: ${jornadaText(workdayHours)}`, 12, 43);
  const [y, m] = month.split('-').map(Number);
  const ultimo = new Date(y, m, 0).getDate();
  doc.text(`Período: 01/${String(m).padStart(2, '0')}/${y} a ${ultimo}/${String(m).padStart(2, '0')}/${y}`, 12, 47.5);

  // Cabeçalho da tabela
  doc.setFillColor(59, 130, 246);
  doc.rect(12, 51, 186, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  for (const [label, x] of COLS) {
    doc.text(label, x, 56);
  }
  doc.setDrawColor(59, 130, 246);
  doc.line(12, 58, 198, 58);
}

export function espelhoPdf({ company, employee, month, sheet }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const workdayHours = company?.workday_hours || 8;
  head(doc, company, employee, month, workdayHours);

  let y = 64;
  const rowH = 6.6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  for (const r of sheet.rows) {
    if (y > 252) {
      doc.addPage();
      head(doc, company, employee, month, workdayHours);
      y = 64;
    }
    const isFolga = r.status === 'Folga';
    const isFalta = r.status === 'Falta';
    const semPonto = isFolga || isFalta || r.status === '—';
    const trabUnder = r.minutes > 0 && r.minutes < workdayHours * 60;

    if (isFolga) doc.setFillColor(245, 247, 250);
    else if (isFalta) doc.setFillColor(254, 242, 242);
    else if (((y / rowH) | 0) % 2) doc.setFillColor(248, 250, 252);
    else doc.setFillColor(255, 255, 255);
    doc.rect(12, y - 4.6, 186, rowH, 'F');

    doc.setTextColor(semPonto ? 150 : 30, isFalta ? 80 : 40, isFalta ? 80 : 50);
    doc.text(dateBR(r.day), COLS[0][1], y);
    doc.text(r.weekdayShort, COLS[1][1], y);

    if (semPonto) {
      doc.setFont('helvetica', 'bold');
      doc.text(r.status, COLS[2][1], y);
      doc.setFont('helvetica', 'normal');
    } else {
      doc.text(r.entrada, COLS[2][1], y);
      doc.text(r.saidaAlmoco, COLS[3][1], y);
      doc.text(r.voltaAlmoco, COLS[4][1], y);
      doc.text(r.saida, COLS[5][1], y);
      doc.setTextColor(trabUnder ? 220 : 30, trabUnder ? 38 : 40, trabUnder ? 38 : 50);
      doc.text(r.minutes ? fmtMinutes(r.minutes) : '—', COLS[6][1], y);
      if (r.status === 'Incompleto') {
        doc.setFontSize(5.5);
        doc.text('incompleto', COLS[6][1], y + 2.2);
        doc.setFontSize(7.5);
      }
      doc.setTextColor(r.lateMin > 0 ? 220 : 30, r.lateMin > 0 ? 100 : 40, r.lateMin > 0 ? 20 : 50);
      doc.text(r.lateMin > 0 ? fmtMinutes(r.lateMin) : '—', COLS[7][1], y);
      doc.setTextColor(r.extraMin > 0 ? 22 : 30, r.extraMin > 0 ? 163 : 40, r.extraMin > 0 ? 74 : 50);
      doc.text(r.extraMin > 0 ? fmtMinutes(r.extraMin) : '—', COLS[8][1], y);
    }

    // Localização / prova
    doc.setTextColor(30, 40, 50);
    const local = r.endereco || r.unit || (semPonto ? '' : '—');
    if (local) {
      const localCurto = String(local).length > 22 ? String(local).slice(0, 22) + '…' : local;
      doc.text(localCurto, COLS[9][1], y - 1.2);
      if (r.lat != null && r.lng != null) {
        doc.setTextColor(59, 130, 246);
        doc.textWithLink('Ver no mapa', COLS[9][1], y + 1.4, { url: mapsUrl(r.lat, r.lng) });
      }
    }
    doc.setTextColor(r.hasSelfie ? 22 : 150, r.hasSelfie ? 163 : 80, r.hasSelfie ? 74 : 80);
    doc.text(r.hasSelfie ? 'Foto ✓' : 'Sem foto', COLS[9][1] + 26, y, { align: 'right' });

    if (r.lunchMissing && !semPonto) {
      doc.setTextColor(220, 130, 20);
      doc.setFontSize(5.5);
      doc.text('Sem intervalo', COLS[3][1], y + 2.5);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
    }

    doc.setDrawColor(225, 230, 238);
    doc.line(12, y + 2, 198, y + 2);
    y += rowH;
  }

  // ── Rodapé com resumo ──────────────────────────────────────────────────────
  y = Math.max(y + 4, 256);
  doc.setFillColor(238, 244, 255);
  doc.roundedRect(12, y, 186, 14, 1.5, 1.5, 'F');
  doc.setDrawColor(59, 130, 246);
  doc.roundedRect(12, y, 186, 14, 1.5, 1.5, 'S');
  doc.setTextColor(20, 28, 46);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  const t = sheet.totals;
  const resumo = [
    `Total trabalhado: ${fmtMinutes(t.worked)}`,
    `Esperado: ${CARGA_MENSAL}h`,
    `Atrasos: ${fmtMinutes(t.late)}`,
    `Extras 50%: ${fmtMinutes(t.extra50)}`,
    `Extras 100%: ${fmtMinutes(t.extra100)}`,
    `Faltas: ${t.absences}`,
    `Banco: ${t.bank >= 0 ? '+' : ''}${fmtMinutes(Math.abs(t.bank))}`,
  ];
  doc.text(resumo.join('   ·   '), 16, y + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(110);
  doc.text(`Espelho gerado automaticamente pelo GR Custo Real em ${dateBR(localISO())}.`, 16, y + 10.5);

  // ── Assinaturas ────────────────────────────────────────────────────────────
  const yAss = y + 24;
  doc.setDrawColor(120);
  doc.setLineWidth(0.3);
  doc.setTextColor(20, 28, 46);
  doc.line(20, yAss, 95, yAss);
  doc.line(115, yAss, 190, yAss);
  doc.setFontSize(8);
  doc.text(String(employee.full_name).toUpperCase(), 57.5, yAss + 5, { align: 'center' });
  doc.text(String(company?.name || 'Empresa').toUpperCase(), 152.5, yAss + 5, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(110);
  doc.text(`CPF: ${cpfBR(employee.cpf)}`, 57.5, yAss + 9, { align: 'center' });
  doc.text(`CNPJ: ${cnpjBR(company?.cnpj)}`, 152.5, yAss + 9, { align: 'center' });
  doc.text('Assinatura do funcionário', 57.5, yAss + 13, { align: 'center' });
  doc.text('Assinatura do empregador', 152.5, yAss + 13, { align: 'center' });
  doc.text(`Data: _____/_____/______`, 103.5, yAss + 5, { align: 'center' });

  doc.setFontSize(6);
  doc.setTextColor(140);
  doc.text('Registro eletrônico de ponto conforme CLT Art. 74 e Portaria 671/2021. Documento gerado pelo Custo Real RH IA.', 103.5, yAss + 18, { align: 'center' });

  doc.save(`espelho-ponto-${slug(employee.full_name)}-${month}.pdf`);
}