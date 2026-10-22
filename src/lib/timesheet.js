// Monta o espelho de ponto de um colaborador em um mês.
// entries: TimeEntry[] (kind entrada/saida), month: 'YYYY-MM', workdayHours: jornada diária.
const hhmm = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—';

export function buildTimesheet(entries, month, workdayHours = 8, startTime = '08:00') {
  const byDay = {};
  for (const e of entries) {
    if (!e.day?.startsWith(month)) continue;
    (byDay[e.day] ||= []).push(e);
  }
  const rows = [];
  let worked = 0;
  let late = 0;
  let extra = 0;
  for (const day of Object.keys(byDay).sort()) {
    const list = byDay[day].sort((a, b) => a.punched_at.localeCompare(b.punched_at));
    let minutes = 0;
    for (let i = 0; i + 1 < list.length; i += 2) {
      minutes += (new Date(list[i + 1].punched_at) - new Date(list[i].punched_at)) / 60000;
    }
    const first = list[0];
    const [sh, sm] = startTime.split(':').map(Number);
    const fd = new Date(first.punched_at);
    const lateMin = Math.max(0, fd.getHours() * 60 + fd.getMinutes() - (sh * 60 + sm) - 10);
    const extraMin = Math.max(0, minutes - workdayHours * 60);
    worked += minutes;
    late += lateMin;
    extra += extraMin;
    rows.push({
      day,
      entrada: hhmm(list[0]?.punched_at),
      saida: list.length > 1 ? hhmm(list[list.length - 1].punched_at) : '—',
      minutes,
      lateMin,
      extraMin,
      open: list.length % 2 === 1,
    });
  }
  return { rows, worked, late, extra };
}

export const fmtMinutes = (m) => `${Math.floor(m / 60)}h${String(Math.round(m % 60)).padStart(2, '0')}`;