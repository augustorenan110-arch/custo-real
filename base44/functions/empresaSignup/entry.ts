import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Cadastro da empresa (primeiro acesso): cria a ficha da empresa e transforma
// quem cadastrou em administrador (RH) — com 7 dias de teste do plano completo.
const soDigitos = (v) => String(v || '').replace(/\D/g, '');
const formataCnpj = (d) => d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) {
      return Response.json({ error: 'Entre na sua conta para cadastrar a empresa.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const nome = String(body?.nome || '').trim().slice(0, 120);
    const cnpj = soDigitos(body?.cnpj);
    if (nome.length < 2) return Response.json({ error: 'Informe o nome da empresa.' }, { status: 400 });
    if (cnpj.length !== 14) {
      return Response.json({ error: 'Informe um CNPJ válido (14 dígitos).' }, { status: 400 });
    }

    const sr = base44.asServiceRole;

    // Quem já é funcionário em alguma ficha não vira empresa.
    const { items: fichas } = await sr.entities.Employee.filter(
      { email: user.email },
      { limit: 1 },
    );
    if ((fichas || []).length) {
      return Response.json(
        { error: 'Este e-mail está cadastrado como funcionário. Fale com o seu RH.' },
        { status: 403 },
      );
    }

    const cnpjFormatado = formataCnpj(cnpj);
    const { items: existentes } = await base44.entities.Company.filter(
      { cnpj: cnpjFormatado },
      { limit: 1 },
    );
    if ((existentes || []).length) {
      return Response.json(
        { error: 'Este CNPJ já está cadastrado. Entre com a conta da empresa.' },
        { status: 409 },
      );
    }

    const empresa = await base44.entities.Company.create({
      name: nome,
      cnpj: cnpjFormatado,
      data_cadastro: new Date().toISOString().slice(0, 10),
      plano_atual: 'trial_premium',
      status_assinatura: 'trialing',
      trial_ends_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      limite_funcionarios: 3,
    });

    // Vira ADMIN (RH): gerencia funcionários, ponto, despesas e relatórios.
    await sr.entities.User.update(user.id, { role: 'admin', tipo_conta: 'empresa' });

    return Response.json({
      ok: true,
      company_id: empresa.id,
      company_name: empresa.name,
      cnpj: empresa.cnpj,
      role: 'admin',
    });
  } catch (error) {
    console.error('empresaSignup falhou:', error?.message || error);
    return Response.json(
      { error: error?.message || 'Não foi possível concluir o cadastro da empresa.' },
      { status: 500 },
    );
  }
}