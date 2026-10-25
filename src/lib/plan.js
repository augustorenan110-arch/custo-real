// Planos, teste gratuito e assinaturas do Custo Real.
// Os IDs abaixo são os preços criados no Stripe / RevenueCat.
export const TRIAL_DAYS = 7;

/** Plano gratuito: 7 dias de teste e no máximo 3 funcionários. */
export const TRIAL_PLAN = {
  plan: 'trial_premium',
  limite: 3,
};

export const FREE_LIMIT = 3;

const PLANOS_GRATIS = ['trial_premium', 'gratis_7dias'];

export const PLANS = [
  {
    id: 'starter',
    name: 'STARTER',
    tagline: 'Para equipes pequenas',
    monthly: { priceId: 'custo_real_starter_monthly', price: 29.9, label: 'R$ 29,90/mês' },
    yearly: { priceId: 'custo_real_starter_yearly', price: 297, label: 'R$ 297/ano' },
    limite_funcionarios: 5,
    punches: '1.000 batidas/mês',
    perks: ['Ponto facial com prova de vida', 'GPS na batida', 'Ranking de custo real', 'Espelho de ponto em PDF'],
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    tagline: 'Custo real completo',
    popular: true,
    monthly: { priceId: 'custo_real_premium_monthly', price: 59.9, label: 'R$ 59,90/mês' },
    yearly: { priceId: 'custo_real_premium_yearly', price: 597, label: 'R$ 597/ano', offer: 'ou R$ 497 vitalício' },
    limite_funcionarios: null,
    punches: 'Batidas ilimitadas',
    perks: [
      'Tudo do Starter',
      'Simulador de rescisão e gastos com demissão',
      'Ranking de custo real por funcionário',
      'Excel contábil e pacote para o contador',
      'Prova de vida reforçada e GPS preciso',
    ],
  },
];

export const trialEndDate = (from = new Date()) => {
  const d = new Date(from);
  d.setDate(d.getDate() + TRIAL_DAYS);
  return d.toISOString();
};

export const trialDaysLeft = (company) => {
  if (!company?.trial_ends_at) return 0;
  const ms = new Date(company.trial_ends_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
};

/** Plano gratuito (teste de 7 dias) — sem assinatura paga. */
export const isFree = (company) => !company?.plano_atual || PLANOS_GRATIS.includes(company.plano_atual);

export const isTrialActive = (company) => isFree(company) && trialDaysLeft(company) > 0;

/** Teste grátis vencido: holerites e recursos liberados ficam bloqueados. */
export const freeBloqueado = (company) => isFree(company) && trialDaysLeft(company) <= 0;

export const trialExpired = (company) => freeBloqueado(company);

/** PREMIUM liberado (assinatura ou teste PREMIUM em andamento). */
export const hasPremium = (company) => isTrialActive(company) || company?.plano_atual === 'premium';

/** Limite de funcionários: 3 no plano grátis, 5 no STARTER, ilimitado no PREMIUM. */
export const limiteFuncionarios = (company) => {
  if (isFree(company)) return FREE_LIMIT;
  if (company?.plano_atual === 'premium') return null;
  return company?.limite_funcionarios ?? 5;
};

export const limiteAtingido = (company, total = 0) => {
  const limite = limiteFuncionarios(company);
  return limite !== null && total >= limite;
};

export const planLabel = (company) => {
  if (isTrialActive(company)) return `Teste PREMIUM · faltam ${trialDaysLeft(company)} dia(s)`;
  if (company?.plano_atual === 'premium') return 'PREMIUM ativo';
  if (company?.plano_atual === 'starter') return 'STARTER ativo';
  return 'Teste grátis';
};