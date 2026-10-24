import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { brl } from '@/lib/format';

export default function PassivoModal({ open, onOpenChange, funcionario, passivo, onVerRanking }) {
  if (!passivo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            🚨 PASSIVO DETECTADO: {brl(passivo.total)}
          </DialogTitle>
          <DialogDescription>
            {funcionario?.full_name} · custo de demissão hoje, sem justa causa.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-x-6 gap-y-1.5 rounded-2xl border border-white/10 bg-black/25 p-3 sm:grid-cols-2">
          {passivo.rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 text-xs">
              <span className="text-foreground/70">{label}</span>
              <span className="font-medium tabular-nums">{brl(value)}</span>
            </div>
          ))}
        </div>

        <p className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <span>FGTS acumulado (já depositado)</span>
          <span className="tabular-nums">{brl(passivo.fgtsAcumulado)}</span>
        </p>

        <Button type="button" onClick={onVerRanking} className="glow h-12 w-full font-semibold">
          Ver ranking completo e liberar app
        </Button>
      </DialogContent>
    </Dialog>
  );
}