import { useQuery } from '@tanstack/react-query';
import { Building2, Users, Clock, DollarSign } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { brl, localISO } from '@/lib/format';

export default function AdminOverview() {
  const { data: companies = 0 } = useQuery({
    queryKey: ['admin', 'company-count'],
    queryFn: () => base44.entities.Company.count(),
  });
  const { data: employees = 0 } = useQuery({
    queryKey: ['admin', 'employee-count'],
    queryFn: () => base44.entities.Employee.count(),
  });
  const { data: punches = 0 } = useQuery({
    queryKey: ['admin', 'punches-today'],
    queryFn: () => base44.entities.TimeEntry.count({ day: localISO() }),
  });
  const { data: mrr = 0 } = useQuery({
    queryKey: ['admin', 'mrr'],
    queryFn: async () => {
      const r = await base44.entities.Subscription.aggregate({
        query: { status: 'active' },
        sum: ['amount'],
      });
      return r?.rows?.[0]?.sum_amount || 0;
    },
  });

  const stats = [
    { label: 'Empresas', value: companies, icon: Building2, color: 'text-primary' },
    { label: 'Funcionários', value: employees, icon: Users, color: 'text-success' },
    { label: 'Pontos hoje', value: punches, icon: Clock, color: 'text-warning' },
    { label: 'MRR', value: brl(mrr), icon: DollarSign, color: 'text-primary' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold">Visão Geral</h2>
      <p className="mt-1 text-sm text-muted-foreground">Resumo do app Custo Real em tempo real.</p>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <span className="text-xs">{s.label}</span>
            </div>
            <p className="mt-3 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}