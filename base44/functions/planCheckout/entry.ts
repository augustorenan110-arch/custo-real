import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

const API = 'https://api.stripe.com/v1';
const STRIPE_VERSION = '2025-10-29.clover';

// Assinaturas do Custo Real — resolvidas pelo lookup_key criado no Stripe.
const PLANS = {
  custo_real_starter_monthly: 'starter',
  custo_real_starter_yearly: 'starter',
  custo_real_premium_monthly: 'premium',
  custo_real_premium_yearly: 'premium',
};

export default async function (req: Request): Promise<Response> {
  try {
    const appUrl = req.headers.get('X-Base44-App-Url');
    if (!appUrl) {
      console.error('planCheckout: cabecalho X-Base44-App-Url ausente');
      return Response.json({ error: 'Origem do aplicativo indisponível' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const lookupKey = String(body.price_id || '');
    const plan = PLANS[lookupKey];
    if (!plan) return Response.json({ error: 'Plano inválido' }, { status: 400 });

    const base44 = createClientFromRequest(req);
    let user = null;
    try {
      user = await base44.auth.me();
    } catch {
      user = null;
    }

    const key = secrets.get('STRIPE_SECRET_KEY');
    const appId = secrets.get('BASE44_APP_ID') || '';
    const headers = {
      Authorization: `Bearer ${key}`,
      'Stripe-Version': STRIPE_VERSION,
    };

    const priceRes = await fetch(
      `${API}/prices?limit=1&lookup_keys[]=${encodeURIComponent(lookupKey)}`,
      { headers, signal: AbortSignal.timeout(10000) },
    );
    const priceJson = await priceRes.json();
    if (!priceRes.ok) {
      console.error('planCheckout: erro ao buscar preco', priceJson?.error?.message);
      return Response.json({ error: 'Preço indisponível' }, { status: 502 });
    }
    const priceId = priceJson?.data?.[0]?.id;
    if (!priceId) return Response.json({ error: 'Preço não configurado' }, { status: 400 });

    const companyId = String(body.company_id || '');
    const email = String(user?.email || body.email || '').trim();
    const returnTo = `${appUrl}/planos`;

    const params = new URLSearchParams();
    params.set('mode', 'subscription');
    params.set('line_items[0][price]', priceId);
    params.set('line_items[0][quantity]', '1');
    params.set('success_url', `${returnTo}?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
    params.set('cancel_url', `${returnTo}?checkout=cancel`);
    params.set('allow_promotion_codes', 'true');
    params.set('metadata[base44_app_id]', appId);
    params.set('metadata[plan]', plan);
    params.set('subscription_data[metadata][base44_app_id]', appId);
    params.set('subscription_data[metadata][plan]', plan);
    if (companyId) {
      params.set('metadata[company_id]', companyId);
      params.set('subscription_data[metadata][company_id]', companyId);
    }
    if (email) params.set('customer_email', email);

    const sessionRes = await fetch(`${API}/checkout/sessions`, {
      method: 'POST',
      headers: {
        ...headers,
        'Idempotency-Key': crypto.randomUUID(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      signal: AbortSignal.timeout(20000),
    });
    const session = await sessionRes.json();
    if (!sessionRes.ok) {
      console.error('planCheckout: erro ao criar sessao', session?.error?.message);
      return Response.json({ error: session?.error?.message || 'Falha ao criar checkout' }, { status: 502 });
    }

    return Response.json({ url: session.url, id: session.id, plan });
  } catch (error) {
    console.error('planCheckout: erro inesperado', error?.message);
    return Response.json({ error: error?.message || 'Erro inesperado' }, { status: 500 });
  }
}