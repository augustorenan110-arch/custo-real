import { Building2, CheckCircle2, Wallet, CalendarClock } from 'lucide-react';
import { brl } from '@/lib/format';

const CARDS = [
  { key: 'total', label: 'Total empresas', icon: Building2, money: false },
  { key: 'ativas', label: 'Ativas', icon: CheckCircle2, money: false },
  { key: 'acumulada', label: 'Comissão acumulada', icon: Wallet, money: true },
  { key: 'mes', label: 'Comissão este mês', icon: CalendarClock, money: true },
];

export default function ContadorStats({ total, ativas, acumulada, mes }) {
  const valores = { total, ativas, acumulada, mes };
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {CARDS.map((c) => (
        <div key={c.key} className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <c.icon className="h-4 w-4 text-primary" strokeWidth={1.7} /> {c.label}
          </div>
          <p className="mt-1.5 font-display text-xl font-semibold">
            {c.money ? brl(valores[c.key]) : valores[c.key]}
          </p>
        </div>
      ))}
    </div>
  );
}