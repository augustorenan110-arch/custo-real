import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMe } from '@/hooks/useMe';
import EmpresaStep from '@/components/p/EmpresaStep';
import FuncionarioStep from '@/components/p/FuncionarioStep';
import PassivoModal from '@/components/p/PassivoModal';
import ResumoReal from '@/components/p/ResumoReal';
import StoreButtons from '@/components/StoreButtons';
import { custoDemissao } from '@/lib/campanha';
import { monthsBetween } from '@/lib/rescisao';

const hojeISO = () => new Date().toISOString().slice(0, 10);

export default function AppHome() {
  const { data: me, isLoading: loadingMe } = useMe();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [passivo, setPassivo] = useState(null);

  const empresasQuery = useQuery({
    queryKey: ['minhas-empresas', me?.id],
    queryFn: async () => {
      const res = await base44.entities.Company.filter(
        { created_by_id: me.id },
        { sort: '-created_date', limit: 20 },
      );
      return res?.items || res || [];
    },
    enabled: !!me?.id,
  });

  const funcionariosQuery = useQuery({
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

  const empresas = empresasQuery.data || [];
  const funcionarios = funcionariosQuery.data || [];
  const empresa = empresas[0];

  const passivoDe = (f) => custoDemissao(f?.salary, monthsBetween(f?.admission_date, hojeISO()));

  const totalPassivo = useMemo(
    () => funcionarios.reduce((acc, f) => acc + passivoDe(f).total, 0),
    [funcionarios],
  );

  const recarregar = () => {
    queryClient.invalidateQueries({ queryKey: ['minhas-empresas'] });
    queryClient.invalidateQueries({ queryKey: ['meus-funcionarios'] });
  };

  const nome = (me?.full_name || me?.email || '').split(' ')[0];

  if (loadingMe || empresasQuery.isLoading || funcionariosQuery.isLoading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!empresa) {
    return (
      <>
        <EmpresaStep nome={nome} onCreated={recarregar} />
        <StoreButtons />
      </>
    );
  }

  if (!funcionarios.length) {
    return (
      <>
        <FuncionarioStep
          empresaNome={empresa.name}
          onCreated={(f) => {
            recarregar();
            setPassivo({ funcionario: f, dados: passivoDe(f) });
          }}
        />
        <StoreButtons />
        <PassivoModal
          open={!!passivo}
          onOpenChange={(v) => !v && setPassivo(null)}
          funcionario={passivo?.funcionario}
          passivo={passivo?.dados}
          onVerRanking={() => {
            setPassivo(null);
            navigate('/ranking');
          }}
        />
      </>
    );
  }

  return <ResumoReal empresa={empresa} funcionarios={funcionarios} passivoTotal={totalPassivo} />;
}