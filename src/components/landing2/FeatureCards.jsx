import { motion } from 'framer-motion';
import { ScanFace, TrendingDown, BarChart3, ShieldCheck } from 'lucide-react';

const CARDS = [
  {
    icon: ScanFace,
    title: 'Controle de Ponto Inteligente',
    desc: 'Automatize registros com IA e reconhecimento facial em tempo real.',
  },
  {
    icon: TrendingDown,
    title: '-30% em Custos Operacionais',
    desc: 'Reduza custos com análise preditiva e otimização inteligente.',
    badge: '30% economia no último trimestre',
  },
  {
    icon: BarChart3,
    title: 'Relatórios em tempo real',
    desc: 'Dashboards dinâmicos para decisões ágeis e precisas.',
  },
  {
    icon: ShieldCheck,
    title: 'Seguro & LGPD Compliant',
    desc: 'Segurança de dados de ponta com criptografia e auditoria completa.',
  },
];

export default function FeatureCards() {
  return (
    <section id="recursos" className="relative z-10">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-4 sm:grid-cols-2">
          {CARDS.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative rounded-2xl border border-primary/40 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:border-primary/70"
              >
                <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition group-hover:opacity-100" style={{ boxShadow: '0 0 30px -10px hsl(211 100% 50% / 0.55)' }} />
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold">{c.title}</h3>
                    <p className="mt-1 text-sm text-white/60">{c.desc}</p>
                    {c.badge && (
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-400 ring-1 ring-emerald-500/30">
                        {c.badge}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}