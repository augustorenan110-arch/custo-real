import { Clock } from 'lucide-react';
import AnimatedIcon from '@/components/ui/AnimatedIcon';
import { FREE_LIMIT, isFree, trialDaysLeft } from '@/lib/plan';

export default function TrialCountdown({ company, usados = 0 }) {
  if (!company || !isFree(company)) return null;
  const dias = trialDaysLeft(company);

  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#22C55E]/40 bg-[#052e16] p-3 text-xs font-semibold text-[#bbf7d0]">
      <AnimatedIcon icon={Clock} size={16} color="#facc15" />
      <span>Seu teste grátis: {dias} dia(s) restantes - {usados} de {FREE_LIMIT} funcionários usados</span>
    </div>
  );
}