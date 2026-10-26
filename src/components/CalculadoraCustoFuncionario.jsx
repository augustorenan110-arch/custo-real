import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { brl } from '@/lib/format';
import { calcInss, calcularCustoEmpresa } from '@/lib/payroll';
import { getFiscal } from '@/lib/fiscal';

const pct = (v) => String(Number(v) || 0).replace('.', ',');

function Linha({ label, value, azul }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-foreground/70">{label}</span>
      <span className={`shrink-0 font-medium tabular-nums ${azul ? 'text-[#f87171]' : 'text-white'}`}>{value}</span>
    </div>
  );
}

/** Cálculo do funcionário: salário combinado → o que ele recebe x o que a empresa paga. */
export default function CalculadoraCustoFuncionario({ inicial = '2000' }) {
  const [valor, setValor] = useState(inicial);
  const base = Number(valor) || 0;
  const inss = calcInss(base);
  const liquido = Math.max(0, base - inss);
  const custo = calcularCustoEmpresa(base);
  const diferenca = custo.total - base;
  const percentual = base > 0 ? (diferenca / base) * 100 : 0;

  const fiscal = getFiscal();
  const aliquotas = fiscal.inss.map((f) => f.aliquota);
  const faixaInss = `${pct(Math.min(...aliquotas))}% a ${pct(Math.max(...aliquotas))}%`;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="salario-combinado">Salário Combinado com Funcionário (Base CLT)</Label>
        <Input
          id="salario-combinado"
          type="number"
          inputMode="decimal"
          step="50"
          min="0"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Ex: 2000"
          className="field h-12"
        />
        <p className="text-[11px] text-muted-foreground">Esse é o valor que está na carteira.</p>
      </div>

      <div className="rounded-2xl border border-primary/40 bg-primary/10 p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
          O que o funcionário recebe
        </p>
        <div className="mt-3 space-y-2">
          <Linha label="Salário base" value={brl(base)} />
          <Linha label={`(-) INSS funcionário (${faixaInss})`} value={`-${brl(inss)}`} azul />
          <div className="flex items-center justify-between gap-3 rounded-lg bg-primary/25 p-2.5 text-sm font-bold text-white">
            <span>(=) Líquido na conta</span>
            <span className="shrink-0 tabular-nums">{brl(liquido)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-warning/50 bg-warning/10 p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#fbbf24]">
          O que a empresa paga a mais
        </p>
        <div className="mt-3 space-y-2">
          <Linha label="Salário base" value={brl(custo.salario)} />
          <Linha label={`(+) FGTS ${pct(fiscal.fgts)}%`} value={brl(custo.fgts)} />
          <Linha label={`(+) INSS Patronal + Terceiros + RAT ${pct(fiscal.patronal)}%`} value={brl(custo.patronal)} />
          <Linha label="(+) Provisão 13º salário" value={brl(custo.prov13)} />
          <Linha label="(+) Provisão férias" value={brl(custo.provFerias)} />
          <Linha label="(+) Provisão 1/3 férias" value={brl(custo.provTerco)} />
          <Linha label={`(+) FGTS sobre provisões (${pct(fiscal.fgts)}%)`} value={brl(custo.fgtsProvisoes)} />
        </div>
      </div>

      <div className="rounded-2xl border border-primary/50 bg-gradient-to-br from-primary/30 to-[#001b3d] p-5 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7cc0ff]">Total custo real mensal</p>
        <p className="font-display mt-1 text-3xl font-extrabold text-white sm:text-4xl">{brl(custo.total)}</p>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-foreground/75">
          O funcionário recebe {brl(base)}, mas custa {brl(custo.total)} para sua empresa. Diferença de{' '}
          {brl(diferenca)} ({percentual >= 0 ? '+' : ''}
          {percentual.toFixed(1).replace('.', ',')}% a mais).
        </p>
      </div>

      <p className="text-center text-[10px] text-muted-foreground">
        INSS {String(fiscal.vigencia).slice(0, 4) || new Date().getFullYear()} · {fiscal.fonte}
      </p>
    </div>
  );
}