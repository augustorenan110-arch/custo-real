import { useState } from 'react';
import {
  LayoutDashboard, Building2, CreditCard, Users, DollarSign,
  Settings, LogOut, Menu, X, ShieldCheck,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMe } from '@/hooks/useMe';
import { BrandInline, Initials, Logo } from '@/components/Brand';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminEmpresas from '@/components/admin/AdminEmpresas';
import AdminPlanos from '@/components/admin/AdminPlanos';
import AdminUsuarios from '@/components/admin/AdminUsuarios';
import AdminFinanceiro from '@/components/admin/AdminFinanceiro';
import AdminConfiguracoes from '@/components/admin/AdminConfiguracoes';

const SECTIONS = [
  { id: 'visao', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'empresas', label: 'Empresas', icon: Building2 },
  { id: 'planos', label: 'Planos', icon: CreditCard },
  { id: 'usuarios', label: 'Usuários', icon: Users },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'config', label: 'Configurações', icon: Settings },
];

export default function AdminPanel() {
  const [section, setSection] = useState('visao');
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: me } = useMe();
  const name = me?.full_name || me?.email || 'Admin';
  const signOut = () => base44.auth.logout('/login');

  const go = (id) => {
    setSection(id);
    setMenuOpen(false);
  };

  const nav = (
    <nav className="space-y-1">
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          onClick={() => go(s.id)}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
            section === s.id
              ? 'bg-primary/15 font-medium text-primary'
              : 'text-foreground/70 hover:bg-white/5 hover:text-foreground'
          }`}
        >
          <s.icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
          {s.label}
        </button>
      ))}
    </nav>
  );

  const render = () => {
    switch (section) {
      case 'empresas': return <AdminEmpresas />;
      case 'planos': return <AdminPlanos />;
      case 'usuarios': return <AdminUsuarios />;
      case 'financeiro': return <AdminFinanceiro />;
      case 'config': return <AdminConfiguracoes />;
      default: return <AdminOverview />;
    }
  };

  const activeLabel = SECTIONS.find((s) => s.id === section)?.label || '';
  const signOutBtn = (extra) => (
    <button
      onClick={signOut}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-destructive ${extra || ''}`}
    >
      <LogOut className="h-[18px] w-[18px]" strokeWidth={1.7} /> Sair
    </button>
  );

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-sidebar/80 p-5 backdrop-blur-xl lg:flex">
        <BrandInline />
        <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
          <ShieldCheck className="h-3.5 w-3.5" /> Painel Admin
        </div>
        <div className="mt-8 flex-1 overflow-y-auto pr-1">{nav}</div>
        {signOutBtn('mt-2')}
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <Initials name={name} className="h-9 w-9 text-xs" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{name}</div>
            <div className="text-[11px] text-muted-foreground">ADMIN_MASTER</div>
          </div>
        </div>
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-white/10 bg-sidebar p-5">
            <div className="flex items-center justify-between">
              <BrandInline />
              <button onClick={() => setMenuOpen(false)} className="rounded-lg p-2 text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Painel Admin
            </div>
            <div className="mt-8 flex-1 overflow-y-auto pr-1">{nav}</div>
            {signOutBtn('mt-2')}
          </aside>
        </div>
      )}

      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <button onClick={() => setMenuOpen(true)} className="rounded-lg p-2 text-foreground lg:hidden">
                <Menu className="h-5 w-5" />
              </button>
              <Logo className="h-8" />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="flex shrink-0 items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                <ShieldCheck className="h-3 w-3" /> Admin
              </span>
              <h1 className="hidden truncate text-base font-semibold lg:block">{activeLabel}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Initials name={name} className="h-9 w-9 text-[11px]" />
              <button onClick={signOut} aria-label="Sair" className="rounded-lg p-2 text-muted-foreground transition hover:text-destructive">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 pb-28 pt-5 sm:px-6 lg:pb-12 lg:pt-8">
          {render()}
        </main>
      </div>
    </div>
  );
}