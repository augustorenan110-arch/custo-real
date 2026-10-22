import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Camera, Loader2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { CATEGORIES, todayISO } from '@/lib/format';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AiVerdict } from '@/components/ExpenseBits';

function toJpegBlob(file, max = 1600) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Não foi possível processar a imagem'))),
        'image/jpeg',
        0.85,
      );
    };
    img.onerror = () => reject(new Error('Imagem inválida'));
    img.src = URL.createObjectURL(file);
  });
}

const emptyForm = () => ({
  amount: '',
  date: todayISO(),
  merchant: '',
  category: 'Outros',
  description: '',
});

export default function NewExpenseForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [receiptUri, setReceiptUri] = useState(null);
  const [ai, setAi] = useState(null);
  const [busy, setBusy] = useState('');
  const [form, setForm] = useState(emptyForm);

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  async function onFile(file) {
    if (!file) return;
    setBusy('ai');
    setAi(null);
    setReceiptUri(null);
    try {
      const blob = await toJpegBlob(file);
      setPreview(URL.createObjectURL(blob));
      const upload = new File([blob], 'recibo.jpg', { type: 'image/jpeg' });
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: upload });
      setReceiptUri(file_uri);
      const res = await base44.functions.invoke('analyzeExpense', { file_uri });
      if (res.data?.error) throw new Error(res.data.error);
      const r = res.data;
      setAi(r);
      set({
        amount: r.amount != null ? String(r.amount) : form.amount,
        date: r.date || form.date,
        merchant: r.merchant || form.merchant,
        category: r.category || form.category,
        description: r.description || form.description,
      });
      toast({ title: 'Recibo lido pela IA' });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Não foi possível ler o recibo',
        description: e.message || 'Preencha os dados manualmente.',
      });
    } finally {
      setBusy('');
    }
  }

  async function submit(event) {
    event.preventDefault();
    const amount = Number(String(form.amount).replace(',', '.'));
    if (!amount || amount <= 0) {
      toast({ variant: 'destructive', title: 'Informe um valor válido' });
      return;
    }
    setBusy('save');
    try {
      let verdict = ai;
      if (!verdict) {
        try {
          const res = await base44.functions.invoke('analyzeExpense', {
            manual: {
              amount,
              date: form.date,
              category: form.category,
              merchant: form.merchant,
              description: form.description,
            },
          });
          verdict = res.data?.error ? null : res.data;
        } catch {
          verdict = null;
        }
      }
      const me = await base44.auth.me();
      await base44.entities.Expense.create({
        amount,
        expense_date: form.date,
        merchant: form.merchant,
        category: form.category,
        description: form.description,
        receipt_file_uri: receiptUri || '',
        status: 'pending',
        ai_compliant: verdict ? !!verdict.compliant : null,
        ai_notes: verdict?.notes || '',
        employee_name: me?.full_name || me?.email || '',
        employee_email: me?.email || '',
      });
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ title: 'Despesa enviada para aprovação' });
      setForm(emptyForm());
      setPreview(null);
      setReceiptUri(null);
      setAi(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (e) {
      toast({ variant: 'destructive', title: 'Não foi possível salvar', description: e.message });
    } finally {
      setBusy('');
    }
  }

  return (
    <form onSubmit={submit} className="glass space-y-4 rounded-2xl p-5">
      <div>
        <h2 className="text-lg font-semibold">Nova despesa</h2>
        <p className="text-xs text-muted-foreground">Fotografe o recibo e a IA preenche os campos.</p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={busy === 'ai'}
        className="flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-white/15 p-6 text-sm text-muted-foreground transition hover:border-primary/60 hover:text-foreground"
      >
        {preview ? (
          <img src={preview} alt="Recibo" className="max-h-48 rounded-lg object-contain" />
        ) : (
          <Camera className="h-8 w-8 text-primary" strokeWidth={1.6} />
        )}
        {busy === 'ai' ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> IA lendo o recibo…
          </span>
        ) : (
          <span>{preview ? 'Trocar foto' : 'Fotografe ou envie o recibo'}</span>
        )}
      </button>

      {ai && <AiVerdict compliant={ai.compliant} notes={ai.notes} />}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input
            id="amount"
            required
            inputMode="decimal"
            value={form.amount}
            onChange={(e) => set({ amount: e.target.value })}
            className="field border-white/15"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date">Data</Label>
          <Input
            id="date"
            type="date"
            required
            value={form.date}
            onChange={(e) => set({ date: e.target.value })}
            className="field border-white/15"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="merchant">Estabelecimento</Label>
        <Input
          id="merchant"
          value={form.merchant}
          onChange={(e) => set({ merchant: e.target.value })}
          className="field border-white/15"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category">Categoria</Label>
        <select
          id="category"
          value={form.category}
          onChange={(e) => set({ category: e.target.value })}
          className="field h-10 w-full rounded-md px-3 text-sm text-foreground outline-none focus:border-primary"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="bg-popover text-foreground">
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Descrição / justificativa</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => set({ description: e.target.value })}
          className="field border-white/15"
        />
      </div>

      <Button type="submit" className="glow w-full" disabled={busy !== ''}>
        {busy === 'save' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        Enviar para aprovação
      </Button>
    </form>
  );
}