import { useState } from 'react';
import { brl } from '@/lib/format';
import { comissaoDe, PLANO_CLIENTE } from '@/lib/contador';

const OPCOES = [20, 50, 80, 100];

export default function ComissaoSlider() {
  const [idx, setIdx] = useState(2);
  const clientes = OPCOES[idx];

  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Simulador de comissão</p>
      <h3 className="mt-1 font-display text-lg font-semibold">Quantos clientes você tem?</h3>

      <input
        type="range"
        min="0"
        max={OPCOES.length - 1}
        value={idx}
        onChange={(e) => setIdx(Number(e.target.value))}
        aria-label="Quantidade de clientes"
        className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[color:#2563eb]"
      />

      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        {OPCOES.map((n) => (
          <button key={n} type="button" onClick={() => setIdx(OPCOES.indexOf(n))} className="transition hover:text-foreground">
            {n}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-end justify-between border-t border-white/10 pt-4">
        <span className="text-xs text-muted-foreground">Comissão recorrente por mês</span>
        <span className="font-display text-2xl font-semibold text-save-tech">{brl(comissaoDe(clientes))}</span>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {clientes} clientes × {brl(PLANO_CLIENTE.comissao)} por cliente ativo.
      </p>
    </div>
  );
}