import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

const encoder = new TextEncoder();

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function validSignature(payload: string, header: string, secret: string) {
  const parts = header.split(',').reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split('=');
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});
  if (!parts.t || !parts.v1) return false;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(`${parts.t}.${payload}`));
  const hex = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return timingSafeEqual(hex, parts.v1);
}

const LIMITS: Record<string, number | null> = { starter: 5, premium: null };

export default async function (req: Request): Promise<Response> {
  try {
    const signature = req.headers.get('stripe-signature');
    const secret = secrets.get('STRIPE_WEBHOOK_SECRET');
    if (!signature || !secret) {
      console.error('stripeWebhook: assinatura ou segredo ausente');
      return Response.json({ error: 'Assinatura ausente' }, { status: 400 });
    }

    const raw = await req.text();
    if (!(await validSignature(raw, signature, secret))) {
      console.error('stripeWebhook: assinatura invalida');
      return Response.json({ error: 'Assinatura inválida' }, { status: 400 });
    }

    const event = JSON.parse(raw);
    const object = event?.data?.object || {};
    const metadata = object.metadata || {};
    const companyId = String(metadata.company_id || '');
    const plan = String(metadata.plan || '');
    const base44 = createClientFromRequest(req);

    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      // Cobrança de autoteste do lojista Base44 — não é pedido de cliente.
      if (metadata.base44_test_checkout === 'true') {
        return Response.json({ received: true, skipped: 'base44_test_checkout' });
      }
      if (companyId && LIMITS[plan] !== undefined) {
        const data: Record<string, unknown> = {
          plano_atual: plan,
          status_assinatura: 'ativo',
        };
        if (LIMITS[plan] !== null) data.limite_funcionarios = LIMITS[plan];
        const empresa = await base44.asServiceRole.entities.Company.get(companyId);
        await base44.asServiceRole.entities.Company.update(companyId, data);

        // Espelha o plano pago no usuário dono da empresa (tabela users).
        const dono = empresa?.created_by_id;
        if (dono) {
          const usuario: Record<string, unknown> = { plano: 'pago_59', tipo_conta: 'empresa' };
          if (LIMITS[plan] !== null) usuario.limite_funcionarios = LIMITS[plan];
          await base44.asServiceRole.entities.User.update(dono, usuario);
        }
      }
    } else if (event.type === 'customer.subscription.updated') {
      const status = String(object.status || '');
      if (companyId) {
        if (status === 'active' || status === 'trialing') {
          await base44.asServiceRole.entities.Company.update(companyId, { status_assinatura: 'ativo' });
        } else if (status === 'past_due' || status === 'unpaid' || status === 'canceled') {
          await base44.asServiceRole.entities.Company.update(companyId, {
            status_assinatura: status === 'canceled' ? 'cancelado' : 'expirado',
          });
        }
      }
    } else if (event.type === 'customer.subscription.deleted') {
      if (companyId) {
        await base44.asServiceRole.entities.Company.update(companyId, { status_assinatura: 'cancelado' });
      }
    }

    return Response.json({ received: true, type: event.type });
  } catch (error) {
    console.error('stripeWebhook: erro', error?.message);
    return Response.json({ error: error?.message || 'Erro inesperado' }, { status: 500 });
  }
}