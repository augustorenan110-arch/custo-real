import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { isSuperAdmin } from '../../shared/superAdmin.ts';

/**
 * Verificação autoritativa, no backend, de acesso SUPER_ADMIN (criador).
 * Retorna { is_super_admin: boolean }. Independente de planos/assinaturas.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    return Response.json({ is_super_admin: isSuperAdmin(user), email: user?.email || null });
  } catch (error) {
    return Response.json({ is_super_admin: false, error: error?.message || 'não autenticado' });
  }
}