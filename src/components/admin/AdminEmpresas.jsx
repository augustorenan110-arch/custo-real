import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Building2, Trash2, Power, PowerOff, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { brl, dateBR, cnpjBR } from '@/lib/format';

const planoLabel = (p) =>
  ({ starter: 'STARTER', premium: 'PREMIUM', trial_premium: 'PREMIUM (Trial)', gratis_7dias: 'Grátis 7 dias' }[p] || '—');
const statusLabel = (s) =>
  ({ ativo: 'Ativo', trialing: 'Trial', expirado: 'Expirado', cancelado: 'Cancelado' }[s] || '—');
const statusColor = (s) =>
  ({ ativo: 'text-success', trialing: 'text-warning', expirado: 'text-destructive', cancelado: 'text-destructive' }[s] || 'text-muted-foreground');

export default function AdminEmpresas() {
  const qc = useQueryClient();
  const [busca, setBusca] = useState('');
  const [acting, setActing] = useState(null);

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['admin', 'companies'],
    queryFn: async () => {
      const r = await base44.entities.Company.filter({}, { limit: 500, sort: '-created_date' });
      return r.items;
    },
  });

  const filtradas = companies.filter((c) => {
    const q = busca.toLowerCase();
    return !q || (c.name || '').toLowerCase().includes(q) || (c.cnpj || '').includes(busca);
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ['admin', 'companies'] });

  const toggle = async (c) => {
    setActing(c.id);
    const novo = c.status_assinatura === 'cancelado' ? 'ativo' : 'cancelado';
    try {
      await base44.entities.Company.update(c.id, { status_assinatura: novo });
      refresh();
    } catch (e) {
      alert('Erro: ' + (e?.message || ''));
    } finally {
      setActing(null);
    }
  };

  const excluir = async (c) => {
    if (!confirm(`Excluir a empresa "${c.name}"? Esta ação não pode ser desfeita.`)) return;
    setActing(c.id);
    try {
      await base44.entities.Company.delete(c.id);
      refresh();
    } catch (e) {
      alert('Erro: ' + (e?.message || ''));
    } finally {
      setActing(null);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold">Empresas</h2>
      <p className="mt-1 text-sm text-muted-foreground">{companies.length} empresa(s) cadastrada(s).</p>

      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou CNPJ..."
          className="field h-11 pl-10"
        />
      </div>

      {isLoading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtradas.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">Nenhuma empresa encontrada.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {filtradas.map((c) => (
            <div key={c.id} className="glass rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 shrink-0 text-primary" />
                    <h3 className="truncate font-semibold">{c.name || 'Sem nome'}</h3>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">CNPJ: {cnpjBR(c.cnpj) || '—'}</p>
                </div>
                <span className={`shrink-0 text-xs font-medium ${statusColor(c.status_assinatura)}`}>
                  {statusLabel(c.status_assinatura)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>Plano: <strong className="text-foreground">{planoLabel(c.plano_atual)}</strong></span>
                <span>Funcionários: <strong className="text-foreground">{c.employee_count || 0}</strong></span>
                {c.trial_ends_at && <span>Trial: {dateBR(c.trial_ends_at)}</span>}
              </div>

              <div className="mt-3 flex gap-2">
                <Button
                  onClick={() => toggle(c)}
                  disabled={acting === c.id}
                  variant="outline"
                  size="sm"
                  className="h-9"
                >
                  {acting === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : c.status_assinatura === 'cancelado' ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                  {c.status_assinatura === 'cancelado' ? 'Ativar' : 'Desativar'}
                </Button>
                <Button
                  onClick={() => excluir(c)}
                  disabled={acting === c.id}
                  variant="outline"
                  size="sm"
                  className="h-9 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" /> Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}