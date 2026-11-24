import { useQuery } from '@tanstack/react-query';
import { CreditCard, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { brl } from '@/lib/format';

export default function AdminPlanos() {
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['admin', 'companies'],
    queryFn: async () => {
      const r = await base44.entities.Company.filter({}, { limit: 500 });
      return r.items;
    },
  });
  const { data: subs = [] } = useQuery({
    queryKey: ['admin', 'subscriptions'],
    queryFn: async () => {
      const r = await base44.entities.Subscription.filter({}, { limit: 500 });
      return r.items;
    },
  });

  const starter = companies.filter((c) => c.plano_atual === 'starter');
  const premium = companies.filter((c) => c.plano_atual === 'premium' || c.plano_atual === 'trial_premium');
  const gratis = companies.filter((c) => !c.plano_atual || c.plano_atual === 'gratis_7dias');

  const mrrStarter = subs.filter((s) => s.plan === 'STARTER' && s.status === 'active').reduce((a, s) => a + (s.amount || 0), 0);
  const mrrPremium = subs.filter((s) => s.plan === 'PREMIUM' && s.status === 'active').reduce((a, s) => a + (s.amount || 0), 0);

  const cards = [
    { titulo: 'STARTER — R$ 29,90', empresas: starter, mrr: mrrStarter, icon: CreditCard, color: 'text-primary' },
    { titulo: 'PREMIUM — R$ 59,90', empresas: premium, mrr: mrrPremium, icon: CheckCircle2, color: 'text-success' },
    { titulo: 'Grátis / Trial', empresas: gratis, mrr: 0, icon: Clock, color: 'text-warning' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold">Planos</h2>
      <p className="mt-1 text-sm text-muted-foreground">Distribuição das empresas por plano.</p>

      {isLoading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.titulo} className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2">
                <card.icon className={`h-5 w-5 ${card.color}`} />
                <h3 className="text-sm font-semibold">{card.titulo}</h3>
              </div>
              <p className="mt-3 text-3xl font-bold">{card.empresas.length}</p>
              <p className="text-xs text-muted-foreground">empresa(s)</p>
              {card.mrr > 0 && (
                <p className="mt-2 text-sm font-medium text-success">MRR: {brl(card.mrr)}</p>
              )}
              <div className="mt-4 space-y-1.5">
                {card.empresas.slice(0, 10).map((c) => (
                  <div key={c.id} className="truncate text-xs text-muted-foreground">{c.name || '—'}</div>
                ))}
                {card.empresas.length > 10 && (
                  <div className="text-xs text-primary">+{card.empresas.length - 10} outras</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}