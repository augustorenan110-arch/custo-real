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

  return null;






































































}