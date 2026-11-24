export const MONTHLY_HOURS = 220;
export const ESPELHO_COLUMNS = ['Dia', 'Dia Semana', 'Entrada', 'Saída Almoço', 'Retorno Almoço', 'Saída', 'Trabalhado', 'Atraso', 'Extra', 'Local'];
const WEEKDAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const clock = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const pad = (n) => String(n).padStart(2, '0');
const clockMinutes = (time) => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };
const displayClock = (entry) => entry ? clock.format(new Date(entry.punched_at)) : '--:--';
const elapsed = (start, end) => start && end ? Math.max(0, Math.floor(Date.parse(end.punched_at) / 60000) - Math.floor(Date.parse(start.punched_at) / 60000)) : 0;
export const formatEspelhoMinutes = (minutes) => { const value = Math.max(0, Math.round(minutes || 0)); return `${Math.floor(value / 60)}h${pad(value % 60)}`; };
export const espelhoDate = (day) => day.split('-').reverse().join('/');

export function monthDays(month) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month || '')) throw new Error('Selecione um mês válido para o espelho.');
  const [year, number] = month.split('-').map(Number);
  const length = new Date(Date.UTC(year, number, 0)).getUTCDate();
  return Array.from({ length }, (_, index) => `${month}-${pad(index + 1)}`);
}

export function monthLabel(month) {
  monthDays(month);
  return new Date(`${month}-01T12:00:00Z`).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', month: 'long', year: 'numeric' });
}

export function espelhoPeriod(month, workdayHours = 8) {
  const days = monthDays(month);
  const end = 8 * 60 + Number(workdayHours) * 60 + 60;
  return { first: espelhoDate(days[0]), last: espelhoDate(days[days.length - 1]), journey: `08:00 às ${pad(Math.floor(end / 60))}:${pad(end % 60)}` };
}

function daySlots(list) {
  const typed = list.some((entry) => entry.kind);
  if (!typed) return { entry: list[0], lunchOut: list.length >= 4 ? list[1] : null, lunchBack: list.length >= 4 ? list[2] : null, exit: list.length > 1 ? list[list.length - 1] : null, inferred: list.length > 1 };
  const first = (kind) => list.find((entry) => entry.kind === kind);
  const last = (kind) => [...list].reverse().find((entry) => entry.kind === kind);
  const entry = first('entrada');
  const exit = last('saida');
  // Registros antigos deste app foram salvos repetidamente como "entrada".
  // Somente nesse caso, usar os extremos solicitados, sem inventar almoço nem editar os registros.
  const repeatedEntries = list.length > 1 && list.every((item) => item.kind === 'entrada');
  return { entry, lunchOut: first('intervalo_inicio'), lunchBack: last('intervalo_fim'), exit: exit || (repeatedEntries ? list[list.length - 1] : null), inferred: repeatedEntries };
}

export function buildEspelho(entries, month, { workdayHours = 8, startTime = '08:00', city = '' } = {}) {
  const calendar = monthDays(month);
  const byDay = new Map(calendar.map((day) => [day, []]));
  for (const entry of entries || []) {
    if (byDay.has(entry.day) && Number.isFinite(Date.parse(entry.punched_at))) byDay.get(entry.day).push(entry);
  }
  // O calendário, nunca as marcações, define quantas linhas o documento terá.
  const rows = calendar.map((day) => {
    const list = byDay.get(day).slice().sort((a, b) => Date.parse(a.punched_at) - Date.parse(b.punched_at));
    const weekdayIndex = new Date(`${day}T12:00:00Z`).getUTCDay();
    const weekend = weekdayIndex === 0 || weekdayIndex === 6;
    const { entry, lunchOut, lunchBack, exit, inferred } = daySlots(list);
    const hasLunch = !!(lunchOut || lunchBack);
    const ordered = entry && exit && Date.parse(exit.punched_at) >= Date.parse(entry.punched_at);
    const lunchComplete = lunchOut && lunchBack && ordered && Date.parse(lunchOut.punched_at) >= Date.parse(entry.punched_at) && Date.parse(lunchBack.punched_at) >= Date.parse(lunchOut.punched_at) && Date.parse(exit.punched_at) >= Date.parse(lunchBack.punched_at);
    const incomplete = !!list.length && (!ordered || (hasLunch && !lunchComplete));
    const minutes = !hasLunch ? elapsed(entry, exit) : lunchComplete ? elapsed(entry, lunchOut) + elapsed(lunchBack, exit) : 0;
    const entrada = displayClock(entry);
    const lateMin = entry ? Math.max(0, clockMinutes(entrada) - clockMinutes(startTime)) : 0;
    const extraMin = Math.max(0, minutes - Number(workdayHours) * 60);
    const location = list.find((item) => item.cidade_uf || item.endereco) || list[0] || {};
    const gps = list.find((item) => item.lat != null && item.lng != null) || {};
    return {
      day, weekday: WEEKDAYS[weekdayIndex], weekend, hasEntries: !!list.length,
      entrada, saidaAlmoco: displayClock(lunchOut), voltaAlmoco: displayClock(lunchBack), saida: displayClock(exit),
      minutes, lateMin, extraMin, inferred: !!inferred,
      status: !list.length ? (weekend ? 'Folga' : 'Falta') : incomplete ? 'Incompleto' : '',
      local: list.length ? city || location.cidade_uf || location.endereco || location.unit || '--' : '--',
      endereco: location.endereco || location.cidade_uf || '', lat: gps.lat ?? null, lng: gps.lng ?? null,
      hasSelfie: list.some((item) => item.selfie_uri), unit: location.unit || '',
    };
  });
  const totals = rows.reduce((total, row) => ({
    ...total, days: total.days + Number(row.hasEntries), worked: total.worked + row.minutes,
    late: total.late + row.lateMin, extra: total.extra + row.extraMin,
    extra50: total.extra50 + (row.weekend ? 0 : row.extraMin), extra100: total.extra100 + (row.weekend ? row.extraMin : 0),
    absences: total.absences + Number(row.status === 'Falta'),
  }), { days: 0, worked: 0, late: 0, extra: 0, extra50: 0, extra100: 0, absences: 0, expected: MONTHLY_HOURS * 60 });
  totals.bank = totals.worked - totals.expected;
  return { month, rows, totals, inferred: rows.some((row) => row.inferred) };
}