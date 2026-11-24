// Identidade dos criadores / proprietários do Custo Real (SUPER_ADMIN).
// O acesso é permanente e independe de planos, assinaturas ou testes.
// O atalho isCriador() é só para UX imediata; a verificação autoritativa é o
// backend function checkSuperAdmin (ver useSuperAdmin).
export const ADMIN_EMAILS = [
  'rhcustoreal@gmail.com',
  'augusto.renan110@gmail.com',
];

export const CRIADOR_EMAIL = ADMIN_EMAILS[0];

export const isCriador = (me) =>
  !!me && ADMIN_EMAILS.includes(String(me.email || '').toLowerCase());