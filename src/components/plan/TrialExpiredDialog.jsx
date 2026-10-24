import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PLANS } from '@/lib/plan';

export default function TrialExpiredDialog({ open }) {
  const [starter, premium] = PLANS;
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" hideClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" /> Seu teste acabou
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Os 7 dias de PREMIUM terminaram. Escolha um plano para continuar registrando ponto, calculando custo real
          e emitindo espelhos.
        </p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <div className="glass rounded-2xl p-4">
            <p className="text-sm font-semibold">STARTER</p>
            <p className="mt-1 font-display text-2xl font-bold">R$ 29,90</p>
            <p className="text-[11px] text-muted-foreground">por mês · ou R$ 297/ano</p>
            <p className="mt-2 text-xs text-foreground/75">10 funcionários · 1.000 batidas · PDF do espelho</p>
            <Button asChild className="mt-3 w-full" variant="outline">
              <Link to="/planos">Assinar STARTER</Link>
            </Button>
          </div>
          <div className="glass glow rounded-2xl border-primary/40 p-4">
            <p className="text-sm font-semibold">PREMIUM</p>
            <p className="mt-1 font-display text-2xl font-bold">R$ 59,90</p>
            <p className="text-[11px] text-muted-foreground">por mês · ou R$ 597/ano (R$ 497 vitalício)</p>
            <p className="mt-2 text-xs text-foreground/75">Ilimitado · rescisão · ranking de custo real · contador</p>
            <Button asChild className="mt-3 w-full">
              <Link to="/planos">Assinar {premium.name}</Link>
            </Button>
          </div>
        </div>
        <p className="text-center text-[11px] text-muted-foreground">
          Também disponível em <span className="text-foreground/80">{starter.monthly.priceId}</span> e{' '}
          <span className="text-foreground/80">{premium.monthly.priceId}</span>
        </p>
      </DialogContent>
    </Dialog>
  );
}