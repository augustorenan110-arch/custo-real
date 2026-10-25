import React from "react";
import { ArrowRight } from "lucide-react";
import FakeQr from "@/components/promo/FakeQr";

export default function PromoSlide4() {
  return (
    <section className="vp-slide" style={{ background: "#22C55E" }}>
      <div className="vp-in-4 relative flex w-full flex-col items-center gap-[calc(4*var(--u))]">
        <p className="vp-h1 font-display font-extrabold text-black">Baixe Custo Real - RH IA</p>
        <p className="vp-body font-display font-bold text-black/75">
          7 dias grátis no PREMIUM · sem cartão de crédito
        </p>
        <div className="vp-float rounded-[calc(5*var(--u))] bg-white p-[calc(3*var(--u))]">
          <FakeQr className="w-[calc(34*var(--u))]" />
        </div>
        <p className="vp-h2 font-display font-extrabold text-black">Link na bio ↑</p>
        <div className="vp-glow vp-btn inline-flex items-center gap-[calc(2.5*var(--u))] bg-black font-display font-extrabold uppercase tracking-wide text-[#22C55E]">
          Começar grátis
          <ArrowRight className="h-[calc(5*var(--u))] w-[calc(5*var(--u))]" />
        </div>
        <p className="vp-small max-w-[80%] font-semibold text-black/70">
          Cadastre 1 funcionário e veja o passivo oculto dele em 2 minutos.
        </p>
      </div>
    </section>
  );
}