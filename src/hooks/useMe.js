import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
  });
}