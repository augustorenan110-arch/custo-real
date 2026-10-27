import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: 'Economizei R$ 8.400 em demissões planejadas.',
    author: 'João',
    role: 'Dono de mercado · SP',
  },
  {
    quote: 'Descobri que meu funcionário mais antigo custava R$ 12 mil para demitir. Deu tempo de planejar.',
    author: 'Mariana',
    role: 'Clínica odontológica · MG',
  },
  {
    quote: 'O ponto facial acabou com a discussão de horário. Um ano sem nenhum processo trabalhista.',
    author: 'Carlos',
    role: 'Transportadora · PR',
  },
];

export default function SocialProof() {
  return (
    <section className="lazy-section mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <div className="tech-card rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-1 text-warning">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <p className="font-tech text-lg font-bold sm:text-xl">
            Usado por <span className="text-primary">347 empresas</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Mercados, clínicas, transportadoras e escritórios que já sabem quanto custa o time.
          </p>
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.author}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-5 text-center"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
            >
              <Quote className="mx-auto h-5 w-5 text-primary/60" />
              <blockquote className="mt-3 text-sm leading-relaxed text-foreground/85">“{t.quote}”</blockquote>
              <figcaption className="mt-4 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground/85">{t.author}</span> · {t.role}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}