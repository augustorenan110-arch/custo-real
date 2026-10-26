import React from "react";
import { Logo, Wordmark } from "@/components/Brand";

export default function PromoSlide1() {
  return (
    <section className="vp-slide">
      <div className="vp-glow-bg pointer-events-none absolute inset-0" />
      <div className="vp-in-1 relative flex w-full flex-col items-center gap-[calc(7*var(--u))]">
        <div className="vp-pulse flex flex-col items-center gap-[calc(3*var(--u))]">
          <div style={{ width: "min(180px, calc(46 * var(--u)))" }}>
            <Logo className="!w-full" />
          </div>
          <Wordmark size="lg" />
        </div>
        <p className="vp-h1 font-display font-bold text-white">
          Você paga R$2.000
          <br />
          mas custa <span className="text-[#38bdf8]">R$3.136</span>
        </p>
        <p className="vp-body max-w-[84%] text-white/60">
          FGTS, 13º, férias e multa de 40% já estão na conta.
        </p>
      </div>
    </section>
  );
}