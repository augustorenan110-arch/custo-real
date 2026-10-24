// Planos, teste gratuito e assinaturas do Custo Real.
// Os IDs abaixo são os preços criados no Stripe / RevenueCat.
export const TRIAL_DAYS = 7;

export const TRIAL_PLAN = {
  plan: 'trial_premium',
  limite: 3,
  punches: 100,
};

export const PLANS = [
  {
    id: 'starter',
    name: 'STARTER',
    tagline: 'Para equipes pequenas',
    monthly: { priceId: 'custo_real_starter_monthly', price: 29.9, label: 'R$ 29,90/mês' },
    yearly: { priceId: 'custo_real_starter_yearly', price: 297, label: 'R$ 297/ano' },
    limite_funcionarios: 10,
    punches: '1.000 batidas/mês',
    perks: ['Ponto facial com prova de vida', 'GPS na batida', 'Espelho de ponto em PDF', 'Despesas com conferência da IA'],
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

export const isTrialActive = (company) =>
  company?.plano_atual === 'trial_premium' && trialDaysLeft(company) > 0;

export const trialExpired = (company) =>
  company?.plano_atual === 'trial_premium' && trialDaysLeft(company) <= 0;

/** PREMIUM liberado (assinatura ou teste PREMIUM em andamento). */
export const hasPremium = (company) => isTrialActive(company) || company?.plano_atual === 'premium';

export const planLabel = (company) => {
  if (isTrialActive(company)) return `Teste PREMIUM · faltam ${trialDaysLeft(company)} dia(s)`;
  if (company?.plano_atual === 'premium') return 'PREMIUM ativo';
  if (company?.plano_atual === 'starter') return 'STARTER ativo';
  return 'Teste grátis';
};