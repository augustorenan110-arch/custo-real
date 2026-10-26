import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';

export default function RemoveEmployeeDialog({ employee, open, onOpenChange, onRemoved }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [removendo, setRemovendo] = useState(false);

  const remover = async () => {
    if (!employee || removendo) return;
    setRemovendo(true);
    try {
      await base44.entities.TimeEntry.deleteMany({ employee_id: employee.id });
      await base44.entities.Falta.deleteMany({ employee_id: employee.id });
      await base44.entities.Employee.delete(employee.id);
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: 'Colaborador removido',
        description: `${employee.full_name} saiu da sua equipe.`,
      });
      onRemoved?.(employee.id);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Não foi possível remover',
        description: error?.message || 'Tente novamente em instantes.',
      });
    } finally {
      setRemovendo(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => !removendo && onOpenChange(v)}>
      <AlertDialogContent className="glass border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" /> Remover colaborador?
          </AlertDialogTitle>
          <AlertDialogDescription className="leading-relaxed">
            A ficha de {employee?.full_name}, o rosto cadastrado e o histórico de ponto e faltas serão apagados
            definitivamente. Os lançamentos de despesas seguem no histórico. Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={removendo}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={removendo}
            onClick={(event) => {
              event.preventDefault();
              remover();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {removendo ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Removendo…
              </>
            ) : (
              'Remover'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}