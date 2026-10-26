import { NavLink, Navigate, Outlet } from 'react-router-dom';
import { FileText, Home, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { BrandInline, Initials } from '@/components/Brand';
import { useMeuFuncionario } from '@/hooks/useMeuFuncionario';

// Barra inferior do funcionário: só Início e Holerite.
const ABAS = [
  { to: '/meu', label: 'Início', icon: Home },
  { to: '/meu-holerite', label: 'Holerite', icon: FileText },
];

export default function FuncionarioShell() {
  const { me, isEmpresa, funcionario, isLoading } = useMeuFuncionario();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-primary" />
      </div>
    );
  }

  // Empresa nunca entra no ambiente do funcionário; e quem não tem ficha de
  // colaborador (contas antigas de empresa) continua no painel completo.
  if (isEmpresa || !funcionario) return <Navigate to="/painel" replace />;

  const name = me?.full_name || me?.email || '';
  const sair = () => base44.auth.logout('/entrar');

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <BrandInline />
          <div className="flex items-center gap-1">
            <Initials name={name} className="h-8 w-8 text-[11px]" />
            <button
              onClick={sair}
              aria-label="Sair"
              className="rounded-lg p-2 text-muted-foreground transition hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-28 pt-6">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-t border-primary/20 bg-sidebar/95 backdrop-blur-xl">
        <div className="safe-bottom mx-auto flex max-w-2xl items-stretch justify-around px-2 pt-1.5">
          {ABAS.map((a) => (
            <NavLink
              key={a.to}
              to={a.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] transition ${
                  isActive ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground'
                }`
              }
            >
              <a.icon className="h-[22px] w-[22px]" strokeWidth={1.7} />
              {a.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}