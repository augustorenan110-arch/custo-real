import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const items = (page) => (Array.isArray(page) ? page : page.items ?? []);

export function useCompany() {
  return useQuery({
    queryKey: ['company'],
    queryFn: async () => items(await base44.entities.Company.list({ limit: 1 }))[0] ?? null,
  });
}

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => items(await base44.entities.Employee.list({ sort: 'full_name', limit: 200 })),
  });
}

export function useTimeEntries(employeeId, month) {
  return useQuery({
    queryKey: ['timeEntries', employeeId, month],
    enabled: !!employeeId,
    queryFn: async () =>
      items(
        await base44.entities.TimeEntry.filter(
          { employee_id: employeeId, day: { $gte: `${month}-01`, $lte: `${month}-31` } },
          { sort: 'punched_at', limit: 300 },
        ),
      ),
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ['auditLogs'],
    queryFn: async () => items(await base44.entities.AuditLog.list({ sort: '-created_date', limit: 200 })),
  });
}