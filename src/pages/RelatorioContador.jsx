import { useQuery } from '@tanstack/react-query';
import { Loader2, Printer, ScrollText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMe } from '@/hooks/useMe';
import { custoDemissao } from '@/lib/campanha';
import { monthsBetween } from '@/lib/rescisao';
import { brl, dateBR } from '@/lib/format';

export default function RelatorioContador() {
  const { data: me } = useMe();
  const { data: funcionarios = [], isLoading } = useQuery({
    queryKey: ['meus-funcionarios', me?.id],
    queryFn: async () => {
      const res = await base44.entities.Employee.filter({ created_by_id: me.id }, { limit: 50 });
      return res?.items || res || [];
    },
    enabled: !!me?.id,
  });

  const hoje = new Date().toISOString().slice(0, 10);
  const linhas = funcionarios.map((f) => ({
    ...f,
    meses: monthsBetween(f.admission_date, hoje),
    custo: custoDemissao(f.salary, monthsBetween(f.admission_date, hoje)).total,
  }));
  const total = linhas.reduce((a, f) => a + f.custo, 0);

  if (isLoading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            <ScrollText className="h-5 w-5 text-primary" /> Relatório Contador
          </h1>
          <p className="text-sm text-muted-foreground">
            Emitido em {dateBR(hoje)} para {me?.full_name || me?.email || 'o titular'}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/12 px-3 py-2 text-xs text-foreground/80 transition hover:bg-white/5"
        >
          <Printer className="h-4 w-4" /> Imprimir / PDF
        </button>
      </header>

      <div className="glass rounded-2xl p-5">
        <p className="text-sm text-foreground/75">Passivo trabalhista total do time</p>
        <p className="font-display text-2xl font-semibold text-cost-tech">{brl(total)}</p>
        <p className="text-xs text-muted-foreground">{linhas.length} funcionários · sem justa causa, hoje</p>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-white/5 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Funcionário</th>
                <th className="px-4 py-3 text-left">Admissão</th>
                <th className="px-4 py-3 text-right">Salário</th>
                <th className="px-4 py-3 text-right">Custo de demissão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {linhas.map((f) => (
                <tr key={f.id}>
                  <td className="px-4 py-3">{f.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {dateBR(f.admission_date)} · {f.meses}m
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{brl(f.salary)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-cost-tech">{brl(f.custo)}</td>
                </tr>
              ))}
              {!linhas.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-muted-foreground">
                    Nenhum funcionário cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Valores calculados com saldo de salário, aviso prévio, 13º, férias + 1/3, FGTS e multa de 40% conforme a CLT.
      </p>
    </div>
  );
}