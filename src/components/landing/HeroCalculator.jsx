import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, ShieldAlert, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { custoDemissao } from '@/lib/campanha';
import { brl } from '@/lib/format';

export default function HeroCalculator({ panelTo = '/register' }) {
  const [salary, setSalary] = useState(2000);
  const [months, setMonths] = useState(8);

  const { rows, fgtsAcumulado, total } = useMemo(() => custoDemissao(salary, months), [salary, months]);

  return (
    <div className="tech-card relative overflow-hidden rounded-3xl p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />

      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Custo lido pela IA
        </span>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
          ao vivo
        </span>
      </div>

      <p className="mt-4 text-xs text-foreground/70">Custo para demitir HOJE sem justa causa</p>
      <p className="text-cost-tech font-tech text-3xl font-extrabold sm:text-4xl">{brl(total)}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Funcionário de {brl(salary)} · {months} {months === 1 ? 'mês' : 'meses'} de casa · limite CLT
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="hc-sal" className="text-xs">Salário (R$)</Label>
          <Input
            id="hc-sal"
            type="number"
            min="500"
            step="100"
            value={salary}
            onChange={(e) => setSalary(Number(e.target.value) || 0)}
            className="field h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hc-mon" className="text-xs">Tempo de casa: {months} meses</Label>
          <input
            id="hc-mon"
            type="range"
            min="1"
            max="60"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[color:#2563eb]"
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-1.5 rounded-2xl border border-white/10 bg-black/25 p-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 text-xs">
            <span className="text-foreground/70">{label}</span>
            <span className="font-medium tabular-nums">{brl(value)}</span>
          </div>
        ))}
      </div>

      <p className="mt-3 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
        <span>FGTS acumulado no período (já depositado)</span>
        <span className="tabular-nums">{brl(fgtsAcumulado)}</span>
      </p>

      <ul className="mt-4 space-y-2 text-xs text-foreground/75">
        <li className="flex gap-2">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-save-tech" /> Multa de 40% sobre o FGTS acumulado de
          R$ {fgtsAcumulado.toFixed(2).replace('.', ',')}
        </li>
        <li className="flex gap-2">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-save-tech" /> 13º + férias + 1/3 provisionados
        </li>
        <li className="flex gap-2">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-save-tech" /> Aviso prévio + saldo de salário
        </li>
      </ul>

      <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-[11px] font-semibold text-save-tech">
        <ShieldAlert className="h-3.5 w-3.5" /> Acima do esperado · avaliar demissão
      </span>

      <motion.div whileHover={{ scale: 1.02 }} className="mt-4">
        <Link
          to={panelTo}
          className="cta-green glow flex h-14 w-full animate-pulse items-center justify-center gap-2 rounded-xl px-5 text-center text-[16px] font-bold uppercase"
        >
          Ver meu passivo grátis <ArrowRight size={18} strokeWidth={2.6} />
        </Link>
      </motion.div>
    </div>
  );
}