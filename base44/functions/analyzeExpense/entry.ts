import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const CATEGORIES = ['Refeição', 'Transporte', 'Hospedagem', 'Material', 'Combustível', 'Outros'];

const DEFAULT_POLICY = `- Refeições: até R$ 80,00 por pessoa por refeição.
- Transporte (táxi/app): até R$ 150,00 por viagem, apenas em dias úteis a trabalho.
- Hospedagem: até R$ 400,00 por noite.
- Bebidas alcoólicas não são reembolsáveis.
- Todo pedido precisa de recibo legível com data, estabelecimento e valor.
- Despesas acima de R$ 1.000,00 exigem justificativa detalhada.`;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const fileUri = typeof body?.file_uri === 'string' && body.file_uri.length < 600 ? body.file_uri : null;
    const manual = body?.manual && typeof body.manual === 'object' ? body.manual : null;

    if (!fileUri && !manual) {
      return Response.json({ error: 'Informe um recibo ou os dados da despesa' }, { status: 400 });
    }

    const policies = await base44.asServiceRole.entities.CompanyPolicy.list('-created_date', 1);
    const policyItems = Array.isArray(policies) ? policies : policies?.items ?? [];
    const policy = policyItems[0]?.content || DEFAULT_POLICY;

    let signedUrl = null;
    if (fileUri) {
      const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
        file_uri: fileUri,
        expires_in: 300,
      });
      signedUrl = signed?.signed_url ?? null;
    }

    const manualData = manual
      ? {
          amount: Number(manual.amount) || null,
          date: String(manual.date ?? '').slice(0, 10),
          category: String(manual.category ?? '').slice(0, 40),
          merchant: String(manual.merchant ?? '').slice(0, 120),
          description: String(manual.description ?? '').slice(0, 400),
        }
      : null;

    const prompt = `Você é um auditor de despesas corporativas no Brasil. Avalie a despesa abaixo contra a política da empresa.

POLÍTICA DA EMPRESA:
${policy}

CATEGORIAS PERMITIDAS: ${CATEGORIES.join(', ')}.

${
  signedUrl
    ? 'Leia o recibo da imagem anexa, extraia o valor total, a data, o estabelecimento e a categoria mais adequada, e verifique se a despesa segue a política.'
    : `Avalie a despesa informada manualmente e verifique se segue a política: ${JSON.stringify(manualData)}.`
}

Regras de resposta:
- amount: valor total em reais como número (ex.: 78.5) ou null se ilegível.
- date: data no formato YYYY-MM-DD ou null.
- merchant: nome do estabelecimento (string vazia se não houver).
- category: exatamente uma das categorias permitidas.
- description: resumo curto em português do Brasil (máx. 120 caracteres).
- compliant: true somente se a despesa estiver de acordo com a política.
- notes: explicação curta em português do Brasil citando a regra aplicada (máx. 160 caracteres).`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      file_urls: signedUrl ? [signedUrl] : undefined,
      response_json_schema: {
        type: 'object',
        properties: {
          amount: { type: 'number' },
          date: { type: 'string' },
          merchant: { type: 'string' },
          category: { type: 'string' },
          description: { type: 'string' },
          compliant: { type: 'boolean' },
          notes: { type: 'string' },
        },
        required: ['merchant', 'category', 'description', 'compliant', 'notes'],
      },
    });

    const parsed = typeof result === 'string' ? JSON.parse(result) : result ?? {};

    return Response.json({
      amount: typeof parsed.amount === 'number' && parsed.amount > 0 ? parsed.amount : null,
      date: typeof parsed.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : null,
      merchant: String(parsed.merchant ?? '').slice(0, 120),
      category: CATEGORIES.includes(parsed.category) ? parsed.category : 'Outros',
      description: String(parsed.description ?? '').slice(0, 200),
      compliant: Boolean(parsed.compliant),
      notes: String(parsed.notes ?? '').slice(0, 240),
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Falha ao analisar a despesa' }, { status: 500 });
  }
}