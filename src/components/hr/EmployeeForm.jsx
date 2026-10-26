import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const empty = { full_name: '', email: '', cpf: '', role_title: '', unit: '', salary: '', admission_date: '' };

export default function EmployeeForm({ open, onOpenChange, units = [] }) {
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (!form.full_name.trim() || !(Number(form.salary) > 0)) {
      toast({ variant: 'destructive', title: 'Informe nome e salário' });
      return;
    }
    setBusy(true);
    try {
      const email = form.email.trim().toLowerCase();
      await base44.entities.Employee.create({
        ...form,
        email,
        salary: Number(form.salary),
        admission_date: form.admission_date || undefined,
        active: true,
      });
      // Convite de acesso: o funcionário cria a senha pelo e-mail e depois entra
      // em /entrar/funcionario com CPF + senha.
      if (email) {
        await base44.users.inviteUser(email, 'user').catch(() => {});
      }
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: 'Colaborador cadastrado',
        description: email ? 'Convite de acesso enviado para o e-mail dele.' : undefined,
      });
      setForm(empty);
      onOpenChange(false);
    } catch {
      toast({ variant: 'destructive', title: 'Não foi possível cadastrar' });
    } finally {
      setBusy(false);
    }
  }

  const field = (k, label, props = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} value={form[k]} onChange={set(k)} className="field" {...props} />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo colaborador</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          {field('full_name', 'Nome completo')}
          {field('email', 'E-mail de login (para bater o ponto)', { type: 'email' })}
          <div className="grid grid-cols-2 gap-3">
            {field('cpf', 'CPF')}
            {field('salary', 'Salário bruto (R$)', { type: 'number', step: '0.01', inputMode: 'decimal' })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field('role_title', 'Cargo')}
            {field('admission_date', 'Admissão', { type: 'date' })}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="unit">Unidade</Label>
            <Input id="unit" list="units" value={form.unit} onChange={set('unit')} className="field" />
            <datalist id="units">
              {units.map((u) => (
                <option key={u.name} value={u.name} />
              ))}
            </datalist>
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Cadastrar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}