import { motion } from 'framer-motion';
import { X, Check, TrendingDown } from 'lucide-react';
import CountUp from '@/components/landing/CountUp';

const BEFORE = ['Planilha paralela e custo “no escuro”', 'Susto no caixa na hora da demissão', 'Risco trabalhista por falta de prova'];
const AFTER = [
  'Custo real na tela, todo dia',
  'Demissão planejada com valor calculado',
  'Ponto com prova de vida, GPS e auditoria',
];

export default function BeforeAfter() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
      <h2 className="font-tech text-center text-2xl font-bold sm:text-3xl">
        O que muda na sua empresa em <span className="text-primary">30 dias</span>
      </h2>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <motion.div
          className="tech-card rounded-2xl border-destructive/30 p-5"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cost-tech">Antes</p>
          <ul className="mt-4 space-y-3 text-sm text-foreground/70">
            {BEFORE.map((t) => (
              <li key={t} className="flex gap-2.5">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" /> {t}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="tech-card rounded-2xl border-success/40 p-5"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-save-tech">Depois</p>
          <ul className="mt-4 space-y-3 text-sm text-foreground/80">
            {AFTER.map((t) => (
              <li key={t} className="flex gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-save-tech" /> {t}
              </li>
            ))}
          </ul>
          <p className="mt-5 flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2 text-xs font-semibold text-save-tech">
            <TrendingDown className="h-4 w-4" /> Economia de até <CountUp value={32} decimals={0} suffix="%" /> em
            rotatividade
          </p>
        </motion.div>
      </div>
    </section>
  );
}