import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const asList = (p) => (Array.isArray(p) ? p : p?.items ?? []);
const round = (n) => Math.round((Number(n) || 0) * 100) / 100;
const num = (v) => (v === null || v === undefined || v === '' || Number.isNaN(Number(v)) ? null : Number(v));
const horas = (min) => `${Math.floor(min / 60)}h${String(Math.round(min % 60)).padStart(2, '0')}`;

// Datas e horas do app seguem o fuso de São Paulo (UTC-3).
const diaISO = (d = new Date()) => new Date(d.getTime() - 3 * 3600000).toISOString().slice(0, 10);
const chaveDia = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const PADRAO = {
  fgts: 8,
  patronal: 27.8,
  inss: [
    { ate: 1621, aliquota: 7.5 },
    { ate: 2902.84, aliquota: 9 },
    { ate: 4354.27, aliquota: 12 },
    { ate: 8475.55, aliquota: 14 },
  ],
  fonte: 'Portaria Interministerial MPS/MF nº 13/2026',
};

function motorFiscal(rows) {
  const lista = asList(rows);
  const inss = lista
    .filter((r) => String(r.nome_tabela || '').includes('INSS') && !String(r.nome_tabela || '').includes('PATRONAL'))
    .sort((a, b) => (a.faixa_de || 0) - (b.faixa_de || 0));
  const patronal = lista.find((r) => String(r.nome_tabela || '').includes('PATRONAL'));
  const fgts = lista.find((r) => String(r.nome_tabela || '').includes('FGTS'));
  return {
    fgts: num(fgts?.porcentagem) ?? PADRAO.fgts,
    patronal: num(patronal?.porcentagem) ?? PADRAO.patronal,
    inss: inss.length
      ? inss.map((r) => ({ ate: num(r.faixa_ate) ?? 0, aliquota: num(r.porcentagem) || 0 }))
      : PADRAO.inss,
    fonte: inss[0]?.fonte_oficial || PADRAO.fonte,
  };
}

const calcInss = (salario, fiscal) => {
  let anterior = 0;
  let total = 0;
  for (const f of fiscal.inss) {
    if (salario > anterior) total += (Math.min(salario, f.ate) - anterior) * (f.aliquota / 100);
    anterior = f.ate;
  }
  return round(total);
};

/** FGTS, INSS patronal e provisões mensais (1/12 de 13º, 1/12 férias, 1/36 + FGTS sobre provisões). */
function encargos(salario, fiscal) {
  const s = round(num(salario) || 0);
  const base = s / 12 + s / 12 + s / 12 / 3;
  return {
    fgts: round(s * (fiscal.fgts / 100)),
    patronal: round(s * (fiscal.patronal / 100)),
    prov13: round(s / 12),
    provFerias: round(s / 12),
    provTerco: round(s / 12 / 3),
    provisoes: round(base),
    fgtsProvisoes: round(base * (fiscal.fgts / 100)),
  };
}

/** Custo real mensal de um colaborador: salário + encargos + benefícios e horas extras. */
function custoReal(salario, extras, fiscal) {
  const s = round(num(salario) || 0);
  const e = encargos(s, fiscal);
  const soma = e.fgts + e.patronal + e.provisoes + e.fgtsProvisoes;
  return round(s + soma + (extras.vt || 0) + (extras.va || 0) + (extras.vr || 0) + (extras.extra || 0));
}

/** Um valor da folha com os encargos por cima (usado nas horas extras). */
const comEncargos = (valor, fiscal) => {
  const v = round(num(valor) || 0);
  const e = encargos(v, fiscal);
  return round(v + e.fgts + e.patronal + e.provisoes + e.fgtsProvisoes);
};

const mesEntre = (de, ate) => {
  const a = new Date(`${String(de).slice(0, 10)}T12:00:00`);
  const b = new Date(`${String(ate).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b < a) return 0;
  let m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) m -= 1;
  return Math.max(0, m);
};

const avos = (de, ate) => {
  const a = new Date(`${de}T12:00:00`);
  const b = new Date(`${ate}T12:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b < a) return 0;
  let m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (a.getDate() > 15) m -= 1;
  if (b.getDate() >= 15) m += 1;
  return Math.max(0, Math.min(12, m));
};

/** Estimativa de rescisão sem justa causa (saldo, aviso, 13º, férias + 1/3, multa 40% do FGTS). */
function rescisao(salario, admissao, hoje, fiscal) {
  const s = round(num(salario) || 0);
  if (!s || !admissao) return null;
  const meses = mesEntre(admissao, hoje);
  const anos = Math.floor(meses / 12);
  const hojeDate = new Date(`${hoje}T12:00:00`);
  const inicioAno = new Date(hojeDate.getFullYear(), 0, 1, 12);
  const inicioAdmissao = new Date(`${String(admissao).slice(0, 10)}T12:00:00`);
  const inicioFerias = new Date(inicioAdmissao);
  inicioFerias.setFullYear(inicioFerias.getFullYear() + anos);
  const saldo = round((s / 30) * hojeDate.getDate());
  const avisoDias = Math.min(90, 30 + 3 * anos);
  const aviso = round((s / 30) * avisoDias);
  const decimo = round((s / 12) * avos(chaveDia(inicioAdmissao > inicioAno ? inicioAdmissao : inicioAno), hoje));
  const feriasProp = round((s / 12) * avos(chaveDia(inicioFerias), hoje));
  const terco = round(feriasProp / 3);
  const fgtsSaldo = round(s * (fiscal.fgts / 100) * Math.max(1, meses));
  const fgtsMes = round((s / 12) * (fiscal.fgts / 100));
  const multa = round(fgtsSaldo * 0.4);
  return {
    meses,
    aviso_dias: avisoDias,
    saldo,
    aviso,
    decimo,
    ferias: feriasProp,
    terco,
    fgts_saldo_estimado: fgtsSaldo,
    fgts_mes: fgtsMes,
    multa_fgts_40: multa,
    total: round(saldo + aviso + decimo + feriasProp + terco + fgtsMes + multa),
  };
}

/** Espelho do mês: pareia entrada/saída por dia e devolve extras e dias sem registro. */
function pontoDoMes(entries, mes, jornada, hoje) {
  const porDia = {};
  for (const e of entries) {
    if (!String(e.day || '').startsWith(mes)) continue;
    (porDia[e.day] ||= []).push(e);
  }
  const dias = Object.keys(porDia);
  let minutos = 0;
  let extraMin = 0;
  for (const dia of dias) {
    const lista = porDia[dia].slice().sort((a, b) => String(a.punched_at).localeCompare(String(b.punched_at)));
    let m = 0;
    for (let i = 0; i + 1 < lista.length; i += 2) {
      m += (new Date(lista[i + 1].punched_at) - new Date(lista[i].punched_at)) / 60000;
    }
    minutos += m;
    extraMin += Math.max(0, m - (Number(jornada) || 8) * 60);
  }
  let semPonto = 0;
  const inicio = new Date(`${mes}-01T12:00:00`);
  const fim = new Date(`${hoje}T12:00:00`);
  for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    if (!dias.includes(chaveDia(d))) semPonto += 1;
  }
  return {
    extraMin: Math.round(extraMin),
    minutos: Math.round(minutos),
    dias_com_ponto: dias.length,
    dias_sem_ponto: semPonto,
  };
}

const distanciaM = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const rad = (v) => (v * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const TEMPLATES = {
  1: {
    pergunta: 'Quanto custa um funcionário de R$ 2.000 na verdade?',
    resposta:
      'Um funcionário de R$ {exemplo.salario} na carteira custa R$ {exemplo.custo_real} no total.\nDetalhamento:\n- Líquido que ele recebe: R$ {exemplo.liquido} (INSS R$ {exemplo.inss})\n- Custo extra da empresa: R$ {exemplo.custo_extra} (FGTS R$ {exemplo.fgts} + INSS Patronal R$ {exemplo.patronal} + Provisões R$ {exemplo.provisoes} + FGTS sobre provisões R$ {exemplo.fgts_provisoes})\n{exemplo.percentual}% a mais do que você combinou. Quer simular outro valor?',
  },
  2: {
    pergunta: 'Quem fez mais horas extras esse mês?',
    resposta:
      'Esse mês quem mais fez hora extra foi {maior_extra.nome} com {maior_extra.horas_extras_mes}.\nCusto extra gerado: R$ {maior_extra.extra_valor} — que vira R$ {maior_extra.extra_custo_real} de custo real com encargos. Quer ver o ranking completo?',
  },
  3: {
    pergunta: 'Quais despesas estão fora da política?',
    resposta:
      'Encontrei {fora_da_politica.qtd} despesas fora da política aguardando sua aprovação:\n- uma linha por despesa: nome - R$ valor - motivo (motivo = observacao da IA ou descrição)\nValor total pendente: R$ {fora_da_politica.total}. Quer aprovar ou reprovar agora?',
  },
  4: {
    pergunta: 'Quem bateu ponto fora da unidade?',
    resposta:
      'Hoje {pontos_fora_hoje.qtd} batidas foram fora da unidade autorizada:\n- uma linha por batida: nome - horário - distância (distancia_m, quando houver) - unidade marcada\nIsso gera risco trabalhista e pagamento de deslocamento. Quer bloquear ponto fora da unidade?',
  },
  5: {
    pergunta: 'Qual funcionário está me dando mais prejuízo?',
    resposta:
      'Seu colaborador mais caro é {mais_caro.nome}.\nSalário: R$ {mais_caro.salario}\nCusto Real: R$ {mais_caro.custo_total} (+{mais_caro.percentual}%)\nMotivo: informe o que pesa mais nele (faltas, horas extras, dias sem ponto ou despesas). Quer ver o ranking do mais caro para o mais barato?',
  },
  6: {
    pergunta: 'Quanto vou gastar pra demitir alguém hoje?',
    resposta:
      'Para calcular a rescisão, me diga o nome do colaborador e o motivo (sem justa causa / com justa causa / pedido de demissão).\nCálculo estimado para {ranking.0.nome} hoje (admissão {ranking.0.admissao}): saldo, aviso, 13º, férias + 1/3 e multa de 40% do FGTS = R$ {ranking.0.rescisao.total} (só a multa é R$ {ranking.0.rescisao.multa_fgts_40}).\nQuer simular agora na aba Simular Rescisão?',
  },
  7: {
    pergunta: 'Quem está faltando muito e gerando risco trabalhista?',
    resposta:
      'Alerta de risco trabalhista:\n{nome} tem {faltas} faltas e {dias_sem_ponto} dias sem registro de ponto no mês.\nFalta de registro de ponto gera multa de R$ 3.000 por funcionário na fiscalização. Quer regularizar o ponto dele?',
  },
  8: {
    pergunta: 'Qual o ranking dos mais caros pra empresa?',
    resposta:
      'Ranking Custo Real deste mês (salário + todos os encargos):\n1º {ranking.0.nome} - R$ {ranking.0.custo_total}\n2º {ranking.1.nome} - R$ {ranking.1.custo_total}\n3º {ranking.2.nome} - R$ {ranking.2.custo_total}\nO mais barato é {mais_barato.nome} - R$ {mais_barato.custo_total}. Quer exportar esse ranking?',
  },
  9: {
    pergunta: 'Quanto já gastei de extra e adicional esse mês?',
    resposta:
      'No mês de {mes} você já gastou:\nHoras Extras: R$ {mes_extras.total_extra}\nAdicional Noturno: R$ 0,00 (não há lançamento de adicional noturno no app)\nDespesas Lançadas: R$ {mes_extras.total_despesas}\nTotal extra sobre a folha: R$ {mes_extras.total} — {mes_extras.percentual}% da folha base de R$ {mes_extras.folha_base}.',
  },
  10: {
    pergunta: 'Me mostra o relatório de auditoria para processo.',
    resposta:
      'Relatório de Auditoria — pronto para contador/advogado:\n{auditoria.inconsistencias} inconsistências encontradas:\n- {auditoria.pontos_fora} pontos fora da unidade\n- {auditoria.despesas_sem_comprovante} despesas sem comprovante\n- {auditoria.colaboradores_ponto_zerado} colaboradores com ponto zerado (risco)\nPosso gerar o PDF de Auditoria completo com data, hora, localização e foto do ponto facial? Está na aba Auditoria.',
  },
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Apenas o RH pode usar o assistente' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const question = typeof body?.question === 'string' ? body.question.trim().slice(0, 600) : '';
    const topico = Number.isInteger(body?.topico) && TEMPLATES[body.topico] ? body.topico : null;
    if (!question) return Response.json({ error: 'Escreva uma pergunta' }, { status: 400 });

    const hoje = diaISO();
    const mes = hoje.slice(0, 7);
    const desde = diaISO(new Date(Date.now() - 45 * 86400000));

    const [emps, entries, expenses, faltas, comps, cfg] = await Promise.all([
      base44.entities.Employee.list({ limit: 200 }),
      base44.entities.TimeEntry.filter({ day: { $gte: desde } }, { sort: '-punched_at', limit: 500 }),
      base44.entities.Expense.list({ sort: '-created_date', limit: 200 }),
      base44.entities.Falta.list({ sort: '-data', limit: 400 }),
      base44.entities.Company.list({ limit: 1 }),
      base44.entities.ConfigFiscal.list({ sort: 'nome_tabela', limit: 200 }),
    ]);

    const fiscal = motorFiscal(cfg);
    const empresa = asList(comps)[0] || null;
    const jornada = num(empresa?.workday_hours) ?? 8;
    const unidades = Array.isArray(empresa?.units) ? empresa.units : [];
    const todosPontos = asList(entries);
    const todasFaltas = asList(faltas);

    const despesas = asList(expenses).map((x) => ({
      nome: x.employee_name || x.employee_email || 'sem colaborador',
      valor: round(x.amount),
      categoria: x.category,
      data: String(x.expense_date || '').slice(0, 10),
      situacao: x.status,
      dentro_da_politica: x.ai_compliant !== false,
      motivo: x.ai_notes || x.description || 'sem justificativa',
      comprovante: !!x.receipt_file_uri,
    }));

    const perto = (t) => {
      if (num(t.lat) === null || num(t.lng) === null || !unidades.length) return null;
      let menor = null;
      for (const u of unidades) {
        if (num(u.lat) === null || num(u.lng) === null) continue;
        const d = distanciaM(Number(t.lat), Number(t.lng), Number(u.lat), Number(u.lng));
        if (menor === null || d < menor) menor = d;
      }
      return menor;
    };
    const batida = (t) => ({
      nome: t.employee_name || 'sem nome',
      horario: new Date(t.punched_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      dia: String(t.day || '').slice(0, 10),
      unidade_marcada: t.unit || 'não informada',
      dentro_da_unidade: t.inside_unit === true,
      distancia_m: perto(t),
    });

    const funcionarios = asList(emps)
      .filter((e) => e.active !== false)
      .map((e) => {
        const salario = round(e.salary);
        const extras = {
          vt: num(e.vt_custo_empresa) || 0,
          va: num(e.va_custo_empresa) || 0,
          vr: num(e.vr_custo_empresa) || 0,
          extra: num(e.custo_hora_extra) || 0,
        };
        const ponto = pontoDoMes(todosPontos, mes, jornada, hoje);
        const meu = todosPontos.filter((t) => t.employee_id === e.id || t.employee_name === e.full_name);
        const fora = meu.filter((t) => t.inside_unit !== true);
        const minhasFaltas = todasFaltas.filter(
          (f) => f.employee_id === e.id || f.employee_name === e.full_name || (e.email && f.employee_email === e.email),
        );
        const minhasDespesas = despesas.filter((d) => d.nome === e.full_name);
        const extraValor =
          ponto.extraMin > 0 ? round((ponto.extraMin / 60) * (salario / 220) * 1.5) : 0;
        const custoTotal = custoReal(salario, extras, fiscal);
        const divida = rescisao(salario, e.admission_date, hoje, fiscal);
        return {
          id: e.id,
          nome: e.full_name,
          cargo: e.role_title || 'não informado',
          unidade: e.unit || 'não informada',
          admissao: String(e.admission_date || '').slice(0, 10) || 'não informada',
          salario,
          liquido: round(salario - calcInss(salario, fiscal)),
          custo_total: custoTotal,
          percentual: salario > 0 ? round(((custoTotal - salario) / salario) * 100) : 0,
          encargos: encargos(salario, fiscal),
          extras,
          horas_extras_mes: horas(ponto.extraMin),
          extra_minutos: ponto.extraMin,
          extra_valor: extraValor,
          extra_custo_real: comEncargos(extraValor, fiscal),
          dias_com_ponto: ponto.dias_com_ponto,
          dias_sem_ponto: ponto.dias_sem_ponto,
          faltas_total: minhasFaltas.length,
          faltas_mes: minhasFaltas.filter((f) => String(f.mes_referencia || f.data || '').startsWith(mes)).length,
          pontos_fora_unidade: fora.length,
          despesas_pendentes: minhasDespesas.filter((d) => d.situacao === 'pending').length,
          despesas_pendentes_valor: round(
            minhasDespesas.filter((d) => d.situacao === 'pending').reduce((s, d) => s + d.valor, 0),
          ),
          rescisao: divida,
        };
      });

    const ranking = [...funcionarios].sort((a, b) => b.custo_total - a.custo_total);
    const exemploSalario = 2000;
    const encExemplo = encargos(exemploSalario, fiscal);
    const custoExemplo = custoReal(exemploSalario, {}, fiscal);
    const inssExemplo = calcInss(exemploSalario, fiscal);
    const custo3000 = custoReal(3000, {}, fiscal);
    const inss3000 = calcInss(3000, fiscal);
    const foraDaPolitica = despesas.filter((d) => d.situacao === 'pending' && !d.dentro_da_politica);
    const pontosForaHoje = todosPontos.filter((t) => t.day === hoje && t.inside_unit !== true).map(batida);
    const pontosFora45 = todosPontos.filter((t) => t.inside_unit !== true).length;
    const folhaBase = round(funcionarios.reduce((s, f) => s + f.salario, 0));
    const totalExtra = round(funcionarios.reduce((s, f) => s + f.extra_valor, 0));
    const despesasMes = round(
      despesas.filter((d) => d.data.startsWith(mes)).reduce((s, d) => s + d.valor, 0),
    );
    const semPonto = funcionarios.filter((f) => f.dias_sem_ponto >= 3);

    const painel = {
      hoje,
      mes,
      empresa: empresa?.name || 'sua empresa',
      tabelas_oficiais: { fonte: fiscal.fonte, fgts: `${fiscal.fgts}%`, inss_patronal: `${fiscal.patronal}%` },
      exemplo: {
        salario: round(exemploSalario),
        inss: inssExemplo,
        liquido: round(exemploSalario - inssExemplo),
        fgts: encExemplo.fgts,
        patronal: encExemplo.patronal,
        provisoes: encExemplo.provisoes,
        fgts_provisoes: encExemplo.fgtsProvisoes,
        custo_extra: round(custoExemplo - exemploSalario),
        custo_real: custoExemplo,
        percentual: round(((custoExemplo - exemploSalario) / exemploSalario) * 100),
      },
      exemplo_3000: {
        salario: 3000,
        inss: inss3000,
        liquido: round(3000 - inss3000),
        custo_real: custo3000,
      },
      ranking: ranking.map((f) => ({
        nome: f.nome,
        cargo: f.cargo,
        admissao: f.admissao,
        salario: f.salario,
        liquido: f.liquido,
        custo_total: f.custo_total,
        percentual: f.percentual,
        horas_extras_mes: f.horas_extras_mes,
        extra_valor: f.extra_valor,
        extra_custo_real: f.extra_custo_real,
        faltas_total: f.faltas_total,
        faltas_mes: f.faltas_mes,
        dias_sem_ponto: f.dias_sem_ponto,
        pontos_fora_unidade: f.pontos_fora_unidade,
        despesas_pendentes: f.despesas_pendentes,
        rescisao: f.rescisao,
      })),
      mais_caro: ranking[0] || null,
      mais_barato: ranking[ranking.length - 1] || null,
      maior_extra: [...funcionarios].sort((a, b) => b.extra_minutos - a.extra_minutos)[0] || null,
      mais_faltas: [...funcionarios].sort((a, b) => b.faltas_total - a.faltas_total)[0] || null,
      fora_da_politica: {
        qtd: foraDaPolitica.length,
        total: round(foraDaPolitica.reduce((s, d) => s + d.valor, 0)),
        lista: foraDaPolitica.map((d) => ({ nome: d.nome, valor: d.valor, motivo: d.motivo })),
      },
      pontos_fora_hoje: { qtd: pontosForaHoje.length, lista: pontosForaHoje },
      pontos_fora_45_dias: pontosFora45,
      mes_extras: {
        total_extra: totalExtra,
        total_extra_custo_real: round(comEncargos(totalExtra, fiscal) - totalExtra),
        total_despesas: despesasMes,
        folha_base: folhaBase,
        total: round(totalExtra + despesasMes),
        percentual: folhaBase > 0 ? round(((totalExtra + despesasMes) / folhaBase) * 100) : 0,
      },
      auditoria: {
        inconsistencias: pontosFora45 + despesas.filter((d) => !d.comprovante).length + semPonto.length,
        pontos_fora: pontosFora45,
        despesas_sem_comprovante: despesas.filter((d) => !d.comprovante).length,
        colaboradores_ponto_zerado: semPonto.length,
        ponto_zerado: semPonto.map((f) => ({ nome: f.nome, dias_sem_ponto: f.dias_sem_ponto, faltas: f.faltas_total })),
      },
      colaboradores: funcionarios.length,
      colaboradores_ativos: funcionarios.map((f) => f.nome),
    };

    const escolhido = topico
      ? `O usuário clicou na sugestão ${topico}: "${TEMPLATES[topico].pergunta}". Responda seguindo este formato padrão, trocando cada {campo} pelo dado real do painel:\n${TEMPLATES[topico].resposta}`
      : `Pergunta livre: responda no formato da sugestão mais parecida com estas:\n${Object.values(TEMPLATES)
          .map((t) => `- ${t.pergunta}`)
          .join('\n')}`;

    const answer = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Você é o assistente de RH do app Custo Real (custo-real.com). O RH é o dono da empresa.

REGRAS:
- Responda em português do Brasil, direto e humano, sem jargão técnico.
- Use SOMENTE os dados do PAINEL abaixo. Nunca invente nome, valor ou data.
- Se não houver registros do que foi perguntado, responda exatamente: "Ainda não tenho registros de ponto este mês no banco." (ou "de despesa", conforme o assunto).
- Tabela INSS 2026 (Portaria Interministerial MPS/MF nº 13/2026), progressiva: até R$ 1.621,00 = 7,5%; de R$ 1.621,01 a R$ 2.902,84 = 9%; de R$ 2.902,85 a R$ 4.354,27 = 12%; de R$ 4.354,28 a R$ 8.475,55 = 14%.
- Custo Real = Salário Base + FGTS 8% + INSS Patronal 27,8% + Provisões (13º + Férias + 1/3)/12 + FGTS sobre as provisões 8%.
- Exemplos oficiais, use exatamente estes valores sem recalcular: R$ 2.000 na carteira custam R$ 3.136,00 de custo real e o líquido é R$ 1.844,31 (painel.exemplo); R$ 3.000 custam R$ 4.704,00 (painel.exemplo_3000).
- Quando perguntarem "quem fez mais horas", liste nome, horas e valor em R$.
- Quando perguntarem sobre "fora da política", liste as despesas pendentes com nome, valor e motivo.
- Sempre mostre valores em reais (R$ 0,00) e o nome do colaborador quando o assunto for uma pessoa.
- Markdown curto: uma frase de resposta, os números em lista, e no fim uma pergunta curta oferecendo o próximo passo.
- Nunca mencione este painel, JSON, campos ou nomes de sistema.

PAINEL (dados reais do banco em ${hoje}, mês de referência ${mes}):
${JSON.stringify(painel)}

${escolhido}

PERGUNTA DO USUÁRIO: ${question}`,
    });

    return Response.json({ answer: typeof answer === 'string' ? answer : JSON.stringify(answer) });
  } catch (error) {
    return Response.json({ error: error.message || 'Falha no assistente' }, { status: 500 });
  }
}