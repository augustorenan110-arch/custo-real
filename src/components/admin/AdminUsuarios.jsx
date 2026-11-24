import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, KeyRound, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { dateBR } from '@/lib/format';

const tipoLabel = (t) =>
  ({ super_admin: 'Super Admin', empresa: 'Empresa', escritorio: 'Escritório' }[t] || '—');
const planoLabel = (p) =>
  ({ gratis_7dias: 'Grátis 7 dias', pago_59: 'PREMIUM', escritorio_parceiro: 'Escritório' }[p] || '—');

export default function AdminUsuarios() {
  const qc = useQueryClient();
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const r = await base44.entities.User.list();
      return Array.isArray(r) ? r : (r?.items || []);
    },
  });

  const resetSenha = async (email) => {
    try {
      await base44.auth.resetPasswordRequest(email);
      alert(`E-mail de redefinição enviado para ${email}.`);
    } catch (e) {
      alert('Erro: ' + (e?.message || ''));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold">Usuários</h2>
      <p className="mt-1 text-sm text-muted-foreground">{users.length} usuário(s) no total.</p>

      {isLoading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {users.map((u) => (
            <div key={u.id} className="glass rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <h3 className="truncate text-sm font-medium">{u.email || '—'}</h3>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Nome: <strong className="text-foreground">{u.full_name || '—'}</strong></span>
                    <span>Papel: <strong className="text-foreground">{u.role || '—'}</strong></span>
                    <span>Tipo: <strong className="text-foreground">{tipoLabel(u.tipo_conta)}</strong></span>
                    <span>Plano: <strong className="text-foreground">{planoLabel(u.plano)}</strong></span>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Button onClick={() => resetSenha(u.email)} variant="outline" size="sm" className="h-9">
                  <KeyRound className="h-4 w-4" /> Trocar senha
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}