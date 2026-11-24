import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, CheckCircle2, XCircle, Clock, DollarSign } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { brl, dateBR } from '@/lib/format';

const TABS = [
  { id: 'active', label: 'Ativas', icon: CheckCircle2, color: 'text-success' },
  { id: 'canceled', label: 'Canceladas', icon: XCircle, color: 'text-destructive' },
  { id: 'trial', label: 'Trial 7 dias', icon: Clock, color: 'text-warning' },
];

export default function AdminFinanceiro() {
  const [tab, setTab] = useState('active');

  const { data: subs = [], isLoading } = useQuery({
    queryKey: ['admin', 'subscriptions'],
    queryFn: async () => {
      const r = await base44.entities.Subscription.filter({}, { limit: 500, sort: '-created_date' });
      return r.items;
    },
  });

  const ativas = subs.filter((s) => s.status === 'active');
  const canceladas = subs.filter((s) => s.status === 'canceled');
  const trial = subs.filter((s) => s.status === 'trial');
  const mrr = ativas.reduce((a, s) => a + (s.amount || 0), 0);

  const lista = tab === 'active' ? ativas : tab === 'canceled' ? canceladas : trial;

  const stats = [
    { label: 'Ativas', value: ativas.length, icon: CheckCircle2, color: 'text-success' },
    { label: 'Canceladas', value: canceladas.length, icon: XCircle, color: 'text-destructive' },
    { label: 'Trial', value: trial.length, icon: Clock, color: 'text-warning' },
    { label: 'MRR', value: brl(mrr), icon: DollarSign, color: 'text-primary' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold">Financeiro</h2>
      <p className="mt-1 text-sm text-muted-foreground">Assinaturas e receita recorrente.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-xs">{s.label}</span>
            </div>
            <p className="mt-2 text-xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition ${
              tab === t.id ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-white/5'
            }`}
          >
            <t.icon className={`h-4 w-4 ${tab === t.id ? 'text-primary' : t.color}`} />
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : lista.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">Nenhuma assinatura nesta categoria.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {lista.map((s) => (
            <div key={s.id} className="glass rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-medium">{s.company_name || '—'}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">CNPJ: {s.cnpj || '—'}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold">{brl(s.amount)}</p>
                  <span className="text-xs text-muted-foreground">{s.plan || '—'}</span>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>Método: {s.metodo_pagamento || '—'}</span>
                {s.trial_ends_at && <span>Trial até: {dateBR(s.trial_ends_at)}</span>}
                {s.activated_at && <span>Ativada: {dateBR(s.activated_at)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}