import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2, FileImage, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { brl, dateBR } from '@/lib/format';
import { AiVerdict, StatusPill } from '@/components/ExpenseBits';
import { useToast } from '@/components/ui/use-toast';

export default function ExpenseCard({ expense }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState('');

  async function cancel() {
    setBusy('delete');
    try {
      await base44.entities.Expense.delete(expense.id);
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ title: 'Pedido cancelado' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Não foi possível cancelar', description: e.message });
    } finally {
      setBusy('');
    }
  }

  async function openReceipt() {
    setBusy('receipt');
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
        file_uri: expense.receipt_file_uri,
        expires_in: 180,
      });
      window.open(signed_url, '_blank', 'noopener');
    } catch (e) {
      toast({ variant: 'destructive', title: 'Recibo indisponível', description: e.message });
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="glass space-y-2.5 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-semibold">{expense.merchant || expense.category}</div>
          <div className="text-xs text-muted-foreground">
            {expense.category} · {dateBR(expense.expense_date)}
          </div>
        </div>
        <div className="text-right">
          <div className="font-display font-bold">{brl(expense.amount)}</div>
          <StatusPill status={expense.status} />
        </div>
      </div>

      {expense.description && (
        <p className="text-sm text-foreground/70">{expense.description}</p>
      )}
      <AiVerdict compliant={expense.ai_compliant} notes={expense.ai_notes} />
      {expense.review_note && (
        <p className="text-xs text-muted-foreground">RH: {expense.review_note}</p>
      )}

      <div className="flex items-center gap-4 pt-0.5">
        {expense.receipt_file_uri && (
          <button
            onClick={openReceipt}
            disabled={busy === 'receipt'}
            className="flex items-center gap-1 text-xs text-primary transition hover:underline"
          >
            {busy === 'receipt' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileImage className="h-3.5 w-3.5" />
            )}
            Ver recibo
          </button>
        )}
        {expense.status === 'pending' && (
          <button
            onClick={cancel}
            disabled={busy === 'delete'}
            className="flex items-center gap-1 text-xs text-muted-foreground transition hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" /> Cancelar pedido
          </button>
        )}
      </div>
    </div>
  );
}