import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Login do funcionário é por CPF: a função localiza a ficha ativa pelo CPF e
// devolve o e-mail de login vinculado. A senha é conferida pela autenticação
// da plataforma (loginViaEmailPassword) — esta função nunca vê senha nenhuma.
const soDigitos = (v) => String(v || '').replace(/\D/g, '');
const formataCpf = (d) =>
  d.length === 11 ? d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4') : d;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const cpf = soDigitos(body?.cpf);
    if (cpf.length !== 11) {
      return Response.json({ error: 'Informe um CPF válido (11 dígitos).' }, { status: 400 });
    }

    const { items } = await base44.asServiceRole.entities.Employee.filter(
      { $or: [{ cpf }, { cpf: formataCpf(cpf) }] },
      { limit: 5 },
    );

    const ficha = (items || []).find(
      (f) => f.active !== false && String(f.email || '').trim().length > 3,
    );

    if (!ficha) {
      return Response.json(
        { error: 'CPF não encontrado. Peça ao RH para cadastrar seu acesso.' },
        { status: 404 },
      );
    }

    return Response.json({
      email: String(ficha.email).trim().toLowerCase(),
      full_name: String(ficha.full_name || '').slice(0, 80),
    });
  } catch (error) {
    console.error('loginFuncionario falhou:', error?.message || error);
    return Response.json(
      { error: error?.message || 'Não foi possível localizar o cadastro.' },
      { status: 500 },
    );
  }
}