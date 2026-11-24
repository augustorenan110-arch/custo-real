import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Fingerprint, CheckCircle2, ScanFace } from 'lucide-react';

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: d },
});

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[260px]">
      <div className="absolute -inset-6 rounded-[2.6rem] bg-primary/25 blur-3xl" />
      <div className="relative rounded-[2.4rem] border border-white/15 bg-[#0a1530] p-3 shadow-2xl">
        <div className="absolute left-1/2 top-3 h-5 w-24 -translate-x-1/2 rounded-full bg-black/60" />
        <div className="rounded-[1.9rem] bg-gradient-to-b from-[#0d1b3d] to-[#0a1530] p-4 pt-9">
          {/* Cabeçalho facial */}
          <div className="flex items-center justify-between text-[11px] text-white/50">
            <span>09:41</span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Online
            </span>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Reconhecimento Facial</p>
          </div>

          {/* Face scan */}
          <div className="relative mx-auto mt-5 h-36 w-36">
            <div className="absolute inset-0 rounded-full bg-primary/15 blur-xl" />
            <div className="relative grid h-full w-full place-items-center rounded-full border-2 border-primary/60 bg-primary/10">
              <ScanFace className="h-16 w-16 text-primary" />
              <span className="absolute left-1 top-1 h-4 w-4 rounded-tl-lg border-l-2 border-t-2 border-primary" />
              <span className="absolute right-1 top-1 h-4 w-4 rounded-tr-lg border-r-2 border-t-2 border-primary" />
              <span className="absolute bottom-1 left-1 h-4 w-4 rounded-bl-lg border-b-2 border-l-2 border-primary" />
              <span className="absolute bottom-1 right-1 h-4 w-4 rounded-br-lg border-b-2 border-r-2 border-primary" />
            </div>
          </div>

          {/* Resultado */}
          <div className="mt-5 flex flex-col items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/40">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verificado
            </span>
            <p className="text-center text-[11px] text-white/60">
              Identidade confirmada — 98% de confiança
            </p>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/20 text-primary">
                <Fingerprint className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">João Silva</p>
                <p className="text-[10px] text-white/50">Analista · Unidade SP</p>
              </div>
            </div>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Ponto registrado com sucesso
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero({ startTo }) {
  const TRUST = ['LGPD compliant', 'Integração em minutos', 'Suporte 24/7'];

  return (
    <section className="relative z-10">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-10 pt-8 md:grid-cols-2 md:pt-16">
        {/* Esquerda */}
        <div>
          <motion.div {...fadeUp(0)}>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Agora com IA
              <span className="text-white/30">•</span> Plataforma 100% segura
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.08)}
            className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl"
          >
            O controle da sua empresa na palma da sua mão
          </motion.h1>

          <motion.p {...fadeUp(0.16)} className="mt-4 text-base text-white/65 sm:text-lg">
            Gestão de Pessoas e Custos com Inteligência Artificial
          </motion.p>

          <motion.div {...fadeUp(0.24)} className="mt-7 flex flex-wrap gap-3">
            <Link
              to={startTo}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-[0_0_26px_-6px_hsl(211_100%_50%/0.85)] transition hover:bg-primary/90"
            >
              Começar agora
            </Link>
            <Link
              to="/video-promo"
              className="rounded-xl border border-primary/50 bg-transparent px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              Ver demonstração
            </Link>
          </motion.div>

          <motion.div {...fadeUp(0.32)} className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/55">
            {TRUST.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> {t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Direita */}
        <motion.div {...fadeUp(0.2)} className="flex justify-center md:justify-end">
          <PhoneMockup />
        </motion.div>
      </div>
    </section>
  );
}