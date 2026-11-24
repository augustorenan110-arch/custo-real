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
      <div className="pg2-section mt-10">
        <ul className="pg2-grid">
          {showcaseItems.map((item, index) => <ShowcaseCard key={item.kind} item={item} index={index} />)}
        </ul>
      </div>
      <p className="mt-5 text-center text-xs text-muted-foreground">Imagens ilustrativas dos recursos do Custo Real.</p>
    </section>
  );
}