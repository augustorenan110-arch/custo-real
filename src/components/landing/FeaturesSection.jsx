import { motion } from 'framer-motion';
import { ScanFace, MapPin, TrendingUp, Calculator, FileText, Bell } from 'lucide-react';

const FEATURES = [
  {
    icon: ScanFace,
    title: 'Ponto Facial com Prova de Vida',
    text: 'Anti-fraude: não aceita foto da foto. Confere o rosto ao vivo, com 99% de precisão, e funciona offline.',
  },
  {
    icon: MapPin,
    title: 'GPS + Cerca Virtual',
    text: 'Sabe onde e se o ponto foi batido dentro da empresa. Localização capturada só no momento da batida.',
  },
  {
    icon: TrendingUp,
    title: 'Ranking de Custo Real Automático',
    text: 'Lista quem é mais caro para manter e para demitir, atualizado todo dia. Decisão com número, não com achismo.',
  },
  {
    icon: Calculator,
    title: 'Simulador de Rescisão em 1 Clique',
    text: 'Calcula tudo conforme a CLT: saldo, aviso prévio, 13º, férias, 1/3, FGTS e multa de 40%. Sem contador.',
  },
  {
    icon: FileText,
    title: 'Relatório para Contador em PDF',
    text: 'Exporta ponto, provisões e rescisões em um clique, no formato que o seu contador já entende.',
  },
  {
    icon: Bell,
    title: 'Alerta Inteligente de Passivo',
    text: '“Funcionário João atingiu R$ 6.000 de custo de demissão — avalie.” Você é avisado antes de virar problema.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="funcionalidades" className="lazy-section mx-auto max-w-6xl scroll-mt-24 px-5 py-16 sm:px-8 lg:py-20">
      <h2 className="font-tech text-center text-2xl font-bold sm:text-3xl">
        A tecnologia que mostra o <span className="text-primary">custo real</span> do seu time
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-foreground/65">
        Tudo que a planilha não faz: biometria, geolocalização, provisionamento e alerta de passivo trabalhista.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            className="tech-card group rounded-2xl p-5 text-center transition duration-300 hover:-translate-y-0.5 hover:border-primary"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
          >
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
              <f.icon className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-foreground/65">{f.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}