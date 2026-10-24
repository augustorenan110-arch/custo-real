import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { trialDaysLeft } from '@/lib/plan';

export default function TrialBanner({ company }) {
  const days = trialDaysLeft(company);
  if (!company || company.plano_atual !== 'trial_premium' || days <= 0) return null;

  return (
    <Link
      to="/planos"
      className="glass flex items-center gap-3 rounded-2xl border-primary/30 p-4 transition hover:border-primary/60"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
        <Sparkles className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {days === 1 ? 'Falta 1 dia do seu teste PREMIUM' : `Faltam ${days} dias do seu teste PREMIUM`}
        </p>
        <p className="text-xs text-muted-foreground">Garanta o PREMIUM e mantenha rescisão e custo real liberados.</p>
      </div>
      <span className="text-xs font-semibold text-primary">Ver planos</span>
    </Link>
  );
}