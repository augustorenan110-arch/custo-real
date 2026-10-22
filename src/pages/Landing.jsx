import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Calculator, BrainCircuit, Workflow, BarChart3, Camera, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Logo, Wordmark, BrandFooter } from '@/components/Brand';

const features = [
  { icon: Calculator, title: 'Custo Real', desc: 'Cada despesa somada de verdade, sem planilha paralela.' },
  { icon: BrainCircuit, title: 'RH Inteligente', desc: 'A IA lê o recibo e confere contra a política da empresa.' },
  { icon: Workflow, title: 'Automação', desc: 'Do recibo à aprovação do RH, sem e-mail perdido.' },
  { icon: BarChart3, title: 'Tempo Real', desc: 'Painel com pendências, alertas e gasto por categoria.' },
];

const steps = [
  { icon: Camera, title: 'Fotografe o recibo', desc: 'A IA preenche valor, data e estabelecimento.' },
  { icon: ShieldCheck, title: 'Conferência automática', desc: 'Cada despesa é checada contra as regras da empresa.' },
  { icon: CheckCircle2, title: 'Aprovação em um toque', desc: 'O RH aprova ou rejeita com comentário.' },
];

export default function Landing() {
  const [email, setEmail] = useState(null);

  useEffect(() => {
    base44.auth
      .me()
      .then((u) => setEmail(u?.email ?? null))
      .catch(() => setEmail(null));
  }, []);

  const startTo = email ? '/painel' : '/login';

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 pt-6 sm:px-8">
        <div className="flex items-center gap-2.5">
          <Logo className="h-10" />
          <Wordmark size="sm" />
        </div>
        <Link
          to={startTo}
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-foreground/90 transition hover:border-primary/60 hover:text-primary"
        >
          {email ? 'Abrir painel' : 'Entrar'}
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-5 sm:px-8">
        <section className="grid items-center gap-12 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24">
          <div className="rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <BrainCircuit className="h-3.5 w-3.5" /> IA para despesas corporativas
            </span>
            <h1 className="mt-6 text-3xl font-bold leading-[1.1] sm:text-5xl">
              Gestão de Pessoas e Custos <span className="text-gradient">com Inteligência Artificial</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/70 sm:text-lg">
              Mais controle, eficiência e decisões estratégicas para o seu negócio. O colaborador fotografa o
              recibo, a IA confere a política e o RH aprova — tudo em um só lugar.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to={email ? '/painel' : '/register'}
                className="glow inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
              >
                {email ? 'Abrir o painel' : 'Criar conta'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={email ? '/despesas' : '/login'}
                className="glass inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold transition hover:border-primary/40"
              >
                {email ? 'Enviar despesa' : 'Já tenho conta'}
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-full bg-primary/10 blur-3xl" />
            <div className="glass relative rounded-3xl p-5 rise" style={{ animationDelay: '120ms' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Recibo lido pela IA</span>
                <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
                  Dentro da política
                </span>
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-3xl font-semibold tracking-tight">R$ 78,50</p>
                <p className="text-sm text-foreground/70">Restaurante Vila Nova · Refeição</p>
                <p className="text-xs text-muted-foreground">12/10/2026 · limite de refeição R$ 80,00</p>
              </div>
              <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                {[
                  ['Recibo legível e dentro do prazo', true],
                  ['Categoria permitida pela empresa', true],
                  ['Bebida alcoólica identificada', false],
                ].map(([label, ok]) => (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className={`h-4 w-4 ${ok ? 'text-success' : 'text-muted-foreground/50'}`} />
                    <span className="text-foreground/75">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 pb-14 lg:grid-cols-4 lg:gap-4">
          {features.map((f, i) => (
            <div key={f.title} className="glass rounded-2xl p-4 rise" style={{ animationDelay: `${i * 70}ms` }}>
              <f.icon className="h-6 w-6 text-primary" strokeWidth={1.6} />
              <h3 className="mt-3 text-sm font-semibold">{f.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="pb-16">
          <h2 className="text-center text-xl font-semibold sm:text-2xl">Como funciona</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="glass rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary">
                    <s.icon className="h-4 w-4" strokeWidth={1.7} />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Passo {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-semibold">{s.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-6 sm:flex-row sm:px-8">
          <BrandFooter />
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <Link to="/privacidade" className="transition hover:text-foreground">
              Política de privacidade
            </Link>
            <span>© {new Date().getFullYear()} Custo Real</span>
          </div>
        </div>
      </footer>
    </div>
  );
}