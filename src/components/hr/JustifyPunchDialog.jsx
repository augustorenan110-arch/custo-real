import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, PenLine } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useMe } from '@/hooks/useMe';

const at = (day, time) => new Date(`${day}T${time}:00`).toISOString();

export default function JustifyPunchDialog({ open, onOpenChange, employee }) {
  const { data: me } = useMe();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [day, setDay] = useState(new Date().toISOString().slice(0, 10));
  const [entrada, setEntrada] = useState('08:00');
  const [saida, setSaida] = useState('17:00');
  const [motivo, setMotivo] = useState('');
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!motivo.trim()) {
      toast({ variant: 'destructive', title: 'Escreva o motivo do ajuste' });
      return;
    }
    setBusy(true);
    const note = `Editado pelo Gestor - ${motivo.trim()}`;
    const stamp = { note, edited_by: me?.email || 'RH', edited_at: new Date().toISOString() };
    try {
      const entries = await base44.entities.TimeEntry.filter(
        { employee_id: employee.id, day },
        { sort: 'punched_at', limit: 20 },
      );
      const list = Array.isArray(entries) ? entries : entries.items || [];

      if (list.length >= 2) {
        await base44.entities.TimeEntry.update(list[0].id, { kind: 'entrada', punched_at: at(day, entrada), ...stamp });
        const last = list[list.length - 1];
        await base44.entities.TimeEntry.update(last.id, { kind: 'saida', punched_at: at(day, saida), ...stamp });
      } else if (list.length === 1) {
        await base44.entities.TimeEntry.update(list[0].id, { kind: 'entrada', punched_at: at(day, entrada), ...stamp });
        await base44.entities.TimeEntry.create({
          employee_id: employee.id,
          employee_name: employee.full_name,
          kind: 'saida',
          punched_at: at(day, saida),
          day,
          ...stamp,
        });
      } else {
        await base44.entities.TimeEntry.bulkCreate([
          { employee_id: employee.id, employee_name: employee.full_name, kind: 'entrada', punched_at: at(day, entrada), day, ...stamp },
          { employee_id: employee.id, employee_name: employee.full_name, kind: 'saida', punched_at: at(day, saida), day, ...stamp },
        ]);
      }

      await base44.entities.AuditLog.create({
        action: 'Ajuste de ponto pelo gestor',
        result: 'sucesso',
        employee_id: employee.id,
        employee_name: employee.full_name,
        actor_email: me?.email || '',
        details: `${day} · ${entrada} às ${saida} · Motivo: ${motivo.trim()}`,
      });

      await queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      await queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
      toast({ title: 'Ponto justificado e registrado na auditoria' });
      setMotivo('');
      onOpenChange(false);
    } catch {
      toast({ variant: 'destructive', title: 'Não foi possível ajustar o ponto' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenLine className="h-4 w-4 text-primary" /> Justificar / Ajustar Ponto
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          {employee?.full_name} · todo ajuste fica gravado como "Editado pelo Gestor" com o motivo informado.
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="jd">Dia</Label>
            <Input id="jd" type="date" value={day} onChange={(e) => setDay(e.target.value)} className="field" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="je">Entrada</Label>
            <Input id="je" type="time" value={entrada} onChange={(e) => setEntrada(e.target.value)} className="field" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="js">Saída</Label>
            <Input id="js" type="time" value={saida} onChange={(e) => setSaida(e.target.value)} className="field" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="jm">Motivo (obrigatório)</Label>
          <Textarea
            id="jm"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ex.: esqueceu de bater a saída; falha de internet na unidade"
            className="field"
          />
        </div>
        <Button className="w-full" disabled={busy || !motivo.trim()} onClick={save}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Salvar ajuste
        </Button>
      </DialogContent>
    </Dialog>
  );
}