import { useState } from 'react';
import { Clock } from 'lucide-react';
import { useMe } from '@/hooks/useMe';
import { useEmployees } from '@/hooks/useHr';
import PunchPanel from '@/components/hr/PunchPanel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Punch() {
  const { data: me } = useMe();
  const { data: employees = [], isLoading } = useEmployees();
  const [pickedId, setPickedId] = useState('');

  const isAdmin = me?.role === 'admin';
  const active = employees.filter((e) => e.active !== false);
  const mine = active.find((e) => (e.email || '').toLowerCase() === (me?.email || '').toLowerCase());
  const employee = isAdmin ? active.find((e) => e.id === pickedId) : mine;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Clock className="h-6 w-6 text-primary" /> Ponto facial
        </h1>
        <p className="text-sm text-muted-foreground">
          Tire uma selfie. A IA compara com a sua foto de referência e registra entrada ou saída.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      {isAdmin && (
        <Select value={pickedId} onValueChange={setPickedId}>
          <SelectTrigger className="field">
            <SelectValue placeholder="Escolha o colaborador" />
          </SelectTrigger>
          <SelectContent>
            {active.map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {!isLoading && !employee && !isAdmin && (
        <div className="glass rounded-2xl p-5 text-sm text-muted-foreground">
          Nenhuma ficha de colaborador está vinculada ao seu e-mail ({me?.email}). Peça ao RH para cadastrar você.
        </div>
      )}

      {employee && !employee.face_ref_uri && (
        <div className="glass rounded-2xl p-5 text-sm text-muted-foreground">
          {employee.full_name} ainda não tem rosto cadastrado. O RH precisa usar "Cadastrar rosto" na ficha.
        </div>
      )}

      {employee?.face_ref_uri && (
        <div className="glass rounded-2xl p-5">
          <PunchPanel key={employee.id} employee={employee} />
        </div>
      )}
    </div>
  );
}