import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo, Wordmark } from '@/components/Brand';

const LINKS = [
  ['Funcionalidades', '#funcionalidades'],
  ['Como funciona', '#como-funciona'],
  ['Planos', '#planos'],
  ['FAQ', '#faq'],
];

export default function LandingHeader({ startTo }) {
  return (
    <header className="relative z-40 border-b border-primary/15 bg-landing-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo className="h-9" />
          <Wordmark size="sm" />
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-foreground/70 lg:flex">
          {LINKS.map(([label, href]) => (
            <a key={label} href={href} className="transition hover:text-foreground">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/entrar"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-primary/30 px-3 py-2 text-xs text-foreground/85 transition hover:border-primary/50 hover:text-landing-link sm:text-sm"
          >
            Entrar
          </Link>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              to={startTo}
              className="landing-primary inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold text-primary-foreground sm:text-sm"
            >
              Começar grátis
            </Link>
          </motion.div>
        </div>
      </div>
    </header>
  );
}