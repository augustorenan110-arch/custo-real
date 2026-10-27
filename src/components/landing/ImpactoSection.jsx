import { motion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownRight } from 'lucide-react';
import RankingPhone from '@/components/landing/RankingPhone';

const DATA = [
{ mes: 'Jan', custo: 120 },
{ mes: 'Fev', custo: 95 },
{ mes: 'Mar', custo: 80 },
{ mes: 'Abr', custo: 68 },
{ mes: 'Mai', custo: 55 },
{ mes: 'Jun', custo: 45 }];


const CARD = 'tech-card flex h-full flex-col rounded-[24px] p-6 lg:p-8';
const TITLE = 'flex h-5 items-center text-[13px] font-bold uppercase tracking-[0.18em] text-foreground/80';

const rise = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55 }
};

export default function ImpactoSection() {
  return (
    <section className="relative mx-auto w-full max-w-[1100px] px-5 sm:px-8">
      <div className="my-[3cm] grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 hidden">
        <motion.div {...rise} className={CARD}>
          <h3 className={TITLE}>Passivo acumulado · redução de custos</h3>

          <div className="mt-5 shrink-0">
            <p className="font-display text-[48px] font-bold leading-none text-primary">-62%</p>
            <p className="mt-1 text-sm text-muted-foreground">Redução total no período</p>
          </div>

          <div className="mt-4 h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="impactoFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#007bff" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#007bff" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis dataKey="mes" stroke="rgba(255,255,255,0.35)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="rgba(255,255,255,0.35)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tickFormatter={(v) => `R$ ${v}k`} />
                
                <Tooltip
                  cursor={{ stroke: 'rgba(255,255,255,0.18)' }}
                  contentStyle={{ background: '#0f0f12', border: '1px solid #2a2a2e', borderRadius: 12, fontSize: 12 }}
                  labelFormatter={(v) => `${v} / 2026`}
                  formatter={(v) => [`R$ ${v}k`, 'Passivo']} />
                
                <Area
                  type="monotone"
                  dataKey="custo"
                  stroke="#007bff"
                  strokeWidth={3}
                  fill="url(#impactoFill)"
                  activeDot={{ r: 5, fill: '#007bff' }} />
                
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-auto flex items-center gap-4 border-t border-white/10 pt-5 text-sm">
            <span className="inline-flex items-center gap-1.5 text-save-tech">
              <ArrowDownRight className="h-4 w-4" /> 62% vs período anterior
            </span>
            <span className="ml-auto text-muted-foreground">Economia: R$ 75k</span>
          </div>
        </motion.div>

        <motion.div {...rise} transition={{ duration: 0.55, delay: 0.1 }} className={CARD}>
          <h3 className={TITLE}>Ranking de funcionários</h3>
          <div className="flex flex-1 items-center justify-center py-4">
            <RankingPhone />
          </div>
        </motion.div>
      </div>
    </section>);

}