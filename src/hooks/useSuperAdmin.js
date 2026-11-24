import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useMe } from '@/hooks/useMe';

/**
 * Acesso SUPER_ADMIN (criador). Verificação autoritativa no backend
 * (checkSuperAdmin) — a lista de e-mails vive em Segredos, nunca no frontend.
 * Enquanto o servidor responde, considera não-admin para não piscar o paywall.
 */
export function useSuperAdmin() {
  const { data: me } = useMe();
  const q = useQuery({
    queryKey: ['superAdmin', me?.email],
    enabled: !!me,
    queryFn: async () => {
      try {
        const r = await base44.functions.invoke('checkSuperAdmin');
        return r.data?.is_super_admin === true;
      } catch {
        return false;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
  const isSuperAdmin = q.isLoading ? false : Boolean(q.data);
  return { isSuperAdmin, isLoading: q.isLoading };
}