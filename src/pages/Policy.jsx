import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, ScrollText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMe } from '@/hooks/useMe';
import { usePolicy } from '@/hooks/useExpenses';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

export default function Policy() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const { data: policy, isLoading } = usePolicy();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const isAdmin = me?.role === 'admin';

  useEffect(() => {
    if (policy) setText(policy.content || '');
  }, [policy]);

  async function save() {
    setBusy(true);
    try {
      if (policy) {
        await base44.entities.CompanyPolicy.update(policy.id, {
          content: text,
          updated_by: me?.email || '',
        });
      } else {
        await base44.entities.CompanyPolicy.create({ content: text, updated_by: me?.email || '' });
      }
      await queryClient.invalidateQueries({ queryKey: ['policy'] });
      toast({ title: 'Política atualizada', description: 'A IA já usa as novas regras.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Não foi possível salvar', description: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Política de despesas</h1>
        <p className="text-sm text-muted-foreground">
          A IA confere cada despesa enviada com estas regras.
        </p>
      </header>

      <div className="glass space-y-4 rounded-2xl p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <ScrollText className="h-4 w-4 text-primary" /> Regras da empresa
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

        {!isLoading && isAdmin && (
          <>
            <Textarea
              rows={14}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Descreva os limites e regras de reembolso da empresa."
              className="field border-white/15 leading-relaxed"
            />
            <Button onClick={save} disabled={busy} className="glow w-full sm:w-auto">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar política
            </Button>
          </>
        )}

        {!isLoading && !isAdmin && (
          <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed text-foreground/80">
            {policy?.content || 'A empresa ainda não cadastrou a política de despesas.'}
          </pre>
        )}
      </div>
    </div>
  );
}