import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMe } from '@/hooks/useMe';
import EmpresaStep from '@/components/p/EmpresaStep';
import ResumoReal from '@/components/p/ResumoReal';
import StoreButtons from '@/components/StoreButtons';

export default function AppHome() {
  const { data: me, isLoading: loadingMe } = useMe();
  const queryClient = useQueryClient();

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

  // Sem empresa: cadastro único (sem onboarding de funcionário).
  if (!empresa) {
    return (
      <>
        <EmpresaStep nome={nome} onCreated={recarregar} />
        <StoreButtons />
      </>
    );
  }

  return <ResumoReal empresa={empresa} funcionarios={funcionarios} />;
}