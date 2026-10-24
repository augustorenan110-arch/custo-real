import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Trash2, Loader2, FileText, KeyRound } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useMe } from '@/hooks/useMe';
import ConsentDialog from '@/components/hr/ConsentDialog';

export default function PrivacyDataSection() {
  const { data: me } = useMe();
  const { toast } = useToast();
  const [consentOpen, setConsentOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const consentedAt = me?.data_consentimento ? new Date(me.data_consentimento).toLocaleString('pt-BR') : null;

  async function erase() {
    if (confirm.trim().toUpperCase() !== 'EXCLUIR') return;
    setBusy(true);
    try {
      await base44.functions.invoke('deleteMyData', { email: me?.email });
      setDeleteOpen(false);
      setDone(true);
      toast({ title: 'Dados excluídos — LGPD art. 18' });
    } catch {
      toast({ variant: 'destructive', title: 'Não foi possível concluir agora. Escreva para dpo@custoreal.com.br' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="glass space-y-4 rounded-2xl p-5">
      <h2 className="flex items-center gap-2 font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" /> Privacidade e Dados
      </h2>

      <div className="space-y-2 text-sm">
        <Link to="/privacidade" className="flex items-center gap-2 text-foreground/80 hover:text-primary">
          <FileText className="h-4 w-4 text-muted-foreground" /> Política de Privacidade (LGPD)
        </Link>
        <Link to="/termos" className="flex items-center gap-2 text-foreground/80 hover:text-primary">
          <FileText className="h-4 w-4 text-muted-foreground" /> Termos de Uso
        </Link>
        <Link to="/excluir-dados" className="flex items-center gap-2 text-foreground/80 hover:text-primary">
          <FileText className="h-4 w-4 text-muted-foreground" /> Como excluir meus dados (48h)
        </Link>
      </div>

      <div className="rounded-xl border border-white/10 p-3 text-sm">
        <p className="flex items-center gap-2 font-medium">
          <KeyRound className="h-4 w-4 text-primary" /> Meus consentimentos
        </p>
        <p className="mt-1 text-xs text-foreground/75">
          Biometria facial e localização na batida:{' '}
          {me?.consentimento_biometria ? (
            <span className="text-success">autorizado em {consentedAt}</span>
          ) : (
            <span className="text-warning">não autorizado</span>
          )}
        </p>
        {!me?.consentimento_biometria && (
          <Button variant="outline" size="sm" className="mt-2" onClick={() => setConsentOpen(true)}>
            Autorizar biometria
          </Button>
        )}
      </div>

      {done ? (
        <div className="rounded-xl border border-destructive/40 p-3 text-sm">
          <p className="font-medium text-destructive">Dados excluídos — LGPD art. 18</p>
          <p className="mt-1 text-xs text-foreground/75">
            Sua conta, biometria, pontos, fotos e localizações foram apagados. Encerre a sessão para sair do app.
          </p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => base44.auth.logout('/login')}>
            Sair agora
          </Button>
        </div>
      ) : (
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => {
            setConfirm('');
            setDeleteOpen(true);
          }}
        >
          <Trash2 className="h-4 w-4" /> Excluir minha conta e biometria facial
        </Button>
      )}

      <ConsentDialog
        open={consentOpen}
        onAuthorized={() => {
          setConsentOpen(false);
          toast({ title: 'Consentimento registrado' });
        }}
        onRefused={() => setConsentOpen(false)}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Excluir conta e biometria</DialogTitle>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-foreground/80">
            Vai apagar PERMANENTEMENTE conta, pontos, fotos, GPS. Irreversível. Digite EXCLUIR para confirmar.
          </p>
          <Input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="EXCLUIR"
            className="field"
            autoFocus
          />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={confirm.trim().toUpperCase() !== 'EXCLUIR' || busy}
              onClick={erase}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Confirmar Exclusão
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}