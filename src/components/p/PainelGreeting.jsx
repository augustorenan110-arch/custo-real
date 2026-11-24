import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ScanFace } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMe } from '@/hooks/useMe';
import { useEmployees, useCompany } from '@/hooks/useHr';
import { calcularTotaisEmpresa } from '@/lib/payroll';
import { buildTimesheet, fmtMinutes } from '@/lib/timesheet';
import { brl } from '@/lib/format';

const thisMonth = () => new Date().toISOString().slice(0, 7);

/** Card de saudação no topo do Painel: custo real do mês, funcionários ativos e horas trabalhadas. */
export default function PainelGreeting() {
  const { data: me } = useMe();
  const { data: company } = useCompany();
  const { data: employees = [] } = useEmployees();

  const month = thisMonth();
  const entriesQuery = useQuery({
    queryKey: ['timeEntries-month-all', month],
    queryFn: async () => {
      const res = await base44.entities.TimeEntry.filter(
        { day: { $gte: `${month}-01`, $lte: `${month}-31` } },
        { sort: 'punched_at', limit: 500 },
      );
      return res?.items || res || [];
    },
  });

  const ativos = useMemo(() => employees.filter((e) => e.active !== false), [employees]);
  const totais = useMemo(() => calcularTotaisEmpresa(ativos), [ativos]);
  const horas = useMemo(() => {
    const byEmp = {};
    for (const e of entriesQuery.data || []) {
      (byEmp[e.employee_id] ||= []).push(e);
    }
    const workday = Number(company?.workday_hours) || 8;
    let total = 0;
    for (const id of Object.keys(byEmp)) total += buildTimesheet(byEmp[id], month, workday).worked;
    return total;
  }, [entriesQuery.data, company?.workday_hours, month]);

  const nome = (me?.full_name || me?.email || '').split(' ')[0] || 'colaborador';
  const plural = ativos.length === 1 ? 'funcionário ativo' : 'funcionários ativos';

  return (
    <div className="glass glow rounded-3xl border-primary/25 p-5">
      <h1 className="text-2xl font-semibold leading-tight">Olá, {nome} 👋</h1>
      <p className="mt-2 break-words text-sm text-foreground/80">
        Custo Real total da sua equipe este mês:{' '}
        <span className="font-display text-lg font-bold text-primary">{brl(totais.custoReal)}</span>
      </p>
      <p className="mt-1 break-words text-xs text-muted-foreground">
        {ativos.length} {plural} • {fmtMinutes(horas)} trabalhadas no mês
      </p>
      <Link
        to="/ponto"
        className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
      >
        <ScanFace className="h-5 w-5" /> Bater Ponto Facial
      </Link>
    </div>
  );
}