import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, ScanFace } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import CameraCapture from '@/components/hr/CameraCapture';

export default function FaceEnroll({ employee }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  async function save(file) {
    setBusy(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.entities.Employee.update(employee.id, { face_ref_uri: file_uri });
      await base44.entities.AuditLog.create({
        action: 'rosto_cadastrado',
        result: 'sucesso',
        employee_id: employee.id,
        employee_name: employee.full_name,
        details: 'Foto de referência cadastrada/atualizada.',
        selfie_uri: file_uri,
      });
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({ title: 'Rosto cadastrado' });
      setOpen(false);
    } catch {
      toast({ variant: 'destructive', title: 'Não foi possível salvar a foto' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <ScanFace className="h-4 w-4" /> {employee.face_ref_uri ? 'Atualizar rosto' : 'Cadastrar rosto'}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rosto de {employee.full_name}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Rosto de frente, boa luz, sem óculos escuros ou boné. A foto fica guardada de forma privada.
          </p>
          {busy ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            open && <CameraCapture onCapture={save} label="Capturar foto de referência" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}