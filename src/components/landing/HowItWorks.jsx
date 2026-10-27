import { motion } from 'framer-motion';
import { UserPlus, ScanFace, LayoutDashboard } from 'lucide-react';

const STEPS = [
  {
    icon: UserPlus,
    title: 'Cadastre o funcionário e o salário em 30 segundos',
    text: 'Nome, cargo, salário e data de admissão. O Custo Real já calcula FGTS, 13º, férias e o custo de demissão.',
  },
  {
    icon: ScanFace,
    title: 'O funcionário bate o ponto facial pelo celular',
    text: 'Sem relógio de ponto, sem catraca, sem papel. Prova de vida, GPS e cerca virtual validam cada batida.',
  },
  {
    icon: LayoutDashboard,
    title: 'O painel mostra o custo real e o custo de demitir cada um',
    text: 'Ranking atualizado todo dia e alerta quando alguém fica caro. Você decide com o número na tela.',
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="lazy-section mx-auto max-w-3xl scroll-mt-24 px-5 py-16 sm:px-8 lg:py-20">
      <h2 className="font-tech text-center text-2xl font-bold sm:text-3xl">Como funciona</h2>
      <p className="mt-3 text-center text-sm text-foreground/65">
        Do cadastro ao custo real na tela em menos de 5 minutos.
      </p>

      <div className="mx-auto mt-12 max-w-2xl space-y-6">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.title}
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-primary/40 bg-[#0d0d10] text-primary">
              <s.icon className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <div className="tech-card mt-3 w-full rounded-2xl p-5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                Passo {i + 1}
              </span>
              <h3 className="mt-2 text-sm font-semibold">{s.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-foreground/65">{s.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}