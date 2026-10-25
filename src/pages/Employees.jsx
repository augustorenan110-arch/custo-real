import { useState } from 'react';
import { Plus, Users, ScanFace, Lock } from 'lucide-react';
import { useMe } from '@/hooks/useMe';
import { useEmployees, useCompany } from '@/hooks/useHr';
import { brl } from '@/lib/format';
import { limiteAtingido, trialDaysLeft } from '@/lib/plan';
import { Button } from '@/components/ui/button';
import { Initials } from '@/components/Brand';
import EmployeeForm from '@/components/hr/EmployeeForm';
import EmployeeDetail from '@/components/hr/EmployeeDetail';
import TrialCountdown from '@/components/plan/TrialCountdown';
import PaywallModal from '@/components/PaywallModal';

export default function Employees() {
  const { data: me, isLoading: loadingMe } = useMe();
  const { data: employees = [], isLoading } = useEmployees();
  const { data: company } = useCompany();
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [paywall, setPaywall] = useState(false);

  if (loadingMe) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  if (me?.role !== 'admin') {
    return <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">Apenas o RH acessa as fichas.</div>;
  }

  const selected = employees.find((e) => e.id === selectedId) || null;
  const ativos = employees.filter((e) => e.active !== false);
  const bloqueado = !!company && limiteAtingido(company, ativos.length);

  return (
    <div className="space-y-4">
      <TrialCountdown company={company} usados={ativos.length} />

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Users className="h-6 w-6 text-primary" /> Colaboradores
          </h1>
          <p className="text-sm text-muted-foreground">Fichas, rosto, holerite, espelho e gastos.</p>
        </div>
        {!bloqueado && (
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Novo
          </Button>
        )}
      </div>

      {bloqueado && (
        <button
          type="button"
          onClick={() => setPaywall(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E293B] p-4 text-xs font-semibold text-[#94A3B8] transition hover:text-white"
        >
          <Lock className="h-4 w-4" /> Limite do plano grátis atingido - Desbloqueie por R$59,90
        </button>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {!isLoading && employees.length === 0 && (
        <div className="glass rounded-2xl p-6 text-center text-sm text-muted-foreground">
          Nenhum colaborador ainda. Cadastre o primeiro.
        </div>
      )}

      <div className="grid gap-3">
        {employees.map((e) => (
          <button key={e.id} onClick={() => setSelectedId(e.id)} className="glass flex items-center gap-3 rounded-2xl p-4 text-left transition hover:border-primary/40">
            <Initials name={e.full_name} className="h-10 w-10 text-xs" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{e.full_name}</div>
              <div className="truncate text-xs text-muted-foreground">
                {e.role_title || 'Colaborador'} · {e.unit || 'Sem unidade'}
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="font-medium">{brl(e.salary)}</div>
              <div className={`flex items-center justify-end gap-1 ${e.face_ref_uri ? 'text-success' : 'text-warning'}`}>
                <ScanFace className="h-3 w-3" /> {e.face_ref_uri ? 'Rosto ok' : 'Sem rosto'}
              </div>
            </div>
          </button>
        ))}
      </div>

      <EmployeeForm open={creating && !bloqueado} onOpenChange={setCreating} units={company?.units || []} />
      <EmployeeDetail employee={selected} onClose={() => setSelectedId(null)} />

      <PaywallModal
        open={paywall}
        onClose={() => setPaywall(false)}
        companyId={company?.id}
        email={me?.email}
        daysLeft={trialDaysLeft(company)}
      />
    </div>
  );
}