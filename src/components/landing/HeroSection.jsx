import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle, ScanFace, MapPin, TrendingUp } from 'lucide-react';
import HeroCalculator from '@/components/landing/HeroCalculator';
import PhoneMockup from '@/components/landing/PhoneMockup';

const TAGS = [
  { icon: ScanFace, label: 'Ponto facial com prova de vida' },
  { icon: MapPin, label: 'GPS e cerca virtual' },
  { icon: TrendingUp, label: 'Ranking de custo real' },
];

export default function HeroSection({ startTo, panelTo }) {
  return (
    <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-24 lg:pt-16">
      <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <span className="inline-flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-[11px] font-medium text-cost-tech sm:text-xs">
          <motion.span
            className="h-2 w-2 rounded-full bg-destructive"
            animate={{ opacity: [1, 0.25, 1], scale: [1, 1.35, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          R$ 5.838,65 — custo oculto para demitir um funcionário de R$ 2.000
        </span>

        <h1 className="font-tech mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-[64px]">
          Gestão de Pessoas e Custos <span className="text-gradient">com Inteligência Artificial</span>
        </h1>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/70 sm:text-lg">
          Mais controle, eficiência e decisões estratégicas — ponto facial com prova de vida e cálculo automático
          de FGTS, 13º, férias, multa de 40% e o custo REAL de demissão. O que a planilha esconde, o Custo Real
          mostra.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              to={startTo}
              className="cta-blue glow inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold sm:w-auto"
            >
              Ver meu passivo grátis <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              to={panelTo}
              className="tech-card inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition hover:border-primary/60 sm:w-auto"
            >
              <PlayCircle className="h-4 w-4 text-primary" /> Simular demissão em 1 clique
            </Link>
          </motion.div>
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          {TAGS.map((t) => (
            <span
              key={t.label}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-foreground/70"
            >
              <t.icon className="h-3.5 w-3.5 text-primary" /> {t.label}
            </span>
          ))}
        </div>
      </motion.div>

      <div className="space-y-8">
        <HeroCalculator panelTo={panelTo} />
        <PhoneMockup />
      </div>
    </section>
  );
}