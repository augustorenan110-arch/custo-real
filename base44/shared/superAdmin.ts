// Identidade dos criadores / proprietários do Custo Real (SUPER_ADMIN).
// O acesso é permanente, controlado no backend, e independe de planos,
// assinaturas, testes ou situação financeira das empresas cadastradas.
//
// A lista de e-mails NÃO fica no código: vem da variável de ambiente
// SUPER_ADMIN_EMAILS (Segredos do app), separada por vírgula.
// Única fonte da verdade para o backend function checkSuperAdmin.

function loadAdminEmails(): string[] {
  const raw = (typeof process !== 'undefined' && process.env && process.env.SUPER_ADMIN_EMAILS) || '';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0 && e.includes('@'));
}

export const ADMIN_EMAILS: string[] = loadAdminEmails();

// Compatibilidade: o primeiro e-mail continua referenciado como CRIADOR_EMAIL.
export const CRIADOR_EMAIL = ADMIN_EMAILS[0] || '';

/** Verifica no servidor se o usuário logado é um SUPER_ADMIN (criador). */
export function isSuperAdmin(user: any | null | undefined): boolean {
  if (!ADMIN_EMAILS.length) return false;
  const email = !!user && String(user.email || '').toLowerCase();
  return !!email && ADMIN_EMAILS.includes(email);
}