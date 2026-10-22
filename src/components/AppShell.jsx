import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Receipt, CheckSquare, ScrollText, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMe } from '@/hooks/useMe';
import { BrandInline, BrandFooter, Initials } from '@/components/Brand';

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
    isActive
      ? 'bg-primary/15 text-primary font-medium'
      : 'text-foreground/70 hover:bg-white/5 hover:text-foreground'
  }`;

export default function AppShell() {
  const { data: me } = useMe();
  const isAdmin = me?.role === 'admin';
  const name = me?.full_name || me?.email || '';

  const nav = [
    { to: '/painel', label: 'Início', icon: LayoutDashboard },
    { to: '/despesas', label: 'Despesas', icon: Receipt },
    ...(isAdmin ? [{ to: '/aprovacoes', label: 'Aprovações', icon: CheckSquare }] : []),
    { to: '/politica', label: 'Política', icon: ScrollText },
  ];

  const signOut = () => base44.auth.logout('/');

  return (
    <div className="min-h-screen lg:flex">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-sidebar/80 p-5 backdrop-blur-xl lg:flex">
        <BrandInline />
        <nav className="mt-8 space-y-1">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} className={linkClass}>
              <n.icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto space-y-4 pt-8">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <Initials name={name} className="h-9 w-9 text-xs" />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{name}</div>
              <div className="text-[11px] text-muted-foreground">
                {isAdmin ? 'RH · Administrador' : 'Colaborador'}
              </div>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.7} /> Sair
          </button>
          <BrandFooter />
        </div>
      </aside>

      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-background/75 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <BrandInline />
            <div className="flex items-center gap-1">
              <Initials name={name} className="h-8 w-8 text-[11px]" />
              <button
                onClick={signOut}
                aria-label="Sair"
                className="rounded-lg p-2 text-muted-foreground transition hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 pb-28 pt-5 sm:px-6 lg:pb-12 lg:pt-10">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-background/95 backdrop-blur-xl lg:hidden">
        <div className="safe-bottom mx-auto flex max-w-2xl items-stretch justify-around px-2 pt-1.5">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] transition ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`
              }
            >
              <n.icon className="h-[22px] w-[22px]" strokeWidth={1.7} />
              {n.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}