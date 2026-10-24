import { BadgeCheck, ArrowRight } from 'lucide-react';
import { brl } from '@/lib/format';

const EXEMPLOS = [
  { nome: 'João Silva', valor: 5838, texto: 'custo demissão hoje' },
  { nome: 'Maria Oliveira', valor: 4200, texto: 'custo demissão hoje' },
];

export default function DemoEmployees() {
  const rolarParaFormulario = () => {
    document.getElementById('cadastro-funcionario')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <section className="space-y-3">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Como vai ficar</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {EXEMPLOS.map((e) => (
          <div key={e.nome} className="glass relative rounded-2xl p-4 opacity-50">
            <span className="absolute right-3 top-3 rounded-full border border-warning/40 bg-warning/15 px-2 py-0.5 text-[9px] font-semibold text-warning">
              EXEMPLO
            </span>
            <p className="text-sm font-medium">{e.nome}</p>
            <p className="mt-1 font-display text-lg font-semibold text-cost-tech">{brl(e.valor)}</p>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <BadgeCheck className="h-3.5 w-3.5" /> {e.texto}
            </p>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={rolarParaFormulario}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 px-4 py-3 text-sm text-foreground/80 transition hover:bg-white/5"
      >
        Substituir por meus funcionários <ArrowRight className="h-4 w-4" />
      </button>
    </section>
  );
}