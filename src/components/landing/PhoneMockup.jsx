import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { ScanFace, TrendingUp, Trophy, Check, WifiOff } from 'lucide-react';
import CountUp from '@/components/landing/CountUp';
import { CAMPANHA } from '@/lib/campanha';

const ROWS = [
{ name: 'Lucas M.', pts: 98 },
{ name: 'Julia R.', pts: 92 },
{ name: 'Marcos A.', pts: 87 }];


function ScreenCheckin() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-5 text-center">
      <div className="relative grid h-24 w-24 place-items-center rounded-full bg-success/15">
        <motion.span
          className="absolute inset-0 rounded-full border border-success/60"
          animate={{ scale: [1, 1.25, 1], opacity: [0.9, 0, 0.9] }}
          transition={{ duration: 2, repeat: Infinity }} />
        
        <ScanFace className="h-11 w-11 text-success" strokeWidth={1.6} />
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Reconhecimento facial</p>
        <p className="mt-1 text-sm font-semibold text-save-tech">Sucesso! Ponto às 08:32</p>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-[11px] text-success">
        <Check className="h-3 w-3" /> Prova de vida validada
      </span>
      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
        <WifiOff className="h-3 w-3" /> Offline? sincroniza depois
      </span>
    </div>);

}

function ScreenCost() {
  const bars = [
  ['Folha', 42],
  ['Encargos', 68],
  ['FGTS + multa', 88]];

  return (
    <div className="flex h-full flex-col justify-center gap-4 px-5">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Custo para demitir hoje</p>
      <p className="text-2xl font-bold text-cost-tech">
        <CountUp value={CAMPANHA.total} prefix="R$ " decimals={2} />
      </p>
      <div className="space-y-2.5">
        {bars.map(([label, pct], i) =>
        <div key={label}>
            <div className="flex justify-between text-[10px] text-foreground/70">
              <span>{label}</span>
              <span>{pct}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.1, delay: 0.15 * i, ease: 'easeOut' }} />
            
            </div>
          </div>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground">Salário R$ 2.000 · 8 meses · sem justa causa</p>
    </div>);

}

function ScreenRanking() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 px-5">
      <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        <Trophy className="h-3.5 w-3.5 text-warning" /> Ranking de funcionários
      </p>
      {ROWS.map((r, i) =>
      <motion.div
        key={r.name}
        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
        animate={{ x: [i === 0 ? 4 : 0, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse', delay: i * 0.2 }}>
        
          <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/20 text-[11px] font-semibold text-primary">
            {i + 1}
          </span>
          <span className="flex-1 text-xs">{r.name}</span>
          <span className="flex items-center gap-1 text-xs font-semibold text-save-tech">
            <TrendingUp className="h-3 w-3" /> {r.pts}pts
          </span>
        </motion.div>
      )}
    </div>);

}

export default function PhoneMockup({ className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '120px' });
  const [i, setI] = useState(0);
  const screens = [ScreenCheckin, ScreenCost, ScreenRanking];

  // Só anima quando o celular está na tela: mantém o scroll leve no celular.
  useEffect(() => {
    if (!inView) return undefined;
    const t = setInterval(() => setI((v) => (v + 1) % screens.length), 3000);
    return () => clearInterval(t);
  }, [inView]);

  const Screen = screens[i];

  return (
    <motion.div
      ref={ref}
      className={`relative mx-auto w-[248px] ${className}`}
      animate={inView ? { y: [0, -12, 0] } : { y: 0 }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
      
      <div className="absolute -inset-6 rounded-[3rem] bg-primary/20 blur-3xl" />
      <div className="relative rounded-[2.6rem] border border-white/15 bg-[#0d0d10] p-2 shadow-[0_30px_80px_-24px_rgba(37,99,235,0.55)]">
        <div className="relative h-[420px] overflow-hidden border border-white/10 bg-[#111114] rounded-none">
          <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black/80" />
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              className="h-full pt-6"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.45 }}>
              
              <Screen />
            </motion.div>
          </AnimatePresence>
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {screens.map((_, k) =>
            <span
              key={k}
              className={`h-1.5 w-1.5 rounded-full ${k === i ? 'bg-primary' : 'bg-white/25'}`} />

            )}
          </div>
        </div>
      </div>
    </motion.div>);

}