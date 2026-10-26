import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { LayoutDashboard, Home, Receipt, CheckSquare, ScrollText, LogOut, Clock, CalendarClock, Users, ShieldCheck, Building2, Bot, Calculator, ScanFace, Trophy, Sparkles, Scale } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMe } from '@/hooks/useMe';
import { useCompany } from '@/hooks/useHr';
import { TRIAL_PLAN, trialEndDate, freeBloqueado, isFree, trialDaysLeft } from '@/lib/plan';
import { carregarFiscal } from '@/lib/fiscal';
import { BrandInline, BrandFooter, Initials } from '@/components/Brand';
import MoreMenu from '@/components/MoreMenu';
import PaywallModal from '@/components/PaywallModal';
import InternalBackBar from '@/components/InternalBackBar';

// Telas internas ganham o botão "voltar" (as abas principais não).
const TELAS_INTERNAS = [
  '/painel',
  '/espelho',
  '/colaboradores',
  '/despesas',
  '/aprovacoes',
  '/auditoria',
  '/empresa',
  '/assistente',
  '/calculadoras',
  '/rescisao',
  '/ranking',
  '/planos',
  '/tabelas-oficiais',
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
    isActive
      ? 'bg-primary/15 text-primary font-medium'
      : 'text-foreground/70 hover:bg-white/5 hover:text-foreground'
  }`;

export default function AppShell() {
  const { data: me } = useMe();
  const { data: company } = useCompany();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const isAdmin = me?.role === 'admin';

  // Tabelas oficiais (INSS, FGTS, IRRF, patronal) — carregadas uma vez por sessão.
  useEffect(() => {
    carregarFiscal().catch(() => {});
  }, []);

  // Primeiro acesso (e-mail ou Google): abre 7 dias de teste grátis (3 funcionários).
  useEffect(() => {
    if (!isAdmin || company === undefined || company?.plano_atual) return;
    const hoje = new Date().toISOString().slice(0, 10);
    const trial = {
      plano_atual: TRIAL_PLAN.plan,
      status_assinatura: 'trialing',
      trial_ends_at: trialEndDate(),
      data_cadastro: hoje,
      limite_funcionarios: TRIAL_PLAN.limite,
    };
    const run = company?.id
      ? base44.entities.Company.update(company.id, trial)
      : base44.entities.Company.create({ name: me?.full_name || 'Minha empresa', ...trial });
    run.then(() => queryClient.invalidateQueries({ queryKey: ['company'] })).catch(() => {});
  }, [isAdmin, company, me?.full_name, queryClient]);

  // Tabela users: completa tipo_conta / plano / data_cadastro / limite_funcionarios.
  useEffect(() => {
    if (!me?.id || me?.tipo_conta || company === undefined) return;
    const gratis = !company || isFree(company);
    base44.auth
      .updateMe({
        tipo_conta: 'empresa',
        plano: gratis ? 'gratis_7dias' : 'pago_59',
        data_cadastro: me?.data_cadastro || new Date().toISOString().slice(0, 10),
        ...(gratis ? { limite_funcionarios: TRIAL_PLAN.limite } : {}),
      })
      .catch(() => {});
  }, [me?.id, me?.tipo_conta, me?.data_cadastro, company]);
  const contador = !!me?.is_accountant || me?.tipo_conta === 'escritorio';
  // Teste grátis vencido: o dono só sai do paywall assinando o plano completo.
  const bloqueioTotal = isAdmin && !contador && freeBloqueado(company);
  const name = me?.full_name || me?.email || '';

  const nav = [
    { to: '/p', label: 'Início', icon: Home },
    { to: '/painel', label: 'Painel', icon: LayoutDashboard },
    { to: '/ponto', label: 'Ponto', icon: Clock },
    { to: '/espelho', label: 'Espelho de Ponto', icon: CalendarClock },
    { to: '/despesas', label: 'Despesas', icon: Receipt },
    ...(isAdmin ? [{ to: '/aprovacoes', label: 'Aprovações', icon: CheckSquare }] : []),
    { to: '/politica', label: 'Política', icon: ScrollText },
  ];
  const adminNav = isAdmin
    ? [
        { to: '/colaboradores', label: 'Colaboradores', icon: Users },
        { to: '/auditoria', label: 'Auditoria', icon: ShieldCheck },
        { to: '/assistente', label: 'Assistente IA', icon: Bot },
        { to: '/calculadoras', label: 'Calculadoras', icon: Calculator },
        { to: '/tabelas-oficiais', label: 'Tabelas Oficiais', icon: Scale },
        { to: '/empresa', label: 'Empresa', icon: Building2 },
      ]
    : [];
  const planoLabel =
    company?.status_assinatura === 'trialing' || company?.plano_atual === 'trial_premium'
      ? 'PREMIUM - 7 dias'
      : company?.plano_atual === 'starter'
        ? 'STARTER'
        : 'PREMIUM';
  const extrasNav = [
    { to: '/ranking', label: 'Ranking Custo Real', icon: Trophy },
    { to: '/rescisao', label: 'Simular Rescisão', icon: Calculator },
    { to: '/relatorio-contador', label: 'Relatório Contador', icon: ScrollText },
    { to: '/planos', label: `Meu Plano (${planoLabel})`, icon: Sparkles },
  ];
  const mobileNav = [
    { to: '/p', label: 'Início', icon: Home },
    { to: '/ponto', label: 'Ponto', icon: ScanFace },
    { to: '/espelho', label: 'Espelho', icon: CalendarClock },
    { to: '/despesas', label: 'Despesas', icon: Receipt },
  ];
  // Menu "Mais" do celular — pedido pelo cliente: sem Política.
  const moreItems = [
    { to: '/colaboradores', label: 'Meus Funcionários', icon: Users },
    { to: '/ranking', label: 'Ranking Custo Real', icon: Trophy },
    { to: '/rescisao', label: 'Simular Rescisão', icon: Calculator },
    { to: '/relatorio-contador', label: 'Relatório Contador', icon: ScrollText },
    { to: '/ponto', label: 'Ponto Facial', icon: ScanFace },
    { to: '/planos', label: `Meu Plano (${planoLabel})`, icon: Sparkles },
  ];

  const signOut = () => base44.auth.logout('/login');

  return (
    <div className="min-h-screen lg:flex">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-sidebar/80 p-5 backdrop-blur-xl lg:flex">
        <BrandInline />
        <nav className="mt-8 flex-1 space-y-1 overflow-y-auto pr-1">
          {[...nav, ...adminNav, ...extrasNav].map((n) => (
            <NavLink key={n.to} to={n.to} className={linkClass}>
              <n.icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
              {n.label}
            </NavLink>
          ))}
          <button
            onClick={signOut}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-destructive"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.7} /> Sair
          </button>
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
          {TELAS_INTERNAS.includes(pathname) && (
            <div className="sticky top-[60px] z-20 -mx-4 mb-4 bg-background/90 px-4 py-2 backdrop-blur lg:top-0">
              <InternalBackBar label="Voltar para o início" />
            </div>
          )}
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-t border-primary/20 bg-sidebar/95 shadow-[0_-12px_40px_-12px_hsl(217_91%_60%/0.35)] backdrop-blur-xl lg:hidden">
        <div className="safe-bottom mx-auto flex max-w-2xl items-stretch justify-around px-2 pt-1.5">
          {mobileNav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] transition ${
                  isActive ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground'
                }`
              }
            >
              <n.icon className="h-[22px] w-[22px]" strokeWidth={1.7} />
              {n.label}
            </NavLink>
          ))}
          <MoreMenu items={moreItems} />
        </div>
      </nav>

      {bloqueioTotal && (
        <PaywallModal
          open
          blocking
          companyId={company?.id}
          email={me?.email}
          daysLeft={trialDaysLeft(company)}
          onClose={() => {}}
          onVerificar={() => queryClient.invalidateQueries({ queryKey: ['company'] })}
        />
      )}
    </div>
  );
}