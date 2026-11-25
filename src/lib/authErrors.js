// Detecta se o erro de base44.auth.register é porque o e-mail já existe no sistema.
// Evita duplicidade: mostra "já cadastrado" em vez da mensagem genérica.
export function emailJaCadastrado(err) {
  const msg = String(
    err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.data?.message ||
      err?.message ||
      err?.response?.data ||
      err ||
      ''
  ).toLowerCase();
  return (
    msg.includes('already') ||
    msg.includes('já cadastr') ||
    msg.includes('ja cadastr') ||
    msg.includes('existe') ||
    msg.includes('exists') ||
    msg.includes('duplicate') ||
    msg.includes('em uso') ||
    msg.includes('registered') ||
    msg.includes('taken') ||
    msg.includes('unique')
  );
}