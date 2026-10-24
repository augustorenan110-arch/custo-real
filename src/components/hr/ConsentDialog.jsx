import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

async function currentIp() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    return (await res.json()).ip || '';
  } catch {
    return '';
  }
}

export default function ConsentDialog({ open, onAuthorized, onRefused, forceOpen = false }) {
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const now = new Date().toLocaleString('pt-BR');

  async function authorize() {
    if (!checked) return;
    setBusy(true);
    const data_consentimento = new Date().toISOString();
    const ip_consentimento = await currentIp();
    try {
      await base44.auth.updateMe({ consentimento_biometria: true, data_consentimento, ip_consentimento });
      onAuthorized?.(data_consentimento);
    } catch {
      toast({ variant: 'destructive', title: 'Não foi possível registrar a autorização' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={forceOpen ? () => {} : undefined}>
      <DialogContent className="max-w-md" hideClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Autorização de Biometria
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm leading-relaxed text-foreground/80">
          Para bater ponto com prova de vida precisamos da sua foto facial e localização apenas no momento da
          batida. CLT art.74 e LGPD. Pode revogar em Configurações.
        </p>

        <label className="glass flex items-start gap-3 rounded-xl p-3 text-sm">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[hsl(var(--primary))]"
          />
          <span>Autorizo coleta de foto facial e localização no momento da batida</span>
        </label>

        <p className="text-xs text-muted-foreground">
          Registro de consentimento: {now} · IP gravado junto ao aceite
        </p>
        <Link to="/privacidade" className="text-xs text-primary hover:underline">
          Ler a Política de Privacidade (LGPD)
        </Link>

        <div className="mt-1 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onRefused?.()}>
            Recusar
          </Button>
          <Button className="flex-1" disabled={!checked || busy} onClick={authorize}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Autorizar e Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}