// Identidade dos criadores / proprietários do Custo Real (SUPER_ADMIN).
// O acesso é permanente, controlado no backend, e independe de planos,
// assinaturas, testes ou situação financeira das empresas cadastradas.
export const ADMIN_EMAILS: string[] = [
  'rhcustoreal@gmail.com',
  'augusto.renan110@gmail.com',
];

// Compatibilidade: o primeiro e-mail continua referenciado como CRIADOR_EMAIL.
export const CRIADOR_EMAIL = ADMIN_EMAILS[0];

/** Verifica no servidor se o usuário logado é um SUPER_ADMIN (criador). */
export function isSuperAdmin(user: any | null | undefined): boolean {
  const email = !!user && String(user.email || '').toLowerCase();
  return !!email && ADMIN_EMAILS.includes(email);
}