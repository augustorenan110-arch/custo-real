import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const asList = (p) => (Array.isArray(p) ? p : p?.items ?? []);

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Apenas o RH pode usar o assistente' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const question = typeof body?.question === 'string' ? body.question.trim().slice(0, 600) : '';
    if (!question) return Response.json({ error: 'Escreva uma pergunta' }, { status: 400 });

    const since = new Date(Date.now() - 45 * 86400000).toISOString().slice(0, 10);
    const [emps, entries, expenses] = await Promise.all([
      base44.entities.Employee.list({ limit: 200 }),
      base44.entities.TimeEntry.filter({ day: { $gte: since } }, { sort: '-punched_at', limit: 400 }),
      base44.entities.Expense.list({ sort: '-created_date', limit: 200 }),
    ]);

    const employees = asList(emps).map((e) => ({
      id: e.id, nome: e.full_name, cargo: e.role_title, unidade: e.unit, salario: e.salary, ativo: e.active !== false,
    }));
    const pontos = asList(entries).map((t) => ({
      colaborador: t.employee_name, tipo: t.kind, quando: t.punched_at, unidade: t.unit, dentro_da_unidade: t.inside_unit,
    }));
    const despesas = asList(expenses).map((x) => ({
      colaborador: x.employee_name || x.employee_email, valor: x.amount, categoria: x.category,
      data: x.expense_date, situacao: x.status, dentro_da_politica: x.ai_compliant,
    }));

    const answer = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Você é o assistente de RH do app Custo Real. Responda em português do Brasil, de forma objetiva, usando SOMENTE os dados abaixo. Se faltar dado, diga que não há informação. Valores em reais. Fuso: use as datas como estão.

COLABORADORES: ${JSON.stringify(employees)}
PONTOS (últimos 45 dias): ${JSON.stringify(pontos)}
DESPESAS: ${JSON.stringify(despesas)}

PERGUNTA: ${question}`,
    });

    return Response.json({ answer: typeof answer === 'string' ? answer : JSON.stringify(answer) });
  } catch (error) {
    return Response.json({ error: error.message || 'Falha no assistente' }, { status: 500 });
  }
}