import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Calculator, FileText, ScanFace, Trophy, Users } from 'lucide-react';
import { brl } from '@/lib/format';
import { calcularTotaisEmpresa, custoRealFuncionario } from '@/lib/payroll';
import StoreButtons from '@/components/StoreButtons';

const ATALHOS = [
  { to: '/ponto', label: 'Ponto facial', icon: ScanFace },
  { to: '/ranking', label: 'Ranking Custo Real', icon: Trophy },
  { to: '/rescisao', label: 'Simular rescisão', icon: Calculator },
  { to: '/relatorio-contador', label: 'Relatório Contador', icon: FileText },
  { to: '/colaboradores', label: 'Meus funcionários', icon: Users },
];

export default function ResumoReal({ empresa, funcionarios = [] }) {
  const linhas = useMemo(
    () =>
      funcionarios
        .map((f) => ({ ...custoRealFuncionario(f), id: f.id, nome: f.full_name }))
        .sort((a, b) => b.passivo - a.passivo),
    [funcionarios],
  );
  const totais = useMemo(() => calcularTotaisEmpresa(funcionarios), [funcionarios]);
  const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const qtd = funcionarios.length;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-semibold">Resumo do custo real da sua empresa</h1>
        <p className="text-sm text-muted-foreground">
          {empresa?.name} · {qtd} {qtd === 1 ? 'funcionário' : 'funcionários'}
        </p>
      </header>

      <div className="mb-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#334155] bg-[#1E293B] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Folha Mês</p>
            <p className="mt-1 text-lg font-black text-white">{brl(totais.folha)}</p>
            <p className="mt-0.5 text-[11px] text-[#64748b]">{qtd} func. · base</p>
          </div>
          <div className="rounded-2xl border border-[#22C55E]/40 bg-[#1E293B] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#22C55E]">Custo Real Mês</p>
            <p className="mt-1 text-lg font-black text-[#22C55E]">{brl(totais.custoReal)}</p>
            <p className="mt-0.5 text-[11px] text-[#86efac]">com impostos</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#ef4444]/50 bg-gradient-to-br from-[#450a0a] to-[#7f1d1d] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#fca5a5]">Passivo total oculto</p>
              <p className="mt-1 text-2xl font-black text-[#ef4444]">{brl(totais.passivo)}</p>
              <p className="mt-1 text-[11px] text-[#fca5a5]">custo de demissão de todo o time, hoje</p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ef4444]">
              <AlertTriangle size={16} color="white" />
            </div>
          </div>
          <Link to="/ranking" className="mt-3 flex items-center gap-1 text-xs text-[#fecaca] underline">
            Ver ranking completo <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {!!linhas.length && (
        <div className="mb-4 rounded-xl border border-[#334155] bg-[#1E293B] p-3">
          <p className="mb-2 text-xs font-bold text-white">Quem mais custa se demitir hoje?</p>
          <div className="space-y-2">
            {linhas.slice(0, 3).map((f, i) => (
              <div key={f.id} className="flex items-center justify-between text-sm">
                <span className="truncate text-[#cbd5e1]">
                  {i + 1}. {f.nome}
                </span>
                <span className="shrink-0 font-bold text-white">{brl(f.passivo)}</span>
              </div>
            ))}
          </div>
          <Link
            to="/ranking"
            className="mt-3 flex h-8 w-full items-center justify-center rounded-lg border border-[#334155] bg-[#08080A] text-xs text-[#94A3B8] transition hover:border-[#22C55E]"
          >
            Ver todos os {qtd} {qtd === 1 ? 'funcionário' : 'funcionários'}
          </Link>
        </div>
      )}

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

      <p className="text-center text-[11px] text-muted-foreground">
        · {qtd} {qtd === 1 ? 'funcionário' : 'funcionários'} · Atualizado hoje {hora}
      </p>

      <StoreButtons />
    </div>
  );
}