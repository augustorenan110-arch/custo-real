import { useMe } from '@/hooks/useMe';
import { useEmployees } from '@/hooks/useHr';

/**
 * Quem é quem no app:
 * - empresa (RH): papel admin da plataforma — vê tudo.
 * - funcionário: qualquer outro usuário logado, vinculado a uma ficha de
 *   colaborador pelo e-mail (a RLS já devolve só a ficha dele).
 */
export function useMeuFuncionario() {
  const { data: me, isLoading: loadingMe } = useMe();
  const { data: employees = [], isLoading } = useEmployees();
  const email = (me?.email || '').toLowerCase();
  const funcionario = employees.find((e) => (e.email || '').toLowerCase() === email) || null;
  const isEmpresa = me?.role === 'admin';

  return {
    me,
    isEmpresa,
    funcionario,
    isLoading: loadingMe || isLoading,
  };
}