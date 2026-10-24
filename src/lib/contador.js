// Modelo por CNPJ: um contador cadastra cada empresa cliente, o cliente paga
// R$ 59,90/mês e o contador recebe 30% recorrente (R$ 17,97/mês).

import { base44 } from '@/api/base44Client';

export const PLANO_CLIENTE = {
  valor: 59.9,
  comissao: 17.97,
  comissaoPct: 0.3,
  trialDias: 7,
  plano: 'PREMIUM',
};

/** Código de indicação único derivado do id do usuário (formato CONTADOR123). */
export const gerarReferralCode = (userId = '') => {
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = (hash * 31 + userId.charCodeAt(i)) % 1000;
  }
  return `CONTADOR${String(hash).padStart(3, '0')}`;
};

export const linkIndicacao = (code) => `custo-real.com/r/${code || 'SEU-CODIGO'}`;

export const comissaoDe = (clientes = 0) => Number(clientes || 0) * PLANO_CLIENTE.comissao;

export const maskCnpj = (value = '') => {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

export const validaCnpj = (value = '') => {
  const digits = value.replace(/\D/g, '');
  return digits.length === 14 && !/^(\d)\1{13}$/.test(digits);
};

export const maskPhone = (value = '') => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
};

export const iniciais = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';

export const statusAssinaturaLabel = (status) => {
  if (status === 'active') return { label: 'Ativa', tone: 'bg-primary/15 text-primary border-primary/30' };
  if (status === 'canceled') return { label: 'Cancelada', tone: 'bg-white/5 text-muted-foreground border-white/15' };
  return { label: 'Trial', tone: 'bg-success/15 text-save-tech border-success/30' };
};

/** Cadastra a empresa cliente + a assinatura em trial de 7 dias (simulação de WhatsApp). */
export async function cadastrarEmpresaCliente({ me, referralCode, form }) {
  const nomeContador = me?.full_name || me?.email || 'Contador';
  const trialEndsAt = new Date(Date.now() + PLANO_CLIENTE.trialDias * 24 * 60 * 60 * 1000).toISOString();

  const empresa = await base44.entities.Company.create({
    name: form.nome_fantasia,
    cnpj: form.cnpj,
    owner_whatsapp: form.whatsapp,
    employee_count: Number(form.funcionarios) || 0,
    accountant_id: me?.id,
    accountant_name: nomeContador,
    status_assinatura: 'trialing',
    plano_atual: 'trial_premium',
    trial_ends_at: trialEndsAt,
    limite_funcionarios: 50,
  });

  const mensagem =
    `Olá, seu contador ${nomeContador} te cadastrou no Custo Real. Seu passivo é R$ 5.838. ` +
    `Ative: /ativar/${empresa.id}`;

  const assinatura = await base44.entities.Subscription.create({
    company_id: empresa.id,
    company_name: form.nome_fantasia,
    cnpj: form.cnpj,
    plan: PLANO_CLIENTE.plano,
    amount: PLANO_CLIENTE.valor,
    status: 'trial',
    trial_ends_at: trialEndsAt,
    commission_to_accountant: PLANO_CLIENTE.comissao,
    accountant_id: me?.id,
    accountant_name: nomeContador,
    owner_whatsapp: form.whatsapp,
    whatsapp_message: mensagem,
  });

  // Simula o disparo do WhatsApp para o dono da empresa.
  console.log(`[WhatsApp simulado] ${mensagem}`);

  return { empresa, assinatura, mensagem, link: `/ativar/${empresa.id}` };
}