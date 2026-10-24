import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Scale, Mail, ArrowRight } from 'lucide-react';
import { Logo, Wordmark } from '@/components/Brand';
import StoreButtons from '@/components/StoreButtons';

export default function LandingFooter({ startTo }) {
  return (
    <footer className="mt-4 border-t border-white/10">
      <section className="relative overflow-hidden bg-[#2563eb] px-5 py-16 sm:px-8">
        <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="font-tech text-2xl font-extrabold text-white sm:text-4xl">
            Pare de descobrir o preço só na hora de pagar
          </h2>
          <p className="mt-3 text-sm text-white/85">
            Veja o custo real de cada funcionário hoje — e o valor exato de cada demissão antes que ela aconteça.
          </p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="mt-7 inline-block">
            <Link
              to={startTo}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 text-sm font-bold text-[#08080a] shadow-lg"
            >
              Ver custo real dos meus funcionários — grátis por 7 dias
              <motion.span
                className="inline-flex"
                animate={{ x: [0, 6, 0], opacity: [0.65, 1, 0.65] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowRight className="h-4 w-4" />
              </motion.span>
            </Link>
          </motion.div>
          <p className="mt-3 text-[11px] text-white/75">Sem cartão, cancela em 1 clique</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo className="h-9" />
              <Wordmark size="sm" />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Ponto facial com prova de vida e custo real do time: FGTS, 13º, férias, multa de 40% e simulação de
              demissão conforme a CLT.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/80">Produto</p>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li><a href="#funcionalidades" className="transition hover:text-foreground">Funcionalidades</a></li>
              <li><a href="#como-funciona" className="transition hover:text-foreground">Como funciona</a></li>
              <li><Link to="/planos" className="transition hover:text-foreground">Planos e preços</Link></li>
              <li><Link to="/login" className="transition hover:text-foreground">Entrar</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/80">Legal</p>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li><Link to="/privacidade" className="transition hover:text-foreground">Política de Privacidade</Link></li>
              <li><Link to="/termos" className="transition hover:text-foreground">Termos de Uso</Link></li>
              <li><Link to="/excluir-dados" className="transition hover:text-foreground">Excluir meus dados</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/80">Contato</p>
            <a
              href="mailto:dpo@custo-real.com.br"
              className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground transition hover:text-foreground"
            >
              <Mail className="h-3.5 w-3.5" /> dpo@custo-real.com.br
            </a>
            <p className="mt-3 text-xs text-muted-foreground">CNPJ 00.000.000/0001-00</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-2.5 py-1 text-[10px] text-foreground/70">
                <ShieldCheck className="h-3 w-3 text-save-tech" /> Conforme LGPD
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-2.5 py-1 text-[10px] text-foreground/70">
                <Scale className="h-3 w-3 text-primary" /> Registro CLT art. 74 · Portaria 671
              </span>
            </div>
          </div>
        </div>

        <StoreButtons />

        <p className="mt-2 border-t border-white/10 pt-5 text-center text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} Custo Real · custo-real.com · Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}