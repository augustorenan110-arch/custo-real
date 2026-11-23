// Identidade do criador / proprietário do Custo Real (SUPER_ADMIN).
// O acesso é permanente e independe de planos, assinaturas ou testes.
// O atalho isCriador() é só para UX imediata; a verificação autoritativa é o
// backend function checkSuperAdmin (ver useSuperAdmin).
export const CRIADOR_EMAIL = 'rhcustoreal@gmail.com';

export const isCriador = (me) =>
  !!me && String(me.email || '').toLowerCase() === CRIADOR_EMAIL;