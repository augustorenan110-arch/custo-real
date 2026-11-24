import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle, ShieldCheck } from 'lucide-react';

export default function HeroIntro({ startTo }) {
  return (
    <div className="min-w-0 text-center">
      <span className="inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-medium leading-relaxed text-landing-link">
        <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
        Agora com IA • Plataforma 100% segura
      </span>
      <h1 className="landing-hero-title font-tech mx-auto mt-7 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[60px]">
        O controle da sua empresa na palma da sua mão
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
        Gestão de Pessoas e Custos com Inteligência Artificial
      </p>
      <div className="mx-auto mt-8 grid w-full max-w-md grid-cols-2 items-stretch gap-3">
        <Link to={startTo} className="landing-primary inline-flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-3 text-sm font-bold leading-snug text-primary-foreground">
          Começar agora <ArrowRight className="hidden h-4 w-4 shrink-0 min-[380px]:block" aria-hidden="true" />
        </Link>
        <a href="#apresentacao" className="tech-card inline-flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-3 text-sm font-semibold leading-snug text-foreground">
          <PlayCircle className="hidden h-4 w-4 shrink-0 text-landing-link min-[380px]:block" aria-hidden="true" /> Ver demonstração
        </a>
      </div>
      <p className="mx-auto mt-6 max-w-md text-xs leading-6 text-muted-foreground">
        LGPD compliant • Integração em minutos • Suporte 24/7
      </p>
    </div>
  );
}