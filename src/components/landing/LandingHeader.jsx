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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08080a]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
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
            to="/login"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-foreground/85 transition hover:border-primary/50 hover:text-primary"
          >
            Entrar
          </Link>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              to={startTo}
              className="cta-blue inline-block rounded-xl px-4 py-2 text-sm font-semibold"
            >
              Começar grátis
            </Link>
          </motion.div>
        </div>
      </div>
    </header>
  );
}