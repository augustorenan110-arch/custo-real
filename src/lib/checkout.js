import { base44 } from '@/api/base44Client';

/** Assinatura do plano completo: R$ 59,90/mês (Stripe). */
export const PREMIUM_MONTHLY = 'custo_real_premium_monthly';

/**
 * Abre o checkout do Stripe. No preview (iframe) o checkout precisa abrir em
 * uma aba de verdade — por isso a aba é aberta já no clique do usuário.
 */
export async function startPlanCheckout({ priceId = PREMIUM_MONTHLY, companyId, email } = {}) {
  const isFramed = window.self !== window.top;
  const tab = isFramed ? window.open('', '_blank') : null;
  if (isFramed && !tab) throw new Error('Permita pop-ups para concluir o pagamento.');
  if (tab) tab.opener = null;

  try {
    const res = await base44.functions.invoke('planCheckout', {
      price_id: priceId,
      company_id: companyId,
      email,
    });
    const url = res?.data?.url;
    if (!url) throw new Error(res?.data?.error || 'Checkout indisponível');
    if (tab) tab.location.replace(url);
    else window.location.assign(url);
  } catch (error) {
    tab?.close();
    throw error;
  }
}