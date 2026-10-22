import { useState } from 'react';
import { Check, X, FileImage, Loader2, Mail } from 'lucide-react';
import { brl, dateBR } from '@/lib/format';
import { AiVerdict, StatusPill } from '@/components/ExpenseBits';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function ApprovalCard({ expense: e, busy, onReview, onReceipt }) {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const pending = e.status === 'pending';
  const working = busy.startsWith(e.id);

  function decide(status) {
    if (status === 'rejected' && !note.trim()) {
      setError('Explique o motivo da rejeição para o colaborador.');
      return;
    }
    setError('');
    onReview(e.id, status, note.trim());
  }

  return (
    <div className="glass space-y-3 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="truncate">{e.employee_name || e.employee_email || 'Colaborador'}</span>
          </div>
          <div className="mt-0.5 truncate font-semibold">{e.merchant || e.category}</div>
          <div className="text-xs text-muted-foreground">
            {e.category} · {dateBR(e.expense_date)}
          </div>
        </div>
        <div className="space-y-1 text-right">
          <div className="font-display text-xl font-bold">{brl(e.amount)}</div>
          <StatusPill status={e.status} />
        </div>
      </div>

      {e.description && <p className="text-sm text-foreground/70">{e.description}</p>}
      <AiVerdict compliant={e.ai_compliant} notes={e.ai_notes} />

      {e.receipt_file_uri ? (
        <button
          onClick={() => onReceipt(e.receipt_file_uri)}
          className="flex items-center gap-1 text-xs text-primary transition hover:underline"
        >
          <FileImage className="h-3.5 w-3.5" /> Ver recibo
        </button>
      ) : (
        <p className="text-xs text-muted-foreground">Sem recibo anexado.</p>
      )}

      {pending ? (
        <>
          <Textarea
            rows={2}
            placeholder="Comentário (obrigatório para rejeitar)"
            value={note}
            onChange={(ev) => {
              setNote(ev.target.value);
              setError('');
            }}
            className="field border-white/15"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => decide('approved')} disabled={busy !== ''}>
              {busy === e.id + 'approved' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Aprovar
            </Button>
            <Button variant="destructive" className="flex-1" onClick={() => decide('rejected')} disabled={busy !== ''}>
              {busy === e.id + 'rejected' ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              Rejeitar
            </Button>
          </div>
          {working && <span className="sr-only">Salvando decisão</span>}
        </>
      ) : (
        <div className="space-y-0.5 border-t border-white/10 pt-3 text-xs text-muted-foreground">
          {e.review_note && <p>Comentário: {e.review_note}</p>}
          {e.reviewed_by && (
            <p>
              Por {e.reviewed_by}
              {e.reviewed_at ? ` · ${dateBR(e.reviewed_at)}` : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
}