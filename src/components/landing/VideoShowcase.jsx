import { ScanFace } from 'lucide-react';
import ShowcaseCard from '@/components/landing/ShowcaseCard';
import { showcaseItems } from '@/components/landing/showcaseItems';
import '@/components/landing/showcase.css';

export default function VideoShowcase() {
  return (
    <section id="apresentacao" aria-labelledby="showcase-title" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 sm:px-8 lg:py-20">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
          <ScanFace className="h-3.5 w-3.5" aria-hidden="true" /> Apresentação
        </span>
        <h2 id="showcase-title" className="font-tech mt-5 text-2xl font-bold sm:text-3xl">Veja o Custo Real em ação</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Ponto facial, visão dos custos e simulação de demissão em um só lugar.
        </p>
      </div>
      <div className="mx-auto mt-10 max-w-3xl">
        <div
          className="overflow-hidden rounded-2xl border border-primary/40 shadow-[0_20px_55px_-30px_hsl(var(--primary)/0.45)]"
          style={{ aspectRatio: '16 / 9' }}
        >
          <video
            src="https://base44.app/api/apps/6ad9f17a4227cd1a92e98f25/files/mp/public/6ad9f17a4227cd1a92e98f25/07a6937e32ca6e7e6b3374a8a10da3fc_app-promo.mp4"
            controls
            playsInline
            muted
            loop
            autoPlay
            preload="metadata"
            className="h-full w-full object-cover"
          >
            Seu navegador não suporta a reprodução de vídeos.
          </video>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">Vídeo de apresentação do aplicativo Custo Real.</p>
      </div>
      <div className="pg2-section mt-10">
        <ul className="pg2-grid">
          {showcaseItems.map((item, index) => <ShowcaseCard key={item.kind} item={item} index={index} />)}
        </ul>
      </div>
      <p className="mt-5 text-center text-xs text-muted-foreground">Imagens ilustrativas dos recursos do Custo Real.</p>
    </section>
  );
}