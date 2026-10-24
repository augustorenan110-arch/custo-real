import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Sparkles, Crown, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useMe } from '@/hooks/useMe';
import { useCompany } from '@/hooks/useHr';
import { useToast } from '@/components/ui/use-toast';
import { PLANS, planLabel, trialDaysLeft, isTrialActive } from '@/lib/plan';

const TRIAL_CARD = {
  name: 'TESTE 7 DIAS PREMIUM',
  tagline: 'Conheça tudo antes de decidir',
  perks: ['7 dias de PREMIUM completo', '3 funcionários no teste', '100 batidas de ponto', 'Sem cartão de crédito'],
};

export default function Planos() {
  const { data: me } = useMe();
  const { data: company } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cycle, setCycle] = useState('monthly');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get('checkout');
    if (checkout === 'success') {
      toast({ title: 'Pagamento confirmado', description: 'Estamos ativando o seu plano agora.' });
      queryClient.invalidateQueries({ queryKey: ['company'] });
    } else if (checkout === 'cancel') {
      toast({ title: 'Checkout cancelado', description: 'Nenhuma cobrança foi feita.' });
    }
  }, []);

  async function subscribe(plan, priceId) {
    const isFramed = window.self !== window.top;
    const checkoutTab = isFramed ? window.open('', '_blank') : null;
    if (isFramed && !checkoutTab) {
      toast({ variant: 'destructive', title: 'Permita pop-ups para concluir o pagamento' });
      return;
    }
    if (checkoutTab) checkoutTab.opener = null;

    setBusy(priceId);
    try {
      const res = await base44.functions.invoke('planCheckout', {
        price_id: priceId,
        plan,
        cycle,
        company_id: company?.id,
        email: me?.email,
      });
      const url = res?.data?.url;
      if (!url) throw new Error(res?.data?.error || 'Checkout indisponível');
      if (checkoutTab) checkoutTab.location.replace(url);
      else window.location.assign(url);
      return;
    } catch (error) {
      checkoutTab?.close();
      toast({
        variant: 'destructive',
        title: 'Checkout indisponível',
        description: error?.response?.data?.error || error?.message || 'Tente novamente em instantes.',
      });
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Planos Custo Real</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {company ? planLabel(company) : 'Escolha o plano da sua empresa.'}
        </p>
        {isTrialActive(company) && (
          <p className="mt-1 text-xs text-primary">
            Faltam {trialDaysLeft(company)} dia(s) do seu teste PREMIUM.
          </p>
        )}
      </div>

      <div className="flex justify-center">
        <div className="glass inline-flex rounded-full p-1 text-sm">
          {[
            ['monthly', 'Mensal'],
            ['yearly', 'Anual'],
          ].map(([v, label]) => (
            <button
              key={v}
              onClick={() => setCycle(v)}
              className={`rounded-full px-4 py-1.5 transition ${
                cycle === v ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5">
          <Sparkles className="h-5 w-5 text-primary" strokeWidth={1.7} />
          <h2 className="mt-3 text-sm font-semibold">{TRIAL_CARD.name}</h2>
          <p className="text-xs text-muted-foreground">{TRIAL_CARD.tagline}</p>
          <p className="mt-4 font-display text-3xl font-bold">R$ 0</p>
          <p className="text-xs text-muted-foreground">7 dias · depois a partir de R$ 29,90/mês</p>
          <ul className="mt-4 space-y-2 text-xs text-foreground/75">
            {TRIAL_CARD.perks.map((p) => (
              <li key={p} className="flex gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> {p}
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className="mt-5 w-full">
            <Link to="/painel">Usar o teste agora</Link>
          </Button>
        </div>

        {PLANS.map((p) => {
          const price = p[cycle];
          return (
            <div
              key={p.id}
              className={`glass relative rounded-2xl p-5 ${p.popular ? 'border-primary/50 glow' : ''}`}
            >
              {p.popular && (
                <span className="absolute -top-2.5 left-5 rounded-full bg-primary px-3 py-0.5 text-[11px] font-semibold text-primary-foreground">
                  Mais popular
                </span>
              )}
              <Crown className={`h-5 w-5 ${p.popular ? 'text-primary' : 'text-muted-foreground'}`} strokeWidth={1.7} />
              <h2 className="mt-3 text-sm font-semibold">{p.name}</h2>
              <p className="text-xs text-muted-foreground">{p.tagline}</p>
              <p className="mt-4 font-display text-3xl font-bold">{price.label.split('/')[0]}</p>
              <p className="text-xs text-muted-foreground">
                {price.label.split('/')[1] ? `por ${price.label.split('/')[1]}` : ''}
                {price.offer ? ` · ${price.offer}` : ''}
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {p.limite_funcionarios ? `${p.limite_funcionarios} funcionários` : 'Funcionários ilimitados'} ·{' '}
                {p.punches}
              </p>
              <ul className="mt-4 space-y-2 text-xs text-foreground/75">
                {p.perks.map((x) => (
                  <li key={x} className="flex gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> {x}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-5 w-full"
                variant={p.popular ? 'default' : 'outline'}
                disabled={busy === price.priceId}
                onClick={() => subscribe(p.id, price.priceId)}
              >
                {busy === price.priceId && <Loader2 className="h-4 w-4 animate-spin" />} Assinar {p.name}
              </Button>
              <p className="mt-2 text-center text-[10px] text-muted-foreground">{price.priceId}</p>
            </div>
          );
        })}
      </div>

      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        Pagamento processado pelo Stripe. Ao assinar pelo aplicativo das lojas, a cobrança é feita pela Apple App
        Store ou Google Play (RevenueCat), com os mesmos identificadores de produto. Cancelamento a qualquer
        momento; o acesso segue até o fim do período pago.
      </p>
    </div>
  );
}