import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMe } from '@/hooks/useMe';
import { useExpenses } from '@/hooks/useExpenses';
import ApprovalCard from '@/components/approvals/ApprovalCard';
import { useToast } from '@/components/ui/use-toast';

export default function Approvals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: me, isLoading: loadingMe } = useMe();
  const { data: list = [], isLoading } = useExpenses();
  const [tab, setTab] = useState('pending');
  const [busy, setBusy] = useState('');

  const isAdmin = me?.role === 'admin';

  if (loadingMe) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  if (!isAdmin) {
    return (
      <div className="glass flex items-center gap-3 rounded-2xl p-6 text-sm text-muted-foreground">
        <Lock className="h-5 w-5 text-primary" />
        Apenas o RH (administradores) pode aprovar despesas.
      </div>
    );
  }

  const pendingList = list.filter((e) => e.status === 'pending');
  const doneList = list.filter((e) => e.status !== 'pending');
  const shown = tab === 'pending' ? pendingList : doneList;

  async function review(id, status, note) {
    setBusy(id + status);
    try {
      const fresh = await base44.entities.Expense.get(id);
      if (fresh.status !== 'pending') {
        await queryClient.invalidateQueries({ queryKey: ['expenses'] });
        toast({ variant: 'destructive', title: 'Esta despesa já foi revisada ou cancelada' });
        return;
      }
      await base44.entities.Expense.update(id, {
        status,
        review_note: note,
        reviewed_by: me?.full_name || me?.email || '',
        reviewed_at: new Date().toISOString(),
      });
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ title: status === 'approved' ? 'Despesa aprovada' : 'Despesa rejeitada' });
    } catch (e) {
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ variant: 'destructive', title: 'Não foi possível salvar a decisão', description: 'Atualize a lista e tente de novo.' });
    } finally {
      setBusy('');
    }
  }

  async function openReceipt(fileUri) {
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
        file_uri: fileUri,
        expires_in: 180,
      });
      window.open(signed_url, '_blank', 'noopener');
    } catch {
      toast({ variant: 'destructive', title: 'Recibo indisponível' });
    }
  }

  const tabs = [
    ['pending', 'Pendentes', pendingList.length],
    ['done', 'Histórico', doneList.length],
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Aprovações</h1>
          <p className="text-sm text-muted-foreground">Revise e decida sobre as despesas enviadas.</p>
        </div>
        <div className="glass flex rounded-xl p-1 text-xs">
          {tabs.map(([key, label, count]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-lg px-3 py-1.5 transition ${
                tab === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {!isLoading && shown.length === 0 && (
        <div className="glass rounded-2xl p-6 text-center text-sm text-muted-foreground">
          {tab === 'pending' ? 'Tudo em dia — nenhuma despesa aguardando aprovação.' : 'Nenhuma despesa revisada ainda.'}
        </div>
      )}

      <div className="grid gap-4">
        {shown.map((e) => (
          <ApprovalCard key={e.id} expense={e} busy={busy} onReview={review} onReceipt={openReceipt} />
        ))}
      </div>
    </div>
  );
}