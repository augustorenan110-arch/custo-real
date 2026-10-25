import { FREE_LIMIT, isFree, trialDaysLeft } from '@/lib/plan';

export default function TrialCountdown({ company, usados = 0 }) {
  if (!company || !isFree(company)) return null;
  const dias = trialDaysLeft(company);

  return (
    <div className="rounded-xl border border-[#22C55E]/40 bg-[#052e16] p-3 text-xs font-semibold text-[#bbf7d0]">
      ⏳ Seu teste grátis: {dias} dia(s) restantes - {usados} de {FREE_LIMIT} funcionários usados
    </div>
  );
}