// Identidade do criador / proprietário do Custo Real.
// O acesso do SUPER_ADMIN é permanente, controlado no backend, e independe de
// planos, assinaturas, testes ou situação financeira das empresas cadastradas.
export const CRIADOR_EMAIL = 'rhcustoreal@gmail.com';

/** Verifica no servidor se o usuário logado é o criador (SUPER_ADMIN). */
export function isSuperAdmin(user: any | null | undefined): boolean {
  return !!user && String(user.email || '').toLowerCase() === CRIADOR_EMAIL;
}