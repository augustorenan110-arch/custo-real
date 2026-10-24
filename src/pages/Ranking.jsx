import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, TrendingUp, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMe } from '@/hooks/useMe';
import { custoDemissao } from '@/lib/campanha';
import { monthsBetween } from '@/lib/rescisao';
import { brl } from '@/lib/format';

export default function Ranking() {
  const { data: me } = useMe();
  const { data: funcionarios = [], isLoading } = useQuery({
    queryKey: ['meus-funcionarios', me?.id],
    queryFn: async () => {
      const res = await base44.entities.Employee.filter(
        { created_by_id: me.id },
        { sort: '-created_date', limit: 50 },
      );
      return res?.items || res || [];
    },
    enabled: !!me?.id,
  });

  const hoje = new Date().toISOString().slice(0, 10);
  const linhas = funcionarios
    .map((f) => ({
      ...f,
      meses: monthsBetween(f.admission_date, hoje),
      custo: custoDemissao(f.salary, monthsBetween(f.admission_date, hoje)).total,
    }))
    .sort((a, b) => b.custo - a.custo);

  const maior = linhas[0]?.custo || 1;

  if (isLoading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <TrendingUp className="h-5 w-5 text-primary" /> Ranking Custo Real
        </h1>
        <p className="text-sm text-muted-foreground">
          Quem custa mais para a empresa se precisar demitir hoje, sem justa causa.
        </p>
      </header>

      {!linhas.length ? (
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-sm text-muted-foreground">Nenhum funcionário cadastrado ainda.</p>
          <Link
            to="/p"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Cadastrar funcionário
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {linhas.map((f, i) => (
            <div key={f.id} className="glass rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-sm font-semibold text-primary">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{f.full_name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {brl(f.salary)} · {f.meses} {f.meses === 1 ? 'mês' : 'meses'} de casa
                  </p>
                </div>
                <span className="font-display text-base font-semibold text-cost-tech">{brl(f.custo)}</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(6, (f.custo / maior) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}