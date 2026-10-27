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
      



























































      
    </section>);

}