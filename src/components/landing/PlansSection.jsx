import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Crown, Zap } from 'lucide-react';
import { PLANS } from '@/lib/plan';

export default function PlansSection({ startTo }) {
  const [cycle, setCycle] = useState('monthly');
  const [starter, premium] = PLANS;

  const perks = {
    starter: ['5 funcionários', 'Ponto facial com prova de vida', 'Ranking de custo real', 'Suporte por chat'],
    premium: [
      'Funcionários e batidas ilimitados',
      'Simulador de rescisão ilimitado',
      'Relatório para contador em PDF/Excel',
      'Alerta inteligente de passivo',
      'Suporte prioritário no WhatsApp',
    ],
  };

  const card = (plan, list, highlight) => {
    const price = plan[cycle];
    return (
      <motion.div
        className={`tech-card relative rounded-2xl p-5 ${highlight ? 'border-primary glow' : ''}`}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25 }}
      >
        {highlight && (
          <span className="absolute -top-3 left-5 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
            Mais usado · economize R$ 3.200/mês em contador
          </span>
        )}
        <div className="flex items-center gap-2">
          {highlight ? <Crown className="h-5 w-5 text-primary" /> : <Zap className="h-5 w-5 text-muted-foreground" />}
          <h3 className="font-tech text-sm font-bold uppercase tracking-wider">{plan.name}</h3>
        </div>
        <p className="mt-4 font-tech text-4xl font-extrabold">{price.label.split('/')[0]}</p>
        <p className="text-xs text-muted-foreground">
          {cycle === 'monthly' ? 'por mês, cancele quando quiser' : 'por ano · 2 meses grátis'}
        </p>

        <ul className="mt-5 space-y-2.5 text-sm text-foreground/75">
          {list.map((p) => (
            <li key={p} className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-save-tech" /> {p}
            </li>
          ))}
        </ul>

        <Link
          to={startTo}
          className={`mt-6 block rounded-xl px-5 py-3 text-center text-sm font-semibold ${
            highlight ? 'cta-green glow font-bold' : 'border border-white/20 text-foreground/90 hover:border-primary/60'
          }`}
        >
          Começar e parar de perder dinheiro
        </Link>
      </motion.div>
    );
  };

  return (
    <section id="planos" className="lazy-section mx-auto max-w-6xl scroll-mt-24 px-5 py-16 sm:px-8 lg:py-20">
      <h2 className="font-tech text-center text-2xl font-bold sm:text-3xl">Planos</h2>
      <p className="mt-3 text-center text-sm text-foreground/65">
        7 dias grátis no PREMIUM, sem cartão. Cancele quando quiser.
      </p>

      <div className="mt-6 flex justify-center">
        <div className="tech-card inline-flex rounded-full p-1 text-sm">
          {[
            ['monthly', 'Mensal'],
            ['yearly', 'Anual (-20%)'],
          ].map(([v, label]) => (
            <button
              key={v}
              onClick={() => setCycle(v)}
              className={`rounded-full px-5 py-1.5 transition ${
                cycle === v ? 'bg-primary font-semibold text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {card(starter, perks.starter, false)}
        {card(premium, perks.premium, true)}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Teste de 7 dias no PREMIUM sem cartão. Depois, a partir de R$ 29,90/mês. Cancele em 1 clique.
      </p>
    </section>
  );
}