import { ScanFace, Trash2 } from 'lucide-react';
import { Initials } from '@/components/Brand';
import { brl } from '@/lib/format';

export default function EmployeeRow({ employee, onOpen, onRemove }) {
  return (
    <div className="glass flex items-center gap-2 rounded-2xl p-3 transition hover:border-primary/40 sm:gap-3 sm:p-4">
      <button
        type="button"
        onClick={() => onOpen(employee.id)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <Initials name={employee.full_name} className="h-10 w-10 text-xs" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{employee.full_name}</div>
          <div className="truncate text-xs text-muted-foreground">
            {employee.role_title || 'Colaborador'} · {employee.unit || 'Sem unidade'}
          </div>
        </div>
        <div className="text-right text-xs">
          <div className="font-medium">{brl(employee.salary)}</div>
          <div
            className={`flex items-center justify-end gap-1 ${
              employee.face_ref_uri ? 'text-success' : 'text-warning'
            }`}
          >
            <ScanFace className="h-3 w-3" /> {employee.face_ref_uri ? 'Rosto ok' : 'Sem rosto'}
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onRemove(employee)}
        title="Remover colaborador"
        aria-label={`Remover ${employee.full_name}`}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-destructive/30 text-destructive/70 transition hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}