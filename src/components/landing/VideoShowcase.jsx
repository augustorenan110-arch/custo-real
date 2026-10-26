import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';

const VIDEO_URL =
  'https://media.base44.com/videos/public/6ad9f17a4227cd1a92e98f25/bd01c8426_video1.mp4';

export default function VideoShowcase() {
  return (
    <section
      id="apresentacao"
      className="lazy-section mx-auto max-w-5xl scroll-mt-24 px-5 py-16 sm:px-8 lg:py-20"
    >
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
          <PlayCircle className="h-3.5 w-3.5" /> Apresentação
        </span>
        <h2 className="font-tech mt-5 text-2xl font-bold sm:text-3xl">Veja o Custo Real em ação</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-foreground/65">
          Ponto facial com prova de vida, painel de custo real e o cálculo de quanto custa demitir cada funcionário —
          na prática, em poucos minutos.
        </p>
      </div>

      <motion.div
        className="relative mt-10"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
      >
        <div className="pointer-events-none absolute -inset-x-10 -top-20 h-48 rounded-full bg-primary/25 blur-[120px]" />
        <div className="tech-card relative overflow-hidden rounded-3xl p-2 shadow-[0_40px_110px_-50px_rgba(0,123,255,0.75)]">
          <video
            className="block w-full rounded-2xl bg-black"
            src={VIDEO_URL}
            controls
            playsInline
            autoPlay
            muted
            loop
            preload="metadata"
          >
            Seu navegador não reproduz o vídeo. Baixe em{' '}
            <a href={VIDEO_URL} className="text-primary underline">
              apresentação Custo Real
            </a>
            .
          </video>
        </div>
      </motion.div>
    </section>
  );
}