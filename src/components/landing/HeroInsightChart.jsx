import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { LineChart } from 'lucide-react';
import { custoDemissao } from '@/lib/campanha';
import { brl } from '@/lib/format';

const SALARIO = 2000;

export default function HeroInsightChart() {
  const data = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const meses = i * 2 + 1;
        return { meses, custo: custoDemissao(SALARIO, meses).total };
      }),
    []
  );
  const passivo4Anos = data[data.length - 1].custo;

  return (
    <motion.div
      className="tech-card w-full overflow-hidden rounded-3xl p-5"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <LineChart className="h-3.5 w-3.5 text-primary" /> Passivo acumulado
          </p>
          <p className="mt-1.5 text-sm text-foreground/70">
            Quanto tempo de casa custa a mais na rescisão
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-[10px] font-semibold text-cost-tech">
          salário {brl(SALARIO)}
        </span>
      </div>

      <div className="mt-4 h-[168px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="heroPassivo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#007bff" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#007bff" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
            <XAxis
              dataKey="meses"
              ticks={[1, 12, 24, 36, 48]}
              tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}m`}
            />
            <YAxis hide domain={['dataMin - 400', 'dataMax']} />
            <Tooltip
              cursor={{ stroke: 'rgba(255,255,255,0.18)' }}
              contentStyle={{
                background: '#0f0f12',
                border: '1px solid #2a2a2e',
                borderRadius: 12,
                fontSize: 11,
              }}
              labelFormatter={(v) => `${v} meses de casa`}
              formatter={(v) => [brl(v), 'Custo para demitir']}
            />
            <Area
              type="monotone"
              dataKey="custo"
              stroke="#007bff"
              strokeWidth={2.5}
              fill="url(#heroPassivo)"
              dot={false}
              activeDot={{ r: 4, fill: '#007bff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        Em 4 anos de casa o mesmo funcionário passa a custar{' '}
        <span className="font-semibold text-cost-tech">{brl(passivo4Anos)}</span> só para desligar.
      </p>
    </motion.div>
  );
}