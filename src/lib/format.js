export const CATEGORIES = ['Refeição', 'Transporte', 'Hospedagem', 'Material', 'Combustível', 'Outros'];

export const statusLabel = {
  pending: 'Pendente',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
};

export const brl = (n) =>
  Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const dateBR = (d) => {
  if (!d) return '—';
  const iso = String(d).slice(0, 10);
  return new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR');
};

export const todayISO = () => new Date().toISOString().slice(0, 10);