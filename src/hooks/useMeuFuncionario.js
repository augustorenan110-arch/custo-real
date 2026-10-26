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
  const isEmpresa = me?.role === 'admin';
  // Só quem NÃO é empresa pode ser tratado como funcionário — o RH pode ter
  // uma ficha própria e continua vendo o painel completo.
  const funcionario = isEmpresa
    ? null
    : employees.find((e) => (e.email || '').toLowerCase() === email) || null;

  return {
    me,
    isEmpresa,
    funcionario,
    isLoading: loadingMe || isLoading,
  };
}