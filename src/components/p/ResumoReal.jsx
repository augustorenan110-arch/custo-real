import { Link } from 'react-router-dom';
import { ArrowRight, Users, ScanFace, Trophy, Calculator, ScrollText } from 'lucide-react';
import { brl } from '@/lib/format';
import StoreButtons from '@/components/StoreButtons';

const ATALHOS = [
  { to: '/ponto', label: 'Ponto facial', icon: ScanFace },
  { to: '/ranking', label: 'Ranking Custo Real', icon: Trophy },
  { to: '/rescisao', label: 'Simular rescisão', icon: Calculator },
  { to: '/relatorio-contador', label: 'Relatório Contador', icon: ScrollText },
  { to: '/colaboradores', label: 'Meus funcionários', icon: Users },
];

export default function ResumoReal({ empresa, funcionarios, passivoTotal }) {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-semibold">Resumo do custo real da sua empresa</h1>
        <p className="text-sm text-muted-foreground">
          {empresa?.name} · {funcionarios.length} {funcionarios.length === 1 ? 'funcionário' : 'funcionários'}
        </p>
      </header>

      <div className="glass glow rounded-2xl border-primary/25 p-5">
        <p className="text-sm text-foreground/75">Passivo total oculto</p>
        <p className="font-display text-3xl font-semibold text-cost-tech">{brl(passivoTotal)}</p>
        <p className="text-xs text-muted-foreground">custo de demissão de todo o time, hoje</p>
        <Link to="/ranking" className="mt-3 inline-flex items-center gap-1 text-xs text-primary">
          Ver ranking completo <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {ATALHOS.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="glass flex items-center gap-3 rounded-2xl p-4 text-sm transition hover:bg-white/5"
          >
            <a.icon className="h-4 w-4 text-primary" strokeWidth={1.7} />
            {a.label}
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <StoreButtons />
    </div>
  );
}