import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Clock, AlertTriangle, CheckCircle2, Receipt, ChevronRight, Plus, TrendingUp } from 'lucide-react';
import { useMe } from '@/hooks/useMe';
import { useExpenses } from '@/hooks/useExpenses';
import { brl, dateBR, statusLabel } from '@/lib/format';
import { Initials } from '@/components/Brand';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--muted-foreground))',
];
const ICON_BG = ['bg-primary/15', 'bg-success/15', 'bg-warning/15'];

function Stat({ icon: Icon, label, value, sub }) {
  return (
    <div className="glass flex gap-3 rounded-2xl p-4">
      <Icon className="h-5 w-5 shrink-0 text-foreground/70" strokeWidth={1.7} />
      <div>
        <p className="text-xs text-foreground/75">{label}</p>
        <p className="font-display text-xl font-semibold leading-tight">{value}</p>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: me } = useMe();
  const { data: list = [], isLoading } = useExpenses();
  const isAdmin = me?.role === 'admin';

  const s = useMemo(() => {
    const sum = (f) => list.filter(f).reduce((a, e) => a + Number(e.amount || 0), 0);
    const now = new Date().toISOString().slice(0, 7);
    const prevDate = new Date();
    prevDate.setMonth(prevDate.getMonth() - 1);
    const prev = prevDate.toISOString().slice(0, 7);
    const thisM = sum((e) => e.status === 'approved' && String(e.expense_date).startsWith(now));
    const prevM = sum((e) => e.status === 'approved' && String(e.expense_date).startsWith(prev));
    const byCat = {};
    list
      .filter((e) => e.status !== 'rejected')
      .forEach((e) => {
        const key = e.category || 'Outros';
        byCat[key] = (byCat[key] || 0) + Number(e.amount || 0);
      });
    const catTotal = Object.values(byCat).reduce((a, b) => a + b, 0);
    return {
      approved: sum((e) => e.status === 'approved'),
      trend: prevM ? Math.round(((thisM - prevM) / prevM) * 100) : null,
      pending: list.filter((e) => e.status === 'pending').length,
      approvedN: list.filter((e) => e.status === 'approved').length,
      flagged: list.filter((e) => e.ai_compliant === false && e.status === 'pending').length,
      cats: Object.entries(byCat).map(([name, value]) => ({
        name,
        value,
        pct: catTotal ? (value / catTotal) * 100 : 0,
      })),
    };
  }, [list]);

  const name = me?.full_name || me?.email || '';
  const firstName = name.split(' ')[0];

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Olá, {firstName || 'colaborador'}!</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? 'Resumo dos custos da sua empresa.' : 'Resumo das suas despesas.'}
          </p>
        </div>
        <Initials name={name} />
      </header>

      <div className="glass rounded-2xl p-5">
        <p className="text-sm text-foreground/75">
          {isAdmin ? 'Custo total aprovado' : 'Total reembolsado'}
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <span className="font-display text-3xl font-semibold">{brl(s.approved)}</span>
          {s.trend !== null && (
            <span className="flex items-center gap-1 rounded-lg bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
              <TrendingUp className="h-3 w-3" />
              {s.trend}%
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">em relação ao mês anterior</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat icon={Clock} label="Pendentes" value={s.pending} sub="aguardando" />
        <Stat icon={CheckCircle2} label="Aprovadas" value={s.approvedN} sub="no total" />
        <Stat icon={AlertTriangle} label="Alertas IA" value={s.flagged} sub="fora da política" />
        <Stat icon={Receipt} label="Despesas" value={list.length} sub="registradas" />
      </div>

      {s.cats.length > 0 && (
        <div className="glass flex flex-col items-center gap-4 rounded-2xl p-4 sm:flex-row">
          <div className="relative h-32 w-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={s.cats} dataKey="value" innerRadius={44} outerRadius={62} stroke="none">
                  {s.cats.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <div className="text-lg font-semibold">{list.length}</div>
                <div className="text-[9px] text-muted-foreground">despesas</div>
              </div>
            </div>
          </div>
          <ul className="w-full space-y-2.5 text-xs">
            {s.cats.slice(0, 4).map((c, i) => (
              <li key={c.name} className="flex gap-2.5">
                <span
                  className="mt-1 h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                <div>
                  <div className="text-foreground/80">{c.name}</div>
                  <div className="font-semibold">{brl(c.value)}</div>
                  <div className="text-muted-foreground">{c.pct.toFixed(1)}%</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold">Últimas despesas</h2>
          <Link
            to={isAdmin ? '/aprovacoes' : '/despesas'}
            className="flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
          >
            Ver todas <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="glass divide-y divide-white/10 overflow-hidden rounded-2xl">
          {isLoading && <div className="p-4 text-sm text-muted-foreground">Carregando…</div>}
          {!isLoading && list.length === 0 && (
            <Link to="/despesas" className="flex items-center gap-3 p-3.5 text-sm">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary">
                <Plus className="h-5 w-5" />
              </span>
              <span className="flex-1">Enviar a primeira despesa</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          )}
          {list.slice(0, 5).map((e, i) => (
            <Link
              key={e.id}
              to={isAdmin ? '/aprovacoes' : '/despesas'}
              className="flex items-center gap-3 p-3.5 transition hover:bg-white/5"
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${ICON_BG[i % 3]}`}
              >
                <Receipt className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm">
                  {e.merchant || e.category} · {brl(e.amount)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isAdmin && e.employee_name ? `${e.employee_name} · ` : ''}
                  {dateBR(e.expense_date)} · {statusLabel[e.status] || 'Pendente'}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}