import { Navigate } from 'react-router-dom';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { useMeuFuncionario } from '@/hooks/useMeuFuncionario';
import AdminPanel from '@/pages/AdminPanel';

export default function MeuRouter() {
  const { isSuperAdmin, isLoading: adminLoading } = useSuperAdmin();
  const { isEmpresa, funcionario, isLoading } = useMeuFuncionario();

  if (adminLoading || isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-primary" />
      </div>
    );
  }

  if (isSuperAdmin) return <AdminPanel />;
  if (funcionario && !isEmpresa) return <Navigate to="/meu/colaborador" replace />;
  return <Navigate to="/painel" replace />;
}