import { Link } from 'react-router-dom';
import { Logo } from '@/components/Brand';

const NAV = ['Produto', 'Soluções', 'Preços', 'Recursos', 'Empresa'];

export default function Header({ startTo }) {
  return (
    <header className="relative z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo className="h-9" />
          <span className="font-display text-lg font-extrabold tracking-tight">
            CUSTO <span className="text-primary">REAL</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <a
              key={n}
              href="#recursos"
              className="text-sm text-white/70 transition hover:text-white"
            >
              {n}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            to="/login"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
          >
            Login
          </Link>
          <Link
            to={startTo}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-[0_0_22px_-6px_hsl(211_100%_50%/0.8)] transition hover:bg-primary/90"
          >
            Fale com vendas
          </Link>
        </div>
      </div>
    </header>
  );
}