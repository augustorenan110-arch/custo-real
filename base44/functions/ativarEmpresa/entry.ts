import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Ativa a assinatura de uma empresa por CNPJ depois do "pagamento" (checkout
// simulado) e confirma a comissão de 30% do contador que cadastrou o cliente.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Entre na sua conta para ativar a empresa.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const companyId = typeof body?.company_id === 'string' ? body.company_id.trim() : '';
    const metodo = body?.metodo === 'pix' ? 'pix' : 'cartao';
    if (!companyId || companyId.length > 64) {
      return Response.json({ error: 'Empresa inválida.' }, { status: 400 });
    }

    const empresa = await base44.asServiceRole.entities.Company.get(companyId);
    if (!empresa) {
      return Response.json({ error: 'Empresa não encontrada.' }, { status: 404 });
    }

    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await base44.asServiceRole.entities.Company.update(companyId, {
      plano_atual: 'premium',
      status_assinatura: 'ativo',
      trial_ends_at: trialEndsAt,
      limite_funcionarios: 50,
    });

    const comissao = 17.97;
    const encontradas = await base44.asServiceRole.entities.Subscription.filter({ company_id: companyId });
    const assinaturas = Array.isArray(encontradas) ? encontradas : encontradas?.items || [];
    if (assinaturas[0]) {
      await base44.asServiceRole.entities.Subscription.update(assinaturas[0].id, {
        status: 'active',
        plan: 'PREMIUM',
        amount: 59.9,
        commission_to_accountant: comissao,
        activated_at: new Date().toISOString(),
        metodo_pagamento: metodo,
      });
    }

    console.log(
      `[WhatsApp simulado] Pagamento confirmado via ${metodo} para ${empresa.name} (CNPJ ${empresa.cnpj}). ` +
        `Assinatura R$ 59,90/mês ativa por 7 dias de teste. Comissão do contador: R$ 17,97/mês.`,
    );

    return Response.json({
      ok: true,
      status: 'active',
      company_name: empresa.name,
      cnpj: empresa.cnpj,
      amount: 59.9,
      commission_to_accountant: comissao,
      trial_ends_at: trialEndsAt,
    });
  } catch (error) {
    console.error('ativarEmpresa falhou:', error?.message || error);
    return Response.json({ error: error?.message || 'Não foi possível ativar a empresa.' }, { status: 500 });
  }
}