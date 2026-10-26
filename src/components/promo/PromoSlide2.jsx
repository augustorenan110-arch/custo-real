import React from "react";

export default function PromoSlide2() {
  return (
    <section className="vp-slide">
      <div className="vp-in-2 relative flex w-full flex-col items-center gap-[calc(6*var(--u))]">
        <div className="w-[86%] rounded-[calc(6*var(--u))] border border-white/10 bg-[#111723] p-[calc(5*var(--u))] text-left shadow-[0_18px_50px_-20px_rgba(0,0,0,0.9)]">
          <div className="vp-small mb-[calc(4*var(--u))] flex items-center justify-between text-white/45">
            <span>Painel do dono</span>
            <span className="font-semibold text-[#4d9bff]">Custo Real</span>
          </div>
          <div className="flex items-center gap-[calc(3*var(--u))] rounded-[calc(4*var(--u))] bg-[#1E293B] p-[calc(3.5*var(--u))]">
            <span className="grid h-[calc(11*var(--u))] w-[calc(11*var(--u))] shrink-0 place-items-center rounded-[calc(3*var(--u))] bg-[rgba(0,123,255,0.2)] font-display text-[calc(4*var(--u))] font-bold text-[#4d9bff]">
              MS
            </span>
            <div className="flex-1">
              <p className="font-display text-[calc(4.4*var(--u))] font-semibold text-white">
                Matheus Santos
              </p>
              <p className="vp-small text-white/45">Vendedor · desde 2023</p>
            </div>
            <p className="font-display text-[calc(4.4*var(--u))] font-bold text-[#ef4444]">R$3.640</p>
          </div>
          <div className="vp-small mt-[calc(3*var(--u))] grid grid-cols-3 gap-[calc(2*var(--u))] text-center text-white/55">
            <div className="rounded-[calc(2.6*var(--u))] bg-white/5 py-[calc(2*var(--u))]">
              Salário
              <br />
              <span className="font-semibold text-white">R$2.000</span>
            </div>
            <div className="rounded-[calc(2.6*var(--u))] bg-white/5 py-[calc(2*var(--u))]">
              Custo real
              <br />
              <span className="font-semibold text-white">R$3.136</span>
            </div>
            <div className="rounded-[calc(2.6*var(--u))] bg-[rgba(239,68,68,0.12)] py-[calc(2*var(--u))]">
              Passivo
              <br />
              <span className="font-semibold text-[#ef4444]">R$3.640</span>
            </div>
          </div>
        </div>
        <p className="vp-blink vp-h2 font-display font-extrabold text-[#ef4444]">
          PASSIVO OCULTO: R$5.840 se demitir hoje
        </p>
      </div>
    </section>
  );
}