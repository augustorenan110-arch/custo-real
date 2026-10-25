import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import StoreButtons from '@/components/StoreButtons';
import { custoDemissao, CAMPANHA } from '@/lib/campanha';
import { brl } from '@/lib/format';

export default function Indicacao() {
  const { code } = useParams();
  const passivo = custoDemissao(CAMPANHA.salario, CAMPANHA.meses);

  return (
    <div className="tech-shell min-h-screen">
      <div className="tech-grid mx-auto max-w-xl px-5 py-12 sm:px-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Indicação do contador {code}
        </p>
        <h1 className="mt-3 font-tech text-2xl font-extrabold leading-tight sm:text-3xl">
          Seu contador já sabe quanto custa o seu time
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground/75">
          Um funcionário de {brl(CAMPANHA.salario)} com 8 meses de casa custa {brl(passivo.total)} para demitir hoje.
          Veja o custo real de cada funcionário em 30 segundos - 7 dias grátis no PREMIUM.
        </p>
        <Link
          to="/register"
          className="cta-green glow mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold"
        >
          Ver meu custo real agora <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Sem cartão, cancela em 1 clique.
        </p>
      </div>
      <StoreButtons />
    </div>
  );
}