import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const PAINS = [
  {
    icon: '≠',
    title: 'R$ 0 na planilha ≠ R$ 0 no bolso',
    text: 'O FGTS acumulado e a multa de 40% não aparecem na sua planilha de custos, mas saem da conta bancária no dia da demissão.',
  },
  {
    icon: '⚖',
    title: 'Ponto manual = processo trabalhista',
    text: 'Sem prova de vida e sem GPS, o funcionário contesta o horário e a Justiça costuma ficar do lado dele. Processos de R$ 8 mil a R$ 40 mil.',
  },
  {
    icon: '📉',
    title: 'Você contrata por R$ 2.000 e deve R$ 5.838',
    text: 'Saldo de salário, aviso prévio, 13º, férias, 1/3, FGTS e multa ficam invisíveis até a hora de demitir. Aí já é tarde para planejar.',
  },
];

export default function PainSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
      <h2 className="font-tech text-center text-2xl font-bold sm:text-3xl">
        3 formas que você está <span className="text-cost-tech">perdendo dinheiro</span>
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-foreground/65">
        78% dos empresários só descobrem o custo real do time na hora da demissão.
      </p>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {PAINS.map((p, i) => (
          <motion.div
            key={p.title}
            className="tech-card relative overflow-hidden rounded-2xl p-5 transition hover:border-destructive/60"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <motion.span
              className="grid h-11 w-11 place-items-center rounded-xl bg-destructive/15 text-lg text-cost-tech"
              animate={{ opacity: [1, 0.55, 1], boxShadow: ['0 0 0 0 rgba(239,68,68,0.35)', '0 0 0 10px rgba(239,68,68,0)', '0 0 0 0 rgba(239,68,68,0)'] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.3 }}
            >
              {p.icon}
            </motion.span>
            <h3 className="mt-4 font-semibold">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/65">{p.text}</p>
            <AlertTriangle className="absolute -bottom-4 -right-3 h-20 w-20 text-destructive/10" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}