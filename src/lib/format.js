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

export const onlyDigits = (v) => String(v || '').replace(/\D/g, '');

export const cnpjBR = (v) => {
  const d = onlyDigits(v);
  return d.length === 14 ? d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5') : v || '—';
};

export const cpfBR = (v) => {
  const d = onlyDigits(v);
  return d.length === 11 ? d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4') : v || '—';
};

const pad = (n) => String(n).padStart(2, '0');
export const localISO = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;