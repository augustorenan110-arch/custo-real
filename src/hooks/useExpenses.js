import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const page = await base44.entities.Expense.list({ sort: '-created_date', limit: 200 });
      return Array.isArray(page) ? page : page.items ?? [];
    },
  });
}

export function usePolicy() {
  return useQuery({
    queryKey: ['policy'],
    queryFn: async () => {
      const page = await base44.entities.CompanyPolicy.list({ limit: 1 });
      const items = Array.isArray(page) ? page : page.items ?? [];
      return items[0] ?? null;
    },
  });
}