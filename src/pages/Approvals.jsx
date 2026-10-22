import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Check, X, FileImage, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMe } from '@/hooks/useMe';
import { useExpenses } from '@/hooks/useExpenses';
import { brl, dateBR } from '@/lib/format';
import { AiVerdict, StatusPill } from '@/components/ExpenseBits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export default function Approvals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const { data: list = [], isLoading } = useExpenses();
  const [tab, setTab] = useState('pending');
  const [notes, setNotes] = useState({});
  const [busy, setBusy] = useState('');

  const isAdmin = me?.role === 'admin';

  if (me && !isAdmin) {
    return (
      <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">
        Apenas o RH pode aprovar despesas.
      </div>
    );
  }

  const shown = list.filter((e) => (tab === 'pending' ? e.status === 'pending' : e.status !== 'pending'));

  async function review(id, status) {
    setBusy(id + status);
    try {
      await base44.entities.Expense.update(id, {
        status,
        review_note: notes[id] || '',
        reviewed_by: me?.email || '',
        reviewed_at: new Date().toISOString(),
      });
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ title: status === 'approved' ? 'Despesa aprovada' : 'Despesa rejeitada' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Não foi possível revisar', description: e.message });
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
    } catch (e) {
      toast({ variant: 'destructive', title: 'Recibo indisponível', description: e.message });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Aprovações</h1>
          <p className="text-sm text-muted-foreground">Revise e decida sobre as despesas enviadas.</p>
        </div>
        <div className="glass flex rounded-xl p-1 text-xs">
          {[
            ['pending', 'Pendentes'],
            ['done', 'Histórico'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-lg px-3 py-1.5 transition ${
                tab === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {!isLoading && shown.length === 0 && <p className="text-sm text-muted-foreground">Nada por aqui.</p>}

      <div className="grid gap-4">
        {shown.map((e) => (
          <div key={e.id} className="glass space-y-3 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">
                  {e.employee_name || e.employee_email || 'Colaborador'}
                </div>
                <div className="truncate font-semibold">{e.merchant || e.category}</div>
                <div className="text-xs text-muted-foreground">
                  {e.category} · {dateBR(e.expense_date)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-xl font-bold">{brl(e.amount)}</div>
                <StatusPill status={e.status} />
              </div>
            </div>

            {e.description && <p className="text-sm text-foreground/70">{e.description}</p>}
            <AiVerdict compliant={e.ai_compliant} notes={e.ai_notes} />

            {e.receipt_file_uri && (
              <button
                onClick={() => openReceipt(e.receipt_file_uri)}
                className="flex items-center gap-1 text-xs text-primary transition hover:underline"
              >
                <FileImage className="h-3.5 w-3.5" /> Ver recibo
              </button>
            )}

            {e.status === 'pending' ? (
              <>
                <Input
                  placeholder="Comentário (opcional)"
                  value={notes[e.id] || ''}
                  onChange={(ev) => setNotes({ ...notes, [e.id]: ev.target.value })}
                  className="field border-white/15"
                />
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => review(e.id, 'approved')}
                    disabled={busy !== ''}
                  >
                    {busy === e.id + 'approved' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Aprovar
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => review(e.id, 'rejected')}
                    disabled={busy !== ''}
                  >
                    {busy === e.id + 'rejected' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    Rejeitar
                  </Button>
                </div>
              </>
            ) : (
              e.review_note && (
                <p className="text-xs text-muted-foreground">Comentário: {e.review_note}</p>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}