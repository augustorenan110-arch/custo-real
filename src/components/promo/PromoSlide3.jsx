import React from "react";
import { Check, FileText } from "lucide-react";

export default function PromoSlide3() {
  return (
    <section className="vp-slide">
      <div className="vp-in-3 relative flex w-full flex-col items-center gap-[calc(6*var(--u))]">
        <div className="relative">
          <img src="/icon.png" alt="Custo Real" className="w-[calc(30*var(--u))]" />
          <span className="vp-pulse absolute -bottom-[calc(1*var(--u))] -right-[calc(1*var(--u))] grid h-[calc(13*var(--u))] w-[calc(13*var(--u))] place-items-center rounded-[calc(4*var(--u))] bg-[#22c55e] text-black ring-[calc(1.4*var(--u))] ring-[#08080a]">
            <Check className="h-[calc(7*var(--u))] w-[calc(7*var(--u))]" strokeWidth={3} />
          </span>
        </div>
        <p className="vp-h2 font-display font-bold text-white">
          Relatório pro contador em 1 clique
        </p>
        <div className="vp-glow vp-btn inline-flex items-center gap-[calc(2.5*var(--u))] bg-[#22c55e] font-display font-extrabold uppercase tracking-wide text-black">
          <FileText className="h-[calc(5*var(--u))] w-[calc(5*var(--u))]" />
          GERAR PDF CONTÁBIL
        </div>
        <p className="vp-body max-w-[82%] text-white/55">
          Folha, custo real e espelho de ponto prontos para enviar.
        </p>
      </div>
    </section>
  );
}